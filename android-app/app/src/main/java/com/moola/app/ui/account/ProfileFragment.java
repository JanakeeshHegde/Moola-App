package com.moola.app.ui.account;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.storage.SessionManager;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.User;
import com.moola.app.databinding.FragmentProfileBinding;
import com.moola.app.ui.admin.AdminDashboardActivity;
import com.moola.app.ui.auth.LoginActivity;
import com.moola.app.ui.complaint.ComplaintsActivity;
import com.moola.app.ui.seller.SellerDashboardActivity;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProfileFragment extends Fragment {

    private FragmentProfileBinding binding;
    private SessionManager sessionManager;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentProfileBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        sessionManager = new SessionManager(requireContext());

        renderStaticUserData();
        setupActions();
        refreshUserProfile();
    }

    private void renderStaticUserData() {
        String name = sessionManager.getUserName();
        String phone = sessionManager.getUserPhone();
        String role = sessionManager.getUserRole();

        if (name != null && !name.isBlank()) {
            binding.tvProfileName.setText(name);
            binding.tvProfileInitials.setText(String.valueOf(name.charAt(0)).toUpperCase());
        } else {
            binding.tvProfileName.setText("MOOLA Customer");
            binding.tvProfileInitials.setText("M");
        }

        binding.tvProfilePhone.setText(phone != null ? phone : "");
        binding.tvProfileRoleBadge.setText(role != null ? role.toUpperCase() : "CUSTOMER");

        // Role-based portals visibility
        boolean isSeller = "seller".equalsIgnoreCase(role) || sessionManager.isAdmin();
        binding.cardSellerPortalEntry.setVisibility(isSeller ? View.VISIBLE : View.GONE);
        binding.cardAdminPortalEntry.setVisibility(sessionManager.isAdmin() ? View.VISIBLE : View.GONE);
    }

    private void setupActions() {
        binding.cardSellerPortalEntry.setOnClickListener(v -> {
            Intent intent = new Intent(requireContext(), SellerDashboardActivity.class);
            startActivity(intent);
        });

        binding.cardAdminPortalEntry.setOnClickListener(v -> {
            Intent intent = new Intent(requireContext(), AdminDashboardActivity.class);
            startActivity(intent);
        });

        binding.btnHelpline1.setOnClickListener(v -> dialHelpline("+918088653820"));
        binding.btnHelpline2.setOnClickListener(v -> dialHelpline("+916362095126"));

        binding.btnComplaintsHub.setOnClickListener(v -> {
            Intent intent = new Intent(requireContext(), ComplaintsActivity.class);
            startActivity(intent);
        });

        binding.btnAccountDeletion.setOnClickListener(v -> {
            Intent intent = new Intent(requireContext(), AccountDeletionActivity.class);
            startActivity(intent);
        });

        binding.btnLogout.setOnClickListener(v -> {
            sessionManager.clear();
            Intent intent = new Intent(requireContext(), LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            requireActivity().finish();
        });
    }

    private void dialHelpline(String phone) {
        Intent intent = new Intent(Intent.ACTION_DIAL);
        intent.setData(Uri.parse("tel:" + phone));
        try {
            startActivity(intent);
        } catch (Exception e) {
            Toast.makeText(requireContext(), "Unable to open phone dialer", Toast.LENGTH_SHORT).show();
        }
    }

    private void refreshUserProfile() {
        if (!sessionManager.isLoggedIn()) return;

        ApiClient.getService(requireContext()).getMe().enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<User>> call, @NonNull Response<ApiResponse<User>> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    User user = response.body().getData();
                    if (user != null) {
                        sessionManager.saveUser(user.getId(), user.getPhone(), user.getName(), user.getRole());
                        renderStaticUserData();
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<User>> call, @NonNull Throwable t) {
                // Silently keep cached session data
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        renderStaticUserData();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
