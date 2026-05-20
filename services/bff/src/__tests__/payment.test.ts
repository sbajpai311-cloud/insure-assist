import { MockPaymentAdapter } from '../integrations/payment/mock-adapter';

describe('MockPaymentAdapter', () => {
  let adapter: MockPaymentAdapter;
  beforeEach(() => { adapter = new MockPaymentAdapter(); });

  const baseReq = {
    proposalNumber: 'PROP-001', amount: 125050, currency: 'INR',
    cardExpiry: '12/29', cardCvv: '123', cardholderName: 'Test User',
    description: 'Test premium',
  };

  it('returns SUCCESS for Visa test card 4111...', async () => {
    const r = await adapter.initiate({ ...baseReq, cardNumber: '4111111111111111' });
    expect(r.status).toBe('SUCCESS');
    expect(r.maskedCard).toBe('****1111');
    expect(r.transactionId).toMatch(/^MOCK_TXN_/);
  });

  it('returns DECLINED for card 4000...0002', async () => {
    const r = await adapter.initiate({ ...baseReq, cardNumber: '4000000000000002' });
    expect(r.status).toBe('DECLINED');
    expect(r.gatewayCode).toBe('MOCK_DECLINED_CARD');
  });

  it('returns PENDING then resolves to SUCCESS on verify (3DS flow)', async () => {
    const r1 = await adapter.initiate({ ...baseReq, cardNumber: '4000000000003220' });
    expect(r1.status).toBe('PENDING');
    const r2 = await adapter.verify(r1.transactionId);
    expect(r2.status).toBe('SUCCESS');
    expect(r2.gatewayCode).toBe('MOCK_3DS_COMPLETE');
  });

  it('blocks fraud card', async () => {
    const r = await adapter.initiate({ ...baseReq, cardNumber: '4100000000000001' });
    expect(r.status).toBe('FAILED');
    expect(r.gatewayCode).toBe('MOCK_FRAUD_BLOCKED');
  });

  it('processes refund on SUCCESS transaction', async () => {
    const pay = await adapter.initiate({ ...baseReq, cardNumber: '4111111111111111' });
    const ref = await adapter.refund(pay.transactionId);
    expect(ref.status).toBe('REFUNDED');
    expect(ref.transactionId).toMatch(/^MOCK_REFUND_/);
  });

  it('throws on verify of unknown transactionId', async () => {
    await expect(adapter.verify('NONEXISTENT')).rejects.toThrow('not found');
  });

  it('throws refund on non-SUCCESS transaction', async () => {
    const r = await adapter.initiate({ ...baseReq, cardNumber: '4000000000000002' });
    await expect(adapter.refund(r.transactionId)).rejects.toThrow('Cannot refund');
  });

  it('returns DECLINED for insufficient funds card', async () => {
    const r = await adapter.initiate({ ...baseReq, cardNumber: '4000000000009995' });
    expect(r.status).toBe('DECLINED');
    expect(r.gatewayCode).toBe('MOCK_INSUFFICIENT_FUNDS');
  });

  it('returns SUCCESS for Mastercard test card', async () => {
    const r = await adapter.initiate({ ...baseReq, cardNumber: '5500000000000004' });
    expect(r.status).toBe('SUCCESS');
    expect(r.maskedCard).toBe('****0004');
  });
});
