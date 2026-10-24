package com.moola.app.ui.seller;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.os.Bundle;
import android.speech.RecognizerIntent;
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
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class AddEditProductActivity extends AppCompatActivity {

    private static final int REQ_VOICE_LISTING = 1001;
    private ActivityAddEditProductBinding binding;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityAddEditProductBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.btnBackAddProd.setOnClickListener(v -> finish());
        binding.btnSaveProduct.setOnClickListener(v -> saveProduct());
        binding.btnStartVoiceListing.setOnClickListener(v -> startVoiceRecognition());
    }

    private void startVoiceRecognition() {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "kn-IN");
        intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "Describe product in Kannada or English (e.g. 500g Wild Honey from Coorg for 450 rupees)");

        try {
            startActivityForResult(intent, REQ_VOICE_LISTING);
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "Voice recognition service not available on this device", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_VOICE_LISTING && resultCode == RESULT_OK && data != null) {
            ArrayList<String> results = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (results != null && !results.isEmpty()) {
                String spokenText = results.get(0);
                parseAndPopulateVoiceListing(spokenText);
            }
        }
    }

    private void parseAndPopulateVoiceListing(String speech) {
        if (speech == null || speech.isBlank()) return;

        // Populate description with transcribed text for complete maker review
        binding.etAddDescription.setText(speech);

        // 1. Extract Price (e.g. "450 rupees", "rs 450", "₹450", "450 rs", "rate 450")
        Pattern pricePattern = Pattern.compile("(?i)(?:rs\\.?|₹|rupees?|rate)?\\s*(\\d{2,5})\\s*(?:rs\\.?|₹|rupees?)?");
        Matcher priceMatcher = pricePattern.matcher(speech);
        if (priceMatcher.find()) {
            String pStr = priceMatcher.group(1);
            if (pStr != null && !pStr.isEmpty()) {
                binding.etAddPrice.setText(pStr);
            }
        }

        // 2. Extract Quantity & Unit (e.g. "500g", "1 kg", "250 gm", "1 litre", "1 jar", "2 packets")
        Pattern unitPattern = Pattern.compile("(?i)(\\d+\\s*(?:kg|g|gm|grams?|kilo|litres?|ml|bottles?|packets?|jar))");
        Matcher unitMatcher = unitPattern.matcher(speech);
        if (unitMatcher.find()) {
            String unitStr = unitMatcher.group(1);
            if (unitStr != null) {
                binding.etAddUnit.setText(unitStr.trim());
            }
        }

        // 3. Extract Origin (e.g. "from Coorg", "from Sirsi", "origin Malnad")
        Pattern originPattern = Pattern.compile("(?i)(?:from|origin|region)\\s+([A-Za-z]+)");
        Matcher originMatcher = originPattern.matcher(speech);
        if (originMatcher.find()) {
            String originStr = originMatcher.group(1);
            if (originStr != null) {
                binding.etAddOrigin.setText(originStr.trim());
            }
        }

        // 4. Extract Product Name candidate
        // Clean off obvious words to generate title candidate
        String candidateTitle = speech;
        candidateTitle = candidateTitle.replaceAll("(?i)\\b(rs\\.?|₹|rupees?|price|rate|cost|for|and|from|only)\\b", "");
        if (candidateTitle.length() > 60) {
            candidateTitle = candidateTitle.substring(0, 60);
        }
        binding.etAddNameEn.setText(candidateTitle.trim());

        Toast.makeText(this, "Voice transcribed! Please review all fields before saving.", Toast.LENGTH_LONG).show();
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
        String ingredients = binding.etAddIngredients.getText() != null ? binding.etAddIngredients.getText().toString().trim() : "";
        String origin = binding.etAddOrigin.getText() != null ? binding.etAddOrigin.getText().toString().trim() : "";
        String shelfLife = binding.etAddShelfLife.getText() != null ? binding.etAddShelfLife.getText().toString().trim() : "";
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
        if (!ingredients.isEmpty()) productData.put("ingredients", ingredients);
        if (!origin.isEmpty()) productData.put("origin", origin);
        if (!shelfLife.isEmpty()) productData.put("shelfLife", shelfLife);

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
