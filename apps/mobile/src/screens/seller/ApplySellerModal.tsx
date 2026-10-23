import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiService } from '../../services/api';

interface ApplySellerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ApplySellerModal: React.FC<ApplySellerModalProps> = ({ visible, onClose }) => {
  const { user, token, refreshUser } = useAuth();
  const { locale } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(false);
  const [appStatus, setAppStatus] = useState<any>(null);

  // Form state
  const [shopName, setShopName] = useState('');
  const [specialty, setSpecialty] = useState('Homemade Chips & Snacks');
  const [whatsapp, setWhatsapp] = useState(user?.phone || '');
  const [description, setDescription] = useState('');
  const [fssai, setFssai] = useState('');

  const specialties = [
    'Homemade Chips & Snacks',
    'Raw Honey & Jaggery',
    'Traditional Pickles',
    'Spices & Masala',
    'Cold-Pressed Oils & Ghee',
    'Native Grains & Millets',
  ];

  useEffect(() => {
    if (visible && token) {
      loadApplicationStatus();
    }
  }, [visible, token]);

  const loadApplicationStatus = async () => {
    if (!token) return;
    setFetchingStatus(true);
    try {
      const res = await apiService.seller.getApplicationStatus(token);
      if (res.success && res.data) {
        setAppStatus(res.data);
        if (res.data.shopName) setShopName(res.data.shopName);
        if (res.data.description) setDescription(res.data.description);
      }
    } catch {
      // Quiet fail on network hiccup
    } finally {
      setFetchingStatus(false);
    }
  };

  const handleSubmit = async () => {
    if (!shopName.trim() || shopName.trim().length < 2) {
      Alert.alert(
        locale === 'kn' ? 'ತಪ್ಪು' : 'Validation Error',
        locale === 'kn' ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬ್ರ್ಯಾಂಡ್/ಅಂಗಡಿ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಕನಿಷ್ಠ 2 ಅಕ್ಷರಗಳು)' : 'Please enter your brand or shop name (min 2 characters).',
      );
      return;
    }

    const cleanPhone = whatsapp.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      Alert.alert(
        locale === 'kn' ? 'ತಪ್ಪು' : 'Validation Error',
        locale === 'kn' ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10-ಅಂಕಿಯ ವಾಟ್ಸಾಪ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ' : 'Please enter a valid 10-digit Indian WhatsApp number for customer enquiries.',
      );
      return;
    }

    if (!token) {
      Alert.alert('Notice', 'Please log in to submit your seller application.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.seller.apply(
        {
          shopName: shopName.trim(),
          description: description.trim() || undefined,
          whatsappNumber: cleanPhone,
          categorySpecialty: specialty,
          fssaiNumber: fssai.trim() || undefined,
        },
        token,
      );

      if (res.success) {
        Alert.alert(
          locale === 'kn' ? 'ಅರ್ಜಿ ಸಲ್ಲಿಸಲಾಗಿದೆ 🎉' : 'Application Submitted 🎉',
          locale === 'kn'
            ? 'ನಿಮ್ಮ ಮಾರಾಟಗಾರರ ಅರ್ಜಿಯನ್ನು MOOLA ಆಡಳಿತ ಮಂಡಳಿ ಪರಿಶೀಲಿಸುತ್ತಿದೆ. ಅನುಮೋದನೆಯ ನಂತರ ನಿಮಗೆ ಅಧಿಸೂಚನೆ ಬರುತ್ತದೆ.'
            : 'Your seller onboarding application has been submitted to MOOLA administrators. You will be notified once verified.',
          [{ text: 'OK', onPress: () => { refreshUser(); onClose(); } }],
        );
      }
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Failed to submit seller application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {locale === 'kn' ? 'MOOLA ದಲ್ಲಿ ಮಾರಾಟಗಾರರಾಗಿ' : 'Sell on MOOLA'}
              </Text>
              <Text style={styles.subtitle}>
                {locale === 'kn'
                  ? 'ಮನೆಯಲ್ಲೇ ತಯಾರಿಸಿದ ನೈಸರ್ಗಿಕ ಆಹಾರ ಮಾರಾಟಗಾರರ ಅಧಿಕೃತ ನೋಂದಣಿ'
                  : 'Official Onboarding for Homemade Food Artisans'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {fetchingStatus ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Checking application status...</Text>
            </View>
          ) : appStatus?.hasApplication && appStatus.status === 'pending' ? (
            /* Pending Status View */
            <View style={styles.statusBox}>
              <Text style={styles.statusIcon}>⏳</Text>
              <Text style={styles.statusTitle}>
                {locale === 'kn' ? 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ' : 'Application Pending Review'}
              </Text>
              <Text style={styles.statusDesc}>
                {locale === 'kn'
                  ? `ನಿಮ್ಮ "${appStatus.shopName}" ಅರ್ಜಿಯು MOOLA ಆಡಳಿತ ಮಂಡಳಿಯ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ. ನೈಸರ್ಗಿಕ ಗುಣಮಟ್ಟವನ್ನು ಖಚಿತಪಡಿಸಲು 1-2 ದಿನಗಳಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.`
                  : `Your application for "${appStatus.shopName}" has been received and is under review by MOOLA administrators. Verification takes 1-2 business days.`}
              </Text>
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>
                  🛡️ Admin Approval Required before publishing products
                </Text>
              </View>
              <TouchableOpacity style={styles.dismissBtn} onPress={onClose}>
                <Text style={styles.dismissBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : appStatus?.hasApplication && appStatus.status === 'rejected' ? (
            /* Rejected Status View with Re-apply */
            <View style={styles.statusBox}>
              <Text style={styles.statusIcon}>⚠️</Text>
              <Text style={styles.statusTitle}>Application Needs Updates</Text>
              <Text style={styles.statusDesc}>
                {appStatus.rejectionReason || 'Please review your craft details and re-submit for review.'}
              </Text>
              <TouchableOpacity
                style={styles.reapplyBtn}
                onPress={() => setAppStatus({ ...appStatus, status: null })}
              >
                <Text style={styles.reapplyBtnText}>Update & Re-Submit Application</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Application Form */
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
              <View style={styles.banner}>
                <Text style={styles.bannerEmoji}>🌿</Text>
                <Text style={styles.bannerText}>
                  MOOLA connects authentic homemade producers directly with regional consumers. All sellers undergo administrator review to prevent commercial resale.
                </Text>
              </View>

              <Text style={styles.label}>
                Shop / Homemade Brand Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Malnad Homemade Crisps"
                placeholderTextColor={colors.textMuted}
                value={shopName}
                onChangeText={setShopName}
              />

              <Text style={styles.label}>
                Primary Specialty <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.chipRow}>
                {specialties.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, specialty === item && styles.chipActive]}
                    onPress={() => setSpecialty(item)}
                  >
                    <Text style={[styles.chipText, specialty === item && styles.chipTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>
                WhatsApp Number for Orders <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="10-digit phone number (e.g., 9845012345)"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                value={whatsapp}
                onChangeText={setWhatsapp}
              />

              <Text style={styles.label}>FSSAI Registration / Certificate (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="14-digit FSSAI number (if available)"
                placeholderTextColor={colors.textMuted}
                value={fssai}
                onChangeText={setFssai}
              />

              <Text style={styles.label}>About Your Traditional Craft / Production</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your ingredients, traditional recipes, and preparation methods..."
                placeholderTextColor={colors.textMuted}
                multiline={true}
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />

              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Seller Application →</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 14,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '700',
  },
  formContent: {
    paddingBottom: 24,
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  required: {
    color: '#D32F2F',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 75,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 13,
  },
  statusBox: {
    padding: 24,
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  statusDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 20,
  },
  infoBadgeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  dismissBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 6,
  },
  dismissBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  reapplyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  reapplyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
