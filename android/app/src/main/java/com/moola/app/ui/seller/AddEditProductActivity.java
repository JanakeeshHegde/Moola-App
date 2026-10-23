package com.moola.app.ui.seller;

import android.os.Bundle;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.Product;
import com.moola.app.databinding.ActivityAddEditProductBinding;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AddEditProductActivity extends AppCompatActivity {

    private ActivityAddEditProductBinding binding;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityAddEditProductBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.btnBackAddProd.setOnClickListener(v -> finish());
        binding.btnSaveProduct.setOnClickListener(v -> saveProduct());
    }

    private void saveProduct() {
        String titleEn = binding.etAddNameEn.getText() != null ? binding.etAddNameEn.getText().toString().trim() : "";
        String titleKn = binding.etAddNameKn.getText() != null ? binding.etAddNameKn.getText().toString().trim() : "";
        String priceStr = binding.etAddPrice.getText() != null ? binding.etAddPrice.getText().toString().trim() : "";
        String unit = binding.etAddUnit.getText() != null ? binding.etAddUnit.getText().toString().trim() : "";
        String stockStr = binding.etAddStock.getText() != null ? binding.etAddStock.getText().toString().trim() : "";
        String mrpStr = binding.etAddMrp.getText() != null ? binding.etAddMrp.getText().toString().trim() : "";
        String imageUrl = binding.etAddImageUrl.getText() != null ? binding.etAddImageUrl.getText().toString().trim() : "";
        String description = binding.etAddDescription.getText() != null ? binding.etAddDescription.getText().toString().trim() : "";
        boolean isOrganic = binding.cbIsOrganic.isChecked();

        if (titleEn.isEmpty()) {
            binding.tilAddNameEn.setError("Product title is required");
            return;
        } else {
            binding.tilAddNameEn.setError(null);
        }

        if (priceStr.isEmpty()) {
            binding.tilAddPrice.setError("Price is required");
            return;
        } else {
            binding.tilAddPrice.setError(null);
        }

        double price;
        try {
            price = Double.parseDouble(priceStr);
        } catch (NumberFormatException e) {
            binding.tilAddPrice.setError("Invalid price format");
            return;
        }

        int stock = 10;
        if (!stockStr.isEmpty()) {
            try {
                stock = Integer.parseInt(stockStr);
            } catch (NumberFormatException ignored) {}
        }

        Map<String, Object> productData = new HashMap<>();
        productData.put("title", titleEn);
        if (!titleKn.isEmpty()) productData.put("titleKn", titleKn);
        productData.put("price", price);
        productData.put("unit", unit.isEmpty() ? "250g" : unit);
        productData.put("quantityAvailable", stock);
        productData.put("isOrganic", isOrganic);
        productData.put("description", description);

        if (!mrpStr.isEmpty()) {
            try {
                productData.put("mrp", Double.parseDouble(mrpStr));
            } catch (Exception ignored) {}
        }

        if (!imageUrl.isEmpty()) {
            productData.put("thumbnailUrl", imageUrl);
            List<String> images = new ArrayList<>();
            images.add(imageUrl);
            productData.put("images", images);
        }

        binding.btnSaveProduct.setEnabled(false);
        binding.btnSaveProduct.setText("Saving Listing...");

        ApiClient.getService(this).createProduct(productData).enqueue(new Callback<ApiResponse<Product>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<Product>> call, @NonNull Response<ApiResponse<Product>> response) {
                binding.btnSaveProduct.setEnabled(true);
                binding.btnSaveProduct.setText("Save & Publish Listing");

                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    Toast.makeText(AddEditProductActivity.this, "Homemade food listing published!", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    String msg = response.body() != null ? response.body().getMessage() : "Validation error";
                    Toast.makeText(AddEditProductActivity.this, "Could not save listing: " + msg, Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Product>> call, @NonNull Throwable t) {
                binding.btnSaveProduct.setEnabled(true);
                binding.btnSaveProduct.setText("Save & Publish Listing");
                Toast.makeText(AddEditProductActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
