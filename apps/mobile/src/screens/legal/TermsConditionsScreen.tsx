import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { CUSTOMER_SUPPORT_CONFIG } from '@moola/shared';

export const TermsConditionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
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
          {locale === 'kn' ? 'ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು' : 'Terms & Conditions'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badgeBox}>
          <Text style={styles.badgeText}>
            Version {CUSTOMER_SUPPORT_CONFIG.policyVersion} • Effective: {CUSTOMER_SUPPORT_CONFIG.policyEffectiveDate}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By registering, accessing, or placing orders on MOOLA, you agree to these Terms and Conditions.
        </Text>

        <Text style={styles.sectionTitle}>2. Scope of the MOOLA Platform</Text>
        <Text style={styles.paragraph}>
          MOOLA connects independent makers and sellers of artisanal, homemade, and shelf-stable food products (such as chips, snacks, honey, spice blends, and pickles) with consumers across India. MOOLA is an intermediary technology platform and is strictly not a vegetable or fresh produce market.
        </Text>

        <Text style={styles.sectionTitle}>3. Buyer Responsibilities</Text>
        <Text style={styles.paragraph}>
          Buyers must provide accurate delivery addresses, complete direct payments to sellers via designated UPI credentials, provide valid UTR transaction references, and inspect delivered parcels promptly.
        </Text>

        <Text style={styles.sectionTitle}>4. Seller Responsibilities</Text>
        <Text style={styles.paragraph}>
          Sellers are solely responsible for the quality, packaging, hygiene, and legal licensing of food products sold, prompt parcel dispatch, accurate tracking numbers, and valid payment details.
        </Text>

        <Text style={styles.sectionTitle}>5. Product Descriptions & Organic Claims</Text>
        <Text style={styles.paragraph}>
          Handmade food products may vary naturally in color and appearance. Organic claims must not be assumed certified unless official certification documentation is verified and displayed.
        </Text>

        <Text style={styles.sectionTitle}>6. Food Safety, Ingredients & Allergens</Text>
        <Text style={styles.paragraph}>
          Buyers must review ingredient lists and allergen disclosures prior to purchasing. Sellers must specify storage requirements and realistic shelf life.
        </Text>

        <Text style={styles.sectionTitle}>7. Order Enquiries & Confirmation</Text>
        <Text style={styles.paragraph}>
          Orders may be initiated via in-app requests or WhatsApp enquiries. An order is confirmed when accepted by the seller with payment instructions.
        </Text>

        <Text style={styles.sectionTitle}>8. WhatsApp & Payment Arrangements</Text>
        <Text style={styles.paragraph}>
          MOOLA does not operate an automated payment gateway, wallet, or escrow. Payments are transferred directly to seller UPI per seller-provided instructions. WhatsApp chats take place on Meta's platform and are not recorded in MOOLA's database.
        </Text>

        <Text style={styles.sectionTitle}>9. Cancellations, Refunds & Damaged Goods</Text>
        <Text style={styles.paragraph}>
          Opened food packages cannot be returned for hygiene reasons. In verified cases of transit damage or wrong shipment reported within 48 hours via Support, sellers are required to issue a replacement or direct refund.
        </Text>

        <Text style={styles.sectionTitle}>10. Dispute Handling</Text>
        <Text style={styles.paragraph}>
          Unresolved issues between buyers and sellers may be escalated via our in-app Customer Support & Complaints ticketing system.
        </Text>

        <Text style={styles.sectionTitle}>11. Delivery & Shipment Information</Text>
        <Text style={styles.paragraph}>
          Shipments are dispatched via external carriers such as India Post, DTDC, or Blue Dart. Sellers must provide valid consignment numbers upon dispatch.
        </Text>

        <Text style={styles.sectionTitle}>12. Account Suspension & Termination</Text>
        <Text style={styles.paragraph}>
          MOOLA may terminate accounts engaging in fraudulent payments, non-fulfillment of paid orders, sale of unhygienic foods, or abusive conduct.
        </Text>

        <Text style={styles.sectionTitle}>13. Acceptable Use</Text>
        <Text style={styles.paragraph}>
          Users agree not to scrape data, breach security, or use the platform for unlawful commerce.
        </Text>

        <Text style={styles.sectionTitle}>14. Privacy & Account Deletion</Text>
        <Text style={styles.paragraph}>
          Users may request account deletion at any time in accordance with our Privacy Policy.
        </Text>

        <Text style={styles.sectionTitle}>15. Limitation of Responsibilities</Text>
        <Text style={styles.paragraph}>
          MOOLA's liability is limited to the extent permitted by applicable Indian law. Nothing in these terms excludes statutory consumer protection rights that cannot lawfully be waived.
        </Text>

        <Text style={styles.sectionTitle}>16. Changes & Contact Methods</Text>
        <Text style={styles.paragraph}>
          For inquiries or assistance:
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
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 14,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 6,
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
