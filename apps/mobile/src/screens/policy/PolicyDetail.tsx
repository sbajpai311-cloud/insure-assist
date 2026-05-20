import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { theme } from '../../theme';
import { API_BASE } from '../../config/api';
import { useAuthStore } from '../../store/authStore';

export default function PolicyDetail() {
  const { params } = useRoute<any>();
  const { token } = useAuthStore();
  const { policyNumber } = params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/policy/${policyNumber}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setData)
      .catch(e => Alert.alert('Error', e.message))
      .finally(() => setLoading(false));
  }, [policyNumber]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.tealPrimary} />
        <Text style={styles.loadingText}>Loading policy details...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Unable to load policy {policyNumber}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.policyNum}>{policyNumber}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coverage Details</Text>
        <DetailRow label="Coverage No" value={data.coverageNo ?? '—'} />
        <DetailRow label="Insured Party ID" value={data.insuredPartyId ?? '—'} />
        {data.raw?.coverages?.[0] && (
          <>
            <DetailRow label="Product Code" value={data.raw.coverages[0].productCode ?? '—'} />
            <DetailRow label="Coverage Period" value={`${data.raw.coverages[0].coverageYear ?? '—'} years`} />
            <DetailRow label="Sum Assured" value={data.raw.coverages[0].sumAssured ? `₹${data.raw.coverages[0].sumAssured.toLocaleString('en-IN')}` : '—'} />
          </>
        )}
      </View>

      {data.raw?.customers?.[0] && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Policy Holder</Text>
          <DetailRow label="Name" value={`${data.raw.customers[0].person?.firstName ?? ''} ${data.raw.customers[0].person?.lastName ?? ''}`} />
          <DetailRow label="Mobile" value={data.raw.customers[0].partyContact?.mobileTel ?? '—'} />
          <DetailRow label="Email" value={data.raw.customers[0].partyContact?.email ?? '—'} />
        </View>
      )}
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.grey100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing[6] },
  loadingText: { marginTop: theme.spacing[4], color: theme.colors.grey600 },
  errorText: { color: theme.colors.error, textAlign: 'center' },
  header: {
    backgroundColor: theme.colors.tealPrimary,
    padding: theme.spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  policyNum: { fontSize: 20, fontWeight: '700', color: theme.colors.white },
  statusBadge: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
  },
  statusText: { fontSize: 12, fontWeight: '700', color: theme.colors.white },
  card: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.navy, marginBottom: theme.spacing[4] },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey100,
  },
  detailLabel: { fontSize: 13, color: theme.colors.grey600 },
  detailValue: { fontSize: 13, fontWeight: '600', color: theme.colors.navy, maxWidth: '60%', textAlign: 'right' },
});
