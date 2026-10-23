import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';
import {
  SUPPORTED_CARRIERS,
  generateCarrierTrackingUrl,
  buildWhatsAppChatUrl,
  OrderStatus,
  PaymentStatus,
} from '@moola/shared';

interface SellerOrder {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  items: string;
  total: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  carrierName?: string;
  consignmentNumber?: string;
  dispatchDate?: string;
  estimatedDeliveryDate?: string;
  trackingUrl?: string;
  dispatchNotes?: string;
  date: string;
}

export const SellerOrdersScreen: React.FC<{ navigation?: any }> = ({ navigation: _navigation }) => {
  const { locale } = useLanguage();
  const [orders, setOrders] = useState<SellerOrder[]>([
    {
      id: 'ord_1',
      orderNumber: 'ORD-891042',
      buyerName: 'Ananya Rao',
      buyerPhone: '+919845012345',
      items: '2x Malnad Raw Jackfruit Chips (250g), 1x Wild Forest Honey (500g)',
      total: 740,
      orderStatus: 'ORDER_REQUESTED',
      paymentStatus: 'PAYMENT_PENDING',
      date: 'Oct 22, 2026',
    },
    {
      id: 'ord_2',
      orderNumber: 'ORD-761920',
      buyerName: 'Kiran Kumar',
      buyerPhone: '+919900112233',
      items: '3x Kerala Nendran Banana Chips in Coconut Oil',
      total: 480,
      orderStatus: 'ORDER_CONFIRMED',
      paymentStatus: 'PAYMENT_VERIFICATION_PENDING',
      paymentReference: 'UPI-4928190482',
      date: 'Oct 21, 2026',
    },
    {
      id: 'ord_3',
      orderNumber: 'ORD-651230',
      buyerName: 'Priyanka S.',
      buyerPhone: '+919880011224',
      items: '2x Appe Midi Raw Mango Pickle (350g)',
      total: 480,
      orderStatus: 'SHIPPED',
      paymentStatus: 'PAID',
      paymentReference: 'UTR-9821381904',
      carrierName: 'India Post',
      consignmentNumber: 'EK928194829IN',
      dispatchDate: 'Oct 21, 2026',
      estimatedDeliveryDate: 'Oct 24, 2026',
      trackingUrl: 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx',
      dispatchNotes: 'Dispatched via Registered Speed Post',
      date: 'Oct 20, 2026',
    },
  ]);

  // Modal State for Manual Courier Details
  const [shippingModalVisible, setShippingModalVisible] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<string>('India Post');
  const [consignmentInput, setConsignmentInput] = useState('');
  const [estDeliveryInput, setEstDeliveryInput] = useState('');
  const [dispatchNotesInput, setDispatchNotesInput] = useState('');

  // 1. Confirm Order Request
  const handleConfirmOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, orderStatus: 'ORDER_CONFIRMED' }
          : o,
      ),
    );
    Alert.alert(
      locale === 'kn' ? 'ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ' : 'Order Confirmed',
      locale === 'kn'
        ? 'ಆರ್ಡರ್ ಲಭ್ಯತೆಯನ್ನು ದೃಢೀಕರಿಸಲಾಗಿದೆ. ಗ್ರಾಹಕರು ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಪಾವತಿ ವಿವರ ಪಡೆಯುತ್ತಾರೆ.'
        : 'Order confirmed. The buyer has been notified to proceed with payment via WhatsApp instructions.',
    );
  };

  // 2. Reject Order Request
  const handleRejectOrder = (orderId: string) => {
    Alert.alert(
      locale === 'kn' ? 'ಆರ್ಡರ್ ತಿರಸ್ಕರಿಸಿ' : 'Reject Order Request',
      locale === 'kn'
        ? 'ಈ ಆರ್ಡರ್ ವಿನಂತಿಯನ್ನು ತಿರಸ್ಕರಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?'
        : 'Are you sure you want to decline this order request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === orderId ? { ...o, orderStatus: 'CANCELLED' } : o,
              ),
            );
          },
        },
      ],
    );
  };

  // 3. Verify Payment
  const handleVerifyPayment = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, paymentStatus: 'PAID', orderStatus: 'PAID' }
          : o,
      ),
    );
    Alert.alert(
      locale === 'kn' ? 'ಪಾವತಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ' : 'Payment Verified!',
      locale === 'kn'
        ? 'ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲ್ಪಟ್ಟಿದೆ. ಈಗ ಕೊರಿಯರ್ ಪ್ಯಾಕಿಂಗ್ ಮತ್ತು ರವಾನೆ ಮಾಡಬಹುದು.'
        : 'Payment marked as verified. Order is ready for packing and courier dispatch.',
    );
  };

  // 4. Open Manual Shipping Modal
  const openShippingModal = (orderId: string) => {
    setActiveOrderId(orderId);
    setConsignmentInput('');
    setEstDeliveryInput('3-4 days');
    setDispatchNotesInput('');
    setShippingModalVisible(true);
  };

  // 5. Save Manual Shipping Details
  const handleSaveShipping = () => {
    if (!consignmentInput.trim()) {
      Alert.alert('Required', 'Please enter a valid Tracking / Consignment Number');
      return;
    }

    const trackingLink = generateCarrierTrackingUrl(selectedCarrier, consignmentInput.trim());

    setOrders((prev) =>
      prev.map((o) =>
        o.id === activeOrderId
          ? {
              ...o,
              orderStatus: 'SHIPPED',
              carrierName: selectedCarrier,
              consignmentNumber: consignmentInput.trim(),
              dispatchDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              estimatedDeliveryDate: estDeliveryInput || '3-4 business days',
              trackingUrl: trackingLink,
              dispatchNotes: dispatchNotesInput,
            }
          : o,
      ),
    );

    setShippingModalVisible(false);
    Alert.alert(
      locale === 'kn' ? 'ರವಾನೆ ವಿವರ ದಾಖಲಿಸಲಾಗಿದೆ' : 'Dispatch Recorded!',
      `${selectedCarrier} tracking details recorded. Buyer notified with consignment number ${consignmentInput.trim()}.`,
    );
  };

  // 6. Direct WhatsApp Message to Buyer
  const handleWhatsAppBuyer = (buyerPhone: string, orderNumber: string) => {
    const text = `Namaskara! This is MOOLA Seller regarding your order #${orderNumber}. Please confirm your shipping address and payment receipt.`;
    const url = buildWhatsAppChatUrl(buyerPhone, text);
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <Header
        title={locale === 'kn' ? 'ಗ್ರಾಹಕರ ಆರ್ಡರ್‌ಗಳು' : 'Manage Customer Orders'}
        subtitle={
          locale === 'kn'
            ? 'ಆರ್ಡರ್ ದೃಢೀಕರಣ, ಪಾವತಿ ಪರಿಶೀಲನೆ & ಕೊರಿಯರ್ ಟ್ರ್ಯಾಕಿಂಗ್'
            : 'Order requests, payment verification & manual courier dispatch'
        }
        showCart={false}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {orders.map((o) => {
          const isRequested = o.orderStatus === 'ORDER_REQUESTED';
          const isConfirmed = o.orderStatus === 'ORDER_CONFIRMED';
          const isPaid = o.paymentStatus === 'PAID';
          const isShipped = o.orderStatus === 'SHIPPED';
          const isCancelled = o.orderStatus === 'CANCELLED';

          return (
            <View key={o.id} style={styles.orderCard}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderNumber}>#{o.orderNumber}</Text>
                  <Text style={styles.orderDate}>{o.date}</Text>
                </View>

                {/* Status Badges */}
                <View style={styles.statusBadgeCol}>
                  <View
                    style={[
                      styles.statusPill,
                      isRequested
                        ? styles.pillRequested
                        : isConfirmed
                          ? styles.pillConfirmed
                          : isShipped
                            ? styles.pillShipped
                            : isCancelled
                              ? styles.pillCancelled
                              : styles.pillPaid,
                    ]}
                  >
                    <Text style={styles.statusPillText}>{o.orderStatus.replace(/_/g, ' ')}</Text>
                  </View>
                </View>
              </View>

              {/* Buyer & Items Section */}
              <View style={styles.buyerSection}>
                <Text style={styles.buyerName}>Buyer: {o.buyerName}</Text>
                <Text style={styles.buyerPhone}>📞 {o.buyerPhone}</Text>
                <Text style={styles.itemsSummary}>Items: {o.items}</Text>
                <Text style={styles.totalText}>Order Value: ₹{o.total}</Text>
              </View>

              {/* Payment Verification Status Block */}
              <View style={styles.paymentStatusBlock}>
                <View style={styles.paymentStatusRow}>
                  <Text style={styles.paymentBlockLabel}>Payment Status:</Text>
                  <Text
                    style={[
                      styles.paymentBlockVal,
                      isPaid
                        ? styles.valPaid
                        : o.paymentStatus === 'PAYMENT_VERIFICATION_PENDING'
                          ? styles.valVerifPending
                          : styles.valPending,
                    ]}
                  >
                    {isPaid
                      ? '✓ Paid & Verified'
                      : o.paymentStatus === 'PAYMENT_VERIFICATION_PENDING'
                        ? '⚠️ Verification Pending'
                        : '⏳ Payment Pending'}
                  </Text>
                </View>

                {o.paymentReference && (
                  <View style={styles.paymentRefRow}>
                    <Text style={styles.paymentRefLabel}>Buyer Submitted Ref / UTR:</Text>
                    <Text style={styles.paymentRefVal}>{o.paymentReference}</Text>
                  </View>
                )}

                {!isPaid && !isCancelled && (
                  <TouchableOpacity
                    style={styles.verifyPayBtn}
                    onPress={() => handleVerifyPayment(o.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.verifyPayBtnText}>
                      ✓ Verify Payment Received
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Courier / Postal Details Block (if shipped) */}
              {isShipped && (
                <View style={styles.courierBlock}>
                  <Text style={styles.courierBlockTitle}>📦 Manual Courier / Postal Tracking</Text>
                  <Text style={styles.courierLine}>• Service: {o.carrierName}</Text>
                  <Text style={styles.courierLine}>• Consignment No: {o.consignmentNumber}</Text>
                  {o.estimatedDeliveryDate && (
                    <Text style={styles.courierLine}>• Est. Delivery: {o.estimatedDeliveryDate}</Text>
                  )}
                  {o.trackingUrl && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(o.trackingUrl!).catch(() => {})}
                    >
                      <Text style={styles.courierLinkText}>🌐 Open Official Carrier Tracking Link →</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Action Buttons Row */}
              <View style={styles.cardActionsRow}>
                {/* WhatsApp Buyer Contact Button */}
                <TouchableOpacity
                  style={styles.whatsappBuyerBtn}
                  onPress={() => handleWhatsAppBuyer(o.buyerPhone, o.orderNumber)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.whatsappBuyerBtnText}>💬 WhatsApp Buyer</Text>
                </TouchableOpacity>

                {/* Confirm or Reject if Requested */}
                {isRequested && (
                  <>
                    <TouchableOpacity
                      style={styles.confirmBtn}
                      onPress={() => handleConfirmOrder(o.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.confirmBtnText}>✓ Confirm Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleRejectOrder(o.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.rejectBtnText}>✕ Reject</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* Record Courier Details if Confirmed / Paid & not yet shipped */}
                {(isConfirmed || isPaid) && !isShipped && !isCancelled && (
                  <TouchableOpacity
                    style={styles.dispatchBtn}
                    onPress={() => openShippingModal(o.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.dispatchBtnText}>🚚 Enter Courier Details</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Manual Courier Entry Modal */}
      <Modal
        visible={shippingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setShippingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>📦 Manual Courier / Postal Tracking</Text>
            <Text style={styles.modalSub}>
              Enter carrier details arranged for this order. A tracking link will be generated for the customer.
            </Text>

            {/* Carrier Picker Buttons */}
            <Text style={styles.fieldLabel}>Select Courier or Postal Service:</Text>
            <View style={styles.carrierGrid}>
              {SUPPORTED_CARRIERS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.carrierChip,
                    selectedCarrier === c && styles.carrierChipSelected,
                  ]}
                  onPress={() => setSelectedCarrier(c)}
                >
                  <Text
                    style={[
                      styles.carrierChipText,
                      selectedCarrier === c && styles.carrierChipTextSelected,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Consignment Number */}
            <Text style={styles.fieldLabel}>Tracking / Consignment / AWB Number *:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. EK928194829IN or D12345678"
              placeholderTextColor={colors.textMuted}
              value={consignmentInput}
              onChangeText={setConsignmentInput}
              autoCapitalize="characters"
            />

            {/* Estimated Delivery */}
            <Text style={styles.fieldLabel}>Estimated Delivery (optional):</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 3-4 business days"
              placeholderTextColor={colors.textMuted}
              value={estDeliveryInput}
              onChangeText={setEstDeliveryInput}
            />

            {/* Dispatch Notes */}
            <Text style={styles.fieldLabel}>Dispatch Notes (optional):</Text>
            <TextInput
              style={[styles.modalInput, { height: 60 }]}
              placeholder="e.g. Booked via local post office counter, Speed Post"
              placeholderTextColor={colors.textMuted}
              value={dispatchNotesInput}
              onChangeText={setDispatchNotesInput}
              multiline
            />

            {/* Modal Actions */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShippingModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSaveShipping}
              >
                <Text style={styles.modalSubmitText}>Save & Dispatch</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  orderDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadgeCol: {
    alignItems: 'flex-end',
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  pillRequested: {
    backgroundColor: '#FEF3C7',
  },
  pillConfirmed: {
    backgroundColor: '#DBEAFE',
  },
  pillPaid: {
    backgroundColor: '#DCFCE7',
  },
  pillShipped: {
    backgroundColor: '#E0E7FF',
  },
  pillCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E293B',
  },
  buyerSection: {
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  buyerName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  buyerPhone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginVertical: 2,
  },
  itemsSummary: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 2,
  },
  totalText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: 4,
  },
  paymentStatusBlock: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  paymentStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentBlockLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  paymentBlockVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  valPaid: {
    color: '#15803D',
  },
  valVerifPending: {
    color: '#D97706',
  },
  valPending: {
    color: '#64748B',
  },
  paymentRefRow: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentRefLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  paymentRefVal: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  verifyPayBtn: {
    backgroundColor: '#22C55E',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  verifyPayBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  courierBlock: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  courierBlockTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 4,
  },
  courierLine: {
    fontSize: 11,
    color: '#1E3A8A',
    marginVertical: 1,
  },
  courierLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 6,
    textDecorationLine: 'underline',
  },
  cardActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  whatsappBuyerBtn: {
    backgroundColor: '#25D366',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  whatsappBuyerBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '800',
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  dispatchBtn: {
    backgroundColor: colors.accentDark,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dispatchBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  carrierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  carrierChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  carrierChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  carrierChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  carrierChipTextSelected: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  modalInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  modalSubmitText: {
    fontSize: 13,
    color: colors.textInverse,
    fontWeight: '800',
  },
});
