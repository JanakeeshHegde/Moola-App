package com.moola.app.ui.seasonal;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import com.google.android.material.button.MaterialButton;
import com.moola.app.R;
import com.moola.app.data.model.SeasonalCampaign;

import java.util.ArrayList;
import java.util.List;

public class SeasonalCampaignAdapter extends RecyclerView.Adapter<SeasonalCampaignAdapter.ViewHolder> {

    public interface OnPreBookClickListener {
        void onPreBook(SeasonalCampaign campaign);
    }

    private List<SeasonalCampaign> campaigns = new ArrayList<>();
    private final OnPreBookClickListener listener;

    public SeasonalCampaignAdapter(OnPreBookClickListener listener) {
        this.listener = listener;
    }

    public void setCampaigns(List<SeasonalCampaign> campaigns) {
        this.campaigns = campaigns != null ? campaigns : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_seasonal_campaign, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        SeasonalCampaign campaign = campaigns.get(position);
        holder.bind(campaign, listener);
    }

    @Override
    public int getItemCount() {
        return campaigns.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        private final ImageView ivBanner;
        private final TextView tvSeller;
        private final TextView tvStatus;
        private final TextView tvTitle;
        private final TextView tvDeliveryWindow;
        private final TextView tvDescription;
        private final TextView tvCapacityLabel;
        private final TextView tvPrice;
        private final ProgressBar pbCapacity;
        private final MaterialButton btnPreBook;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            ivBanner = itemView.findViewById(R.id.ivCampaignBanner);
            tvSeller = itemView.findViewById(R.id.tvCampaignSeller);
            tvStatus = itemView.findViewById(R.id.tvCampaignStatus);
            tvTitle = itemView.findViewById(R.id.tvCampaignTitle);
            tvDeliveryWindow = itemView.findViewById(R.id.tvCampaignDeliveryWindow);
            tvDescription = itemView.findViewById(R.id.tvCampaignDescription);
            tvCapacityLabel = itemView.findViewById(R.id.tvCapacityLabel);
            tvPrice = itemView.findViewById(R.id.tvCampaignPrice);
            pbCapacity = itemView.findViewById(R.id.pbCapacity);
            btnPreBook = itemView.findViewById(R.id.btnPreBookCampaign);
        }

        public void bind(SeasonalCampaign campaign, OnPreBookClickListener listener) {
            tvSeller.setText(campaign.getSellerName() != null ? campaign.getSellerName() : "Verified Regional Producer");
            tvTitle.setText(campaign.getTitle());
            tvDescription.setText(campaign.getDescription());

            if (campaign.getImageUrl() != null && !campaign.getImageUrl().isEmpty()) {
                Glide.with(itemView.getContext())
                        .load(campaign.getImageUrl())
                        .placeholder(R.drawable.bg_hero_card)
                        .error(R.drawable.bg_hero_card)
                        .into(ivBanner);
            } else {
                ivBanner.setImageResource(R.drawable.bg_hero_card);
            }

            if (campaign.getExpectedDeliveryWindow() != null) {
                tvDeliveryWindow.setText("Delivery Window: " + campaign.getExpectedDeliveryWindow());
            } else {
                tvDeliveryWindow.setText("Special Harvest Allocation");
            }

            tvPrice.setText(String.format("₹%.0f / %s", campaign.getPrice(), campaign.getUnit()));

            int booked = campaign.getBookedQuantity();
            int maxCap = campaign.getMaxBookingCapacity() > 0 ? campaign.getMaxBookingCapacity() : 100;
            tvCapacityLabel.setText(String.format("Pre-Booked: %d / %d %s", booked, maxCap, campaign.getUnit()));

            pbCapacity.setMax(maxCap);
            pbCapacity.setProgress(booked);

            String status = campaign.getStatus() != null ? campaign.getStatus() : "ACTIVE";
            tvStatus.setText(status);

            boolean isAvailable = "ACTIVE".equalsIgnoreCase(status) && (booked < maxCap);
            btnPreBook.setEnabled(isAvailable);
            if (!isAvailable) {
                btnPreBook.setText(booked >= maxCap ? "SOLD OUT" : "BOOKING CLOSED");
            } else {
                btnPreBook.setText("Pre-Book for Festival Delivery");
            }

            btnPreBook.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onPreBook(campaign);
                }
            });
        }
    }
}
