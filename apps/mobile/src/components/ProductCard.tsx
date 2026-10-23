import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { MockProduct } from '../services/mockData';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: MockProduct;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const { locale, t } = useLanguage();
  const { addItem } = useCart();

  const displayName = locale === 'kn' && product.nameKn ? product.nameKn : product.name;

  const handleAddToCart = (e: any) => {
    e?.stopPropagation?.();
    addItem({
      id: product.id,
      name: product.name,
      nameKn: product.nameKn,
      price: product.price,
      unit: product.unit,
      image: product.images[0],
      sellerId: product.seller.id,
      sellerName: product.seller.shopName,
      isOrganic: product.isOrganic,
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.images[0] }} style={styles.image} resizeMode="cover" />
        {product.isOrganic && (
          <View style={styles.organicBadge}>
            <Text style={styles.organicText}>🌱 {locale === 'kn' ? 'ಸಾವಯವ' : 'Organic'}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.originText}>📍 {product.farmOrigin}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {displayName}
        </Text>

        <View style={styles.sellerRow}>
          <Text style={styles.sellerName} numberOfLines={1}>
            {product.seller.shopName}
          </Text>
          <Text style={styles.rating}>★ {product.rating}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{product.price}</Text>
            <Text style={styles.unit}>/{product.unit}</Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToCart}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+ {t('addToCart')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 150,
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  organicBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.organicBg,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.2)',
  },
  organicText: {
    color: colors.organicGreen,
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: 12,
  },
  originText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 3,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 19,
    minHeight: 38,
  },
  sellerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  sellerName: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  rating: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '700',
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 8,
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  unit: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '700',
  },
});
