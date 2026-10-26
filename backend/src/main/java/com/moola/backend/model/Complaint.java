package com.moola.backend.model;

public class Complaint {
    private String ticketId;
    private String userId;
    private String userName;
    private String title;
    private String description;
    private String category;
    private String status;
    private String resolution;
    private String createdAt;

    public Complaint() {}

    public Complaint(String ticketId, String userId, String userName, String title, String description, String category, String status, String resolution, String createdAt) {
        this.ticketId = ticketId;
        this.userId = userId;
        this.userName = userName;
        this.title = title;
        this.description = description;
        this.category = category;
        this.status = status;
        this.resolution = resolution;
        this.createdAt = createdAt;
    }

    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getResolution() { return resolution; }
    public void setResolution(String resolution) { this.resolution = resolution; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
