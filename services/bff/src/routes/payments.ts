import { FastifyInstance } from 'fastify';
import { z, ZodError } from 'zod';
import { getPaymentAdapter } from '../integrations/payment';
import { issuePolicy } from '../integrations/insuremo/issuance';

const InitiateSchema = z.object({
  proposalNumber: z.string(),
  amount:         z.number().positive(),
  currency:       z.string().default('INR'),
  cardNumber:     z.string().regex(/^[\d\s]{13,19}$/),
  cardExpiry:     z.string().regex(/^\d{2}\/\d{2}$/),
  cardCvv:        z.string().regex(/^\d{3,4}$/),
  cardholderName: z.string().min(2),
  description:    z.string().optional(),
});

export async function paymentRoutes(app: FastifyInstance) {

  // Step 1: Initiate payment
  app.post('/api/payments/initiate', { onRequest: [(app as any).authenticate] }, async (req, reply) => {
    let body: z.infer<typeof InitiateSchema>;
    try {
      body = InitiateSchema.parse(req.body);
    } catch (e) {
      if (e instanceof ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', issues: e.issues });
      }
      throw e;
    }
    const adapter = getPaymentAdapter();

    const result = await adapter.initiate({
      ...body,
      description: body.description ?? `Insurance premium — ${body.proposalNumber}`,
    });

    // Do NOT issue policy yet — wait for verify
    return reply.send({
      transactionId: result.transactionId,
      status:        result.status,
      maskedCard:    result.maskedCard,
      message:       result.message,
      gatewayCode:   result.gatewayCode,
    });
  });

  // Step 2: Verify payment, then trigger InsureMO issuance
  app.post('/api/payments/verify-and-issue', { onRequest: [(app as any).authenticate] }, async (req, reply) => {
    const { transactionId, proposalNumber, feeAmount, currency } = req.body as {
      transactionId: string;
      proposalNumber: string;
      feeAmount: number;
      currency: number;
    };

    const adapter = getPaymentAdapter();
    const payment = await adapter.verify(transactionId);

    if (payment.status !== 'SUCCESS') {
      return reply.status(402).send({
        error: 'PAYMENT_NOT_SUCCESS',
        status: payment.status,
        message: payment.message,
      });
    }

    // Payment confirmed — now issue policy with InsureMO
    const issuance = await issuePolicy(proposalNumber, feeAmount, currency);

    return reply.send({
      payment,
      policy: {
        policyNumber: issuance.policyNumber,
        riskStatus:   issuance.riskStatus,
        installPrem:  issuance.installPrem,
      },
    });
  });

  // Refund endpoint (for cancellations)
  app.post('/api/payments/refund', { onRequest: [(app as any).authenticate] }, async (req, reply) => {
    const { transactionId, amount } = req.body as { transactionId: string; amount?: number };
    const adapter = getPaymentAdapter();
    const refund = await adapter.refund(transactionId, amount);
    return reply.send(refund);
  });
}
