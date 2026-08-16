import Razorpay from 'razorpay';
import crypto from 'crypto';

function getRazorpayInstance() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export class RazorpayService {
  /**
   * Check if Razorpay keys are configured
   */
  static isConfigured(): boolean {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    return Boolean(keyId && keySecret);
  }

  /**
   * Get public Razorpay key ID for client checkout SDK
   */
  static getKeyId(): string | null {
    return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || null;
  }

  /**
   * Create a Razorpay Order
   */
  static async createRazorpayOrder(amountInINR: number, receipt: string): Promise<any> {
    const instance = getRazorpayInstance();
    if (!instance) {
      throw new Error('Razorpay is not configured. Missing API keys.');
    }

    const amountInPaise = Math.round(amountInINR * 100);

    const order = await instance.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt,
      payment_capture: true,
    });

    return order;
  }

  /**
   * Verify Razorpay Payment Signature
   */
  static verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): boolean {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error('Razorpay key secret missing');
    }

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpaySignature;
  }
}
