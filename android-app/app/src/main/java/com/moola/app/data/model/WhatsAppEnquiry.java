package com.moola.app.data.model;

import java.io.Serializable;

public class WhatsAppEnquiry implements Serializable {
    private String id;
    private String buyerId;
    private String buyerName;
    private String buyerPhone;
    private String sellerId;
    private String sellerName;
    private String productId;
    private String productName;
    private int quantity;
    private String unit;
    private double price;
    private String sellerWhatsAppNumber;
    private String prefilledMessage;
    private String clickToChatUrl;
    private String status;

    public String getId() { return id; }
    public String getBuyerId() { return buyerId; }
    public String getBuyerName() { return buyerName; }
    public String getBuyerPhone() { return buyerPhone; }
    public String getSellerId() { return sellerId; }
    public String getSellerName() { return sellerName; }
    public String getProductId() { return productId; }
    public String getProductName() { return productName; }
    public int getQuantity() { return quantity; }
    public String getUnit() { return unit; }
    public double getPrice() { return price; }
    public String getSellerWhatsAppNumber() { return sellerWhatsAppNumber; }
    public String getPrefilledMessage() { return prefilledMessage; }
    public String getClickToChatUrl() { return clickToChatUrl; }
    public String getStatus() { return status; }
}
