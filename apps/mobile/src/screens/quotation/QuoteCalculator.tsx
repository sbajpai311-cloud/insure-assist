import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../theme';
import { API_BASE } from '../../config/api';
import { useAuthStore } from '../../store/authStore';

export default function QuoteCalculator() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { token } = useAuthStore();

  const rec = params?.rec;

  const [form, setForm] = useState({
    gender: rec?.suggestedSA ? 'M' : 'M',
    birthdate: '1992-01-01',
    sumAssured: rec?.suggestedSA?.toString() ?? '1000000',
    coverageYear: rec?.suggestedTerm?.toString() ?? '10',
    chargeYear: rec?.suggestedTerm?.toString() ?? '10',
    paymentFreq: '1',
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          gender: form.gender,
          birthdate: new Date(form.birthdate).toISOString(),
          sumAssured: parseFloat(form.sumAssured),
          coverageYear: parseInt(form.coverageYear),
          chargeYear: parseInt(form.chargeYear),
          paymentFreq: parseInt(form.paymentFreq),
        }),
      }).then(r => r.json());

      if (res.error) {
        Alert.alert('Quote Error', res.error);
        return;
      }
      setResult(res);
    } catch (e: any) {
      Alert.alert('Network Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Product: GTR1 — Life Term</Text>

        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.segmented}>
              {['M', 'F'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.segment, form.gender === g && styles.segmentSelected]}
                  onPress={() => setForm(f => ({ ...f, gender: g }))}
                >
                  <Text style={[styles.segmentText, form.gender === g && styles.segmentTextSelected]}>
                    {g === 'M' ? 'Male' : 'Female'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              value={form.birthdate}
              onChangeText={v => setForm(f => ({ ...f, birthdate: v }))}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>

        <Text style={styles.label}>Sum Assured (₹)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={form.sumAssured}
          onChangeText={v => setForm(f => ({ ...f, sumAssured: v }))}
          placeholder="1000000"
        />

        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Coverage (years)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={form.coverageYear}
              onChangeText={v => setForm(f => ({ ...f, coverageYear: v }))}
            />
          </View>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Charge (years)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={form.chargeYear}
              onChangeText={v => setForm(f => ({ ...f, chargeYear: v }))}
            />
          </View>
        </View>

        <Text style={styles.label}>Payment Frequency</Text>
        <View style={styles.segmented}>
          {[{ v: '1', l: 'Annual' }, { v: '2', l: 'Semi' }, { v: '4', l: 'Quarterly' }, { v: '12', l: 'Monthly' }].map(opt => (
            <TouchableOpacity
              key={opt.v}
              style={[styles.segment, form.paymentFreq === opt.v && styles.segmentSelected]}
              onPress={() => setForm(f => ({ ...f, paymentFreq: opt.v }))}
            >
              <Text style={[styles.segmentText, form.paymentFreq === opt.v && styles.segmentTextSelected]}>{opt.l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.calcButton} onPress={handleCalculate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.calcButtonText}>Calculate Premium</Text>}
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultHeading}>Premium Estimate</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Annual Premium</Text>
            <Text style={styles.resultValue}>₹{result.stdPremAf?.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Instalment Premium</Text>
            <Text style={styles.resultValueLarge}>₹{result.installPrem?.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Sum Assured</Text>
            <Text style={styles.resultValue}>₹{result.sumAssured?.toLocaleString('en-IN')}</Text>
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => navigation.navigate('ApplicationForm', {
              quoteResult: result,
              quoteForm: form,
            })}
          >
            <Text style={styles.applyButtonText}>Proceed to Apply</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.grey100 },
  formCard: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.navy,
    marginBottom: theme.spacing[4],
  },
  fieldRow: { flexDirection: 'row', gap: theme.spacing[3] },
  fieldHalf: { flex: 1 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.grey600,
    marginBottom: theme.spacing[2],
    marginTop: theme.spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.grey300,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing[3],
    fontSize: 15,
    color: theme.colors.grey900,
  },
  segmented: { flexDirection: 'row', gap: theme.spacing[2], flexWrap: 'wrap' },
  segment: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.grey300,
  },
  segmentSelected: {
    backgroundColor: theme.colors.tealLight,
    borderColor: theme.colors.tealPrimary,
  },
  segmentText: { fontSize: 13, color: theme.colors.grey600 },
  segmentTextSelected: { color: theme.colors.tealDark, fontWeight: '600' },
  calcButton: {
    backgroundColor: theme.colors.tealPrimary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    alignItems: 'center',
    marginTop: theme.spacing[5],
  },
  calcButtonText: { color: theme.colors.white, fontWeight: '600', fontSize: 16 },
  resultCard: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing[4],
    marginTop: 0,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    borderTopWidth: 4,
    borderTopColor: theme.colors.tealPrimary,
  },
  resultHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.navy,
    marginBottom: theme.spacing[4],
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey100,
  },
  resultLabel: { fontSize: 14, color: theme.colors.grey600 },
  resultValue: { fontSize: 14, fontWeight: '600', color: theme.colors.navy },
  resultValueLarge: { fontSize: 20, fontWeight: '700', color: theme.colors.tealPrimary },
  applyButton: {
    backgroundColor: theme.colors.tealPrimary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    alignItems: 'center',
    marginTop: theme.spacing[5],
  },
  applyButtonText: { color: theme.colors.white, fontWeight: '600', fontSize: 16 },
});
