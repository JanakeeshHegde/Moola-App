package com.moola.backend.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "whatsapp_enquiries")
public class WhatsAppEnquiry {

    @Id
    private String id;

    @Indexed
    private String buyerId;
    private String buyerName;
    private String buyerPhone;

    @Indexed
    private String sellerId;
    private String sellerName;

    @Indexed
    private String productId;
    private String productName;

    private int quantity = 1;
    private String unit;
    private double price;

    private String sellerWhatsAppNumber;
    private String prefilledMessage;
    private String clickToChatUrl;

    private String status = "initiated"; // initiated, replied, order_placed, closed
    private String notes;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public WhatsAppEnquiry() {}

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

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getSellerWhatsAppNumber() { return sellerWhatsAppNumber; }
    public void setSellerWhatsAppNumber(String sellerWhatsAppNumber) { this.sellerWhatsAppNumber = sellerWhatsAppNumber; }

    public String getPrefilledMessage() { return prefilledMessage; }
    public void setPrefilledMessage(String prefilledMessage) { this.prefilledMessage = prefilledMessage; }

    public String getClickToChatUrl() { return clickToChatUrl; }
    public void setClickToChatUrl(String clickToChatUrl) { this.clickToChatUrl = clickToChatUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
