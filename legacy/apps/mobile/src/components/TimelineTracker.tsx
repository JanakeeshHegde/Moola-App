import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

export interface TrackingStep {
  status: string;
  location?: string;
  timestamp: string;
  description: string;
}

interface TimelineTrackerProps {
  currentStatus: string;
  consignmentNumber?: string;
  carrierName?: string;
  dispatchDate?: string;
  estimatedDeliveryDate?: string;
  trackingUrl?: string;
  dispatchNotes?: string;
  sellerUpdates?: Array<{ status: string; note?: string; timestamp?: string }>;
}

const ORDER_STEPS = [
  { key: 'ORDER_REQUESTED', en: 'Order Requested', kn: 'ಆರ್ಡರ್ ವಿನಂತಿ ಸಲ್ಲಿಸಲಾಗಿದೆ', icon: '📝' },
  { key: 'ORDER_CONFIRMED', en: 'Confirmed by Seller', kn: 'ಮಾರಾಟಗಾರರು ದೃಢೀಕರಿಸಿದ್ದಾರೆ', icon: '🤝' },
  { key: 'PAID', en: 'Payment Verified', kn: 'ಪಾವತಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ', icon: '💳' },
  { key: 'PACKED', en: 'Freshly Packed', kn: 'ತಾಜಾವಾಗಿ ಪ್ಯಾಕ್ ಮಾಡಲಾಗಿದೆ', icon: '📦' },
  { key: 'SHIPPED', en: 'Dispatched via Courier', kn: 'ಕೊರಿಯರ್/ಅಂಚೆ ರವಾನಿಸಲಾಗಿದೆ', icon: '🚚' },
  { key: 'DELIVERED', en: 'Delivered to Home', kn: 'ಮನೆಗೆ ತಲುಪಿಸಲಾಗಿದೆ', icon: '🏡' },
];

export const TimelineTracker: React.FC<TimelineTrackerProps> = ({
  currentStatus = 'ORDER_REQUESTED',
  consignmentNumber = 'EK928194829IN',
  carrierName = 'India Post',
  dispatchDate,
  estimatedDeliveryDate,
  trackingUrl,
  dispatchNotes,
  sellerUpdates: _sellerUpdates = [],
}) => {
  const { locale } = useLanguage();

  const statusKey = currentStatus.toUpperCase();
  const currentIndex = ORDER_STEPS.findIndex((s) => s.key === statusKey);
  const activeIdx = currentIndex === -1 ? (statusKey === 'CANCELLED' ? -1 : 0) : currentIndex;

  const handleOpenTrackingUrl = () => {
    if (trackingUrl) {
      Linking.openURL(trackingUrl).catch(() => {});
    }
  };

  return (
    <View style={styles.container}>
      {/* Postal/Courier Meta Card */}
      <View style={styles.metaCard}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Courier / Postal Service:</Text>
          <Text style={styles.metaValue}>{carrierName}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Tracking / Consignment No:</Text>
          <Text style={styles.metaValue}>{consignmentNumber}</Text>
        </View>
        {dispatchDate && (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Dispatch Date:</Text>
            <Text style={styles.metaValue}>{dispatchDate}</Text>
          </View>
        )}
        {estimatedDeliveryDate && (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Est. Delivery:</Text>
            <Text style={[styles.metaValue, { color: colors.organicGreen }]}>
              {estimatedDeliveryDate}
            </Text>
          </View>
        )}
        {dispatchNotes ? (
          <View style={styles.notesRow}>
            <Text style={styles.notesLabel}>Seller Dispatch Note:</Text>
            <Text style={styles.notesValue}>{dispatchNotes}</Text>
          </View>
        ) : null}

        {/* Official Carrier Tracking Button */}
        {trackingUrl ? (
          <TouchableOpacity
            style={styles.trackLinkBtn}
            onPress={handleOpenTrackingUrl}
            activeOpacity={0.8}
          >
            <Text style={styles.trackLinkText}>🌐 Track on Official {carrierName} Website →</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Seller-Provided Updates Notice */}
      <View style={styles.transparencyNotice}>
        <Text style={styles.transparencyText}>
          ℹ️ {locale === 'kn'
            ? 'ಇದು ಮಾರಾಟಗಾರರಿಂದ ನಮೂದಿಸಲಾದ ಕೊರಿಯರ್ ವಿವರಗಳು. ಅಧಿಕೃತ ಸೈಟ್‌ನಲ್ಲಿ ನೇರ ಟ್ರ್ಯಾಕಿಂಗ್ ವೀಕ್ಷಿಸಬಹುದು.'
            : 'Seller-provided manual tracking updates. Click above to track directly on the carrier website.'}
        </Text>
      </View>

      {/* Step Indicators */}
      <View style={styles.timelineList}>
        {ORDER_STEPS.map((step, idx) => {
          const isDone = idx <= activeIdx;
          const isCurrent = idx === activeIdx;
          const label = locale === 'kn' ? step.kn : step.en;

          return (
            <View key={step.key} style={styles.stepRow}>
              {/* Timeline Indicator Column */}
              <View style={styles.indicatorColumn}>
                <View
                  style={[
                    styles.node,
                    isDone ? styles.nodeDone : styles.nodePending,
                    isCurrent && styles.nodeCurrent,
                  ]}
                >
                  <Text style={styles.nodeIcon}>{step.icon}</Text>
                </View>
                {idx < ORDER_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.connectingLine,
                      idx < activeIdx ? styles.lineDone : styles.linePending,
                    ]}
                  />
                )}
              </View>

              {/* Step Details Column */}
              <View style={styles.detailsColumn}>
                <View style={styles.stepHeader}>
                  <Text
                    style={[
                      styles.stepTitle,
                      isDone ? styles.stepTitleDone : styles.stepTitlePending,
                      isCurrent && styles.stepTitleCurrent,
                    ]}
                  >
                    {label}
                  </Text>
                  {isCurrent && (
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>
                        {locale === 'kn' ? 'ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ' : 'Current'}
                      </Text>
                    </View>
                  )}
                </View>

                {isDone && (
                  <Text style={styles.stepTimestamp}>
                    {idx === 0
                      ? 'Order request placed by customer'
                      : idx === 1
                        ? 'Confirmed by seller for fulfillment'
                        : idx === 2
                          ? 'Payment verified by seller'
                          : idx === 3
                            ? 'Fresh batch packed and sealed'
                            : idx === 4
                              ? `Handed over to ${carrierName}`
                              : 'Successfully delivered'}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  metaCard: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  notesRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  notesLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  notesValue: {
    fontSize: 12,
    color: colors.textPrimary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  trackLinkBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  trackLinkText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '800',
  },
  transparencyNotice: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: colors.organicGreen,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 16,
  },
  transparencyText: {
    fontSize: 11,
    color: colors.primaryDark,
    lineHeight: 15,
  },
  timelineList: {
    paddingLeft: 4,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  indicatorColumn: {
    alignItems: 'center',
    width: 36,
  },
  node: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  nodeDone: {
    backgroundColor: colors.organicBg,
    borderWidth: 2,
    borderColor: colors.organicGreen,
  },
  nodePending: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  nodeCurrent: {
    backgroundColor: colors.primarySubtle,
    borderWidth: 2.5,
    borderColor: colors.primary,
  },
  nodeIcon: {
    fontSize: 13,
  },
  connectingLine: {
    width: 2.5,
    flex: 1,
    marginVertical: 2,
  },
  lineDone: {
    backgroundColor: colors.organicGreen,
  },
  linePending: {
    backgroundColor: colors.border,
  },
  detailsColumn: {
    flex: 1,
    paddingLeft: 14,
    paddingBottom: 14,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  stepTitleDone: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  stepTitlePending: {
    color: colors.textMuted,
  },
  stepTitleCurrent: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
  activePill: {
    backgroundColor: colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  activePillText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
  },
  stepTimestamp: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
