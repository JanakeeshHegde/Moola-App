package com.moola.app.ui.chat;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
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
import com.moola.app.R;
import com.moola.app.data.api.ApiClient;
import com.moola.app.data.api.MoolaApiService;
import com.moola.app.data.model.ApiResponse;
import com.moola.app.data.model.Conversation;
import com.moola.app.data.model.User;
import com.moola.app.data.storage.SessionManager;

import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ConversationsActivity extends AppCompatActivity implements ConversationAdapter.OnConversationClickListener {

    private RecyclerView rvConversations;
    private ProgressBar progressBar;
    private TextView tvEmpty;
    private EditText etSearch;
    private ConversationAdapter adapter;
    private MoolaApiService apiService;
    private List<Conversation> allConversations = new ArrayList<>();
    private String currentUserId = "";

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_conversations);

        apiService = ApiClient.getService(this);
        User currentUser = SessionManager.getInstance(this).getUser();
        if (currentUser != null) {
            currentUserId = currentUser.getId();
        }

        findViewById(R.id.btnBackConversations).setOnClickListener(v -> finish());
        rvConversations = findViewById(R.id.rvConversations);
        progressBar = findViewById(R.id.pbConversations);
        tvEmpty = findViewById(R.id.tvEmptyConversations);
        etSearch = findViewById(R.id.etSearchConversations);

        rvConversations.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ConversationAdapter(currentUserId, this);
        rvConversations.setAdapter(adapter);

        if (etSearch != null) {
            etSearch.addTextChangedListener(new TextWatcher() {
                @Override
                public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

                @Override
                public void onTextChanged(CharSequence s, int start, int before, int count) {
                    filterConversations(s != null ? s.toString() : "");
                }

                @Override
                public void afterTextChanged(Editable s) {}
            });
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadConversations();
    }

    private void loadConversations() {
        progressBar.setVisibility(View.VISIBLE);
        apiService.getConversations().enqueue(new Callback<ApiResponse<List<Conversation>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<Conversation>>> call,
                                   @NonNull Response<ApiResponse<List<Conversation>>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    allConversations = response.body().getData();
                    String query = etSearch != null ? etSearch.getText().toString().trim() : "";
                    filterConversations(query);
                } else {
                    if (tvEmpty != null) tvEmpty.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<Conversation>>> call, @NonNull Throwable t) {
                progressBar.setVisibility(View.GONE);
                if (tvEmpty != null) tvEmpty.setVisibility(View.VISIBLE);
                Toast.makeText(ConversationsActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void filterConversations(String query) {
        if (query == null || query.isBlank()) {
            adapter.setConversations(allConversations);
            if (tvEmpty != null) {
                tvEmpty.setVisibility(allConversations.isEmpty() ? View.VISIBLE : View.GONE);
            }
            return;
        }

        String lower = query.toLowerCase().trim();
        List<Conversation> filtered = new ArrayList<>();
        for (Conversation c : allConversations) {
            String title = (c.getTitle() != null ? c.getTitle() : "").toLowerCase();
            String msg = (c.getLastMessage() != null ? c.getLastMessage() : "").toLowerCase();
            String order = (c.getOrderId() != null ? c.getOrderId() : "").toLowerCase();
            String req = (c.getCustomRequestTitle() != null ? c.getCustomRequestTitle() : "").toLowerCase();

            if (title.contains(lower) || msg.contains(lower) || order.contains(lower) || req.contains(lower)) {
                filtered.add(c);
            }
        }

        adapter.setConversations(filtered);
        if (tvEmpty != null) {
            tvEmpty.setVisibility(filtered.isEmpty() ? View.VISIBLE : View.GONE);
        }
    }

    @Override
    public void onConversationClick(Conversation conversation) {
        Intent intent = new Intent(this, ChatActivity.class);
        intent.putExtra(ChatActivity.EXTRA_CONVERSATION_ID, conversation.getId());
        intent.putExtra(ChatActivity.EXTRA_PARTNER_NAME, conversation.getTitle());
        if (conversation.getOrderId() != null) {
            intent.putExtra(ChatActivity.EXTRA_ORDER_ID, conversation.getOrderId());
            intent.putExtra(ChatActivity.EXTRA_ORDER_NUMBER, conversation.getOrderNumber());
        } else if (conversation.getCustomRequestId() != null) {
            intent.putExtra(ChatActivity.EXTRA_CUSTOM_REQUEST_ID, conversation.getCustomRequestId());
            intent.putExtra(ChatActivity.EXTRA_CUSTOM_REQUEST_TITLE, conversation.getCustomRequestTitle());
        } else if (conversation.getProductId() != null) {
            intent.putExtra(ChatActivity.EXTRA_PRODUCT_ID, conversation.getProductId());
            intent.putExtra(ChatActivity.EXTRA_PRODUCT_NAME, conversation.getProductName());
        }
        startActivity(intent);
    }
}
