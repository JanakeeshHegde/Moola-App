package com.moola.app.ui.order;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.storage.SessionManager;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.Order;
import com.moola.app.databinding.FragmentOrdersBinding;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.List;

public class OrdersFragment extends Fragment {

    private FragmentOrdersBinding binding;
    private OrderAdapter adapter;
    private SessionManager sessionManager;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentOrdersBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        sessionManager = new SessionManager(requireContext());
        setupRecyclerView();

        binding.swipeRefreshOrders.setOnRefreshListener(this::loadOrders);
        loadOrders();
    }

    private void setupRecyclerView() {
        adapter = new OrderAdapter(order -> {
            Intent intent = new Intent(requireContext(), OrderDetailActivity.class);
            intent.putExtra("orderId", order.getId());
            startActivity(intent);
        });

        binding.rvOrders.setLayoutManager(new LinearLayoutManager(requireContext()));
        binding.rvOrders.setAdapter(adapter);
    }

    private void loadOrders() {
        binding.btnRetryOrders.setOnClickListener(v -> loadOrders());

        if (!sessionManager.isLoggedIn()) {
            binding.rvOrders.setVisibility(View.GONE);
            binding.ordersEmptyView.setVisibility(View.GONE);
            binding.ordersErrorView.setVisibility(View.VISIBLE);
            binding.tvOrdersErrorTitle.setText("Authentication Required");
            binding.tvOrdersErrorMessage.setText("Please sign in with your customer account to view your order history.");
            binding.btnRetryOrders.setText("Sign In");
            binding.btnRetryOrders.setOnClickListener(v -> {
                startActivity(new Intent(requireContext(), com.moola.app.ui.auth.LoginActivity.class));
            });
            binding.swipeRefreshOrders.setRefreshing(false);
            return;
        }

        binding.pbOrders.setVisibility(View.VISIBLE);
        binding.ordersErrorView.setVisibility(View.GONE);

        ApiClient.getService(requireContext()).getBuyerOrders().enqueue(new Callback<ApiResponse<List<Order>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<Order>>> call, @NonNull Response<ApiResponse<List<Order>>> response) {
                if (!isAdded()) return;
                binding.pbOrders.setVisibility(View.GONE);
                binding.swipeRefreshOrders.setRefreshing(false);

                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    List<Order> orders = response.body().getData();
                    binding.ordersErrorView.setVisibility(View.GONE);
                    if (orders != null && !orders.isEmpty()) {
                        adapter.setOrders(orders);
                        binding.rvOrders.setVisibility(View.VISIBLE);
                        binding.ordersEmptyView.setVisibility(View.GONE);
                    } else {
                        binding.rvOrders.setVisibility(View.GONE);
                        binding.ordersEmptyView.setVisibility(View.VISIBLE);
                    }
                } else {
                    binding.rvOrders.setVisibility(View.GONE);
                    binding.ordersEmptyView.setVisibility(View.GONE);
                    binding.ordersErrorView.setVisibility(View.VISIBLE);
                    String msg;
                    if (response.code() == 401) {
                        msg = "Your session has expired. Please log in again.";
                        binding.btnRetryOrders.setText("Log In");
                        binding.btnRetryOrders.setOnClickListener(v -> {
                            sessionManager.clear();
                            startActivity(new Intent(requireContext(), com.moola.app.ui.auth.LoginActivity.class));
                        });
                    } else if (response.code() == 403) {
                        msg = "Access restricted for this user role.";
                        binding.btnRetryOrders.setText("Retry");
                    } else {
                        msg = "Server error (HTTP " + response.code() + "). Please try again shortly.";
                        binding.btnRetryOrders.setText("Retry");
                    }
                    binding.tvOrdersErrorTitle.setText("Could not load orders");
                    binding.tvOrdersErrorMessage.setText(msg);
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<Order>>> call, @NonNull Throwable t) {
                if (!isAdded()) return;
                binding.pbOrders.setVisibility(View.GONE);
                binding.swipeRefreshOrders.setRefreshing(false);
                binding.rvOrders.setVisibility(View.GONE);
                binding.ordersEmptyView.setVisibility(View.GONE);
                binding.ordersErrorView.setVisibility(View.VISIBLE);
                binding.tvOrdersErrorTitle.setText("Connection Unavailable");
                binding.tvOrdersErrorMessage.setText("Could not reach MOOLA server (" + ApiClient.getBaseUrl(requireContext()) + "). Check Wi-Fi or emulator setup.");
                binding.btnRetryOrders.setText("Retry");
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        loadOrders();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
