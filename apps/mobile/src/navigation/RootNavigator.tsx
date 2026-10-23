import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

// Screens
import { HomeScreen } from '../screens/buyer/HomeScreen';
import { ProductDetailScreen } from '../screens/buyer/ProductDetailScreen';
import { CartScreen } from '../screens/buyer/CartScreen';
import { CheckoutScreen } from '../screens/buyer/CheckoutScreen';
import { OrderTrackingScreen } from '../screens/buyer/OrderTrackingScreen';
import { CustomRequestsScreen } from '../screens/buyer/CustomRequestsScreen';
import { NewCustomRequestScreen } from '../screens/buyer/NewCustomRequestScreen';
import { PreBookingScreen } from '../screens/buyer/PreBookingScreen';
import { ChatScreen } from '../screens/buyer/ChatScreen';
import { NotificationsScreen } from '../screens/buyer/NotificationsScreen';

import { SellerDashboardScreen } from '../screens/seller/SellerDashboardScreen';
import { AddProductScreen } from '../screens/seller/AddProductScreen';
import { SellerOrdersScreen } from '../screens/seller/SellerOrdersScreen';
import { SellerKYCScreen } from '../screens/seller/SellerKYCScreen';

import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';

import { WelcomeScreen } from '../screens/auth/WelcomeScreen';

// Support, Legal & Settings Screens
import { SupportScreen } from '../screens/support/SupportScreen';
import { SubmitComplaintScreen } from '../screens/support/SubmitComplaintScreen';
import { MyComplaintsScreen } from '../screens/support/MyComplaintsScreen';
import { PrivacyPolicyScreen } from '../screens/legal/PrivacyPolicyScreen';
import { TermsConditionsScreen } from '../screens/legal/TermsConditionsScreen';
import { AccountDeletionScreen } from '../screens/settings/AccountDeletionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Buyer Tab Navigator ─────────────────────────────────────
function BuyerTabs() {
  const { locale, t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('home'),
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🌿</Text>,
        }}
      />
      <Tab.Screen
        name="CustomRequests"
        component={CustomRequestsScreen}
        options={{
          tabBarLabel: locale === 'kn' ? 'ಬೇಡಿಕೆಗಳು' : 'Requests',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🤝</Text>,
        }}
      />
      <Tab.Screen
        name="PreBooking"
        component={PreBookingScreen}
        options={{
          tabBarLabel: locale === 'kn' ? 'ಮುಂಗಡ' : 'Pre-Book',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🌾</Text>,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: locale === 'kn' ? 'ಕಾರ್ಟ್' : 'Cart',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🛒</Text>,
        }}
      />
      <Tab.Screen
        name="BuyerSupport"
        component={SupportScreen}
        options={{
          tabBarLabel: locale === 'kn' ? 'ಬೆಂಬಲ' : 'Support',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🎧</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Seller Tab Navigator ────────────────────────────────────
function SellerTabs() {
  const { locale, t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="SellerDashboard"
        component={SellerDashboardScreen}
        options={{
          tabBarLabel: t('dashboard'),
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="SellerOrders"
        component={SellerOrdersScreen}
        options={{
          tabBarLabel: locale === 'kn' ? 'ಆರ್ಡರ್‌ಗಳು' : 'Orders',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>📦</Text>,
        }}
      />
      <Tab.Screen
        name="SellerBids"
        component={CustomRequestsScreen}
        options={{
          tabBarLabel: locale === 'kn' ? 'ಬೇಡಿಕೆಗಳು' : 'Buyer Bids',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🤝</Text>,
        }}
      />
      <Tab.Screen
        name="SellerKYC"
        component={SellerKYCScreen}
        options={{
          tabBarLabel: 'KYC',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🛡️</Text>,
        }}
      />
      <Tab.Screen
        name="SellerSupport"
        component={SupportScreen}
        options={{
          tabBarLabel: locale === 'kn' ? 'ಬೆಂಬಲ' : 'Support',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🎧</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Admin Tab Navigator ─────────────────────────────────────
function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen
        name="AdminOverview"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Overview & KYC',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🛡️</Text>,
        }}
      />
      <Tab.Screen
        name="AdminOrders"
        component={SellerOrdersScreen}
        options={{
          tabBarLabel: 'All Orders',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>📦</Text>,
        }}
      />
      <Tab.Screen
        name="AdminSupport"
        component={SupportScreen}
        options={{
          tabBarLabel: 'Support',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🎧</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ──────────────────────────────────────────
export function RootNavigator() {
  const { role } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {role === 'seller' ? (
          <Stack.Screen name="SellerRoot" component={SellerTabs} />
        ) : role === 'admin' ? (
          <Stack.Screen name="AdminRoot" component={AdminTabs} />
        ) : (
          <Stack.Screen name="BuyerRoot" component={BuyerTabs} />
        )}

        {/* Shared Modals & Detailed Screens */}
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
        <Stack.Screen name="NewCustomRequest" component={NewCustomRequestScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="AddProduct" component={AddProductScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="SellerKYC" component={SellerKYCScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />

        {/* Support, Legal, Deletion */}
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="SubmitComplaint" component={SubmitComplaintScreen} />
        <Stack.Screen name="MyComplaints" component={MyComplaintsScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
        <Stack.Screen name="AccountDeletion" component={AccountDeletionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
