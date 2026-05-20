export interface FNAInput {
  // Step 1 — Personal Profile
  age: number;
  gender: 'M' | 'F';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  dependents: number;
  occupation: string;
  smoker: boolean;

  // Step 2 — Income & Expenses
  monthlyIncome: number;
  monthlyExpenses: number;
  existingLiabilities: number;      // EMIs, loans

  // Step 3 — Assets & Existing Cover
  totalSavings: number;
  existingLifeCover: number;
  existingHealthCover: number;

  // Step 4 — Goals & Priorities
  primaryGoal: 'income_protection' | 'wealth_creation' | 'health_protection' | 'family_protection';
  retirementAge: number;
  childrenEducation: boolean;

  // Step 5 — Risk Appetite
  riskProfile: 'conservative' | 'moderate' | 'aggressive';

  // Step 6 — Health History
  preExistingConditions: boolean;
  familyHistory: boolean;
  bmi?: number;
}

export interface Recommendation {
  productType: 'LIFE_TERM' | 'HEALTH_BUNDLE' | 'PERSONAL_ACCIDENT' | 'WELLNESS';
  productCode: string;
  bundleId?: string;
  priority: 1 | 2 | 3;
  rationale: string;
  suggestedSA?: number;
  suggestedTerm?: number;
}

export function generateRecommendations(fna: FNAInput): Recommendation[] {
  const recs: Recommendation[] = [];

  // ── Life Cover Need ─────────────────────────────────────────────
  const humanLifeValue = fna.monthlyIncome * 12 * (fna.retirementAge - fna.age);
  const lifeCoverGap = Math.max(0, humanLifeValue - fna.existingLifeCover);

  if (lifeCoverGap > 500000) {
    const suggestedSA = Math.ceil(lifeCoverGap / 100000) * 100000;
    const suggestedTerm = fna.retirementAge - fna.age;
    recs.push({
      productType: 'LIFE_TERM',
      productCode: 'GTR1',
      priority: 1,
      rationale: `Your human life value is ₹${humanLifeValue.toLocaleString()}. You have a life cover gap of ₹${lifeCoverGap.toLocaleString()}.`,
      suggestedSA,
      suggestedTerm,
    });
  }

  // ── Health Cover Need ────────────────────────────────────────────
  const hasHealthGap = fna.existingHealthCover < 300000;

  if (hasHealthGap || fna.preExistingConditions || fna.familyHistory) {
    const bundleId = fna.monthlyIncome > 50000 ? 'WB2' : 'WB1';
    recs.push({
      productType: 'HEALTH_BUNDLE',
      productCode: 'HALB',
      bundleId,
      priority: hasHealthGap ? 1 : 2,
      rationale: `Health cover gap detected. Recommended bundle includes annual health check-up, OPD consults, and discounted wellness services.`,
    });
  }

  // ── Wellness Upsell ──────────────────────────────────────────────
  if (fna.age < 45 && fna.primaryGoal === 'health_protection') {
    recs.push({
      productType: 'WELLNESS',
      productCode: 'HALB',
      bundleId: 'WB2',
      priority: 3,
      rationale: `Premium wellness bundle adds Zumba membership, doctor on demand, and health risk assessment.`,
    });
  }

  // ── Personal Accident ────────────────────────────────────────────
  const riskOccupations = ['driver', 'construction', 'mining', 'factory'];
  if (riskOccupations.some(o => fna.occupation.toLowerCase().includes(o))) {
    recs.push({
      productType: 'PERSONAL_ACCIDENT',
      productCode: 'GTR1',
      priority: 2,
      rationale: `Your occupation has elevated accidental risk. Personal accident cover (benefit B0001) is recommended.`,
    });
  }

  return recs.sort((a, b) => a.priority - b.priority);
}
