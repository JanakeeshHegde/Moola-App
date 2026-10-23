import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { CUSTOMER_SUPPORT_CONFIG } from '@moola/shared';

export const PrivacyPolicyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { locale } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>← {locale === 'kn' ? 'ಹಿಂದಕ್ಕೆ' : 'Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {locale === 'kn' ? 'ಗೌಪ್ಯತಾ ನೀತಿ' : 'Privacy Policy'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badgeBox}>
          <Text style={styles.badgeText}>
            Version {CUSTOMER_SUPPORT_CONFIG.policyVersion} • Effective: {CUSTOMER_SUPPORT_CONFIG.policyEffectiveDate}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>1. Introduction & Marketplace Scope</Text>
        <Text style={styles.paragraph}>
          MOOLA is an online marketplace dedicated to shelf-stable homemade and organic food products—such as chips, snacks, honey, spice blends, and pickles. MOOLA is not a fresh vegetable market. We respect your privacy and process personal information strictly in accordance with this policy.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Actually Collect</Text>
        <Text style={styles.subHeading}>• User & Account Credentials</Text>
        <Text style={styles.paragraph}>
          Name, verified 10-digit Indian mobile number, optional email address, language preference (English/Kannada), and delivery addresses. Passwords are saved solely as irreversible cryptographic bcrypt hashes; plaintext passwords are never stored.
        </Text>

        <Text style={styles.subHeading}>• Seller Store Information</Text>
        <Text style={styles.paragraph}>
          Store name, shop description, seller WhatsApp contact number, UPI ID, payment instructions, and optional KYC documents uploaded solely for administrator verification.
        </Text>

        <Text style={styles.subHeading}>• Orders & Transactions</Text>
        <Text style={styles.paragraph}>
          Ordered item snapshots, shipping addresses, order status history, manual payment transaction reference numbers (UTR) entered by buyers, and shipment tracking consignment numbers (e.g., India Post or courier).
        </Text>

        <Text style={styles.subHeading}>• Device Push Tokens & Notifications</Text>
        <Text style={styles.paragraph}>
          Expo push tokens used exclusively for dispatching order and support updates. In-app notifications are retained in MongoDB Atlas with a 90-day retention index.
        </Text>

        <Text style={styles.sectionTitle}>3. WhatsApp Communication Notice</Text>
        <Text style={styles.paragraph}>
          MOOLA allows direct buyer-seller product enquiries via WhatsApp click-to-chat links. When you open a WhatsApp link, you leave MOOLA and are subject to Meta's WhatsApp Terms and Privacy Policy. MOOLA does not record, intercept, or host your private WhatsApp chat conversations.
        </Text>

        <Text style={styles.sectionTitle}>4. How Your Information Is Used</Text>
        <Text style={styles.paragraph}>
          Data is used strictly to authenticate accounts, enable order dispatch and delivery, facilitate buyer-seller communication, deliver service notifications, and resolve customer support tickets.
        </Text>

        <Text style={styles.sectionTitle}>5. Information Sharing</Text>
        <Text style={styles.paragraph}>
          We never sell your personal information. When an order is confirmed, the shipping address and recipient phone number are shared with the seller solely for parcel dispatch and courier booking.
        </Text>

        <Text style={styles.sectionTitle}>6. Data Retention & Account Deletion</Text>
        <Text style={styles.paragraph}>
          You can request account deletion anytime directly in the app (Profile &gt; Settings &gt; Delete Account) or via our public web portal. Upon deletion, personal details are deactivated and anonymized, while past transaction records are retained in anonymized format for statutory tax and accounting compliance.
        </Text>

        <Text style={styles.sectionTitle}>7. Customer Support Contact</Text>
        <Text style={styles.paragraph}>
          For privacy inquiries, contact our development team on:
          {'\n'}• Line 1: {CUSTOMER_SUPPORT_CONFIG.numbers.primary.display}
          {'\n'}• Line 2: {CUSTOMER_SUPPORT_CONFIG.numbers.secondary.display}
        </Text>

        <View style={styles.appFooter}>
          <Text style={styles.appFooterText}>
            © {new Date().getFullYear()} MOOLA • {CUSTOMER_SUPPORT_CONFIG.brandTagline}
          </Text>
          <Text style={styles.appFooterSubtext}>
            {locale === 'kn' ? 'ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ' : 'All rights reserved'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
    borderRadius: 6,
    marginRight: 10,
  },
  backBtnText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  content: { padding: 16, paddingBottom: 40 },
  badgeBox: {
    backgroundColor: colors.primarySubtle,
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: colors.primaryDark },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 14,
    marginBottom: 6,
  },
  subHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 6,
    marginBottom: 2,
  },
  paragraph: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 8,
  },
  appFooter: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  appFooterText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  appFooterSubtext: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
