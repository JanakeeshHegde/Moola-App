package com.moola.app.ui.request;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.moola.app.R;
import com.moola.app.data.model.CustomRequest;

import java.util.ArrayList;
import java.util.List;

public class CustomRequestAdapter extends RecyclerView.Adapter<CustomRequestAdapter.ViewHolder> {

    public interface OnRequestClickListener {
        void onRequestClick(CustomRequest request);
    }

    private List<CustomRequest> requests = new ArrayList<>();
    private final OnRequestClickListener listener;

    public CustomRequestAdapter(OnRequestClickListener listener) {
        this.listener = listener;
    }

    public void setRequests(List<CustomRequest> requests) {
        this.requests = requests != null ? requests : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_custom_request, parent, false);
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
        private final TextView tvStatus;
        private final TextView tvTitle;
        private final TextView tvQuantityAndBudget;
        private final TextView tvDescription;
        private final TextView tvOffersCount;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvCategory = itemView.findViewById(R.id.tvRequestCategory);
            tvStatus = itemView.findViewById(R.id.tvRequestStatus);
            tvTitle = itemView.findViewById(R.id.tvRequestTitle);
            tvQuantityAndBudget = itemView.findViewById(R.id.tvRequestQuantityAndBudget);
            tvDescription = itemView.findViewById(R.id.tvRequestDescription);
            tvOffersCount = itemView.findViewById(R.id.tvOffersCount);
        }

        public void bind(CustomRequest req, OnRequestClickListener listener) {
            tvCategory.setText(req.getCategoryName() != null ? req.getCategoryName().toUpperCase() : "HOMEMADE PANTRY");
            tvStatus.setText(req.getStatus());

            if ("ACCEPTED".equalsIgnoreCase(req.getStatus())) {
                tvStatus.setBackgroundResource(R.drawable.bg_tag_organic);
            } else if ("OFFERS_RECEIVED".equalsIgnoreCase(req.getStatus())) {
                tvStatus.setBackgroundResource(R.drawable.bg_tag_artisan);
            }

            tvTitle.setText(req.getTitle());

            String qtyStr = String.format("%.0f %s", req.getQuantity(), req.getUnit());
            String budgetStr = req.getBudget() != null ? String.format(" • Budget: ₹%.0f", req.getBudget()) : "";
            tvQuantityAndBudget.setText("Required: " + qtyStr + budgetStr);

            tvDescription.setText(req.getDescription() != null ? req.getDescription() : "");

            int offers = req.getOffers() != null ? req.getOffers().size() : 0;
            if (offers == 1) {
                tvOffersCount.setText("1 maker offer received");
            } else {
                tvOffersCount.setText(offers + " maker offers received");
            }

            itemView.setOnClickListener(v -> {
                if (listener != null) listener.onRequestClick(req);
            });
        }
    }
}
