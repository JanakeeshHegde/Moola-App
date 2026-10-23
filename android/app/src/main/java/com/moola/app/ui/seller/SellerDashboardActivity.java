package com.moola.app.ui.seller;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.moola.app.R;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.Order;
import com.moola.app.data.model.Product;
import com.moola.app.data.model.SellerProfile;
import com.moola.app.databinding.ActivitySellerDashboardBinding;
import com.moola.app.ui.order.OrderAdapter;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SellerDashboardActivity extends AppCompatActivity {

    private ActivitySellerDashboardBinding binding;
    private SellerProductAdapter adapter;
    private final Gson gson = new Gson();

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivitySellerDashboardBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.btnBackSeller.setOnClickListener(v -> finish());
        binding.btnAddProduct.setOnClickListener(v -> {
            Intent intent = new Intent(this, AddEditProductActivity.class);
            startActivity(intent);
        });

        binding.btnManageSellerOrders.setOnClickListener(v -> showSellerOrdersDialog());

        setupRecyclerView();
        loadDashboardData();
    }

    private void setupRecyclerView() {
        adapter = new SellerProductAdapter(product -> {
            // Edit or toggle product
            showProductOptionsDialog(product);
        });

        binding.rvSellerProducts.setLayoutManager(new LinearLayoutManager(this));
        binding.rvSellerProducts.setAdapter(adapter);
    }

    private void loadDashboardData() {
        binding.pbSeller.setVisibility(View.VISIBLE);

        // 1. Load Seller Profile
        ApiClient.getService(this).getSellerProfile().enqueue(new Callback<ApiResponse<SellerProfile>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<SellerProfile>> call, @NonNull Response<ApiResponse<SellerProfile>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    SellerProfile profile = response.body().getData();
                    if (profile != null) {
                        binding.tvSellerShopHeading.setText(profile.getShopName() != null ? profile.getShopName() : "Artisan Kitchen");
                        String kyc = profile.getKycStatus() != null ? profile.getKycStatus() : "PENDING";
                        binding.tvSellerKycBadge.setText(kyc.toUpperCase() + " MAKER");
                        if (profile.getRating() > 0) {
                            binding.tvSellerRating.setText(String.format("%.1f ★", profile.getRating()));
                        }
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<SellerProfile>> call, @NonNull Throwable t) {
                // Ignore silent failure
            }
        });

        // 2. Load Seller Analytics
        ApiClient.getService(this).getSellerAnalytics().enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<Map<String, Object>>> call, @NonNull Response<ApiResponse<Map<String, Object>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    Map<String, Object> data = response.body().getData();
                    if (data != null) {
                        Object active = data.get("totalProducts");
                        Object pending = data.get("pendingOrders");
                        if (active != null) binding.tvSellerActiveProductsCount.setText(String.valueOf(active));
                        if (pending != null) binding.tvSellerNewOrdersCount.setText(String.valueOf(pending));
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Map<String, Object>>> call, @NonNull Throwable t) {
                // Ignore silent failure
            }
        });

        // 3. Load Seller Products
        ApiClient.getService(this).getMyProducts().enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<Map<String, Object>>> call, @NonNull Response<ApiResponse<Map<String, Object>>> response) {
                binding.pbSeller.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    Map<String, Object> data = response.body().getData();
                    if (data != null && data.containsKey("products")) {
                        Type listType = new TypeToken<List<Product>>() {}.getType();
                        String json = gson.toJson(data.get("products"));
                        List<Product> products = gson.fromJson(json, listType);
                        adapter.setProducts(products);
                        if (products != null) {
                            binding.tvSellerActiveProductsCount.setText(String.valueOf(products.size()));
                        }
                    }
                } else {
                    Toast.makeText(SellerDashboardActivity.this, "Could not fetch listings", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Map<String, Object>>> call, @NonNull Throwable t) {
                binding.pbSeller.setVisibility(View.GONE);
                Toast.makeText(SellerDashboardActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showProductOptionsDialog(Product product) {
        String[] options = {product.isActive() ? "Mark Inactive (Out of Stock)" : "Mark Active (In Stock)", "Delete Listing"};
        new MaterialAlertDialogBuilder(this)
                .setTitle(product.getTitle())
                .setItems(options, (dialog, which) -> {
                    if (which == 0) {
                        toggleProductActive(product);
                    } else if (which == 1) {
                        deleteProduct(product);
                    }
                })
                .show();
    }

    private void toggleProductActive(Product product) {
        Map<String, Object> body = new HashMap<>();
        body.put("isActive", !product.isActive());
        ApiClient.getService(this).updateProduct(product.getId(), body).enqueue(new Callback<ApiResponse<Product>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<Product>> call, @NonNull Response<ApiResponse<Product>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(SellerDashboardActivity.this, "Product status updated", Toast.LENGTH_SHORT).show();
                    loadDashboardData();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Product>> call, @NonNull Throwable t) {
                Toast.makeText(SellerDashboardActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void deleteProduct(Product product) {
        new MaterialAlertDialogBuilder(this)
                .setTitle("Delete " + product.getTitle() + "?")
                .setMessage("Are you sure you want to remove this homemade listing?")
                .setPositiveButton("Delete", (dialog, which) -> {
                    ApiClient.getService(this).deleteProduct(product.getId()).enqueue(new Callback<ApiResponse<Void>>() {
                        @Override
                        public void onResponse(@NonNull Call<ApiResponse<Void>> call, @NonNull Response<ApiResponse<Void>> response) {
                            Toast.makeText(SellerDashboardActivity.this, "Product deleted", Toast.LENGTH_SHORT).show();
                            loadDashboardData();
                        }

                        @Override
                        public void onFailure(@NonNull Call<ApiResponse<Void>> call, @NonNull Throwable t) {
                            Toast.makeText(SellerDashboardActivity.this, "Failed to delete: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                    });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void showSellerOrdersDialog() {
        ApiClient.getService(this).getSellerOrders().enqueue(new Callback<ApiResponse<List<Order>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<Order>>> call, @NonNull Response<ApiResponse<List<Order>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    List<Order> orders = response.body().getData();
                    if (orders == null || orders.isEmpty()) {
                        Toast.makeText(SellerDashboardActivity.this, "No incoming orders received yet", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    // Display orders in dialog with actions
                    View dialogView = LayoutInflater.from(SellerDashboardActivity.this).inflate(R.layout.fragment_orders, null, false);
                    RecyclerView rv = dialogView.findViewById(R.id.rvOrders);
                    dialogView.findViewById(R.id.tvOrdersTitle).setVisibility(View.GONE);
                    rv.setLayoutManager(new LinearLayoutManager(SellerDashboardActivity.this));

                    OrderAdapter ordersAdapter = new OrderAdapter(order -> showManageOrderActionDialog(order));
                    ordersAdapter.setOrders(orders);
                    rv.setAdapter(ordersAdapter);

                    new MaterialAlertDialogBuilder(SellerDashboardActivity.this)
                            .setTitle("Received Orders (" + orders.size() + ")")
                            .setView(dialogView)
                            .setPositiveButton("Close", null)
                            .show();
                } else {
                    Toast.makeText(SellerDashboardActivity.this, "Could not fetch incoming orders", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<Order>>> call, @NonNull Throwable t) {
                Toast.makeText(SellerDashboardActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showManageOrderActionDialog(Order order) {
        String[] actions = {"Confirm Fresh Batch", "Record Consignment & Dispatch", "Verify UPI Payment Received"};
        new MaterialAlertDialogBuilder(this)
                .setTitle("Manage Order #" + order.getOrderNumber())
                .setItems(actions, (dialog, which) -> {
                    if (which == 0) {
                        confirmOrder(order.getId());
                    } else if (which == 1) {
                        showShipmentInputDialog(order.getId());
                    } else if (which == 2) {
                        verifyPayment(order.getId());
                    }
                })
                .show();
    }

    private void confirmOrder(String orderId) {
        ApiClient.getService(this).confirmOrder(orderId).enqueue(new Callback<ApiResponse<Order>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<Order>> call, @NonNull Response<ApiResponse<Order>> response) {
                Toast.makeText(SellerDashboardActivity.this, "Order confirmed!", Toast.LENGTH_SHORT).show();
                loadDashboardData();
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Order>> call, @NonNull Throwable t) {
                Toast.makeText(SellerDashboardActivity.this, "Failed to confirm", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showShipmentInputDialog(String orderId) {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_simple_input, null, false);
        EditText et = dialogView.findViewById(R.id.etDialogInput);
        et.setHint("Consignment / AWB Tracking # (e.g. EK982341902IN)");

        new MaterialAlertDialogBuilder(this)
                .setTitle("Record Shipment Dispatch")
                .setMessage("Enter the courier or India Post consignment tracking number:")
                .setView(dialogView)
                .setPositiveButton("Dispatch Order", (dialog, which) -> {
                    String awb = et.getText().toString().trim();
                    if (awb.isEmpty()) {
                        Toast.makeText(this, "Tracking number required", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    Map<String, Object> body = new HashMap<>();
                    body.put("carrierName", "India Post Speed Post");
                    body.put("consignmentNumber", awb);
                    body.put("consignmentUrl", "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx");

                    ApiClient.getService(this).recordShipment(orderId, body).enqueue(new Callback<ApiResponse<Order>>() {
                        @Override
                        public void onResponse(@NonNull Call<ApiResponse<Order>> call, @NonNull Response<ApiResponse<Order>> response) {
                            Toast.makeText(SellerDashboardActivity.this, "Consignment dispatched successfully!", Toast.LENGTH_SHORT).show();
                            loadDashboardData();
                        }

                        @Override
                        public void onFailure(@NonNull Call<ApiResponse<Order>> call, @NonNull Throwable t) {
                            Toast.makeText(SellerDashboardActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                    });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void verifyPayment(String orderId) {
        ApiClient.getService(this).verifyPayment(orderId).enqueue(new Callback<ApiResponse<Order>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<Order>> call, @NonNull Response<ApiResponse<Order>> response) {
                Toast.makeText(SellerDashboardActivity.this, "Payment verified & marked PAID!", Toast.LENGTH_SHORT).show();
                loadDashboardData();
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Order>> call, @NonNull Throwable t) {
                Toast.makeText(SellerDashboardActivity.this, "Failed to verify payment", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadDashboardData();
    }
}
