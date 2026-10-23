import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { apiService } from '../../services/api';

export const SellerKYCScreen: React.FC<{ navigation?: any }> = ({ navigation: _navigation }) => {
  const { locale, t } = useLanguage();
  const { token, user, refreshUser } = useAuth();

  const [fssai, setFssai] = useState('21224010000491');
  const [organicCert, setOrganicCert] = useState('NPOP/NAB/0012/KA-2025');
  const [govIdType, setGovIdType] = useState('aadhaar');
  const [docUrl, setDocUrl] = useState('https://storage.moola.org/docs/artisan_cert.pdf');
  const [productionLocation, setProductionLocation] = useState('Sirsi, Uttara Kannada, Karnataka');
  const [loading, setLoading] = useState(false);

  const isVerified = user?.isVerified ?? true;

  const handleSave = async () => {
    if (!token) {
      Alert.alert(
        locale === 'kn' ? 'ದಾಖಲೆಗಳು ನವೀಕರಿಸಲಾಗಿದೆ!' : 'Credentials Updated!',
        locale === 'kn'
          ? 'ನಿಮ್ಮ ಕೃಷಿ & FSSAI ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲನೆಗಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ.'
          : 'Your food artisan credentials have been updated for administrative verification.',
      );
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.seller.submitKYC(
        [
          { type: 'fssai', url: docUrl },
          { type: 'organic_certificate', url: docUrl },
        ],
        token,
      );

      if (res.success) {
        Alert.alert(
          locale === 'kn' ? 'ದಾಖಲೆಗಳನ್ನು ಸಲ್ಲಿಸಲಾಗಿದೆ!' : 'Verification Documents Submitted!',
          locale === 'kn'
            ? 'ನಿಮ್ಮ ಆಹಾರ ಸುರಕ್ಷತೆ ಮತ್ತು ಸಾವಯವ ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು MOOLA ಆಡಳಿತ ಮಂಡಳಿ ಪರಿಶೀಲಿಸುತ್ತಿದೆ.'
            : 'Your food safety and organic credentials have been submitted for administrator review.',
          [{ text: 'OK', onPress: () => refreshUser() }],
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit verification documents.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('kycStatus')}
        subtitle={
          locale === 'kn'
            ? 'ಸರ್ಕಾರಿ ಆಹಾರ ಪರವಾನಗಿ ಮತ್ತು ಸಾವಯವ ಪ್ರಮಾಣೀಕರಣ'
            : 'FSSAI License & Organic Food Artisan Verification'
        }
        showCart={false}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Verification Status Banner */}
        <View style={styles.statusCard}>
          <Text style={styles.statusIcon}>{isVerified ? '🛡️' : '⏳'}</Text>
          <View style={styles.statusTextCol}>
            <Text style={styles.statusTitle}>
              {isVerified
                ? locale === 'kn'
                  ? 'ಖಾತೆ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ'
                  : 'Verified Food Artisan Profile'
                : locale === 'kn'
                  ? 'ಪರಿಶೀಲನೆ ಬಾಕಿ ಇದೆ'
                  : 'Artisan Verification Pending'}
            </Text>
            <Text style={styles.statusSub}>
              {isVerified
                ? locale === 'kn'
                  ? 'ನಿಮ್ಮ ನೈಸರ್ಗಿಕ ಆಹಾರ ತಯಾರಿಕೆ ಮತ್ತು FSSAI ಪರವಾನಗಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ.'
                  : 'Your homemade food safety and organic artisan credentials are authenticated.'
                : 'Credentials submitted and under review by MOOLA administrators.'}
            </Text>
          </View>
          <View style={isVerified ? styles.activeTag : styles.pendingTag}>
            <Text style={styles.activeTagText}>{isVerified ? 'ACTIVE' : 'PENDING'}</Text>
          </View>
        </View>

        {/* Credentials Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>
            {locale === 'kn' ? 'ಆಹಾರ ಸುರಕ್ಷತೆ & ಪರವಾನಗಿ' : 'Food Safety & Government Credentials'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>FSSAI License / Registration No.</Text>
            <TextInput
              style={styles.input}
              value={fssai}
              onChangeText={setFssai}
              placeholder="14-digit FSSAI number"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>NPOP / PGS-India / Artisan Certificate No.</Text>
            <TextInput
              style={styles.input}
              value={organicCert}
              onChangeText={setOrganicCert}
              placeholder="E.g., NPOP/NAB/XXXX/KA"
            />
          </View>
        </View>

        {/* Origin & Production Verification */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>
            {locale === 'kn' ? 'ಮೂಲ ಸ್ಥಳ & ಗುರುತು' : 'Artisanal Kitchen & Identity'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Production / Kitchen Origin Location</Text>
            <TextInput
              style={styles.input}
              value={productionLocation}
              onChangeText={setProductionLocation}
              placeholder="Taluk, District, State"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Identity Document Type</Text>
            <View style={styles.idTypeRow}>
              {['aadhaar', 'pan', 'fssai'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.idChip, govIdType === type && styles.idChipActive]}
                  onPress={() => setGovIdType(type)}
                >
                  <Text style={[styles.idChipText, govIdType === type && styles.idChipTextActive]}>
                    {type.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Document Verification URL / Secure Link</Text>
            <TextInput
              style={styles.input}
              value={docUrl}
              onChangeText={setDocUrl}
              placeholder="https://..."
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Submit Credentials for Verification →</Text>
          )}
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
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.organicBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.25)',
    marginBottom: 20,
  },
  statusIcon: {
    fontSize: 26,
    marginRight: 10,
  },
  statusTextCol: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.organicGreen,
  },
  statusSub: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
    lineHeight: 15,
  },
  activeTag: {
    backgroundColor: colors.organicGreen,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  pendingTag: {
    backgroundColor: '#D97706',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  idTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  idChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  idChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  idChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  idChipTextActive: {
    color: '#FFFFFF',
  },
  formSection: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
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
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
    elevation: 3,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '800',
  },
});
