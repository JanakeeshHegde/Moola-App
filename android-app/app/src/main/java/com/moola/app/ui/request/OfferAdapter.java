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

public class OfferAdapter extends RecyclerView.Adapter<OfferAdapter.ViewHolder> {

    public interface OnOfferActionListener {
        void onAcceptOffer(CustomRequest.Offer offer);
        void onChatWithSeller(CustomRequest.Offer offer);
    }

    private List<CustomRequest.Offer> offers = new ArrayList<>();
    private final boolean canAccept;
    private final OnOfferActionListener listener;

    public OfferAdapter(boolean canAccept, OnOfferActionListener listener) {
        this.canAccept = canAccept;
        this.listener = listener;
    }

    public void setOffers(List<CustomRequest.Offer> offers) {
        this.offers = offers != null ? offers : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_seller_offer, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        CustomRequest.Offer offer = offers.get(position);
        holder.bind(offer, canAccept, listener);
    }

    @Override
    public int getItemCount() {
        return offers.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        private final TextView tvShopName;
        private final TextView tvRating;
        private final TextView tvPrice;
        private final TextView tvEstimate;
        private final TextView tvMessage;
        private final MaterialButton btnChat;
        private final MaterialButton btnAccept;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvShopName = itemView.findViewById(R.id.tvOfferShopName);
            tvRating = itemView.findViewById(R.id.tvOfferSellerRating);
            tvPrice = itemView.findViewById(R.id.tvOfferPrice);
            tvEstimate = itemView.findViewById(R.id.tvOfferEstimate);
            tvMessage = itemView.findViewById(R.id.tvOfferMessage);
            btnChat = itemView.findViewById(R.id.btnOfferChat);
            btnAccept = itemView.findViewById(R.id.btnOfferAccept);
        }

        public void bind(CustomRequest.Offer offer, boolean canAccept, OnOfferActionListener listener) {
            tvShopName.setText(offer.getSellerShopName() != null ? offer.getSellerShopName() : offer.getSellerName());
            tvRating.setText(String.format("%.1f ★ Verified Maker", offer.getSellerRating() > 0 ? offer.getSellerRating() : 5.0));
            tvPrice.setText(String.format("₹%.0f", offer.getPrice()));

            int days = offer.getDeliveryEstimateDays() > 0 ? offer.getDeliveryEstimateDays() : 3;
            tvEstimate.setText("Delivery Estimate: Ready in " + days + " days • Direct Speed Post");

            if (offer.getMessage() != null && !offer.getMessage().isBlank()) {
                tvMessage.setVisibility(View.VISIBLE);
                tvMessage.setText("“" + offer.getMessage() + "”");
            } else {
                tvMessage.setVisibility(View.GONE);
            }

            if ("ACCEPTED".equalsIgnoreCase(offer.getStatus())) {
                btnAccept.setText("Accepted ✓");
                btnAccept.setEnabled(false);
            } else if (!canAccept || !"PENDING".equalsIgnoreCase(offer.getStatus())) {
                btnAccept.setVisibility(View.GONE);
            } else {
                btnAccept.setText("Accept & Order");
                btnAccept.setEnabled(true);
                btnAccept.setVisibility(View.VISIBLE);
            }

            btnAccept.setOnClickListener(v -> {
                if (listener != null) listener.onAcceptOffer(offer);
            });

            btnChat.setOnClickListener(v -> {
                if (listener != null) listener.onChatWithSeller(offer);
            });
        }
    }
}
