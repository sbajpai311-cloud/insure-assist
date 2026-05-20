import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { calculatePremium } from '../integrations/insuremo/premium';

const QuoteSchema = z.object({
  gender: z.enum(['M', 'F']),
  birthdate: z.string(),
  sumAssured: z.number().positive(),
  coverageYear: z.number().int().min(1).max(40),
  chargeYear: z.number().int().min(1).max(40),
  paymentFreq: z.union([z.literal(1), z.literal(2), z.literal(4), z.literal(12)]),
});

export async function quoteRoutes(app: FastifyInstance) {
  app.post('/api/quote', { onRequest: [(app as any).authenticate] }, async (req, reply) => {
    const body = QuoteSchema.parse(req.body);
    const result = await calculatePremium(body);
    return reply.send(result);
  });
}
