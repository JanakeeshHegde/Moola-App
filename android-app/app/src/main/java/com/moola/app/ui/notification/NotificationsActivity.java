package com.moola.app.ui.notification;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.Notification;
import com.moola.app.databinding.ActivityNotificationsBinding;
import com.moola.app.ui.chat.ChatActivity;
import com.moola.app.ui.order.OrderDetailActivity;
import com.moola.app.ui.product.ProductDetailActivity;
import com.moola.app.ui.request.CustomRequestDetailActivity;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.ArrayList;
import java.util.List;

public class NotificationsActivity extends AppCompatActivity {

    private ActivityNotificationsBinding binding;
    private NotificationAdapter adapter;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityNotificationsBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.btnBackNotifications.setOnClickListener(v -> finish());
        binding.btnMarkAllRead.setOnClickListener(v -> markAllAsRead());

        adapter = new NotificationAdapter(new ArrayList<>(), this::handleNotificationClick);
        binding.rvNotifications.setLayoutManager(new LinearLayoutManager(this));
        binding.rvNotifications.setAdapter(adapter);

        loadNotifications();
    }

    private void loadNotifications() {
        binding.pbNotifications.setVisibility(View.VISIBLE);
        ApiClient.getService(this).getNotifications().enqueue(new Callback<ApiResponse<List<Notification>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<Notification>>> call, @NonNull Response<ApiResponse<List<Notification>>> response) {
                binding.pbNotifications.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    List<Notification> list = response.body().getData();
                    if (list != null && !list.isEmpty()) {
                        binding.tvEmptyNotifications.setVisibility(View.GONE);
                        adapter.setNotifications(list);
                    } else {
                        binding.tvEmptyNotifications.setVisibility(View.VISIBLE);
                    }
                } else {
                    binding.tvEmptyNotifications.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<Notification>>> call, @NonNull Throwable t) {
                binding.pbNotifications.setVisibility(View.GONE);
                binding.tvEmptyNotifications.setVisibility(View.VISIBLE);
            }
        });
    }

    private void markAllAsRead() {
        ApiClient.getService(this).markAllNotificationsRead().enqueue(new Callback<ApiResponse<String>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<String>> call, @NonNull Response<ApiResponse<String>> response) {
                Toast.makeText(NotificationsActivity.this, "All notifications marked as read", Toast.LENGTH_SHORT).show();
                loadNotifications();
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<String>> call, @NonNull Throwable t) {
                Toast.makeText(NotificationsActivity.this, "Failed to update", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void handleNotificationClick(Notification notification) {
        if (!notification.isRead()) {
            ApiClient.getService(this).markNotificationRead(notification.getId()).enqueue(new Callback<ApiResponse<Notification>>() {
                @Override
                public void onResponse(@NonNull Call<ApiResponse<Notification>> call, @NonNull Response<ApiResponse<Notification>> response) {
                    notification.setRead(true);
                    adapter.notifyDataSetChanged();
                }

                @Override
                public void onFailure(@NonNull Call<ApiResponse<Notification>> call, @NonNull Throwable t) {}
            });
        }

        String refType = notification.getReferenceType();
        String refId = notification.getReferenceId();

        if (refId == null || refId.isBlank()) return;

        if ("ORDER".equals(refType)) {
            Intent intent = new Intent(this, OrderDetailActivity.class);
            intent.putExtra("extra_order_id", refId);
            startActivity(intent);
        } else if ("CUSTOM_REQUEST".equals(refType)) {
            Intent intent = new Intent(this, CustomRequestDetailActivity.class);
            intent.putExtra("extra_request_id", refId);
            startActivity(intent);
        } else if ("PRODUCT".equals(refType)) {
            Intent intent = new Intent(this, ProductDetailActivity.class);
            intent.putExtra("product_id", refId);
            startActivity(intent);
        } else if ("CHAT".equals(refType) || "CONVERSATION".equals(refType)) {
            Intent intent = new Intent(this, com.moola.app.ui.chat.ChatActivity.class);
            intent.putExtra(com.moola.app.ui.chat.ChatActivity.EXTRA_CONVERSATION_ID, refId);
            startActivity(intent);
        }
    }
}
