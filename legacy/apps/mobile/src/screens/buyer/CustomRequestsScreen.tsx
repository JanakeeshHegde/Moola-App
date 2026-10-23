import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';
import { MOCK_CUSTOM_REQUESTS, MockCustomRequest } from '../../services/mockData';

export const CustomRequestsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { locale, t } = useLanguage();
  const [requests, setRequests] = useState<MockCustomRequest[]>(MOCK_CUSTOM_REQUESTS);

  const handleAcceptOffer = (requestId: string, offerId: string, offerPrice: number) => {
    Alert.alert(
      locale === 'kn' ? 'ಆಫರ್ ಸ್ವೀಕರಿಸುವುದೇ?' : 'Accept Offer & Create Order?',
      locale === 'kn'
        ? `ಈ ರೈತರ ಆಫರ್ ಮೊತ್ತ ₹${offerPrice}. ಇದನ್ನು ಸ್ವೀಕರಿಸಿ ಆರ್ಡರ್ ಸೃಷ್ಟಿಸುವುದೇ?`
        : `Accept this farmer's offer of ₹${offerPrice}? This will confirm your order.`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('acceptOffer'),
          onPress: () => {
            setRequests((prev) =>
              prev.map((r) =>
                r.id === requestId
                  ? {
                      ...r,
                      status: 'fulfilled',
                      offers: r.offers.map((o) =>
                        o.id === offerId
                          ? { ...o, status: 'accepted' }
                          : { ...o, status: 'rejected' },
                      ),
                    }
                  : r,
              ),
            );
            navigation.navigate('OrderTracking', {
              orderId: 'ORD-BID-' + Math.floor(1000 + Math.random() * 9000),
              amount: offerPrice,
            });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('reverseMarketTitle')}
        subtitle={t('reverseMarketSubtitle')}
        showCart={true}
        onCartPress={() => navigation.navigate('Cart')}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Post New Request CTA */}
        <TouchableOpacity
          style={styles.newRequestCard}
          onPress={() => navigation.navigate('NewCustomRequest')}
          activeOpacity={0.85}
        >
          <View style={styles.newRequestIconCol}>
            <Text style={styles.newRequestIcon}>✍️</Text>
          </View>
          <View style={styles.newRequestTextCol}>
            <Text style={styles.newRequestTitle}>{t('postNewRequest')}</Text>
            <Text style={styles.newRequestSub}>
              {locale === 'kn'
                ? 'ನಿಮಗೆ ಬೇಕಾದ ಬೆಳೆ, ಕಾಳು ಅಥವಾ ಹಳ್ಳಿಯ ತಿಂಡಿಯ ವಿವರವನ್ನು ನಮೂದಿಸಿ'
                : 'Need heritage red rice, pure cold-pressed oil, or home sweets? Request our farmers directly.'}
            </Text>
          </View>
          <Text style={styles.newRequestArrow}>→</Text>
        </TouchableOpacity>

        {/* Requests List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {locale === 'kn' ? 'ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಬೇಡಿಕೆಗಳು' : 'Active Buyer Requests'}
          </Text>
          <Text style={styles.requestCount}>({requests.length})</Text>
        </View>

        {requests.map((req) => (
          <View key={req.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>{req.category}</Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  req.status === 'fulfilled' ? styles.statusFulfilled : styles.statusOpen,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    req.status === 'fulfilled'
                      ? styles.statusTextFulfilled
                      : styles.statusTextOpen,
                  ]}
                >
                  {req.status === 'fulfilled' ? '● Order Confirmed' : '● Open for Bids'}
                </Text>
              </View>
            </View>

            <Text style={styles.reqTitle}>{req.title}</Text>
            <Text style={styles.reqDesc}>{req.description}</Text>

            <View style={styles.reqDetailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Quantity:</Text>
                <Text style={styles.detailValue}>
                  {req.quantity} {req.unit}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Target Budget:</Text>
                <Text style={styles.detailValue}>Up to ₹{req.budgetMax}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Needed by:</Text>
                <Text style={styles.detailValue}>{req.expectedDate}</Text>
              </View>
            </View>

            {/* Farmer Offers / Quotes */}
            <View style={styles.offersSection}>
              <Text style={styles.offersHeading}>
                👨‍🌾 {t('offersReceived')} ({req.offers.length})
              </Text>

              {req.offers.length === 0 ? (
                <Text style={styles.noOffersText}>
                  {locale === 'kn'
                    ? 'ರೈತರಿಂದ ಆಫರ್‌ಗಳು ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿವೆ...'
                    : 'Farmers in this category are reviewing your request...'}
                </Text>
              ) : (
                req.offers.map((offer) => (
                  <View key={offer.id} style={styles.offerCard}>
                    <View style={styles.offerTopRow}>
                      <View>
                        <Text style={styles.offerSellerName}>
                          {offer.seller.shopName}
                        </Text>
                        <Text style={styles.offerSellerLoc}>
                          📍 {offer.seller.location} • ★ {offer.seller.rating}
                        </Text>
                      </View>
                      <View style={styles.offerPriceCol}>
                        <Text style={styles.offerPrice}>₹{offer.price}</Text>
                        <Text style={styles.offerDelivery}>in {offer.deliveryDays} days</Text>
                      </View>
                    </View>

                    <Text style={styles.offerMessage}>"{offer.message}"</Text>

                    {offer.status === 'accepted' ? (
                      <View style={styles.acceptedPill}>
                        <Text style={styles.acceptedText}>✓ Offer Accepted & Order Placed</Text>
                      </View>
                    ) : (
                      <View style={styles.offerActionsRow}>
                        <TouchableOpacity
                          style={styles.negotiateBtn}
                          onPress={() =>
                            navigation.navigate('Chat', { recipient: offer.seller })
                          }
                          activeOpacity={0.7}
                        >
                          <Text style={styles.negotiateBtnText}>💬 {t('chatWithFarmer')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.acceptBtn}
                          onPress={() => handleAcceptOffer(req.id, offer.id, offer.price)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.acceptBtnText}>{t('acceptOffer')} →</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          </View>
        ))}
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
  newRequestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E6D7AD',
    marginBottom: 20,
    elevation: 2,
  },
  newRequestIconCol: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  newRequestIcon: {
    fontSize: 22,
  },
  newRequestTextCol: {
    flex: 1,
  },
  newRequestTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  newRequestSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  newRequestArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accentDark,
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  requestCount: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  requestCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagPill: {
    backgroundColor: colors.surface,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  statusPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  statusOpen: {
    backgroundColor: '#FEF3C7',
  },
  statusFulfilled: {
    backgroundColor: colors.organicBg,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextOpen: {
    color: colors.accentDark,
  },
  statusTextFulfilled: {
    color: colors.organicGreen,
  },
  reqTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  reqDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 17,
  },
  reqDetailsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  offersSection: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 12,
  },
  offersHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  noOffersText: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  offerCard: {
    backgroundColor: '#F9FAF7',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E4ECD8',
    marginBottom: 8,
  },
  offerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerSellerName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  offerSellerLoc: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  offerPriceCol: {
    alignItems: 'flex-end',
  },
  offerPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  offerDelivery: {
    fontSize: 10,
    color: colors.textMuted,
  },
  offerMessage: {
    fontSize: 11,
    color: colors.textPrimary,
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 16,
  },
  offerActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  negotiateBtn: {
    flex: 1,
    backgroundColor: colors.card,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  negotiateBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  acceptBtn: {
    flex: 1.2,
    backgroundColor: colors.primary,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textInverse,
  },
  acceptedPill: {
    backgroundColor: colors.organicBg,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  acceptedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.organicGreen,
  },
});
