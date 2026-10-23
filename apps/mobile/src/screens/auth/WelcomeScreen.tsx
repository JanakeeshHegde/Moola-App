import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { ApplySellerModal } from '../seller/ApplySellerModal';

export const WelcomeScreen: React.FC<{ navigation?: any; onProceed?: () => void }> = ({
  navigation,
  onProceed,
}) => {
  const { locale, toggleLocale, t } = useLanguage();
  const { role, login } = useAuth();

  // Private Admin Authentication Modal State
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Verified Seller Authentication Modal State
  const [sellerModalVisible, setSellerModalVisible] = useState(false);
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerPassword, setSellerPassword] = useState('');
  const [sellerLoading, setSellerLoading] = useState(false);
  const [sellerError, setSellerError] = useState('');

  // Seller Onboarding Application Modal
  const [showApplyModal, setShowApplyModal] = useState(false);

  const handleEnterBuyer = () => {
    if (onProceed) {
      onProceed();
    } else if (navigation) {
      navigation.navigate('BuyerRoot');
    }
  };

  const handleSellerLogin = async () => {
    const cleanPhone = sellerPhone.trim();
    const cleanPassword = sellerPassword.trim();

    if (!cleanPhone || !cleanPassword) {
      setSellerError('Please provide both seller phone number and password.');
      return;
    }

    setSellerLoading(true);
    setSellerError('');

    try {
      const res = await apiService.auth.login(cleanPhone, cleanPassword);
      if (res.success && res.data) {
        if (res.data.user.role !== 'seller') {
          setSellerError(
            'This account does not have approved seller privileges. If you submitted an application, it is pending administrator review.',
          );
          setSellerLoading(false);
          return;
        }

        await login(cleanPhone, cleanPassword, 'seller');
        setSellerModalVisible(false);
        setSellerPhone('');
        setSellerPassword('');

        if (navigation) {
          navigation.navigate('SellerRoot');
        } else if (onProceed) {
          onProceed();
        }
      } else {
        setSellerError('Invalid seller credentials.');
      }
    } catch (err: any) {
      setSellerError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSellerLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    const cleanPhone = adminPhone.trim();
    const cleanPassword = adminPassword.trim();

    if (!cleanPhone || !cleanPassword) {
      setAdminError('Please provide both administrator phone number and password.');
      return;
    }

    setAdminLoading(true);
    setAdminError('');

    try {
      const res = await apiService.auth.login(cleanPhone, cleanPassword);
      if (res.success && res.data) {
        if (res.data.user.role !== 'admin') {
          setAdminError('Access Denied: This account does not possess administrator privileges.');
          setAdminLoading(false);
          return;
        }

        // Successfully authenticated as an Administrator
        await login(cleanPhone, cleanPassword, 'admin');
        setAdminModalVisible(false);
        setAdminPhone('');
        setAdminPassword('');

        if (navigation) {
          navigation.navigate('AdminRoot');
        } else if (onProceed) {
          onProceed();
        }
      } else {
        setAdminError('Invalid administrator credentials.');
      }
    } catch (err: any) {
      setAdminError(err.message || 'Authentication failed. Please verify credentials and backend connectivity.');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Language Switcher Top Right */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.langButton} onPress={toggleLocale} activeOpacity={0.7}>
          <Text style={styles.langText}>
            🌐 {locale === 'en' ? 'ಕನ್ನಡಕ್ಕೆ ಬದಲಿಸಿ' : 'Switch to English'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Prominent Logo & Emblem */}
      <View style={styles.logoSection}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.brandTitle}>MOOLA</Text>
        <Text style={styles.tagline}>
          {locale === 'kn' ? 'ಮೂಲದಿಂದ. ನಿಮ್ಮ ಮನೆಗೆ.' : 'From the Source. To Your Home.'}
        </Text>
        <Text style={styles.subtagline}>
          {locale === 'kn'
            ? 'ಮನೆಯಲ್ಲೇ ತಯಾರಿಸಿದ ನೈಸರ್ಗಿಕ ಆಹಾರ ಪದಾರ್ಥಗಳ ಅಧಿಕೃತ ಮಾರುಕಟ್ಟೆ'
            : 'Artisanal Chips, Raw Honey, Traditional Pickles & Homemade Foods'}
        </Text>
      </View>

      {/* Navigation & Persona Options */}
      <View style={styles.roleSection}>
        <Text style={styles.roleHeading}>
          {locale === 'kn' ? 'ಪ್ರವೇಶ ಮಾರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ' : 'Select Access Portal'}
        </Text>
        <Text style={styles.roleSubheading}>
          {locale === 'kn'
            ? 'ಗ್ರಾಹಕರಾಗಿ ಮಾರುಕಟ್ಟೆ ವೀಕ್ಷಿಸಿ ಅಥವಾ ಅಧಿಕೃತ ಮಾರಾಟಗಾರರಾಗಿ ಲಾಗ್ ಇನ್ ಆಗಿ'
            : 'Explore traditional food products or sign in as an authorized producer'}
        </Text>

        {/* 1. Buyer Persona Card */}
        <TouchableOpacity
          style={[styles.roleCard, role === 'buyer' && styles.roleCardActive]}
          onPress={handleEnterBuyer}
          activeOpacity={0.85}
        >
          <View style={styles.roleIconCircle}>
            <Text style={styles.roleIcon}>🛒</Text>
          </View>
          <View style={styles.roleTextCol}>
            <Text style={styles.roleCardTitle}>{t('buyerRoleTitle')}</Text>
            <Text style={styles.roleCardDesc}>
              {locale === 'kn'
                ? 'ಮನೆಯ ಚಿಪ್ಸ್, ಕಾಡು ಜೇನು ಮತ್ತು ಉಪ್ಪಿನಕಾಯಿಗಳನ್ನು ನೇರವಾಗಿ ಖರೀದಿಸಿ'
                : 'Browse homemade chips, wild honey, artisanal pickles & direct orders'}
            </Text>
          </View>
          <Text style={styles.roleArrow}>→</Text>
        </TouchableOpacity>

        {/* 2. Farmer / Producer Sign-in Card */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => {
            setSellerError('');
            setSellerModalVisible(true);
          }}
          activeOpacity={0.85}
        >
          <View style={[styles.roleIconCircle, { backgroundColor: colors.accentLight }]}>
            <Text style={styles.roleIcon}>🧑‍🌾</Text>
          </View>
          <View style={styles.roleTextCol}>
            <Text style={styles.roleCardTitle}>
              {locale === 'kn' ? 'ಅಧಿಕೃತ ಮಾರಾಟಗಾರರ ಲಾಗಿನ್' : 'Verified Seller Portal'}
            </Text>
            <Text style={styles.roleCardDesc}>
              {locale === 'kn'
                ? 'ಅನುಮೋದಿತ ಮಾರಾಟಗಾರರು ಲಾಗ್ ಇನ್ ಆಗಿ ಉತ್ಪನ್ನ ಮತ್ತು ಆರ್ಡರ್ ನಿರ್ವಹಿಸಿ'
                : 'Sign in to manage listings, orders, and customer enquiries'}
            </Text>
          </View>
          <Text style={styles.roleArrow}>→</Text>
        </TouchableOpacity>

        {/* 3. Apply to Sell Onboarding Button */}
        <TouchableOpacity
          style={styles.onboardingBanner}
          onPress={() => setShowApplyModal(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.onboardingEmoji}>🌿</Text>
          <View style={styles.onboardingTextCol}>
            <Text style={styles.onboardingTitle}>
              {locale === 'kn' ? 'ಹೊಸ ನೈಸರ್ಗಿಕ ಆಹಾರ ತಯಾರಕರೇ?' : 'Make Homemade Food or Farm Goods?'}
            </Text>
            <Text style={styles.onboardingSub}>
              {locale === 'kn'
                ? 'MOOLA ದಲ್ಲಿ ಮಾರಾಟ ಮಾಡಲು ಅರ್ಜಿ ಸಲ್ಲಿಸಿ (ಆಡಳಿತ ಮಂಡಳಿಯ ಪರಿಶೀಲನೆ)'
                : 'Apply to sell on MOOLA • Requires Admin Approval'}
            </Text>
          </View>
          <Text style={styles.onboardingAction}>Apply →</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Organic Assurance */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🌱 100% Certified Organic • PGS-India & NPOP Verified • Direct Farmer Marketplace
        </Text>
      </View>

      {/* Private Administrator Access Entry Point (Discreet & Protected) */}
      <View style={styles.adminPortalContainer}>
        <TouchableOpacity
          style={styles.adminPortalButton}
          onPress={() => {
            setAdminError('');
            setAdminModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.adminPortalText}>🔒 Administrator Sign In</Text>
        </TouchableOpacity>
      </View>

      {/* Private Admin Sign-In Modal */}
      <Modal
        visible={adminModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAdminModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🛡️ Private Admin Dashboard</Text>
              <TouchableOpacity onPress={() => setAdminModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Authorized personnel only. Authenticate with verified administrator credentials.
            </Text>

            {adminError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{adminError}</Text>
              </View>
            ) : null}

            <Text style={styles.inputLabel}>Registered Phone Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 9845000000"
              keyboardType="phone-pad"
              value={adminPhone}
              onChangeText={setAdminPhone}
              autoCapitalize="none"
              editable={!adminLoading}
            />

            <Text style={styles.inputLabel}>Admin Password</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter secure password"
              secureTextEntry
              value={adminPassword}
              onChangeText={setAdminPassword}
              autoCapitalize="none"
              editable={!adminLoading}
            />

            <TouchableOpacity
              style={[styles.adminSubmitButton, adminLoading && styles.buttonDisabled]}
              onPress={handleAdminLogin}
              disabled={adminLoading}
              activeOpacity={0.8}
            >
              {adminLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.adminSubmitButtonText}>Authenticate & Access</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setAdminModalVisible(false)}
              disabled={adminLoading}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Verified Seller Sign-In Modal */}
      <Modal
        visible={sellerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSellerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🧑‍🌾 Verified Seller Sign In</Text>
              <TouchableOpacity onPress={() => setSellerModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Sign in with your approved producer credentials to manage product listings and customer orders.
            </Text>

            {sellerError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{sellerError}</Text>
              </View>
            ) : null}

            <Text style={styles.inputLabel}>Registered Phone Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 9000000001"
              keyboardType="phone-pad"
              value={sellerPhone}
              onChangeText={setSellerPhone}
              autoCapitalize="none"
              editable={!sellerLoading}
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter password"
              secureTextEntry
              value={sellerPassword}
              onChangeText={setSellerPassword}
              autoCapitalize="none"
              editable={!sellerLoading}
            />

            <TouchableOpacity
              style={[styles.adminSubmitButton, sellerLoading && styles.buttonDisabled]}
              onPress={handleSellerLogin}
              disabled={sellerLoading}
              activeOpacity={0.8}
            >
              {sellerLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.adminSubmitButtonText}>Sign In to Seller Dashboard →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyLinkButton}
              onPress={() => {
                setSellerModalVisible(false);
                setShowApplyModal(true);
              }}
            >
              <Text style={styles.applyLinkText}>
                Not an approved seller yet? <Text style={{ fontWeight: '800', color: colors.primary }}>Apply here</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setSellerModalVisible(false)}
              disabled={sellerLoading}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Seller Onboarding Application Modal */}
      <ApplySellerModal
        visible={showApplyModal}
        onClose={() => setShowApplyModal(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
    alignItems: 'center',
  },
  topRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  langButton: {
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  logoImage: {
    width: 170,
    height: 170,
    borderRadius: 20,
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primaryDark,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentDark,
    marginTop: 4,
  },
  subtagline: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  roleSection: {
    width: '100%',
    marginTop: 24,
  },
  roleHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  roleSubheading: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F8FCF7',
  },
  roleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleIcon: {
    fontSize: 22,
  },
  roleTextCol: {
    flex: 1,
  },
  roleCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  roleCardDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  roleArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
    marginLeft: 8,
  },
  footer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  adminPortalContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  adminPortalButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  adminPortalText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  modalClose: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 16,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorBannerText: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  adminSubmitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  adminSubmitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  modalCancelButton: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  onboardingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  onboardingEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  onboardingTextCol: {
    flex: 1,
  },
  onboardingTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#166534',
  },
  onboardingSub: {
    fontSize: 10.5,
    color: '#15803D',
    marginTop: 2,
  },
  onboardingAction: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 6,
  },
  applyLinkButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 6,
  },
  applyLinkText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
