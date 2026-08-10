import { supabase, isConfigured } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { SEED_PRODUCTS } from './productController.js';
import crypto from 'crypto';

// In-memory store fallback for development testing when DB is not connected
export const inMemoryOrders = new Map();
export const inMemoryCustomers = new Map();
export const inMemoryOrderItems = new Map();

/**
 * Generate Unique Order Number
 * Format: ARM-YYYYMMDD-XXXX
 */
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `ARM-${dateStr}-${randomSuffix}`;
};

/**
 * POST /api/orders
 * Create new order
 */
export const createOrder = async (req, res, next) => {
  try {
    const { customer, items } = req.body;

    // 1. Collect all product IDs requested
    const productIds = items.map((i) => i.product_id);

    // 2. Fetch official product prices from database (NEVER trust prices from frontend)
    let dbProducts = [];

    if (isConfigured) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds)
        .eq('is_active', true);

      if (!error && data && data.length > 0) {
        dbProducts = data;
      } else {
        // Use seed product list if table is unseeded
        dbProducts = SEED_PRODUCTS.filter((p) => productIds.includes(p.id));
      }
    } else {
      dbProducts = SEED_PRODUCTS.filter((p) => productIds.includes(p.id));
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Check if all requested items exist
    const missingItems = items.filter((item) => !productMap.has(item.product_id));
    if (missingItems.length > 0) {
      return errorResponse(
        res,
        `Satu atau lebih produk tidak ditemukan atau tidak aktif: ${missingItems.map((m) => m.product_id).join(', ')}`,
        'INVALID_PRODUCTS',
        400
      );
    }

    // 3. Calculate subtotals and total_amount on backend
    let totalAmount = 0;
    const processedItems = items.map((item) => {
      const product = productMap.get(item.product_id);
      const unitPrice = product.price; // Official integer price in Rupiah
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      return {
        product_id: product.id,
        product_name: product.name,
        price: unitPrice,
        quantity: item.quantity,
        subtotal,
      };
    });

    const orderNumber = generateOrderNumber();
    const orderId = crypto.randomUUID();
    const customerId = crypto.randomUUID();
    const now = new Date().toISOString();

    // 4. Save to Supabase DB or In-Memory
    if (isConfigured) {
      // 4a. Create / Insert customer
      const { data: customerData, error: customerErr } = await supabase
        .from('customers')
        .insert({
          id: customerId,
          name: customer.name.trim(),
          whatsapp: customer.whatsapp.trim(),
          created_at: now,
        })
        .select()
        .single();

      if (customerErr) {
        console.error('Error inserting customer to Supabase:', customerErr);
      }

      const activeCustomerId = customerData?.id || customerId;

      // 4b. Insert order
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          order_number: orderNumber,
          customer_id: activeCustomerId,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'unpaid',
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (orderErr) {
        console.error('Error inserting order to Supabase:', orderErr);
        throw new Error('Gagal menyimpan pesanan ke database: ' + orderErr.message);
      }

      // 4c. Insert order items
      const orderItemsToInsert = processedItems.map((item) => ({
        id: crypto.randomUUID(),
        order_id: orderId,
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }));

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsErr) {
        console.error('Error inserting order_items to Supabase:', itemsErr);
      }

      return successResponse(
        res,
        'Pesanan berhasil dibuat',
        {
          order_id: orderData ? orderData.id : orderId,
          order_number: orderNumber,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'unpaid',
          customer: {
            name: customer.name,
            whatsapp: customer.whatsapp,
          },
          items: processedItems,
        },
        201
      );
    } else {
      // Fallback in-memory persistence
      const newCustomer = {
        id: customerId,
        name: customer.name.trim(),
        whatsapp: customer.whatsapp.trim(),
        created_at: now,
      };
      inMemoryCustomers.set(customerId, newCustomer);

      const newOrder = {
        id: orderId,
        order_number: orderNumber,
        customer_id: customerId,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'unpaid',
        created_at: now,
        updated_at: now,
      };
      inMemoryOrders.set(orderNumber, newOrder);
      inMemoryOrders.set(orderId, newOrder);

      const itemsList = processedItems.map((item) => ({
        id: crypto.randomUUID(),
        order_id: orderId,
        ...item,
      }));
      inMemoryOrderItems.set(orderId, itemsList);

      return successResponse(
        res,
        'Pesanan berhasil dibuat',
        {
          order_id: orderId,
          order_number: orderNumber,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'unpaid',
          customer: {
            name: customer.name,
            whatsapp: customer.whatsapp,
          },
          items: processedItems,
        },
        201
      );
    }
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/:orderNumber
 * Get order details by order number
 */
export const getOrderByNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    if (!orderNumber) {
      return errorResponse(res, 'Order number wajib diisi', 'MISSING_ORDER_NUMBER', 400);
    }

    if (isConfigured) {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .select(`
          *,
          customers (*),
          order_items (*),
          payments (*)
        `)
        .eq('order_number', orderNumber)
        .single();

      if (orderErr || !order) {
        // Fallback check in memory
        const memoryOrder = inMemoryOrders.get(orderNumber);
        if (memoryOrder) {
          const customer = inMemoryCustomers.get(memoryOrder.customer_id);
          const items = inMemoryOrderItems.get(memoryOrder.id) || [];
          return successResponse(res, 'Detail pesanan ditemukan', {
            ...memoryOrder,
            customer,
            items,
          });
        }

        return errorResponse(res, 'Pesanan tidak ditemukan', 'ORDER_NOT_FOUND', 404);
      }

      return successResponse(res, 'Detail pesanan ditemukan', order);
    } else {
      const memoryOrder = inMemoryOrders.get(orderNumber);
      if (!memoryOrder) {
        return errorResponse(res, 'Pesanan tidak ditemukan', 'ORDER_NOT_FOUND', 404);
      }

      const customer = inMemoryCustomers.get(memoryOrder.customer_id);
      const items = inMemoryOrderItems.get(memoryOrder.id) || [];

      return successResponse(res, 'Detail pesanan ditemukan', {
        ...memoryOrder,
        customer,
        items,
      });
    }
  } catch (err) {
    next(err);
  }
};
