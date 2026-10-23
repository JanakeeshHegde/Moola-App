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
  Modal,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_CATEGORY_LABELS,
  ComplaintCategory,
} from '@moola/shared';

export const SubmitComplaintScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { locale } = useLanguage();
  const { token } = useAuth();
  const prefillOrderId = route.params?.orderId || '';

  const [category, setCategory] = useState<ComplaintCategory>('product_quality_damaged');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [orderId, setOrderId] = useState(prefillOrderId);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [loading, setLoading] = useState(false);

  // Success modal
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!subject.trim() || subject.trim().length < 3) {
      Alert.alert(
        locale === 'kn' ? 'ಮಾನ್ಯವಲ್ಲದ ವಿಷಯ' : 'Invalid Subject',
        locale === 'kn'
          ? 'ವಿಷಯವು ಕನಿಷ್ಠ 3 ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು.'
          : 'Subject must be at least 3 characters long.',
      );
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      Alert.alert(
        locale === 'kn' ? 'ವಿವರಣೆ ಅಗತ್ಯವಿದೆ' : 'Description Required',
        locale === 'kn'
          ? 'ದಯವಿಟ್ಟು ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ಕನಿಷ್ಠ 10 ಅಕ್ಷರಗಳಲ್ಲಿ ವಿವರಿಸಿ.'
          : 'Please provide at least 10 characters describing the issue.',
      );
      return;
    }

    if (!token) {
      Alert.alert(
        locale === 'kn' ? 'ದೃಢೀಕರಣ ದೋಷ' : 'Authentication Required',
        locale === 'kn'
          ? 'ದೂರು ಸಲ್ಲಿಸಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಆಗಿ.'
          : 'Please log in to submit a complaint ticket.',
      );
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.complaints.submit(
        {
          category,
          subject: subject.trim(),
          description: description.trim(),
          orderId: orderId.trim() ? orderId.trim() : undefined,
          priority,
        },
        token,
      );

      if (res.success && res.data?.ticket?.ticketId) {
        setCreatedTicketId(res.data.ticket.ticketId);
      } else {
        Alert.alert(
          locale === 'kn' ? 'ದೋಷ' : 'Submission Failed',
          res.message || 'Could not submit complaint. Please try again.',
        );
      }
    } catch (err: any) {
      Alert.alert(
        locale === 'kn' ? 'ದೋಷ' : 'Submission Error',
        err.message || 'Failed to submit complaint. Please check your connection.',
      );
    } finally {
      setLoading(false);
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
          {locale === 'kn' ? 'ಹೊಸ ದೂರು ಸಲ್ಲಿಸಿ' : 'Submit a Complaint'}
        </Text>
      </View>

      <Text style={styles.subtext}>
        {locale === 'kn'
          ? 'ನಿಮ್ಮ ದೂರನ್ನು ಸ್ವೀಕರಿಸಿ ನಮ್ಮ ತಂಡವು 48 ಗಂಟೆಗಳ ಒಳಗೆ ಪರಿಶೀಲಿಸುತ್ತದೆ.'
          : 'Our management team will review your ticket within our 48-hour SLA response target.'}
      </Text>

      {/* Category Selection */}
      <Text style={styles.fieldLabel}>
        {locale === 'kn' ? 'ದೂರಿನ ವರ್ಗ *' : 'Complaint Category *'}
      </Text>
      <View style={styles.categoryWrap}>
        {COMPLAINT_CATEGORIES.map((cat) => {
          const isSelected = category === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
              onPress={() => setCategory(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  isSelected && styles.categoryChipTextSelected,
                ]}
              >
                {COMPLAINT_CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Subject */}
      <Text style={styles.fieldLabel}>
        {locale === 'kn' ? 'ಸಂಕ್ಷಿಪ್ತ ವಿಷಯ *' : 'Short Subject *'}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={
          locale === 'kn'
            ? 'ಉದಾ: ಪ್ಯಾಕೆಟ್ ಹಾನಿಯಾಗಿದೆ ಅಥವಾ ತಪ್ಪಾದ ಮಸಾಲೆ'
            : 'e.g. Broken pickle jar, wrong spice powder received'
        }
        placeholderTextColor={colors.textMuted}
        value={subject}
        onChangeText={setSubject}
        maxLength={150}
      />

      {/* Order Reference */}
      <Text style={styles.fieldLabel}>
        {locale === 'kn' ? 'ಸಂಬಂಧಿಸಿದ ಆರ್ಡರ್ ಐಡಿ (ಐಚ್ಛಿಕ)' : 'Related Order ID (Optional)'}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={locale === 'kn' ? 'ಉದಾ: 6718...' : 'Order ID reference if applicable'}
        placeholderTextColor={colors.textMuted}
        value={orderId}
        onChangeText={setOrderId}
      />

      {/* Detailed Description */}
      <Text style={styles.fieldLabel}>
        {locale === 'kn' ? 'ವಿವರವಾದ ವಿವರಣೆ *' : 'Detailed Description *'}
      </Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder={
          locale === 'kn'
            ? 'ಸಮಸ್ಯೆಯನ್ನು ವಿವರವಾಗಿ ಬರೆಯಿರಿ...'
            : 'Explain what happened in detail, including dates, condition, or communications...'
        }
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={5}
        maxLength={1500}
      />

      {/* Priority Selector */}
      <Text style={styles.fieldLabel}>
        {locale === 'kn' ? 'ಆದ್ಯತೆ' : 'Priority'}
      </Text>
      <View style={styles.priorityRow}>
        {(['low', 'medium', 'high', 'urgent'] as const).map((p) => {
          const isSelected = priority === p;
          return (
            <TouchableOpacity
              key={p}
              style={[styles.priorityBtn, isSelected && styles.priorityBtnSelected]}
              onPress={() => setPriority(p)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.priorityBtnText,
                  isSelected && styles.priorityBtnTextSelected,
                ]}
              >
                {p.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitBtnText}>
            ✓ {locale === 'kn' ? 'ದೂರು ಸಲ್ಲಿಸಿ' : 'Submit Ticket'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Success Modal */}
      <Modal visible={!!createdTicketId} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>🎉</Text>
            <Text style={styles.modalTitle}>
              {locale === 'kn' ? 'ದೂರು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ!' : 'Complaint Registered!'}
            </Text>
            <Text style={styles.modalTicketLabel}>
              {locale === 'kn' ? 'ನಿಮ್ಮ ಟಿಕೆಟ್ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ:' : 'Your Ticket Reference ID:'}
            </Text>
            <View style={styles.ticketBadge}>
              <Text style={styles.ticketBadgeText}>{createdTicketId}</Text>
            </View>
            <Text style={styles.modalDesc}>
              {locale === 'kn'
                ? 'ನಮ್ಮ ತಂಡವು 48 ಗಂಟೆಗಳ ಒಳಗೆ ಇದನ್ನು ಪರಿಶೀಲಿಸುತ್ತದೆ. ನೀವು "ನನ್ನ ದೂರುಗಳು" ಪರದೆಯಲ್ಲಿ ನವೀಕರಣಗಳನ್ನು ವೀಕ್ಷಿಸಬಹುದು.'
                : 'Our developer management team has received your ticket and will review it within 48 hours. You can track progress under My Complaints.'}
            </Text>

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => {
                setCreatedTicketId(null);
                navigation.replace('MyComplaints');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalPrimaryBtnText}>
                {locale === 'kn' ? 'ನನ್ನ ದೂರುಗಳನ್ನು ವೀಕ್ಷಿಸಿ' : 'View My Complaints'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSecondaryBtn}
              onPress={() => {
                setCreatedTicketId(null);
                navigation.goBack();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalSecondaryBtnText}>
                {locale === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 8,
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
  subtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    marginTop: 12,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextSelected: {
    color: '#FFF',
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  textArea: {
    height: 110,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  priorityBtnSelected: {
    backgroundColor: colors.accentDark,
    borderColor: colors.accentDark,
  },
  priorityBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  priorityBtnTextSelected: {
    color: '#FFF',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnDisabled: {
    backgroundColor: colors.textMuted,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  modalTicketLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  ticketBadge: {
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  ticketBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  modalDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  modalPrimaryBtn: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalPrimaryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  modalSecondaryBtn: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalSecondaryBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
});
