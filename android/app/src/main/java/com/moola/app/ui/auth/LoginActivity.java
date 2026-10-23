package com.moola.app.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.moola.app.R;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.AuthModels;
import com.moola.app.data.storage.SessionManager;
import com.moola.app.ui.home.MainActivity;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private TextInputEditText etPhone;
    private TextInputEditText etPassword;
    private MaterialButton btnLogin;
    private TextView tvRegister;
    private TextView tvError;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        etPhone = findViewById(R.id.etPhone);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        tvRegister = findViewById(R.id.tvRegister);
        tvError = findViewById(R.id.tvError);
        progressBar = findViewById(R.id.progressBar);

        btnLogin.setOnClickListener(v -> performLogin());

        tvRegister.setOnClickListener(v -> {
            startActivity(new Intent(LoginActivity.this, RegisterActivity.class));
        });

        // Demo credentials click-to-fill for instant seamless testing
        TextView tvDemo = findViewById(R.id.tvDemoCredentials);
        tvDemo.setOnClickListener(v -> {
            etPhone.setText("9000000003");
            etPassword.setText("buyer@123");
        });
    }

    private void performLogin() {
        String phone = etPhone.getText() != null ? etPhone.getText().toString().trim() : "";
        String password = etPassword.getText() != null ? etPassword.getText().toString().trim() : "";

        if (phone.length() != 10) {
            showError("Please enter a valid 10-digit mobile number");
            return;
        }

        if (password.isEmpty()) {
            showError("Password cannot be empty");
            return;
        }

        setLoading(true);
        hideError();

        AuthModels.LoginRequest req = new AuthModels.LoginRequest(phone, password);
        ApiClient.getService(this).login(req).enqueue(new Callback<ApiResponse<AuthModels.AuthData>>() {
            @Override
            public void onResponse(Call<ApiResponse<AuthModels.AuthData>> call, Response<ApiResponse<AuthModels.AuthData>> response) {
                setLoading(false);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    AuthModels.AuthData data = response.body().getData();
                    SessionManager.getInstance(LoginActivity.this).saveAuth(
                            data.getTokens().getAccessToken(),
                            data.getTokens().getRefreshToken(),
                            data.getUser(),
                            data.getSellerProfile()
                    );
                    Toast.makeText(LoginActivity.this, "Welcome to MOOLA, " + data.getUser().getName(), Toast.LENGTH_SHORT).show();
                    startActivity(new Intent(LoginActivity.this, MainActivity.class));
                    finish();
                } else {
                    String msg = "Invalid mobile number or password.";
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
        btnLogin.setEnabled(!loading);
    }

    private void showError(String msg) {
        tvError.setText(msg);
        tvError.setVisibility(View.VISIBLE);
    }

    private void hideError() {
        tvError.setVisibility(View.GONE);
    }
}
