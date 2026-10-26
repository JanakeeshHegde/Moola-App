package com.moola.backend.model;

public class Conversation {
    private String id;
    private String buyerId;
    private String buyerName;
    private String sellerId;
    private String sellerName;
    private String lastMessage;
    private String lastMessageTime;
    private Integer unreadCount;

    public Conversation() {}

    public Conversation(String id, String buyerId, String buyerName, String sellerId, String sellerName, String lastMessage, String lastMessageTime, Integer unreadCount) {
        this.id = id;
        this.buyerId = buyerId;
        this.buyerName = buyerName;
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.lastMessage = lastMessage;
        this.lastMessageTime = lastMessageTime;
        this.unreadCount = unreadCount;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getBuyerId() { return buyerId; }
    public void setBuyerId(String buyerId) { this.buyerId = buyerId; }
    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }
    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }
    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }
    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }
    public String getLastMessageTime() { return lastMessageTime; }
    public void setLastMessageTime(String lastMessageTime) { this.lastMessageTime = lastMessageTime; }
    public Integer getUnreadCount() { return unreadCount; }
    public void setUnreadCount(Integer unreadCount) { this.unreadCount = unreadCount; }
}
