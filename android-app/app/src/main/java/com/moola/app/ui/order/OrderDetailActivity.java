package com.moola.app.ui.order;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.moola.app.R;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.Order;
import com.moola.app.databinding.ActivityOrderDetailBinding;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.HashMap;
import java.util.Map;

public class OrderDetailActivity extends AppCompatActivity {

    private ActivityOrderDetailBinding binding;
    private String orderId;
    private Order currentOrder;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityOrderDetailBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        orderId = getIntent().getStringExtra("orderId");
        if (orderId == null || orderId.isBlank()) {
            Toast.makeText(this, "Order identifier not found", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        binding.btnBackOrder.setOnClickListener(v -> finish());
        binding.btnSubmitUtr.setOnClickListener(v -> showUtrSubmissionDialog());
        binding.btnCancelOrder.setOnClickListener(v -> showCancelOrderDialog());

        loadOrderDetail();
    }

    private void loadOrderDetail() {
        ApiClient.getService(this).getOrderById(orderId).enqueue(new Callback<ApiResponse<Order>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<Order>> call, @NonNull Response<ApiResponse<Order>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    currentOrder = response.body().getData();
                    renderOrderDetails(currentOrder);
                } else {
                    Toast.makeText(OrderDetailActivity.this, "Failed to load order details", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Order>> call, @NonNull Throwable t) {
                Toast.makeText(OrderDetailActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void renderOrderDetails(Order order) {
        if (order == null) return;

        binding.tvDetailOrderNumber.setText("Order #" + (order.getOrderNumber() != null ? order.getOrderNumber() : order.getId()));
        binding.tvDetailOrderStatus.setText(order.getStatus());

        // Update status timeline text
        String timelineNote;
        switch (order.getStatus()) {
            case "CONFIRMED":
                timelineNote = "Artisan maker confirmed fresh batch preparation.";
                break;
            case "DISPATCHED":
                timelineNote = "Consignment handed over to postal/courier carrier.";
                break;
            case "DELIVERED":
                timelineNote = "Package successfully delivered. Enjoy your homemade food!";
                break;
            case "CANCELLED":
                timelineNote = "This order was cancelled.";
                break;
            default:
                timelineNote = "Maker will confirm product availability and fresh preparation shortly.";
                break;
        }
        binding.tvDetailOrderTimelineNote.setText(timelineNote);

        // Consignment & Postal Tracking
        if (order.getConsignmentNumber() != null && !order.getConsignmentNumber().isBlank()) {
            binding.cardConsignment.setVisibility(View.VISIBLE);
            String carrier = order.getCarrierName() != null ? order.getCarrierName() : "India Post Speed Post";
            binding.tvCarrierAndAwb.setText(carrier + ": " + order.getConsignmentNumber());

            binding.btnTrackShipment.setOnClickListener(v -> {
                String trackingUrl = order.getConsignmentUrl();
                if (trackingUrl == null || trackingUrl.isBlank()) {
                    // Default to India Post track consignment portal
                    trackingUrl = "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx";
                }
                Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(trackingUrl));
                try {
                    startActivity(browserIntent);
                } catch (Exception e) {
                    Toast.makeText(this, "Could not open tracking browser", Toast.LENGTH_SHORT).show();
                }
            });
        } else {
            binding.cardConsignment.setVisibility(View.GONE);
        }

        // Payment status & UPI
        binding.tvPaymentStatusText.setText("Payment: " + (order.getPaymentStatus() != null ? order.getPaymentStatus() : "PENDING"));
        if (order.getPaymentUtr() != null && !order.getPaymentUtr().isBlank()) {
            binding.tvPaymentStatusText.setText("Payment: Submitted (UTR: " + order.getPaymentUtr() + ")");
            binding.btnSubmitUtr.setVisibility(View.GONE);
        } else {
            binding.btnSubmitUtr.setVisibility(View.VISIBLE);
        }

        if (order.getSellerUpiId() != null && !order.getSellerUpiId().isBlank()) {
            binding.tvSellerUpiDetails.setText("Maker Direct UPI ID: " + order.getSellerUpiId());
        }

        // Delivery address
        if (order.getDeliveryAddress() != null) {
            binding.tvDeliveryAddressText.setText(order.getDeliveryAddress());
        } else {
            binding.tvDeliveryAddressText.setText("Address provided during order request");
        }

        // Cancel order button visibility
        if ("DELIVERED".equals(order.getStatus()) || "CANCELLED".equals(order.getStatus())) {
            binding.btnCancelOrder.setVisibility(View.GONE);
        } else {
            binding.btnCancelOrder.setVisibility(View.VISIBLE);
        }
    }

    private void showUtrSubmissionDialog() {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_simple_input, null, false);
        EditText etInput = dialogView.findViewById(R.id.etDialogInput);
        etInput.setHint("Enter 12-digit UPI Reference (UTR)");

        new MaterialAlertDialogBuilder(this)
                .setTitle("Submit UPI Payment UTR")
                .setMessage("After transferring the order total directly to the maker's UPI ID, paste the transaction reference (UTR) here for confirmation.")
                .setView(dialogView)
                .setPositiveButton("Submit", (dialog, which) -> {
                    String utr = etInput.getText().toString().trim();
                    if (utr.isEmpty()) {
                        Toast.makeText(this, "Please enter a valid UTR reference", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    submitUtr(utr);
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void submitUtr(String utr) {
        Map<String, String> body = new HashMap<>();
        body.put("paymentUtr", utr);

        ApiClient.getService(this).submitPaymentUtr(orderId, body).enqueue(new Callback<ApiResponse<Order>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<Order>> call, @NonNull Response<ApiResponse<Order>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    Toast.makeText(OrderDetailActivity.this, "UPI UTR recorded successfully!", Toast.LENGTH_SHORT).show();
                    loadOrderDetail();
                } else {
                    Toast.makeText(OrderDetailActivity.this, "Could not submit UTR", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Order>> call, @NonNull Throwable t) {
                Toast.makeText(OrderDetailActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showCancelOrderDialog() {
        new MaterialAlertDialogBuilder(this)
                .setTitle("Cancel Order?")
                .setMessage("Are you sure you wish to cancel this order request with the artisanal maker?")
                .setPositiveButton("Yes, Cancel Order", (dialog, which) -> {
                    Map<String, String> body = new HashMap<>();
                    body.put("reason", "Cancelled by customer via mobile app");
                    ApiClient.getService(this).cancelOrder(orderId, body).enqueue(new Callback<ApiResponse<Order>>() {
                        @Override
                        public void onResponse(@NonNull Call<ApiResponse<Order>> call, @NonNull Response<ApiResponse<Order>> response) {
                            if (response.isSuccessful()) {
                                Toast.makeText(OrderDetailActivity.this, "Order cancelled", Toast.LENGTH_SHORT).show();
                                loadOrderDetail();
                            } else {
                                Toast.makeText(OrderDetailActivity.this, "Failed to cancel order", Toast.LENGTH_SHORT).show();
                            }
                        }

                        @Override
                        public void onFailure(@NonNull Call<ApiResponse<Order>> call, @NonNull Throwable t) {
                            Toast.makeText(OrderDetailActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                    });
                })
                .setNegativeButton("Keep Order", null)
                .show();
    }
}
