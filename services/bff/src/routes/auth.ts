import { FastifyInstance } from 'fastify';
import { z, ZodError } from 'zod';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Simple credential-based auth
// Replaces Microsoft SSO — no Azure AD required.
// Agents are stored in AGENT_CREDENTIALS env var as JSON, or fall back to the
// built-in demo accounts below.  Swap back to MSAL when Azure AD is available.
// ---------------------------------------------------------------------------

interface AgentAccount {
  agentId:   string;
  name:      string;
  email:     string;
  password:  string; // plain-text for demo; hash with bcrypt in production
  tenantIds: string[];
}

function loadAgents(): AgentAccount[] {
  if (process.env.AGENT_CREDENTIALS) {
    try { return JSON.parse(process.env.AGENT_CREDENTIALS); } catch {}
  }
  // Built-in demo accounts — change passwords before any real deployment
  return [
    {
      agentId:   'agent-001',
      name:      'Demo Agent',
      email:     'agent@insureassist.demo',
      password:  'Demo@1234',
      tenantIds: ['LimoPOC', 'inecosystem'],
    },
    {
      agentId:   'agent-002',
      name:      'SC Agent',
      email:     'scagent@insureassist.demo',
      password:  'SC@9876',
      tenantIds: ['LimoPOC'],
    },
  ];
}

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(4),
});

export async function authRoutes(app: FastifyInstance) {

  // POST /auth/login — email + password → BFF JWT
  app.post('/auth/login', async (req, reply) => {
    let email: string, password: string;
    try {
      ({ email, password } = LoginSchema.parse(req.body));
    } catch (e) {
      if (e instanceof ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', message: e.issues[0]?.message ?? 'Invalid input' });
      }
      throw e;
    }

    const agents = loadAgents();
    const agent  = agents.find(a => a.email === email && a.password === password);

    if (!agent) {
      return reply.status(401).send({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    }

    const token = (app as any).jwt.sign(
      {
        agentId:   agent.agentId,
        name:      agent.name,
        email:     agent.email,
        tenantIds: agent.tenantIds,
      },
      { expiresIn: '8h' }
    );

    return reply.send({ token, agent: { agentId: agent.agentId, name: agent.name, email: agent.email } });
  });

  // GET /auth/me — validate token, return agent info
  app.get('/auth/me', { onRequest: [(app as any).authenticate] }, async (req, reply) => {
    return reply.send({ agent: (req as any).user });
  });

  // POST /auth/logout — client simply discards the JWT; nothing to do server-side
  app.post('/auth/logout', async (_req, reply) => {
    return reply.send({ message: 'Logged out. Please discard your token.' });
  });
}
