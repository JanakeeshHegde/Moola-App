package com.moola.app.ui.chat;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.button.MaterialButton;
import com.moola.app.R;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.api.MoolaApiService;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.ChatMessage;
import com.moola.app.data.model.Conversation;
import com.moola.app.data.model.User;
import com.moola.app.data.storage.SessionManager;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ChatActivity extends AppCompatActivity {

    public static final String EXTRA_CONVERSATION_ID = "conversationId";
    public static final String EXTRA_PARTNER_NAME = "partnerName";
    public static final String EXTRA_CONTEXT_TITLE = "contextTitle";
    public static final String EXTRA_OTHER_USER_ID = "other_user_id";
    public static final String EXTRA_ORDER_ID = "orderId";
    public static final String EXTRA_ORDER_NUMBER = "orderNumber";
    public static final String EXTRA_PRODUCT_ID = "productId";
    public static final String EXTRA_PRODUCT_NAME = "productName";
    public static final String EXTRA_CUSTOM_REQUEST_ID = "customRequestId";
    public static final String EXTRA_CUSTOM_REQUEST_TITLE = "customRequestTitle";

    private String conversationId;
    private String partnerName;
    private String contextTitle;
    private String otherUserId;

    private TextView tvTitle;
    private View contextBanner;
    private TextView tvContextText;
    private RecyclerView rvMessages;
    private ProgressBar progressBar;
    private EditText etInput;
    private MaterialButton btnSend;

    private ChatMessageAdapter adapter;
    private MoolaApiService apiService;
    private Handler pollHandler;
    private Runnable pollRunnable;
    private boolean isSending = false;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat);

        conversationId = getIntent().getStringExtra(EXTRA_CONVERSATION_ID);
        partnerName = getIntent().getStringExtra(EXTRA_PARTNER_NAME);
        if (partnerName == null) partnerName = getIntent().getStringExtra("other_user_name");
        contextTitle = getIntent().getStringExtra(EXTRA_CONTEXT_TITLE);
        otherUserId = getIntent().getStringExtra(EXTRA_OTHER_USER_ID);
        if (otherUserId == null) otherUserId = getIntent().getStringExtra("participantId");

        apiService = ApiClient.getService(this);
        User currentUser = SessionManager.getInstance(this).getUser();
        String currentUserId = currentUser != null ? currentUser.getId() : "";

        findViewById(R.id.btnBackChat).setOnClickListener(v -> finish());
        tvTitle = findViewById(R.id.tvChatTitle);
        contextBanner = findViewById(R.id.chatContextBanner);
        tvContextText = findViewById(R.id.tvChatContextText);
        rvMessages = findViewById(R.id.rvChatMessages);
        progressBar = findViewById(R.id.pbChat);
        etInput = findViewById(R.id.etChatMessage);
        btnSend = findViewById(R.id.btnSendMessage);

        if (partnerName != null && !partnerName.isEmpty()) {
            tvTitle.setText(partnerName);
        }

        setupContextBanner();

        LinearLayoutManager layoutManager = new LinearLayoutManager(this);
        layoutManager.setStackFromEnd(true);
        rvMessages.setLayoutManager(layoutManager);

        adapter = new ChatMessageAdapter(currentUserId);
        rvMessages.setAdapter(adapter);

        btnSend.setOnClickListener(v -> sendMessage());

        pollHandler = new Handler(Looper.getMainLooper());
        pollRunnable = new Runnable() {
            @Override
            public void run() {
                if (conversationId != null) {
                    loadMessages(false);
                }
                pollHandler.postDelayed(this, 3500);
            }
        };

        if (conversationId != null && !conversationId.isBlank()) {
            loadMessages(true);
        } else if (otherUserId != null && !otherUserId.isBlank()) {
            initOrCreateConversation();
        } else {
            Toast.makeText(this, "Recipient information missing", Toast.LENGTH_SHORT).show();
            finish();
        }
    }

    private void setupContextBanner() {
        String ord = getIntent().getStringExtra(EXTRA_ORDER_NUMBER);
        if (ord == null) ord = getIntent().getStringExtra(EXTRA_ORDER_ID);
        String prod = getIntent().getStringExtra(EXTRA_PRODUCT_NAME);
        String req = getIntent().getStringExtra(EXTRA_CUSTOM_REQUEST_TITLE);

        if (contextTitle != null && !contextTitle.isEmpty()) {
            contextBanner.setVisibility(View.VISIBLE);
            tvContextText.setText(contextTitle);
        } else if (ord != null && !ord.isEmpty()) {
            contextBanner.setVisibility(View.VISIBLE);
            tvContextText.setText("📦 Order #" + (ord.length() > 10 ? ord.substring(0, 10) : ord));
        } else if (prod != null && !prod.isEmpty()) {
            contextBanner.setVisibility(View.VISIBLE);
            tvContextText.setText("🍯 Inquiring: " + prod);
        } else if (req != null && !req.isEmpty()) {
            contextBanner.setVisibility(View.VISIBLE);
            tvContextText.setText("📋 Demand: " + req);
        } else {
            contextBanner.setVisibility(View.GONE);
        }
    }

    private void initOrCreateConversation() {
        progressBar.setVisibility(View.VISIBLE);
        Map<String, Object> body = new HashMap<>();
        body.put("participantId", otherUserId);

        String orderId = getIntent().getStringExtra(EXTRA_ORDER_ID);
        String orderNumber = getIntent().getStringExtra(EXTRA_ORDER_NUMBER);
        String productId = getIntent().getStringExtra(EXTRA_PRODUCT_ID);
        String productName = getIntent().getStringExtra(EXTRA_PRODUCT_NAME);
        String customRequestId = getIntent().getStringExtra(EXTRA_CUSTOM_REQUEST_ID);
        String customRequestTitle = getIntent().getStringExtra(EXTRA_CUSTOM_REQUEST_TITLE);

        if (orderId != null) body.put("orderId", orderId);
        if (orderNumber != null) body.put("orderNumber", orderNumber);
        if (productId != null) body.put("productId", productId);
        if (productName != null) body.put("productName", productName);
        if (customRequestId != null) body.put("customRequestId", customRequestId);
        if (customRequestTitle != null) body.put("customRequestTitle", customRequestTitle);

        apiService.startConversation(body).enqueue(new Callback<ApiResponse<Conversation>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<Conversation>> call,
                                   @NonNull Response<ApiResponse<Conversation>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    Conversation conv = response.body().getData();
                    conversationId = conv.getId();
                    if (partnerName == null || partnerName.isEmpty()) {
                        partnerName = conv.getTitle();
                        tvTitle.setText(partnerName);
                    }
                    loadMessages(true);
                } else {
                    Toast.makeText(ChatActivity.this, "Unable to initialize conversation", Toast.LENGTH_SHORT).show();
                    finish();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Conversation>> call, @NonNull Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(ChatActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                finish();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (pollHandler != null && pollRunnable != null) {
            pollHandler.postDelayed(pollRunnable, 3500);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (pollHandler != null && pollRunnable != null) {
            pollHandler.removeCallbacks(pollRunnable);
        }
    }

    private void loadMessages(boolean showProgress) {
        if (conversationId == null) return;
        if (showProgress) progressBar.setVisibility(View.VISIBLE);

        apiService.getMessages(conversationId).enqueue(new Callback<ApiResponse<List<ChatMessage>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<ChatMessage>>> call,
                                   @NonNull Response<ApiResponse<List<ChatMessage>>> response) {
                if (showProgress) progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    List<ChatMessage> list = response.body().getData();
                    adapter.setMessages(list);
                    if (!list.isEmpty()) {
                        rvMessages.scrollToPosition(list.size() - 1);
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<ChatMessage>>> call, @NonNull Throwable t) {
                if (showProgress) progressBar.setVisibility(View.GONE);
            }
        });
    }

    private void sendMessage() {
        if (isSending || conversationId == null) return;
        String content = etInput.getText().toString().trim();
        if (content.isEmpty()) return;

        isSending = true;
        btnSend.setEnabled(false);
        etInput.setText("");

        Map<String, Object> body = new HashMap<>();
        body.put("content", content);

        apiService.sendMessage(conversationId, body).enqueue(new Callback<ApiResponse<ChatMessage>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<ChatMessage>> call,
                                   @NonNull Response<ApiResponse<ChatMessage>> response) {
                isSending = false;
                btnSend.setEnabled(true);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    adapter.addMessage(response.body().getData());
                    rvMessages.scrollToPosition(adapter.getItemCount() - 1);
                } else {
                    etInput.setText(content);
                    Toast.makeText(ChatActivity.this, "Failed to send message", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<ChatMessage>> call, @NonNull Throwable t) {
                isSending = false;
                btnSend.setEnabled(true);
                etInput.setText(content);
                Toast.makeText(ChatActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
