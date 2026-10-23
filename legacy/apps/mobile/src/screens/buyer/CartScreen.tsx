import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { Header } from '../../components/Header';

export const CartScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { locale, t } = useLanguage();
  const { items, updateQty, subtotal, deliveryFee, totalPayable } = useCart();

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Header title={t('cartTitle')} showCart={false} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>{t('emptyCart')}</Text>
          <Text style={styles.emptySubtitle}>
            {locale === 'kn'
              ? 'ತಾಜಾ ಸಾವಯವ ಉತ್ಪನ್ನಗಳನ್ನು ನೋಡಿ ಮತ್ತು ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ'
              : 'Explore organic produce from our local farmers'}
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseButtonText}>
              {locale === 'kn' ? 'ಉತ್ಪನ್ನಗಳನ್ನು ನೋಡಿ' : 'Browse Products'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const freeDeliveryDiff = Math.max(0, 500 - subtotal);

  return (
    <View style={styles.container}>
      <Header title={t('cartTitle')} showCart={false} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Free Delivery Banner */}
        <View style={styles.deliveryBanner}>
          <Text style={styles.deliveryBannerIcon}>🚚</Text>
          <Text style={styles.deliveryBannerText}>
            {freeDeliveryDiff > 0
              ? locale === 'kn'
                ? `ಇನ್ನೂ ₹${freeDeliveryDiff} ಸೇರಿಸಿದರೆ ಉಚಿತ ಡೆಲಿವರಿ ಸಿಗುತ್ತದೆ!`
                : `Add ₹${freeDeliveryDiff} more to get FREE Delivery!`
              : locale === 'kn'
                ? '🎉 ಈ ಆರ್ಡರ್‌ಗೆ ಉಚಿತ ಡೆಲಿವರಿ ಲಭ್ಯವಿದೆ!'
                : '🎉 You have unlocked FREE Delivery!'}
          </Text>
        </View>

        {/* Cart Items List */}
        <View style={styles.itemsSection}>
          {items.map((item) => {
            const displayName =
              locale === 'kn' && item.product.nameKn
                ? item.product.nameKn
                : item.product.name;

            return (
              <View key={item.product.id} style={styles.itemCard}>
                <Image
                  source={{ uri: item.product.image }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {displayName}
                  </Text>
                  <Text style={styles.sellerName}>{item.product.sellerName}</Text>
                  <Text style={styles.itemPrice}>
                    ₹{item.product.price}{' '}
                    <Text style={styles.itemUnit}>/{item.product.unit}</Text>
                  </Text>
                </View>

                {/* Stepper */}
                <View style={styles.stepperCol}>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => updateQty(item.product.id, item.qty - 1)}
                    >
                      <Text style={styles.stepperBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepperVal}>{item.qty}</Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => updateQty(item.product.id, item.qty + 1)}
                    >
                      <Text style={styles.stepperBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.lineTotal}>₹{item.product.price * item.qty}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Bill Summary */}
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

      {/* Checkout Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>{t('totalPayable')}</Text>
          <Text style={styles.bottomTotal}>₹{totalPayable}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Checkout')}
          activeOpacity={0.85}
        >
          <Text style={styles.checkoutBtnText}>{t('proceedToCheckout')} →</Text>
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
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 54,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  browseButtonText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '700',
  },
  deliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.organicBg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.2)',
  },
  deliveryBannerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  deliveryBannerText: {
    fontSize: 12,
    color: colors.organicGreen,
    fontWeight: '700',
    flex: 1,
  },
  itemsSection: {
    gap: 12,
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sellerName: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: 4,
  },
  itemUnit: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  stepperCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  stepperVal: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  lineTotal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  summaryHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    marginTop: 8,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 15,
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
  bottomTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  checkoutBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  checkoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textInverse,
  },
});
