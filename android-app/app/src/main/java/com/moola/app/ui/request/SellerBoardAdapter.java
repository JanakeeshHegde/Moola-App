package com.moola.app.ui.request;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.button.MaterialButton;
import com.moola.app.R;
import com.moola.app.data.model.CustomRequest;

import java.util.ArrayList;
import java.util.List;

public class SellerBoardAdapter extends RecyclerView.Adapter<SellerBoardAdapter.ViewHolder> {

    public interface OnBoardActionListener {
        void onSubmitOffer(CustomRequest request);
        void onChatWithBuyer(CustomRequest request);
    }

    private List<CustomRequest> requests = new ArrayList<>();
    private final OnBoardActionListener listener;

    public SellerBoardAdapter(OnBoardActionListener listener) {
        this.listener = listener;
    }

    public void setRequests(List<CustomRequest> requests) {
        this.requests = requests != null ? requests : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_seller_board_request, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        CustomRequest req = requests.get(position);
        holder.bind(req, listener);
    }

    @Override
    public int getItemCount() {
        return requests.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        private final TextView tvCategory;
        private final TextView tvBuyerName;
        private final TextView tvTitle;
        private final TextView tvQuantityAndBudget;
        private final TextView tvLocation;
        private final TextView tvDescription;
        private final MaterialButton btnChat;
        private final MaterialButton btnSubmitOffer;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvCategory = itemView.findViewById(R.id.tvBoardCategory);
            tvBuyerName = itemView.findViewById(R.id.tvBoardBuyerName);
            tvTitle = itemView.findViewById(R.id.tvBoardTitle);
            tvQuantityAndBudget = itemView.findViewById(R.id.tvBoardQuantityAndBudget);
            tvLocation = itemView.findViewById(R.id.tvBoardLocation);
            tvDescription = itemView.findViewById(R.id.tvBoardDescription);
            btnChat = itemView.findViewById(R.id.btnBoardChat);
            btnSubmitOffer = itemView.findViewById(R.id.btnBoardSubmitOffer);
        }

        public void bind(CustomRequest req, OnBoardActionListener listener) {
            tvCategory.setText(req.getCategoryName() != null ? req.getCategoryName().toUpperCase() : "HOMEMADE PANTRY");
            tvBuyerName.setText("Buyer: " + (req.getBuyerName() != null ? req.getBuyerName() : "Customer"));
            tvTitle.setText(req.getTitle());

            String qtyStr = String.format("%.0f %s", req.getQuantity(), req.getUnit());
            String budgetStr = req.getBudget() != null ? String.format(" • Buyer Budget: ₹%.0f", req.getBudget()) : "";
            tvQuantityAndBudget.setText("Required: " + qtyStr + budgetStr);

            if (req.getDeliveryLocation() != null && !req.getDeliveryLocation().isBlank()) {
                tvLocation.setVisibility(View.VISIBLE);
                tvLocation.setText("Delivery to: " + req.getDeliveryLocation());
            } else {
                tvLocation.setVisibility(View.GONE);
            }

            tvDescription.setText(req.getDescription() != null ? req.getDescription() : "");

            btnSubmitOffer.setOnClickListener(v -> {
                if (listener != null) listener.onSubmitOffer(req);
            });

            btnChat.setOnClickListener(v -> {
                if (listener != null) listener.onChatWithBuyer(req);
            });
        }
    }
}
