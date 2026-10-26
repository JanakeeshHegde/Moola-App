package com.moola.backend.model;

public class WhatsAppEnquiry {
    private String id;
    private String productId;
    private String buyerId;
    private String buyerName;
    private String sellerId;
    private String message;
    private String createdAt;

    public WhatsAppEnquiry() {}

    public WhatsAppEnquiry(String id, String productId, String buyerId, String buyerName, String sellerId, String message, String createdAt) {
        this.id = id;
        this.productId = productId;
        this.buyerId = buyerId;
        this.buyerName = buyerName;
        this.sellerId = sellerId;
        this.message = message;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getBuyerId() { return buyerId; }
    public void setBuyerId(String buyerId) { this.buyerId = buyerId; }
    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }
    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
