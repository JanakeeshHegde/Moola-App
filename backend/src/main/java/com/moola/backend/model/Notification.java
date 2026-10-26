package com.moola.backend.model;

public class Notification {
    private String id;
    private String userId;
    private String title;
    private String message;
    private Boolean isRead;
    private String createdAt;

    public Notification() {}

    public Notification(String id, String userId, String title, String message, Boolean isRead, String createdAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
