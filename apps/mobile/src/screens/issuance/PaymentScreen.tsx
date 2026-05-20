import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../theme';
import { API_BASE } from '../../config/api';
import { useAuthStore } from '../../store/authStore';

// Test card shortcuts shown only in non-production builds
const TEST_CARDS = [
  { label: 'Success',        number: '4111 1111 1111 1111' },
  { label: 'Declined',       number: '4000 0000 0000 0002' },
  { label: 'Pending (3DS)',  number: '4000 0000 0000 3220' },
  { label: 'Fraud Blocked',  number: '4100 0000 0000 0001' },
];

export default function PaymentScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { token } = useAuthStore();
  const { proposalNumber, installPrem, currency } = params;

  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'verifying' | 'done'>('input');

  const handlePay = async () => {
    if (!card.number || !card.expiry || !card.cvv || !card.name) {
      Alert.alert('Validation', 'Please fill all card details.');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Initiate payment
      const initRes = await fetch(`${API_BASE}/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          proposalNumber,
          amount: Math.round(installPrem * 100),   // convert to paise
          currency: 'INR',
          cardNumber: card.number,
          cardExpiry: card.expiry,
          cardCvv: card.cvv,
          cardholderName: card.name,
        }),
      }).then(r => r.json());

      if (initRes.status === 'DECLINED' || initRes.status === 'FAILED') {
        Alert.alert('Payment Failed', initRes.message);
        return;
      }

      setStep('verifying');

      // Step 2: Verify + Issue (handles PENDING / 3DS automatically)
      const issueRes = await fetch(`${API_BASE}/payments/verify-and-issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          transactionId: initRes.transactionId,
          proposalNumber,
          feeAmount: installPrem,
          currency,
        }),
      }).then(r => r.json());

      if (issueRes.error) {
        Alert.alert('Issuance Failed', issueRes.message);
        return;
      }

      setStep('done');
      navigation.navigate('PolicySuccess', {
        policyNumber:  issueRes.policy.policyNumber,
        transactionId: initRes.transactionId,
        maskedCard:    initRes.maskedCard,
        amount:        installPrem,
      });

    } catch (e: any) {
      Alert.alert('Network Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Pay Premium</Text>
        <Text style={styles.amount}>₹{installPrem?.toLocaleString('en-IN')}</Text>
        <Text style={styles.subtext}>Proposal: {proposalNumber}</Text>
      </View>

      {/* Card form */}
      <View style={styles.cardForm}>
        <Text style={styles.cardFormTitle}>Card Details</Text>
        <TextInput
          placeholder="Card Number"
          value={card.number}
          onChangeText={v => setCard(c => ({ ...c, number: v }))}
          keyboardType="numeric"
          maxLength={19}
          style={styles.input}
        />
        <View style={styles.row}>
          <TextInput
            placeholder="MM/YY"
            value={card.expiry}
            onChangeText={v => setCard(c => ({ ...c, expiry: v }))}
            maxLength={5}
            style={[styles.input, { flex: 1 }]}
          />
          <TextInput
            placeholder="CVV"
            value={card.cvv}
            onChangeText={v => setCard(c => ({ ...c, cvv: v }))}
            secureTextEntry
            maxLength={4}
            style={[styles.input, { flex: 1 }]}
          />
        </View>
        <TextInput
          placeholder="Cardholder Name"
          value={card.name}
          onChangeText={v => setCard(c => ({ ...c, name: v }))}
          style={styles.input}
        />
      </View>

      {/* Test card shortcuts — dev/staging only */}
      {process.env.NODE_ENV !== 'production' && (
        <View style={styles.testCards}>
          <Text style={styles.testLabel}>Test Cards (Dev Only)</Text>
          {TEST_CARDS.map(tc => (
            <TouchableOpacity
              key={tc.number}
              style={styles.testCardItem}
              onPress={() => setCard(c => ({ ...c, number: tc.number, expiry: '12/29', cvv: '123' }))}
            >
              <Text style={styles.testCardLabel}>{tc.label}</Text>
              <Text style={styles.testCardNumber}>{tc.number}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.payButton, loading && { opacity: 0.6 }]}
        onPress={handlePay}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payButtonText}>
            {step === 'verifying' ? 'Verifying...' : `Pay ₹${installPrem?.toLocaleString('en-IN')}`}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.grey100 },
  header: {
    backgroundColor: theme.colors.tealPrimary,
    padding: theme.spacing[6],
    alignItems: 'center',
  },
  heading: { fontSize: 16, color: theme.colors.tealLight },
  amount: { fontSize: 36, fontWeight: '700', color: theme.colors.white, marginTop: theme.spacing[2] },
  subtext: { fontSize: 12, color: theme.colors.tealLight, marginTop: theme.spacing[1] },
  cardForm: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    gap: theme.spacing[3],
  },
  cardFormTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.navy, marginBottom: theme.spacing[2] },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.grey300,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing[3],
    fontSize: 15,
    color: theme.colors.grey900,
  },
  row: { flexDirection: 'row', gap: theme.spacing[3] },
  testCards: {
    backgroundColor: '#FFF9E6',
    marginHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  testLabel: { fontSize: 12, fontWeight: '700', color: theme.colors.warning, marginBottom: theme.spacing[3] },
  testCardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  testCardLabel: { fontSize: 12, color: theme.colors.grey600, width: 110 },
  testCardNumber: { fontSize: 12, color: theme.colors.navy, fontFamily: 'monospace' },
  payButton: {
    backgroundColor: theme.colors.tealPrimary,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing[4],
    padding: theme.spacing[5],
    alignItems: 'center',
  },
  payButtonText: { color: theme.colors.white, fontWeight: '700', fontSize: 18 },
});
