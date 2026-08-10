import { getSupabaseClient, SEED_PRODUCTS, memoryStore } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Helper to fetch product catalog map (Database or Seed)
 */
async function getCatalogMap(env) {
  const catalog = new Map();
  // Populate seed items first
  SEED_PRODUCTS.forEach((p) => catalog.set(p.id, p));

  const supabase = getSupabaseClient(env);
  if (supabase) {
    try {
      const { data } = await supabase.from('products').select('*');
      if (data && data.length > 0) {
        data.forEach((p) => catalog.set(p.id, p));
      }
    } catch (e) {
      console.warn('Failed to load database catalog, using seed:', e.message);
    }
  }
  return catalog;
}

/**
 * Generate Unique Order Number
 */
function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ARUME-${dateStr}-${randomSuffix}`;
}

/**
 * POST /api/orders
 * Create new order with strict server-side price validation
 */
export const createOrder = async (c) => {
  try {
    const body = await c.req.json();
    const { customer, items, notes } = body;

    // 1. Validation
    if (!customer || !customer.name || !customer.phone) {
      return errorResponse(c, 'Data pelanggan tidak lengkap (Nama dan No. WhatsApp wajib diisi)', null, 400);
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(c, 'Pesanan harus berisi minimal 1 produk', null, 400);
    }

    // 2. Fetch official catalog for price validation
    const catalog = await getCatalogMap(c.env);

    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const productId = item.product_id || item.id;
      const quantity = parseInt(item.quantity, 10) || 1;

      if (quantity <= 0) {
        return errorResponse(c, 'Jumlah produk harus lebih dari 0', null, 400);
      }

      const product = catalog.get(productId);
      if (!product) {
        return errorResponse(c, `Produk dengan ID ${productId} tidak ditemukan di katalog`, null, 400);
      }

      // CRITICAL SECURITY REQUIREMENT: Validate price from backend catalog, ignore frontend input price
      const unitPrice = Number(product.price);
      const subtotal = unitPrice * quantity;
      calculatedTotal += subtotal;

      validatedItems.push({
        product_id: product.id,
        name: product.name,
        price: unitPrice,
        quantity: quantity,
        subtotal: subtotal,
      });
    }

    const orderNumber = generateOrderNumber();
    const now = new Date().toISOString();

    const newOrder = {
      order_number: orderNumber,
      customer_name: customer.name,
      customer_email: customer.email || '',
      customer_phone: customer.phone,
      total_amount: calculatedTotal,
      notes: notes || '',
      status: 'pending_payment',
      payment_status: 'unpaid',
      created_at: now,
      updated_at: now,
      items: validatedItems,
    };

    const supabase = getSupabaseClient(c.env);

    if (supabase) {
      try {
        // Save/Upsert customer
        const { data: customerData } = await supabase
          .from('customers')
          .upsert({ name: customer.name, email: customer.email, phone: customer.phone }, { onConflict: 'phone' })
          .select()
          .single();

        const customerId = customerData ? customerData.id : null;

        // Save order
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            customer_id: customerId,
            customer_name: customer.name,
            customer_phone: customer.phone,
            customer_email: customer.email,
            total_amount: calculatedTotal,
            notes: notes || '',
            status: 'pending_payment',
            payment_status: 'unpaid',
          })
          .select()
          .single();

        if (!orderErr && orderData) {
          // Save order items
          const orderItemsToInsert = validatedItems.map((vi) => ({
            order_id: orderData.id,
            product_id: vi.product_id,
            product_name: vi.name,
            unit_price: vi.price,
            quantity: vi.quantity,
            subtotal: vi.subtotal,
          }));

          await supabase.from('order_items').insert(orderItemsToInsert);

          return successResponse(c, 'Pesanan berhasil dibuat', {
            id: orderData.id,
            ...newOrder,
          }, 201);
        }
      } catch (err) {
        console.warn('Supabase order insert warning, storing in memory cache:', err.message);
      }
    }

    // Fallback: Store in transient memory
    memoryStore.orders.set(orderNumber, newOrder);

    return successResponse(
      c,
      'Pesanan berhasil dibuat',
      {
        id: `mem-${Date.now()}`,
        ...newOrder,
      },
      201
    );
  } catch (err) {
    return errorResponse(c, 'Gagal membuat pesanan', err.message, 500);
  }
};

/**
 * GET /api/orders/:orderNumber
 * Get order status and detail by order number
 */
export const getOrderByNumber = async (c) => {
  try {
    const orderNumber = c.req.param('orderNumber');
    const supabase = getSupabaseClient(c.env);

    if (supabase) {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('order_number', orderNumber)
        .single();

      if (!error && order) {
        return successResponse(c, 'Berhasil mengambil data pesanan', {
          order_number: order.order_number,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_email: order.customer_email,
          total_amount: order.total_amount,
          status: order.status,
          payment_status: order.payment_status,
          notes: order.notes,
          created_at: order.created_at,
          items: order.order_items || [],
        });
      }
    }

    // Fallback check memory
    const memoryOrder = memoryStore.orders.get(orderNumber);
    if (memoryOrder) {
      return successResponse(c, 'Berhasil mengambil data pesanan', memoryOrder);
    }

    return errorResponse(c, 'Pesanan tidak ditemukan', null, 404);
  } catch (err) {
    return errorResponse(c, 'Gagal mengambil data pesanan', err.message, 500);
  }
};
