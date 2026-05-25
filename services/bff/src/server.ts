import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { authRoutes } from './routes/auth';
import { fnaRoutes } from './routes/fna';
import { recommendRoutes } from './routes/recommend';
import { quoteRoutes } from './routes/quote';
import { issueRoutes } from './routes/issue';
import { policyRoutes } from './routes/policy';
import { wellnessRoutes } from './routes/wellness';
import { paymentRoutes } from './routes/payments';

const app = Fastify({ logger: true, trustProxy: true });

// Respond to health check immediately before any plugin processing
app.addHook('onRequest', async (request, reply) => {
  if (request.url === '/health' || request.url === '/') {
    return reply.code(200).send({ status: 'ok', timestamp: new Date().toISOString() });
  }
});

// Register plugins
app.register(cors, { origin: '*' });

app.register(jwt, {
  secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
});

// Decorate authenticate hook
app.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.send(err);
  }
});

// Register routes
app.register(authRoutes);
app.register(fnaRoutes);
app.register(recommendRoutes);
app.register(quoteRoutes);
app.register(issueRoutes);
app.register(policyRoutes);
app.register(wellnessRoutes);
app.register(paymentRoutes);

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT ?? '3000', 10);
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`InsureAssist BFF running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
