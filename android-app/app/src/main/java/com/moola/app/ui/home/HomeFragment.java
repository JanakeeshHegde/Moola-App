package com.moola.app.ui.home;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.moola.app.R;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.Category;
import com.moola.app.data.model.Product;
import com.moola.app.ui.chat.ConversationsActivity;
import com.moola.app.ui.product.ProductDetailActivity;
import com.moola.app.ui.request.CustomRequestsActivity;
import com.moola.app.ui.search.SearchActivity;
import com.moola.app.ui.seasonal.SeasonalHubActivity;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class HomeFragment extends Fragment implements CategoryAdapter.OnCategoryClickListener, ProductAdapter.OnProductClickListener {

    private SwipeRefreshLayout swipeRefreshLayout;
    private RecyclerView rvSellers;
    private ProgressBar pbSellers;
    private RecyclerView rvCategories;
    private RecyclerView rvFeaturedProducts;
    private RecyclerView rvNewArrivals;
    private ProgressBar pbFeatured;

    private SellerCardAdapter sellerCardAdapter;
    private CategoryAdapter categoryAdapter;
    private ProductAdapter featuredAdapter;
    private ProductAdapter newArrivalsAdapter;

    private final Gson gson = new Gson();

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_home, container, false);

        swipeRefreshLayout = view.findViewById(R.id.swipeRefreshLayout);
        rvSellers = view.findViewById(R.id.rvSellers);
        pbSellers = view.findViewById(R.id.pbSellers);
        rvCategories = view.findViewById(R.id.rvCategories);
        rvFeaturedProducts = view.findViewById(R.id.rvFeaturedProducts);
        rvNewArrivals = view.findViewById(R.id.rvNewArrivals);
        pbFeatured = view.findViewById(R.id.pbFeatured);

        setupRecyclerViews();

        view.findViewById(R.id.tvViewAllSellers).setOnClickListener(v -> {
            Intent intent = new Intent(getActivity(), SearchActivity.class);
            intent.putExtra("SEARCH_MODE", "MAKERS");
            startActivity(intent);
        });

        // Search bar entry
        view.findViewById(R.id.searchEntryBar).setOnClickListener(v -> {
            startActivity(new Intent(getActivity(), SearchActivity.class));
        });

        // Hero CTA button
        view.findViewById(R.id.btnHeroCta).setOnClickListener(v -> {
            startActivity(new Intent(getActivity(), SearchActivity.class));
        });

        // View all featured
        view.findViewById(R.id.tvViewAllFeatured).setOnClickListener(v -> {
            startActivity(new Intent(getActivity(), SearchActivity.class));
        });

        // Notifications button
        viewNotificationBadge = view.findViewById(R.id.viewNotificationBadge);
        view.findViewById(R.id.btnHeaderNotifications).setOnClickListener(v -> {
            startActivity(new Intent(getActivity(), com.moola.app.ui.notification.NotificationsActivity.class));
        });

        // Messages button
        viewChatBadge = view.findViewById(R.id.viewChatBadge);
        view.findViewById(R.id.btnHeaderMessages).setOnClickListener(v -> {
            startActivity(new Intent(getActivity(), ConversationsActivity.class));
        });

        // Seasonal Hub button
        view.findViewById(R.id.btnOpenSeasonalHub).setOnClickListener(v -> {
            startActivity(new Intent(getActivity(), SeasonalHubActivity.class));
        });

        // Custom Requests button
        view.findViewById(R.id.btnOpenCustomRequests).setOnClickListener(v -> {
            startActivity(new Intent(getActivity(), CustomRequestsActivity.class));
        });

        // Profile avatar
        view.findViewById(R.id.btnHeaderProfile).setOnClickListener(v -> {
            if (getActivity() != null) {
                View bottomNav = getActivity().findViewById(R.id.bottomNavigationView);
                if (bottomNav instanceof com.google.android.material.bottomnavigation.BottomNavigationView) {
                    ((com.google.android.material.bottomnavigation.BottomNavigationView) bottomNav).setSelectedItemId(R.id.nav_profile);
                }
            }
        });

        swipeRefreshLayout.setColorSchemeResources(R.color.moola_forest_green, R.color.moola_terracotta);
        swipeRefreshLayout.setOnRefreshListener(this::loadHomeData);

        loadHomeData();
        loadUnreadBadges();

        return view;
    }

    private View viewNotificationBadge;
    private View viewChatBadge;

    @Override
    public void onResume() {
        super.onResume();
        loadUnreadBadges();
    }

    private void loadUnreadBadges() {
        if (getContext() == null) return;
        ApiClient.getService(getContext()).getUnreadNotificationCount().enqueue(new Callback<ApiResponse<Map<String, Long>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<Map<String, Long>>> call, @NonNull Response<ApiResponse<Map<String, Long>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    Long count = response.body().getData().get("unreadCount");
                    if (viewNotificationBadge != null) {
                        viewNotificationBadge.setVisibility(count != null && count > 0 ? View.VISIBLE : View.GONE);
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Map<String, Long>>> call, @NonNull Throwable t) {}
        });

        ApiClient.getService(getContext()).getUnreadChatCount().enqueue(new Callback<ApiResponse<Map<String, Long>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<Map<String, Long>>> call, @NonNull Response<ApiResponse<Map<String, Long>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    Long count = response.body().getData().get("unreadCount");
                    if (viewChatBadge != null) {
                        viewChatBadge.setVisibility(count != null && count > 0 ? View.VISIBLE : View.GONE);
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Map<String, Long>>> call, @NonNull Throwable t) {}
        });
    }

    private void setupRecyclerViews() {
        // 0. Primary Profile Discovery: Artisan Makers
        rvSellers.setLayoutManager(new LinearLayoutManager(getContext(), LinearLayoutManager.HORIZONTAL, false));
        sellerCardAdapter = new SellerCardAdapter(seller -> {
            Intent intent = new Intent(getActivity(), com.moola.app.ui.seller.SellerShopActivity.class);
            intent.putExtra(com.moola.app.ui.seller.SellerShopActivity.EXTRA_SELLER_ID, seller.getSellerId());
            intent.putExtra(com.moola.app.ui.seller.SellerShopActivity.EXTRA_SELLER_NAME, seller.getShopName());
            startActivity(intent);
        });
        rvSellers.setAdapter(sellerCardAdapter);

        // Categories horizontal
        rvCategories.setLayoutManager(new LinearLayoutManager(getContext(), LinearLayoutManager.HORIZONTAL, false));
        categoryAdapter = new CategoryAdapter(this);
        rvCategories.setAdapter(categoryAdapter);

        // Featured horizontal
        rvFeaturedProducts.setLayoutManager(new LinearLayoutManager(getContext(), LinearLayoutManager.HORIZONTAL, false));
        featuredAdapter = new ProductAdapter(this);
        rvFeaturedProducts.setAdapter(featuredAdapter);

        // New Arrivals grid (2 columns)
        rvNewArrivals.setLayoutManager(new GridLayoutManager(getContext(), 2));
        newArrivalsAdapter = new ProductAdapter(this);
        rvNewArrivals.setAdapter(newArrivalsAdapter);
    }

    private void loadHomeData() {
        if (getContext() == null) return;
        pbFeatured.setVisibility(View.VISIBLE);

        // 0. Primary Discovery: Load Artisan Makers & Kitchens
        pbSellers.setVisibility(View.VISIBLE);
        ApiClient.getService(getContext()).getPublicSellers(null)
                .enqueue(new Callback<ApiResponse<List<com.moola.app.data.model.PublicSellerProfile>>>() {
                    @Override
                    public void onResponse(@NonNull Call<ApiResponse<List<com.moola.app.data.model.PublicSellerProfile>>> call,
                                           @NonNull Response<ApiResponse<List<com.moola.app.data.model.PublicSellerProfile>>> response) {
                        pbSellers.setVisibility(View.GONE);
                        if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                            sellerCardAdapter.setSellers(response.body().getData());
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<ApiResponse<List<com.moola.app.data.model.PublicSellerProfile>>> call, @NonNull Throwable t) {
                        pbSellers.setVisibility(View.GONE);
                    }
                });

        // 1. Load Categories
        ApiClient.getService(getContext()).getCategories().enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
            @Override
            public void onResponse(Call<ApiResponse<Map<String, Object>>> call, Response<ApiResponse<Map<String, Object>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    Map<String, Object> data = response.body().getData();
                    if (data != null && data.containsKey("categories")) {
                        String json = gson.toJson(data.get("categories"));
                        Type type = new TypeToken<List<Category>>() {}.getType();
                        List<Category> categories = gson.fromJson(json, type);
                        categoryAdapter.setCategories(categories);
                    }
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Map<String, Object>>> call, Throwable t) {
                // Graceful fallback
            }
        });

        // 2. Load Products
        ApiClient.getService(getContext()).getProducts(null, null, null, null, null, "newest")
                .enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
                    @Override
                    public void onResponse(Call<ApiResponse<Map<String, Object>>> call, Response<ApiResponse<Map<String, Object>>> response) {
                        pbFeatured.setVisibility(View.GONE);
                        swipeRefreshLayout.setRefreshing(false);

                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            Map<String, Object> data = response.body().getData();
                            if (data != null && data.containsKey("data")) {
                                String json = gson.toJson(data.get("data"));
                                Type type = new TypeToken<List<Product>>() {}.getType();
                                List<Product> products = gson.fromJson(json, type);

                                if (products != null) {
                                    // Featured (top items)
                                    featuredAdapter.setProducts(products);

                                    // New arrivals
                                    newArrivalsAdapter.setProducts(products);
                                }
                            }
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiResponse<Map<String, Object>>> call, Throwable t) {
                        pbFeatured.setVisibility(View.GONE);
                        swipeRefreshLayout.setRefreshing(false);
                        if (getContext() != null) {
                            Toast.makeText(getContext(), "Unable to fetch latest products. Pull to retry.", Toast.LENGTH_SHORT).show();
                        }
                    }
                });
    }

    @Override
    public void onCategoryClick(Category category) {
        Intent intent = new Intent(getActivity(), SearchActivity.class);
        intent.putExtra("CATEGORY_ID", category.getId());
        intent.putExtra("CATEGORY_NAME", category.getDisplayName());
        startActivity(intent);
    }

    @Override
    public void onProductClick(Product product) {
        Intent intent = new Intent(getActivity(), ProductDetailActivity.class);
        intent.putExtra("PRODUCT_ID", product.getId());
        intent.putExtra("PRODUCT_OBJ", product);
        startActivity(intent);
    }
}
