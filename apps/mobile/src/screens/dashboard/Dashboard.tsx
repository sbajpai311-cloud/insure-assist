import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/authStore';

const KPI_CARDS = [
  { label: 'Policies This Month', value: '12', color: theme.colors.tealPrimary },
  { label: 'Pending Applications', value: '3', color: theme.colors.warning },
  { label: 'Total Premium', value: '₹1.2L', color: theme.colors.success },
];

const QUICK_ACTIONS = [
  { label: 'New FNA', screen: 'FNA', icon: '📋' },
  { label: 'Get Quote', screen: 'QuoteCalculator', icon: '💰' },
  { label: 'Wellness', screen: 'Wellness', icon: '❤️' },
  { label: 'My Policies', screen: 'PolicyDetail', icon: '📄' },
];

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { agent } = useAuthStore();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning,</Text>
        <Text style={styles.agentName}>{agent?.name ?? 'Agent'}</Text>
        <Text style={styles.subtitle}>InsureAssist — Powered by SC</Text>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiRow}>
        {KPI_CARDS.map(kpi => (
          <View key={kpi.label} style={[styles.kpiCard, { borderTopColor: kpi.color }]}>
            <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
            <Text style={styles.kpiLabel}>{kpi.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {QUICK_ACTIONS.map(action => (
          <TouchableOpacity
            key={action.label}
            style={styles.actionCard}
            onPress={() => navigation.navigate(action.screen)}
          >
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Start FNA CTA */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => navigation.navigate('FNA')}
      >
        <Text style={styles.ctaText}>Start New FNA with Customer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.grey100,
  },
  header: {
    backgroundColor: theme.colors.tealPrimary,
    padding: theme.spacing[6],
    paddingTop: theme.spacing[8],
    paddingBottom: theme.spacing[8],
  },
  greeting: {
    fontSize: 14,
    color: theme.colors.tealLight,
  },
  agentName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
    marginTop: theme.spacing[1],
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.tealLight,
    marginTop: theme.spacing[1],
    opacity: 0.8,
  },
  kpiRow: {
    flexDirection: 'row',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  kpiCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  kpiLabel: {
    fontSize: 11,
    color: theme.colors.grey600,
    marginTop: theme.spacing[1],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.navy,
    paddingHorizontal: theme.spacing[4],
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[3],
  },
  actionCard: {
    width: '47%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: theme.spacing[2],
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.navy,
    textAlign: 'center',
  },
  ctaButton: {
    margin: theme.spacing[4],
    marginTop: theme.spacing[6],
    backgroundColor: theme.colors.tealPrimary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    alignItems: 'center',
  },
  ctaText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
