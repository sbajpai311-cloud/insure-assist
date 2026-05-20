import { FastifyInstance } from 'fastify';
import { generateRecommendations } from '../engines/fna-recommender';
import type { FNAInput } from '../engines/fna-recommender';

export async function recommendRoutes(app: FastifyInstance) {
  app.post('/api/recommend', { onRequest: [(app as any).authenticate] }, async (req, reply) => {
    const fnaData = req.body as FNAInput;
    const recommendations = generateRecommendations(fnaData);
    return reply.send({ recommendations });
  });
}
