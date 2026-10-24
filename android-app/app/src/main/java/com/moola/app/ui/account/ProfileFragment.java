package com.moola.app.ui.account;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.moola.app.R;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.BuyerDashboardData;
import com.moola.app.data.model.Order;
import com.moola.app.data.model.PublicSellerProfile;
import com.moola.app.data.model.User;
import com.moola.app.data.storage.SessionManager;
import com.moola.app.databinding.FragmentProfileBinding;
import com.moola.app.ui.admin.AdminDashboardActivity;
import com.moola.app.ui.auth.LoginActivity;
import com.moola.app.ui.chat.ConversationsActivity;
import com.moola.app.ui.complaint.ComplaintsActivity;
import com.moola.app.ui.home.SellerCardAdapter;
import com.moola.app.ui.notification.NotificationsActivity;
import com.moola.app.ui.order.OrderDetailActivity;
import com.moola.app.ui.request.CustomRequestsActivity;
import com.moola.app.ui.search.SearchActivity;
import com.moola.app.ui.seasonal.SeasonalHubActivity;
import com.moola.app.ui.seller.SellerDashboardActivity;
import com.moola.app.ui.seller.SellerShopActivity;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.List;

public class ProfileFragment extends Fragment {

    private FragmentProfileBinding binding;
    private SessionManager sessionManager;
    private SellerCardAdapter followedMakersAdapter;
    private String latestActiveOrderId = null;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentProfileBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        sessionManager = new SessionManager(requireContext());

        setupRecyclerView();
        renderStaticUserData();
        setupActions();
        loadBuyerDashboard();
    }

    private void setupRecyclerView() {
        followedMakersAdapter = new SellerCardAdapter(this::openSellerShop);
        binding.rvFollowedMakers.setLayoutManager(new LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false));
        binding.rvFollowedMakers.setAdapter(followedMakersAdapter);
    }

    private void openSellerShop(PublicSellerProfile seller) {
        if (seller == null || seller.getSellerId() == null) return;
        Intent intent = new Intent(requireContext(), SellerShopActivity.class);
        intent.putExtra(SellerShopActivity.EXTRA_SELLER_ID, seller.getSellerId());
        intent.putExtra(SellerShopActivity.EXTRA_SELLER_NAME, seller.getShopName());
        startActivity(intent);
    }

    private void renderStaticUserData() {
        if (binding == null) return;
        String name = sessionManager.getUserName();
        String phone = sessionManager.getUserPhone();
        String role = sessionManager.getUserRole();

        if (name != null && !name.isBlank()) {
            binding.tvProfileName.setText(name);
            binding.tvProfileInitials.setText(String.valueOf(name.charAt(0)).toUpperCase());
        } else {
            binding.tvProfileName.setText("MOOLA Customer");
            binding.tvProfileInitials.setText("M");
        }

        binding.tvProfilePhone.setText(phone != null && !phone.isBlank() ? phone : "+91 Customer Workspace");
        binding.tvProfileRoleBadge.setText(role != null ? role.toUpperCase() + " WORKSPACE" : "CUSTOMER WORKSPACE");

        // Role-based portals visibility
        boolean isSeller = "seller".equalsIgnoreCase(role) || sessionManager.isAdmin();
        binding.cardSellerPortalEntry.setVisibility(isSeller ? View.VISIBLE : View.GONE);
        binding.cardAdminPortalEntry.setVisibility(sessionManager.isAdmin() ? View.VISIBLE : View.GONE);
    }

    private void setupActions() {
        binding.swipeRefreshProfile.setOnRefreshListener(this::loadBuyerDashboard);

        // Metric clicks
        binding.cardMetricOrders.setOnClickListener(v -> {
            BottomNavigationView bnv = requireActivity().findViewById(R.id.bottomNavigationView);
            if (bnv != null) {
                bnv.setSelectedItemId(R.id.nav_orders);
            }
        });

        binding.cardMetricDemands.setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), CustomRequestsActivity.class));
        });

        binding.cardMetricFollowing.setOnClickListener(v -> {
            binding.layoutFollowedHeading.getParent().requestChildFocus(binding.layoutFollowedHeading, binding.layoutFollowedHeading);
        });

        binding.cardMetricChats.setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), ConversationsActivity.class));
        });

        // Active order tracker button
        binding.btnTrackActiveOrder.setOnClickListener(v -> {
            if (latestActiveOrderId != null && !latestActiveOrderId.isBlank()) {
                Intent intent = new Intent(requireContext(), OrderDetailActivity.class);
                intent.putExtra("orderId", latestActiveOrderId);
                startActivity(intent);
            } else {
                BottomNavigationView bnv = requireActivity().findViewById(R.id.bottomNavigationView);
                if (bnv != null) {
                    bnv.setSelectedItemId(R.id.nav_orders);
                }
            }
        });

        binding.btnExploreMarketplaceEmpty.setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), SearchActivity.class));
        });

        binding.tvExploreMoreMakers.setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), SearchActivity.class));
        });

        binding.btnDiscoverMakersAction.setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), SearchActivity.class));
        });

        // Role portals
        binding.cardSellerPortalEntry.setOnClickListener(v -> {
            Intent intent = new Intent(requireContext(), SellerDashboardActivity.class);
            startActivity(intent);
        });

        binding.cardAdminPortalEntry.setOnClickListener(v -> {
            Intent intent = new Intent(requireContext(), AdminDashboardActivity.class);
            startActivity(intent);
        });

        // Services & Shortcuts
        binding.btnProfileCustomRequests.setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), CustomRequestsActivity.class));
        });

        binding.btnProfileSeasonalCampaigns.setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), SeasonalHubActivity.class));
        });

        binding.btnProfileDirectMessages.setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), ConversationsActivity.class));
        });

        binding.btnProfileNotifications.setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), NotificationsActivity.class));
        });

        binding.btnProfileServerUrl.setOnClickListener(v -> {
            showServerUrlDialog();
        });

        binding.btnHelpline1.setOnClickListener(v -> dialHelpline("+918088653820"));
        binding.btnHelpline2.setOnClickListener(v -> dialHelpline("+916362095126"));

        binding.btnComplaintsHub.setOnClickListener(v -> {
            Intent intent = new Intent(requireContext(), ComplaintsActivity.class);
            startActivity(intent);
        });

        binding.btnAccountDeletion.setOnClickListener(v -> {
            Intent intent = new Intent(requireContext(), AccountDeletionActivity.class);
            startActivity(intent);
        });

        binding.btnLogout.setOnClickListener(v -> {
            sessionManager.clear();
            Intent intent = new Intent(requireContext(), LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            requireActivity().finish();
        });
    }

    private void dialHelpline(String phone) {
        Intent intent = new Intent(Intent.ACTION_DIAL);
        intent.setData(Uri.parse("tel:" + phone));
        try {
            startActivity(intent);
        } catch (Exception e) {
            Toast.makeText(requireContext(), "Unable to open phone dialer", Toast.LENGTH_SHORT).show();
        }
    }

    private void loadBuyerDashboard() {
        if (!sessionManager.isLoggedIn()) {
            if (binding != null) binding.swipeRefreshProfile.setRefreshing(false);
            return;
        }

        if (binding != null) binding.swipeRefreshProfile.setRefreshing(true);

        ApiClient.getService(requireContext()).getBuyerDashboard().enqueue(new Callback<ApiResponse<BuyerDashboardData>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<BuyerDashboardData>> call, @NonNull Response<ApiResponse<BuyerDashboardData>> response) {
                if (!isAdded() || binding == null) return;
                binding.swipeRefreshProfile.setRefreshing(false);

                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    BuyerDashboardData data = response.body().getData();
                    if (data != null) {
                        applyDashboardData(data);
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<BuyerDashboardData>> call, @NonNull Throwable t) {
                if (!isAdded() || binding == null) return;
                binding.swipeRefreshProfile.setRefreshing(false);
                // Keep current state gracefully
            }
        });
    }

    private void applyDashboardData(BuyerDashboardData data) {
        if (binding == null) return;

        // User info sync
        User user = data.getUser();
        if (user != null) {
            sessionManager.saveUser(user.getId(), user.getPhone(), user.getName(), user.getRole());
            renderStaticUserData();
        }

        // Live metrics counters
        binding.tvMetricOrdersCount.setText(String.valueOf(data.getTotalOrdersCount()));
        binding.tvMetricDemandsCount.setText(String.valueOf(data.getTotalDemandsCount()));
        binding.tvMetricFollowingCount.setText(String.valueOf(data.getFollowedShopsCount()));
        binding.tvMetricChatsCount.setText(String.valueOf(data.getUnreadMessagesCount()));

        // Active Order Card
        List<Order> orders = data.getRecentOrders();
        Order activeOrder = null;
        if (orders != null && !orders.isEmpty()) {
            for (Order o : orders) {
                String st = o.getStatus() != null ? o.getStatus().toUpperCase() : "";
                if (!"DELIVERED".equals(st) && !"CANCELLED".equals(st)) {
                    activeOrder = o;
                    break;
                }
            }
            if (activeOrder == null) {
                activeOrder = orders.get(0);
            }
        }

        if (activeOrder != null) {
            latestActiveOrderId = activeOrder.getId();
            binding.cardActiveOrder.setVisibility(View.VISIBLE);
            binding.cardNoActiveOrders.setVisibility(View.GONE);

            String displayOrderNum = activeOrder.getOrderNumber() != null && !activeOrder.getOrderNumber().isBlank()
                    ? activeOrder.getOrderNumber()
                    : (activeOrder.getId() != null ? activeOrder.getId().substring(0, Math.min(8, activeOrder.getId().length())) : "N/A");
            binding.tvActiveOrderNumber.setText("Order #" + displayOrderNum);

            String status = activeOrder.getStatus() != null ? activeOrder.getStatus().toUpperCase() : "PLACED";
            binding.tvActiveOrderStatusBadge.setText(status);

            int itemCount = activeOrder.getItems() != null ? activeOrder.getItems().size() : 1;
            binding.tvActiveOrderItemsSummary.setText(itemCount + (itemCount == 1 ? " item" : " items") + " • Total ₹" + String.format("%.2f", activeOrder.getTotal()));

            String carrier = activeOrder.getCarrierName();
            String consignment = activeOrder.getConsignmentNumber();
            if (consignment != null && !consignment.isBlank()) {
                binding.tvActiveOrderCarrierInfo.setVisibility(View.VISIBLE);
                binding.tvActiveOrderCarrierInfo.setText((carrier != null && !carrier.isBlank() ? carrier : "Courier") + ": " + consignment);
            } else {
                binding.tvActiveOrderCarrierInfo.setVisibility(View.GONE);
            }
        } else {
            latestActiveOrderId = null;
            binding.cardActiveOrder.setVisibility(View.GONE);
            binding.cardNoActiveOrders.setVisibility(View.VISIBLE);
        }

        // Followed Artisan Kitchens
        List<PublicSellerProfile> followedShops = data.getFollowedShops();
        if (followedShops != null && !followedShops.isEmpty()) {
            binding.rvFollowedMakers.setVisibility(View.VISIBLE);
            binding.cardNoFollowedMakers.setVisibility(View.GONE);
            followedMakersAdapter.setSellers(followedShops);
        } else {
            binding.rvFollowedMakers.setVisibility(View.GONE);
            binding.cardNoFollowedMakers.setVisibility(View.VISIBLE);
            followedMakersAdapter.setSellers(null);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        renderStaticUserData();
        loadBuyerDashboard();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    private void showServerUrlDialog() {
        android.widget.EditText input = new android.widget.EditText(requireContext());
        input.setText(ApiClient.getBaseUrl(requireContext()));
        input.setSingleLine(true);
        input.setPadding(40, 30, 40, 30);

        new androidx.appcompat.app.AlertDialog.Builder(requireContext())
                .setTitle("Configure Server Endpoint")
                .setMessage("Current URL: " + ApiClient.getBaseUrl(requireContext()) + "\nEnter new IP/Port for Spring Boot backend:")
                .setView(input)
                .setPositiveButton("Save", (dialog, which) -> {
                    String newUrl = input.getText().toString().trim();
                    if (!newUrl.isEmpty()) {
                        if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
                            newUrl = "http://" + newUrl;
                        }
                        if (!newUrl.endsWith("/")) {
                            newUrl += "/";
                        }
                        ApiClient.setCustomBaseUrl(requireContext(), newUrl);
                        Toast.makeText(requireContext(), "Backend URL updated to: " + newUrl, Toast.LENGTH_LONG).show();
                        loadBuyerDashboard();
                    }
                })
                .setNegativeButton("Reset to Default", (dialog, which) -> {
                    ApiClient.setCustomBaseUrl(requireContext(), null);
                    Toast.makeText(requireContext(), "Reset to default: " + ApiClient.getBaseUrl(requireContext()), Toast.LENGTH_LONG).show();
                    loadBuyerDashboard();
                })
                .show();
    }
}
