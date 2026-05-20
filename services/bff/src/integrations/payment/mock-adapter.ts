import { v4 as uuidv4 } from 'uuid';
import type { PaymentAdapter, PaymentInitiateRequest, PaymentResult, PaymentStatus } from './types';

// Deterministic outcome map keyed by card number prefix/full
const CARD_OUTCOMES: Record<string, { status: PaymentStatus; code: string; message: string }> = {
  '4111111111111111': { status: 'SUCCESS',  code: 'MOCK_SUCCESS',            message: 'Payment approved'               },
  '5500000000000004': { status: 'SUCCESS',  code: 'MOCK_SUCCESS',            message: 'Payment approved'               },
  '4000000000000002': { status: 'DECLINED', code: 'MOCK_DECLINED_CARD',      message: 'Card declined by issuer'        },
  '4000000000009995': { status: 'DECLINED', code: 'MOCK_INSUFFICIENT_FUNDS', message: 'Insufficient funds'             },
  '4000000000003220': { status: 'PENDING',  code: 'MOCK_3DS_PENDING',        message: '3D Secure verification pending' },
  '4100000000000001': { status: 'FAILED',   code: 'MOCK_FRAUD_BLOCKED',      message: 'Transaction blocked — fraud'    },
};

const DEFAULT_OUTCOME = { status: 'SUCCESS' as PaymentStatus, code: 'MOCK_SUCCESS', message: 'Payment approved (default)' };

// In-memory store (replace with Redis for multi-instance)
const txnStore = new Map<string, PaymentResult>();

export class MockPaymentAdapter implements PaymentAdapter {

  async initiate(req: PaymentInitiateRequest): Promise<PaymentResult> {
    const normalised = req.cardNumber.replace(/\s/g, '');
    const outcome = CARD_OUTCOMES[normalised] ?? DEFAULT_OUTCOME;

    // Simulate 150–400ms network latency
    await new Promise(r => setTimeout(r, 150 + Math.random() * 250));

    const result: PaymentResult = {
      transactionId: `MOCK_TXN_${uuidv4().toUpperCase()}`,
      status:        outcome.status,
      amount:        req.amount,
      currency:      req.currency,
      gatewayCode:   outcome.code,
      timestamp:     new Date().toISOString(),
      maskedCard:    `****${normalised.slice(-4)}`,
      message:       outcome.message,
    };

    txnStore.set(result.transactionId, result);
    return result;
  }

  async verify(transactionId: string): Promise<PaymentResult> {
    const txn = txnStore.get(transactionId);
    if (!txn) throw new Error(`Transaction ${transactionId} not found`);

    // Simulate PENDING → SUCCESS after first verify call (3DS simulation)
    if (txn.status === 'PENDING') {
      const resolved = { ...txn, status: 'SUCCESS' as PaymentStatus, gatewayCode: 'MOCK_3DS_COMPLETE' };
      txnStore.set(transactionId, resolved);
      return resolved;
    }
    return txn;
  }

  async refund(transactionId: string, amount?: number): Promise<PaymentResult> {
    const txn = txnStore.get(transactionId);
    if (!txn) throw new Error(`Transaction ${transactionId} not found`);
    if (txn.status !== 'SUCCESS') throw new Error(`Cannot refund non-successful transaction`);

    const refunded = {
      ...txn,
      transactionId: `MOCK_REFUND_${uuidv4().toUpperCase()}`,
      status:        'REFUNDED' as PaymentStatus,
      amount:        amount ?? txn.amount,
      gatewayCode:   'MOCK_REFUND_SUCCESS',
      timestamp:     new Date().toISOString(),
      message:       'Refund processed successfully',
    };
    txnStore.set(refunded.transactionId, refunded);
    return refunded;
  }
}
