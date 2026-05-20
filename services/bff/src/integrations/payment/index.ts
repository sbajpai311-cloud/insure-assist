import { MockPaymentAdapter } from './mock-adapter';
// import { RazorpayAdapter } from './razorpay-adapter';  // swap in for production
import type { PaymentAdapter } from './types';

export function getPaymentAdapter(): PaymentAdapter {
  if (process.env.PAYMENT_GATEWAY === 'razorpay') {
    // return new RazorpayAdapter(process.env.RAZORPAY_KEY_ID!, process.env.RAZORPAY_KEY_SECRET!);
    throw new Error('Razorpay adapter not yet implemented — use PAYMENT_GATEWAY=mock');
  }
  // Default: mock (safe for test, CI, and demo)
  return new MockPaymentAdapter();
}

export * from './types';
