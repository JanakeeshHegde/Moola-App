package com.moola.app.ui.seller;

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

public class SellerProductAdapter extends RecyclerView.Adapter<SellerProductAdapter.ViewHolder> {

    private List<Product> products = new ArrayList<>();
    private final OnSellerProductClickListener listener;

    public interface OnSellerProductClickListener {
        void onProductClick(Product product);
    }

    public SellerProductAdapter(OnSellerProductClickListener listener) {
        this.listener = listener;
    }

    public void setProducts(List<Product> list) {
        this.products = list != null ? list : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_seller_product, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Product product = products.get(position);

        holder.tvTitle.setText(product.getTitle());
        holder.tvPriceUnit.setText(String.format("₹%.0f / %s • Stock: %d",
                product.getPrice(),
                product.getUnit() != null ? product.getUnit() : "unit",
                product.getQuantityAvailable()));

        holder.tvStatus.setText(product.isActive() ? "ACTIVE" : "INACTIVE");

        String img = product.getThumbnailUrl();
        if ((img == null || img.isBlank()) && product.getImages() != null && !product.getImages().isEmpty()) {
            img = product.getImages().get(0);
        }

        if (img != null && !img.isBlank()) {
            Glide.with(holder.itemView.getContext())
                    .load(img)
                    .placeholder(R.drawable.bg_hero_card)
                    .into(holder.ivProduct);
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
        TextView tvTitle;
        TextView tvPriceUnit;
        TextView tvStatus;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            ivProduct = itemView.findViewById(R.id.ivSellerProd);
            tvTitle = itemView.findViewById(R.id.tvSellerProdTitle);
            tvPriceUnit = itemView.findViewById(R.id.tvSellerProdPriceUnit);
            tvStatus = itemView.findViewById(R.id.tvSellerProdStatus);
        }
    }
}
