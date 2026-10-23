import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';

import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { MockProduct } from '../../services/mockData';
import { apiService } from '../../services/api';
import {
  buildWhatsAppChatUrl,
  formatWhatsAppEnquiryMessage,
} from '@moola/shared';

export const ProductDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { product } = route.params as { product: MockProduct };
  const { locale, t } = useLanguage();
  const { addItem } = useCart();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [qty, setQty] = useState(1);

  const displayName = locale === 'kn' && product.nameKn ? product.nameKn : product.name;
  const displayDesc =
    locale === 'kn' && product.descriptionKn ? product.descriptionKn : product.description;

  const handleWhatsAppEnquiry = async () => {
    const rawNumber = product.seller.whatsappNumber;
    if (!rawNumber) {
      Alert.alert(
        locale === 'kn' ? 'ಸಂಪರ್ಕ ಲಭ್ಯವಿಲ್ಲ' : 'WhatsApp Contact Unavailable',
        locale === 'kn'
          ? 'ಮಾರಾಟಗಾರರು ವಾಟ್ಸಾಪ್ ಸಂಖ್ಯೆಯನ್ನು ಕಾನ್ಫಿಗರ್ ಮಾಡಿಲ್ಲ. ದಯವಿಟ್ಟು ಇನ್-ಆ್ಯಪ್ ಚಾಟ್ ಬಳಸಿ.'
          : 'Seller has not configured a WhatsApp number yet. Please use the in-app chat.',
      );
      return;
    }

    const message = formatWhatsAppEnquiryMessage({
      productName: displayName,
      productId: product.id,
      quantity: qty,
      unit: product.unit,
      price: product.price,
    });

    const url = buildWhatsAppChatUrl(rawNumber, message);

    // Record enquiry in MongoDB via centralized API service (safe: non-blocking)
    apiService.enquiries
      .create({
        productId: product.id,
        quantity: qty,
        unit: product.unit,
        notes: 'Customer initiated enquiry from mobile app product screen',
      })
      .catch((err) => {
        // Safe: non-blocking, mobile proceeds directly to WhatsApp chat
        console.log('[ProductDetailScreen] Offline or enquiry sync notice:', err.message || err);
      });

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(url);
      }
    } catch {
      Alert.alert(
        'WhatsApp Not Found',
        'Could not launch WhatsApp. You can also chat directly using in-app chat.',
      );
    }
  };

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        nameKn: product.nameKn,
        price: product.price,
        unit: product.unit,
        image: product.images[0],
        sellerId: product.seller.id,
        sellerName: product.seller.shopName,
        isOrganic: product.isOrganic,
      },
      qty,
    );
    Alert.alert('Added to Cart', `${qty}x ${displayName} added to your cart.`);
  };

  const handlePlaceOrderRequest = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        nameKn: product.nameKn,
        price: product.price,
        unit: product.unit,
        image: product.images[0],
        sellerId: product.seller.id,
        sellerName: product.seller.shopName,
        isOrganic: product.isOrganic,
      },
      qty,
    );
    navigation.navigate('Checkout');
  };


  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Image */}
        <View style={styles.imageGallery}>
          <Image
            source={{ uri: product.images[selectedImageIdx] || product.images[0] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          {product.isOrganic && (
            <View style={styles.organicFloatingBadge}>
              <Text style={styles.organicFloatingText}>
                🌱 {locale === 'kn' ? 'ಪ್ರಮಾಣೀಕೃತ ಸಾವಯವ' : 'Certified Organic'}
              </Text>
            </View>
          )}
        </View>

        {/* Thumbnail Selector */}
        {product.images.length > 1 && (
          <View style={styles.thumbRow}>
            {product.images.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedImageIdx(idx)}
                style={[
                  styles.thumbButton,
                  selectedImageIdx === idx && styles.thumbButtonActive,
                ]}
              >
                <Image source={{ uri: img }} style={styles.thumbImage} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.body}>
          {/* Header Info */}
          <View style={styles.categoryAndIdRow}>
            <Text style={styles.categoryName}>{product.categoryName}</Text>
            <View style={styles.productIdBadge}>
              <Text style={styles.productIdText}>ID: #{product.id}</Text>
            </View>
          </View>
          <Text style={styles.title}>{displayName}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price}</Text>
            <Text style={styles.unit}>/{product.unit}</Text>
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>
                ● {product.stock > 0 ? t('inStock') : t('outOfStock')}
              </Text>
            </View>
          </View>

          {/* WhatsApp Direct Enquiry Card */}
          <View style={styles.whatsappCard}>
            <View style={styles.whatsappHeader}>
              <Text style={styles.whatsappIcon}>💬</Text>
              <View style={styles.whatsappHeaderTextCol}>
                <Text style={styles.whatsappTitle}>
                  {locale === 'kn' ? 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ವಿಚಾರಿಸಿ' : 'Enquire on WhatsApp'}
                </Text>
                <Text style={styles.whatsappSub}>
                  {locale === 'kn'
                    ? 'ಲಭ್ಯತೆ, ತಾಜಾತನ, ಕೊರಿಯರ್ ವಿತರಣೆ ಮತ್ತು ಪಾವತಿ ವಿವರಗಳನ್ನು ನೇರವಾಗಿ ಚರ್ಚಿಸಿ.'
                    : 'Chat directly with seller to confirm batch availability, dispatch & payment options.'}
                </Text>
              </View>
            </View>

            <View style={styles.enquiryDetailsBox}>
              <Text style={styles.enquiryDetailLine}>
                • <Text style={styles.boldText}>Product:</Text> {displayName}
              </Text>
              <Text style={styles.enquiryDetailLine}>
                • <Text style={styles.boldText}>Product ID:</Text> {product.id}
              </Text>
              <Text style={styles.enquiryDetailLine}>
                • <Text style={styles.boldText}>Selected Quantity:</Text> {qty} {product.unit}
              </Text>
              <Text style={styles.enquiryDetailLine}>
                • <Text style={styles.boldText}>Calculated Price:</Text> ₹{product.price * qty}
              </Text>
              <Text style={styles.enquiryDetailLine}>
                • <Text style={styles.boldText}>Seller Contact:</Text> {product.seller.whatsappNumber || 'Configured via MOOLA'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={handleWhatsAppEnquiry}
              activeOpacity={0.85}
            >
              <Text style={styles.whatsappButtonText}>
                💬 {locale === 'kn' ? 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಸಂದೇಶ ಕಳುಹಿಸಿ' : 'Chat & Enquire on WhatsApp'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Organic Certificate Proof */}
          {product.isOrganic && (
            <View style={styles.certCard}>
              <Text style={styles.certIcon}>🛡️</Text>
              <View style={styles.certContent}>
                <Text style={styles.certTitle}>
                  {locale === 'kn' ? 'ಸರ್ಕಾರದಿಂದ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿದೆ' : 'Verified Homemade & Organic'}
                </Text>
                <Text style={styles.certSub}>
                  {product.certificationNumber || 'FSSAI / PGS-INDIA / Natural'} • Grandma Recipe • Zero Chemicals
                </Text>
              </View>
            </View>
          )}

          {/* Farmer Card */}
          <View style={styles.farmerCard}>
            <Image source={{ uri: product.seller.avatar }} style={styles.farmerAvatar} />
            <View style={styles.farmerInfo}>
              <Text style={styles.farmerLabel}>{t('farmerDetails')}</Text>
              <Text style={styles.farmerShop}>{product.seller.shopName}</Text>
              <Text style={styles.farmerLocation}>📍 {product.seller.location}</Text>
              <Text style={styles.farmerRating}>★ {product.seller.rating} ({product.seller.ratingCount} reviews)</Text>
            </View>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => navigation.navigate('Chat', { recipient: product.seller, product })}
            >
              <Text style={styles.chatButtonText}>💬 {t('chat')}</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.descSection}>
            <Text style={styles.sectionHeading}>
              {locale === 'kn' ? 'ಉತ್ಪನ್ನದ ಬಗ್ಗೆ' : 'About this Homemade Product'}
            </Text>
            <Text style={styles.descText}>{displayDesc}</Text>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionHeading}>{t('customerReviews')}</Text>
              <Text style={styles.reviewsRating}>★ {product.rating} / 5</Text>
            </View>

            <View style={styles.reviewItem}>
              <View style={styles.reviewerHeader}>
                <Text style={styles.reviewerName}>Ananya Rao</Text>
                <Text style={styles.reviewVerified}>✓ Verified Buyer</Text>
              </View>
              <Text style={styles.reviewStars}>★★★★★</Text>
              <Text style={styles.reviewBody}>
                "The aroma and crispness of these homemade chips is exceptional. Fresh batch, authentic taste, and quick seller response on WhatsApp!"
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.qtyControl}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{qty}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty((q) => q + 1)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.whatsappMiniBtn}
          onPress={handleWhatsAppEnquiry}
          activeOpacity={0.8}
        >
          <Text style={styles.whatsappMiniText}>💬</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={handleAddToCart}
          activeOpacity={0.8}
        >
          <Text style={styles.addToCartText}>{t('addToCart')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyNowBtn}
          onPress={handlePlaceOrderRequest}
          activeOpacity={0.8}
        >
          <Text style={styles.buyNowText}>
            {locale === 'kn' ? 'ಆರ್ಡರ್ ವಿನಂತಿ' : 'Order Request'}
          </Text>
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
    paddingBottom: 100,
  },
  imageGallery: {
    position: 'relative',
    height: 300,
    backgroundColor: colors.surface,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  organicFloatingBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: colors.organicBg,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.25)',
  },
  organicFloatingText: {
    color: colors.organicGreen,
    fontSize: 12,
    fontWeight: '800',
  },
  thumbRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    backgroundColor: colors.card,
  },
  thumbButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  thumbButtonActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  body: {
    padding: 16,
  },
  categoryName: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
    lineHeight: 26,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  unit: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  stockBadge: {
    marginLeft: 14,
    backgroundColor: colors.organicBg,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 11,
    color: colors.organicGreen,
    fontWeight: '700',
  },
  certCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  certIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  certContent: {
    flex: 1,
  },
  certTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  certSub: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
  },
  farmerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  farmerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },
  farmerInfo: {
    flex: 1,
  },
  farmerLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  farmerShop: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  farmerLocation: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  farmerRating: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '700',
    marginTop: 2,
  },
  chatButton: {
    backgroundColor: colors.primarySubtle,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  chatButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  descSection: {
    marginTop: 20,
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  descText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  reviewsSection: {
    marginTop: 14,
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewsRating: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.accent,
  },
  reviewItem: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 10,
  },
  reviewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reviewVerified: {
    fontSize: 11,
    color: colors.organicGreen,
    fontWeight: '700',
  },
  reviewStars: {
    color: colors.accent,
    fontSize: 12,
    marginTop: 2,
  },
  reviewBody: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 17,
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
    alignItems: 'center',
    gap: 8,
    elevation: 8,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 30,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 8,
    color: colors.textPrimary,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  buyNowBtn: {
    flex: 1.2,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buyNowText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textInverse,
  },
  categoryAndIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productIdBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  productIdText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentDark,
  },
  whatsappCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#22C55E',
    borderRadius: 14,
    padding: 14,
    marginVertical: 12,
  },
  whatsappHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  whatsappIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  whatsappHeaderTextCol: {
    flex: 1,
  },
  whatsappTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#15803D',
  },
  whatsappSub: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
    lineHeight: 16,
  },
  enquiryDetailsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  enquiryDetailLine: {
    fontSize: 12,
    color: '#1E293B',
    marginVertical: 2,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  whatsappButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  whatsappMiniBtn: {
    backgroundColor: '#25D366',
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsappMiniText: {
    fontSize: 20,
  },
});

