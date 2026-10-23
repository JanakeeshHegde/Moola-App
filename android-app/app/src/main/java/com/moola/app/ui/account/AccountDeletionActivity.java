package com.moola.app.ui.account;

import android.os.Bundle;
import android.view.View;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.model.AccountDeletionRequest;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.databinding.ActivityAccountDeletionBinding;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.HashMap;
import java.util.Map;

public class AccountDeletionActivity extends AppCompatActivity {

    private ActivityAccountDeletionBinding binding;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityAccountDeletionBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.btnBackDeletion.setOnClickListener(v -> finish());
        binding.btnSubmitDeletion.setOnClickListener(v -> confirmAndSubmitDeletion());

        checkExistingRequest();
    }

    private void checkExistingRequest() {
        ApiClient.getService(this).getMyDeletionStatus().enqueue(new Callback<ApiResponse<AccountDeletionRequest>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<AccountDeletionRequest>> call, @NonNull Response<ApiResponse<AccountDeletionRequest>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    AccountDeletionRequest req = response.body().getData();
                    if (req != null) {
                        binding.tvDeletionStatusNotice.setText("You have an active request: STATUS = " + req.getStatus() + "\nSubmitted on: " + req.getCreatedAt());
                        binding.tvDeletionStatusNotice.setVisibility(View.VISIBLE);
                        binding.btnSubmitDeletion.setEnabled(false);
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<AccountDeletionRequest>> call, @NonNull Throwable t) {
                // Ignore silent failure
            }
        });
    }

    private void confirmAndSubmitDeletion() {
        String reason = binding.etDeletionReason.getText() != null ? binding.etDeletionReason.getText().toString().trim() : "";
        if (reason.isEmpty()) {
            binding.tilDeletionReason.setError("Please provide a reason for account deletion");
            return;
        } else {
            binding.tilDeletionReason.setError(null);
        }

        new MaterialAlertDialogBuilder(this)
                .setTitle("Permanently Delete Account?")
                .setMessage("Are you absolutely sure? This action will queue your account for permanent anonymization once active orders are fulfilled.")
                .setPositiveButton("Confirm Deletion", (dialog, which) -> executeDeletionRequest(reason))
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void executeDeletionRequest(String reason) {
        binding.pbDeletion.setVisibility(View.VISIBLE);
        binding.btnSubmitDeletion.setEnabled(false);

        Map<String, String> body = new HashMap<>();
        body.put("reason", reason);

        ApiClient.getService(this).requestAccountDeletion(body).enqueue(new Callback<ApiResponse<AccountDeletionRequest>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<AccountDeletionRequest>> call, @NonNull Response<ApiResponse<AccountDeletionRequest>> response) {
                binding.pbDeletion.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    Toast.makeText(AccountDeletionActivity.this, "Account deletion request submitted for processing", Toast.LENGTH_LONG).show();
                    checkExistingRequest();
                } else {
                    binding.btnSubmitDeletion.setEnabled(true);
                    String msg = response.body() != null ? response.body().getMessage() : "Request failed";
                    Toast.makeText(AccountDeletionActivity.this, msg, Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<AccountDeletionRequest>> call, @NonNull Throwable t) {
                binding.pbDeletion.setVisibility(View.GONE);
                binding.btnSubmitDeletion.setEnabled(true);
                Toast.makeText(AccountDeletionActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
