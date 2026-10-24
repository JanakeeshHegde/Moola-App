package com.moola.app.data.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class CustomRequest implements Serializable {

    private String id;
    private String buyerId;
    private String buyerName;
    private String buyerPhone;

    private String title;
    private String categoryId;
    private String categoryName;

    private double quantity;
    private String unit;
    private Double budget;

    private String deliveryLocation;
    private String description;
    private List<String> images = new ArrayList<>();

    private String status; // OPEN, OFFERS_RECEIVED, ACCEPTED, EXPIRED, CANCELLED
    private String expiresAt;

    private List<Offer> offers = new ArrayList<>();
    private String acceptedOfferId;
    private String resultingOrderId;
    private String createdAt;

    public static class Offer implements Serializable {
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
        private String status; // PENDING, ACCEPTED, REJECTED, WITHDRAWN
        private String createdAt;

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

        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
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

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getExpiresAt() { return expiresAt; }
    public void setExpiresAt(String expiresAt) { this.expiresAt = expiresAt; }

    public List<Offer> getOffers() { return offers != null ? offers : new ArrayList<>(); }
    public void setOffers(List<Offer> offers) { this.offers = offers; }

    public String getAcceptedOfferId() { return acceptedOfferId; }
    public void setAcceptedOfferId(String acceptedOfferId) { this.acceptedOfferId = acceptedOfferId; }

    public String getResultingOrderId() { return resultingOrderId; }
    public void setResultingOrderId(String resultingOrderId) { this.resultingOrderId = resultingOrderId; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
