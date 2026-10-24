package com.moola.app.data.model;

import com.google.gson.annotations.SerializedName;

public class Notification {

    @SerializedName("id")
    private String id;

    @SerializedName("recipientId")
    private String recipientId;

    @SerializedName("title")
    private String title;

    @SerializedName("message")
    private String message;

    @SerializedName("type")
    private String type; // NEW_PRODUCT, BUYER_REQUEST, SELLER_OFFER, ORDER_STATUS, CHAT_MESSAGE, PRE_BOOKING

    @SerializedName("referenceId")
    private String referenceId;

    @SerializedName("referenceType")
    private String referenceType; // PRODUCT, CUSTOM_REQUEST, ORDER, CHAT

    @SerializedName("isRead")
    private boolean isRead;

    @SerializedName("createdAt")
    private String createdAt;

    public Notification() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
