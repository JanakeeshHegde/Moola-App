package com.moola.app.ui.order;

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
import com.moola.app.data.model.Order;
import com.moola.app.data.model.Product;
import com.moola.app.data.model.User;
import com.moola.app.data.storage.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.HashMap;
import java.util.Map;

public class OrderRequestActivity extends AppCompatActivity {

    private TextView tvOrderReqProductName;
    private TextView tvOrderReqPriceQty;
    private TextView tvOrderReqTotal;
    private TextInputEditText etShippingName;
    private TextInputEditText etShippingPhone;
    private TextInputEditText etShippingAddress1;
    private TextInputEditText etShippingCity;
    private TextInputEditText etShippingPincode;
    private MaterialButton btnSubmitOrderRequest;
    private ProgressBar pbSubmitOrder;

    private Product product;
    private int selectedQty = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_order_request);

        findViewById(R.id.btnBackOrderReq).setOnClickListener(v -> finish());

        tvOrderReqProductName = findViewById(R.id.tvOrderReqProductName);
        tvOrderReqPriceQty = findViewById(R.id.tvOrderReqPriceQty);
        tvOrderReqTotal = findViewById(R.id.tvOrderReqTotal);
        etShippingName = findViewById(R.id.etShippingName);
        etShippingPhone = findViewById(R.id.etShippingPhone);
        etShippingAddress1 = findViewById(R.id.etShippingAddress1);
        etShippingCity = findViewById(R.id.etShippingCity);
        etShippingPincode = findViewById(R.id.etShippingPincode);
        btnSubmitOrderRequest = findViewById(R.id.btnSubmitOrderRequest);
        pbSubmitOrder = findViewById(R.id.pbSubmitOrder);

        product = (Product) getIntent().getSerializableExtra("PRODUCT_OBJ");
        selectedQty = getIntent().getIntExtra("SELECTED_QTY", 1);

        if (product != null) {
            tvOrderReqProductName.setText(product.getTitle() + " (" + product.getUnit() + ")");
            tvOrderReqPriceQty.setText(selectedQty + " x " + product.getFormattedPrice() + " = ₹" + (int)(product.getPrice() * selectedQty));
            tvOrderReqTotal.setText("Total Amount: ₹" + (int)(product.getPrice() * selectedQty));
        }

        // Prefill user details if available
        User user = SessionManager.getInstance(this).getUser();
        if (user != null) {
            if (user.getName() != null) etShippingName.setText(user.getName());
            if (user.getPhone() != null) etShippingPhone.setText(user.getPhone());
        }

        btnSubmitOrderRequest.setOnClickListener(v -> placeOrder());
    }

    private void placeOrder() {
        if (product == null) return;

        String name = etShippingName.getText() != null ? etShippingName.getText().toString().trim() : "";
        String phone = etShippingPhone.getText() != null ? etShippingPhone.getText().toString().trim() : "";
        String addr1 = etShippingAddress1.getText() != null ? etShippingAddress1.getText().toString().trim() : "";
        String city = etShippingCity.getText() != null ? etShippingCity.getText().toString().trim() : "";
        String pincode = etShippingPincode.getText() != null ? etShippingPincode.getText().toString().trim() : "";

        if (name.isEmpty() || phone.length() != 10 || addr1.isEmpty() || city.isEmpty() || pincode.length() != 6) {
            Toast.makeText(this, "Please fill in complete delivery address details.", Toast.LENGTH_SHORT).show();
            return;
        }

        btnSubmitOrderRequest.setEnabled(false);
        pbSubmitOrder.setVisibility(View.VISIBLE);

        Map<String, Object> body = new HashMap<>();
        body.put("productId", product.getId());
        body.put("qty", selectedQty);

        Map<String, String> address = new HashMap<>();
        address.put("name", name);
        address.put("phone", phone);
        address.put("line1", addr1);
        address.put("city", city);
        address.put("state", "Karnataka");
        address.put("pincode", pincode);
        body.put("shippingAddress", address);

        ApiClient.getService(this).directOrderRequest(body).enqueue(new Callback<ApiResponse<Order>>() {
            @Override
            public void onResponse(Call<ApiResponse<Order>> call, Response<ApiResponse<Order>> response) {
                pbSubmitOrder.setVisibility(View.GONE);
                btnSubmitOrderRequest.setEnabled(true);

                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    Order order = response.body().getData();
                    Toast.makeText(OrderRequestActivity.this, "Order request sent to maker!", Toast.LENGTH_LONG).show();

                    Intent intent = new Intent(OrderRequestActivity.this, OrderDetailActivity.class);
                    intent.putExtra("ORDER_ID", order.getId());
                    intent.putExtra("ORDER_OBJ", order);
                    startActivity(intent);
                    finish();
                } else {
                    String msg = "Failed to place order request.";
                    if (response.body() != null && response.body().getError() != null) {
                        msg = response.body().getError().getMessage();
                    }
                    Toast.makeText(OrderRequestActivity.this, msg, Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Order>> call, Throwable t) {
                pbSubmitOrder.setVisibility(View.GONE);
                btnSubmitOrderRequest.setEnabled(true);
                Toast.makeText(OrderRequestActivity.this, "Network error placing order.", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
