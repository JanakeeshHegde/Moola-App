package com.moola.backend.model;

import java.util.List;

public class Order {
    private String id;
    private String buyerId;
    private String buyerName;
    private String buyerPhone;
    private String sellerId;
    private String sellerName;
    private List<OrderItem> items;
    private Double totalAmount;
    private String status;
    private String paymentStatus;
    private String createdAt;
    private String utrNumber;
    private String trackingNumber;
    private Double reviewRating;
    private String reviewComment;
    private String fulfillmentStep;

    public Order() {}

    public Order(String id, String buyerId, String buyerName, String buyerPhone, String sellerId, String sellerName, List<OrderItem> items, Double totalAmount, String status, String paymentStatus, String createdAt) {
        this.id = id;
        this.buyerId = buyerId;
        this.buyerName = buyerName;
        this.buyerPhone = buyerPhone;
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.items = items;
        this.totalAmount = totalAmount;
        this.status = status;
        this.paymentStatus = paymentStatus;
        this.createdAt = createdAt;
        this.fulfillmentStep = "PLACED";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getBuyerId() { return buyerId; }
    public void setBuyerId(String buyerId) { this.buyerId = buyerId; }
    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }
    public String getBuyerPhone() { return buyerPhone; }
    public void setBuyerPhone(String buyerPhone) { this.buyerPhone = buyerPhone; }
    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }
    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUtrNumber() { return utrNumber; }
    public void setUtrNumber(String utrNumber) { this.utrNumber = utrNumber; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public Double getReviewRating() { return reviewRating; }
    public void setReviewRating(Double reviewRating) { this.reviewRating = reviewRating; }
    public String getReviewComment() { return reviewComment; }
    public void setReviewComment(String reviewComment) { this.reviewComment = reviewComment; }
    public String getFulfillmentStep() { return fulfillmentStep; }
    public void setFulfillmentStep(String fulfillmentStep) { this.fulfillmentStep = fulfillmentStep; }

    public static class OrderItem {
        private String productId;
        private String title;
        private Integer quantity;
        private Double price;

        public OrderItem() {}
        public OrderItem(String productId, String title, Integer quantity, Double price) {
            this.productId = productId;
            this.title = title;
            this.quantity = quantity;
            this.price = price;
        }

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
    }
}
