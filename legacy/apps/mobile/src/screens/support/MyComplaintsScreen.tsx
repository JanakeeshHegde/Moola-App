import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import {
  ComplaintTicket,
  COMPLAINT_CATEGORY_LABELS,
  COMPLAINT_STATUS_LABELS,
  ComplaintStatus,
} from '@moola/shared';

export const MyComplaintsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { locale } = useLanguage();
  const { token } = useAuth();

  const [complaints, setComplaints] = useState<ComplaintTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ComplaintTicket | null>(null);

  const fetchComplaints = useCallback(
    async (pageNum = 1, shouldRefresh = false) => {
      if (!token) {
        setLoading(false);
        return;
      }

      if (shouldRefresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      try {
        const res = await apiService.complaints.getMy(token, pageNum, 10);
        if (res.success && res.data) {
          if (pageNum === 1) {
            setComplaints(res.data.complaints);
          } else {
            setComplaints((prev) => [...prev, ...res.data.complaints]);
          }
          setHasNext(res.data.hasNext);
          setPage(pageNum);
        }
      } catch (_err) {
        // Failed quietly or show empty
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchComplaints(1);
  }, [fetchComplaints]);

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return { bg: colors.surface, text: colors.textSecondary, border: colors.border };
      case 'ACKNOWLEDGED':
        return { bg: colors.primarySubtle, text: colors.primary, border: colors.primary };
      case 'UNDER_REVIEW':
        return { bg: colors.accentLight, text: colors.accentDark, border: colors.accent };
      case 'RESOLVED':
        return { bg: colors.organicBg, text: colors.organicGreen, border: colors.organicGreen };
      case 'CLOSED':
        return { bg: '#E2E8F0', text: '#475569', border: '#CBD5E1' };
      default:
        return { bg: colors.surface, text: colors.textSecondary, border: colors.border };
    }
  };

  const renderItem = ({ item }: { item: ComplaintTicket }) => {
    const statusStyle = getStatusColor(item.status);
    const dateFormatted = new Date(item.createdAt).toLocaleDateString();

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setSelectedTicket(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.ticketId}>{item.ticketId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {COMPLAINT_STATUS_LABELS[item.status] || item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.cardCategory}>
          {COMPLAINT_CATEGORY_LABELS[item.category] || item.category}
        </Text>
        <Text style={styles.cardSubject} numberOfLines={2}>
          {item.subject}
        </Text>

        {item.publicResponse && (
          <View style={styles.responsePreview}>
            <Text style={styles.responsePreviewLabel}>
              💬 {locale === 'kn' ? 'ಡೆವಲಪರ್ ಉತ್ತರ:' : 'Support Update:'}
            </Text>
            <Text style={styles.responsePreviewText} numberOfLines={2}>
              {item.publicResponse}
            </Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>📅 {dateFormatted}</Text>
          {item.isOverdue && (
            <Text style={styles.overdueBadge}>
              ⚠️ {locale === 'kn' ? '48 ಗಂಟೆ ಮೀರಿದೆ' : 'SLA Target Exceeded'}
            </Text>
          )}
          <Text style={styles.viewDetailsText}>
            {locale === 'kn' ? 'ವಿವರ ವೀಕ್ಷಿಸಿ ›' : 'View Details ›'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
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
          {locale === 'kn' ? 'ನನ್ನ ದೂರುಗಳು ಮತ್ತು ಸ್ಥಿತಿ' : 'My Complaints & Status'}
        </Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => navigation.navigate('SubmitComplaint')}
          activeOpacity={0.7}
        >
          <Text style={styles.newBtnText}>+ {locale === 'kn' ? 'ಹೊಸ' : 'New'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {locale === 'kn' ? 'ದೂರುಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...' : 'Loading your complaints...'}
          </Text>
        </View>
      ) : complaints.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>
            {locale === 'kn' ? 'ಯಾವುದೇ ದೂರುಗಳಿಲ್ಲ' : 'No Complaints Filed Yet'}
          </Text>
          <Text style={styles.emptyDesc}>
            {locale === 'kn'
              ? 'ನಿಮ್ಮ ಯಾವುದೇ ಆರ್ಡರ್ ಅಥವಾ ಉತ್ಪನ್ನದೊಂದಿಗೆ ಸಮಸ್ಯೆ ಇದ್ದರೆ, ನಮಗೆ ತಿಳಿಸಿ.'
              : 'If you experienced any issue with a food order or delivery, our team is ready to help.'}
          </Text>
          <TouchableOpacity
            style={styles.submitNewBtn}
            onPress={() => navigation.navigate('SubmitComplaint')}
            activeOpacity={0.8}
          >
            <Text style={styles.submitNewBtnText}>
              ✍️ {locale === 'kn' ? 'ಹೊಸ ದೂರು ಸಲ್ಲಿಸಿ' : 'Submit a Complaint'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item.ticketId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchComplaints(1, true)}
              colors={[colors.primary]}
            />
          }
          onEndReached={() => {
            if (hasNext && !loading && !refreshing) {
              fetchComplaints(page + 1);
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}

      {/* Detail Modal */}
      <Modal visible={!!selectedTicket} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedTicket && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTicketId}>{selectedTicket.ticketId}</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedTicket(null)}
                    style={styles.closeBtn}
                  >
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalStatusRow}>
                  <Text style={styles.modalCategory}>
                    {COMPLAINT_CATEGORY_LABELS[selectedTicket.category] || selectedTicket.category}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedTicket.status).bg }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(selectedTicket.status).text }]}>
                      {COMPLAINT_STATUSES_LABEL(selectedTicket.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalSubject}>{selectedTicket.subject}</Text>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionHeading}>
                    {locale === 'kn' ? 'ಸಲ್ಲಿಸಿದ ವಿವರಣೆ:' : 'Submitted Description:'}
                  </Text>
                  <Text style={styles.modalDescText}>{selectedTicket.description}</Text>
                </View>

                {selectedTicket.orderId && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionHeading}>
                      {locale === 'kn' ? 'ಆರ್ಡರ್ ಉಲ್ಲೇಖ:' : 'Order Reference:'}
                    </Text>
                    <Text style={styles.modalDescText}>{String(selectedTicket.orderId)}</Text>
                  </View>
                )}

                {/* Public Response from Developers */}
                {selectedTicket.publicResponse && (
                  <View style={styles.responseBox}>
                    <Text style={styles.responseBoxHeading}>
                      🛡️ {locale === 'kn' ? 'ಡೆವಲಪರ್ ಬೆಂಬಲ ಪ್ರತಿಕ್ರಿಯೆ:' : 'Developer Support Response:'}
                    </Text>
                    <Text style={styles.responseBoxText}>{selectedTicket.publicResponse}</Text>
                  </View>
                )}

                {/* Status Timeline */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionHeading}>
                    {locale === 'kn' ? 'ಸ್ಥಿತಿ ಇತಿಹಾಸ:' : 'Status History:'}
                  </Text>
                  {selectedTicket.statusHistory?.map((h, idx) => (
                    <View key={idx} style={styles.historyRow}>
                      <Text style={styles.historyDot}>•</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyStatus}>{h.status}</Text>
                        <Text style={styles.historyDate}>
                          {new Date(h.changedAt).toLocaleString()}
                        </Text>
                        {h.note && <Text style={styles.historyNote}>{h.note}</Text>}
                      </View>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => setSelectedTicket(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.doneBtnText}>
                    {locale === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

function COMPLAINT_STATUSES_LABEL(status: ComplaintStatus) {
  return COMPLAINT_STATUS_LABELS[status] || status;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
    borderRadius: 6,
    marginRight: 8,
  },
  backBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
  },
  newBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  newBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  submitNewBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitNewBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ticketId: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardCategory: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  cardSubject: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 19,
    marginBottom: 8,
  },
  responsePreview: {
    backgroundColor: colors.primarySubtle,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  responsePreviewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 2,
  },
  responsePreviewText: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  cardDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  overdueBadge: {
    fontSize: 11,
    color: colors.error,
    fontWeight: '700',
  },
  viewDetailsText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTicketId: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '700',
  },
  modalStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalCategory: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalSubject: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 14,
    lineHeight: 22,
  },
  modalSection: {
    marginBottom: 14,
  },
  modalSectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  modalDescText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 19,
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 8,
  },
  responseBox: {
    backgroundColor: colors.primarySubtle,
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  responseBoxHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  responseBoxText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyDot: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
    lineHeight: 18,
  },
  historyStatus: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  historyNote: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  doneBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
