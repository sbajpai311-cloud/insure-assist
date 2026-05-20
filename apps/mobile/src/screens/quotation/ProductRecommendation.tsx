import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFNAStore } from '../../store/fnaStore';
import { theme } from '../../theme';
import { generateRecommendations } from '../../../../services/bff/src/engines/fna-recommender';

// Fallback inline recommender (identical logic) so mobile bundle is self-contained
function getRecommendations(fna: any) {
  const recs: any[] = [];
  const humanLifeValue = fna.monthlyIncome * 12 * ((fna.retirementAge ?? 60) - fna.age);
  const lifeCoverGap = Math.max(0, humanLifeValue - (fna.existingLifeCover ?? 0));

  if (lifeCoverGap > 500000) {
    recs.push({
      productType: 'LIFE_TERM',
      productCode: 'GTR1',
      priority: 1,
      rationale: `Life cover gap of ₹${lifeCoverGap.toLocaleString('en-IN')}. Recommended sum assured: ₹${(Math.ceil(lifeCoverGap / 100000) * 100000).toLocaleString('en-IN')}.`,
      suggestedSA: Math.ceil(lifeCoverGap / 100000) * 100000,
      suggestedTerm: (fna.retirementAge ?? 60) - fna.age,
    });
  }

  const hasHealthGap = (fna.existingHealthCover ?? 0) < 300000;
  if (hasHealthGap || fna.preExistingConditions || fna.familyHistory) {
    const bundleId = (fna.monthlyIncome ?? 0) > 50000 ? 'WB2' : 'WB1';
    recs.push({
      productType: 'HEALTH_BUNDLE',
      productCode: 'HALB',
      bundleId,
      priority: hasHealthGap ? 1 : 2,
      rationale: 'Health cover gap detected. Includes annual health check-up, OPD consults, and wellness services.',
    });
  }

  return recs.sort((a, b) => a.priority - b.priority);
}

const PRODUCT_LABELS: Record<string, string> = {
  LIFE_TERM: 'Life Term Insurance',
  HEALTH_BUNDLE: 'Health & Wellness Bundle',
  PERSONAL_ACCIDENT: 'Personal Accident Cover',
  WELLNESS: 'Wellness Bundle',
};

const PRODUCT_ICONS: Record<string, string> = {
  LIFE_TERM: '🛡️',
  HEALTH_BUNDLE: '🏥',
  PERSONAL_ACCIDENT: '⚕️',
  WELLNESS: '💪',
};

export default function ProductRecommendation() {
  const navigation = useNavigation<any>();
  const { fnaData } = useFNAStore();
  const recommendations = getRecommendations(fnaData);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Your Personalised Plan</Text>
        <Text style={styles.subheading}>Based on your financial profile</Text>
      </View>

      {recommendations.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Please complete the FNA wizard to see recommendations.</Text>
        </View>
      ) : (
        recommendations.map((rec, idx) => (
          <View key={`${rec.productCode}${rec.bundleId ?? ''}`} style={styles.recCard}>
            <View style={styles.recCardHeader}>
              <Text style={styles.recIcon}>{PRODUCT_ICONS[rec.productType] ?? '📋'}</Text>
              <View style={styles.recTitleBlock}>
                <Text style={styles.recTitle}>{PRODUCT_LABELS[rec.productType]}</Text>
                {rec.bundleId && (
                  <View style={styles.bundleBadge}>
                    <Text style={styles.bundleBadgeText}>{rec.bundleId}</Text>
                  </View>
                )}
              </View>
              <View style={[styles.priorityBadge, rec.priority === 1 && styles.priorityBadgeHigh]}>
                <Text style={styles.priorityText}>P{rec.priority}</Text>
              </View>
            </View>
            <Text style={styles.rationale}>{rec.rationale}</Text>

            {rec.suggestedSA && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Suggested Cover</Text>
                <Text style={styles.detailValue}>₹{rec.suggestedSA.toLocaleString('en-IN')}</Text>
              </View>
            )}
            {rec.suggestedTerm && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Term</Text>
                <Text style={styles.detailValue}>{rec.suggestedTerm} years</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.quoteButton}
              onPress={() => navigation.navigate('QuoteCalculator', { rec })}
            >
              <Text style={styles.quoteButtonText}>Get Quote</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* Wellness Bundle Catalogue CTA */}
      <TouchableOpacity
        style={styles.wellnessCta}
        onPress={() => navigation.navigate('Wellness')}
      >
        <Text style={styles.wellnessCtaIcon}>❤️</Text>
        <View>
          <Text style={styles.wellnessCtaTitle}>Explore Wellness Bundles</Text>
          <Text style={styles.wellnessCtaSubtitle}>WB1 from ₹35/mo · WB2 from ₹57/mo</Text>
        </View>
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
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.white,
  },
  subheading: {
    fontSize: 14,
    color: theme.colors.tealLight,
    marginTop: theme.spacing[1],
  },
  emptyState: {
    padding: theme.spacing[8],
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.grey600,
    textAlign: 'center',
  },
  recCard: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  recCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  recIcon: {
    fontSize: 28,
    marginRight: theme.spacing[3],
  },
  recTitleBlock: {
    flex: 1,
  },
  recTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.navy,
  },
  bundleBadge: {
    backgroundColor: theme.colors.tealLight,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
    marginTop: theme.spacing[1],
    alignSelf: 'flex-start',
  },
  bundleBadgeText: {
    fontSize: 11,
    color: theme.colors.tealDark,
    fontWeight: '600',
  },
  priorityBadge: {
    backgroundColor: theme.colors.grey100,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  priorityBadgeHigh: {
    backgroundColor: '#FEF3C7',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.warning,
  },
  rationale: {
    fontSize: 13,
    color: theme.colors.grey600,
    lineHeight: 20,
    marginBottom: theme.spacing[3],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[2],
    borderTopWidth: 1,
    borderTopColor: theme.colors.grey100,
  },
  detailLabel: {
    fontSize: 13,
    color: theme.colors.grey600,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.navy,
  },
  quoteButton: {
    backgroundColor: theme.colors.tealPrimary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    alignItems: 'center',
    marginTop: theme.spacing[4],
  },
  quoteButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  wellnessCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    margin: theme.spacing[4],
    marginTop: 0,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.tealPrimary,
    gap: theme.spacing[4],
  },
  wellnessCtaIcon: {
    fontSize: 32,
  },
  wellnessCtaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.navy,
  },
  wellnessCtaSubtitle: {
    fontSize: 13,
    color: theme.colors.grey600,
    marginTop: 2,
  },
});
