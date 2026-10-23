package com.moola.app.ui.product;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.bumptech.glide.Glide;
import com.google.android.material.button.MaterialButton;
import com.google.gson.Gson;
import com.moola.app.R;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.Product;
import com.moola.app.data.model.SellerProfile;
import com.moola.app.data.model.WhatsAppEnquiry;
import com.moola.app.ui.order.OrderRequestActivity;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.HashMap;
import java.util.Map;

public class ProductDetailActivity extends AppCompatActivity {

    private ImageView ivDetailProduct;
    private TextView tvDetailOrganicBadge;
    private TextView tvDetailCertifiedBadge;
    private TextView tvDetailCategory;
    private TextView tvDetailName;
    private TextView tvDetailPrice;
    private TextView tvDetailMrp;
    private TextView tvDetailUnit;
    private TextView tvQtyValue;
    private ImageButton btnQtyMinus;
    private ImageButton btnQtyPlus;
    private TextView tvDetailSellerShop;
    private TextView tvDetailSellerDesc;
    private TextView tvDetailDescription;
    private MaterialButton btnWhatsAppEnquiry;
    private MaterialButton btnOrderNow;
    private ProgressBar progressBarDetail;

    private Product product;
    private int quantity = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_product_detail);

        initViews();

        product = (Product) getIntent().getSerializableExtra("PRODUCT_OBJ");
        String productId = getIntent().getStringExtra("PRODUCT_ID");

        if (product != null) {
            bindProductData(product);
        } else if (productId != null) {
            fetchProductDetail(productId);
        }

        setupActions();
    }

    private void initViews() {
        findViewById(R.id.btnBack).setOnClickListener(v -> finish());
        ivDetailProduct = findViewById(R.id.ivDetailProduct);
        tvDetailOrganicBadge = findViewById(R.id.tvDetailOrganicBadge);
        tvDetailCertifiedBadge = findViewById(R.id.tvDetailCertifiedBadge);
        tvDetailCategory = findViewById(R.id.tvDetailCategory);
        tvDetailName = findViewById(R.id.tvDetailName);
        tvDetailPrice = findViewById(R.id.tvDetailPrice);
        tvDetailMrp = findViewById(R.id.tvDetailMrp);
        tvDetailUnit = findViewById(R.id.tvDetailUnit);
        tvQtyValue = findViewById(R.id.tvQtyValue);
        btnQtyMinus = findViewById(R.id.btnQtyMinus);
        btnQtyPlus = findViewById(R.id.btnQtyPlus);
        tvDetailSellerShop = findViewById(R.id.tvDetailSellerShop);
        tvDetailSellerDesc = findViewById(R.id.tvDetailSellerDesc);
        tvDetailDescription = findViewById(R.id.tvDetailDescription);
        btnWhatsAppEnquiry = findViewById(R.id.btnWhatsAppEnquiry);
        btnOrderNow = findViewById(R.id.btnOrderNow);
        progressBarDetail = findViewById(R.id.progressBarDetail);
    }

    private void bindProductData(Product p) {
        this.product = p;
        tvDetailName.setText(p.getTitle());
        tvDetailPrice.setText(p.getFormattedPrice());

        if (p.getMrp() > p.getPrice()) {
            tvDetailMrp.setText(p.getFormattedMrp());
            tvDetailMrp.setVisibility(View.VISIBLE);
            tvDetailMrp.setPaintFlags(tvDetailMrp.getPaintFlags() | android.graphics.Paint.STRIKE_THRU_TEXT_FLAG);
        } else {
            tvDetailMrp.setVisibility(View.GONE);
        }

        tvDetailUnit.setText(p.getUnit() != null ? "/ " + p.getUnit() : "");
        tvDetailCategory.setText(p.getCategoryName() != null ? p.getCategoryName().toUpperCase() : "HOMEMADE SPECIALTY");
        tvDetailDescription.setText(p.getDetailsDescription());

        tvDetailOrganicBadge.setVisibility(p.isOrganic() ? View.VISIBLE : View.GONE);
        tvDetailCertifiedBadge.setVisibility(p.isCertified() ? View.VISIBLE : View.GONE);

        String shop = p.getSellerShopName() != null ? p.getSellerShopName() :
                (p.getSellerName() != null ? p.getSellerName() : "Verified Artisan Maker");
        tvDetailSellerShop.setText(shop);

        String img = p.getThumbnailUrl();
        if ((img == null || img.isBlank()) && p.getImages() != null && !p.getImages().isEmpty()) {
            img = p.getImages().get(0);
        }

        if (img != null && !img.isBlank()) {
            Glide.with(this)
                    .load(img)
                    .placeholder(R.drawable.bg_hero_card)
                    .error(R.drawable.bg_hero_card)
                    .into(ivDetailProduct);
        }
    }

    private void fetchProductDetail(String productId) {
        progressBarDetail.setVisibility(View.VISIBLE);
        ApiClient.getService(this).getProductDetail(productId).enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
            @Override
            public void onResponse(Call<ApiResponse<Map<String, Object>>> call, Response<ApiResponse<Map<String, Object>>> response) {
                progressBarDetail.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    Map<String, Object> data = response.body().getData();
                    if (data != null && data.containsKey("product")) {
                        Gson gson = new Gson();
                        Product p = gson.fromJson(gson.toJson(data.get("product")), Product.class);
                        bindProductData(p);
                    }
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Map<String, Object>>> call, Throwable t) {
                progressBarDetail.setVisibility(View.GONE);
                Toast.makeText(ProductDetailActivity.this, "Unable to load product details.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void setupActions() {
        btnQtyMinus.setOnClickListener(v -> {
            if (quantity > 1) {
                quantity--;
                tvQtyValue.setText(String.valueOf(quantity));
            }
        });

        btnQtyPlus.setOnClickListener(v -> {
            quantity++;
            tvQtyValue.setText(String.valueOf(quantity));
        });

        btnWhatsAppEnquiry.setOnClickListener(v -> performWhatsAppEnquiry());

        btnOrderNow.setOnClickListener(v -> {
            if (product == null) return;
            Intent intent = new Intent(ProductDetailActivity.this, OrderRequestActivity.class);
            intent.putExtra("PRODUCT_OBJ", product);
            intent.putExtra("SELECTED_QTY", quantity);
            startActivity(intent);
        });
    }

    private void performWhatsAppEnquiry() {
        if (product == null) return;

        progressBarDetail.setVisibility(View.VISIBLE);
        Map<String, Object> body = new HashMap<>();
        body.put("productId", product.getId());
        body.put("quantity", quantity);

        ApiClient.getService(this).createEnquiry(body).enqueue(new Callback<ApiResponse<WhatsAppEnquiry>>() {
            @Override
            public void onResponse(Call<ApiResponse<WhatsAppEnquiry>> call, Response<ApiResponse<WhatsAppEnquiry>> response) {
                progressBarDetail.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    WhatsAppEnquiry enquiry = response.body().getData();
                    if (enquiry != null && enquiry.getClickToChatUrl() != null) {
                        try {
                            Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(enquiry.getClickToChatUrl()));
                            startActivity(browserIntent);
                        } catch (Exception e) {
                            Toast.makeText(ProductDetailActivity.this, "Opening WhatsApp enquiry...", Toast.LENGTH_SHORT).show();
                        }
                    }
                } else {
                    // Fallback to direct wa.me
                    openDirectWhatsApp();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<WhatsAppEnquiry>> call, Throwable t) {
                progressBarDetail.setVisibility(View.GONE);
                openDirectWhatsApp();
            }
        });
    }

    private void openDirectWhatsApp() {
        try {
            String phone = product.getSellerWhatsApp() != null ? product.getSellerWhatsApp().replaceAll("[^0-9]", "") : "919000000001";
            if (!phone.startsWith("91") && phone.length() == 10) phone = "91" + phone;
            String msg = Uri.encode("Namaskara, I am interested in " + product.getTitle() + " on MOOLA.");
            Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/" + phone + "?text=" + msg));
            startActivity(browserIntent);
        } catch (Exception e) {
            Toast.makeText(this, "Could not open WhatsApp", Toast.LENGTH_SHORT).show();
        }
    }
}
