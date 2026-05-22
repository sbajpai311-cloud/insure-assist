import Fastify from 'fastify';

const app = Fastify({ logger: true });

app.get('/health', async (_req, reply) => {
  return reply.code(200).send({ status: 'ok' });
});

app.get('/', async (_req, reply) => {
  return reply.code(200).send({ status: 'ok' });
});

const port = parseInt(process.env.PORT ?? '3000', 10);

app.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Server running on port ${port}`);
});
