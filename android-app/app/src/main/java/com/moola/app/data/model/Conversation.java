package com.moola.app.data.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class Conversation implements Serializable {

    private String id;
    private List<String> participants = new ArrayList<>();
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
    private String lastMessageAt;
    private String lastMessageSenderId;
    private int buyerUnreadCount;
    private int sellerUnreadCount;

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

    public String getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(String lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public String getLastMessageSenderId() { return lastMessageSenderId; }
    public void setLastMessageSenderId(String lastMessageSenderId) { this.lastMessageSenderId = lastMessageSenderId; }

    public int getBuyerUnreadCount() { return buyerUnreadCount; }
    public void setBuyerUnreadCount(int buyerUnreadCount) { this.buyerUnreadCount = buyerUnreadCount; }

    public int getSellerUnreadCount() { return sellerUnreadCount; }
    public void setSellerUnreadCount(int sellerUnreadCount) { this.sellerUnreadCount = sellerUnreadCount; }

    public String getTitle() {
        if (sellerShopName != null && !sellerShopName.isBlank()) return sellerShopName;
        if (sellerName != null && !sellerName.isBlank()) return sellerName;
        if (buyerName != null && !buyerName.isBlank()) return buyerName;
        if (customRequestTitle != null && !customRequestTitle.isBlank()) return customRequestTitle;
        return "Direct Conversation";
    }

    public int getUnreadCount() {
        return Math.max(buyerUnreadCount, sellerUnreadCount);
    }
}
