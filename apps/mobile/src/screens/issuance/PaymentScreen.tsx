import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../theme';
import { API_BASE } from '../../config/api';
import { useAuthStore } from '../../store/authStore';

type PaymentMethod = 'card' | 'netbanking' | 'upi' | 'cash' | 'alipay' | 'wechat';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'card',       label: 'Credit / Debit Card', icon: '💳' },
  { id: 'netbanking', label: 'Net Banking',          icon: '🏦' },
  { id: 'upi',        label: 'UPI',                  icon: '📱' },
  { id: 'cash',       label: 'Cash',                 icon: '💵' },
  { id: 'alipay',     label: 'Alipay',               icon: '🔵' },
  { id: 'wechat',     label: 'WeChat Pay',           icon: '🟢' },
];

const TEST_CARDS = [
  { label: 'Success',       number: '4111 1111 1111 1111' },
  { label: 'Declined',      number: '4000 0000 0000 0002' },
  { label: 'Pending (3DS)', number: '4000 0000 0000 3220' },
  { label: 'Fraud Block',   number: '4100 0000 0000 0001' },
];

const BANKS = ['State Bank of India', 'HDFC Bank', 'ICBC Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'];

export default function PaymentScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { token } = useAuthStore();
  const { proposalNumber, installPrem, currency } = params;

  const [method, setMethod] = useState<PaymentMethod>('card');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');
  const [bank, setBank] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'verifying'>('input');

  const getMockCardForMethod = (): typeof card => {
    // Non-card methods use a virtual card behind the scenes (mock only)
    return { number: '4111111111111111', expiry: '12/29', cvv: '123', name: 'Agent User' };
  };

  const handlePay = async () => {
    // Validate per method
    if (method === 'card' && (!card.number || !card.expiry || !card.cvv || !card.name)) {
      Alert.alert('Validation', 'Please fill all card details.');
      return;
    }
    if (method === 'upi' && !upiId) {
      Alert.alert('Validation', 'Please enter your UPI ID.');
      return;
    }
    if (method === 'netbanking' && !bank) {
      Alert.alert('Validation', 'Please select your bank.');
      return;
    }

    const cardPayload = method === 'card' ? card : getMockCardForMethod();

    setLoading(true);
    try {
      // Step 1: Initiate payment
      const initRes = await fetch(`${API_BASE}/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          proposalNumber,
          amount: Math.round(installPrem * 100),
          currency: 'INR',
          cardNumber: cardPayload.number.replace(/\s/g, ''),
          cardExpiry: cardPayload.expiry,
          cardCvv: cardPayload.cvv,
          cardholderName: cardPayload.name,
          paymentMethod: method,
        }),
      }).then(r => r.json());

      if (initRes.error) {
        Alert.alert('Payment Error', initRes.message ?? 'Payment initiation failed.');
        return;
      }
      if (initRes.status === 'DECLINED' || initRes.status === 'FAILED') {
        Alert.alert('Payment Failed', initRes.message);
        return;
      }

      setStep('verifying');

      // Step 2: Verify + Issue
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
        Alert.alert('Issuance Failed', issueRes.message ?? 'Policy issuance failed.');
        return;
      }

      navigation.navigate('PolicySuccess', {
        policyNumber:  issueRes.policy?.policyNumber,
        transactionId: initRes.transactionId,
        maskedCard:    initRes.maskedCard,
        amount:        installPrem,
      });

    } catch (e: any) {
      Alert.alert('Network Error', e.message);
    } finally {
      setLoading(false);
      setStep('input');
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Pay Premium</Text>
        <Text style={styles.amount}>₹{installPrem?.toLocaleString('en-IN')}</Text>
        <Text style={styles.subtext}>Proposal: {proposalNumber}</Text>
      </View>

      {/* Payment Method Selector */}
      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.methodGrid}>
        {PAYMENT_METHODS.map(m => (
          <TouchableOpacity
            key={m.id}
            style={[styles.methodCard, method === m.id && styles.methodCardSelected]}
            onPress={() => setMethod(m.id)}
          >
            <Text style={styles.methodIcon}>{m.icon}</Text>
            <Text style={[styles.methodLabel, method === m.id && styles.methodLabelSelected]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Card Form */}
      {method === 'card' && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Card Details</Text>
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
          {process.env.NODE_ENV !== 'production' && (
            <View style={styles.testCards}>
              <Text style={styles.testLabel}>Test Cards</Text>
              {TEST_CARDS.map(tc => (
                <TouchableOpacity
                  key={tc.number}
                  style={styles.testCardItem}
                  onPress={() => setCard({ number: tc.number, expiry: '12/29', cvv: '123', name: 'Test User' })}
                >
                  <Text style={styles.testCardLabel}>{tc.label}</Text>
                  <Text style={styles.testCardNumber}>{tc.number}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* UPI Form */}
      {method === 'upi' && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>UPI Payment</Text>
          <TextInput
            placeholder="Enter UPI ID (e.g. name@upi)"
            value={upiId}
            onChangeText={setUpiId}
            autoCapitalize="none"
            style={styles.input}
          />
          <Text style={styles.hint}>You will receive a payment request on your UPI app</Text>
        </View>
      )}

      {/* Net Banking Form */}
      {method === 'netbanking' && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Select Bank</Text>
          {BANKS.map(b => (
            <TouchableOpacity
              key={b}
              style={[styles.bankRow, bank === b && styles.bankRowSelected]}
              onPress={() => setBank(b)}
            >
              <Text style={[styles.bankName, bank === b && styles.bankNameSelected]}>🏦 {b}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Cash */}
      {method === 'cash' && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Cash Payment</Text>
          <Text style={styles.hint}>Agent will collect ₹{installPrem?.toLocaleString('en-IN')} in cash from the customer and confirm the payment.</Text>
        </View>
      )}

      {/* Alipay */}
      {method === 'alipay' && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Alipay</Text>
          <Text style={styles.hint}>Customer will be redirected to Alipay to complete payment of ₹{installPrem?.toLocaleString('en-IN')}.</Text>
        </View>
      )}

      {/* WeChat Pay */}
      {method === 'wechat' && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>WeChat Pay</Text>
          <Text style={styles.hint}>Customer will scan a WeChat Pay QR code to complete payment of ₹{installPrem?.toLocaleString('en-IN')}.</Text>
        </View>
      )}

      {/* Pay Button */}
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
  heading:  { fontSize: 16, color: theme.colors.tealLight },
  amount:   { fontSize: 36, fontWeight: '700', color: theme.colors.white, marginTop: theme.spacing[2] },
  subtext:  { fontSize: 12, color: theme.colors.tealLight, marginTop: theme.spacing[1] },
  sectionTitle: {
    fontSize: 14, fontWeight: '700', color: theme.colors.navy,
    margin: theme.spacing[4], marginBottom: theme.spacing[2],
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  methodGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: theme.spacing[4], gap: theme.spacing[3],
  },
  methodCard: {
    width: '47%', backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md, padding: theme.spacing[4],
    alignItems: 'center', borderWidth: 1.5, borderColor: theme.colors.grey300,
  },
  methodCardSelected: { borderColor: theme.colors.tealPrimary, backgroundColor: theme.colors.tealLight },
  methodIcon:  { fontSize: 24, marginBottom: theme.spacing[2] },
  methodLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.grey600, textAlign: 'center' },
  methodLabelSelected: { color: theme.colors.tealDark },
  formCard: {
    backgroundColor: theme.colors.white, margin: theme.spacing[4],
    borderRadius: theme.borderRadius.lg, padding: theme.spacing[5], gap: theme.spacing[3],
  },
  formTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.navy, marginBottom: theme.spacing[1] },
  input: {
    borderWidth: 1, borderColor: theme.colors.grey300,
    borderRadius: theme.borderRadius.sm, padding: theme.spacing[3],
    fontSize: 15, color: theme.colors.grey900,
  },
  row: { flexDirection: 'row', gap: theme.spacing[3] },
  hint: { fontSize: 13, color: theme.colors.grey600, lineHeight: 20 },
  testCards: {
    backgroundColor: '#FFF9E6', borderRadius: theme.borderRadius.sm,
    padding: theme.spacing[3], borderWidth: 1, borderColor: '#FDE68A',
  },
  testLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.warning, marginBottom: theme.spacing[2] },
  testCardItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: theme.spacing[2], borderBottomWidth: 1, borderBottomColor: '#FDE68A',
  },
  testCardLabel:  { fontSize: 11, color: theme.colors.grey600, width: 100 },
  testCardNumber: { fontSize: 11, color: theme.colors.navy },
  bankRow: {
    padding: theme.spacing[3], borderRadius: theme.borderRadius.sm,
    borderWidth: 1, borderColor: theme.colors.grey300,
  },
  bankRowSelected: { borderColor: theme.colors.tealPrimary, backgroundColor: theme.colors.tealLight },
  bankName: { fontSize: 14, color: theme.colors.grey900 },
  bankNameSelected: { color: theme.colors.tealDark, fontWeight: '600' },
  payButton: {
    backgroundColor: theme.colors.tealPrimary, borderRadius: theme.borderRadius.md,
    margin: theme.spacing[4], padding: theme.spacing[5], alignItems: 'center',
  },
  payButtonText: { color: theme.colors.white, fontWeight: '700', fontSize: 18 },
});
