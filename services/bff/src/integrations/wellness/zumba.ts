// Mock stub — replace with actual Zumba membership vendor API
export async function getZumbaPlans() {
  return [
    { planId: 'ZUMBA_MONTHLY', name: 'Monthly Membership', sessions: 12, price: 499 },
    { planId: 'ZUMBA_QUARTERLY', name: 'Quarterly Membership', sessions: 36, price: 1299 },
  ];
}

export async function enrollZumbaMembership(planId: string, memberName: string, email: string) {
  return {
    enrollmentId: `ZUMBA_${Date.now()}`,
    planId,
    memberName,
    email,
    status: 'ACTIVE',
    startDate: new Date().toISOString(),
    membershipCard: `ZCARD${Math.floor(Math.random() * 100000)}`,
  };
}
