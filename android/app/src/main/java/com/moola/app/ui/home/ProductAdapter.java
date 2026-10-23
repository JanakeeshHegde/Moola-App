package com.moola.app.ui.home;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import com.moola.app.R;
import com.moola.app.data.model.Product;

import java.util.ArrayList;
import java.util.List;

public class ProductAdapter extends RecyclerView.Adapter<ProductAdapter.ViewHolder> {

    private List<Product> products = new ArrayList<>();
    private final OnProductClickListener listener;

    public interface OnProductClickListener {
        void onProductClick(Product product);
    }

    public ProductAdapter(OnProductClickListener listener) {
        this.listener = listener;
    }

    public void setProducts(List<Product> list) {
        this.products = list != null ? list : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_product_card, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Product product = products.get(position);

        holder.tvProductName.setText(product.getTitle());
        holder.tvPrice.setText(product.getFormattedPrice());

        if (product.getMrp() > product.getPrice()) {
            holder.tvMrp.setText(product.getFormattedMrp());
            holder.tvMrp.setVisibility(View.VISIBLE);
            holder.tvMrp.setPaintFlags(holder.tvMrp.getPaintFlags() | android.graphics.Paint.STRIKE_THRU_TEXT_FLAG);
        } else {
            holder.tvMrp.setVisibility(View.GONE);
        }

        holder.tvUnit.setText(product.getUnit() != null ? product.getUnit() : "");

        String sellerName = product.getSellerShopName() != null ? product.getSellerShopName() :
                (product.getSellerName() != null ? product.getSellerName() : "Verified Artisan");
        holder.tvSellerName.setText(sellerName);

        if (product.isOrganic()) {
            holder.tvOrganicBadge.setVisibility(View.VISIBLE);
        } else {
            holder.tvOrganicBadge.setVisibility(View.GONE);
        }

        String img = product.getThumbnailUrl();
        if ((img == null || img.isBlank()) && product.getImages() != null && !product.getImages().isEmpty()) {
            img = product.getImages().get(0);
        }

        if (img != null && !img.isBlank()) {
            Glide.with(holder.itemView.getContext())
                    .load(img)
                    .placeholder(R.drawable.bg_hero_card)
                    .error(R.drawable.bg_hero_card)
                    .into(holder.ivProduct);
        } else {
            holder.ivProduct.setImageResource(R.drawable.bg_hero_card);
        }

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onProductClick(product);
            }
        });
    }

    @Override
    public int getItemCount() {
        return products.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView ivProduct;
        TextView tvOrganicBadge;
        TextView tvSellerName;
        TextView tvProductName;
        TextView tvPrice;
        TextView tvMrp;
        TextView tvUnit;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            ivProduct = itemView.findViewById(R.id.ivProduct);
            tvOrganicBadge = itemView.findViewById(R.id.tvOrganicBadge);
            tvSellerName = itemView.findViewById(R.id.tvSellerName);
            tvProductName = itemView.findViewById(R.id.tvProductName);
            tvPrice = itemView.findViewById(R.id.tvPrice);
            tvMrp = itemView.findViewById(R.id.tvMrp);
            tvUnit = itemView.findViewById(R.id.tvUnit);
        }
    }
}
