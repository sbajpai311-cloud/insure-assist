import { generateRecommendations } from '../engines/fna-recommender';

describe('FNA Recommendation Engine', () => {
  const baseFNA = {
    age: 32, gender: 'M' as const, maritalStatus: 'married' as const,
    dependents: 2, occupation: 'software engineer', smoker: false,
    monthlyIncome: 80000, monthlyExpenses: 40000, existingLiabilities: 15000,
    totalSavings: 500000, existingLifeCover: 0, existingHealthCover: 0,
    primaryGoal: 'family_protection' as const, retirementAge: 60,
    childrenEducation: true, riskProfile: 'moderate' as const,
    preExistingConditions: false, familyHistory: false,
  };

  it('recommends LifeTerm when life cover gap exists', () => {
    const recs = generateRecommendations(baseFNA);
    expect(recs.find(r => r.productType === 'LIFE_TERM')).toBeDefined();
  });

  it('recommends health bundle when no existing health cover', () => {
    const recs = generateRecommendations(baseFNA);
    expect(recs.find(r => r.productType === 'HEALTH_BUNDLE')).toBeDefined();
  });

  it('sets priority 1 for life cover when gap > 50 lakh', () => {
    const recs = generateRecommendations(baseFNA);
    const lifeRec = recs.find(r => r.productType === 'LIFE_TERM');
    expect(lifeRec?.priority).toBe(1);
  });

  it('recommends WB2 for high income customers', () => {
    const recs = generateRecommendations({ ...baseFNA, monthlyIncome: 80000 });
    const healthRec = recs.find(r => r.productType === 'HEALTH_BUNDLE');
    expect(healthRec?.bundleId).toBe('WB2');
  });

  it('does not recommend life term when already fully covered', () => {
    const recs = generateRecommendations({ ...baseFNA, existingLifeCover: 100000000 });
    expect(recs.find(r => r.productType === 'LIFE_TERM')).toBeUndefined();
  });

  it('recommends personal accident for high-risk occupations', () => {
    const recs = generateRecommendations({ ...baseFNA, occupation: 'construction worker' });
    expect(recs.find(r => r.productType === 'PERSONAL_ACCIDENT')).toBeDefined();
  });

  it('recommends WB1 for lower income customers', () => {
    const recs = generateRecommendations({ ...baseFNA, monthlyIncome: 30000 });
    const healthRec = recs.find(r => r.productType === 'HEALTH_BUNDLE');
    expect(healthRec?.bundleId).toBe('WB1');
  });

  it('sorts recommendations by priority', () => {
    const recs = generateRecommendations(baseFNA);
    for (let i = 1; i < recs.length; i++) {
      expect(recs[i].priority).toBeGreaterThanOrEqual(recs[i - 1].priority);
    }
  });
});
