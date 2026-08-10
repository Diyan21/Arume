import { errorResponse } from '../utils/response.js';

export const validateOrderInput = (req, res, next) => {
  const { customer, items } = req.body;

  if (!customer || typeof customer !== 'object') {
    return errorResponse(res, 'Valid customer object is required');
  }

  if (!customer.name || typeof customer.name !== 'string' || customer.name.trim() === '') {
    return errorResponse(res, 'Customer name is required');
  }

  if (!customer.whatsapp || typeof customer.whatsapp !== 'string' || customer.whatsapp.trim() === '') {
    return errorResponse(res, 'Customer WhatsApp number is required');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return errorResponse(res, 'Order must contain at least one item');
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.product_id) {
      return errorResponse(res, `Item at index ${i} is missing product_id`);
    }
    if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
      return errorResponse(res, `Item at index ${i} must have a valid positive quantity`);
    }
  }

  next();
};

export const validatePaymentCreateInput = (req, res, next) => {
  const { orderNumber } = req.body;

  if (!orderNumber || typeof orderNumber !== 'string') {
    return errorResponse(res, 'Valid orderNumber is required');
  }

  next();
};
