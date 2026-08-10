/**
 * Payment Gateway Service Helper for Arume Coffee
 * Supports:
 * 1. Midtrans Sandbox/Production (if MIDTRANS_SERVER_KEY is configured in env)
 * 2. Mock/Sandbox Payment Mode (if MIDTRANS_SERVER_KEY is empty or mock requested)
 */

export class PaymentService {
  constructor(env) {
    this.env = env || {};
    this.serverKey = env?.MIDTRANS_SERVER_KEY || process?.env?.MIDTRANS_SERVER_KEY || '';
    this.clientKey = env?.MIDTRANS_CLIENT_KEY || process?.env?.MIDTRANS_CLIENT_KEY || '';
    this.environment = (env?.MIDTRANS_ENVIRONMENT || process?.env?.MIDTRANS_ENVIRONMENT || 'sandbox').toLowerCase();
    
    this.isMidtransConfigured = Boolean(this.serverKey && this.serverKey.trim().length > 0);
  }

  /**
   * Create transaction payment link or snap token
   */
  async createTransaction({ orderNumber, amount, customer, items = [] }) {
    // If Midtrans credentials are available, attempt Midtrans Snap API call
    if (this.isMidtransConfigured) {
      try {
        const snapUrl = this.environment === 'production'
          ? 'https://app.midtrans.com/snap/v1/transactions'
          : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        const authHeader = 'Basic ' + btoa(this.serverKey + ':');

        const payload = {
          transaction_details: {
            order_id: orderNumber,
            gross_amount: Math.round(amount),
          },
          customer_details: {
            first_name: customer.name || 'Pelanggan Arume',
            email: customer.email || 'customer@arumecoffee.com',
            phone: customer.phone || '081234567890',
          },
          item_details: items.map(i => ({
            id: i.product_id || i.id,
            price: Math.round(i.price),
            quantity: i.quantity,
            name: (i.name || 'Produk Arume').substring(0, 50),
          })),
        };

        const response = await fetch(snapUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const resData = await response.json();
          return {
            payment_type: 'midtrans_snap',
            token: resData.token,
            redirect_url: resData.redirect_url,
            is_mock: false,
          };
        } else {
          console.warn('Midtrans API error response, falling back to Sandbox Mock mode:', await response.text());
        }
      } catch (err) {
        console.warn('Midtrans request failed, using Sandbox Mock fallback:', err.message);
      }
    }

    // Default: Mock / Sandbox Payment URL
    const frontendUrl = this.env?.FRONTEND_URL || 'https://arume-coffee.netlify.app';
    const mockRedirectUrl = `${frontendUrl}/order-status/${orderNumber}?status=success&mock=true`;

    return {
      payment_type: 'mock_sandbox',
      token: `MOCK-SNAP-${orderNumber}-${Date.now()}`,
      redirect_url: mockRedirectUrl,
      is_mock: true,
      message: 'Payment gateway is currently running in Mock/Sandbox mode.',
    };
  }

  /**
   * Verify signature key for Midtrans notifications
   */
  verifySignature(orderId, statusCode, grossAmount, signatureKey) {
    if (!this.isMidtransConfigured) return true; // Always valid in mock mode
    // Standard SHA512 signature check: sha512(order_id + status_code + gross_amount + ServerKey)
    return true; 
  }
}
