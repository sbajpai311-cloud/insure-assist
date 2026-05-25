import { FastifyInstance } from 'fastify';
import { z, ZodError } from 'zod';
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
    let body: z.infer<typeof QuoteSchema>;
    try {
      body = QuoteSchema.parse(req.body);
    } catch (e) {
      if (e instanceof ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', message: e.issues[0]?.message ?? 'Invalid input' });
      }
      throw e;
    }
    try {
      const result = await calculatePremium(body);
      return reply.send(result);
    } catch (err: any) {
      app.log.error({ err }, 'Quote calculation failed');
      return reply.status(502).send({
        error: 'QUOTE_FAILED',
        message: err.response?.data ? JSON.stringify(err.response.data) : (err.message ?? 'Premium calculation failed'),
      });
    }
  });
}
