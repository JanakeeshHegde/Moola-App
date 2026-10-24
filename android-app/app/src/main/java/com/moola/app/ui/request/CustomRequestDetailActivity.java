package com.moola.app.ui.request;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.moola.app.R;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.CustomRequest;
import com.moola.app.ui.chat.ChatActivity;
import com.moola.app.ui.order.OrderDetailActivity;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CustomRequestDetailActivity extends AppCompatActivity {

    private String requestId;
    private CustomRequest currentRequest;

    private TextView tvCategory;
    private TextView tvStatus;
    private TextView tvTitle;
    private TextView tvQtyBudget;
    private TextView tvLocation;
    private TextView tvDescription;
    private MaterialButton btnViewOrder;
    private ProgressBar pbOffers;
    private RecyclerView rvOffers;
    private TextView tvNoOffers;
    private OfferAdapter adapter;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_custom_request_detail);

        requestId = getIntent().getStringExtra("requestId");
        if (requestId == null || requestId.isBlank()) {
            Toast.makeText(this, "Request ID not found", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        findViewById(R.id.btnBackRequestDetail).setOnClickListener(v -> finish());

        tvCategory = findViewById(R.id.tvDetailReqCategory);
        tvStatus = findViewById(R.id.tvDetailReqStatus);
        tvTitle = findViewById(R.id.tvDetailReqTitle);
        tvQtyBudget = findViewById(R.id.tvDetailReqQuantityAndBudget);
        tvLocation = findViewById(R.id.tvDetailReqLocation);
        tvDescription = findViewById(R.id.tvDetailReqDescription);
        btnViewOrder = findViewById(R.id.btnViewResultingOrder);
        pbOffers = findViewById(R.id.pbOffers);
        rvOffers = findViewById(R.id.rvOffers);
        tvNoOffers = findViewById(R.id.tvNoOffersText);

        rvOffers.setLayoutManager(new LinearLayoutManager(this));

        btnViewOrder.setOnClickListener(v -> {
            if (currentRequest != null && currentRequest.getResultingOrderId() != null) {
                Intent intent = new Intent(this, OrderDetailActivity.class);
                intent.putExtra("orderId", currentRequest.getResultingOrderId());
                startActivity(intent);
            }
        });

        loadRequestDetail();
    }

    private void loadRequestDetail() {
        pbOffers.setVisibility(View.VISIBLE);

        ApiClient.getService(this).getCustomRequestById(requestId).enqueue(new Callback<ApiResponse<CustomRequest>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<CustomRequest>> call,
                                   @NonNull Response<ApiResponse<CustomRequest>> response) {
                pbOffers.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    currentRequest = response.body().getData();
                    renderRequest(currentRequest);
                } else {
                    Toast.makeText(CustomRequestDetailActivity.this, "Could not load request details", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<CustomRequest>> call, @NonNull Throwable t) {
                pbOffers.setVisibility(View.GONE);
                Toast.makeText(CustomRequestDetailActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void renderRequest(CustomRequest req) {
        if (req == null) return;

        tvCategory.setText(req.getCategoryName() != null ? req.getCategoryName().toUpperCase() : "HOMEMADE PANTRY");
        tvStatus.setText(req.getStatus());
        tvTitle.setText(req.getTitle());

        String qtyStr = String.format("%.0f %s", req.getQuantity(), req.getUnit());
        String budgetStr = req.getBudget() != null ? String.format(" • Budget: ₹%.0f", req.getBudget()) : "";
        tvQtyBudget.setText("Required: " + qtyStr + budgetStr);

        if (req.getDeliveryLocation() != null && !req.getDeliveryLocation().isBlank()) {
            tvLocation.setVisibility(View.VISIBLE);
            tvLocation.setText("Delivery to: " + req.getDeliveryLocation());
        } else {
            tvLocation.setVisibility(View.GONE);
        }

        tvDescription.setText(req.getDescription() != null ? req.getDescription() : "");

        if (req.getResultingOrderId() != null && !req.getResultingOrderId().isBlank()) {
            btnViewOrder.setVisibility(View.VISIBLE);
        } else {
            btnViewOrder.setVisibility(View.GONE);
        }

        boolean canAccept = "OPEN".equalsIgnoreCase(req.getStatus()) || "OFFERS_RECEIVED".equalsIgnoreCase(req.getStatus());

        adapter = new OfferAdapter(canAccept, new OfferAdapter.OnOfferActionListener() {
            @Override
            public void onAcceptOffer(CustomRequest.Offer offer) {
                confirmAcceptOffer(offer);
            }

            @Override
            public void onChatWithSeller(CustomRequest.Offer offer) {
                Intent chatIntent = new Intent(CustomRequestDetailActivity.this, ChatActivity.class);
                chatIntent.putExtra("participantId", offer.getSellerId());
                chatIntent.putExtra("participantName", offer.getSellerShopName() != null ? offer.getSellerShopName() : offer.getSellerName());
                chatIntent.putExtra("customRequestId", currentRequest.getId());
                chatIntent.putExtra("customRequestTitle", currentRequest.getTitle());
                startActivity(chatIntent);
            }
        });

        rvOffers.setAdapter(adapter);
        adapter.setOffers(req.getOffers());

        if (req.getOffers() == null || req.getOffers().isEmpty()) {
            tvNoOffers.setVisibility(View.VISIBLE);
            rvOffers.setVisibility(View.GONE);
        } else {
            tvNoOffers.setVisibility(View.GONE);
            rvOffers.setVisibility(View.VISIBLE);
        }
    }

    private void confirmAcceptOffer(CustomRequest.Offer offer) {
        new MaterialAlertDialogBuilder(this)
                .setTitle("Accept Offer of ₹" + ((int) offer.getPrice()) + "?")
                .setMessage("Accepting this quote from " + (offer.getSellerShopName() != null ? offer.getSellerShopName() : offer.getSellerName())
                        + " will confirm your custom order and notify the maker for fresh batch preparation.")
                .setPositiveButton("Accept & Confirm Order", (dialog, which) -> {
                    ApiClient.getService(this).acceptCustomOffer(requestId, offer.getId())
                            .enqueue(new Callback<ApiResponse<CustomRequest>>() {
                                @Override
                                public void onResponse(@NonNull Call<ApiResponse<CustomRequest>> call,
                                                       @NonNull Response<ApiResponse<CustomRequest>> response) {
                                    if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                        Toast.makeText(CustomRequestDetailActivity.this, "Offer accepted! Order created.", Toast.LENGTH_LONG).show();
                                        currentRequest = response.body().getData();
                                        renderRequest(currentRequest);
                                    } else {
                                        String msg = response.body() != null ? response.body().getMessage() : "Failed to accept offer";
                                        Toast.makeText(CustomRequestDetailActivity.this, msg, Toast.LENGTH_SHORT).show();
                                    }
                                }

                                @Override
                                public void onFailure(@NonNull Call<ApiResponse<CustomRequest>> call, @NonNull Throwable t) {
                                    Toast.makeText(CustomRequestDetailActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                                }
                            });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }
}
