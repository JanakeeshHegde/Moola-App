package com.moola.app.ui.notification;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.moola.app.R;
import com.moola.app.data.model.Notification;

import java.util.List;

public class NotificationAdapter extends RecyclerView.Adapter<NotificationAdapter.ViewHolder> {

    public interface OnNotificationClickListener {
        void onNotificationClick(Notification notification);
    }

    private List<Notification> notifications;
    private final OnNotificationClickListener listener;

    public NotificationAdapter(List<Notification> notifications, OnNotificationClickListener listener) {
        this.notifications = notifications;
        this.listener = listener;
    }

    public void setNotifications(List<Notification> notifications) {
        this.notifications = notifications;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_notification, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Notification item = notifications.get(position);
        holder.tvTitle.setText(item.getTitle() != null ? item.getTitle() : "Notification");
        holder.tvMessage.setText(item.getMessage() != null ? item.getMessage() : "");
        holder.tvTime.setText(item.getCreatedAt() != null ? item.getCreatedAt().substring(0, Math.min(10, item.getCreatedAt().length())) : "");

        holder.viewUnreadDot.setVisibility(item.isRead() ? View.GONE : View.VISIBLE);

        // Icon based on notification type
        String type = item.getType() != null ? item.getType() : "";
        if ("ORDER_STATUS".equals(type)) {
            holder.ivIcon.setImageResource(R.drawable.ic_orders);
        } else if ("SELLER_OFFER".equals(type) || "BUYER_REQUEST".equals(type)) {
            holder.ivIcon.setImageResource(R.drawable.ic_search);
        } else if ("CHAT_MESSAGE".equals(type)) {
            holder.ivIcon.setImageResource(R.drawable.ic_profile);
        } else {
            holder.ivIcon.setImageResource(R.drawable.ic_home);
        }

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onNotificationClick(item);
            }
        });
    }

    @Override
    public int getItemCount() {
        return notifications != null ? notifications.size() : 0;
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView ivIcon;
        TextView tvTitle;
        TextView tvMessage;
        TextView tvTime;
        View viewUnreadDot;

        ViewHolder(View itemView) {
            super(itemView);
            ivIcon = itemView.findViewById(R.id.ivNotificationIcon);
            tvTitle = itemView.findViewById(R.id.tvNotificationTitle);
            tvMessage = itemView.findViewById(R.id.tvNotificationMessage);
            tvTime = itemView.findViewById(R.id.tvNotificationTime);
            viewUnreadDot = itemView.findViewById(R.id.viewUnreadDot);
        }
    }
}
