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

        binding.btnOrderChat.setOnClickListener(v -> {
            if (currentOrder == null) return;
            com.moola.app.data.model.User currentUser = com.moola.app.data.storage.SessionManager.getInstance(this).getUser();
            String currentUserId = currentUser != null ? currentUser.getId() : "";

            Intent chatIntent = new Intent(this, com.moola.app.ui.chat.ChatActivity.class);
            if (currentUserId.equals(currentOrder.getSellerId())) {
                chatIntent.putExtra(com.moola.app.ui.chat.ChatActivity.EXTRA_OTHER_USER_ID, currentOrder.getBuyerId());
                chatIntent.putExtra(com.moola.app.ui.chat.ChatActivity.EXTRA_PARTNER_NAME, currentOrder.getBuyerName() != null ? currentOrder.getBuyerName() : "Customer");
            } else {
                chatIntent.putExtra(com.moola.app.ui.chat.ChatActivity.EXTRA_OTHER_USER_ID, currentOrder.getSellerId());
                chatIntent.putExtra(com.moola.app.ui.chat.ChatActivity.EXTRA_PARTNER_NAME, currentOrder.getSellerShopName() != null ? currentOrder.getSellerShopName() : "Artisan Maker");
            }
            chatIntent.putExtra(com.moola.app.ui.chat.ChatActivity.EXTRA_ORDER_ID, currentOrder.getId());
            chatIntent.putExtra(com.moola.app.ui.chat.ChatActivity.EXTRA_ORDER_NUMBER, currentOrder.getOrderNumber());
            chatIntent.putExtra(com.moola.app.ui.chat.ChatActivity.EXTRA_CONTEXT_TITLE, "📦 Order #" + (currentOrder.getOrderNumber() != null ? currentOrder.getOrderNumber() : currentOrder.getId()));
            startActivity(chatIntent);
        });

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
                    String msg = "Unable to load order details";
                    if (response.code() == 401) {
                        msg = "Session expired. Please log in again.";
                    } else if (response.code() == 403) {
                        msg = "Access denied: You do not have permission to view this order.";
                    } else if (response.code() == 404) {
                        msg = "Order not found.";
                    }
                    Toast.makeText(OrderDetailActivity.this, msg, Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Order>> call, @NonNull Throwable t) {
                Toast.makeText(OrderDetailActivity.this, "Network error: Unable to reach server. Please check your connection.", Toast.LENGTH_SHORT).show();
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

        // Update fulfillment stepper
        int step = order.getCurrentStep() > 0 ? order.getCurrentStep() : 1;
        if ("DELIVERED".equals(order.getStatus())) step = 5;
        else if ("SHIPPED".equals(order.getStatus()) || "DISPATCHED".equals(order.getStatus())) step = Math.max(step, 3);
        else if ("PACKED".equals(order.getStatus())) step = Math.max(step, 2);

        updateStepperView(step);

        // Consignment & Courier Tracking
        if (order.getConsignmentNumber() != null && !order.getConsignmentNumber().isBlank()) {
            binding.cardConsignment.setVisibility(View.VISIBLE);
            String carrier = order.getCarrierName() != null ? order.getCarrierName() : "India Post Speed Post";
            binding.tvCarrierName.setText("Carrier: " + carrier);
            binding.tvTrackingNumber.setText("Consignment #: " + order.getConsignmentNumber());
            binding.tvDispatchDate.setText("Dispatched: Direct Maker Handover Recorded");

            final String awb = order.getConsignmentNumber();
            binding.btnCopyTracking.setOnClickListener(v -> {
                android.content.ClipboardManager clipboard = (android.content.ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
                android.content.ClipData clip = android.content.ClipData.newPlainText("AWB Tracking Number", awb);
                if (clipboard != null) {
                    clipboard.setPrimaryClip(clip);
                    Toast.makeText(this, "Tracking number " + awb + " copied!", Toast.LENGTH_SHORT).show();
                }
            });

            binding.btnTrackShipment.setOnClickListener(v -> {
                String trackingUrl = order.getConsignmentUrl();
                if (trackingUrl == null || trackingUrl.isBlank()) {
                    trackingUrl = "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx";
                }
                Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(trackingUrl));
                try {
                    startActivity(browserIntent);
                } catch (Exception e) {
                    Toast.makeText(this, "Could not open tracking portal", Toast.LENGTH_SHORT).show();
                }
            });
        } else {
            binding.cardConsignment.setVisibility(View.GONE);
        }

        // Review & Rating Section
        if ("DELIVERED".equals(order.getStatus())) {
            binding.cardOrderReview.setVisibility(View.VISIBLE);
            if (order.getRating() != null && order.getRating() > 0) {
                binding.layoutReviewInput.setVisibility(View.GONE);
                binding.tvSubmittedReview.setVisibility(View.VISIBLE);
                binding.tvSubmittedReview.setText("You rated this order: " + order.getRating() + " ★\n\"" +
                        (order.getReviewNote() != null ? order.getReviewNote() : "Fresh & Authentic") + "\"");
            } else {
                binding.layoutReviewInput.setVisibility(View.VISIBLE);
                binding.tvSubmittedReview.setVisibility(View.GONE);
                setupReviewSubmission();
            }
        } else {
            binding.cardOrderReview.setVisibility(View.GONE);
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

    private void updateStepperView(int activeStep) {
        int colorActive = getResources().getColor(R.color.moola_forest_green);
        int colorInactive = getResources().getColor(R.color.moola_sandstone_border);
        int colorTextActive = getResources().getColor(R.color.moola_charcoal);
        int colorTextInactive = getResources().getColor(R.color.moola_charcoal_secondary);

        binding.ivStep1.setColorFilter(activeStep >= 1 ? colorActive : colorInactive);
        binding.tvStep1.setTextColor(activeStep >= 1 ? colorTextActive : colorTextInactive);

        binding.ivStep2.setColorFilter(activeStep >= 2 ? colorActive : colorInactive);
        binding.tvStep2.setTextColor(activeStep >= 2 ? colorTextActive : colorTextInactive);

        binding.ivStep3.setColorFilter(activeStep >= 3 ? colorActive : colorInactive);
        binding.tvStep3.setTextColor(activeStep >= 3 ? colorTextActive : colorTextInactive);

        binding.ivStep4.setColorFilter(activeStep >= 4 ? colorActive : colorInactive);
        binding.tvStep4.setTextColor(activeStep >= 4 ? colorTextActive : colorTextInactive);

        binding.ivStep5.setColorFilter(activeStep >= 5 ? colorActive : colorInactive);
        binding.tvStep5.setTextColor(activeStep >= 5 ? colorTextActive : colorTextInactive);
    }

    private void setupReviewSubmission() {
        String[] ratingOptions = {
                "5 Stars - Outstanding Homemade Taste & Freshness",
                "4 Stars - Great Artisan Quality",
                "3 Stars - Good & Natural",
                "2 Stars - Average Quality",
                "1 Star - Unsatisfactory"
        };
        android.widget.ArrayAdapter<String> ratingAdapter = new android.widget.ArrayAdapter<>(
                this, android.R.layout.simple_spinner_dropdown_item, ratingOptions);
        binding.spReviewRating.setAdapter(ratingAdapter);

        binding.btnSubmitReview.setOnClickListener(v -> {
            int selectedIndex = binding.spReviewRating.getSelectedItemPosition();
            int stars = 5 - selectedIndex; // 0 index -> 5 stars
            String note = binding.etReviewNote.getText().toString().trim();

            Map<String, Object> body = new HashMap<>();
            body.put("rating", stars);
            body.put("reviewNote", note);

            ApiClient.getService(this).submitOrderReview(orderId, body).enqueue(new Callback<ApiResponse<Order>>() {
                @Override
                public void onResponse(@NonNull Call<ApiResponse<Order>> call, @NonNull Response<ApiResponse<Order>> response) {
                    if (response.isSuccessful()) {
                        Toast.makeText(OrderDetailActivity.this, "Thank you! Your review has been published.", Toast.LENGTH_LONG).show();
                        loadOrderDetail();
                    } else {
                        Toast.makeText(OrderDetailActivity.this, "Failed to submit review", Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(@NonNull Call<ApiResponse<Order>> call, @NonNull Throwable t) {
                    Toast.makeText(OrderDetailActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        });
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
