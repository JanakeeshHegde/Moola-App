import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';
import { MOCK_CATEGORIES } from '../../services/mockData';

interface AddProductScreenProps {
  route: any;
  navigation: any;
}

export const AddProductScreen: React.FC<AddProductScreenProps> = ({
  route,
  navigation,
}) => {
  const { locale } = useLanguage();
  const existingProduct = route.params?.product;

  const [name, setName] = useState(existingProduct?.name || '');
  const [nameKn, setNameKn] = useState(existingProduct?.nameKn || '');
  const [selectedCategory, setSelectedCategory] = useState(
    existingProduct?.categoryId || 'cat_chips',
  );
  const [price, setPrice] = useState(existingProduct?.price?.toString() || '');
  const [mrp, setMrp] = useState(existingProduct?.mrp?.toString() || '');
  const [quantity, setQuantity] = useState(
    existingProduct?.quantityAvailable?.toString() || '10',
  );
  const [unit, setUnit] = useState(existingProduct?.unit || 'pack');
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [imageUrl, setImageUrl] = useState(
    existingProduct?.image ||
      'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
  );
  const [isOrganic, setIsOrganic] = useState(existingProduct?.isOrganic ?? true);
  const [isCertified, setIsCertified] = useState(existingProduct?.isCertified ?? true);

  const units = ['pack', 'kg', 'g', 'Litre', 'ml', 'Bottle', 'Jar', 'Box'];

  const categories = MOCK_CATEGORIES.filter((c) => c.id !== 'cat_all');

  const handleSaveProduct = () => {
    if (!name.trim()) {
      Alert.alert(
        locale === 'kn' ? 'ಹೆಸರು ಅಗತ್ಯವಿದೆ' : 'Product Name Required',
        locale === 'kn'
          ? 'ದಯವಿಟ್ಟು ಉತ್ಪನ್ನದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.'
          : 'Please enter the product name.',
      );
      return;
    }
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert(
        locale === 'kn' ? 'ಮಾನ್ಯ ಬೆಲೆ ನಮೂದಿಸಿ' : 'Valid Price Required',
        locale === 'kn'
          ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಮಾರಾಟ ಬೆಲೆಯನ್ನು ನಮೂದಿಸಿ.'
          : 'Please enter a valid selling price.',
      );
      return;
    }

    Alert.alert(
      locale === 'kn' ? 'ಉತ್ಪನ್ನ ಉಳಿಸಲಾಗಿದೆ!' : 'Product Saved Successfully!',
      locale === 'kn'
        ? `"${name}" ಉತ್ಪನ್ನವನ್ನು ನಿಮ್ಮ MOOLA ಮಳಿಗೆಯಲ್ಲಿ ನಮೂದಿಸಲಾಗಿದೆ. ಗ್ರಾಹಕರು ಈಗ ವೀಕ್ಷಿಸಬಹುದು.`
        : `"${name}" has been listed in your MOOLA homemade & organic catalogue.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={
          existingProduct
            ? locale === 'kn'
              ? 'ಉತ್ಪನ್ನ ತಿದ್ದುಪಡಿ'
              : 'Edit Product'
            : locale === 'kn'
            ? 'ಹೊಸ ಉತ್ಪನ್ನ ಸೇರಿಸಿ'
            : 'Add New Product'
        }
        subtitle={
          locale === 'kn'
            ? 'ಕೈಯಿಂದ ತಯಾರಿಸಿದ ಸಾವಯವ ಉತ್ಪನ್ನ ವಿವರ ನಮೂದಿಸಿ'
            : 'List your homemade & organic food products'
        }
        showCart={false}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Photo Upload & Preview Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>
            📷 {locale === 'kn' ? 'ಉತ್ಪನ್ನದ ಭಾವಚಿತ್ರ' : 'Product Image'}
          </Text>
          <View style={styles.imagePreviewRow}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.imagePreview} resizeMode="cover" />
            ) : (
              <View style={[styles.imagePreview, styles.placeholderPreview]}>
                <Text style={styles.placeholderIcon}>🖼️</Text>
              </View>
            )}
            <View style={styles.imageInputCol}>
              <Text style={styles.helperText}>
                {locale === 'kn'
                  ? 'ನೈಜ ಉತ್ಪನ್ನದ ಫೋಟೋ ಲಿಂಕ್ ಅಥವಾ ಅಪ್‌ಲೋಡ್:'
                  : 'Product photo image URL:'}
              </Text>
              <TextInput
                style={styles.imageInput}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="https://images.example.com/item.jpg"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
              <View style={styles.imageBadge}>
                <Text style={styles.imageBadgeText}>✓ High Resolution Recommended</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Product Names */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>
            📝 {locale === 'kn' ? 'ಉತ್ಪನ್ನದ ವಿವರ' : 'Basic Information'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {locale === 'kn' ? 'ಉತ್ಪನ್ನದ ಹೆಸರು (English) *' : 'Product Name (English) *'}
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Traditional Jackfruit Chips in Coconut Oil"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {locale === 'kn' ? 'ಉತ್ಪನ್ನದ ಹೆಸರು (ಕನ್ನಡ)' : 'Product Name (Kannada)'}
            </Text>
            <TextInput
              style={styles.input}
              value={nameKn}
              onChangeText={setNameKn}
              placeholder="ಉದಾ: ಶುದ್ಧ ತೆಂಗಿನೆಣ್ಣೆ ಹಲಸಿನ ಹಣ್ಣಿನ ಚಿಪ್ಸ್"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Category Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {locale === 'kn' ? 'ವರ್ಗ / Category *' : 'Category *'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                    onPress={() => setSelectedCategory(cat.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextSelected,
                      ]}
                    >
                      {locale === 'kn' ? cat.nameKn : cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* Pricing & Inventory */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>
            💰 {locale === 'kn' ? 'ಬೆಲೆ & ದಾಸ್ತಾನು' : 'Pricing & Inventory'}
          </Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>
                {locale === 'kn' ? 'ಮಾರಾಟ ಬೆಲೆ (₹) *' : 'Selling Price (₹) *'}
              </Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="250"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>
                {locale === 'kn' ? 'MRP (₹)' : 'MRP (₹)'}
              </Text>
              <TextInput
                style={styles.input}
                value={mrp}
                onChangeText={setMrp}
                keyboardType="numeric"
                placeholder="300"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>
                {locale === 'kn' ? 'ಲಭ್ಯವಿರುವ ದಾಸ್ತಾನು' : 'Available Stock'}
              </Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholder="25"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>
                {locale === 'kn' ? 'ಅಳತೆ ಮಾನ / Unit' : 'Unit'}
              </Text>
              <TextInput
                style={styles.input}
                value={unit}
                onChangeText={setUnit}
                placeholder="pack / kg"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          {/* Unit Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {units.map((u) => {
              const isSelected = unit === u;
              return (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitChip, isSelected && styles.unitChipSelected]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={[styles.unitChipText, isSelected && styles.unitChipTextSelected]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Organic & Purity Badges */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>
            🌱 {locale === 'kn' ? 'ಸಾವಯವ & ನೈಸರ್ಗಿಕ ಗುಣಮಟ್ಟ' : 'Organic & Purity Certifications'}
          </Text>

          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setIsOrganic((prev: boolean) => !prev)}
            activeOpacity={0.8}
          >
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>100% Homemade / Organic Food</Text>
              <Text style={styles.toggleSub}>No artificial colors, zero preservatives, traditional method</Text>
            </View>
            <View style={[styles.toggleCheckbox, isOrganic && styles.toggleCheckboxActive]}>
              {isOrganic && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setIsCertified((prev: boolean) => !prev)}
            activeOpacity={0.8}
          >
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Verified FSSAI / Organic Certified</Text>
              <Text style={styles.toggleSub}>PGS-India / NPOP certified or homemade cottage license</Text>
            </View>
            <View style={[styles.toggleCheckbox, isCertified && styles.toggleCheckboxActive]}>
              {isCertified && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>
            📄 {locale === 'kn' ? 'ವಿವರಣೆ' : 'Product Description'}
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholder={
              locale === 'kn'
                ? 'ತಯಾರಿಸುವ ವಿಧಾನ, ಪದಾರ್ಥಗಳು ಮತ್ತು ರುಚಿಯ ವಿವರಣೆ...'
                : 'Describe ingredients, preparation technique, shelf life, and taste notes...'
            }
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Save / Publish Button */}
        <TouchableOpacity style={styles.publishBtn} onPress={handleSaveProduct} activeOpacity={0.85}>
          <Text style={styles.publishBtnText}>
            ✓ {existingProduct
              ? locale === 'kn'
                ? 'ಉತ್ಪನ್ನ ನವೀಕರಿಸಿ'
                : 'Update Product'
              : locale === 'kn'
              ? 'ಉತ್ಪನ್ನ ಪ್ರಕಟಿಸಿ'
              : 'Publish Product'}
          </Text>
        </TouchableOpacity>
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
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 12,
  },
  imagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  placeholderPreview: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderIcon: {
    fontSize: 32,
  },
  imageInputCol: {
    flex: 1,
  },
  helperText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  imageInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 12,
    color: colors.textPrimary,
  },
  imageBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.organicBg,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  imageBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.organicGreen,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 13,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  horizontalScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  chipsScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  unitChip: {
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  unitChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  unitChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 10,
  },
  toggleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  toggleSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toggleCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleCheckboxActive: {
    backgroundColor: colors.organicGreen,
    borderColor: colors.organicGreen,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  publishBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
    elevation: 3,
  },
  publishBtnText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '800',
  },
});
