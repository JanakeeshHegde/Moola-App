package com.moola.app.ui.chat;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.moola.app.R;
import com.moola.app.data.model.Conversation;

import java.util.ArrayList;
import java.util.List;

public class ConversationAdapter extends RecyclerView.Adapter<ConversationAdapter.ViewHolder> {

    public interface OnConversationClickListener {
        void onConversationClick(Conversation conversation);
    }

    private List<Conversation> conversations = new ArrayList<>();
    private final String currentUserId;
    private final OnConversationClickListener listener;

    public ConversationAdapter(String currentUserId, OnConversationClickListener listener) {
        this.currentUserId = currentUserId;
        this.listener = listener;
    }

    public void setConversations(List<Conversation> conversations) {
        this.conversations = conversations != null ? conversations : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_conversation, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Conversation conv = conversations.get(position);
        holder.bind(conv, currentUserId, listener);
    }

    @Override
    public int getItemCount() {
        return conversations.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        private final TextView tvAvatar;
        private final TextView tvTitle;
        private final TextView tvUnread;
        private final TextView tvReference;
        private final TextView tvLastMessage;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvAvatar = itemView.findViewById(R.id.tvConvAvatar);
            tvTitle = itemView.findViewById(R.id.tvConvTitle);
            tvUnread = itemView.findViewById(R.id.tvConvUnreadBadge);
            tvReference = itemView.findViewById(R.id.tvConvReference);
            tvLastMessage = itemView.findViewById(R.id.tvConvLastMessage);
        }

        public void bind(Conversation conv, String currentUserId, OnConversationClickListener listener) {
            String title;
            int unreadCount;

            if (currentUserId != null && currentUserId.equals(conv.getSellerId())) {
                title = conv.getBuyerName() != null && !conv.getBuyerName().isBlank() ? conv.getBuyerName() : "Customer";
                unreadCount = conv.getSellerUnreadCount();
            } else {
                if (conv.getSellerShopName() != null && !conv.getSellerShopName().isBlank()) {
                    title = conv.getSellerShopName();
                } else if (conv.getSellerName() != null && !conv.getSellerName().isBlank()) {
                    title = conv.getSellerName();
                } else {
                    title = "Artisan Maker";
                }
                unreadCount = conv.getBuyerUnreadCount();
            }

            tvTitle.setText(title);

            if (!title.isEmpty()) {
                tvAvatar.setText(title.substring(0, 1).toUpperCase());
            } else {
                tvAvatar.setText("M");
            }

            if (unreadCount > 0) {
                tvUnread.setVisibility(View.VISIBLE);
                tvUnread.setText(unreadCount + " new");
            } else {
                tvUnread.setVisibility(View.GONE);
            }

            if (conv.getOrderId() != null && !conv.getOrderId().isEmpty()) {
                tvReference.setVisibility(View.VISIBLE);
                String ordDisplay = conv.getOrderNumber() != null ? conv.getOrderNumber() :
                        (conv.getOrderId().length() > 8 ? conv.getOrderId().substring(0, 8) : conv.getOrderId());
                tvReference.setText("📦 Order #" + ordDisplay);
            } else if (conv.getProductName() != null && !conv.getProductName().isEmpty()) {
                tvReference.setVisibility(View.VISIBLE);
                tvReference.setText("🍯 " + conv.getProductName());
            } else if (conv.getCustomRequestTitle() != null && !conv.getCustomRequestTitle().isEmpty()) {
                tvReference.setVisibility(View.VISIBLE);
                tvReference.setText("📋 " + conv.getCustomRequestTitle());
            } else {
                tvReference.setVisibility(View.GONE);
            }

            if (conv.getLastMessage() != null && !conv.getLastMessage().isEmpty()) {
                tvLastMessage.setText(conv.getLastMessage());
            } else {
                tvLastMessage.setText("Tap to start chatting");
            }

            itemView.setOnClickListener(v -> {
                if (listener != null) listener.onConversationClick(conv);
            });
        }
    }
}
