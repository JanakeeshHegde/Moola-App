import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { ProductCard } from '../../components/ProductCard';
import { ApplySellerModal } from '../seller/ApplySellerModal';
import { apiService } from '../../services/api';
import {
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_CAMPAIGNS,
  MOCK_SELLERS,
  MockProduct,
} from '../../services/mockData';

function formatApiProduct(apiProd: any): MockProduct {
  const pId = apiProd._id || apiProd.id || `p_${Date.now()}`;
  const nameEn =
    typeof apiProd.name === 'object' && apiProd.name
      ? apiProd.name.en || apiProd.name.kn || 'Homemade Product'
      : apiProd.name || 'Homemade Product';
  const nameKn =
    typeof apiProd.name === 'object' && apiProd.name
      ? apiProd.name.kn || nameEn
      : apiProd.nameKn || nameEn;

  const descEn =
    typeof apiProd.description === 'object' && apiProd.description
      ? apiProd.description.en || apiProd.description.kn || ''
      : apiProd.description || '';
  const descKn =
    typeof apiProd.description === 'object' && apiProd.description
      ? apiProd.description.kn || descEn
      : apiProd.descriptionKn || descEn;

  const rawCat = apiProd.categoryId;
  const categoryId =
    typeof rawCat === 'object' && rawCat ? rawCat._id || rawCat.slug : rawCat || 'cat_all';
  const categoryName =
    typeof rawCat === 'object' && rawCat?.name
      ? typeof rawCat.name === 'object'
        ? rawCat.name.en
        : rawCat.name
      : 'Homemade Food';
  const categoryNameKn =
    typeof rawCat === 'object' && rawCat?.name
      ? typeof rawCat.name === 'object'
        ? rawCat.name.kn
        : rawCat.name
      : categoryName;

  const rawSeller = apiProd.sellerId;
  const sellerId =
    typeof rawSeller === 'object' && rawSeller ? rawSeller._id || rawSeller.id : rawSeller || 'seller_002';
  const sellerName =
    typeof rawSeller === 'object' && rawSeller?.name ? rawSeller.name : 'Verified Artisan';
  const shopName =
    apiProd.shopName ||
    (typeof rawSeller === 'object' && rawSeller?.shopName) ||
    sellerName;

  return {
    id: pId,
    name: nameEn,
    nameKn: nameKn,
    categoryId,
    categoryName,
    categoryNameKn,
    price: typeof apiProd.price === 'number' ? apiProd.price : 150,
    unit: apiProd.unit || 'pack',
    images:
      Array.isArray(apiProd.images) && apiProd.images.length > 0
        ? apiProd.images
        : ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600'],
    seller: {
      id: sellerId,
      name: sellerName,
      shopName: shopName,
      location: apiProd.farmOrigin || 'Karnataka, India',
      rating: apiProd.averageRating || 4.8,
      ratingCount: apiProd.reviewCount || 10,
      isVerified: true,
      avatar:
        (typeof rawSeller === 'object' && rawSeller?.avatar) ||
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      bio: 'Authentic maker of traditional homemade food products.',
      whatsappNumber:
        (typeof rawSeller === 'object' && rawSeller?.whatsappNumber) ||
        apiProd.whatsappNumber ||
        '+919000000002',
      whatsappVerified: true,
      upiId: apiProd.upiId,
      paymentInstructions: apiProd.paymentInstructions,
    },
    description: descEn,
    descriptionKn: descKn,
    isOrganic: !!apiProd.isOrganic,
    stock: typeof apiProd.quantityAvailable === 'number' ? apiProd.quantityAvailable : 50,
    farmOrigin: apiProd.farmOrigin || 'Karnataka, India',
    rating: apiProd.averageRating || 4.8,
    ratingCount: apiProd.reviewCount || 10,
  };
}

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { locale, t } = useLanguage();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('cat_all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<MockProduct[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<any[]>(MOCK_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const fetchLiveProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // 1. Fetch categories from backend
      const catRes = await apiService.categories.list().catch(() => null);
      if (
        catRes?.data?.categories &&
        Array.isArray(catRes.data.categories) &&
        catRes.data.categories.length > 0
      ) {
        const liveCats = [
          { id: 'cat_all', name: 'All Products', nameKn: 'ಎಲ್ಲ ಉತ್ಪನ್ನಗಳು', icon: '🌿' },
          ...catRes.data.categories.map((c: any) => ({
            id: c._id || c.slug,
            name: typeof c.name === 'object' ? c.name.en : c.name,
            nameKn: typeof c.name === 'object' ? c.name.kn : undefined,
            icon: c.icon || '📦',
          })),
        ];
        setCategories(liveCats);
      }

      // 2. Fetch products from MongoDB
      const prodRes = await apiService.products.list({ limit: 50 }).catch(() => null);
      const rawList = prodRes?.data?.data || prodRes?.data?.products;
      if (rawList && Array.isArray(rawList)) {
        if (rawList.length > 0) {
          const formatted = rawList.map(formatApiProduct);
          setProducts(formatted);
        } else {
          // Empty DB or no active items: show fallback homemade food collection
          setProducts(MOCK_PRODUCTS);
        }
      }
    } catch {
      // Fallback cleanly to mock products if offline
      setProducts(MOCK_PRODUCTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveProducts();
  }, [fetchLiveProducts]);

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'cat_all' ||
      p.categoryId === selectedCategory ||
      (selectedCategory === 'cat_chips' && p.categoryId.includes('chips')) ||
      (selectedCategory === 'cat_pickles' && p.categoryId.includes('pickle')) ||
      (selectedCategory === 'cat_honey' && p.categoryId.includes('honey')) ||
      (selectedCategory === 'cat_spices' && p.categoryId.includes('spice'));

    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameKn?.includes(searchQuery) ||
      p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  const featuredCampaign = MOCK_CAMPAIGNS[0];

  return (
    <View style={styles.container}>
      <Header
        onCartPress={() => navigation.navigate('Cart')}
        showCart={true}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchLiveProducts(true)}
            colors={[colors.primary]}
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Hero Banner: Seasonal Pre-booking */}
        {featuredCampaign && (
          <TouchableOpacity
            style={styles.heroBanner}
            onPress={() => navigation.navigate('PreBooking')}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: featuredCampaign.bannerImage }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroGradient}>
              <View style={styles.seasonTag}>
                <Text style={styles.seasonTagText}>
                  {locale === 'kn' ? '🍯 ವಿಶೇಷ ಖಾದ್ಯಗಳ ಮುಂಗಡ ಬುಕಿಂಗ್' : '🍯 Seasonal Homemade Batches'}
                </Text>
              </View>
              <Text style={styles.heroTitle} numberOfLines={2}>
                {locale === 'kn' ? featuredCampaign.titleKn : featuredCampaign.title}
              </Text>
              <View style={styles.heroMetaRow}>
                <Text style={styles.heroPrice}>
                  ₹{featuredCampaign.price} / {featuredCampaign.unit}
                </Text>
                <View style={styles.heroButton}>
                  <Text style={styles.heroButtonText}>
                    {t('preBookNow')} →
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Categories Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {locale === 'kn' ? 'ವರ್ಗಗಳು' : 'Categories'}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextActive,
                  ]}
                >
                  {locale === 'kn' && cat.nameKn ? cat.nameKn : cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Reverse Marketplace CTA Banner */}
        <TouchableOpacity
          style={styles.reverseMarketBanner}
          onPress={() => navigation.navigate('CustomRequests')}
          activeOpacity={0.85}
        >
          <View style={styles.reverseBannerLeft}>
            <View style={styles.reverseTag}>
              <Text style={styles.reverseTagText}>
                {locale === 'kn' ? 'ವಿಶೇಷ ಕೋರಿಕೆಗಳು' : 'Custom Batch Orders'}
              </Text>
            </View>
            <Text style={styles.reverseTitle}>
              {locale === 'kn'
                ? 'ನಿಮಗೆ ಬೇಕಾದ ಸಾಂಪ್ರದಾಯಿಕ ಆಹಾರ ಸಿಗುತ್ತಿಲ್ಲವೇ?'
                : 'Need custom homemade snacks or pickles?'}
            </Text>
            <Text style={styles.reverseDesc}>
              {locale === 'kn'
                ? 'ನಿಮ್ಮ ಬೇಡಿಕೆ ತಿಳಿಸಿ. ತಯಾರಕರು ವಿಶೇಷವಾಗಿ ತಯಾರಿಸಿ ಕೊಡುವರು.'
                : 'Post your requirement. Artisanal makers will send custom offers.'}
            </Text>
          </View>
          <View style={styles.reverseBadge}>
            <Text style={styles.reverseIcon}>🤝</Text>
            <Text style={styles.reverseButtonText}>
              {locale === 'kn' ? 'ಬೇಡಿಕೆ ಹಾಕಿ' : 'Post Request'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Verified Artisans Showcase */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {locale === 'kn' ? 'ನಮ್ಮ ಸ್ವದೇಶಿ ಆಹಾರ ತಯಾರಕರು' : 'Meet Our Homemade Food Artisans'}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.farmersList}
        >
          {Object.values(MOCK_SELLERS).map((seller) => (
            <View key={seller.id} style={styles.farmerCard}>
              <Image source={{ uri: seller.avatar }} style={styles.farmerAvatar} />
              <View style={styles.verifiedRow}>
                <Text style={styles.farmerShop} numberOfLines={1}>
                  {seller.shopName}
                </Text>
                <Text style={styles.verifiedCheck}>✓</Text>
              </View>
              <Text style={styles.farmerName}>{seller.name}</Text>
              <Text style={styles.farmerLocation}>📍 {seller.location}</Text>
              <View style={styles.farmerRating}>
                <Text style={styles.ratingText}>★ {seller.rating}</Text>
                <Text style={styles.reviewCount}>({seller.ratingCount})</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Products Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {locale === 'kn' ? 'ಮನೆಯಲ್ಲೇ ತಯಾರಿಸಿದ ಸಾಂಪ್ರದಾಯಿಕ ಆಹಾರಗಳು' : 'Homemade Delicacies & Natural Foods'}
          </Text>
          <Text style={styles.countText}>
            ({filteredProducts.length} {locale === 'kn' ? 'ಉತ್ಪನ್ನಗಳು' : 'items'})
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {locale === 'kn' ? 'ಉತ್ಪನ್ನಗಳನ್ನು ತರಲಾಗುತ್ತಿದೆ...' : 'Loading artisanal catalogue...'}
            </Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛍️</Text>
            <Text style={styles.emptyTitle}>
              {locale === 'kn' ? 'ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No products found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? (locale === 'kn' ? 'ಬೇರೆ ಕೀವರ್ಡ್ ಮೂಲಕ ಹುಡುಕಿ ಅಥವಾ ಬೇರೆ ವರ್ಗವನ್ನು ನೋಡಿ.' : 'Try a different search term or select another category.')
                : (locale === 'kn' ? 'ನೀವು ಆಹಾರ ತಯಾರಕರೇ? MOOLA ದಲ್ಲಿ ನಿಮ್ಮ ಉತ್ಪನ್ನ ಮಾರಾಟ ಮಾಡಿ.' : 'Are you a homemade food maker or artisan? Join MOOLA and reach direct buyers.')}
            </Text>
            {user?.role === 'buyer' && (
              <TouchableOpacity
                style={styles.applySellerButton}
                onPress={() => setShowApplyModal(true)}
              >
                <Text style={styles.applySellerButtonText}>
                  ✨ {locale === 'kn' ? 'ಮಾರಾಟಗಾರರಾಗಿ ನೋಂದಾಯಿಸಿ' : 'Apply to Sell on MOOLA'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => navigation.navigate('ProductDetail', { product })}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Onboarding Apply Modal */}
      <ApplySellerModal
        visible={showApplyModal}
        onClose={() => setShowApplyModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.textMuted,
    paddingHorizontal: 6,
  },
  heroBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    height: 190,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(27, 56, 22, 0.82)',
  },
  seasonTag: {
    backgroundColor: colors.accent,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  seasonTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 21,
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  heroPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FEF3C7',
  },
  heroButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  heroButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  countText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  reverseMarketBanner: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: '#FAF5EE',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8DCB8',
  },
  reverseBannerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  reverseTag: {
    backgroundColor: colors.accentDark,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  reverseTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  reverseTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reverseDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  reverseBadge: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8DCB8',
  },
  reverseIcon: {
    fontSize: 22,
  },
  reverseButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentDark,
    marginTop: 2,
  },
  farmersList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  farmerCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    width: 170,
    alignItems: 'center',
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
    marginBottom: 8,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  farmerShop: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    maxWidth: 130,
  },
  verifiedCheck: {
    fontSize: 11,
    color: colors.organicGreen,
    fontWeight: '800',
  },
  farmerName: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  farmerLocation: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  farmerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
  },
  reviewCount: {
    fontSize: 10,
    color: colors.textMuted,
    marginLeft: 3,
  },
  productsGrid: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyContainer: {
    marginHorizontal: 16,
    padding: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginVertical: 12,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  applySellerButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  applySellerButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
