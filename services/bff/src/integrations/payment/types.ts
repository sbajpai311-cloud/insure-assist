export type PaymentStatus = 'SUCCESS' | 'DECLINED' | 'PENDING' | 'FAILED' | 'REFUNDED';

export interface PaymentInitiateRequest {
  proposalNumber: string;
  amount: number;           // in smallest currency unit (paise for INR)
  currency: string;         // 'INR'
  cardNumber: string;
  cardExpiry: string;       // 'MM/YY'
  cardCvv: string;
  cardholderName: string;
  description: string;      // e.g. 'GTR1 Life Term Premium — 5 years'
}

export interface PaymentResult {
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  gatewayCode: string;      // e.g. 'MOCK_SUCCESS', 'MOCK_DECLINED_CARD'
  timestamp: string;
  maskedCard: string;       // last 4 digits only
  message: string;
}

export interface PaymentAdapter {
  initiate(req: PaymentInitiateRequest): Promise<PaymentResult>;
  verify(transactionId: string): Promise<PaymentResult>;
  refund(transactionId: string, amount?: number): Promise<PaymentResult>;
}
