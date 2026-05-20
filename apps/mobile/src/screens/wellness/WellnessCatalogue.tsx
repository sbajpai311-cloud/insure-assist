import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { API_BASE } from '../../config/api';
import { useAuthStore } from '../../store/authStore';

const WELLNESS_BUNDLES = [
  {
    id: 'WB1',
    name: 'Wellness Basic',
    price: 35,
    features: [
      'Annual Health Check-Up (78 parameters)',
      'Home Visit Option',
      'Health Risk Assessment',
      'Dedicated Booking Support',
    ],
    tag: 'Most Popular',
    tagColor: theme.colors.tealPrimary,
  },
  {
    id: 'WB2',
    name: 'Wellness Premium',
    price: 57,
    features: [
      'All Basic features',
      'F2F OPD Consults — General Physician',
      'Zumba Class Membership',
      'Doctor on Demand',
      'Exclusive Platform Discounts',
    ],
    tag: 'Recommended',
    tagColor: theme.colors.goldAccent,
  },
  {
    id: 'WB3',
    name: 'Wellness Premium + Insurance',
    price: null,
    features: [
      'All Premium features',
      'Life Insurance (Pramerica)',
      'Personal Accident Cover',
      'Accidental Death Benefit',
    ],
    tag: 'Complete Protection',
    tagColor: theme.colors.navy,
  },
];

export default function WellnessCatalogue() {
  const navigation = useNavigation<any>();
  const { token } = useAuthStore();
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);

  const handleEnroll = async (bundleId: string) => {
    // Navigate to product recommendation / application for HALB
    Alert.alert(
      `Enroll in ${bundleId}`,
      'This will proceed to the HALB health bundle application. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: () => navigation.navigate('ApplicationForm', {
            quoteResult: { bundleId, productCode: 'HALB' },
            quoteForm: { productType: 'HEALTH_BUNDLE', bundleId },
          }),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.heading}>Wellness Bundles</Text>
        <Text style={styles.subheading}>Health & lifestyle protection for your customers</Text>
      </View>

      {/* UW Rule notice */}
      <View style={styles.uwNote}>
        <Text style={styles.uwNoteText}>Eligibility: Age 18–65 years (UW Rule: STDHLTH_InsuredCount)</Text>
      </View>

      {WELLNESS_BUNDLES.map(bundle => (
        <View key={bundle.id} style={[styles.bundleCard, selectedBundle === bundle.id && styles.bundleCardSelected]}>
          {/* Tag */}
          <View style={[styles.tag, { backgroundColor: bundle.tagColor }]}>
            <Text style={styles.tagText}>{bundle.tag}</Text>
          </View>

          <View style={styles.bundleHeader}>
            <Text style={styles.bundleId}>{bundle.id}</Text>
            <View>
              <Text style={styles.bundleName}>{bundle.name}</Text>
              {bundle.price ? (
                <Text style={styles.bundlePrice}>₹{bundle.price}/month</Text>
              ) : (
                <Text style={styles.bundlePrice}>Pricing on request</Text>
              )}
            </View>
          </View>

          {/* Features */}
          <View style={styles.features}>
            {bundle.features.map(f => (
              <View key={f} style={styles.featureRow}>
                <Text style={styles.featureCheck}>✓</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.enrollButton, { backgroundColor: bundle.tagColor }]}
            onPress={() => handleEnroll(bundle.id)}
          >
            <Text style={styles.enrollButtonText}>Enroll Customer</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Benefits overview */}
      <View style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>Standard Cover Benefits</Text>
        {[
          { code: 'BN_AHC', name: 'Annual Health Check-Up (78 parameters, home visit)' },
          { code: 'BN_OPD', name: 'F2F OPD Consults — General Physician in HA network' },
          { code: 'BN_EDPB', name: 'Exclusive Discounted Platform Benefits' },
          { code: 'BN_BKSC', name: 'Dedicated Care team to book services' },
          { code: 'BN_HRA', name: 'Health Risk Assessment' },
          { code: 'B0001', name: 'Personal Accident — Accidental Death' },
        ].map(b => (
          <View key={b.code} style={styles.benefitRow}>
            <Text style={styles.benefitCode}>{b.code}</Text>
            <Text style={styles.benefitName}>{b.name}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.grey100 },
  header: {
    backgroundColor: theme.colors.tealPrimary,
    padding: theme.spacing[6],
  },
  heading: { fontSize: 22, fontWeight: '700', color: theme.colors.white },
  subheading: { fontSize: 13, color: theme.colors.tealLight, marginTop: theme.spacing[1] },
  uwNote: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: theme.spacing[4],
    marginTop: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  uwNoteText: { fontSize: 12, color: '#1D4ED8' },
  bundleCard: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing[4],
    marginBottom: 0,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  bundleCardSelected: {
    borderWidth: 2,
    borderColor: theme.colors.tealPrimary,
  },
  tag: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderBottomLeftRadius: theme.borderRadius.md,
  },
  tagText: { fontSize: 11, fontWeight: '700', color: theme.colors.white },
  bundleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[4],
    marginTop: theme.spacing[2],
  },
  bundleId: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.tealPrimary,
    width: 50,
  },
  bundleName: { fontSize: 16, fontWeight: '700', color: theme.colors.navy },
  bundlePrice: { fontSize: 13, color: theme.colors.grey600, marginTop: 2 },
  features: { gap: theme.spacing[2], marginBottom: theme.spacing[4] },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing[2] },
  featureCheck: { color: theme.colors.success, fontWeight: '700', fontSize: 14, marginTop: 1 },
  featureText: { fontSize: 13, color: theme.colors.grey600, flex: 1, lineHeight: 20 },
  enrollButton: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    alignItems: 'center',
  },
  enrollButtonText: { color: theme.colors.white, fontWeight: '600', fontSize: 15 },
  benefitsCard: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
  },
  benefitsTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.navy, marginBottom: theme.spacing[4] },
  benefitRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey100,
  },
  benefitCode: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.tealDark,
    width: 72,
    marginTop: 1,
  },
  benefitName: { fontSize: 13, color: theme.colors.grey600, flex: 1, lineHeight: 20 },
});
