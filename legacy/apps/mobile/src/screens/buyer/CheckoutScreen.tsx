import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { Header } from '../../components/Header';

export const CheckoutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { locale, t } = useLanguage();
  const { items, subtotal, deliveryFee, totalPayable, clearCart } = useCart();
  const [selectedAddress, setSelectedAddress] = useState('addr_1');
  const [paymentMode, setPaymentMode] = useState<'whatsapp_confirm' | 'upi_reference'>('whatsapp_confirm');
  const [upiRefInput, setUpiRefInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addresses = [
    {
      id: 'addr_1',
      title: 'Home (Bangalore)',
      line1: '#402, Green Glen Layout, Bellandur',
      city: 'Bangalore, Karnataka',
      pincode: '560103',
      phone: '+91 9845012345',
    },
    {
      id: 'addr_2',
      title: 'Parents House (Mysore)',
      line1: '12th Cross, Kuvempunagar',
      city: 'Mysore, Karnataka',
      pincode: '570023',
      phone: '+91 9845012345',
    },
  ];

  const handlePlaceOrderRequest = () => {
    if (paymentMode === 'upi_reference' && upiRefInput.trim().length < 4) {
      Alert.alert(
        locale === 'kn' ? 'ಪಾವತಿ ವಿವರ ಅಪೂರ್ಣ' : 'Payment Reference Required',
        locale === 'kn'
          ? 'ದಯವಿಟ್ಟು ಕನಿಷ್ಠ 4 ಅಕ್ಷರಗಳ ಯುಪಿಐ ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.'
          : 'Please enter a valid UPI transaction reference / UTR number (at least 4 digits).',
      );
      return;
    }

    setIsSubmitting(true);

    const generatedOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const initialPaymentStatus =
      paymentMode === 'upi_reference' ? 'PAYMENT_VERIFICATION_PENDING' : 'PAYMENT_PENDING';

    setTimeout(() => {
      setIsSubmitting(false);
      clearCart();
      navigation.replace('OrderTracking', {
        orderId: generatedOrderId,
        amount: totalPayable,
        paymentMode,
        paymentStatus: initialPaymentStatus,
        paymentReference: upiRefInput.trim(),
        orderStatus: 'ORDER_REQUESTED',
        itemsCount: items.length,
      });
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <Header
        title={locale === 'kn' ? 'ಆರ್ಡರ್ ವಿನಂತಿ ಪರಿಶೀಲನೆ' : 'Order Request & Checkout'}
        showCart={false}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Address Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 {t('deliveryAddress')}</Text>
          {addresses.map((addr) => {
            const isSelected = selectedAddress === addr.id;
            return (
              <TouchableOpacity
                key={addr.id}
                style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                onPress={() => setSelectedAddress(addr.id)}
                activeOpacity={0.8}
              >
                <View style={styles.radioOuter}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressTitle}>{addr.title}</Text>
                  <Text style={styles.addressLine}>{addr.line1}</Text>
                  <Text style={styles.addressCity}>
                    {addr.city} - {addr.pincode}
                  </Text>
                  <Text style={styles.addressPhone}>Phone: {addr.phone}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Payment & Confirmation Flow Notice */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeIcon}>💡</Text>
          <View style={styles.noticeTextCol}>
            <Text style={styles.noticeTitle}>
              {locale === 'kn' ? 'ನೇರ ರೈತರ ಪಾವತಿ ವಿಧಾನ' : 'Direct Seller Payment Model'}
            </Text>
            <Text style={styles.noticeBody}>
              {locale === 'kn'
                ? 'MOOLAದಲ್ಲಿ ಯಾವುದೇ ಮಧ್ಯವರ್ತಿ ಶುಲ್ಕವಿಲ್ಲ. ಮಾರಾಟಗಾರರು ಲಭ್ಯತೆಯನ್ನು ಖಚಿತಪಡಿಸಿದ ನಂತರ ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಯುಪಿಐ/ಬ್ಯಾಂಕ್ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳುತ್ತಾರೆ.'
                : '100% direct payment to homemade producers with zero gateway cut. The seller confirms batch availability and provides their direct UPI details.'}
            </Text>
          </View>
        </View>

        {/* Payment Selection Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 {locale === 'kn' ? 'ಪಾವತಿ ವಿಧಾನ' : 'Payment Confirmation Method'}</Text>

          {/* Option 1: WhatsApp Seller Confirmation */}
          <TouchableOpacity
            style={[
              styles.paymentCard,
              paymentMode === 'whatsapp_confirm' && styles.paymentCardSelected,
            ]}
            onPress={() => setPaymentMode('whatsapp_confirm')}
            activeOpacity={0.8}
          >
            <View style={styles.radioOuter}>
              {paymentMode === 'whatsapp_confirm' && <View style={styles.radioInner} />}
            </View>
            <View style={styles.paymentInfo}>
              <View style={styles.paymentTitleRow}>
                <Text style={styles.paymentTitle}>
                  💬 {locale === 'kn' ? 'ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಪಾವತಿ ವಿವರ' : 'WhatsApp Seller Payment (Recommended)'}
                </Text>
              </View>
              <Text style={styles.paymentSubtitle}>
                {locale === 'kn'
                  ? 'ಆರ್ಡರ್ ವಿನಂತಿ ಸಲ್ಲಿಸಿದ ನಂತರ, ಮಾರಾಟಗಾರರು ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ QR ಕೋಡ್ ಅಥವಾ UPI ವಿವರಗಳನ್ನು ಕಳುಹಿಸುತ್ತಾರೆ.'
                  : 'Place order request now. Seller shares their direct UPI QR code via WhatsApp upon availability check.'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Option 2: Pre-pay and enter UPI reference */}
          <TouchableOpacity
            style={[
              styles.paymentCard,
              paymentMode === 'upi_reference' && styles.paymentCardSelected,
            ]}
            onPress={() => setPaymentMode('upi_reference')}
            activeOpacity={0.8}
          >
            <View style={styles.radioOuter}>
              {paymentMode === 'upi_reference' && <View style={styles.radioInner} />}
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>
                📱 {locale === 'kn' ? 'ಯುಪಿಐ ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ' : 'Submit UPI Reference / UTR Number'}
              </Text>
              <Text style={styles.paymentSubtitle}>
                {locale === 'kn'
                  ? 'ನೀವು ಈಗಾಗಲೇ ಮಾರಾಟಗಾರರ ಯುಪಿಐಗೆ ಹಣ ಕಳುಹಿಸಿದ್ದರೆ, 12-ಅಂಕಿಯ ಯುಪಿಐ ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ (ಪರಿಶೀಲನೆ ಬಾಕಿ).'
                  : 'Enter your 12-digit transaction UTR. Status will show Payment Verification Pending until seller verifies receipt.'}
              </Text>
            </View>
          </TouchableOpacity>

          {paymentMode === 'upi_reference' && (
            <View style={styles.upiInputCard}>
              <Text style={styles.upiInputLabel}>
                {locale === 'kn' ? 'ಯುಪಿಐ ರೆಫರೆನ್ಸ್ / UTR ಸಂಖ್ಯೆ:' : 'UPI Reference / UTR Number:'}
              </Text>
              <TextInput
                style={styles.upiInput}
                placeholder="e.g. 429182910482 or UPI Ref ID"
                placeholderTextColor={colors.textMuted}
                value={upiRefInput}
                onChangeText={setUpiRefInput}
                autoCapitalize="characters"
              />
              <Text style={styles.upiDisclaimer}>
                ⚠️ {locale === 'kn'
                  ? 'ಪಾವತಿ ಪರಿಶೀಲನೆ ಬಾಕಿ ಇರುತ್ತದೆ. ಮಾರಾಟಗಾರರು ಖಾತೆಯನ್ನು ಪರಿಶೀಲಿಸಿದ ನಂತರವೇ ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲಾಗುತ್ತದೆ.'
                  : 'We never claim payment is successful without independent seller verification.'}
              </Text>
            </View>
          )}
        </View>


        {/* Price Breakdown */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeading}>{t('orderSummary')}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('itemsTotal')}</Text>
            <Text style={styles.summaryValue}>₹{subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('deliveryFee')}</Text>
            <Text
              style={[
                styles.summaryValue,
                deliveryFee === 0 && { color: colors.organicGreen, fontWeight: '700' },
              ]}
            >
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('totalPayable')}</Text>
            <Text style={styles.totalValue}>₹{totalPayable}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order CTA */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>{t('totalPayable')}</Text>
          <Text style={styles.bottomAmount}>₹{totalPayable}</Text>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderBtn, isSubmitting && styles.placeOrderBtnDisabled]}
          onPress={handlePlaceOrderRequest}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.placeOrderText}>
              {locale === 'kn' ? 'ಆರ್ಡರ್ ವಿನಂತಿ ಸಲ್ಲಿಸಿ' : 'Submit Order Request'} →
            </Text>
          )}
        </TouchableOpacity>
      </View>

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
    paddingBottom: 110,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 10,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
  },
  addressCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F8FCF7',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  addressInfo: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addressLine: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addressCity: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  addressPhone: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
  },
  paymentCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F8FCF7',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  secureBadge: {
    backgroundColor: colors.organicBg,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  secureText: {
    color: colors.organicGreen,
    fontSize: 9,
    fontWeight: '800',
  },
  paymentSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  summaryHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    marginTop: 8,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 8,
  },
  bottomLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  bottomAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  placeOrderBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  placeOrderBtnDisabled: {
    opacity: 0.6,
  },
  placeOrderText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  noticeCard: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  noticeIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  noticeTextCol: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  noticeBody: {
    fontSize: 11,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 16,
  },
  upiInputCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  upiInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  upiInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
  },
  upiDisclaimer: {
    fontSize: 10,
    color: '#B45309',
    marginTop: 6,
    lineHeight: 14,
  },
});

