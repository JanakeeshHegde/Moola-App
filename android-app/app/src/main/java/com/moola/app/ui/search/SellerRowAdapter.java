package com.moola.app.ui.search;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import com.google.android.material.button.MaterialButton;
import com.moola.app.R;
import com.moola.app.data.model.PublicSellerProfile;

import java.util.ArrayList;
import java.util.List;

public class SellerRowAdapter extends RecyclerView.Adapter<SellerRowAdapter.SellerViewHolder> {

    public interface OnSellerClickListener {
        void onSellerClick(PublicSellerProfile seller);
    }

    private final List<PublicSellerProfile> sellers = new ArrayList<>();
    private final OnSellerClickListener listener;

    public SellerRowAdapter(OnSellerClickListener listener) {
        this.listener = listener;
    }

    public void setSellers(List<PublicSellerProfile> list) {
        this.sellers.clear();
        if (list != null) {
            this.sellers.addAll(list);
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public SellerViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_seller_card_row, parent, false);
        return new SellerViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull SellerViewHolder holder, int position) {
        holder.bind(sellers.get(position));
    }

    @Override
    public int getItemCount() {
        return sellers.size();
    }

    class SellerViewHolder extends RecyclerView.ViewHolder {
        private final ImageView ivAvatar;
        private final ImageView ivVerified;
        private final TextView tvShopName;
        private final TextView tvSlug;
        private final TextView tvRating;
        private final TextView tvFollowers;
        private final TextView tvDesc;
        private final MaterialButton btnVisit;

        public SellerViewHolder(@NonNull View itemView) {
            super(itemView);
            ivAvatar = itemView.findViewById(R.id.ivRowAvatar);
            ivVerified = itemView.findViewById(R.id.ivRowVerified);
            tvShopName = itemView.findViewById(R.id.tvRowShopName);
            tvSlug = itemView.findViewById(R.id.tvRowSlug);
            tvRating = itemView.findViewById(R.id.tvRowRating);
            tvFollowers = itemView.findViewById(R.id.tvRowFollowers);
            tvDesc = itemView.findViewById(R.id.tvRowDesc);
            btnVisit = itemView.findViewById(R.id.btnRowVisit);
        }

        public void bind(PublicSellerProfile seller) {
            tvShopName.setText(seller.getShopName());
            tvSlug.setText(seller.getSlug());
            tvRating.setText(String.format("%.1f", seller.getAverageRating()));
            tvFollowers.setText(seller.getFollowerCount() + " followers");
            tvDesc.setText(seller.getDescription());

            ivVerified.setVisibility(seller.isVerified() ? View.VISIBLE : View.GONE);

            if (seller.getLogo() != null && seller.getLogo().startsWith("http")) {
                Glide.with(itemView.getContext())
                        .load(seller.getLogo())
                        .placeholder(R.drawable.logo_moola)
                        .circleCrop()
                        .into(ivAvatar);
            } else {
                ivAvatar.setImageResource(R.drawable.logo_moola);
            }

            View.OnClickListener clickAction = v -> {
                if (listener != null) {
                    listener.onSellerClick(seller);
                }
            };

            itemView.setOnClickListener(clickAction);
            btnVisit.setOnClickListener(clickAction);
        }
    }
}
