package com.moola.app.ui.order;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.moola.app.R;
import com.moola.app.data.model.Order;

import java.util.ArrayList;
import java.util.List;

public class OrderAdapter extends RecyclerView.Adapter<OrderAdapter.ViewHolder> {

    private List<Order> orders = new ArrayList<>();
    private final OnOrderClickListener listener;

    public interface OnOrderClickListener {
        void onOrderClick(Order order);
    }

    public OrderAdapter(OnOrderClickListener listener) {
        this.listener = listener;
    }

    public void setOrders(List<Order> list) {
        this.orders = list != null ? list : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_order_card, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Order order = orders.get(position);

        holder.tvOrderNumber.setText(order.getOrderNumber());
        holder.tvStatusBadge.setText(order.getStatus());

        String shop = order.getSellerShopName() != null ? order.getSellerShopName() :
                (order.getSellerName() != null ? order.getSellerName() : "Artisan Maker");
        holder.tvSellerShop.setText(shop);

        StringBuilder itemsSummary = new StringBuilder();
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            for (int i = 0; i < order.getItems().size(); i++) {
                Order.OrderItem item = order.getItems().get(i);
                itemsSummary.append(item.getQty()).append("x ").append(item.getName());
                if (i < order.getItems().size() - 1) itemsSummary.append(", ");
            }
        } else {
            itemsSummary.append("Homemade product item");
        }
        holder.tvItemsSummary.setText(itemsSummary.toString());

        holder.tvTotal.setText(String.format("Total: ₹%.0f", order.getTotal()));

        if (order.getConsignmentNumber() != null && !order.getConsignmentNumber().isBlank()) {
            holder.tvTracking.setText((order.getCarrierName() != null ? order.getCarrierName() : "Post") + ": " + order.getConsignmentNumber());
            holder.tvTracking.setVisibility(View.VISIBLE);
        } else {
            holder.tvTracking.setVisibility(View.GONE);
        }

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onOrderClick(order);
            }
        });
    }

    @Override
    public int getItemCount() {
        return orders.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvOrderNumber;
        TextView tvStatusBadge;
        TextView tvSellerShop;
        TextView tvItemsSummary;
        TextView tvTotal;
        TextView tvTracking;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvOrderNumber = itemView.findViewById(R.id.tvOrderNumber);
            tvStatusBadge = itemView.findViewById(R.id.tvOrderStatusBadge);
            tvSellerShop = itemView.findViewById(R.id.tvOrderSellerShop);
            tvItemsSummary = itemView.findViewById(R.id.tvOrderItemsSummary);
            tvTotal = itemView.findViewById(R.id.tvOrderTotal);
            tvTracking = itemView.findViewById(R.id.tvTrackingInfo);
        }
    }
}
