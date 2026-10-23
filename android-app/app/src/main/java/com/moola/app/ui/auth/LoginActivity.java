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
        updateDemoHint(tvDemo);

        tvDemo.setOnClickListener(v -> {
            etPhone.setText("9000000003");
            etPassword.setText("buyer@123");
            Toast.makeText(this, "Demo credentials filled. Connecting to: " + ApiClient.getBaseUrl(this), Toast.LENGTH_SHORT).show();
        });

        tvDemo.setOnLongClickListener(v -> {
            showServerUrlDialog(tvDemo);
            return true;
        });
    }

    private void updateDemoHint(TextView tvDemo) {
        if (tvDemo == null) return;
        String url = ApiClient.getBaseUrl(this);
        tvDemo.setText("Demo Accounts:\nBuyer: 9000000003 / buyer@123\nSeller: 9000000001 / seller@123\nAdmin: 9000000000 / admin@moola123\n\nServer: " + url + "\n(Long-press here to change Server URL)");
    }

    private void showServerUrlDialog(TextView tvDemo) {
        android.widget.EditText input = new android.widget.EditText(this);
        input.setText(ApiClient.getBaseUrl(this));
        input.setSingleLine(true);
        input.setPadding(40, 30, 40, 30);

        new androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("Configure Backend Server URL")
                .setMessage("Enter the IP and port of your PC running Spring Boot:")
                .setView(input)
                .setPositiveButton("Save", (dialog, which) -> {
                    String newUrl = input.getText().toString().trim();
                    if (!newUrl.isEmpty()) {
                        if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
                            newUrl = "http://" + newUrl;
                        }
                        if (!newUrl.endsWith("/")) {
                            newUrl += "/";
                        }
                        ApiClient.setCustomBaseUrl(this, newUrl);
                        updateDemoHint(tvDemo);
                        Toast.makeText(this, "Server URL updated to: " + newUrl, Toast.LENGTH_LONG).show();
                    }
                })
                .setNegativeButton("Cancel", null)
                .show();
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

        String currentBaseUrl = ApiClient.getBaseUrl(this);
        android.util.Log.i("MOOLA_AUTH", "Initiating login for phone ending in ..." + (phone.length() >= 4 ? phone.substring(phone.length() - 4) : phone) + " to: " + currentBaseUrl);

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
                    if (response.body() != null && response.body().getMessage() != null && !response.body().getMessage().isEmpty()) {
                        msg = response.body().getMessage();
                    } else if (response.body() != null && response.body().getError() != null) {
                        msg = response.body().getError().getMessage();
                    } else if (response.code() == 401) {
                        msg = "Invalid mobile number or password (HTTP 401).";
                    } else if (response.code() == 403) {
                        msg = "Account is suspended (HTTP 403). Please contact support.";
                    } else if (response.code() == 404) {
                        msg = "Login endpoint not found on server (HTTP 404).";
                    } else if (response.code() >= 500) {
                        msg = "Server encountered an error (HTTP " + response.code() + ").";
                    }
                    android.util.Log.w("MOOLA_AUTH", "Login rejected with HTTP " + response.code() + ": " + msg);
                    showError(msg);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<AuthModels.AuthData>> call, Throwable t) {
                setLoading(false);
                String host = call.request().url().host();
                int port = call.request().url().port();
                String diagMsg;

                if (t instanceof java.net.UnknownHostException) {
                    diagMsg = "Cannot resolve server (" + host + "). Check that phone and PC are on the same Wi-Fi.";
                } else if (t instanceof java.net.ConnectException) {
                    diagMsg = "Cannot reach server at " + host + ":" + port + ". Make sure Spring Boot is running.";
                } else if (t instanceof java.net.SocketTimeoutException) {
                    diagMsg = "Connection timed out to " + host + ":" + port + ". Check Windows Firewall or PC IP.";
                } else if (t.getMessage() != null && t.getMessage().toLowerCase().contains("cleartext")) {
                    diagMsg = "Cleartext HTTP traffic blocked to " + host + ". Check network security config.";
                } else {
                    diagMsg = "Connection error (" + host + ":" + port + "): " + (t.getMessage() != null ? t.getMessage() : t.getClass().getSimpleName());
                }
                android.util.Log.e("MOOLA_AUTH", "Login failure: " + t.getClass().getName() + " - " + t.getMessage(), t);
                showError(diagMsg);
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
