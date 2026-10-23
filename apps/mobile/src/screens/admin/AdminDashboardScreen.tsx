import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import {
  AdminComplaintTicket,
  AdminAccountDeletionRequest,
  ComplaintStatus,
  DeletionRequestStatus,
  COMPLAINT_CATEGORY_LABELS,
} from '@moola/shared';

type AdminTab = 'analytics' | 'orders' | 'sellers' | 'buyers' | 'tickets' | 'deletion';

export const AdminDashboardScreen: React.FC<{ navigation?: any }> = ({ navigation: _navigation }) => {
  const { token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');

  // ─── Analytics State ─────────────────────────────────────────
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const res = await apiService.admin.getAnalytics(token);
      if (res.success && res.data) {
        setAnalytics(res.data);
      } else {
        setAnalyticsError('Could not load platform analytics.');
      }
    } catch (err: any) {
      setAnalyticsError(err.message || 'Failed to load analytics.');
    } finally {
      setAnalyticsLoading(false);
    }
  }, [token]);

  // ─── Sellers State ───────────────────────────────────────────
  const [sellers, setSellers] = useState<any[]>([]);
  const [sellersLoading, setSellersLoading] = useState(false);
  const [sellerKycFilter, setSellerKycFilter] = useState('ALL');
  const [sellerSearch, setSellerSearch] = useState('');

  const fetchSellers = useCallback(async () => {
    if (!token) return;
    setSellersLoading(true);
    try {
      const statusParam = sellerKycFilter !== 'ALL' ? sellerKycFilter : undefined;
      const res = await apiService.admin.listSellers(token, {
        status: statusParam,
        search: sellerSearch.trim() || undefined,
      });
      if (res.success && res.data) {
        setSellers(res.data.sellers || []);
      }
    } catch {
      // Quiet fail
    } finally {
      setSellersLoading(false);
    }
  }, [token, sellerKycFilter, sellerSearch]);

  const handleApproveSellerKyc = async (sellerId: string, shopName: string) => {
    if (!token) return;
    Alert.alert(
      'Verify Seller Profile',
      `Approve credentials for "${shopName}"? This grants verified seller status on MOOLA.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Verify',
          onPress: async () => {
            try {
              await apiService.admin.reviewSellerKyc(token, sellerId, 'verified');
              Alert.alert('Approved', `${shopName} is now a Verified Seller on MOOLA.`);
              fetchSellers();
              fetchAnalytics();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to verify seller');
            }
          },
        },
      ],
    );
  };

  const handleRejectSellerKyc = (sellerId: string, shopName: string) => {
    if (!token) return;
    Alert.prompt
      ? Alert.prompt(
          'Reject Verification',
          `Provide rejection reason for "${shopName}":`,
          async (reason) => {
            try {
              await apiService.admin.reviewSellerKyc(token, sellerId, 'rejected', reason);
              Alert.alert('Notice Sent', 'Seller KYC rejected with feedback.');
              fetchSellers();
              fetchAnalytics();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to reject KYC');
            }
          },
        )
      : Alert.alert('Reject Verification', `Reject verification for "${shopName}"?`, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reject',
            style: 'destructive',
            onPress: async () => {
              try {
                await apiService.admin.reviewSellerKyc(token, sellerId, 'rejected', 'Documents incomplete');
                fetchSellers();
                fetchAnalytics();
              } catch (err: any) {
                Alert.alert('Error', err.message || 'Failed to reject KYC');
              }
            },
          },
        ]);
  };

  const handleToggleSellerStatus = async (sellerId: string, currentActive: boolean, shopName: string) => {
    if (!token) return;
    const target = !currentActive;
    Alert.alert(
      target ? 'Reactivate Seller' : 'Suspend Seller',
      `Are you sure you want to ${target ? 'reactivate' : 'suspend'} "${shopName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: target ? 'Reactivate' : 'Suspend Account',
          style: target ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await apiService.admin.updateSellerStatus(token, sellerId, target);
              fetchSellers();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to update seller status');
            }
          },
        },
      ],
    );
  };

  // ─── Buyers State ────────────────────────────────────────────
  const [buyers, setBuyers] = useState<any[]>([]);
  const [buyersLoading, setBuyersLoading] = useState(false);
  const [buyerSearch, setBuyerSearch] = useState('');
  const [selectedBuyerDetails, setSelectedBuyerDetails] = useState<any>(null);

  const fetchBuyers = useCallback(async () => {
    if (!token) return;
    setBuyersLoading(true);
    try {
      const res = await apiService.admin.listBuyers(token, {
        search: buyerSearch.trim() || undefined,
      });
      if (res.success && res.data) {
        setBuyers(res.data.buyers || []);
      }
    } catch {
      // Quiet fail
    } finally {
      setBuyersLoading(false);
    }
  }, [token, buyerSearch]);

  const handleToggleBuyerStatus = async (buyerId: string, currentActive: boolean, buyerName: string) => {
    if (!token) return;
    const target = !currentActive;
    Alert.alert(
      target ? 'Reactivate Buyer' : 'Suspend Buyer',
      `Are you sure you want to ${target ? 'reactivate' : 'suspend'} buyer "${buyerName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: target ? 'Reactivate' : 'Suspend',
          style: target ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await apiService.admin.updateBuyerStatus(token, buyerId, target);
              fetchBuyers();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to update buyer status');
            }
          },
        },
      ],
    );
  };

  const handleInspectBuyer = async (buyerId: string) => {
    if (!token) return;
    try {
      const res = await apiService.admin.getBuyerDetails(token, buyerId);
      if (res.success && res.data) {
        setSelectedBuyerDetails(res.data);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch buyer details');
    }
  };

  // ─── Orders State ────────────────────────────────────────────
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any>(null);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setOrdersLoading(true);
    try {
      const res = await apiService.admin.listOrders(token, {
        status: orderStatusFilter !== 'ALL' ? orderStatusFilter : undefined,
        search: orderSearch.trim() || undefined,
      });
      if (res.success && res.data) {
        setOrders(res.data.orders || []);
      }
    } catch {
      // Quiet fail
    } finally {
      setOrdersLoading(false);
    }
  }, [token, orderStatusFilter, orderSearch]);

  const handleInspectOrder = async (orderId: string) => {
    if (!token) return;
    try {
      const res = await apiService.admin.getOrderDetails(token, orderId);
      if (res.success && res.data) {
        setSelectedOrderDetail(res.data);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch order details');
    }
  };

  // ─── Support Tickets State ─────────────────────────────────
  const [tickets, setTickets] = useState<AdminComplaintTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<AdminComplaintTicket | null>(null);

  // Ticket editing state
  const [editingStatus, setEditingStatus] = useState<ComplaintStatus>('SUBMITTED');
  const [publicReplyText, setPublicReplyText] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [savingTicket, setSavingTicket] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!token) return;
    setTicketsLoading(true);
    try {
      const isOverdue = ticketStatusFilter === 'OVERDUE';
      const statusParam =
        ticketStatusFilter !== 'ALL' && ticketStatusFilter !== 'OVERDUE'
          ? ticketStatusFilter
          : undefined;

      const res = await apiService.adminSupport.listComplaints(token, {
        status: statusParam,
        search: ticketSearch.trim() || undefined,
        overdue: isOverdue,
      });

      if (res.success && res.data) {
        setTickets(res.data.complaints);
      }
    } catch {
      // Quiet fail
    } finally {
      setTicketsLoading(false);
    }
  }, [token, ticketStatusFilter, ticketSearch]);

  // ─── Deletion Requests State ───────────────────────────────
  const [deletionRequests, setDeletionRequests] = useState<AdminAccountDeletionRequest[]>([]);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [selectedDeletion, setSelectedDeletion] = useState<AdminAccountDeletionRequest | null>(null);
  const [deletionNote, setDeletionNote] = useState('');
  const [processingDeletion, setProcessingDeletion] = useState(false);

  const fetchDeletionRequests = useCallback(async () => {
    if (!token) return;
    setDeletionLoading(true);
    try {
      const res = await apiService.adminSupport.listDeletionRequests(token);
      if (res.success && res.data) {
        setDeletionRequests(res.data.requests);
      }
    } catch {
      // Quiet fail
    } finally {
      setDeletionLoading(false);
    }
  }, [token]);

  // ─── Tab-based fetching ──────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'analytics') fetchAnalytics();
    else if (activeTab === 'sellers') fetchSellers();
    else if (activeTab === 'buyers') fetchBuyers();
    else if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'tickets') fetchTickets();
    else if (activeTab === 'deletion') fetchDeletionRequests();
  }, [activeTab, fetchAnalytics, fetchSellers, fetchBuyers, fetchOrders, fetchTickets, fetchDeletionRequests]);

  const handleSaveTicket = async () => {
    if (!selectedTicket || !token) return;
    setSavingTicket(true);
    try {
      const res = await apiService.adminSupport.updateComplaint(
        selectedTicket.ticketId,
        {
          status: editingStatus,
          publicResponse: publicReplyText.trim() || undefined,
          internalNote: internalNoteText.trim() || undefined,
        },
        token,
      );

      if (res.success && res.data?.ticket) {
        Alert.alert('Updated', `Ticket ${selectedTicket.ticketId} updated successfully.`);
        setSelectedTicket(null);
        fetchTickets();
      } else {
        Alert.alert('Error', res.message || 'Failed to update ticket');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save ticket updates');
    } finally {
      setSavingTicket(false);
    }
  };

  const handleProcessDeletion = async (status: DeletionRequestStatus) => {
    if (!selectedDeletion || !token) return;
    setProcessingDeletion(true);
    try {
      const res = await apiService.adminSupport.processDeletionRequest(
        selectedDeletion.requestId,
        {
          status,
          internalNote: deletionNote.trim() || undefined,
          rejectionReason: status === 'REJECTED' ? deletionNote || 'Unable to verify request' : undefined,
          completionReason: status === 'COMPLETED' ? 'User profile permanently anonymized by admin' : undefined,
        },
        token,
      );

      if (res.success && res.data?.request) {
        Alert.alert('Status Updated', `Deletion request marked as ${status}.`);
        setSelectedDeletion(null);
        setDeletionNote('');
        fetchDeletionRequests();
      } else {
        Alert.alert('Error', res.message || 'Could not process deletion request');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update deletion status');
    } finally {
      setProcessingDeletion(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Sleek Dedicated Admin Portal Top Bar */}
      <View style={styles.adminHeader}>
        <View style={styles.adminHeaderLeft}>
          <Text style={styles.adminHeaderBadge}>🛡️ PRIVATE ADMIN</Text>
          <Text style={styles.adminHeaderTitle}>MOOLA Management Portal</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Top Navigation Tabs */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'analytics' && styles.tabBtnActive]}
            onPress={() => setActiveTab('analytics')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabBtnText, activeTab === 'analytics' && styles.tabBtnTextActive]}>
              📊 Analytics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'orders' && styles.tabBtnActive]}
            onPress={() => setActiveTab('orders')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabBtnText, activeTab === 'orders' && styles.tabBtnTextActive]}>
              📦 Orders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'sellers' && styles.tabBtnActive]}
            onPress={() => setActiveTab('sellers')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabBtnText, activeTab === 'sellers' && styles.tabBtnTextActive]}>
              🧑‍🌾 Sellers & KYC
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'buyers' && styles.tabBtnActive]}
            onPress={() => setActiveTab('buyers')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabBtnText, activeTab === 'buyers' && styles.tabBtnTextActive]}>
              🛒 Buyers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'tickets' && styles.tabBtnActive]}
            onPress={() => setActiveTab('tickets')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabBtnText, activeTab === 'tickets' && styles.tabBtnTextActive]}>
              🎫 Support
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'deletion' && styles.tabBtnActive]}
            onPress={() => setActiveTab('deletion')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabBtnText, activeTab === 'deletion' && styles.tabBtnTextActive]}>
              ⚠️ Deletions
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ─── TAB 1: Real Platform Analytics ───────────────────── */}
        {activeTab === 'analytics' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>📈 Real-Time Platform Analytics</Text>
              <TouchableOpacity onPress={fetchAnalytics} activeOpacity={0.7}>
                <Text style={styles.refreshLink}>🔄 Refresh</Text>
              </TouchableOpacity>
            </View>

            {analyticsLoading ? (
              <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 30 }} />
            ) : analyticsError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{analyticsError}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={fetchAnalytics}>
                  <Text style={styles.retryBtnText}>Retry Connection</Text>
                </TouchableOpacity>
              </View>
            ) : analytics ? (
              <View>
                <View style={styles.metricsGrid}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricVal}>₹{(analytics.totalRevenue || 0).toLocaleString('en-IN')}</Text>
                    <Text style={styles.metricLabel}>Total Revenue</Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricVal}>{analytics.totalBuyers || 0}</Text>
                    <Text style={styles.metricLabel}>Registered Buyers ({analytics.activeBuyers || 0} active)</Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricVal}>{analytics.totalSellers || 0}</Text>
                    <Text style={styles.metricLabel}>Sellers ({analytics.verifiedSellers || 0} verified)</Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={[styles.metricVal, { color: colors.accentDark }]}>
                      {analytics.pendingKycCount || 0}
                    </Text>
                    <Text style={styles.metricLabel}>Pending KYC</Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricVal}>{analytics.totalProducts || 0}</Text>
                    <Text style={styles.metricLabel}>Products ({analytics.activeProducts || 0} active)</Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricVal}>{analytics.totalOrders || 0}</Text>
                    <Text style={styles.metricLabel}>Total Platform Orders</Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricVal}>{analytics.totalEnquiries || 0}</Text>
                    <Text style={styles.metricLabel}>WhatsApp Enquiries</Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={[styles.metricVal, { color: '#DC2626' }]}>
                      {analytics.openComplaints || 0}
                    </Text>
                    <Text style={styles.metricLabel}>Open Support Tickets</Text>
                  </View>
                </View>

                {/* Recent Registrations */}
                <View style={styles.cardSection}>
                  <Text style={styles.cardSectionTitle}>Recent Registrations</Text>
                  {analytics.recentRegistrations && analytics.recentRegistrations.length > 0 ? (
                    analytics.recentRegistrations.map((u: any) => (
                      <View key={u._id} style={styles.recentItemRow}>
                        <View>
                          <Text style={styles.recentItemName}>{u.name}</Text>
                          <Text style={styles.recentItemMeta}>{u.phone} • Role: {u.role?.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.recentItemDate}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyNotice}>No user registrations found.</Text>
                  )}
                </View>

                {/* Recent Orders */}
                <View style={styles.cardSection}>
                  <Text style={styles.cardSectionTitle}>Recent Orders</Text>
                  {analytics.recentOrders && analytics.recentOrders.length > 0 ? (
                    analytics.recentOrders.map((o: any) => (
                      <View key={o._id} style={styles.recentItemRow}>
                        <View>
                          <Text style={styles.recentItemName}>Order #{o.orderNumber || o._id.slice(-6)}</Text>
                          <Text style={styles.recentItemMeta}>
                            Buyer: {o.buyerId?.name || 'Customer'} • ₹{o.total}
                          </Text>
                        </View>
                        <View style={styles.badgeSmall}>
                          <Text style={styles.badgeSmallText}>{o.status}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyNotice}>No orders recorded yet.</Text>
                  )}
                </View>
              </View>
            ) : null}
          </View>
        )}

        {/* ─── TAB 2: Cross-Seller Orders ───────────────────────── */}
        {activeTab === 'orders' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>📦 Cross-Seller Order Management</Text>
              <TouchableOpacity onPress={fetchOrders}>
                <Text style={styles.refreshLink}>🔄</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchBar}
              placeholder="Search by order number or customer phone..."
              value={orderSearch}
              onChangeText={setOrderSearch}
              onSubmitEditing={fetchOrders}
            />

            <View style={styles.filterRow}>
              {['ALL', 'ORDER_REQUESTED', 'ORDER_CONFIRMED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterPill, orderStatusFilter === f && styles.filterPillActive]}
                  onPress={() => setOrderStatusFilter(f)}
                >
                  <Text style={[styles.filterPillText, orderStatusFilter === f && styles.filterPillTextActive]}>
                    {f.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {ordersLoading ? (
              <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 20 }} />
            ) : orders.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyText}>No matching orders found.</Text>
              </View>
            ) : (
              orders.map((o) => (
                <View key={o._id} style={styles.dataCard}>
                  <View style={styles.dataCardHeader}>
                    <View>
                      <Text style={styles.dataCardTitle}>Order #{o.orderNumber || o._id.slice(-6)}</Text>
                      <Text style={styles.dataCardSubtitle}>
                        Buyer: {o.buyerId?.name || 'Customer'} ({o.buyerId?.phone || 'No phone'})
                      </Text>
                      <Text style={styles.dataCardSubtitle}>
                        Seller: {o.sellerId?.name || 'Farmer'} • Amount: ₹{o.total}
                      </Text>
                    </View>
                    <View style={styles.badgePending}>
                      <Text style={styles.badgePendingText}>{o.status}</Text>
                    </View>
                  </View>

                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.actionBtnOutline}
                      onPress={() => handleInspectOrder(o._id)}
                    >
                      <Text style={styles.actionBtnOutlineText}>Inspect Order Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ─── TAB 3: Sellers & KYC ─────────────────────────────── */}
        {activeTab === 'sellers' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>🧑‍🍳 Registered Sellers & Artisans</Text>
              <TouchableOpacity onPress={fetchSellers}>
                <Text style={styles.refreshLink}>🔄</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchBar}
              placeholder="Search by shop name or seller phone..."
              value={sellerSearch}
              onChangeText={setSellerSearch}
              onSubmitEditing={fetchSellers}
            />

            {/* Filter pills */}
            <View style={styles.filterRow}>
              {['ALL', 'pending', 'verified', 'rejected'].map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterPill, sellerKycFilter === f && styles.filterPillActive]}
                  onPress={() => setSellerKycFilter(f)}
                >
                  <Text style={[styles.filterPillText, sellerKycFilter === f && styles.filterPillTextActive]}>
                    {f.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {sellersLoading ? (
              <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 20 }} />
            ) : sellers.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🧑‍🍳</Text>
                <Text style={styles.emptyText}>No sellers found in this category.</Text>
              </View>
            ) : (
              sellers.map((s) => {
                const u = s.userId || {};
                return (
                  <View key={s._id} style={styles.dataCard}>
                    <View style={styles.dataCardHeader}>
                      <View>
                        <Text style={styles.dataCardTitle}>{s.shopName}</Text>
                        <Text style={styles.dataCardSubtitle}>
                          Seller: {u.name || 'Anonymous'} • Phone: {u.phone || 'N/A'}
                        </Text>
                        <Text style={styles.dataCardSubtitle}>
                          Active Products: {s.activeProducts || 0} • Status: {u.isActive !== false ? 'Active' : 'Suspended'}
                        </Text>
                      </View>
                      <View style={[styles.badgeSmall, s.kycStatus === 'verified' && { backgroundColor: '#DCFCE7' }]}>
                        <Text style={[styles.badgeSmallText, s.kycStatus === 'verified' && { color: '#166534' }]}>
                          {s.kycStatus?.toUpperCase() || 'PENDING'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardActionsRow}>
                      {s.kycStatus !== 'verified' && (
                        <TouchableOpacity
                          style={styles.approveBtn}
                          onPress={() => handleApproveSellerKyc(s._id, s.shopName)}
                        >
                          <Text style={styles.approveBtnText}>Approve KYC</Text>
                        </TouchableOpacity>
                      )}

                      {s.kycStatus === 'pending' && (
                        <TouchableOpacity
                          style={styles.rejectBtn}
                          onPress={() => handleRejectSellerKyc(s._id, s.shopName)}
                        >
                          <Text style={styles.rejectBtnText}>Reject</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.actionBtnOutline}
                        onPress={() => handleToggleSellerStatus(s._id, u.isActive !== false, s.shopName)}
                      >
                        <Text style={styles.actionBtnOutlineText}>
                          {u.isActive !== false ? 'Suspend Account' : 'Reactivate Account'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ─── TAB 4: Buyers ───────────────────────────────────── */}
        {activeTab === 'buyers' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>🛒 Registered Consumers</Text>
              <TouchableOpacity onPress={fetchBuyers}>
                <Text style={styles.refreshLink}>🔄</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchBar}
              placeholder="Search by buyer name, phone, or email..."
              value={buyerSearch}
              onChangeText={setBuyerSearch}
              onSubmitEditing={fetchBuyers}
            />

            {buyersLoading ? (
              <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 20 }} />
            ) : buyers.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🛒</Text>
                <Text style={styles.emptyText}>No registered buyers found.</Text>
              </View>
            ) : (
              buyers.map((b) => (
                <View key={b._id} style={styles.dataCard}>
                  <View style={styles.dataCardHeader}>
                    <View>
                      <Text style={styles.dataCardTitle}>{b.name}</Text>
                      <Text style={styles.dataCardSubtitle}>
                        Phone: {b.phone} • Email: {b.email || 'None'}
                      </Text>
                      <Text style={styles.dataCardSubtitle}>
                        Registered: {new Date(b.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={[styles.badgeSmall, b.isActive === false && { backgroundColor: '#FEE2E2' }]}>
                      <Text style={[styles.badgeSmallText, b.isActive === false && { color: '#991B1B' }]}>
                        {b.isActive !== false ? 'ACTIVE' : 'SUSPENDED'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.actionBtnOutline}
                      onPress={() => handleInspectBuyer(b._id)}
                    >
                      <Text style={styles.actionBtnOutlineText}>View History</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={b.isActive !== false ? styles.rejectBtn : styles.approveBtn}
                      onPress={() => handleToggleBuyerStatus(b._id, b.isActive !== false, b.name)}
                    >
                      <Text style={b.isActive !== false ? styles.rejectBtnText : styles.approveBtnText}>
                        {b.isActive !== false ? 'Suspend' : 'Reactivate'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ─── TAB 5: Support Tickets ─────────────────────────── */}
        {activeTab === 'tickets' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>🎫 Customer Support & Complaints</Text>
              <TouchableOpacity onPress={fetchTickets}>
                <Text style={styles.refreshLink}>🔄</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchBar}
              placeholder="Search complaints by subject or ticket ID..."
              value={ticketSearch}
              onChangeText={setTicketSearch}
              onSubmitEditing={fetchTickets}
            />

            <View style={styles.filterRow}>
              {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'].map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterPill, ticketStatusFilter === f && styles.filterPillActive]}
                  onPress={() => setTicketStatusFilter(f)}
                >
                  <Text style={[styles.filterPillText, ticketStatusFilter === f && styles.filterPillTextActive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {ticketsLoading ? (
              <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 20 }} />
            ) : tickets.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>✅</Text>
                <Text style={styles.emptyText}>No support tickets requiring review.</Text>
              </View>
            ) : (
              tickets.map((t) => (
                <TouchableOpacity
                  key={t.ticketId}
                  style={styles.dataCard}
                  onPress={() => {
                    setSelectedTicket(t);
                    setEditingStatus(t.status);
                    setPublicReplyText(t.publicResponse || '');
                    setInternalNoteText('');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.dataCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dataCardTitle}>{t.ticketId}: {t.subject}</Text>
                      <Text style={styles.dataCardSubtitle}>
                        Category: {COMPLAINT_CATEGORY_LABELS[t.category] || t.category}
                      </Text>
                    </View>
                    <View style={styles.badgePending}>
                      <Text style={styles.badgePendingText}>{t.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.ticketDescSnippet} numberOfLines={2}>
                    {t.description}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* ─── TAB 6: Account Deletions ───────────────────────── */}
        {activeTab === 'deletion' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>⚠️ Account Deletion Requests</Text>
              <TouchableOpacity onPress={fetchDeletionRequests}>
                <Text style={styles.refreshLink}>🔄</Text>
              </TouchableOpacity>
            </View>

            {deletionLoading ? (
              <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 20 }} />
            ) : deletionRequests.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🛡️</Text>
                <Text style={styles.emptyText}>No active account deletion requests.</Text>
              </View>
            ) : (
              deletionRequests.map((d) => (
                <View key={d.requestId} style={styles.dataCard}>
                  <View style={styles.dataCardHeader}>
                    <View>
                      <Text style={styles.dataCardTitle}>Req #{d.requestId}</Text>
                      <Text style={styles.dataCardSubtitle}>
                        User: {d.userName || d.userPhone || 'User'} ({d.userPhone || 'No phone'})
                      </Text>
                      <Text style={styles.dataCardSubtitle}>Reason: {d.reason || 'None provided'}</Text>
                    </View>
                    <View style={styles.badgePending}>
                      <Text style={styles.badgePendingText}>{d.status}</Text>
                    </View>
                  </View>

                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => {
                        setSelectedDeletion(d);
                      }}
                    >
                      <Text style={styles.approveBtnText}>Process Request</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* ─── Ticket Details Modal ─────────────────────────────── */}
      <Modal visible={!!selectedTicket} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ticket: {selectedTicket?.ticketId}</Text>
              <TouchableOpacity onPress={() => setSelectedTicket(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.inputLabel}>Subject: {selectedTicket?.subject}</Text>
              <Text style={styles.ticketDescBox}>{selectedTicket?.description}</Text>

              <Text style={styles.inputLabel}>Update Public Response</Text>
              <TextInput
                style={[styles.textInput, { height: 70 }]}
                multiline
                placeholder="Message visible to consumer..."
                value={publicReplyText}
                onChangeText={setPublicReplyText}
              />

              <Text style={styles.inputLabel}>Internal Team Note</Text>
              <TextInput
                style={[styles.textInput, { height: 50 }]}
                multiline
                placeholder="Private note for administrators..."
                value={internalNoteText}
                onChangeText={setInternalNoteText}
              />
            </ScrollView>

            <TouchableOpacity
              style={[styles.adminSubmitButton, savingTicket && styles.buttonDisabled]}
              onPress={handleSaveTicket}
              disabled={savingTicket}
            >
              {savingTicket ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.adminSubmitButtonText}>Save Ticket Updates</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Order Details Modal ──────────────────────────────── */}
      <Modal visible={!!selectedOrderDetail} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Order #{selectedOrderDetail?.order?.orderNumber || selectedOrderDetail?.order?._id?.slice(-6)}
              </Text>
              <TouchableOpacity onPress={() => setSelectedOrderDetail(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.inputLabel}>Buyer Information</Text>
              <Text style={styles.modalDetailText}>
                Name: {selectedOrderDetail?.order?.buyerId?.name || selectedOrderDetail?.order?.shippingAddress?.name}
              </Text>
              <Text style={styles.modalDetailText}>
                Phone: {selectedOrderDetail?.order?.buyerId?.phone || selectedOrderDetail?.order?.shippingAddress?.phone}
              </Text>

              <Text style={styles.inputLabel}>Shipping Address</Text>
              <Text style={styles.modalDetailText}>
                {selectedOrderDetail?.order?.shippingAddress?.line1}, {selectedOrderDetail?.order?.shippingAddress?.city},{' '}
                {selectedOrderDetail?.order?.shippingAddress?.state} - {selectedOrderDetail?.order?.shippingAddress?.pincode}
              </Text>

              <Text style={styles.inputLabel}>Items Purchased</Text>
              {selectedOrderDetail?.order?.items?.map((item: any, idx: number) => (
                <Text key={idx} style={styles.modalDetailText}>
                  • {item.qty}x {item.name} (₹{item.price}/{item.unit})
                </Text>
              ))}

              <Text style={styles.inputLabel}>Order Total: ₹{selectedOrderDetail?.order?.total}</Text>
              <Text style={styles.modalDetailText}>Current Status: {selectedOrderDetail?.order?.status}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── Buyer Details Modal ──────────────────────────────── */}
      <Modal visible={!!selectedBuyerDetails} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedBuyerDetails?.buyer?.name}</Text>
              <TouchableOpacity onPress={() => setSelectedBuyerDetails(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.inputLabel}>Account Info</Text>
              <Text style={styles.modalDetailText}>Phone: {selectedBuyerDetails?.buyer?.phone}</Text>
              <Text style={styles.modalDetailText}>Email: {selectedBuyerDetails?.buyer?.email || 'None'}</Text>
              <Text style={styles.modalDetailText}>
                Language: {selectedBuyerDetails?.buyer?.preferredLanguage?.toUpperCase() || 'EN'}
              </Text>

              <Text style={styles.inputLabel}>
                Recent Orders ({selectedBuyerDetails?.recentOrders?.length || 0})
              </Text>
              {selectedBuyerDetails?.recentOrders?.map((ord: any) => (
                <Text key={ord._id} style={styles.modalDetailText}>
                  • Order #{ord.orderNumber || ord._id.slice(-6)} — ₹{ord.total} ({ord.status})
                </Text>
              ))}

              <Text style={styles.inputLabel}>
                Support Complaints ({selectedBuyerDetails?.complaints?.length || 0})
              </Text>
              {selectedBuyerDetails?.complaints?.map((c: any) => (
                <Text key={c._id} style={styles.modalDetailText}>
                  • Ticket #{c.ticketId}: {c.subject} ({c.status})
                </Text>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── Deletion Request Modal ───────────────────────────── */}
      <Modal visible={!!selectedDeletion} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Process Deletion #{selectedDeletion?.requestId}</Text>
              <TouchableOpacity onPress={() => setSelectedDeletion(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Target User: {selectedDeletion?.userName || selectedDeletion?.userPhone} ({selectedDeletion?.userPhone})
            </Text>

            <Text style={styles.inputLabel}>Internal Audit Note</Text>
            <TextInput
              style={[styles.textInput, { height: 60 }]}
              multiline
              placeholder="Audit log reason..."
              value={deletionNote}
              onChangeText={setDeletionNote}
            />

            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                style={[styles.approveBtn, processingDeletion && styles.buttonDisabled]}
                onPress={() => handleProcessDeletion('COMPLETED')}
                disabled={processingDeletion}
              >
                <Text style={styles.approveBtnText}>Complete & Anonymize</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.rejectBtn, processingDeletion && styles.buttonDisabled]}
                onPress={() => handleProcessDeletion('REJECTED')}
                disabled={processingDeletion}
              >
                <Text style={styles.rejectBtnText}>Reject Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    paddingTop: 45,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  adminHeaderLeft: {
    flex: 1,
  },
  adminHeaderBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FCD34D',
    letterSpacing: 1,
  },
  adminHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  refreshLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  recentItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  recentItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recentItemMeta: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recentItemDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyNotice: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: colors.primary,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  dataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dataCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  dataCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  dataCardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgePendingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  badgeSmall: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeSmallText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  approveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  rejectBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnOutline: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionBtnOutlineText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  ticketDescSnippet: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorBoxText: {
    fontSize: 13,
    color: '#991B1B',
    marginBottom: 10,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
    maxWidth: 450,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  modalClose: {
    fontSize: 18,
    color: colors.textSecondary,
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  modalDetailText: {
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
  },
  ticketDescBox: {
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 8,
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  adminSubmitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  adminSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
