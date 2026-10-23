import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';
import { TimelineTracker } from '../../components/TimelineTracker';
import { buildWhatsAppChatUrl } from '@moola/shared';

export const OrderTrackingScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { locale, t } = useLanguage();
  const orderId = route.params?.orderId || 'ORD-891042';
  const amount = route.params?.amount || 570;
  const orderStatus = route.params?.orderStatus || 'ORDER_REQUESTED';
  const paymentStatus = route.params?.paymentStatus || 'PAYMENT_PENDING';
  const paymentMode = route.params?.paymentMode || 'whatsapp_confirm';
  const carrierName = route.params?.carrierName || 'India Post';
  const consignmentNumber = route.params?.consignmentNumber || 'EK' + Math.floor(100000000 + Math.random() * 900000000) + 'IN';
  const dispatchDate = route.params?.dispatchDate || 'Oct 22, 2026';
  const estimatedDeliveryDate = route.params?.estimatedDeliveryDate || 'Oct 25, 2026';
  const trackingUrl =
    route.params?.trackingUrl ||
    'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx';
  const sellerPhone = '+919000000001';

  const handleWhatsAppContact = () => {
    const text = `Hello MOOLA Seller, regarding my order #${orderId} (₹${amount}): Could you please provide an update on order confirmation, payment, or shipping dispatch?`;
    const url = buildWhatsAppChatUrl(sellerPhone, text);
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <Header
        title={locale === 'kn' ? 'ಆರ್ಡರ್ ಟ್ರ್ಯಾಕಿಂಗ್' : 'Order & Courier Tracking'}
        showCart={false}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status Confirmation Card */}
        <View style={styles.statusCard}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logoEmblem}
            resizeMode="contain"
          />
          <Text style={styles.statusTitle}>
            {orderStatus === 'ORDER_REQUESTED'
              ? (locale === 'kn' ? 'ಆರ್ಡರ್ ವಿನಂತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ!' : 'Order Request Placed!')
              : orderStatus === 'ORDER_CONFIRMED'
                ? (locale === 'kn' ? 'ಮಾರಾಟಗಾರರು ದೃಢೀಕರಿಸಿದ್ದಾರೆ!' : 'Order Confirmed by Seller!')
                : orderStatus === 'SHIPPED'
                  ? (locale === 'kn' ? 'ಕೊರಿಯರ್ ರವಾನಿಸಲಾಗಿದೆ!' : 'Dispatched via Courier!')
                  : (locale === 'kn' ? 'ಆರ್ಡರ್ ಸ್ಥಿತಿ' : 'Order Status')}
          </Text>

          <Text style={styles.orderNumberText}>Order #{orderId}</Text>

          {/* Badges row */}
          <View style={styles.badgeRow}>
            <View style={styles.orderBadge}>
              <Text style={styles.orderBadgeText}>{orderStatus.replace(/_/g, ' ')}</Text>
            </View>

            <View
              style={[
                styles.paymentBadge,
                paymentStatus === 'PAID'
                  ? styles.badgePaid
                  : paymentStatus === 'PAYMENT_VERIFICATION_PENDING'
                    ? styles.badgeVerificationPending
                    : styles.badgePending,
              ]}
            >
              <Text
                style={[
                  styles.paymentBadgeText,
                  paymentStatus === 'PAID'
                    ? styles.textPaid
                    : paymentStatus === 'PAYMENT_VERIFICATION_PENDING'
                      ? styles.textVerificationPending
                      : styles.textPending,
                ]}
              >
                💳 {paymentStatus === 'PAID'
                  ? 'Paid & Verified'
                  : paymentStatus === 'PAYMENT_VERIFICATION_PENDING'
                    ? 'Payment Verification Pending'
                    : 'Payment Pending'}
              </Text>
            </View>
          </View>

          <Text style={styles.statusSub}>
            {locale === 'kn'
              ? 'ಮಾರಾಟಗಾರರು ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ತಯಾರಿಸಿದ ಆಹಾರ ಉತ್ಪನ್ನಗಳ ಲಭ್ಯತೆಯನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದ್ದಾರೆ.'
              : 'The homemade producer has received your request and will communicate payment/dispatch details directly.'}
          </Text>
        </View>

        {/* Timeline Tracking Component */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>
            {locale === 'kn' ? 'ರವಾನೆ ಮತ್ತು ಟ್ರ್ಯಾಕಿಂಗ್ ವಿವರ' : 'Courier & Shipment Timeline'}
          </Text>
          <TimelineTracker
            currentStatus={orderStatus}
            carrierName={carrierName}
            consignmentNumber={consignmentNumber}
            dispatchDate={orderStatus === 'SHIPPED' ? dispatchDate : undefined}
            estimatedDeliveryDate={orderStatus === 'SHIPPED' ? estimatedDeliveryDate : undefined}
            trackingUrl={trackingUrl}
          />
        </View>

        {/* Homemade Producer & Delivery Details */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🏡 Homemade Producer & Delivery</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Producer / Maker:</Text>
            <Text style={styles.infoValue}>Malnad Organic Farms & Delicacies</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Delivery Address:</Text>
            <Text style={styles.infoValue}>#402, Green Glen Layout, Bangalore - 560103</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Order Value:</Text>
            <Text style={styles.infoValue}>₹{amount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Mode:</Text>
            <Text style={styles.infoValue}>
              {paymentMode === 'upi_reference'
                ? 'Direct UPI (Ref submitted)'
                : 'Direct Seller Payment via WhatsApp'}
            </Text>
          </View>
        </View>

        {/* WhatsApp Direct Action */}
        <TouchableOpacity
          style={styles.whatsappActionCard}
          onPress={handleWhatsAppContact}
          activeOpacity={0.85}
        >
          <Text style={styles.whatsappIcon}>💬</Text>
          <View style={styles.whatsappActionTextCol}>
            <Text style={styles.whatsappActionTitle}>
              {locale === 'kn' ? 'ಮಾರಾಟಗಾರರೊಂದಿಗೆ ವಾಟ್ಸಾಪ್ ಚಾಟ್' : 'Message Seller on WhatsApp'}
            </Text>
            <Text style={styles.whatsappActionSub}>
              {locale === 'kn'
                ? 'ಪಾವತಿ ವಿಧಾನ, ರವಾನೆ ದಿನಾಂಕ ಮತ್ತು ಪ್ಯಾಕಿಂಗ್ ವಿವರಗಳಿಗಾಗಿ ನೇರವಾಗಿ ಮಾತನಾಡಿ.'
                : 'Discuss payment instructions, packaging, or postal tracking with producer.'}
            </Text>
          </View>
          <Text style={styles.whatsappActionArrow}>→</Text>
        </TouchableOpacity>

        {/* Navigation Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Text style={styles.homeBtnText}>← {t('home')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => navigation.navigate('Chat', { recipientName: 'Basavaraj Gowda' })}
            activeOpacity={0.8}
          >
            <Text style={styles.chatBtnText}>💬 {t('chatWithFarmer')}</Text>
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
  statusCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  logoEmblem: {
    width: 64,
    height: 64,
    borderRadius: 14,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  orderNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentDark,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  orderBadge: {
    backgroundColor: colors.primarySubtle,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  orderBadgeText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '800',
  },
  paymentBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  paymentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgePending: {

    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  textPending: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeVerificationPending: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  textVerificationPending: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '700',
  },
  badgePaid: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  textPaid: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  statusSub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  whatsappActionCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#22C55E',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  whatsappIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  whatsappActionTextCol: {
    flex: 1,
  },
  whatsappActionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
  },
  whatsappActionSub: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
    lineHeight: 15,
  },
  whatsappActionArrow: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15803D',
    marginLeft: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  homeBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  homeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chatBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  chatBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textInverse,
  },
});
