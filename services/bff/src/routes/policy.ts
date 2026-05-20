import { FastifyInstance } from 'fastify';
import { queryPolicy } from '../integrations/insuremo/policy';

export async function policyRoutes(app: FastifyInstance) {
  app.get('/api/policy/:policyNumber', { onRequest: [(app as any).authenticate] }, async (req, reply) => {
    const { policyNumber } = req.params as { policyNumber: string };
    const result = await queryPolicy(policyNumber);
    return reply.send(result);
  });
}
