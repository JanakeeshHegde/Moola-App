package com.moola.app.ui.search;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.chip.ChipGroup;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.moola.app.R;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.Product;
import com.moola.app.data.model.PublicSellerProfile;
import com.moola.app.ui.home.ProductAdapter;
import com.moola.app.ui.product.ProductDetailActivity;
import com.moola.app.ui.seller.SellerShopActivity;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

public class SearchActivity extends AppCompatActivity implements ProductAdapter.OnProductClickListener, SellerRowAdapter.OnSellerClickListener {

    private EditText etSearchQuery;
    private ChipGroup chipGroupCategories;
    private RecyclerView rvSearchResults;
    private ProgressBar pbSearch;
    private View emptyStateView;
    private TextView tvEmptyMessage;

    private ProductAdapter productAdapter;
    private SellerRowAdapter sellerRowAdapter;

    private String selectedCategory = null;
    private Boolean isOrganicFilter = null;
    private boolean isMakersMode = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_search);

        findViewById(R.id.btnSearchBack).setOnClickListener(v -> finish());
        etSearchQuery = findViewById(R.id.etSearchQuery);
        chipGroupCategories = findViewById(R.id.chipGroupCategories);
        rvSearchResults = findViewById(R.id.rvSearchResults);
        pbSearch = findViewById(R.id.pbSearch);
        emptyStateView = findViewById(R.id.emptyStateView);
        tvEmptyMessage = findViewById(R.id.tvEmptyMessage);

        findViewById(R.id.btnResetSearch).setOnClickListener(v -> {
            etSearchQuery.setText("");
            chipGroupCategories.check(R.id.chipAll);
            selectedCategory = null;
            isOrganicFilter = null;
            isMakersMode = false;
            executeSearch();
        });

        productAdapter = new ProductAdapter(this);
        sellerRowAdapter = new SellerRowAdapter(this);

        // Pre-selection from intent
        String searchMode = getIntent().getStringExtra("SEARCH_MODE");
        if ("MAKERS".equalsIgnoreCase(searchMode)) {
            isMakersMode = true;
            chipGroupCategories.check(R.id.chipMakers);
        } else {
            String initialCat = getIntent().getStringExtra("CATEGORY_ID");
            if (initialCat != null) {
                selectedCategory = initialCat;
            }
        }

        setupFilters();

        etSearchQuery.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {}
            @Override
            public void afterTextChanged(Editable s) {
                executeSearch();
            }
        });

        executeSearch();
    }

    private void setupFilters() {
        chipGroupCategories.setOnCheckedStateChangeListener((group, checkedIds) -> {
            if (checkedIds.isEmpty()) return;
            int id = checkedIds.get(0);

            if (id == R.id.chipMakers) {
                isMakersMode = true;
                selectedCategory = null;
                isOrganicFilter = null;
            } else if (id == R.id.chipAll) {
                isMakersMode = false;
                selectedCategory = null;
                isOrganicFilter = null;
            } else if (id == R.id.chipChips) {
                isMakersMode = false;
                selectedCategory = "chips";
                isOrganicFilter = null;
            } else if (id == R.id.chipHoney) {
                isMakersMode = false;
                selectedCategory = "honey";
                isOrganicFilter = null;
            } else if (id == R.id.chipPickles) {
                isMakersMode = false;
                selectedCategory = "pickles";
                isOrganicFilter = null;
            } else if (id == R.id.chipSpices) {
                isMakersMode = false;
                selectedCategory = "spices";
                isOrganicFilter = null;
            } else if (id == R.id.chipOrganicOnly) {
                isMakersMode = false;
                selectedCategory = null;
                isOrganicFilter = true;
            }
            executeSearch();
        });
    }

    private void executeSearch() {
        String query = etSearchQuery.getText() != null ? etSearchQuery.getText().toString().trim() : null;
        if (query != null && query.isEmpty()) query = null;

        pbSearch.setVisibility(View.VISIBLE);
        emptyStateView.setVisibility(View.GONE);

        if (isMakersMode) {
            rvSearchResults.setLayoutManager(new LinearLayoutManager(this));
            rvSearchResults.setAdapter(sellerRowAdapter);

            ApiClient.getService(this).getPublicSellers(query).enqueue(new Callback<ApiResponse<List<PublicSellerProfile>>>() {
                @Override
                public void onResponse(@NonNull Call<ApiResponse<List<PublicSellerProfile>>> call, @NonNull Response<ApiResponse<List<PublicSellerProfile>>> response) {
                    pbSearch.setVisibility(View.GONE);
                    if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                        List<PublicSellerProfile> list = response.body().getData();
                        if (list != null && !list.isEmpty()) {
                            sellerRowAdapter.setSellers(list);
                            emptyStateView.setVisibility(View.GONE);
                            rvSearchResults.setVisibility(View.VISIBLE);
                        } else {
                            sellerRowAdapter.setSellers(null);
                            rvSearchResults.setVisibility(View.GONE);
                            emptyStateView.setVisibility(View.VISIBLE);
                            tvEmptyMessage.setText("No artisan makers found matching your search.");
                        }
                    } else {
                        pbSearch.setVisibility(View.GONE);
                        emptyStateView.setVisibility(View.VISIBLE);
                        tvEmptyMessage.setText("Unable to load artisan makers. Please check your connection.");
                    }
                }

                @Override
                public void onFailure(@NonNull Call<ApiResponse<List<PublicSellerProfile>>> call, @NonNull Throwable t) {
                    pbSearch.setVisibility(View.GONE);
                    emptyStateView.setVisibility(View.VISIBLE);
                    tvEmptyMessage.setText("Network error: Unable to reach server.");
                }
            });
        } else {
            rvSearchResults.setLayoutManager(new GridLayoutManager(this, 2));
            rvSearchResults.setAdapter(productAdapter);

            ApiClient.getService(this).getProducts(query, selectedCategory, null, null, isOrganicFilter, "newest")
                    .enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
                        @Override
                        public void onResponse(@NonNull Call<ApiResponse<Map<String, Object>>> call, @NonNull Response<ApiResponse<Map<String, Object>>> response) {
                            pbSearch.setVisibility(View.GONE);
                            if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                Map<String, Object> data = response.body().getData();
                                if (data != null && data.containsKey("data")) {
                                    Gson gson = new Gson();
                                    Type type = new TypeToken<List<Product>>() {}.getType();
                                    List<Product> list = gson.fromJson(gson.toJson(data.get("data")), type);

                                    if (list != null && !list.isEmpty()) {
                                        productAdapter.setProducts(list);
                                        emptyStateView.setVisibility(View.GONE);
                                        rvSearchResults.setVisibility(View.VISIBLE);
                                    } else {
                                        productAdapter.setProducts(null);
                                        rvSearchResults.setVisibility(View.GONE);
                                        emptyStateView.setVisibility(View.VISIBLE);
                                        tvEmptyMessage.setText("No homemade foods match your search.");
                                    }
                                }
                            } else {
                                pbSearch.setVisibility(View.GONE);
                                emptyStateView.setVisibility(View.VISIBLE);
                                tvEmptyMessage.setText("Unable to load search results.");
                            }
                        }

                        @Override
                        public void onFailure(@NonNull Call<ApiResponse<Map<String, Object>>> call, @NonNull Throwable t) {
                            pbSearch.setVisibility(View.GONE);
                            emptyStateView.setVisibility(View.VISIBLE);
                            tvEmptyMessage.setText("Network error: Unable to reach server.");
                        }
                    });
        }
    }

    @Override
    public void onProductClick(Product product) {
        Intent intent = new Intent(this, ProductDetailActivity.class);
        intent.putExtra("PRODUCT_ID", product.getId());
        intent.putExtra("PRODUCT_OBJ", product);
        startActivity(intent);
    }

    @Override
    public void onSellerClick(PublicSellerProfile seller) {
        Intent intent = new Intent(this, SellerShopActivity.class);
        intent.putExtra(SellerShopActivity.EXTRA_SELLER_ID, seller.getSellerId());
        intent.putExtra(SellerShopActivity.EXTRA_SELLER_NAME, seller.getShopName());
        startActivity(intent);
    }
}
