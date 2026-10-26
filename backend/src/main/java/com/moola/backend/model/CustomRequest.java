package com.moola.backend.model;

import java.util.ArrayList;
import java.util.List;

public class CustomRequest {
    private String id;
    private String buyerId;
    private String buyerName;
    private String title;
    private String description;
    private String categoryId;
    private Double targetPrice;
    private String quantity;
    private String deadline;
    private String status;
    private List<CustomOffer> offers = new ArrayList<>();
    private String createdAt;

    public CustomRequest() {}

    public CustomRequest(String id, String buyerId, String buyerName, String title, String description, String categoryId, Double targetPrice, String quantity, String deadline, String status, String createdAt) {
        this.id = id;
        this.buyerId = buyerId;
        this.buyerName = buyerName;
        this.title = title;
        this.description = description;
        this.categoryId = categoryId;
        this.targetPrice = targetPrice;
        this.quantity = quantity;
        this.deadline = deadline;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getBuyerId() { return buyerId; }
    public void setBuyerId(String buyerId) { this.buyerId = buyerId; }
    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
    public Double getTargetPrice() { return targetPrice; }
    public void setTargetPrice(Double targetPrice) { this.targetPrice = targetPrice; }
    public String getQuantity() { return quantity; }
    public void setQuantity(String quantity) { this.quantity = quantity; }
    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<CustomOffer> getOffers() { return offers; }
    public void setOffers(List<CustomOffer> offers) { this.offers = offers; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public static class CustomOffer {
        private String id;
        private String requestId;
        private String sellerId;
        private String sellerName;
        private Double price;
        private String notes;
        private String createdAt;

        public CustomOffer() {}
        public CustomOffer(String id, String requestId, String sellerId, String sellerName, Double price, String notes, String createdAt) {
            this.id = id;
            this.requestId = requestId;
            this.sellerId = sellerId;
            this.sellerName = sellerName;
            this.price = price;
            this.notes = notes;
            this.createdAt = createdAt;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getRequestId() { return requestId; }
        public void setRequestId(String requestId) { this.requestId = requestId; }
        public String getSellerId() { return sellerId; }
        public void setSellerId(String sellerId) { this.sellerId = sellerId; }
        public String getSellerName() { return sellerName; }
        public void setSellerName(String sellerName) { this.sellerName = sellerName; }
        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }
}
