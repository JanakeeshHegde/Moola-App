package com.moola.app.ui.complaint;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.moola.app.R;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.Complaint;
import com.moola.app.databinding.ActivityComplaintsBinding;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ComplaintsActivity extends AppCompatActivity {

    private ActivityComplaintsBinding binding;
    private ComplaintAdapter adapter;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityComplaintsBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.btnBackComplaints.setOnClickListener(v -> finish());
        binding.btnOpenSubmitTicket.setOnClickListener(v -> showFileTicketDialog());

        setupRecyclerView();
        loadComplaints();
    }

    private void setupRecyclerView() {
        adapter = new ComplaintAdapter();
        binding.rvComplaints.setLayoutManager(new LinearLayoutManager(this));
        binding.rvComplaints.setAdapter(adapter);
    }

    private void loadComplaints() {
        binding.pbComplaints.setVisibility(View.VISIBLE);
        ApiClient.getService(this).getMyComplaints().enqueue(new Callback<ApiResponse<List<Complaint>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<Complaint>>> call, @NonNull Response<ApiResponse<List<Complaint>>> response) {
                binding.pbComplaints.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    List<Complaint> list = response.body().getData();
                    if (list != null && !list.isEmpty()) {
                        adapter.setComplaints(list);
                        binding.rvComplaints.setVisibility(View.VISIBLE);
                        binding.tvEmptyComplaints.setVisibility(View.GONE);
                    } else {
                        binding.rvComplaints.setVisibility(View.GONE);
                        binding.tvEmptyComplaints.setVisibility(View.VISIBLE);
                    }
                } else {
                    binding.rvComplaints.setVisibility(View.GONE);
                    binding.tvEmptyComplaints.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<Complaint>>> call, @NonNull Throwable t) {
                binding.pbComplaints.setVisibility(View.GONE);
                Toast.makeText(ComplaintsActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showFileTicketDialog() {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_simple_input, null, false);
        EditText etInput = dialogView.findViewById(R.id.etDialogInput);
        etInput.setHint("Subject & issue details (e.g. Package damaged in transit)");

        new MaterialAlertDialogBuilder(this)
                .setTitle("File Customer Care Ticket")
                .setMessage("Submit your issue. Our team reviews tickets against a 48-hour SLA target. For urgent matters, call Line 1: +91 80886 53820.")
                .setView(dialogView)
                .setPositiveButton("Submit Ticket", (dialog, which) -> {
                    String text = etInput.getText().toString().trim();
                    if (text.isEmpty()) {
                        Toast.makeText(this, "Please describe your concern", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    Map<String, Object> body = new HashMap<>();
                    body.put("category", "delivery_delay");
                    body.put("subject", text.length() > 30 ? text.substring(0, 30) : text);
                    body.put("description", text);

                    ApiClient.getService(this).submitComplaint(body).enqueue(new Callback<ApiResponse<Complaint>>() {
                        @Override
                        public void onResponse(@NonNull Call<ApiResponse<Complaint>> call, @NonNull Response<ApiResponse<Complaint>> response) {
                            if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                Toast.makeText(ComplaintsActivity.this, "Ticket filed: " + response.body().getData().getTicketId(), Toast.LENGTH_LONG).show();
                                loadComplaints();
                            } else {
                                Toast.makeText(ComplaintsActivity.this, "Could not submit ticket", Toast.LENGTH_SHORT).show();
                            }
                        }

                        @Override
                        public void onFailure(@NonNull Call<ApiResponse<Complaint>> call, @NonNull Throwable t) {
                            Toast.makeText(ComplaintsActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                    });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }
}
