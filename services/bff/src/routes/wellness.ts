import { FastifyInstance } from 'fastify';
import { getAvailableDoctors, bookDoctorAppointment } from '../integrations/wellness/doctor';
import { getZumbaPlans, enrollZumbaMembership } from '../integrations/wellness/zumba';
import { getHealthCheckPackages, bookHealthCheck } from '../integrations/wellness/healthcheck';

export async function wellnessRoutes(app: FastifyInstance) {
  // Wellness catalogue
  app.get('/api/wellness/catalogue', { onRequest: [(app as any).authenticate] }, async (req, reply) => {
    const [doctors, zumbaPlans, healthPackages] = await Promise.all([
      getAvailableDoctors(),
      getZumbaPlans(),
      getHealthCheckPackages(),
    ]);
    return reply.send({ doctors, zumbaPlans, healthPackages });
  });

  // Doctor appointment
  app.get('/api/wellness/doctors', { onRequest: [(app as any).authenticate] }, async (req, reply) => {
    return reply.send(await getAvailableDoctors());
  });

  app.post('/api/wellness/doctors/book', { onRequest: [(app as any).authenticate] }, async (req, reply) => {
    const { doctorId, slot, patientName } = req.body as { doctorId: string; slot: string; patientName: string };
    return reply.send(await bookDoctorAppointment(doctorId, slot, patientName));
  });

  // Zumba membership
  app.get('/api/wellness/zumba/plans', { onRequest: [(app as any).authenticate] }, async (req, reply) => {
    return reply.send(await getZumbaPlans());
  });

  app.post('/api/wellness/zumba/enroll', { onRequest: [(app as any).authenticate] }, async (req, reply) => {
    const { planId, memberName, email } = req.body as { planId: string; memberName: string; email: string };
    return reply.send(await enrollZumbaMembership(planId, memberName, email));
  });

  // Health check
  app.get('/api/wellness/healthcheck/packages', { onRequest: [(app as any).authenticate] }, async (req, reply) => {
    return reply.send(await getHealthCheckPackages());
  });

  app.post('/api/wellness/healthcheck/book', { onRequest: [(app as any).authenticate] }, async (req, reply) => {
    const { packageId, patientName, preferredDate } = req.body as { packageId: string; patientName: string; preferredDate: string };
    return reply.send(await bookHealthCheck(packageId, patientName, preferredDate));
  });
}
