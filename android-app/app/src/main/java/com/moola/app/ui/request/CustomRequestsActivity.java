package com.moola.app.ui.request;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.moola.app.R;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.CustomRequest;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.List;

public class CustomRequestsActivity extends AppCompatActivity {

    private ProgressBar pbRequests;
    private RecyclerView rvCustomRequests;
    private View emptyState;
    private CustomRequestAdapter adapter;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_custom_requests);

        findViewById(R.id.btnBackRequests).setOnClickListener(v -> finish());

        findViewById(R.id.btnNewRequestTop).setOnClickListener(v -> {
            startActivity(new Intent(this, NewCustomRequestActivity.class));
        });

        findViewById(R.id.btnEmptyNewRequest).setOnClickListener(v -> {
            startActivity(new Intent(this, NewCustomRequestActivity.class));
        });

        pbRequests = findViewById(R.id.pbRequests);
        rvCustomRequests = findViewById(R.id.rvCustomRequests);
        emptyState = findViewById(R.id.emptyRequestsState);

        setupRecyclerView();
    }

    private void setupRecyclerView() {
        adapter = new CustomRequestAdapter(request -> {
            Intent intent = new Intent(this, CustomRequestDetailActivity.class);
            intent.putExtra("requestId", request.getId());
            startActivity(intent);
        });

        rvCustomRequests.setLayoutManager(new LinearLayoutManager(this));
        rvCustomRequests.setAdapter(adapter);
    }

    private void loadRequests() {
        pbRequests.setVisibility(View.VISIBLE);

        ApiClient.getService(this).getMyCustomRequests().enqueue(new Callback<ApiResponse<List<CustomRequest>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<CustomRequest>>> call,
                                   @NonNull Response<ApiResponse<List<CustomRequest>>> response) {
                pbRequests.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    List<CustomRequest> list = response.body().getData();
                    adapter.setRequests(list);
                    if (list == null || list.isEmpty()) {
                        emptyState.setVisibility(View.VISIBLE);
                        rvCustomRequests.setVisibility(View.GONE);
                    } else {
                        emptyState.setVisibility(View.GONE);
                        rvCustomRequests.setVisibility(View.VISIBLE);
                    }
                } else {
                    Toast.makeText(CustomRequestsActivity.this, "Could not load requests", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<CustomRequest>>> call, @NonNull Throwable t) {
                pbRequests.setVisibility(View.GONE);
                Toast.makeText(CustomRequestsActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadRequests();
    }
}
