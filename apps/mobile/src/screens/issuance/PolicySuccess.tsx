import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../theme';

export default function PolicySuccess() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { policyNumber, transactionId, maskedCard, amount } = params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Success Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>✓</Text>
      </View>

      <Text style={styles.heading}>Policy Issued!</Text>
      <Text style={styles.subheading}>Your policy has been successfully created.</Text>

      {/* Policy Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.cardTitle}>Policy Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Policy Number</Text>
          <Text style={styles.valueBold}>{policyNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Premium Paid</Text>
          <Text style={styles.value}>₹{amount?.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Card</Text>
          <Text style={styles.value}>{maskedCard}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Transaction ID</Text>
          <Text style={[styles.value, { fontSize: 11 }]}>{transactionId}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => navigation.navigate('PolicyDetail', { policyNumber })}
      >
        <Text style={styles.viewButtonText}>View Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.homeButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.grey100,
    alignItems: 'center',
    padding: theme.spacing[6],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing[8],
    marginBottom: theme.spacing[4],
  },
  icon: { fontSize: 40, color: theme.colors.white, fontWeight: '700' },
  heading: { fontSize: 26, fontWeight: '700', color: theme.colors.navy, textAlign: 'center' },
  subheading: {
    fontSize: 14,
    color: theme.colors.grey600,
    textAlign: 'center',
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[6],
  },
  detailsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    width: '100%',
    marginBottom: theme.spacing[4],
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.navy, marginBottom: theme.spacing[4] },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey100,
  },
  label: { fontSize: 13, color: theme.colors.grey600 },
  value: { fontSize: 13, color: theme.colors.navy },
  valueBold: { fontSize: 15, fontWeight: '700', color: theme.colors.tealPrimary },
  viewButton: {
    backgroundColor: theme.colors.tealPrimary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  viewButtonText: { color: theme.colors.white, fontWeight: '600', fontSize: 16 },
  homeButton: {
    borderWidth: 1.5,
    borderColor: theme.colors.tealPrimary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    width: '100%',
    alignItems: 'center',
  },
  homeButtonText: { color: theme.colors.tealPrimary, fontWeight: '600', fontSize: 16 },
});
