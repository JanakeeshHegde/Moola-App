package com.moola.backend.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "products")
public class Product {

    @Id
    private String id;

    @Indexed
    private String sellerId;

    @Indexed
    private String categoryId;

    private LocalizedText name = new LocalizedText();
    private LocalizedText description = new LocalizedText();

    private List<String> images = new ArrayList<>();
    private String thumbnailUrl;

    private double price;
    private double mrp;
    private String unit;
    private int quantityAvailable = 0;
    private int minOrderQty = 1;

    private List<String> tags = new ArrayList<>();

    private boolean isOrganic = false;
    private boolean isCertified = false;
    private String certificationDetails;

    private boolean isActive = true;
    private boolean isApproved = true;
    private String moderationNote;

    private double averageRating = 0;
    private int reviewCount = 0;

    // Transient or denormalized seller and category info for rich views
    private String sellerName;
    private String sellerShopName;
    private String sellerWhatsApp;
    private String categoryName;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public static class LocalizedText {
        private String en;
        private String kn;

        public LocalizedText() {}
        public LocalizedText(String en, String kn) {
            this.en = en;
            this.kn = kn;
        }

        public String getEn() { return en; }
        public void setEn(String en) { this.en = en; }

        public String getKn() { return kn; }
        public void setKn(String kn) { this.kn = kn; }
    }

    public Product() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }

    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

    public LocalizedText getName() { return name; }
    public void setName(LocalizedText name) { this.name = name; }

    public LocalizedText getDescription() { return description; }
    public void setDescription(LocalizedText description) { this.description = description; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public double getMrp() { return mrp; }
    public void setMrp(double mrp) { this.mrp = mrp; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public int getQuantityAvailable() { return quantityAvailable; }
    public void setQuantityAvailable(int quantityAvailable) { this.quantityAvailable = quantityAvailable; }

    public int getMinOrderQty() { return minOrderQty; }
    public void setMinOrderQty(int minOrderQty) { this.minOrderQty = minOrderQty; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public boolean isOrganic() { return isOrganic; }
    public void setOrganic(boolean organic) { isOrganic = organic; }

    public boolean isCertified() { return isCertified; }
    public void setCertified(boolean certified) { isCertified = certified; }

    public String getCertificationDetails() { return certificationDetails; }
    public void setCertificationDetails(String certificationDetails) { this.certificationDetails = certificationDetails; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public boolean isApproved() { return isApproved; }
    public void setApproved(boolean approved) { isApproved = approved; }

    public String getModerationNote() { return moderationNote; }
    public void setModerationNote(String moderationNote) { this.moderationNote = moderationNote; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public String getSellerShopName() { return sellerShopName; }
    public void setSellerShopName(String sellerShopName) { this.sellerShopName = sellerShopName; }

    public String getSellerWhatsApp() { return sellerWhatsApp; }
    public void setSellerWhatsApp(String sellerWhatsApp) { this.sellerWhatsApp = sellerWhatsApp; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
