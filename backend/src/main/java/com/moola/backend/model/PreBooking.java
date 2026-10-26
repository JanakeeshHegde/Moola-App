package com.moola.backend.model;

public class PreBooking {
    private String id;
    private String campaignId;
    private String buyerId;
    private String buyerName;
    private String sellerId;
    private String sellerName;
    private Integer quantity;
    private Double advancePayment;
    private String status;
    private String createdAt;

    public PreBooking() {}

    public PreBooking(String id, String campaignId, String buyerId, String buyerName, String sellerId, String sellerName, Integer quantity, Double advancePayment, String status, String createdAt) {
        this.id = id;
        this.campaignId = campaignId;
        this.buyerId = buyerId;
        this.buyerName = buyerName;
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.quantity = quantity;
        this.advancePayment = advancePayment;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCampaignId() { return campaignId; }
    public void setCampaignId(String campaignId) { this.campaignId = campaignId; }
    public String getBuyerId() { return buyerId; }
    public void setBuyerId(String buyerId) { this.buyerId = buyerId; }
    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }
    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }
    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Double getAdvancePayment() { return advancePayment; }
    public void setAdvancePayment(Double advancePayment) { this.advancePayment = advancePayment; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
