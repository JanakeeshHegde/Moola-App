package com.moola.backend.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "conversations")
public class Conversation {

    @Id
    private String id;

    @Indexed
    private List<String> participants = new ArrayList<>(); // User IDs

    private String buyerId;
    private String buyerName;

    private String sellerId;
    private String sellerName;
    private String sellerShopName;

    private String orderId;
    private String orderNumber;

    private String productId;
    private String productName;

    private String customRequestId;
    private String customRequestTitle;

    private String lastMessage;
    private Instant lastMessageAt;
    private String lastMessageSenderId;

    private int buyerUnreadCount = 0;
    private int sellerUnreadCount = 0;

    private boolean isActive = true;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public Conversation() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public List<String> getParticipants() { return participants; }
    public void setParticipants(List<String> participants) { this.participants = participants; }

    public String getBuyerId() { return buyerId; }
    public void setBuyerId(String buyerId) { this.buyerId = buyerId; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }

    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public String getSellerShopName() { return sellerShopName; }
    public void setSellerShopName(String sellerShopName) { this.sellerShopName = sellerShopName; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getCustomRequestId() { return customRequestId; }
    public void setCustomRequestId(String customRequestId) { this.customRequestId = customRequestId; }

    public String getCustomRequestTitle() { return customRequestTitle; }
    public void setCustomRequestTitle(String customRequestTitle) { this.customRequestTitle = customRequestTitle; }

    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }

    public Instant getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(Instant lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public String getLastMessageSenderId() { return lastMessageSenderId; }
    public void setLastMessageSenderId(String lastMessageSenderId) { this.lastMessageSenderId = lastMessageSenderId; }

    public int getBuyerUnreadCount() { return buyerUnreadCount; }
    public void setBuyerUnreadCount(int buyerUnreadCount) { this.buyerUnreadCount = buyerUnreadCount; }

    public int getSellerUnreadCount() { return sellerUnreadCount; }
    public void setSellerUnreadCount(int sellerUnreadCount) { this.sellerUnreadCount = sellerUnreadCount; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
