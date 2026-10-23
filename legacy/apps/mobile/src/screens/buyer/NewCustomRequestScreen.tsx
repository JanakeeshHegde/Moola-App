import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';

export const NewCustomRequestScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { locale, t } = useLanguage();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Native Rice & Millets');
  const [quantity, setQuantity] = useState('5');
  const [unit, setUnit] = useState('kg');
  const [budget, setBudget] = useState('800');
  const [expectedDate, setExpectedDate] = useState('2026-11-15');
  const [description, setDescription] = useState('');

  const categories = [
    'Native Rice & Millets',
    'Cold-Pressed Oils',
    'Raw Honey & Jaggery',
    'Spices & Turmeric',
    'Traditional Snacks',
    'Seasonal Harvests',
  ];

  const units = ['kg', 'g', 'Litre', 'Bottle', 'Box', 'Pieces'];

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter what organic product or produce you need.');
      return;
    }

    Alert.alert(
      locale === 'kn' ? 'ಬೇಡಿಕೆ ಪ್ರಕಟವಾಗಿದೆ!' : 'Custom Request Published!',
      locale === 'kn'
        ? 'ನಿಮ್ಮ ಬೇಡಿಕೆಯನ್ನು ಕರ್ನಾಟಕದ ಸಾವಯವ ರೈತರಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ. ಶೀಘ್ರದಲ್ಲೇ ಆಫರ್‌ಗಳು ಬರಲಿವೆ.'
        : 'Your request has been broadcast to verified organic farmers. You will receive quotes shortly.',
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
        title={t('postNewRequest')}
        subtitle={
          locale === 'kn'
            ? 'ರೈತರು ನಿಮ್ಮ ಬೇಡಿಕೆಯನ್ನು ನೋಡಿ ಆಫರ್ ನೀಡುವರು'
            : 'Farmers will review and send custom price offers'
        }
        showCart={false}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Product Need Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('requestTitleLabel')} *</Text>
          <TextInput
            style={styles.input}
            placeholder={
              locale === 'kn'
                ? 'ಉದಾ: 5 ಕೆಜಿ ನೈಸರ್ಗಿಕ ನವರ ಅಕ್ಕಿ'
                : 'E.g., 5kg Unpolished Heritage Navara Rice'
            }
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Category Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {categories.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Quantity & Unit Row */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>{t('requestQtyLabel')} *</Text>
            <TextInput
              style={styles.input}
              placeholder="5"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Unit</Text>
            <View style={styles.unitRow}>
              {units.slice(0, 3).map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitChip, unit === u && styles.unitChipSelected]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={[styles.unitText, unit === u && styles.unitTextSelected]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Budget & Expected Date */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>{t('requestBudgetLabel')} *</Text>
            <TextInput
              style={styles.input}
              placeholder="750"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={budget}
              onChangeText={setBudget}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>{t('requestDeliveryLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              value={expectedDate}
              onChangeText={setExpectedDate}
            />
          </View>
        </View>

        {/* Notes / Special Instructions */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {locale === 'kn' ? 'ಹೆಚ್ಚುವರಿ ವಿವರಣೆ' : 'Detailed Notes & Preferences'}
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={
              locale === 'kn'
                ? 'ಯಾವುದೇ ರಾಸಾಯನಿಕ ಇಲ್ಲದಂತೆ ಮಣ್ಣಿನ ಬಣ್ಣದ ಅಕ್ಕಿ ಬೇಕು...'
                : 'Need single-origin, chemical-free, traditional packaging...'
            }
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.submitBtnText}>{t('submit')} {t('postNewRequest')} →</Text>
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 13,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
  },
  unitRow: {
    flexDirection: 'row',
    gap: 6,
  },
  unitChip: {
    flex: 1,
    backgroundColor: colors.card,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  unitChipSelected: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  unitText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  unitTextSelected: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  submitBtnText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '800',
  },
});
