import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../theme';
import { API_BASE } from '../../config/api';
import { useAuthStore } from '../../store/authStore';

export default function ApplicationForm() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { token } = useAuthStore();
  const { quoteResult, quoteForm } = params;

  const [form, setForm] = useState({
    holderFirstName: '',
    holderLastName: '',
    holderGender: quoteForm?.gender ?? 'M',
    holderDOB: quoteForm?.birthdate ?? '',
    holderSmoking: false,
    insuredFirstName: '',
    insuredLastName: '',
    insuredGender: quoteForm?.gender ?? 'M',
    insuredDOB: quoteForm?.birthdate ?? '',
    insuredSmoking: false,
    mobile: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    postCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [sameAsHolder, setSameAsHolder] = useState(true);

  const handleSubmit = async () => {
    if (!form.holderFirstName || !form.mobile || !form.email || !form.address1 || !form.city || !form.postCode) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }

    setLoading(true);
    try {
      const body = {
        ...form,
        insuredFirstName: sameAsHolder ? form.holderFirstName : form.insuredFirstName,
        insuredLastName: sameAsHolder ? form.holderLastName : form.insuredLastName,
        insuredGender: sameAsHolder ? form.holderGender : form.insuredGender,
        insuredDOB: sameAsHolder ? form.holderDOB : form.insuredDOB,
        insuredSmoking: sameAsHolder ? form.holderSmoking : form.insuredSmoking,
        sumAssured: parseFloat(quoteForm.sumAssured),
        coverageYear: parseInt(quoteForm.coverageYear),
        chargeYear: parseInt(quoteForm.chargeYear),
      };

      const res = await fetch(`${API_BASE}/issue/application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      }).then(r => r.json());

      if (res.error) {
        Alert.alert('Application Error', res.message ?? res.error);
        return;
      }

      navigation.navigate('Payment', {
        proposalNumber: res.proposalNumber,
        installPrem: res.installPrem,
        currency: res.currency,
      });
    } catch (e: any) {
      Alert.alert('Network Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Policy Holder Details</Text>
        <TextInput style={styles.input} placeholder="First Name *" value={form.holderFirstName} onChangeText={v => update('holderFirstName', v)} />
        <TextInput style={styles.input} placeholder="Last Name *" value={form.holderLastName} onChangeText={v => update('holderLastName', v)} />
        <TextInput style={styles.input} placeholder="Date of Birth (YYYY-MM-DD) *" value={form.holderDOB} onChangeText={v => update('holderDOB', v)} />
        <TextInput style={styles.input} placeholder="Mobile *" keyboardType="phone-pad" value={form.mobile} onChangeText={v => update('mobile', v)} />
        <TextInput style={styles.input} placeholder="Email *" keyboardType="email-address" value={form.email} onChangeText={v => update('email', v)} />
        <TextInput style={styles.input} placeholder="Address Line 1 *" value={form.address1} onChangeText={v => update('address1', v)} />
        <TextInput style={styles.input} placeholder="Address Line 2" value={form.address2} onChangeText={v => update('address2', v)} />
        <TextInput style={styles.input} placeholder="City *" value={form.city} onChangeText={v => update('city', v)} />
        <TextInput style={styles.input} placeholder="PIN Code *" keyboardType="numeric" value={form.postCode} onChangeText={v => update('postCode', v)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insured Person</Text>
        <TouchableOpacity
          style={[styles.toggleButton, sameAsHolder && styles.toggleButtonActive]}
          onPress={() => setSameAsHolder(!sameAsHolder)}
        >
          <Text style={[styles.toggleText, sameAsHolder && styles.toggleTextActive]}>
            {sameAsHolder ? '✓ Same as Policy Holder' : 'Different from Policy Holder'}
          </Text>
        </TouchableOpacity>

        {!sameAsHolder && (
          <>
            <TextInput style={styles.input} placeholder="Insured First Name" value={form.insuredFirstName} onChangeText={v => update('insuredFirstName', v)} />
            <TextInput style={styles.input} placeholder="Insured Last Name" value={form.insuredLastName} onChangeText={v => update('insuredLastName', v)} />
            <TextInput style={styles.input} placeholder="Insured DOB (YYYY-MM-DD)" value={form.insuredDOB} onChangeText={v => update('insuredDOB', v)} />
          </>
        )}
      </View>

      {/* Quote Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Quote Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Product</Text>
          <Text style={styles.summaryValue}>GTR1 — Life Term</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sum Assured</Text>
          <Text style={styles.summaryValue}>₹{parseFloat(quoteForm?.sumAssured ?? '0').toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Instalment Premium</Text>
          <Text style={styles.summaryValueBold}>₹{quoteResult?.installPrem?.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit Application</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.grey100 },
  section: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    gap: theme.spacing[3],
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.navy,
    marginBottom: theme.spacing[2],
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.grey300,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing[3],
    fontSize: 15,
    color: theme.colors.grey900,
  },
  toggleButton: {
    borderWidth: 1.5,
    borderColor: theme.colors.grey300,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    alignItems: 'center',
  },
  toggleButtonActive: {
    borderColor: theme.colors.tealPrimary,
    backgroundColor: theme.colors.tealLight,
  },
  toggleText: { fontSize: 14, color: theme.colors.grey600 },
  toggleTextActive: { color: theme.colors.tealDark, fontWeight: '600' },
  summaryCard: {
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.goldAccent,
  },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.navy, marginBottom: theme.spacing[3] },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing[2] },
  summaryLabel: { fontSize: 13, color: theme.colors.grey600 },
  summaryValue: { fontSize: 13, color: theme.colors.navy },
  summaryValueBold: { fontSize: 15, fontWeight: '700', color: theme.colors.tealPrimary },
  submitButton: {
    backgroundColor: theme.colors.tealPrimary,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing[4],
    padding: theme.spacing[5],
    alignItems: 'center',
  },
  submitButtonText: { color: theme.colors.white, fontWeight: '600', fontSize: 16 },
});
