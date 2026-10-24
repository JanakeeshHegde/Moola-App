package com.moola.app.data.model;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class PublicSellerProfile implements Serializable {

    @SerializedName("sellerId")
    private String sellerId;

    @SerializedName("shopName")
    private String shopName;

    @SerializedName("slug")
    private String slug;

    @SerializedName("description")
    private String description;

    @SerializedName("logo")
    private String logo;

    @SerializedName("isVerified")
    private boolean isVerified;

    @SerializedName("kycStatus")
    private String kycStatus;

    @SerializedName("averageRating")
    private double averageRating;

    @SerializedName("ratingCount")
    private int ratingCount;

    @SerializedName("followerCount")
    private long followerCount;

    @SerializedName("productCount")
    private long productCount;

    @SerializedName("topProducts")
    private List<Product> topProducts = new ArrayList<>();

    @SerializedName("isFollowing")
    private boolean isFollowing;

    public PublicSellerProfile() {}

    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }

    public String getShopName() { return shopName != null ? shopName : "Artisan Kitchen"; }
    public void setShopName(String shopName) { this.shopName = shopName; }

    public String getSlug() { return slug != null ? slug : "@maker"; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescription() { return description != null ? description : ""; }
    public void setDescription(String description) { this.description = description; }

    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }

    public String getKycStatus() { return kycStatus; }
    public void setKycStatus(String kycStatus) { this.kycStatus = kycStatus; }

    public double getAverageRating() { return averageRating > 0 ? averageRating : 4.8; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public int getRatingCount() { return ratingCount; }
    public void setRatingCount(int ratingCount) { this.ratingCount = ratingCount; }

    public long getFollowerCount() { return followerCount; }
    public void setFollowerCount(long followerCount) { this.followerCount = followerCount; }

    public long getProductCount() { return productCount; }
    public void setProductCount(long productCount) { this.productCount = productCount; }

    public List<Product> getTopProducts() { return topProducts != null ? topProducts : new ArrayList<>(); }
    public void setTopProducts(List<Product> topProducts) { this.topProducts = topProducts; }

    public boolean isFollowing() { return isFollowing; }
    public void setFollowing(boolean following) { isFollowing = following; }
}
