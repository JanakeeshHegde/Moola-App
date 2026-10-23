import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';
import { Notification, NotificationType } from '@moola/shared';
import { MobileNotificationService } from '../../services/notificationService';

interface NotificationsScreenProps {
  navigation: any;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const { locale, t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'order_update' | 'shipment'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNotifications = async () => {
    const list = await MobileNotificationService.getNotifications();
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    await MobileNotificationService.markAllAsRead();
    await loadNotifications();
  };

  const handleClearAll = () => {
    Alert.alert(
      locale === 'kn' ? 'ಎಲ್ಲಾ ಸೂಚನೆಗಳನ್ನು ತೆರವುಗೊಳಿಸುವುದೇ?' : 'Clear All Notifications?',
      locale === 'kn'
        ? 'ಎಲ್ಲಾ ಹಿಂದಿನ ಸೂಚನೆಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲಾಗುತ್ತದೆ.'
        : 'This will clear your notification history.',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: locale === 'kn' ? 'ತೆರವುಗೊಳಿಸಿ' : 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await MobileNotificationService.clearAll();
            await loadNotifications();
          },
        },
      ],
    );
  };

  const handleNotificationPress = async (item: Notification) => {
    if (!item.isRead) {
      await MobileNotificationService.markAsRead(item._id);
      await loadNotifications();
    }

    // Direct contextual navigation
    if (item.data?.orderId) {
      navigation.navigate('OrderTracking', { orderId: item.data.orderId });
    } else if (item.data?.requestId) {
      navigation.navigate('CustomRequests');
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'order_update':
        return '📦';
      case 'shipment':
        return '🚚';
      case 'custom_offer':
        return '🤝';
      case 'message':
        return '💬';
      case 'prebooking':
        return '🌾';
      default:
        return '🔔';
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return locale === 'kn' ? 'ಈಗಷ್ಟೇ' : 'Just now';
    if (diffMins < 60) return `${diffMins}m ${locale === 'kn' ? 'ಹಿಂದೆ' : 'ago'}`;
    if (diffHours < 24) return `${diffHours}h ${locale === 'kn' ? 'ಹಿಂದೆ' : 'ago'}`;
    if (diffDays === 1) return locale === 'kn' ? 'ನಿನ್ನೆ' : 'Yesterday';
    return `${diffDays}d ${locale === 'kn' ? 'ಹಿಂದೆ' : 'ago'}`;
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'order_update') return n.type === 'order_update';
    if (activeTab === 'shipment') return n.type === 'shipment';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={styles.container}>
      <Header
        title={locale === 'kn' ? 'ಸೂಚನೆಗಳು' : 'Notifications'}
        subtitle={
          unreadCount > 0
            ? `${unreadCount} ${locale === 'kn' ? 'ಓದದಿರುವ ಸೂಚನೆಗಳಿವೆ' : 'unread notifications'}`
            : locale === 'kn'
            ? 'ಎಲ್ಲಾ ಸೂಚನೆಗಳನ್ನು ಓದಲಾಗಿದೆ'
            : 'All caught up'
        }
        showCart={false}
      />

      {/* Action Header & Tabs */}
      <View style={styles.topActionsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'all' && styles.filterTabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.filterTabText, activeTab === 'all' && styles.filterTabTextActive]}>
              {locale === 'kn' ? 'ಎಲ್ಲವೂ' : 'All'} ({notifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'unread' && styles.filterTabActive]}
            onPress={() => setActiveTab('unread')}
          >
            <Text style={[styles.filterTabText, activeTab === 'unread' && styles.filterTabTextActive]}>
              {locale === 'kn' ? 'ಓದದಿರುವುದು' : 'Unread'} ({unreadCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'order_update' && styles.filterTabActive]}
            onPress={() => setActiveTab('order_update')}
          >
            <Text
              style={[
                styles.filterTabText,
                activeTab === 'order_update' && styles.filterTabTextActive,
              ]}
            >
              📦 {locale === 'kn' ? 'ಆರ್ಡರ್‌ಗಳು' : 'Orders'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'shipment' && styles.filterTabActive]}
            onPress={() => setActiveTab('shipment')}
          >
            <Text
              style={[styles.filterTabText, activeTab === 'shipment' && styles.filterTabTextActive]}
            >
              🚚 {locale === 'kn' ? 'ರವಾನೆ' : 'Shipments'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {unreadCount > 0 && (
          <TouchableOpacity style={styles.readAllBtn} onPress={handleMarkAllRead}>
            <Text style={styles.readAllBtnText}>
              ✓ {locale === 'kn' ? 'ಎಲ್ಲವನ್ನೂ ಓದಿದೆ' : 'Mark All Read'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>
              {locale === 'kn' ? 'ಯಾವುದೇ ಹೊಸ ಸೂಚನೆಗಳಿಲ್ಲ' : 'No Notifications'}
            </Text>
            <Text style={styles.emptySub}>
              {locale === 'kn'
                ? 'ಆರ್ಡರ್ ನವೀಕರಣಗಳು, ಪಾವತಿ ದೃಢೀಕರಣ ಮತ್ತು ಕೊರಿಯರ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಮಾಹಿತಿ ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ.'
                : 'Order requests, seller confirmations, WhatsApp enquiries & consignment tracking updates will appear here.'}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
              onPress={() => handleNotificationPress(item)}
              activeOpacity={0.8}
            >
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>{getNotificationIcon(item.type)}</Text>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleBold]}>
                    {item.title}
                  </Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.notifBody}>{item.body}</Text>

                <View style={styles.cardMetaRow}>
                  <Text style={styles.timestampText}>{formatRelativeTime(item.createdAt)}</Text>
                  {item.pushSent && (
                    <View style={styles.pushBadge}>
                      <Text style={styles.pushBadgeText}>✓ EXPO PUSH</Text>
                    </View>
                  )}
                  {Boolean(item.data?.orderId) && (
                    <Text style={styles.tapActionText}>
                      {locale === 'kn' ? 'ಆರ್ಡರ್ ನೋಡಿ →' : 'View Order →'}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {notifications.length > 0 && (
          <TouchableOpacity style={styles.clearAllBtn} onPress={handleClearAll}>
            <Text style={styles.clearAllBtnText}>
              {locale === 'kn' ? 'ಎಲ್ಲಾ ಸೂಚನೆಗಳನ್ನು ಅಳಿಸಿ' : 'Clear All Notifications'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  tabsScroll: {
    flexDirection: 'row',
    marginRight: 8,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  readAllBtn: {
    backgroundColor: colors.organicBg,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.25)',
  },
  readAllBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.organicGreen,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  notifCardUnread: {
    backgroundColor: '#FAFDF8',
    borderColor: 'rgba(34, 197, 94, 0.35)',
    borderLeftWidth: 4,
    borderLeftColor: colors.organicGreen,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconEmoji: {
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  notifTitleBold: {
    fontWeight: '800',
    color: colors.primaryDark,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.organicGreen,
  },
  notifBody: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 8,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timestampText: {
    fontSize: 10.5,
    color: colors.textMuted,
    fontWeight: '600',
  },
  pushBadge: {
    backgroundColor: colors.organicBg,
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  pushBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.organicGreen,
  },
  tapActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  clearAllBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  clearAllBtnText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
