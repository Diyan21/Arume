import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const environment = process.env.DUITKU_ENVIRONMENT || 'sandbox';

export const duitkuConfig = {
  merchantCode: process.env.DUITKU_MERCHANT_CODE || 'D12345',
  apiKey: process.env.DUITKU_API_KEY || 'sandbox_api_key_123456',
  callbackUrl: process.env.DUITKU_CALLBACK_URL || 'http://localhost:3000/api/payment/callback',
  returnUrl: process.env.DUITKU_RETURN_URL || 'http://localhost:3000/order-status',
  environment,
  baseUrl: environment === 'production'
    ? 'https://passport.duitku.com/webapi/api/merchant'
    : 'https://sandbox.duitku.com/webapi/api/merchant',
};

/**
 * Generate signature for Duitku Request Transaction (v2 Inquiry)
 * Formula: MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
 */
export const generateInquirySignature = (merchantCode, merchantOrderId, paymentAmount, apiKey) => {
  const payload = `${merchantCode}${merchantOrderId}${paymentAmount}${apiKey}`;
  return crypto.createHash('md5').update(payload).digest('hex');
};

/**
 * Generate signature to verify Duitku Callback / Webhook
 * Formula: MD5(merchantCode + amount + merchantOrderId + apiKey)
 */
export const generateCallbackSignature = (merchantCode, amount, merchantOrderId, apiKey) => {
  const payload = `${merchantCode}${amount}${merchantOrderId}${apiKey}`;
  return crypto.createHash('md5').update(payload).digest('hex');
};

/**
 * Generate signature for Check Transaction Status
 * Formula: MD5(merchantCode + merchantOrderId + apiKey)
 */
export const generateCheckStatusSignature = (merchantCode, merchantOrderId, apiKey) => {
  const payload = `${merchantCode}${merchantOrderId}${apiKey}`;
  return crypto.createHash('md5').update(payload).digest('hex');
};
