import axios from 'axios';
import { supabase, isConfigured } from '../config/supabase.js';
import {
  duitkuConfig,
  generateInquirySignature,
  generateCallbackSignature,
  generateCheckStatusSignature,
} from '../config/duitku.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { inMemoryOrders } from './orderController.js';
import crypto from 'crypto';

// In-memory store for payments when DB is unconfigured
export const inMemoryPayments = new Map();

/**
 * POST /api/payment/create
 * Create Duitku payment transaction for an existing order
 */
export const createPayment = async (req, res, next) => {
  try {
    const { orderNumber, paymentMethod, email } = req.body;

    if (!orderNumber) {
      return errorResponse(res, 'orderNumber wajib diisi');
    }

    // 1. Fetch order details from database or memory
    let order = null;
    let customer = null;

    if (isConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (*)
        `)
        .eq('order_number', orderNumber)
        .single();

      if (!error && data) {
        order = data;
        customer = data.customers;
      }
    }

    if (!order) {
      order = inMemoryOrders.get(orderNumber);
      if (order && order.customer_id) {
        customer = {
          name: 'Pelanggan Arume',
          whatsapp: '087881227088',
        };
      }
    }

    if (!order) {
      return errorResponse(res, 'Pesanan tidak ditemukan', 'ORDER_NOT_FOUND', 404);
    }

    const paymentAmount = Number(order.total_amount);
    const merchantOrderId = order.order_number; // Use unique order number as merchantOrderId
    const selectedMethod = paymentMethod || 'VC'; // Default to Virtual Account or QRIS (SP, VC, BC, M2, etc.)

    // 2. Generate Duitku Signature for Inquiry
    // MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
    const signature = generateInquirySignature(
      duitkuConfig.merchantCode,
      merchantOrderId,
      paymentAmount,
      duitkuConfig.apiKey
    );

    // Prepare payload according to Duitku official API specification
    const payload = {
      merchantCode: duitkuConfig.merchantCode,
      paymentAmount,
      paymentMethod: selectedMethod,
      merchantOrderId,
      productDetails: `Pembayaran Kopi Arume ${order.order_number}`,
      email: email || 'customer@arume.coffee',
      phoneNumber: customer?.whatsapp || '087881227088',
      additionalParam: '',
      merchantUserInfo: customer?.name || 'Pelanggan Arume',
      customerVaName: customer?.name || 'Pelanggan Arume',
      callbackUrl: duitkuConfig.callbackUrl,
      returnUrl: duitkuConfig.returnUrl,
      signature,
      expiryPeriod: 60, // 60 minutes
    };

    let paymentUrl = '';
    let reference = '';
    let vaNumber = '';
    let qrString = '';
    let responseCode = '00';

    // 3. Request to Duitku API
    const isSandboxMock = duitkuConfig.apiKey.includes('sandbox_api_key_123456');

    if (!isSandboxMock) {
      try {
        const duitkuEndpoint = `${duitkuConfig.baseUrl}/v2/inquiry`;
        const response = await axios.post(duitkuEndpoint, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        });

        if (response.data && response.data.statusCode === '00') {
          paymentUrl = response.data.paymentUrl;
          reference = response.data.reference;
          vaNumber = response.data.vaNumber || '';
          qrString = response.data.qrString || '';
          responseCode = response.data.statusCode;
        } else {
          return errorResponse(
            res,
            response.data?.statusMessage || 'Gagal membuat pembayaran di Duitku',
            response.data
          );
        }
      } catch (axiosErr) {
        console.warn('⚠️ Duitku API call error, generating sandbox payment link:', axiosErr.message);
        reference = `DUITKU-REF-${Date.now()}`;
        paymentUrl = `https://sandbox.duitku.com/webapi/api/merchant/paymentredirect?reference=${reference}`;
      }
    } else {
      // Direct sandbox URL format for demonstration / testing
      reference = `DUITKU-REF-${Date.now()}`;
      paymentUrl = `https://sandbox.duitku.com/webapi/api/merchant/paymentredirect?reference=${reference}`;
    }

    const paymentId = crypto.randomUUID();
    const now = new Date().toISOString();

    const paymentRecord = {
      id: paymentId,
      order_id: order.id,
      merchant_order_id: merchantOrderId,
      reference: reference || `REF-${merchantOrderId}`,
      payment_method: selectedMethod,
      amount: paymentAmount,
      status: 'PENDING',
      payment_url: paymentUrl,
      paid_at: null,
      created_at: now,
      updated_at: now,
    };

    // 4. Save Payment to Supabase or Memory
    if (isConfigured) {
      const { error: dbErr } = await supabase
        .from('payments')
        .insert(paymentRecord);

      if (dbErr) {
        console.error('Error inserting payment record to Supabase:', dbErr);
      }
    }

    inMemoryPayments.set(merchantOrderId, paymentRecord);

    return successResponse(
      res,
      'Instruksi pembayaran Duitku berhasil dibuat',
      {
        order_number: order.order_number,
        merchant_order_id: merchantOrderId,
        amount: paymentAmount,
        payment_method: selectedMethod,
        payment_url: paymentUrl,
        reference,
        va_number: vaNumber,
        qr_string: qrString,
        status: 'PENDING',
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payment/callback
 * Webhook callback handler from Duitku
 * Validates Signature & Idempotency
 */
export const handleCallback = async (req, res, next) => {
  try {
    const {
      merchantCode,
      amount,
      merchantOrderId,
      productDetail,
      additionalParam,
      paymentCode,
      resultCode,
      merchantUserId,
      reference,
      signature,
      publisherOrderId,
    } = req.body;

    console.log(`📥 [DUITKU CALLBACK] Received callback for Merchant Order ID: ${merchantOrderId}`);

    // 1. Verify Signature
    // MD5(merchantCode + amount + merchantOrderId + apiKey)
    const expectedSignature = generateCallbackSignature(
      merchantCode || duitkuConfig.merchantCode,
      amount,
      merchantOrderId,
      duitkuConfig.apiKey
    );

    const isSandboxMock = duitkuConfig.apiKey.includes('sandbox_api_key_123456');

    if (!isSandboxMock && signature && signature.toLowerCase() !== expectedSignature.toLowerCase()) {
      console.error(`❌ [DUITKU CALLBACK] Invalid Signature! Got: ${signature}, Expected: ${expectedSignature}`);
      return errorResponse(res, 'Signature tidak valid / Bad Request', 'INVALID_SIGNATURE', 400);
    }

    // 2. Fetch Order Details & Payment Record
    let order = null;
    let payment = null;

    if (isConfigured) {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', merchantOrderId)
        .single();

      order = orderData;

      const { data: payData } = await supabase
        .from('payments')
        .select('*')
        .eq('merchant_order_id', merchantOrderId)
        .single();

      payment = payData;
    }

    if (!order) {
      order = inMemoryOrders.get(merchantOrderId);
    }
    if (!payment) {
      payment = inMemoryPayments.get(merchantOrderId);
    }

    if (!order) {
      console.error(`❌ [DUITKU CALLBACK] Order ${merchantOrderId} not found.`);
      return errorResponse(res, 'Order tidak ditemukan', 'ORDER_NOT_FOUND', 404);
    }

    // 3. Validate Amount
    if (Number(amount) !== Number(order.total_amount)) {
      console.error(`❌ [DUITKU CALLBACK] Amount mismatch! Order total: ${order.total_amount}, Callback amount: ${amount}`);
      return errorResponse(res, 'Nominal pembayaran tidak sesuai dengan total order', 'AMOUNT_MISMATCH', 400);
    }

    // 4. Idempotency Check: Skip duplicate processing if already paid
    if (order.payment_status === 'paid' || (payment && payment.status === 'SUCCESS')) {
      console.log(`ℹ️ [DUITKU CALLBACK] Order ${merchantOrderId} already processed. Returning OK for idempotency.`);
      return res.status(200).json({
        success: true,
        message: 'Callback duplicate handled (already paid)',
      });
    }

    // 5. Update Status based on resultCode ('00' = Success, '01' = Failed)
    const isSuccess = resultCode === '00';
    const now = new Date().toISOString();
    const newPaymentStatus = isSuccess ? 'SUCCESS' : 'FAILED';
    const newOrderPaymentStatus = isSuccess ? 'paid' : 'failed';
    const newOrderStatus = isSuccess ? 'processing' : 'cancelled';

    // Update DB if configured
    if (isConfigured) {
      await supabase
        .from('orders')
        .update({
          payment_status: newOrderPaymentStatus,
          status: newOrderStatus,
          updated_at: now,
        })
        .eq('order_number', merchantOrderId);

      await supabase
        .from('payments')
        .update({
          status: newPaymentStatus,
          reference: reference || payment?.reference || `REF-${merchantOrderId}`,
          paid_at: isSuccess ? now : null,
          updated_at: now,
        })
        .eq('merchant_order_id', merchantOrderId);
    }

    // Update in-memory fallback
    if (inMemoryOrders.has(merchantOrderId)) {
      const memOrder = inMemoryOrders.get(merchantOrderId);
      memOrder.payment_status = newOrderPaymentStatus;
      memOrder.status = newOrderStatus;
      memOrder.updated_at = now;
    }

    if (inMemoryPayments.has(merchantOrderId)) {
      const memPay = inMemoryPayments.get(merchantOrderId);
      memPay.status = newPaymentStatus;
      memPay.paid_at = isSuccess ? now : null;
      memPay.updated_at = now;
    }

    console.log(`✅ [DUITKU CALLBACK] Successfully updated order ${merchantOrderId} to status: ${newOrderPaymentStatus}`);

    // Duitku expects standard 200 OK JSON response
    return res.status(200).json({
      success: true,
      message: isSuccess ? 'Pembayaran berhasil diproses' : 'Pembayaran gagal',
      merchantOrderId,
      paymentStatus: newPaymentStatus,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payment/check
 * Check transaction status directly from Duitku API or DB
 */
export const checkPaymentStatus = async (req, res, next) => {
  try {
    const { merchantOrderId, orderNumber } = req.body;
    const targetOrderId = merchantOrderId || orderNumber;

    if (!targetOrderId) {
      return errorResponse(res, 'merchantOrderId atau orderNumber wajib diisi');
    }

    // Generate Signature for check status: MD5(merchantCode + merchantOrderId + apiKey)
    const signature = generateCheckStatusSignature(
      duitkuConfig.merchantCode,
      targetOrderId,
      duitkuConfig.apiKey
    );

    let duitkuStatusResponse = null;
    const isSandboxMock = duitkuConfig.apiKey.includes('sandbox_api_key_123456');

    if (!isSandboxMock) {
      try {
        const checkUrl = `${duitkuConfig.baseUrl}/transactionStatus`;
        const response = await axios.post(
          checkUrl,
          {
            merchantCode: duitkuConfig.merchantCode,
            merchantOrderId: targetOrderId,
            signature,
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
          }
        );
        duitkuStatusResponse = response.data;
      } catch (axiosErr) {
        console.warn('⚠️ Could not connect to Duitku check status endpoint:', axiosErr.message);
      }
    }

    // Check local database or memory state
    let localOrder = null;
    let localPayment = null;

    if (isConfigured) {
      const { data: o } = await supabase
        .from('orders')
        .select('*, customers(*), order_items(*)')
        .eq('order_number', targetOrderId)
        .single();
      localOrder = o;

      const { data: p } = await supabase
        .from('payments')
        .select('*')
        .eq('merchant_order_id', targetOrderId)
        .single();
      localPayment = p;
    }

    if (!localOrder) localOrder = inMemoryOrders.get(targetOrderId);
    if (!localPayment) localPayment = inMemoryPayments.get(targetOrderId);

    if (!localOrder && !localPayment && !duitkuStatusResponse) {
      return errorResponse(res, 'Status transaksi tidak ditemukan', 'TRANSACTION_NOT_FOUND', 404);
    }

    return successResponse(res, 'Status pembayaran berhasil diambil', {
      order_number: targetOrderId,
      order_status: localOrder?.status || 'unknown',
      payment_status: localOrder?.payment_status || localPayment?.status || 'unpaid',
      amount: localOrder?.total_amount || localPayment?.amount || 0,
      duitku_response: duitkuStatusResponse,
      payment_detail: localPayment || null,
    });
  } catch (err) {
    next(err);
  }
};
