import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const FNASchema = z.object({
  age: z.number().int().min(18).max(65),
  gender: z.enum(['M', 'F']),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  dependents: z.number().int().min(0),
  occupation: z.string(),
  smoker: z.boolean(),
  monthlyIncome: z.number().positive(),
  monthlyExpenses: z.number().nonnegative(),
  existingLiabilities: z.number().nonnegative(),
  totalSavings: z.number().nonnegative(),
  existingLifeCover: z.number().nonnegative(),
  existingHealthCover: z.number().nonnegative(),
  primaryGoal: z.enum(['income_protection', 'wealth_creation', 'health_protection', 'family_protection']),
  retirementAge: z.number().int().min(40).max(70),
  childrenEducation: z.boolean(),
  riskProfile: z.enum(['conservative', 'moderate', 'aggressive']),
  preExistingConditions: z.boolean(),
  familyHistory: z.boolean(),
  bmi: z.number().optional(),
});

export async function fnaRoutes(app: FastifyInstance) {
  app.post('/api/fna/save', { onRequest: [(app as any).authenticate] }, async (req, reply) => {
    const fnaData = FNASchema.parse(req.body);
    // In production, persist to DB with agentId + timestamp
    const sessionId = `FNA_${Date.now()}`;
    return reply.send({ sessionId, fnaData, savedAt: new Date().toISOString() });
  });
}
