package com.moola.app.data.model;

import com.google.gson.annotations.SerializedName;

public class SellerFollow {

    @SerializedName("id")
    private String id;

    @SerializedName("buyerId")
    private String buyerId;

    @SerializedName("sellerId")
    private String sellerId;

    @SerializedName("sellerShopName")
    private String sellerShopName;

    @SerializedName("createdAt")
    private String createdAt;

    public SellerFollow() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBuyerId() { return buyerId; }
    public void setBuyerId(String buyerId) { this.buyerId = buyerId; }

    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }

    public String getSellerShopName() { return sellerShopName; }
    public void setSellerShopName(String sellerShopName) { this.sellerShopName = sellerShopName; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
