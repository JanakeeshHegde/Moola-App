package com.moola.backend.dto;

import com.moola.backend.model.Product;

import java.util.ArrayList;
import java.util.List;

public class PublicSellerProfileDto {

    private String sellerId;
    private String shopName;
    private String slug;
    private String description;
    private String logo;
    private boolean isVerified;
    private String kycStatus;
    private double averageRating;
    private int ratingCount;
    private long followerCount;
    private long productCount;
    private List<Product> topProducts = new ArrayList<>();

    public PublicSellerProfileDto() {}

    public PublicSellerProfileDto(String sellerId, String shopName, String slug, String description,
                                  String logo, boolean isVerified, String kycStatus,
                                  double averageRating, int ratingCount,
                                  long followerCount, long productCount) {
        this.sellerId = sellerId;
        this.shopName = shopName;
        this.slug = slug;
        this.description = description;
        this.logo = logo;
        this.isVerified = isVerified;
        this.kycStatus = kycStatus;
        this.averageRating = averageRating;
        this.ratingCount = ratingCount;
        this.followerCount = followerCount;
        this.productCount = productCount;
    }

    public static String generateSlug(String shopName) {
        if (shopName == null || shopName.isBlank()) return "maker";
        return shopName.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }

    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }

    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }

    public String getKycStatus() { return kycStatus; }
    public void setKycStatus(String kycStatus) { this.kycStatus = kycStatus; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public int getRatingCount() { return ratingCount; }
    public void setRatingCount(int ratingCount) { this.ratingCount = ratingCount; }

    public long getFollowerCount() { return followerCount; }
    public void setFollowerCount(long followerCount) { this.followerCount = followerCount; }

    public long getProductCount() { return productCount; }
    public void setProductCount(long productCount) { this.productCount = productCount; }

    public List<Product> getTopProducts() { return topProducts; }
    public void setTopProducts(List<Product> topProducts) { this.topProducts = topProducts; }
}
