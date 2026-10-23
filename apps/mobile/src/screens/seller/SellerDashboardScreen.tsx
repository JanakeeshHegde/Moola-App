import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';

export const SellerDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { locale } = useLanguage();
  const { user } = useAuth();

  const stats = [
    { label: locale === 'kn' ? 'ಒಟ್ಟು ಆದಾಯ' : 'Total Revenue', value: '₹42,850', color: colors.primaryDark },
    { label: locale === 'kn' ? 'ಬಾಕಿ ಆರ್ಡರ್‌ಗಳು' : 'Pending Orders', value: '3', color: colors.accentDark },
    { label: locale === 'kn' ? 'ಸಕ್ರಿಯ ಉತ್ಪನ್ನಗಳು' : 'Active Produce', value: '8', color: colors.organicGreen },
    { label: locale === 'kn' ? 'ರೇಟಿಂಗ್' : 'Farmer Rating', value: '4.9 ★', color: '#D97706' },
  ];

  return (
    <View style={styles.container}>
      <Header
        title={locale === 'kn' ? 'ರೈತರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : 'Farmer Seller Dashboard'}
        subtitle={user?.shopName || 'Malnad Organic Farms'}
        showCart={false}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Verification Status Pill */}
        <View style={styles.kycBanner}>
          <Text style={styles.kycIcon}>🌱</Text>
          <View style={styles.kycTextCol}>
            <Text style={styles.kycTitle}>
              {locale === 'kn' ? 'ಪ್ರಮಾಣೀಕೃತ ಸಾವಯವ ರೈತ' : 'Verified Organic Farmer'}
            </Text>
            <Text style={styles.kycSub}>
              {locale === 'kn'
                ? 'ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಉತ್ಪನ್ನಗಳನ್ನು ನೇರವಾಗಿ ಮಾರಾಟ ಮಾಡಬಹುದು.'
                : 'KYC verified. Your farm produce is featured in the organic marketplace.'}
            </Text>
          </View>
          <View style={styles.verifiedTag}>
            <Text style={styles.verifiedTagText}>✓ VERIFIED</Text>
          </View>
        </View>

        {/* Manual Product Listing Banner */}
        <TouchableOpacity
          style={styles.addProductBanner}
          onPress={() => navigation.navigate('AddProduct')}
          activeOpacity={0.85}
        >
          <View style={styles.addProductIconCircle}>
            <Text style={styles.addProductIcon}>➕</Text>
          </View>
          <View style={styles.addProductTextCol}>
            <View style={styles.addProductBadge}>
              <Text style={styles.addProductBadgeText}>
                {locale === 'kn' ? 'ಮ್ಯಾನುಯಲ್ ಪಟ್ಟಿ' : 'MANUAL LISTING'}
              </Text>
            </View>
            <Text style={styles.addProductTitle}>
              {locale === 'kn' ? 'ಹೊಸ ಸಾವಯವ / ಮನೆಮದ್ದು ಉತ್ಪನ್ನ ಸೇರಿಸಿ' : 'Add New Homemade Produce'}
            </Text>
            <Text style={styles.addProductSub}>
              {locale === 'kn'
                ? 'ಚಿಪ್ಸ್, ಉಪ್ಪಿನಕಾಯಿ, ಜೇನುತುಪ್ಪ, ಮಸಾಲೆ ಪುಡಿಗಳನ್ನು ನಿಮ್ಮ ಅಂಗಡಿಗೆ ಸೇರಿಸಿ'
                : 'List homemade chips, pickles, pure honey, spices & snacks'}
            </Text>
          </View>
          <Text style={styles.addProductArrow}>→</Text>
        </TouchableOpacity>

        {/* Analytics Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((s, idx) => (
            <View key={idx} style={styles.statBox}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Workflow Alert Highlights */}
        <View style={styles.workflowHighlights}>
          <TouchableOpacity
            style={styles.workflowCard}
            onPress={() => navigation.navigate('SellerOrders')}
            activeOpacity={0.8}
          >
            <Text style={styles.workflowIcon}>💬</Text>
            <View style={styles.workflowTextCol}>
              <Text style={styles.workflowTitle}>
                {locale === 'kn' ? 'ಹೊಸ ಆರ್ಡರ್ ವಿನಂತಿಗಳು & ವಿಚಾರಣೆಗಳು' : 'Order Requests & WhatsApp Enquiries'}
              </Text>
              <Text style={styles.workflowSub}>
                {locale === 'kn'
                  ? 'ಗ್ರಾಹಕರ ಉತ್ಪನ್ನ ವಿಚಾರಣೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಬೆಲೆ/ರವಾನೆ ಖಚಿತಪಡಿಸಿ.'
                  : 'Review incoming homemade food requests, WhatsApp chats & pending payment verifications.'}
              </Text>
            </View>
            <View style={styles.workflowCountBadge}>
              <Text style={styles.workflowCountText}>2 NEW</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Management Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {locale === 'kn' ? 'ಉತ್ಪನ್ನ ಮತ್ತು ಆರ್ಡರ್ ನಿರ್ವಹಣೆ' : 'Store & Order Management'}
          </Text>
        </View>

        <View style={styles.actionsGrid}>
          {/* Incoming Orders & Courier Dispatch */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('SellerOrders')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📦</Text>
            <Text style={styles.actionTitle}>
              {locale === 'kn' ? 'ಆರ್ಡರ್‌ಗಳು & ಕೊರಿಯರ್ ರವಾನೆ' : 'Orders & Dispatch'}
            </Text>
            <Text style={styles.actionSub}>Confirm, verify & track</Text>
          </TouchableOpacity>

          {/* Reverse Market Bids */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('CustomRequests')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>🤝</Text>
            <Text style={styles.actionTitle}>
              {locale === 'kn' ? 'ಗ್ರಾಹಕರ ಬೇಡಿಕೆಗಳು' : 'Buyer Requests'}
            </Text>
            <Text style={styles.actionSub}>Submit custom quotes</Text>
          </TouchableOpacity>

          {/* Harvest Pre-booking */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('PreBooking')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>🍯</Text>
            <Text style={styles.actionTitle}>
              {locale === 'kn' ? 'ಸುಗ್ಗಿ ಮುಂಗಡ ಬುಕಿಂಗ್' : 'Seasonal Batches'}
            </Text>
            <Text style={styles.actionSub}>Honey & festival snacks</Text>
          </TouchableOpacity>

          {/* KYC Documents */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('SellerKYC')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📄</Text>
            <Text style={styles.actionTitle}>
              {locale === 'kn' ? 'ದಾಖಲೆಗಳು (KYC)' : 'KYC Verification'}
            </Text>
            <Text style={styles.actionSub}>FSSAI & Food safety credentials</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  kycBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.organicBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.25)',
    marginBottom: 16,
  },
  kycIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  kycTextCol: {
    flex: 1,
  },
  kycTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.organicGreen,
  },
  kycSub: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
    lineHeight: 15,
  },
  verifiedTag: {
    backgroundColor: colors.organicGreen,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  verifiedTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  addProductBanner: {
    backgroundColor: '#1E3A1A',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
  },
  addProductIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addProductIcon: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  addProductTextCol: {
    flex: 1,
  },
  addProductBadge: {
    backgroundColor: colors.organicGreen,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  addProductBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  addProductTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  addProductSub: {
    fontSize: 11,
    color: '#D1E7DD',
    marginTop: 2,
    lineHeight: 15,
  },
  addProductArrow: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 26,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  actionSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  workflowHighlights: {
    marginBottom: 16,
  },
  workflowCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#22C55E',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  workflowIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  workflowTextCol: {
    flex: 1,
  },
  workflowTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  workflowSub: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
    lineHeight: 15,
  },
  workflowCountBadge: {
    backgroundColor: '#22C55E',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  workflowCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
});

