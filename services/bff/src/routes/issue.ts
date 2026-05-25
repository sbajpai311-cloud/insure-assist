import { FastifyInstance } from 'fastify';
import { submitApplication } from '../integrations/insuremo/application';

export async function issueRoutes(app: FastifyInstance) {
  app.post('/api/issue/application', { onRequest: [(app as any).authenticate] }, async (req, reply) => {
    const customerData = req.body as Parameters<typeof submitApplication>[0];
    try {
      const result = await submitApplication(customerData);
      return reply.send(result);
    } catch (err: any) {
      app.log.error({ err }, 'Application submission failed');
      return reply.status(502).send({
        error: 'APPLICATION_FAILED',
        message: err.response?.data ? JSON.stringify(err.response.data) : (err.message ?? 'Application submission failed'),
      });
    }
  });
}
