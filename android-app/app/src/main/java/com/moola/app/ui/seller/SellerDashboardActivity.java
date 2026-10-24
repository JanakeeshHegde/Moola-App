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
import com.moola.app.ui.chat.ConversationsActivity;
import com.moola.app.ui.order.OrderAdapter;
import com.moola.app.ui.request.SellerRequestsBoardActivity;
import com.moola.app.ui.seasonal.SeasonalHubActivity;
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
        binding.btnSellerRequestsBoard.setOnClickListener(v -> startActivity(new Intent(this, SellerRequestsBoardActivity.class)));
        binding.btnSellerDirectChats.setOnClickListener(v -> startActivity(new Intent(this, ConversationsActivity.class)));
        binding.btnSellerFestivalCampaigns.setOnClickListener(v -> startActivity(new Intent(this, SeasonalHubActivity.class)));

        binding.btnPreviewPublicShop.setOnClickListener(v -> {
            if (currentProfile != null && currentProfile.getUserId() != null) {
                Intent intent = new Intent(this, SellerShopActivity.class);
                intent.putExtra(SellerShopActivity.EXTRA_SELLER_ID, currentProfile.getUserId());
                intent.putExtra(SellerShopActivity.EXTRA_SELLER_NAME, currentProfile.getShopName());
                startActivity(intent);
            } else {
                Toast.makeText(this, "Loading maker profile...", Toast.LENGTH_SHORT).show();
            }
        });

        binding.btnEditShopProfile.setOnClickListener(v -> showEditShopProfileDialog());

        setupRecyclerView();
        loadDashboardData();
    }

    private SellerProfile currentProfile;

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
                    currentProfile = profile;
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
                    if (data != null && (data.containsKey("products") || data.containsKey("data"))) {
                        Object listObj = data.containsKey("products") ? data.get("products") : data.get("data");
                        Type listType = new TypeToken<List<Product>>() {}.getType();
                        String json = gson.toJson(listObj);
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
        String[] actions = {
                "1. Confirm Fresh Batch",
                "2. Mark Order as Packed",
                "3. Handover to Courier (Enter Consignment & Carrier)",
                "4. Update Status: In Transit",
                "5. Update Status: Delivered",
                "6. Verify UPI Payment Received"
        };
        new MaterialAlertDialogBuilder(this)
                .setTitle("Manage Order #" + order.getOrderNumber())
                .setItems(actions, (dialog, which) -> {
                    if (which == 0) {
                        confirmOrder(order.getId());
                    } else if (which == 1) {
                        markPacked(order.getId());
                    } else if (which == 2) {
                        showShipmentInputDialog(order.getId());
                    } else if (which == 3) {
                        updateFulfillmentStep(order.getId(), "IN_TRANSIT");
                    } else if (which == 4) {
                        updateFulfillmentStep(order.getId(), "DELIVERED");
                    } else if (which == 5) {
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

    private void markPacked(String orderId) {
        ApiClient.getService(this).markOrderPacked(orderId).enqueue(new Callback<ApiResponse<Order>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<Order>> call, @NonNull Response<ApiResponse<Order>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(SellerDashboardActivity.this, "Order marked as PACKED!", Toast.LENGTH_SHORT).show();
                    loadDashboardData();
                } else {
                    Toast.makeText(SellerDashboardActivity.this, "Failed to mark packed", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Order>> call, @NonNull Throwable t) {
                Toast.makeText(SellerDashboardActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showShipmentInputDialog(String orderId) {
        final String[] carriers = {
                "India Post Speed Post",
                "Shiprocket",
                "Delhivery",
                "DTDC Courier",
                "Blue Dart",
                "Professional Couriers",
                "Local Transport / Maker Counter Dispatch"
        };
        final String[] defaultUrls = {
                "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx",
                "https://www.shiprocket.in/shipment-tracking/",
                "https://www.delhivery.com/track/package/",
                "https://www.dtdc.in/tracking.asp",
                "https://www.bluedart.com/tracking",
                "https://www.tpcindia.com/",
                ""
        };

        android.widget.LinearLayout layout = new android.widget.LinearLayout(this);
        layout.setOrientation(android.widget.LinearLayout.VERTICAL);
        layout.setPadding(48, 20, 48, 20);

        android.widget.TextView tvCarrierPrompt = new android.widget.TextView(this);
        tvCarrierPrompt.setText("Select Courier / Service:");
        tvCarrierPrompt.setTextColor(getResources().getColor(R.color.moola_charcoal));
        tvCarrierPrompt.setTypeface(null, android.graphics.Typeface.BOLD);
        layout.addView(tvCarrierPrompt);

        final android.widget.Spinner spCarrier = new android.widget.Spinner(this);
        android.widget.ArrayAdapter<String> spinnerAdapter = new android.widget.ArrayAdapter<>(
                this, android.R.layout.simple_spinner_dropdown_item, carriers);
        spCarrier.setAdapter(spinnerAdapter);
        layout.addView(spCarrier);

        final EditText etAwb = new EditText(this);
        etAwb.setHint("Consignment / AWB Tracking # (e.g. EK982341902IN)");
        layout.addView(etAwb);

        final EditText etUrl = new EditText(this);
        etUrl.setHint("Tracking URL (optional)");
        etUrl.setText(defaultUrls[0]);
        layout.addView(etUrl);

        spCarrier.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(android.widget.AdapterView<?> parent, View view, int position, long id) {
                etUrl.setText(defaultUrls[position]);
            }
            @Override
            public void onNothingSelected(android.widget.AdapterView<?> parent) {}
        });

        new MaterialAlertDialogBuilder(this)
                .setTitle("Courier Dispatch & Handover")
                .setMessage("Enter the real carrier consignment number once the parcel is handed over:")
                .setView(layout)
                .setPositiveButton("Confirm Handover to Courier", (dialog, which) -> {
                    String awb = etAwb.getText().toString().trim();
                    if (awb.isEmpty()) {
                        Toast.makeText(this, "Consignment tracking number is required", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    String selectedCarrier = carriers[spCarrier.getSelectedItemPosition()];
                    String trackingUrl = etUrl.getText().toString().trim();

                    Map<String, Object> body = new HashMap<>();
                    body.put("carrierName", selectedCarrier);
                    body.put("consignmentNumber", awb);
                    if (!trackingUrl.isEmpty()) {
                        body.put("consignmentUrl", trackingUrl);
                    }

                    ApiClient.getService(this).recordShipment(orderId, body).enqueue(new Callback<ApiResponse<Order>>() {
                        @Override
                        public void onResponse(@NonNull Call<ApiResponse<Order>> call, @NonNull Response<ApiResponse<Order>> response) {
                            Toast.makeText(SellerDashboardActivity.this, "Shipment handed over to courier!", Toast.LENGTH_SHORT).show();
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

    private void updateFulfillmentStep(String orderId, String step) {
        Map<String, String> body = new HashMap<>();
        body.put("step", step);

        ApiClient.getService(this).updateFulfillmentStep(orderId, body).enqueue(new Callback<ApiResponse<Order>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<Order>> call, @NonNull Response<ApiResponse<Order>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(SellerDashboardActivity.this, "Fulfillment updated to: " + step, Toast.LENGTH_SHORT).show();
                    loadDashboardData();
                } else {
                    Toast.makeText(SellerDashboardActivity.this, "Failed to update step", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Order>> call, @NonNull Throwable t) {
                Toast.makeText(SellerDashboardActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
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

    private void showEditShopProfileDialog() {
        if (currentProfile == null) {
            Toast.makeText(this, "Profile not loaded yet. Please wait.", Toast.LENGTH_SHORT).show();
            return;
        }

        android.widget.LinearLayout layout = new android.widget.LinearLayout(this);
        layout.setOrientation(android.widget.LinearLayout.VERTICAL);
        layout.setPadding(60, 24, 60, 16);

        final android.widget.EditText etShopName = new android.widget.EditText(this);
        etShopName.setHint("Shop / Kitchen Name (3 - 60 chars)");
        etShopName.setText(currentProfile.getShopName() != null ? currentProfile.getShopName() : "");
        layout.addView(etShopName);

        final android.widget.EditText etShopDesc = new android.widget.EditText(this);
        etShopDesc.setHint("Public Shop Description (max 500 chars)");
        etShopDesc.setText(currentProfile.getDescription() != null ? currentProfile.getDescription() : "");
        etShopDesc.setMinLines(3);
        layout.addView(etShopDesc);

        new com.google.android.material.dialog.MaterialAlertDialogBuilder(this)
                .setTitle("Edit Public Shop Profile")
                .setMessage("Update your public maker brand name and story visible to buyers.")
                .setView(layout)
                .setPositiveButton("Save Changes", (dialog, which) -> {
                    String newName = etShopName.getText().toString().trim();
                    String newDesc = etShopDesc.getText().toString().trim();

                    if (newName.length() < 3 || newName.length() > 60) {
                        Toast.makeText(this, "Shop name must be between 3 and 60 characters", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    Map<String, Object> body = new HashMap<>();
                    body.put("shopName", newName);
                    body.put("description", newDesc);

                    ApiClient.getService(this).updateSellerProfile(body).enqueue(new Callback<ApiResponse<SellerProfile>>() {
                        @Override
                        public void onResponse(@NonNull Call<ApiResponse<SellerProfile>> call, @NonNull Response<ApiResponse<SellerProfile>> response) {
                            if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                currentProfile = response.body().getData();
                                binding.tvSellerShopHeading.setText(currentProfile.getShopName());
                                Toast.makeText(SellerDashboardActivity.this, "Shop profile updated successfully!", Toast.LENGTH_SHORT).show();
                            } else {
                                Toast.makeText(SellerDashboardActivity.this, "Failed to update shop profile", Toast.LENGTH_SHORT).show();
                            }
                        }

                        @Override
                        public void onFailure(@NonNull Call<ApiResponse<SellerProfile>> call, @NonNull Throwable t) {
                            Toast.makeText(SellerDashboardActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                    });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadDashboardData();
    }
}
