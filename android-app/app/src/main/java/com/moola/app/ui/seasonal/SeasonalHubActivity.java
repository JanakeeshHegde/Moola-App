package com.moola.app.ui.seasonal;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.moola.app.R;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.api.MoolaApiService;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.PreBooking;
import com.moola.app.data.model.SeasonalCampaign;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SeasonalHubActivity extends AppCompatActivity implements SeasonalCampaignAdapter.OnPreBookClickListener {

    private RecyclerView rvCampaigns;
    private ProgressBar progressBar;
    private SeasonalCampaignAdapter adapter;
    private MoolaApiService apiService;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_seasonal_hub);

        apiService = ApiClient.getService(this);

        findViewById(R.id.btnBackSeasonal).setOnClickListener(v -> finish());
        rvCampaigns = findViewById(R.id.rvSeasonalCampaigns);
        progressBar = findViewById(R.id.pbSeasonal);

        rvCampaigns.setLayoutManager(new LinearLayoutManager(this));
        adapter = new SeasonalCampaignAdapter(this);
        rvCampaigns.setAdapter(adapter);

        loadCampaigns();
    }

    private void loadCampaigns() {
        progressBar.setVisibility(View.VISIBLE);
        apiService.getSeasonalCampaigns().enqueue(new Callback<ApiResponse<List<SeasonalCampaign>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<SeasonalCampaign>>> call,
                                   @NonNull Response<ApiResponse<List<SeasonalCampaign>>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    adapter.setCampaigns(response.body().getData());
                } else {
                    Toast.makeText(SeasonalHubActivity.this, "Could not load seasonal campaigns", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<SeasonalCampaign>>> call, @NonNull Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(SeasonalHubActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onPreBook(SeasonalCampaign campaign) {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_pre_book, null);
        TextView tvTitle = dialogView.findViewById(R.id.tvDialogCampaignTitle);
        TextView tvPrice = dialogView.findViewById(R.id.tvDialogPricePerUnit);
        EditText etQty = dialogView.findViewById(R.id.etPreBookQuantity);
        EditText etAddress = dialogView.findViewById(R.id.etPreBookAddress);
        TextView tvTotal = dialogView.findViewById(R.id.tvPreBookEstimatedTotal);

        tvTitle.setText(campaign.getTitle());
        final double unitPrice = campaign.getPrice();
        tvPrice.setText(String.format("Price: ₹%.0f per %s", unitPrice, campaign.getUnit()));
        tvTotal.setText(String.format("Total Amount: ₹%.0f", unitPrice));

        etQty.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                try {
                    int q = Integer.parseInt(s.toString().trim());
                    tvTotal.setText(String.format("Total Amount: ₹%.0f", q * unitPrice));
                } catch (Exception ignored) {
                    tvTotal.setText("Total Amount: ₹0");
                }
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        new MaterialAlertDialogBuilder(this)
                .setTitle("Confirm Festival Pre-Booking")
                .setView(dialogView)
                .setPositiveButton("Confirm Pre-Booking", (dialog, which) -> {
                    String qtyStr = etQty.getText().toString().trim();
                    String address = etAddress.getText().toString().trim();

                    if (qtyStr.isEmpty() || address.isEmpty()) {
                        Toast.makeText(this, "Quantity and delivery address are required", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    int quantity = Integer.parseInt(qtyStr);
                    if (quantity <= 0) {
                        Toast.makeText(this, "Please enter a valid quantity", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    submitPreBooking(campaign, quantity, address);
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void submitPreBooking(SeasonalCampaign campaign, int quantity, String address) {
        progressBar.setVisibility(View.VISIBLE);

        Map<String, Object> body = new HashMap<>();
        body.put("quantity", quantity);
        body.put("shippingAddress", address);

        apiService.preBookCampaign(campaign.getId(), body).enqueue(new Callback<ApiResponse<PreBooking>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<PreBooking>> call,
                                   @NonNull Response<ApiResponse<PreBooking>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    PreBooking booking = response.body().getData();
                    showBookingSuccessDialog(booking, campaign);
                    loadCampaigns(); // Refresh remaining capacity
                } else {
                    String errorMsg = "Booking failed";
                    if (response.body() != null && response.body().getMessage() != null) {
                        errorMsg = response.body().getMessage();
                    }
                    Toast.makeText(SeasonalHubActivity.this, errorMsg, Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<PreBooking>> call, @NonNull Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(SeasonalHubActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showBookingSuccessDialog(PreBooking booking, SeasonalCampaign campaign) {
        String msg = "Pre-booking confirmed successfully!\n\n" +
                "Booking #: " + booking.getBookingNumber() + "\n" +
                "Campaign: " + campaign.getTitle() + "\n" +
                "Quantity: " + booking.getQuantity() + " " + campaign.getUnit() + "\n" +
                "Total: ₹" + String.format("%.0f", booking.getTotalAmount()) + "\n" +
                "Delivery Window: " + campaign.getExpectedDeliveryWindow() + "\n\n" +
                "You will receive dispatch tracking notifications when batch harvest shipping begins.";

        new MaterialAlertDialogBuilder(this)
                .setTitle("Seasonal Allocation Reserved! 🎉")
                .setMessage(msg)
                .setPositiveButton("Done", null)
                .show();
    }
}
