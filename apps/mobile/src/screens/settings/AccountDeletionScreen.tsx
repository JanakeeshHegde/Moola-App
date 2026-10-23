import React, { useState, useEffect } from 'react';
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
import { apiService } from '../../services/api';
import { AccountDeletionRequest, DELETION_REQUEST_STATUS_LABELS } from '@moola/shared';

export const AccountDeletionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { locale } = useLanguage();
  const { user, token } = useAuth();

  const [existingRequest, setExistingRequest] = useState<AccountDeletionRequest | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkDeletionStatus();
  }, []);

  const checkDeletionStatus = async () => {
    if (!token) {
      setLoadingStatus(false);
      return;
    }
    try {
      const res = await apiService.accountDeletion.getMyStatus(token);
      if (res.success && res.data?.hasRequest && res.data.request) {
        setExistingRequest(res.data.request);
      }
    } catch {
      // Quiet fail
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!confirmed) {
      Alert.alert(
        locale === 'kn' ? 'ದೃಢೀಕರಣ ಅಗತ್ಯವಿದೆ' : 'Confirmation Required',
        locale === 'kn'
          ? 'ದಯವಿಟ್ಟು ಮುಂದುವರಿಯಲು ಚೆಕ್‌ಬಾಕ್ಸ್ ಅನ್ನು ಗುರುತಿಸಿ.'
          : 'Please acknowledge the deletion consequences by checking the confirmation box.',
      );
      return;
    }

    Alert.alert(
      locale === 'kn' ? 'ಖಾತೆ ಅಳಿಸುವಿಕೆ ದೃಢೀಕರಿಸಿ' : 'Confirm Account Deletion',
      locale === 'kn'
        ? 'ನೀವು ಖಚಿತವಾಗಿ ನಿಮ್ಮ MOOLA ಖಾತೆಯನ್ನು ಅಳಿಸಲು ಬಯಸುವಿರಾ? ಈ ಕ್ರಿಯೆಯನ್ನು ಹಿಂತಿರುಗಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.'
        : 'Are you sure you want to request permanent account deletion? This will deactivate your profile and shop listings.',
      [
        { text: locale === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel', style: 'cancel' },
        {
          text: locale === 'kn' ? 'ಹೌದು, ಅಳಿಸಿ' : 'Yes, Request Deletion',
          style: 'destructive',
          onPress: performDeletionRequest,
        },
      ],
    );
  };

  const performDeletionRequest = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await apiService.accountDeletion.request(
        { reason: reason.trim() },
        token,
      );

      if (res.success && res.data?.request) {
        setExistingRequest(res.data.request);
        Alert.alert(
          locale === 'kn' ? 'ವಿನಂತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ' : 'Request Submitted',
          res.data.notice ||
            'Your account deletion request has been registered and is under review.',
        );
      } else {
        Alert.alert(
          locale === 'kn' ? 'ದೋಷ' : 'Error',
          res.message || 'Could not submit request. Please try again.',
        );
      }
    } catch (err: any) {
      Alert.alert(
        locale === 'kn' ? 'ದೋಷ' : 'Submission Error',
        err.message || 'Failed to submit account deletion request.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>← {locale === 'kn' ? 'ಹಿಂದಕ್ಕೆ' : 'Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {locale === 'kn' ? 'ಖಾತೆ ಅಳಿಸುವಿಕೆ' : 'Account Deletion'}
        </Text>
      </View>

      {loadingStatus ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : existingRequest ? (
        /* Status Card for Existing Request */
        <View style={styles.statusCard}>
          <Text style={styles.statusIcon}>⏳</Text>
          <Text style={styles.statusTitle}>
            {locale === 'kn' ? 'ಅಳಿಸುವಿಕೆ ವಿನಂತಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ' : 'Deletion Request In Progress'}
          </Text>
          <Text style={styles.statusRef}>
            ID: <Text style={{ fontWeight: '800' }}>{existingRequest.requestId}</Text>
          </Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>
              {DELETION_REQUEST_STATUS_LABELS[existingRequest.status] || existingRequest.status}
            </Text>
          </View>
          <Text style={styles.statusDesc}>
            {locale === 'kn'
              ? 'ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ನಮ್ಮ ತಂಡವು ಪರಿಶೀಲಿಸುತ್ತಿದೆ. ಸಕ್ರಿಯ ಆರ್ಡರ್‌ಗಳು ಪೂರ್ಣಗೊಂಡ ನಂತರ ಖಾತೆಯನ್ನು ಶಾಶ್ವತವಾಗಿ ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗುವುದು.'
              : 'Your deletion request is currently under review by our developer administrators. Accounts are deactivated once active orders and complaints are settled.'}
          </Text>

          {existingRequest.activeOrdersCount > 0 && (
            <View style={styles.warningNote}>
              <Text style={styles.warningNoteText}>
                ⚠️ {locale === 'kn'
                  ? `ಬಾಕಿ ಉಳಿದಿರುವ ಆರ್ಡರ್‌ಗಳು: ${existingRequest.activeOrdersCount}`
                  : `Active orders pending fulfillment or cancellation: ${existingRequest.activeOrdersCount}`}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.doneBtnText}>
              {locale === 'kn' ? 'ಹಿಂದಿರುಗಿ' : 'Return to Profile'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Deletion Warning and Submission Form */
        <View>
          <View style={styles.warningBox}>
            <Text style={styles.warningHeading}>
              ⚠️ {locale === 'kn' ? 'ಖಾತೆ ಅಳಿಸುವಿಕೆಯ ಪರಿಣಾಮಗಳು' : 'Consequences of Deleting Account'}
            </Text>
            <Text style={styles.warningItem}>
              • {locale === 'kn'
                ? 'ನಿಮ್ಮ ಹೆಸರು, ಫೋನ್ ಸಂಖ್ಯೆ ಮತ್ತು ವಿಳಾಸಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲಾಗುತ್ತದೆ/ಅನಾಮಧೇಯಗೊಳಿಸಲಾಗುತ್ತದೆ.'
                : 'Your name, mobile number, saved delivery addresses, and profile details will be permanently anonymized.'}
            </Text>
            {user?.role === 'seller' && (
              <Text style={styles.warningItem}>
                • {locale === 'kn'
                  ? 'ನಿಮ್ಮ ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳ ಪಟ್ಟಿಗಳನ್ನು ಆಫ್‌ಲೈನ್‌ಗೆ ತರಲಾಗುತ್ತದೆ ಮತ್ತು ಅಂಗಡಿ ಪ್ರೊಫೈಲ್ ಮುಚ್ಚಲ್ಪಡುತ್ತದೆ.'
                  : 'All your active product listings will be removed from the marketplace and your store closed.'}
              </Text>
            )}
            <Text style={styles.warningItem}>
              • {locale === 'kn'
                ? 'ಎಲ್ಲಾ ಸಕ್ರಿಯ ಸೆಷನ್‌ಗಳು ಮತ್ತು ಪುಶ್ ಅಧಿಸೂಚನೆಗಳು ರದ್ದಾಗುತ್ತವೆ.'
                : 'All device push notifications and active sessions will be terminated.'}
            </Text>
            <Text style={styles.warningItem}>
              • {locale === 'kn'
                ? 'ಕಾನೂನುಬದ್ಧ ತೆರಿಗೆ ಮತ್ತು ಲೆಕ್ಕಪತ್ರ ನಿಯಮಗಳಿಗೆ ಅಗತ್ಯವಿರುವ ಪೂರ್ಣಗೊಂಡ ಆರ್ಡರ್ ದಾಖಲೆಗಳನ್ನು ಮಾತ್ರ ಅನಾಮಧೇಯವಾಗಿ ಇರಿಸಲಾಗುತ್ತದೆ.'
                : 'Statutory tax and completed invoice records will be retained in anonymized format as legally required.'}
            </Text>
          </View>

          <Text style={styles.fieldLabel}>
            {locale === 'kn' ? 'ಕಾರಣ (ಐಚ್ಛಿಕ)' : 'Reason for Deletion (Optional)'}
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder={
              locale === 'kn'
                ? 'ನಿಮ್ಮ ಅನುಭವದ ಬಗ್ಗೆ ನಮಗೆ ತಿಳಿಸಿ...'
                : 'Tell us why you wish to delete your account...'
            }
            placeholderTextColor={colors.textMuted}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            maxLength={500}
          />

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setConfirmed(!confirmed)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
              {confirmed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              {locale === 'kn'
                ? 'ನನ್ನ MOOLA ಖಾತೆ ಮತ್ತು ಡೇಟಾವನ್ನು ಅಳಿಸುವುದರಿಂದ ಉಂಟಾಗುವ ಪರಿಣಾಮಗಳನ್ನು ನಾನು ಒಪ್ಪಿಕೊಳ್ಳುತ್ತೇನೆ.'
                : 'I understand that this action will permanently deactivate my account and revoke my sessions.'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteBtn, (!confirmed || submitting) && styles.deleteBtnDisabled]}
            onPress={handleSubmitRequest}
            disabled={!confirmed || submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.deleteBtnText}>
                🗑️ {locale === 'kn' ? 'ಖಾತೆ ಅಳಿಸುವಿಕೆ ವಿನಂತಿಸಿ' : 'Submit Deletion Request'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
    borderRadius: 6,
    marginRight: 10,
  },
  backBtnText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  warningBox: {
    backgroundColor: colors.errorBg,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  warningHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.error,
    marginBottom: 8,
  },
  warningItem: {
    fontSize: 12,
    color: '#7F1D1D',
    lineHeight: 18,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  textArea: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: colors.textPrimary,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  deleteBtn: {
    backgroundColor: colors.error,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtnDisabled: {
    backgroundColor: colors.textMuted,
  },
  deleteBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  statusCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statusRef: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  statusPill: {
    backgroundColor: colors.accentLight,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginBottom: 12,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accentDark,
  },
  statusDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  warningNote: {
    backgroundColor: colors.accentLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  warningNoteText: {
    fontSize: 12,
    color: colors.accentDark,
    fontWeight: '700',
  },
  doneBtn: {
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
