package com.moola.app.ui.admin;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.moola.app.data.api.ApiClient;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.moola.app.data.model.AccountDeletionRequest;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.Product;
import com.moola.app.data.model.SellerProfile;
import com.moola.app.data.model.User;
import com.moola.app.data.storage.SessionManager;
import com.moola.app.databinding.ActivityAdminDashboardBinding;
import com.moola.app.ui.auth.LoginActivity;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map;

public class AdminDashboardActivity extends AppCompatActivity {

    private ActivityAdminDashboardBinding binding;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityAdminDashboardBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.btnBackAdmin.setOnClickListener(v -> finish());
        binding.btnAdminHeaderLogout.setOnClickListener(v -> confirmAndLogout());
        binding.btnAdminLogout.setOnClickListener(v -> confirmAndLogout());
        binding.btnAdminSellersKyc.setOnClickListener(v -> showKycReviewDialog());
        binding.btnAdminComplaints.setOnClickListener(v -> showAdminComplaintsDialog());
        binding.btnAdminDeletions.setOnClickListener(v -> showDeletionQueueDialog());
        binding.btnAdminProductModeration.setOnClickListener(v -> showProductModerationDialog());
        binding.btnAdminUserAccounts.setOnClickListener(v -> showUserManagementDialog());

        loadAdminAnalytics();
    }

    private void confirmAndLogout() {
        new MaterialAlertDialogBuilder(this)
                .setTitle("Sign Out of Admin Portal")
                .setMessage("Are you sure you want to end your administrative operations session? Sensitive operational credentials will be cleared.")
                .setPositiveButton("Sign Out", (dialog, which) -> {
                    SessionManager.getInstance(this).clear();
                    Toast.makeText(this, "Admin session signed out securely", Toast.LENGTH_SHORT).show();
                    Intent intent = new Intent(this, LoginActivity.class);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                    finishAffinity();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void loadAdminAnalytics() {
        binding.pbAdmin.setVisibility(View.VISIBLE);
        ApiClient.getService(this).getAdminAnalytics().enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<Map<String, Object>>> call, @NonNull Response<ApiResponse<Map<String, Object>>> response) {
                binding.pbAdmin.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    Map<String, Object> data = response.body().getData();
                    if (data != null) {
                        Object buyers = data.get("totalBuyers");
                        Object sellers = data.get("totalSellers");
                        Object products = data.get("totalProducts");
                        Object pendingKyc = data.get("pendingKyc");

                        if (buyers != null) binding.tvAdminTotalBuyers.setText(String.valueOf(buyers));
                        if (sellers != null) binding.tvAdminTotalSellers.setText(String.valueOf(sellers));
                        if (products != null) binding.tvAdminTotalProducts.setText(String.valueOf(products));
                        if (pendingKyc != null) binding.tvAdminPendingKyc.setText(String.valueOf(pendingKyc));
                    }
                } else {
                    Toast.makeText(AdminDashboardActivity.this, "Could not load admin metrics", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Map<String, Object>>> call, @NonNull Throwable t) {
                binding.pbAdmin.setVisibility(View.GONE);
                Toast.makeText(AdminDashboardActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showKycReviewDialog() {
        ApiClient.getService(this).getAdminSellers().enqueue(new Callback<ApiResponse<List<SellerProfile>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<SellerProfile>>> call, @NonNull Response<ApiResponse<List<SellerProfile>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    List<SellerProfile> sellers = response.body().getData();
                    if (sellers == null || sellers.isEmpty()) {
                        Toast.makeText(AdminDashboardActivity.this, "No maker profiles found", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    String[] items = new String[sellers.size()];
                    for (int i = 0; i < sellers.size(); i++) {
                        SellerProfile s = sellers.get(i);
                        items[i] = (s.getShopName() != null ? s.getShopName() : "Shop") + " [" + s.getKycStatus() + "]";
                    }

                    new MaterialAlertDialogBuilder(AdminDashboardActivity.this)
                            .setTitle("Maker Applications & KYC")
                            .setItems(items, (dialog, which) -> {
                                SellerProfile chosen = sellers.get(which);
                                reviewMakerKycAction(chosen);
                            })
                            .setPositiveButton("Close", null)
                            .show();
                } else {
                    String msg = "Unable to load maker profiles";
                    if (response.code() == 401 || response.code() == 403) {
                        msg = "Access denied: Admin privileges required.";
                    }
                    Toast.makeText(AdminDashboardActivity.this, msg, Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<SellerProfile>>> call, @NonNull Throwable t) {
                Toast.makeText(AdminDashboardActivity.this, "Network error: Unable to reach server.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void reviewMakerKycAction(SellerProfile seller) {
        String[] actions = {"Approve KYC (Verified Maker)", "Reject Application"};
        new MaterialAlertDialogBuilder(this)
                .setTitle("Review " + seller.getShopName())
                .setMessage("FSSAI / Reg: " + (seller.getFssaiNumber() != null ? seller.getFssaiNumber() : "None") + "\nUPI: " + (seller.getUpiId() != null ? seller.getUpiId() : "None"))
                .setItems(actions, (dialog, which) -> {
                    String status = which == 0 ? "approved" : "rejected";
                    Map<String, String> body = new HashMap<>();
                    body.put("status", status);
                    body.put("remarks", "Reviewed by Operations Administrator");

                    ApiClient.getService(this).reviewSellerKyc(seller.getId(), body).enqueue(new Callback<ApiResponse<SellerProfile>>() {
                        @Override
                        public void onResponse(@NonNull Call<ApiResponse<SellerProfile>> call, @NonNull Response<ApiResponse<SellerProfile>> response) {
                            Toast.makeText(AdminDashboardActivity.this, "KYC status updated: " + status, Toast.LENGTH_SHORT).show();
                            loadAdminAnalytics();
                        }

                        @Override
                        public void onFailure(@NonNull Call<ApiResponse<SellerProfile>> call, @NonNull Throwable t) {
                            Toast.makeText(AdminDashboardActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                    });
                })
                .show();
    }

    private void showAdminComplaintsDialog() {
        Toast.makeText(this, "Complaints SLA audit: Line 1 (+91 80886 53820), Line 2 (+91 63620 95126)", Toast.LENGTH_LONG).show();
    }

    private void showDeletionQueueDialog() {
        ApiClient.getService(this).adminListDeletionRequests().enqueue(new Callback<ApiResponse<List<AccountDeletionRequest>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<AccountDeletionRequest>>> call, @NonNull Response<ApiResponse<List<AccountDeletionRequest>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    List<AccountDeletionRequest> list = response.body().getData();
                    if (list == null || list.isEmpty()) {
                        Toast.makeText(AdminDashboardActivity.this, "No pending account deletion requests", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    String[] items = new String[list.size()];
                    for (int i = 0; i < list.size(); i++) {
                        AccountDeletionRequest r = list.get(i);
                        items[i] = "User #" + r.getUserId() + " - " + r.getStatus() + " (" + (r.getReason() != null ? r.getReason() : "") + ")";
                    }

                    new MaterialAlertDialogBuilder(AdminDashboardActivity.this)
                            .setTitle("Account Deletion Queue (" + list.size() + ")")
                            .setItems(items, (dialog, which) -> {
                                AccountDeletionRequest req = list.get(which);
                                processDeletion(req.getId());
                            })
                            .setPositiveButton("Close", null)
                            .show();
                } else {
                    Toast.makeText(AdminDashboardActivity.this, "Could not load deletion requests", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<AccountDeletionRequest>>> call, @NonNull Throwable t) {
                Toast.makeText(AdminDashboardActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void processDeletion(String reqId) {
        String[] actions = {"Approve & Anonymize User", "Reject Request"};
        new MaterialAlertDialogBuilder(this)
                .setTitle("Process Account Deletion")
                .setItems(actions, (dialog, which) -> {
                    String status = which == 0 ? "approved" : "rejected";
                    Map<String, String> body = new HashMap<>();
                    body.put("status", status);
                    body.put("adminNotes", "Processed by Operations Administrator");

                    ApiClient.getService(this).adminProcessDeletionRequest(reqId, body).enqueue(new Callback<ApiResponse<AccountDeletionRequest>>() {
                        @Override
                        public void onResponse(@NonNull Call<ApiResponse<AccountDeletionRequest>> call, @NonNull Response<ApiResponse<AccountDeletionRequest>> response) {
                            Toast.makeText(AdminDashboardActivity.this, "Account deletion " + status, Toast.LENGTH_SHORT).show();
                            loadAdminAnalytics();
                        }

                        @Override
                        public void onFailure(@NonNull Call<ApiResponse<AccountDeletionRequest>> call, @NonNull Throwable t) {
                            Toast.makeText(AdminDashboardActivity.this, "Failed to process", Toast.LENGTH_SHORT).show();
                        }
                    });
                })
                .show();
    }

    private void showProductModerationDialog() {
        ApiClient.getService(this).getProducts(null, null, null, null, null, "newest")
                .enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
                    @Override
                    public void onResponse(@NonNull Call<ApiResponse<Map<String, Object>>> call, @NonNull Response<ApiResponse<Map<String, Object>>> response) {
                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            Map<String, Object> data = response.body().getData();
                            if (data != null && (data.containsKey("data") || data.containsKey("products"))) {
                                Object listObj = data.containsKey("data") ? data.get("data") : data.get("products");
                                Gson gson = new Gson();
                                List<Product> products = gson.fromJson(gson.toJson(listObj), new TypeToken<List<Product>>() {}.getType());

                                if (products == null || products.isEmpty()) {
                                    Toast.makeText(AdminDashboardActivity.this, "No products to moderate", Toast.LENGTH_SHORT).show();
                                    return;
                                }

                                String[] items = new String[products.size()];
                                for (int i = 0; i < products.size(); i++) {
                                    Product p = products.get(i);
                                    items[i] = p.getTitle() + " (₹" + Math.round(p.getPrice()) + ") - " + (p.isApproved() ? "Approved" : "Flagged/Pending");
                                }

                                new MaterialAlertDialogBuilder(AdminDashboardActivity.this)
                                        .setTitle("Product Moderation & Safety (" + products.size() + ")")
                                        .setItems(items, (dialog, which) -> {
                                            Product selected = products.get(which);
                                            moderateProductAction(selected);
                                        })
                                        .setPositiveButton("Close", null)
                                        .show();
                            }
                        } else {
                            Toast.makeText(AdminDashboardActivity.this, "Could not load products for moderation", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<ApiResponse<Map<String, Object>>> call, @NonNull Throwable t) {
                        Toast.makeText(AdminDashboardActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void moderateProductAction(Product product) {
        String[] actions = {"Approve Product", "Flag / Suspend Listing", "Delete Prohibited Listing"};
        new MaterialAlertDialogBuilder(this)
                .setTitle("Moderate: " + product.getTitle())
                .setMessage("Maker: " + (product.getSellerShopName() != null ? product.getSellerShopName() : product.getSellerName()))
                .setItems(actions, (dialog, which) -> {
                    Map<String, Object> body = new HashMap<>();
                    if (which == 0) {
                        body.put("isApproved", true);
                        body.put("isActive", true);
                        body.put("moderationNotes", "Approved by Safety Administrator");
                    } else if (which == 1) {
                        body.put("isApproved", false);
                        body.put("isActive", false);
                        body.put("moderationNotes", "Flagged for safety review by Operations");
                    } else {
                        ApiClient.getService(this).deleteProduct(product.getId()).enqueue(new Callback<ApiResponse<Void>>() {
                            @Override
                            public void onResponse(@NonNull Call<ApiResponse<Void>> call, @NonNull Response<ApiResponse<Void>> response) {
                                Toast.makeText(AdminDashboardActivity.this, "Prohibited listing removed", Toast.LENGTH_SHORT).show();
                                loadAdminAnalytics();
                            }
                            @Override
                            public void onFailure(@NonNull Call<ApiResponse<Void>> call, @NonNull Throwable t) {
                                Toast.makeText(AdminDashboardActivity.this, "Failed to remove listing", Toast.LENGTH_SHORT).show();
                            }
                        });
                        return;
                    }

                    ApiClient.getService(this).moderateProduct(product.getId(), body).enqueue(new Callback<ApiResponse<Product>>() {
                        @Override
                        public void onResponse(@NonNull Call<ApiResponse<Product>> call, @NonNull Response<ApiResponse<Product>> response) {
                            Toast.makeText(AdminDashboardActivity.this, "Product moderation updated", Toast.LENGTH_SHORT).show();
                            loadAdminAnalytics();
                        }
                        @Override
                        public void onFailure(@NonNull Call<ApiResponse<Product>> call, @NonNull Throwable t) {
                            Toast.makeText(AdminDashboardActivity.this, "Failed: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                    });
                })
                .show();
    }

    private void showUserManagementDialog() {
        ApiClient.getService(this).getAdminBuyers().enqueue(new Callback<ApiResponse<List<User>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<User>>> call, @NonNull Response<ApiResponse<List<User>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    List<User> users = response.body().getData();
                    if (users == null || users.isEmpty()) {
                        Toast.makeText(AdminDashboardActivity.this, "No user accounts found", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    String[] items = new String[users.size()];
                    for (int i = 0; i < users.size(); i++) {
                        User u = users.get(i);
                        items[i] = u.getName() + " (" + u.getPhone() + ") [" + (u.isActive() ? "Active" : "SUSPENDED") + "]";
                    }

                    new MaterialAlertDialogBuilder(AdminDashboardActivity.this)
                            .setTitle("User Account Governance (" + users.size() + ")")
                            .setItems(items, (dialog, which) -> {
                                User chosen = users.get(which);
                                toggleUserActiveAction(chosen);
                            })
                            .setPositiveButton("Close", null)
                            .show();
                } else {
                    Toast.makeText(AdminDashboardActivity.this, "Could not load users", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<User>>> call, @NonNull Throwable t) {
                Toast.makeText(AdminDashboardActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void toggleUserActiveAction(User user) {
        boolean newState = !user.isActive();
        String action = newState ? "Activate Account" : "Suspend Account (Block Access)";
        new MaterialAlertDialogBuilder(this)
                .setTitle(user.getName())
                .setMessage("Current status: " + (user.isActive() ? "Active" : "Suspended") + "\nRole: " + user.getRole())
                .setPositiveButton(action, (dialog, which) -> {
                    Map<String, Boolean> body = new HashMap<>();
                    body.put("isActive", newState);
                    ApiClient.getService(this).updateBuyerStatus(user.getId(), body).enqueue(new Callback<ApiResponse<User>>() {
                        @Override
                        public void onResponse(@NonNull Call<ApiResponse<User>> call, @NonNull Response<ApiResponse<User>> response) {
                            Toast.makeText(AdminDashboardActivity.this, "User status updated: " + (newState ? "Active" : "Suspended"), Toast.LENGTH_SHORT).show();
                            loadAdminAnalytics();
                        }
                        @Override
                        public void onFailure(@NonNull Call<ApiResponse<User>> call, @NonNull Throwable t) {
                            Toast.makeText(AdminDashboardActivity.this, "Failed to update user", Toast.LENGTH_SHORT).show();
                        }
                    });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }
}
