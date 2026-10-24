package com.moola.backend.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "custom_requests")
public class CustomRequest {

    @Id
    private String id;

    @Indexed
    private String buyerId;
    private String buyerName;
    private String buyerPhone;

    private String title;
    private String categoryId;
    private String categoryName;

    private double quantity;
    private String unit;
    private Double budget; // Optional expected price/budget

    private String deliveryLocation;
    private Instant requiredByDate;
    private String description;
    private List<String> images = new ArrayList<>();

    // Status: OPEN, OFFERS_RECEIVED, ACCEPTED, EXPIRED, CANCELLED
    @Indexed
    private String status = "OPEN";

    private Instant expiresAt;

    private List<Offer> offers = new ArrayList<>();

    private String acceptedOfferId;
    private Instant acceptedAt;

    @Indexed
    private String resultingOrderId;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public static class Offer {
        private String id;
        private String sellerId;
        private String sellerName;
        private String sellerShopName;
        private double sellerRating;
        private double price;
        private double quantity;
        private String unit;
        private int deliveryEstimateDays;
        private String message;
        // Status: PENDING, ACCEPTED, REJECTED, WITHDRAWN
        private String status = "PENDING";
        private Instant createdAt = Instant.now();

        public Offer() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getSellerId() { return sellerId; }
        public void setSellerId(String sellerId) { this.sellerId = sellerId; }

        public String getSellerName() { return sellerName; }
        public void setSellerName(String sellerName) { this.sellerName = sellerName; }

        public String getSellerShopName() { return sellerShopName; }
        public void setSellerShopName(String sellerShopName) { this.sellerShopName = sellerShopName; }

        public double getSellerRating() { return sellerRating; }
        public void setSellerRating(double sellerRating) { this.sellerRating = sellerRating; }

        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }

        public double getQuantity() { return quantity; }
        public void setQuantity(double quantity) { this.quantity = quantity; }

        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }

        public int getDeliveryEstimateDays() { return deliveryEstimateDays; }
        public void setDeliveryEstimateDays(int deliveryEstimateDays) { this.deliveryEstimateDays = deliveryEstimateDays; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    public CustomRequest() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBuyerId() { return buyerId; }
    public void setBuyerId(String buyerId) { this.buyerId = buyerId; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }

    public String getBuyerPhone() { return buyerPhone; }
    public void setBuyerPhone(String buyerPhone) { this.buyerPhone = buyerPhone; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public double getQuantity() { return quantity; }
    public void setQuantity(double quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }

    public String getDeliveryLocation() { return deliveryLocation; }
    public void setDeliveryLocation(String deliveryLocation) { this.deliveryLocation = deliveryLocation; }

    public Instant getRequiredByDate() { return requiredByDate; }
    public void setRequiredByDate(Instant requiredByDate) { this.requiredByDate = requiredByDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public List<Offer> getOffers() { return offers; }
    public void setOffers(List<Offer> offers) { this.offers = offers; }

    public String getAcceptedOfferId() { return acceptedOfferId; }
    public void setAcceptedOfferId(String acceptedOfferId) { this.acceptedOfferId = acceptedOfferId; }

    public Instant getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(Instant acceptedAt) { this.acceptedAt = acceptedAt; }

    public String getResultingOrderId() { return resultingOrderId; }
    public void setResultingOrderId(String resultingOrderId) { this.resultingOrderId = resultingOrderId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
