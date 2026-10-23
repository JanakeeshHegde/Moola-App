import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';
import { MOCK_CAMPAIGNS, MockCampaign } from '../../services/mockData';

export const PreBookingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { locale, t } = useLanguage();
  const [campaigns, setCampaigns] = useState<MockCampaign[]>(MOCK_CAMPAIGNS);

  const handlePreBook = (campaign: MockCampaign) => {
    Alert.alert(
      locale === 'kn' ? 'ಮುಂಗಡ ಕಾಯ್ದಿರಿಸುವಿಕೆ' : 'Confirm Harvest Pre-Booking',
      locale === 'kn'
        ? `ಉತ್ಪನ್ನ: ${campaign.titleKn}\nಬೆಲೆ: ₹${campaign.price} / ${campaign.unit}\n\nನಿಮ್ಮ ಪಾಲನ್ನು ಕಾಯ್ದಿರಿಸುವುದೇ? ಕೊಯ್ಲಿನ ನಂತರ ನೇರವಾಗಿ ಮನೆಗೆ ತಲುಪಿಸಲಾಗುವುದು.`
        : `Product: ${campaign.title}\nPrice: ₹${campaign.price} / ${campaign.unit}\n\nReserve your share? The batch will be packed tree-fresh upon harvest and shipped to your home.`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('preBookNow'),
          onPress: () => {
            setCampaigns((prev) =>
              prev.map((c) =>
                c.id === campaign.id
                  ? { ...c, bookedCapacity: Math.min(c.totalCapacity, c.bookedCapacity + 1) }
                  : c,
              ),
            );
            navigation.navigate('OrderTracking', {
              orderId: 'CAMP-' + Math.floor(1000 + Math.random() * 9000),
              amount: campaign.price,
            });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('preBookingTitle')}
        subtitle={t('preBookingSubtitle')}
        showCart={true}
        onCartPress={() => navigation.navigate('Cart')}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {campaigns.map((camp) => {
          const title = locale === 'kn' ? camp.titleKn : camp.title;
          const desc = locale === 'kn' ? camp.descriptionKn : camp.description;
          const percent = Math.min(100, Math.round((camp.bookedCapacity / camp.totalCapacity) * 100));

          return (
            <View key={camp.id} style={styles.card}>
              <View style={styles.imageContainer}>
                <Image source={{ uri: camp.bannerImage }} style={styles.bannerImage} />
                <View style={styles.deadlineTag}>
                  <Text style={styles.deadlineText}>
                    ⏳ {t('bookingDeadline')}: {camp.bookingDeadline}
                  </Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.campTitle}>{title}</Text>
                <Text style={styles.campDesc}>{desc}</Text>

                {/* Farmer Details */}
                <View style={styles.sellerRow}>
                  <Image source={{ uri: camp.seller.avatar }} style={styles.sellerAvatar} />
                  <View>
                    <Text style={styles.sellerName}>{camp.seller.shopName}</Text>
                    <Text style={styles.sellerLoc}>📍 {camp.seller.location}</Text>
                  </View>
                </View>

                {/* Capacity Progress Meter */}
                <View style={styles.capacitySection}>
                  <View style={styles.capacityHeader}>
                    <Text style={styles.capacityLabel}>{t('capacityRemaining')}:</Text>
                    <Text style={styles.capacityVal}>
                      {camp.bookedCapacity} / {camp.totalCapacity} {camp.unit} booked ({percent}%)
                    </Text>
                  </View>

                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
                  </View>
                </View>

                {/* Pricing & CTA */}
                <View style={styles.footerRow}>
                  <View>
                    <Text style={styles.priceLabel}>Pre-Booking Price:</Text>
                    <Text style={styles.priceText}>
                      ₹{camp.price}{' '}
                      <Text style={styles.priceUnit}>/{camp.unit}</Text>
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.reserveBtn}
                    onPress={() => handlePreBook(camp)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.reserveBtnText}>🌾 {t('reserveSlot')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  deadlineTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  deadlineText: {
    color: '#FEF3C7',
    fontSize: 11,
    fontWeight: '700',
  },
  cardContent: {
    padding: 16,
  },
  campTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primaryDark,
    lineHeight: 22,
  },
  campDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  sellerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  sellerName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sellerLoc: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  capacitySection: {
    marginTop: 14,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  capacityLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  capacityVal: {
    fontSize: 11,
    color: colors.accentDark,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 12,
  },
  priceLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  reserveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  reserveBtnText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '800',
  },
});
