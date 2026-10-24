package com.moola.app.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.moola.app.R;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.AuthModels;
import com.moola.app.data.storage.SessionManager;
import com.moola.app.ui.home.MainActivity;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterActivity extends AppCompatActivity {

    private TextInputEditText etName;
    private TextInputEditText etShopName;
    private TextInputLayout tilShopName;
    private TextInputEditText etPhone;
    private TextInputEditText etPassword;
    private RadioGroup rgRole;
    private MaterialButton btnRegister;
    private TextView tvLogin;
    private TextView tvError;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        etName = findViewById(R.id.etName);
        etShopName = findViewById(R.id.etShopName);
        tilShopName = findViewById(R.id.tilShopName);
        etPhone = findViewById(R.id.etPhone);
        etPassword = findViewById(R.id.etPassword);
        rgRole = findViewById(R.id.rgRole);
        btnRegister = findViewById(R.id.btnRegister);
        tvLogin = findViewById(R.id.tvLogin);
        tvError = findViewById(R.id.tvError);
        progressBar = findViewById(R.id.progressBar);

        rgRole.setOnCheckedChangeListener((group, checkedId) -> {
            if (checkedId == R.id.rbSeller) {
                tilShopName.setVisibility(View.VISIBLE);
            } else {
                tilShopName.setVisibility(View.GONE);
            }
        });

        btnRegister.setOnClickListener(v -> performRegister());
        tvLogin.setOnClickListener(v -> finish());
    }

    private void performRegister() {
        String name = etName.getText() != null ? etName.getText().toString().trim() : "";
        String phone = etPhone.getText() != null ? etPhone.getText().toString().trim() : "";
        String password = etPassword.getText() != null ? etPassword.getText().toString().trim() : "";
        String role = rgRole.getCheckedRadioButtonId() == R.id.rbSeller ? "seller" : "buyer";
        String shopName = etShopName.getText() != null ? etShopName.getText().toString().trim() : "";

        if (name.length() < 2) {
            showError("Please enter your name");
            return;
        }

        if (phone.length() != 10) {
            showError("Please enter a valid 10-digit mobile number");
            return;
        }

        if (password.length() < 6) {
            showError("Password must be at least 6 characters");
            return;
        }

        if ("seller".equals(role) && shopName.isEmpty()) {
            showError("Please enter your kitchen or shop name");
            return;
        }

        setLoading(true);
        hideError();

        AuthModels.RegisterRequest req = new AuthModels.RegisterRequest(name, phone, password, role, shopName);
        ApiClient.getService(this).register(req).enqueue(new Callback<ApiResponse<AuthModels.AuthData>>() {
            @Override
            public void onResponse(Call<ApiResponse<AuthModels.AuthData>> call, Response<ApiResponse<AuthModels.AuthData>> response) {
                setLoading(false);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    AuthModels.AuthData data = response.body().getData();
                    SessionManager.getInstance(RegisterActivity.this).saveAuth(
                            data.getTokens().getAccessToken(),
                            data.getTokens().getRefreshToken(),
                            data.getUser(),
                            data.getSellerProfile()
                    );
                    Toast.makeText(RegisterActivity.this, "Account created! Welcome to MOOLA.", Toast.LENGTH_SHORT).show();
                    String userRole = data.getUser() != null ? data.getUser().getRole() : role;
                    Intent intent;
                    if ("seller".equalsIgnoreCase(userRole)) {
                        intent = new Intent(RegisterActivity.this, com.moola.app.ui.seller.SellerDashboardActivity.class);
                    } else {
                        intent = new Intent(RegisterActivity.this, MainActivity.class);
                    }
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                    finish();
                } else {
                    String msg = "Registration failed. Please check your details.";
                    if (response.body() != null && response.body().getError() != null) {
                        msg = response.body().getError().getMessage();
                    }
                    showError(msg);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<AuthModels.AuthData>> call, Throwable t) {
                setLoading(false);
                showError("Unable to reach server. Please check your network connection.");
            }
        });
    }

    private void setLoading(boolean loading) {
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnRegister.setEnabled(!loading);
    }

    private void showError(String msg) {
        tvError.setText(msg);
        tvError.setVisibility(View.VISIBLE);
    }

    private void hideError() {
        tvError.setVisibility(View.GONE);
    }
}
