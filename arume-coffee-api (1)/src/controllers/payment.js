import { getSupabaseClient, memoryStore } from '../config/supabase.js';
import { PaymentService } from '../config/payment.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * POST /api/payment/create
 * Initialize payment for an order
 */
export const createPayment = async (c) => {
  try {
    const body = await c.req.json();
    const orderNumber = body.orderNumber || body.order_number;

    if (!orderNumber) {
      return errorResponse(c, 'Nomor pesanan (orderNumber) wajib diisi', null, 400);
    }

    let order = null;
    const supabase = getSupabaseClient(c.env);

    if (supabase) {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('order_number', orderNumber)
        .single();
      if (data) order = data;
    }

    if (!order) {
      order = memoryStore.orders.get(orderNumber);
    }

    if (!order) {
      return errorResponse(c, `Pesanan dengan nomor ${orderNumber} tidak ditemukan`, null, 404);
    }

    const paymentService = new PaymentService(c.env);
    const paymentData = await paymentService.createTransaction({
      orderNumber: order.order_number,
      amount: order.total_amount,
      customer: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
      },
      items: order.order_items || order.items || [],
    });

    const now = new Date().toISOString();
    const paymentRecord = {
      order_number: order.order_number,
      amount: order.total_amount,
      payment_method: paymentData.payment_type,
      status: 'PENDING',
      snap_token: paymentData.token,
      redirect_url: paymentData.redirect_url,
      created_at: now,
      updated_at: now,
    };

    if (supabase) {
      try {
        await supabase.from('payments').insert({
          order_id: order.id,
          order_number: order.order_number,
          amount: order.total_amount,
          status: 'PENDING',
          payment_type: paymentData.payment_type,
          snap_token: paymentData.token,
          redirect_url: paymentData.redirect_url,
        });
      } catch (err) {
        console.warn('Payment record insert warning:', err.message);
      }
    }

    memoryStore.payments.set(order.order_number, paymentRecord);

    return successResponse(c, 'Transaksi pembayaran berhasil dibuat', {
      order_number: order.order_number,
      amount: order.total_amount,
      payment_type: paymentData.payment_type,
      token: paymentData.token,
      redirect_url: paymentData.redirect_url,
      is_mock: paymentData.is_mock,
      message: paymentData.message,
    });
  } catch (err) {
    return errorResponse(c, 'Gagal membuat pembayaran', err.message, 500);
  }
};

/**
 * POST /api/payment/callback
 * Payment Gateway webhook callback handler with Idempotency
 */
export const handlePaymentCallback = async (c) => {
  try {
    const body = await c.req.json();
    const orderNumber = body.order_id || body.orderNumber || body.order_number;
    const transactionStatus = body.transaction_status || body.status || 'settlement';

    if (!orderNumber) {
      return errorResponse(c, 'Invalid callback payload: order_id is required', null, 400);
    }

    const supabase = getSupabaseClient(c.env);

    // IDEMPOTENCY CHECK: Check if order is already marked as paid
    let currentPaymentStatus = null;

    if (supabase) {
      const { data } = await supabase
        .from('orders')
        .select('payment_status')
        .eq('order_number', orderNumber)
        .single();
      if (data) currentPaymentStatus = data.payment_status;
    }

    if (!currentPaymentStatus && memoryStore.orders.has(orderNumber)) {
      currentPaymentStatus = memoryStore.orders.get(orderNumber).payment_status;
    }

    if (currentPaymentStatus === 'paid') {
      return successResponse(c, 'Callback already processed (Idempotency verified)', {
        order_number: orderNumber,
        status: 'PAID',
        idempotent: true,
      });
    }

    // Determine target order & payment status
    const isSuccess = ['settlement', 'capture', 'success', 'paid', 'completed'].includes(
      String(transactionStatus).toLowerCase()
    );

    const newPaymentStatus = isSuccess ? 'paid' : 'failed';
    const newOrderStatus = isSuccess ? 'processing' : 'cancelled';
    const now = new Date().toISOString();

    if (supabase) {
      try {
        await supabase
          .from('orders')
          .update({
            payment_status: newPaymentStatus,
            status: newOrderStatus,
            updated_at: now,
          })
          .eq('order_number', orderNumber);

        await supabase
          .from('payments')
          .update({
            status: isSuccess ? 'SUCCESS' : 'FAILED',
            updated_at: now,
          })
          .eq('order_number', orderNumber);
      } catch (err) {
        console.warn('Callback Supabase update error:', err.message);
      }
    }

    // Update memory store as well
    if (memoryStore.orders.has(orderNumber)) {
      const ord = memoryStore.orders.get(orderNumber);
      ord.payment_status = newPaymentStatus;
      ord.status = newOrderStatus;
      ord.updated_at = now;
      memoryStore.orders.set(orderNumber, ord);
    }

    if (memoryStore.payments.has(orderNumber)) {
      const pay = memoryStore.payments.get(orderNumber);
      pay.status = isSuccess ? 'SUCCESS' : 'FAILED';
      pay.updated_at = now;
      memoryStore.payments.set(orderNumber, pay);
    }

    return successResponse(c, `Status pembayaran berhasil diperbarui menjadi ${newPaymentStatus.toUpperCase()}`, {
      order_number: orderNumber,
      payment_status: newPaymentStatus,
      order_status: newOrderStatus,
    });
  } catch (err) {
    return errorResponse(c, 'Gagal memproses callback pembayaran', err.message, 500);
  }
};

/**
 * POST /api/payment/check
 * Check payment status for an order
 */
export const checkPaymentStatus = async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const orderNumber = body.orderNumber || body.order_number || c.req.query('orderNumber');

    if (!orderNumber) {
      return errorResponse(c, 'orderNumber wajib diberikan', null, 400);
    }

    const supabase = getSupabaseClient(c.env);
    let orderInfo = null;

    if (supabase) {
      const { data } = await supabase
        .from('orders')
        .select('order_number, total_amount, status, payment_status, created_at')
        .eq('order_number', orderNumber)
        .single();
      if (data) orderInfo = data;
    }

    if (!orderInfo && memoryStore.orders.has(orderNumber)) {
      orderInfo = memoryStore.orders.get(orderNumber);
    }

    if (!orderInfo) {
      return errorResponse(c, `Pesanan dengan nomor ${orderNumber} tidak ditemukan`, null, 404);
    }

    const paymentInfo = memoryStore.payments.get(orderNumber) || {};

    return successResponse(c, 'Berhasil memeriksa status pembayaran', {
      order_number: orderInfo.order_number,
      total_amount: orderInfo.total_amount,
      order_status: orderInfo.status,
      payment_status: orderInfo.payment_status,
      snap_token: paymentInfo.snap_token || null,
      redirect_url: paymentInfo.redirect_url || null,
      updated_at: orderInfo.updated_at || orderInfo.created_at,
    });
  } catch (err) {
    return errorResponse(c, 'Gagal memeriksa status pembayaran', err.message, 500);
  }
};
