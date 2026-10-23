import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { MobileNotificationService } from '../services/notificationService';
import { ApplySellerModal } from '../screens/seller/ApplySellerModal';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showCart?: boolean;
  onCartPress?: () => void;
  showRoleSwitcher?: boolean;
  onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showCart = true,
  onCartPress,
  onNotificationPress,
}) => {
  const navigation = useNavigation<any>();
  const { locale, toggleLocale } = useLanguage();
  const { user, role, isAuthenticated, sellerApplicationStatus, logout } = useAuth();
  const { itemCount } = useCart();
  const [unreadNotifs, setUnreadNotifs] = useState(2);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    MobileNotificationService.getUnreadCount().then(setUnreadNotifs).catch(() => {});
  }, []);

  const handleAccountPress = () => {
    if (isAuthenticated) {
      Alert.alert(
        locale === 'kn' ? 'ಖಾತೆ ನಿರ್ವಹಣೆ' : 'Account Management',
        `${user?.name || 'User'} (${user?.phone})\nRole: ${role.toUpperCase()}`,
        [
          { text: 'Support & Help', onPress: () => navigation.navigate('Support') },
          { text: 'Privacy & Terms', onPress: () => navigation.navigate('TermsConditions') },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: () => {
              logout();
              navigation.navigate('Welcome');
            },
          },
          { text: 'Close', style: 'cancel' },
        ],
      );
    } else {
      navigation.navigate('Welcome');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.brandContainer}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/logo.png')}
            style={styles.brandLogo}
            resizeMode="cover"
          />
          <View style={styles.brandTextCol}>
            <Text style={styles.brandTitle}>MOOLA</Text>
            <Text style={styles.brandSubtitle}>
              {locale === 'kn' ? 'ಮೂಲದಿಂದ. ನಿಮ್ಮ ಮನೆಗೆ.' : 'From the Source. To Your Home.'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actionsRow}>
          {/* Role Status or Sell on MOOLA Button */}
          {role === 'buyer' && (
            sellerApplicationStatus === 'pending' || sellerApplicationStatus === 'under_review' ? (
              <TouchableOpacity
                style={styles.pendingBadge}
                onPress={() => setShowApplyModal(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.pendingBadgeText}>⏳ Applied</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.sellBtn}
                onPress={() => setShowApplyModal(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.sellBtnText}>
                  {locale === 'kn' ? 'ಮಾರಾಟ ಮಾಡಿ' : 'Sell'}
                </Text>
              </TouchableOpacity>
            )
          )}

          {role === 'seller' && (
            <View style={styles.sellerBadge}>
              <Text style={styles.sellerBadgeText} numberOfLines={1}>
                🌾 {user?.shopName ? user.shopName.slice(0, 12) : 'Seller'}
              </Text>
            </View>
          )}

          {role === 'admin' && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>🛡️ Admin</Text>
            </View>
          )}

          {/* Language Switcher */}
          <TouchableOpacity
            style={styles.langButton}
            onPress={toggleLocale}
            activeOpacity={0.7}
          >
            <Text style={styles.langText}>{locale === 'en' ? 'ಕನ್ನಡ' : 'English'}</Text>
          </TouchableOpacity>

          {/* Notification Bell */}
          <TouchableOpacity
            style={styles.notifButton}
            onPress={() => {
              if (onNotificationPress) onNotificationPress();
              else navigation.navigate('Notifications');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.notifIcon}>🔔</Text>
            {unreadNotifs > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadNotifs}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Cart Badge (Buyers only) */}
          {showCart && role === 'buyer' && (
            <TouchableOpacity
              style={styles.cartButton}
              onPress={onCartPress}
              activeOpacity={0.7}
            >
              <Text style={styles.cartIcon}>🛒</Text>
              {itemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{itemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* User Account / Sign In */}
          <TouchableOpacity
            style={styles.accountButton}
            onPress={handleAccountPress}
            activeOpacity={0.7}
          >
            <Text style={styles.accountIcon}>{isAuthenticated ? '👤' : '🔑'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {title && (
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{title}</Text>
          {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
        </View>
      )}

      {/* Seller Onboarding Modal */}
      <ApplySellerModal
        visible={showApplyModal}
        onClose={() => setShowApplyModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingTop: 45,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  brandTextCol: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textInverse,
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    fontSize: 9.5,
    color: '#D1E7DD',
    fontWeight: '600',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  langText: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '700',
  },
  sellBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  sellBtnText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  pendingBadgeText: {
    color: '#B45309',
    fontSize: 10.5,
    fontWeight: '700',
  },
  sellerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 14,
    maxWidth: 130,
  },
  sellerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  adminBadge: {
    backgroundColor: '#7C3AED',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 14,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  accountButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountIcon: {
    fontSize: 16,
  },
  notifButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifIcon: {
    fontSize: 16,
  },
  cartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartIcon: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  titleContainer: {
    marginTop: 12,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textInverse,
  },
  subtitleText: {
    fontSize: 12,
    color: '#E2E8F0',
    marginTop: 2,
  },
});
