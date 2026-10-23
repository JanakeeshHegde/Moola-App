import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { CUSTOMER_SUPPORT_CONFIG } from '@moola/shared';

export const SupportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { locale } = useLanguage();

  const handleCall = async (telUri: string) => {
    try {
      const supported = await Linking.canOpenURL(telUri);
      if (supported) {
        await Linking.openURL(telUri);
      } else {
        Alert.alert(
          locale === 'kn' ? 'ದೋಷ' : 'Notice',
          locale === 'kn'
            ? 'ಕರೆ ಮಾಡಲು ಸಾಧನದಲ್ಲಿ ಸೌಲಭ್ಯ ಲಭ್ಯವಿಲ್ಲ.'
            : 'Phone calling is not supported on this device.',
        );
      }
    } catch {
      Linking.openURL(telUri);
    }
  };

  const handleWhatsApp = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        locale === 'kn' ? 'ವಾಟ್ಸಾಪ್ ಲಭ್ಯವಿಲ್ಲ' : 'WhatsApp Unavailable',
        locale === 'kn'
          ? 'ವಾಟ್ಸಾಪ್ ತೆರೆಯಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ.'
          : 'Could not open WhatsApp. Please check if the app is installed.',
      );
    }
  };

  const handleSocialLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        locale === 'kn' ? 'ದೋಷ' : 'Notice',
        locale === 'kn' ? 'ಲಿಂಕ್ ತೆರೆಯಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ.' : 'Could not open the link.',
      );
    }
  };

  const primary = CUSTOMER_SUPPORT_CONFIG.numbers.primary;
  const secondary = CUSTOMER_SUPPORT_CONFIG.numbers.secondary;
  const social = CUSTOMER_SUPPORT_CONFIG.socialLinks;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>← {locale === 'kn' ? 'ಹಿಂದಕ್ಕೆ' : 'Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {locale === 'kn' ? 'ಗ್ರಾಹಕ ಬೆಂಬಲ ಮತ್ತು ದೂರುಗಳು' : 'Customer Support & Help'}
        </Text>
      </View>

      {/* Intro Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>
          {locale === 'kn' ? 'ನಾವು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇವೆ' : 'We Are Here to Help'}
        </Text>
        <Text style={styles.bannerDesc}>
          {locale === 'kn'
            ? 'ನಿಮ್ಮ ಆರ್ಡರ್, ಗುಣಮಟ್ಟ, ಅಥವಾ ಪಾವತಿ ಕುರಿತು ನೇರವಾಗಿ ನಮ್ಮ ಡೆವಲಪರ್ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ.'
            : 'Contact our management team directly for order issues, product feedback, or payment assistance.'}
        </Text>
        <Text style={styles.hoursText}>
          🕒 {CUSTOMER_SUPPORT_CONFIG.operatingHours}
        </Text>
      </View>

      {/* Helplines Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>
          📞 {locale === 'kn' ? 'ನೇರ ಸಂಪರ್ಕ ಸಹಾಯವಾಣಿಗಳು' : 'Direct Support Lines'}
        </Text>

        {/* Line 1 */}
        <View style={styles.lineCard}>
          <View style={styles.lineInfo}>
            <Text style={styles.lineLabel}>{primary.label}</Text>
            <Text style={styles.lineNumber}>{primary.display}</Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btn, styles.callBtn]}
              onPress={() => handleCall(primary.telUri)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>📞 {locale === 'kn' ? 'ಕರೆ' : 'Call'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.waBtn]}
              onPress={() => handleWhatsApp(primary.whatsappUrl)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>💬 WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Line 2 */}
        <View style={styles.lineCard}>
          <View style={styles.lineInfo}>
            <Text style={styles.lineLabel}>{secondary.label}</Text>
            <Text style={styles.lineNumber}>{secondary.display}</Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btn, styles.callBtn]}
              onPress={() => handleCall(secondary.telUri)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>📞 {locale === 'kn' ? 'ಕರೆ' : 'Call'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.waBtn]}
              onPress={() => handleWhatsApp(secondary.whatsappUrl)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>💬 WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support email disclosure */}
        <View style={styles.emailNotice}>
          <Text style={styles.emailNoticeText}>
            ℹ️ {locale === 'kn'
              ? 'ಅಧಿಕೃತ ಬೆಂಬಲ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ಪ್ರಸ್ತುತ ಕಾನ್ಫಿಗರ್ ಮಾಡಲಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ತ್ವರಿತ ಪ್ರತಿಕ್ರಿಯೆಗಾಗಿ ಮೇಲಿನ ಫೋನ್ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಲೈನ್‌ಗಳನ್ನು ಬಳಸಿ.'
              : 'Official support email is currently under configuration. Please use our verified phone or WhatsApp lines for prompt support.'}
          </Text>
        </View>
      </View>

      {/* Social Media Channels */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>
          🌐 {locale === 'kn' ? 'ಸಾಮಾಜಿಕ ಜಾಲತಾಣಗಳಲ್ಲಿ ಸಂಪರ್ಕಿಸಿ' : 'Connect on Social Media'}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {locale === 'kn'
            ? 'ಹೊಸ ನವೀಕರಣಗಳು ಮತ್ತು ಸಾವಯವ ಉತ್ಪನ್ನಗಳ ಮಾಹಿತಿಗಾಗಿ ನಮ್ಮನ್ನು ಅನುಸರಿಸಿ.'
            : 'Follow us for organic harvests, homemade product launches, and seasonal updates.'}
        </Text>

        <View style={styles.socialGrid}>
          {/* Instagram */}
          <TouchableOpacity
            style={styles.socialCard}
            onPress={() => handleSocialLink(social.instagram.url)}
            activeOpacity={0.8}
            accessibilityLabel="Instagram"
          >
            <View style={[styles.socialIconBox, styles.instagramIconBox]}>
              <Text style={styles.socialGlyph}>📸</Text>
            </View>
            <View style={styles.socialTextBox}>
              <Text style={styles.socialName}>Instagram</Text>
              <Text style={styles.socialHandle}>{social.instagram.handle}</Text>
            </View>
            <Text style={styles.socialArrow}>↗</Text>
          </TouchableOpacity>

          {/* Facebook */}
          <TouchableOpacity
            style={styles.socialCard}
            onPress={() => handleSocialLink(social.facebook.url)}
            activeOpacity={0.8}
            accessibilityLabel="Facebook"
          >
            <View style={[styles.socialIconBox, styles.facebookIconBox]}>
              <Text style={styles.facebookF}>f</Text>
            </View>
            <View style={styles.socialTextBox}>
              <Text style={styles.socialName}>Facebook</Text>
              <Text style={styles.socialHandle}>{social.facebook.handle}</Text>
            </View>
            <Text style={styles.socialArrow}>↗</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ticket Actions */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>
          🎫 {locale === 'kn' ? 'ದೂರು ಟಿಕೆಟ್ ವ್ಯವಸ್ಥೆ' : 'Complaint Tickets'}
        </Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('SubmitComplaint')}
          activeOpacity={0.7}
        >
          <View style={styles.menuIconBox}>
            <Text style={styles.menuIcon}>✍️</Text>
          </View>
          <View style={styles.menuTextBox}>
            <Text style={styles.menuTitle}>
              {locale === 'kn' ? 'ಹೊಸ ದೂರು ಸಲ್ಲಿಸಿ' : 'Submit a Complaint'}
            </Text>
            <Text style={styles.menuSubtitle}>
              {locale === 'kn'
                ? 'ಗುಣಮಟ್ಟ, ಆರ್ಡರ್ ಅಥವಾ ವಿತರಣಾ ಸಮಸ್ಯೆಗಳನ್ನು ದಾಖಲಿಸಿ'
                : 'Report damaged product, incorrect order, or delivery issues'}
            </Text>
          </View>
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyComplaints')}
          activeOpacity={0.7}
        >
          <View style={styles.menuIconBox}>
            <Text style={styles.menuIcon}>📋</Text>
          </View>
          <View style={styles.menuTextBox}>
            <Text style={styles.menuTitle}>
              {locale === 'kn' ? 'ನನ್ನ ದೂರುಗಳು ಮತ್ತು ಸ್ಥಿತಿ' : 'My Complaints & Status'}
            </Text>
            <Text style={styles.menuSubtitle}>
              {locale === 'kn'
                ? 'ನಿಮ್ಮ ಟಿಕೆಟ್ ಪ್ರಗತಿ ಮತ್ತು ಡೆವಲಪರ್ ಉತ್ತರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ'
                : 'Track submitted tickets, review updates, and responses'}
            </Text>
          </View>
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Legal & Account Governance */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>
          ⚖️ {locale === 'kn' ? 'ಕಾನೂನು ಮತ್ತು ಖಾತೆ ಮಾಹಿತಿ' : 'Legal & Account Governance'}
        </Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('PrivacyPolicy')}
          activeOpacity={0.7}
        >
          <View style={styles.menuIconBox}>
            <Text style={styles.menuIcon}>🛡️</Text>
          </View>
          <View style={styles.menuTextBox}>
            <Text style={styles.menuTitle}>
              {locale === 'kn' ? 'ಗೌಪ್ಯತಾ ನೀತಿ' : 'Privacy Policy'}
            </Text>
            <Text style={styles.menuSubtitle}>
              {locale === 'kn' ? 'ಡೇಟಾ ಸಂಗ್ರಹಣೆ ಮತ್ತು ಹಕ್ಕುಗಳು' : 'How your data is collected, used, and protected'}
            </Text>
          </View>
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('TermsConditions')}
          activeOpacity={0.7}
        >
          <View style={styles.menuIconBox}>
            <Text style={styles.menuIcon}>📜</Text>
          </View>
          <View style={styles.menuTextBox}>
            <Text style={styles.menuTitle}>
              {locale === 'kn' ? 'ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು' : 'Terms & Conditions'}
            </Text>
            <Text style={styles.menuSubtitle}>
              {locale === 'kn' ? 'ಮಾರುಕಟ್ಟೆ ನಿಯಮಗಳು ಮತ್ತು ಜವಾಬ್ದಾರಿಗಳು' : 'Marketplace scope, buyer and seller responsibilities'}
            </Text>
          </View>
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.dangerMenuItem]}
          onPress={() => navigation.navigate('AccountDeletion')}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconBox, styles.dangerIconBox]}>
            <Text style={styles.menuIcon}>⚠️</Text>
          </View>
          <View style={styles.menuTextBox}>
            <Text style={[styles.menuTitle, styles.dangerText]}>
              {locale === 'kn' ? 'ಖಾತೆ ಅಳಿಸುವಿಕೆ ವಿನಂತಿ' : 'Delete Account'}
            </Text>
            <Text style={styles.menuSubtitle}>
              {locale === 'kn'
                ? 'ಖಾತೆಯನ್ನು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿ ಮತ್ತು ವೈಯಕ್ತಿಕ ಡೇಟಾ ಅಳಿಸಿ'
                : 'Deactivate account, revoke sessions, and anonymize data'}
            </Text>
          </View>
          <Text style={[styles.arrowText, styles.dangerText]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.appFooter}>
        <Text style={styles.appFooterText}>
          © {new Date().getFullYear()} MOOLA • {CUSTOMER_SUPPORT_CONFIG.brandTagline}
        </Text>
        <Text style={styles.appFooterSubtext}>
          {locale === 'kn' ? 'ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ' : 'All rights reserved'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginRight: 12,
  },
  backBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
  },
  banner: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  bannerDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  hoursText: {
    color: colors.accentLight,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 14,
  },
  lineCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  lineInfo: {
    marginBottom: 8,
  },
  lineLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  lineNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtn: {
    backgroundColor: colors.primary,
  },
  waBtn: {
    backgroundColor: '#25D366',
  },
  btnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  emailNotice: {
    backgroundColor: colors.primarySubtle,
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  emailNoticeText: {
    fontSize: 11,
    color: colors.primaryDark,
    lineHeight: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  dangerMenuItem: {
    borderBottomWidth: 0,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dangerIconBox: {
    backgroundColor: colors.errorBg,
  },
  menuIcon: {
    fontSize: 16,
  },
  menuTextBox: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  arrowText: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: '700',
    paddingLeft: 8,
  },
  dangerText: {
    color: colors.error,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  socialGrid: {
    gap: 10,
  },
  socialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  socialIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  instagramIconBox: {
    backgroundColor: '#E4405F',
  },
  facebookIconBox: {
    backgroundColor: '#1877F2',
  },
  socialGlyph: {
    fontSize: 18,
  },
  facebookF: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: -2,
  },
  socialTextBox: {
    flex: 1,
  },
  socialName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  socialHandle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  socialArrow: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
  },
  appFooter: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 8,
  },
  appFooterText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  appFooterSubtext: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
