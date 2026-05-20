import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFNAStore } from '../../store/fnaStore';
import { theme } from '../../theme';

const STEPS = [
  'Personal Profile',
  'Income & Expenses',
  'Assets & Cover',
  'Goals & Priorities',
  'Risk Appetite',
  'Health History',
];

export default function FNAWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigation = useNavigation<any>();
  const { fnaData, updateFNA } = useFNAStore();

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      navigation.navigate('ProductRecommendation');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {STEPS.map((step, idx) => (
          <View
            key={step}
            style={[
              styles.progressDot,
              idx <= currentStep && { backgroundColor: theme.colors.tealPrimary },
            ]}
          />
        ))}
      </View>
      <Text style={styles.stepIndicator}>Step {currentStep + 1} of {STEPS.length}</Text>
      <Text style={styles.stepTitle}>{STEPS[currentStep]}</Text>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <StepContent step={currentStep} data={fnaData} onChange={updateFNA} />
      </ScrollView>

      <View style={styles.buttonRow}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, currentStep === 0 && { flex: 1 }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep < STEPS.length - 1 ? 'Continue' : 'See Recommendations'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StepContent({ step, data, onChange }: { step: number; data: any; onChange: (d: any) => void }) {
  switch (step) {
    case 0:
      return (
        <View style={styles.stepContent}>
          <FormField label="Age" placeholder="e.g. 32">
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={data.age?.toString() ?? ''}
              onChangeText={v => onChange({ age: parseInt(v) || undefined })}
              placeholder="32"
            />
          </FormField>
          <FormField label="Gender">
            <View style={styles.optionRow}>
              {(['M', 'F'] as const).map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.optionButton, data.gender === g && styles.optionButtonSelected]}
                  onPress={() => onChange({ gender: g })}
                >
                  <Text style={[styles.optionText, data.gender === g && styles.optionTextSelected]}>
                    {g === 'M' ? 'Male' : 'Female'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </FormField>
          <FormField label="Marital Status">
            <View style={styles.optionRow}>
              {(['single', 'married', 'divorced', 'widowed'] as const).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.optionButton, data.maritalStatus === s && styles.optionButtonSelected]}
                  onPress={() => onChange({ maritalStatus: s })}
                >
                  <Text style={[styles.optionText, data.maritalStatus === s && styles.optionTextSelected]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </FormField>
          <FormField label="Number of Dependents">
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={data.dependents?.toString() ?? ''}
              onChangeText={v => onChange({ dependents: parseInt(v) || 0 })}
              placeholder="2"
            />
          </FormField>
          <FormField label="Occupation">
            <TextInput
              style={styles.input}
              value={data.occupation ?? ''}
              onChangeText={v => onChange({ occupation: v })}
              placeholder="e.g. Software Engineer"
            />
          </FormField>
          <FormField label="Smoker">
            <Switch
              value={data.smoker ?? false}
              onValueChange={v => onChange({ smoker: v })}
              trackColor={{ true: theme.colors.tealPrimary }}
            />
          </FormField>
        </View>
      );

    case 1:
      return (
        <View style={styles.stepContent}>
          <FormField label="Monthly Income (₹)">
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={data.monthlyIncome?.toString() ?? ''}
              onChangeText={v => onChange({ monthlyIncome: parseFloat(v) || undefined })}
              placeholder="80000"
            />
          </FormField>
          <FormField label="Monthly Expenses (₹)">
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={data.monthlyExpenses?.toString() ?? ''}
              onChangeText={v => onChange({ monthlyExpenses: parseFloat(v) || 0 })}
              placeholder="40000"
            />
          </FormField>
          <FormField label="Existing Liabilities / EMIs (₹)">
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={data.existingLiabilities?.toString() ?? ''}
              onChangeText={v => onChange({ existingLiabilities: parseFloat(v) || 0 })}
              placeholder="15000"
            />
          </FormField>
        </View>
      );

    case 2:
      return (
        <View style={styles.stepContent}>
          <FormField label="Total Savings (₹)">
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={data.totalSavings?.toString() ?? ''}
              onChangeText={v => onChange({ totalSavings: parseFloat(v) || 0 })}
              placeholder="500000"
            />
          </FormField>
          <FormField label="Existing Life Cover (₹)">
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={data.existingLifeCover?.toString() ?? ''}
              onChangeText={v => onChange({ existingLifeCover: parseFloat(v) || 0 })}
              placeholder="0"
            />
          </FormField>
          <FormField label="Existing Health Cover (₹)">
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={data.existingHealthCover?.toString() ?? ''}
              onChangeText={v => onChange({ existingHealthCover: parseFloat(v) || 0 })}
              placeholder="0"
            />
          </FormField>
        </View>
      );

    case 3:
      return (
        <View style={styles.stepContent}>
          <FormField label="Primary Goal">
            {(['income_protection', 'wealth_creation', 'health_protection', 'family_protection'] as const).map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.optionButtonFull, data.primaryGoal === g && styles.optionButtonSelected]}
                onPress={() => onChange({ primaryGoal: g })}
              >
                <Text style={[styles.optionText, data.primaryGoal === g && styles.optionTextSelected]}>
                  {g.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </Text>
              </TouchableOpacity>
            ))}
          </FormField>
          <FormField label="Target Retirement Age">
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={data.retirementAge?.toString() ?? ''}
              onChangeText={v => onChange({ retirementAge: parseInt(v) || undefined })}
              placeholder="60"
            />
          </FormField>
          <FormField label="Planning for Children's Education?">
            <Switch
              value={data.childrenEducation ?? false}
              onValueChange={v => onChange({ childrenEducation: v })}
              trackColor={{ true: theme.colors.tealPrimary }}
            />
          </FormField>
        </View>
      );

    case 4:
      return (
        <View style={styles.stepContent}>
          <FormField label="Risk Profile">
            {(['conservative', 'moderate', 'aggressive'] as const).map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.optionButtonFull, data.riskProfile === r && styles.optionButtonSelected]}
                onPress={() => onChange({ riskProfile: r })}
              >
                <Text style={[styles.optionText, data.riskProfile === r && styles.optionTextSelected]}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </FormField>
        </View>
      );

    case 5:
      return (
        <View style={styles.stepContent}>
          <FormField label="Pre-existing Medical Conditions?">
            <Switch
              value={data.preExistingConditions ?? false}
              onValueChange={v => onChange({ preExistingConditions: v })}
              trackColor={{ true: theme.colors.tealPrimary }}
            />
          </FormField>
          <FormField label="Family History of Critical Illness?">
            <Switch
              value={data.familyHistory ?? false}
              onValueChange={v => onChange({ familyHistory: v })}
              trackColor={{ true: theme.colors.tealPrimary }}
            />
          </FormField>
          <FormField label="BMI (optional)">
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={data.bmi?.toString() ?? ''}
              onChangeText={v => onChange({ bmi: parseFloat(v) || undefined })}
              placeholder="22.5"
            />
          </FormField>
        </View>
      );

    default:
      return null;
  }
}

function FormField({ label, children, placeholder }: { label: string; children: React.ReactNode; placeholder?: string }) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.grey100,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    gap: theme.spacing[2],
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.grey300,
  },
  stepIndicator: {
    fontSize: 12,
    color: theme.colors.grey600,
    paddingHorizontal: theme.spacing[4],
    marginTop: theme.spacing[3],
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.navy,
    paddingHorizontal: theme.spacing[4],
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: theme.spacing[4],
    gap: theme.spacing[4],
  },
  fieldContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.grey600,
    marginBottom: theme.spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.grey300,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing[3],
    fontSize: 16,
    color: theme.colors.grey900,
  },
  optionRow: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.grey300,
  },
  optionButtonFull: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.grey300,
    marginBottom: theme.spacing[2],
  },
  optionButtonSelected: {
    borderColor: theme.colors.tealPrimary,
    backgroundColor: theme.colors.tealLight,
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.grey600,
  },
  optionTextSelected: {
    color: theme.colors.tealDark,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grey300,
  },
  backButton: {
    flex: 0.4,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    borderWidth: 1.5,
    borderColor: theme.colors.tealPrimary,
    alignItems: 'center',
  },
  backButtonText: {
    color: theme.colors.tealPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  nextButton: {
    flex: 1,
    backgroundColor: theme.colors.tealPrimary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    alignItems: 'center',
  },
  nextButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});
