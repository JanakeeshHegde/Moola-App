package com.moola.app.ui.seller;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.GridLayoutManager;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.Product;
import com.moola.app.data.model.SellerProfile;
import com.moola.app.data.model.SellerShop;
import com.moola.app.data.storage.SessionManager;
import com.moola.app.databinding.ActivitySellerShopBinding;
import com.moola.app.ui.auth.LoginActivity;
import com.moola.app.ui.chat.ChatActivity;
import com.moola.app.ui.home.ProductAdapter;
import com.moola.app.ui.product.ProductDetailActivity;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.ArrayList;
import java.util.Map;

public class SellerShopActivity extends AppCompatActivity {

    public static final String EXTRA_SELLER_ID = "extra_seller_id";
    public static final String EXTRA_SELLER_NAME = "extra_seller_name";

    private ActivitySellerShopBinding binding;
    private String sellerId;
    private String sellerName;
    private String sellerWhatsApp;
    private boolean isFollowing = false;
    private ProductAdapter productAdapter;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivitySellerShopBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        sellerId = getIntent().getStringExtra(EXTRA_SELLER_ID);
        sellerName = getIntent().getStringExtra(EXTRA_SELLER_NAME);

        if (sellerId == null || sellerId.isBlank()) {
            Toast.makeText(this, "Maker ID is required", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        binding.toolbarSellerShop.setNavigationOnClickListener(v -> finish());

        productAdapter = new ProductAdapter(product -> {
            Intent intent = new Intent(this, ProductDetailActivity.class);
            intent.putExtra("PRODUCT_OBJ", product);
            intent.putExtra("PRODUCT_ID", product.getId());
            startActivity(intent);
        });

        binding.rvShopProducts.setLayoutManager(new GridLayoutManager(this, 2));
        binding.rvShopProducts.setAdapter(productAdapter);

        binding.btnShopFollow.setOnClickListener(v -> handleFollowToggle());
        binding.btnShopChat.setOnClickListener(v -> handleChatWithMaker());
        binding.btnShopShare.setOnClickListener(v -> handleShareShop());

        loadSellerShop();
    }

    private SellerShop currentShop;

    private void loadSellerShop() {
        binding.pbShop.setVisibility(View.VISIBLE);
        ApiClient.getService(this).getSellerShop(sellerId).enqueue(new Callback<ApiResponse<SellerShop>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<SellerShop>> call, @NonNull Response<ApiResponse<SellerShop>> response) {
                binding.pbShop.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    currentShop = response.body().getData();
                    bindShopData(currentShop);
                } else {
                    Toast.makeText(SellerShopActivity.this, "Could not load maker shop", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<SellerShop>> call, @NonNull Throwable t) {
                binding.pbShop.setVisibility(View.GONE);
                Toast.makeText(SellerShopActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void bindShopData(SellerShop shop) {
        if (shop == null) return;
        this.currentShop = shop;

        SellerProfile profile = shop.getProfile();
        sellerName = shop.getSellerName() != null ? shop.getSellerName() : "Artisan Maker";
        String shopName = (profile != null && profile.getShopName() != null) ? profile.getShopName() : sellerName + "'s Kitchen";
        String desc = (profile != null && profile.getDescription() != null) ? profile.getDescription() : "Authentic regional homemade delicacies prepared fresh upon order placement.";
        String slug = (shop.getPublicProfile() != null && shop.getPublicProfile().getSlug() != null)
                ? shop.getPublicProfile().getSlug()
                : "@" + shopName.toLowerCase().replaceAll("[^a-z0-9]", "");

        binding.tvShopName.setText(shopName);
        binding.tvShopMakerName.setText(sellerName + " • " + slug);
        binding.tvShopDescription.setText(desc);
        double rating = (profile != null && profile.getAverageRating() > 0) ? profile.getAverageRating() : 4.8;
        binding.tvShopFollowersCount.setText(shop.getFollowerCount() + " Followers • ★ " + String.format("%.1f", rating));

        isFollowing = shop.isFollowing();
        updateFollowButtonState();

        if (shop.getProducts() != null && !shop.getProducts().isEmpty()) {
            binding.tvEmptyProducts.setVisibility(View.GONE);
            productAdapter.setProducts(shop.getProducts());
        } else {
            binding.tvEmptyProducts.setVisibility(View.VISIBLE);
        }
    }

    private void updateFollowButtonState() {
        if (isFollowing) {
            binding.btnShopFollow.setText("✓ Following");
            binding.btnShopFollow.setBackgroundColor(getColor(com.moola.app.R.color.moola_cream));
            binding.btnShopFollow.setTextColor(getColor(com.moola.app.R.color.moola_forest_green));
        } else {
            binding.btnShopFollow.setText("+ Follow Maker");
            binding.btnShopFollow.setBackgroundColor(getColor(com.moola.app.R.color.moola_forest_green));
            binding.btnShopFollow.setTextColor(getColor(com.moola.app.R.color.moola_white));
        }
    }

    private void handleFollowToggle() {
        SessionManager session = SessionManager.getInstance(this);
        if (!session.isLoggedIn()) {
            Toast.makeText(this, "Please log in to follow artisanal makers", Toast.LENGTH_SHORT).show();
            startActivity(new Intent(this, LoginActivity.class));
            return;
        }

        binding.btnShopFollow.setEnabled(false);
        if (isFollowing) {
            ApiClient.getService(this).unfollowSellerPost(sellerId).enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
                @Override
                public void onResponse(@NonNull Call<ApiResponse<Map<String, Object>>> call, @NonNull Response<ApiResponse<Map<String, Object>>> response) {
                    binding.btnShopFollow.setEnabled(true);
                    if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                        isFollowing = false;
                        updateFollowButtonState();
                        Object cnt = response.body().getData() != null ? response.body().getData().get("followerCount") : null;
                        if (cnt != null) {
                            binding.tvShopFollowersCount.setText(cnt + " Followers • Handcrafted Kitchen");
                        }
                        Toast.makeText(SellerShopActivity.this, "Unfollowed " + sellerName, Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(@NonNull Call<ApiResponse<Map<String, Object>>> call, @NonNull Throwable t) {
                    binding.btnShopFollow.setEnabled(true);
                    Toast.makeText(SellerShopActivity.this, "Failed to unfollow", Toast.LENGTH_SHORT).show();
                }
            });
        } else {
            ApiClient.getService(this).followSeller(sellerId).enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
                @Override
                public void onResponse(@NonNull Call<ApiResponse<Map<String, Object>>> call, @NonNull Response<ApiResponse<Map<String, Object>>> response) {
                    binding.btnShopFollow.setEnabled(true);
                    if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                        isFollowing = true;
                        updateFollowButtonState();
                        Object cnt = response.body().getData() != null ? response.body().getData().get("followerCount") : null;
                        if (cnt != null) {
                            binding.tvShopFollowersCount.setText(cnt + " Followers • Handcrafted Kitchen");
                        }
                        Toast.makeText(SellerShopActivity.this, "Following " + sellerName + "! You will receive batch notifications.", Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(@NonNull Call<ApiResponse<Map<String, Object>>> call, @NonNull Throwable t) {
                    binding.btnShopFollow.setEnabled(true);
                    Toast.makeText(SellerShopActivity.this, "Failed to follow maker", Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    private void handleChatWithMaker() {
        Intent intent = new Intent(this, com.moola.app.ui.chat.ChatActivity.class);
        intent.putExtra(com.moola.app.ui.chat.ChatActivity.EXTRA_OTHER_USER_ID, sellerId);
        intent.putExtra(com.moola.app.ui.chat.ChatActivity.EXTRA_PARTNER_NAME, sellerName != null ? sellerName : "Artisan Maker");
        intent.putExtra(com.moola.app.ui.chat.ChatActivity.EXTRA_CONTEXT_TITLE, "🏪 Shop: " + (sellerName != null ? sellerName : "Maker"));
        startActivity(intent);
    }

    private void handleShareShop() {
        String url = (currentShop != null && currentShop.getShareUrl() != null)
                ? currentShop.getShareUrl()
                : "https://moola.market/shop?id=" + sellerId;
        Intent shareIntent = new Intent(Intent.ACTION_SEND);
        shareIntent.setType("text/plain");
        shareIntent.putExtra(Intent.EXTRA_SUBJECT, "Visit " + sellerName + "'s Kitchen on MOOLA");
        shareIntent.putExtra(Intent.EXTRA_TEXT, "Discover authentic homemade food directly from " + sellerName + " on MOOLA: " + url);
        startActivity(Intent.createChooser(shareIntent, "Share Artisan Shop"));
    }
}
