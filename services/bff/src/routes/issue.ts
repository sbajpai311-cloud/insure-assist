import { FastifyInstance } from 'fastify';
import { submitApplication } from '../integrations/insuremo/application';

export async function issueRoutes(app: FastifyInstance) {
  app.post('/api/issue/application', { onRequest: [(app as any).authenticate] }, async (req, reply) => {
    const customerData = req.body as Parameters<typeof submitApplication>[0];
    const result = await submitApplication(customerData);
    return reply.send(result);
  });
}
