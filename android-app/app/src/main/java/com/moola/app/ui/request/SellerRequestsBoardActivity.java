package com.moola.app.ui.request;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.moola.app.R;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.api.MoolaApiService;
import com.moola.app.data.model.Conversation;
import com.moola.app.data.model.CustomRequest;
import com.moola.app.ui.chat.ChatActivity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SellerRequestsBoardActivity extends AppCompatActivity implements SellerBoardAdapter.OnBoardActionListener {

    private RecyclerView rvRequests;
    private ProgressBar progressBar;
    private TextView tvEmpty;
    private SellerBoardAdapter adapter;
    private MoolaApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_seller_requests_board);

        apiService = ApiClient.getService(this);

        findViewById(R.id.btnBackSellerBoard).setOnClickListener(v -> finish());
        rvRequests = findViewById(R.id.rvSellerBoardRequests);
        progressBar = findViewById(R.id.pbSellerBoard);
        tvEmpty = findViewById(R.id.tvEmptyBoard);

        rvRequests.setLayoutManager(new LinearLayoutManager(this));
        adapter = new SellerBoardAdapter(this);
        rvRequests.setAdapter(adapter);

        loadBoardRequests();
    }

    private void loadBoardRequests() {
        progressBar.setVisibility(View.VISIBLE);
        apiService.getCustomRequestsBoard().enqueue(new Callback<ApiResponse<List<CustomRequest>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<CustomRequest>>> call, Response<ApiResponse<List<CustomRequest>>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    List<CustomRequest> list = response.body().getData();
                    adapter.setRequests(list);
                    tvEmpty.setVisibility(list.isEmpty() ? View.VISIBLE : View.GONE);
                } else {
                    tvEmpty.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<CustomRequest>>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                tvEmpty.setVisibility(View.VISIBLE);
                Toast.makeText(SellerRequestsBoardActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onSubmitOffer(CustomRequest request) {
        if (com.moola.app.data.storage.SessionManager.getInstance(this).isAdmin()) {
            Toast.makeText(this, "Admin accounts cannot submit commercial offers. Only registered makers can respond to buyer demands.", Toast.LENGTH_LONG).show();
            return;
        }
        showSubmitOfferDialog(request);
    }

    private void showSubmitOfferDialog(CustomRequest request) {
        View view = getLayoutInflater().inflate(android.R.layout.simple_list_item_1, null, false);
        
        // Let's create an input container programmatically with Material styling
        android.widget.LinearLayout layout = new android.widget.LinearLayout(this);
        layout.setOrientation(android.widget.LinearLayout.VERTICAL);
        layout.setPadding(48, 24, 48, 24);

        TextView tvTitle = new TextView(this);
        tvTitle.setText("Offer for: " + request.getTitle() + " (" + String.format("%.0f %s", request.getQuantity(), request.getUnit()) + ")");
        tvTitle.setTextSize(14);
        tvTitle.setTypeface(null, android.graphics.Typeface.BOLD);
        tvTitle.setPadding(0, 0, 0, 16);
        layout.addView(tvTitle);

        final EditText etPrice = new EditText(this);
        etPrice.setHint("Total Price (₹)");
        etPrice.setInputType(android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL);
        if (request.getBudget() != null && request.getBudget() > 0) {
            etPrice.setText(String.format("%.0f", request.getBudget()));
        }
        layout.addView(etPrice);

        final EditText etQuantity = new EditText(this);
        etQuantity.setHint("Quantity Offered (" + request.getUnit() + ")");
        etQuantity.setInputType(android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL);
        etQuantity.setText(String.format("%.0f", request.getQuantity()));
        layout.addView(etQuantity);

        final EditText etDeliveryDays = new EditText(this);
        etDeliveryDays.setHint("Estimated Preparation & Delivery Days (e.g. 4)");
        etDeliveryDays.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);
        etDeliveryDays.setText("3");
        layout.addView(etDeliveryDays);

        final EditText etDeliveryCost = new EditText(this);
        etDeliveryCost.setHint("Delivery / Shipping Cost (₹, 0 for free)");
        etDeliveryCost.setInputType(android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL);
        etDeliveryCost.setText("0");
        layout.addView(etDeliveryCost);

        final EditText etMessage = new EditText(this);
        etMessage.setHint("Note to Buyer (e.g., Prepared fresh after harvest)");
        layout.addView(etMessage);

        new MaterialAlertDialogBuilder(this)
                .setTitle("Submit Seller Quote")
                .setView(layout)
                .setPositiveButton("Submit Offer", (dialog, which) -> {
                    String priceStr = etPrice.getText().toString().trim();
                    String qtyStr = etQuantity.getText().toString().trim();
                    String daysStr = etDeliveryDays.getText().toString().trim();
                    String costStr = etDeliveryCost.getText().toString().trim();
                    String msg = etMessage.getText().toString().trim();

                    if (priceStr.isEmpty() || qtyStr.isEmpty()) {
                        Toast.makeText(this, "Price and Quantity are required", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    double price = Double.parseDouble(priceStr);
                    double qty = Double.parseDouble(qtyStr);
                    int days = daysStr.isEmpty() ? 3 : Integer.parseInt(daysStr);
                    double cost = costStr.isEmpty() ? 0.0 : Double.parseDouble(costStr);

                    Map<String, Object> body = new HashMap<>();
                    body.put("price", price);
                    body.put("quantity", qty);
                    body.put("deliveryDays", days);
                    body.put("deliveryCost", cost);
                    body.put("message", msg);

                    progressBar.setVisibility(View.VISIBLE);
                    apiService.submitCustomOffer(request.getId(), body).enqueue(new Callback<ApiResponse<CustomRequest>>() {
                        @Override
                        public void onResponse(Call<ApiResponse<CustomRequest>> call, Response<ApiResponse<CustomRequest>> response) {
                            progressBar.setVisibility(View.GONE);
                            if (response.isSuccessful()) {
                                Toast.makeText(SellerRequestsBoardActivity.this, "Offer submitted successfully!", Toast.LENGTH_LONG).show();
                                loadBoardRequests();
                            } else {
                                Toast.makeText(SellerRequestsBoardActivity.this, "Failed to submit offer", Toast.LENGTH_SHORT).show();
                            }
                        }

                        @Override
                        public void onFailure(Call<ApiResponse<CustomRequest>> call, Throwable t) {
                            progressBar.setVisibility(View.GONE);
                            Toast.makeText(SellerRequestsBoardActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                    });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    @Override
    public void onChatWithBuyer(CustomRequest request) {
        if (request.getBuyerId() == null) {
            Toast.makeText(this, "Buyer information unavailable", Toast.LENGTH_SHORT).show();
            return;
        }

        Map<String, Object> body = new HashMap<>();
        body.put("participantId", request.getBuyerId());
        body.put("partnerId", request.getBuyerId());
        body.put("customRequestId", request.getId());
        body.put("customRequestTitle", request.getTitle());

        progressBar.setVisibility(View.VISIBLE);
        apiService.startConversation(body).enqueue(new Callback<ApiResponse<Conversation>>() {
            @Override
            public void onResponse(Call<ApiResponse<Conversation>> call, Response<ApiResponse<Conversation>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    Conversation conv = response.body().getData();
                    Intent intent = new Intent(SellerRequestsBoardActivity.this, ChatActivity.class);
                    intent.putExtra("conversationId", conv.getId());
                    intent.putExtra("partnerName", request.getBuyerName() != null ? request.getBuyerName() : "Buyer");
                    intent.putExtra("contextTitle", "Request: " + request.getTitle());
                    startActivity(intent);
                } else {
                    Toast.makeText(SellerRequestsBoardActivity.this, "Unable to initiate chat", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Conversation>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(SellerRequestsBoardActivity.this, "Chat connection error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
