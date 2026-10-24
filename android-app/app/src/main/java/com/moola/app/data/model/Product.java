package com.moola.app.data.model;

import java.io.Serializable;
import java.util.List;

public class Product implements Serializable {
    private String id;
    private String sellerId;
    private String categoryId;
    private LocalizedText name;
    private LocalizedText description;
    private List<String> images;
    private String thumbnailUrl;
    private double price;
    private double mrp;
    private String unit;
    private int quantityAvailable;
    private int minOrderQty;
    private List<String> tags;
    private boolean isOrganic;
    private boolean isCertified;
    private String certificationDetails;
    private List<String> ingredients;
    private String origin;
    private String shelfLife;
    private boolean isActive;
    private boolean isApproved;
    private double averageRating;
    private int reviewCount;

    private String sellerName;
    private String sellerShopName;
    private String sellerWhatsApp;
    private String categoryName;

    public static class LocalizedText implements Serializable {
        private String en;
        private String kn;

        public String getEn() { return en; }
        public String getKn() { return kn; }
    }

    public String getId() { return id; }
    public String getSellerId() { return sellerId; }
    public String getCategoryId() { return categoryId; }
    public LocalizedText getName() { return name; }
    public LocalizedText getDescription() { return description; }
    public List<String> getImages() { return images; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public double getPrice() { return price; }
    public double getMrp() { return mrp; }
    public String getUnit() { return unit; }
    public int getQuantityAvailable() { return quantityAvailable; }
    public int getMinOrderQty() { return minOrderQty; }
    public List<String> getTags() { return tags; }
    public boolean isOrganic() { return isOrganic; }
    public boolean isCertified() { return isCertified; }
    public String getCertificationDetails() { return certificationDetails; }
    public boolean isActive() { return isActive; }
    public boolean isApproved() { return isApproved; }
    public double getAverageRating() { return averageRating; }
    public int getReviewCount() { return reviewCount; }

    public String getSellerName() { return sellerName; }
    public String getSellerShopName() { return sellerShopName; }
    public String getSellerWhatsApp() { return sellerWhatsApp; }
    public String getCategoryName() { return categoryName; }

    public String getTitle() {
        if (name != null && name.getEn() != null && !name.getEn().isBlank()) {
            return name.getEn();
        }
        return "Homemade Food Item";
    }

    public String getDetailsDescription() {
        if (description != null && description.getEn() != null) {
            return description.getEn();
        }
        return "";
    }

    public String getFormattedPrice() {
        return String.format("₹%.0f", price);
    }

    public String getFormattedMrp() {
        return mrp > 0 ? String.format("₹%.0f", mrp) : "";
    }

    public List<String> getIngredients() { return ingredients; }
    public String getOrigin() { return origin; }
    public String getShelfLife() { return shelfLife; }
}
