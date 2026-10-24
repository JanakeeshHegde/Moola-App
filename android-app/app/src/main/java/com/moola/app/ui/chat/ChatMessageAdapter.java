package com.moola.app.ui.chat;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.moola.app.R;
import com.moola.app.data.model.ChatMessage;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class ChatMessageAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {

    private static final int TYPE_ME = 1;
    private static final int TYPE_OTHER = 2;

    private List<ChatMessage> messages = new ArrayList<>();
    private final String currentUserId;
    private final SimpleDateFormat timeFormat = new SimpleDateFormat("hh:mm a", Locale.getDefault());

    public ChatMessageAdapter(String currentUserId) {
        this.currentUserId = currentUserId;
    }

    public void setMessages(List<ChatMessage> messages) {
        this.messages = messages != null ? messages : new ArrayList<>();
        notifyDataSetChanged();
    }

    public void addMessage(ChatMessage message) {
        if (message != null) {
            this.messages.add(message);
            notifyItemInserted(this.messages.size() - 1);
        }
    }

    @Override
    public int getItemViewType(int position) {
        ChatMessage msg = messages.get(position);
        if (currentUserId != null && currentUserId.equals(msg.getSenderId())) {
            return TYPE_ME;
        }
        return TYPE_OTHER;
    }

    @NonNull
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        if (viewType == TYPE_ME) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_chat_message_me, parent, false);
            return new MeViewHolder(view);
        } else {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_chat_message_other, parent, false);
            return new OtherViewHolder(view);
        }
    }

    @Override
    public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
        ChatMessage msg = messages.get(position);
        String formattedTime = "";
        if (msg.getCreatedAt() != null) {
            try {
                // If createdAt is a timestamp or date string
                formattedTime = timeFormat.format(new Date());
            } catch (Exception ignored) {
                formattedTime = "";
            }
        } else {
            formattedTime = timeFormat.format(new Date());
        }

        if (holder instanceof MeViewHolder) {
            ((MeViewHolder) holder).bind(msg, formattedTime);
        } else if (holder instanceof OtherViewHolder) {
            ((OtherViewHolder) holder).bind(msg, formattedTime);
        }
    }

    @Override
    public int getItemCount() {
        return messages.size();
    }

    static class MeViewHolder extends RecyclerView.ViewHolder {
        private final TextView tvContent;
        private final TextView tvTime;

        public MeViewHolder(@NonNull View itemView) {
            super(itemView);
            tvContent = itemView.findViewById(R.id.tvMessageContent);
            tvTime = itemView.findViewById(R.id.tvMessageTime);
        }

        public void bind(ChatMessage msg, String timeStr) {
            tvContent.setText(msg.getContent());
            tvTime.setText(timeStr);
        }
    }

    static class OtherViewHolder extends RecyclerView.ViewHolder {
        private final TextView tvSenderName;
        private final TextView tvContent;
        private final TextView tvTime;

        public OtherViewHolder(@NonNull View itemView) {
            super(itemView);
            tvSenderName = itemView.findViewById(R.id.tvOtherSenderName);
            tvContent = itemView.findViewById(R.id.tvOtherMessageContent);
            tvTime = itemView.findViewById(R.id.tvOtherMessageTime);
        }

        public void bind(ChatMessage msg, String timeStr) {
            tvSenderName.setText(msg.getSenderName() != null ? msg.getSenderName() : "Partner");
            tvContent.setText(msg.getContent());
            tvTime.setText(timeStr);
        }
    }
}
