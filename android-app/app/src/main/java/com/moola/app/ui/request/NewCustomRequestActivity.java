package com.moola.app.ui.request;

import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.moola.app.R;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.CustomRequest;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.HashMap;
import java.util.Map;

public class NewCustomRequestActivity extends AppCompatActivity {

    private TextInputEditText etTitle;
    private TextInputEditText etQuantity;
    private TextInputEditText etUnit;
    private TextInputEditText etBudget;
    private TextInputEditText etLocation;
    private TextInputEditText etDescription;
    private MaterialButton btnSubmit;
    private ProgressBar pbSubmit;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_new_custom_request);

        findViewById(R.id.btnBackNewRequest).setOnClickListener(v -> finish());

        etTitle = findViewById(R.id.etRequestTitle);
        etQuantity = findViewById(R.id.etRequestQuantity);
        etUnit = findViewById(R.id.etRequestUnit);
        etBudget = findViewById(R.id.etRequestBudget);
        etLocation = findViewById(R.id.etRequestLocation);
        etDescription = findViewById(R.id.etRequestDescription);
        btnSubmit = findViewById(R.id.btnSubmitCustomRequest);
        pbSubmit = findViewById(R.id.pbSubmitRequest);

        btnSubmit.setOnClickListener(v -> submitRequest());
    }

    private void submitRequest() {
        String title = etTitle.getText() != null ? etTitle.getText().toString().trim() : "";
        String qtyStr = etQuantity.getText() != null ? etQuantity.getText().toString().trim() : "";
        String unit = etUnit.getText() != null ? etUnit.getText().toString().trim() : "";
        String budgetStr = etBudget.getText() != null ? etBudget.getText().toString().trim() : "";
        String location = etLocation.getText() != null ? etLocation.getText().toString().trim() : "";
        String description = etDescription.getText() != null ? etDescription.getText().toString().trim() : "";

        if (title.isEmpty()) {
            etTitle.setError("Please describe what product you need");
            etTitle.requestFocus();
            return;
        }

        if (qtyStr.isEmpty()) {
            etQuantity.setError("Quantity required");
            etQuantity.requestFocus();
            return;
        }

        double qty;
        try {
            qty = Double.parseDouble(qtyStr);
            if (qty <= 0) throw new NumberFormatException();
        } catch (NumberFormatException e) {
            etQuantity.setError("Enter a valid number");
            return;
        }

        if (unit.isEmpty()) {
            etUnit.setError("Unit required");
            return;
        }

        Map<String, Object> req = new HashMap<>();
        req.put("title", title);
        req.put("quantity", qty);
        req.put("unit", unit);
        if (!budgetStr.isEmpty()) {
            try {
                req.put("budget", Double.parseDouble(budgetStr));
            } catch (NumberFormatException ignored) {}
        }
        req.put("deliveryLocation", location);
        req.put("description", description);
        req.put("categoryName", "Homemade Pantry");
        req.put("expiresInDays", 10);

        setLoading(true);
        ApiClient.getService(this).createCustomRequest(req).enqueue(new Callback<ApiResponse<CustomRequest>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<CustomRequest>> call,
                                   @NonNull Response<ApiResponse<CustomRequest>> response) {
                setLoading(false);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    Toast.makeText(NewCustomRequestActivity.this, "Product request posted to makers!", Toast.LENGTH_LONG).show();
                    finish();
                } else {
                    String msg = response.body() != null ? response.body().getMessage() : "Failed to publish request";
                    Toast.makeText(NewCustomRequestActivity.this, msg, Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<CustomRequest>> call, @NonNull Throwable t) {
                setLoading(false);
                Toast.makeText(NewCustomRequestActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void setLoading(boolean loading) {
        btnSubmit.setEnabled(!loading);
        pbSubmit.setVisibility(loading ? View.VISIBLE : View.GONE);
    }
}
