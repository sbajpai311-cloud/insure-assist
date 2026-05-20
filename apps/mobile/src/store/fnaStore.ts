import { create } from 'zustand';

export interface FNAData {
  // Step 1 — Personal Profile
  age?: number;
  gender?: 'M' | 'F';
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  dependents?: number;
  occupation?: string;
  smoker?: boolean;

  // Step 2 — Income & Expenses
  monthlyIncome?: number;
  monthlyExpenses?: number;
  existingLiabilities?: number;

  // Step 3 — Assets & Existing Cover
  totalSavings?: number;
  existingLifeCover?: number;
  existingHealthCover?: number;

  // Step 4 — Goals & Priorities
  primaryGoal?: 'income_protection' | 'wealth_creation' | 'health_protection' | 'family_protection';
  retirementAge?: number;
  childrenEducation?: boolean;

  // Step 5 — Risk Appetite
  riskProfile?: 'conservative' | 'moderate' | 'aggressive';

  // Step 6 — Health History
  preExistingConditions?: boolean;
  familyHistory?: boolean;
  bmi?: number;
}

interface FNAState {
  fnaData: FNAData;
  updateFNA: (data: Partial<FNAData>) => void;
  resetFNA: () => void;
}

export const useFNAStore = create<FNAState>((set) => ({
  fnaData: {},
  updateFNA: (data) => set((state) => ({ fnaData: { ...state.fnaData, ...data } })),
  resetFNA: () => set({ fnaData: {} }),
}));
