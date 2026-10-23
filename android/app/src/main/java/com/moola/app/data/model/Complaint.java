package com.moola.app.data.model;

import java.io.Serializable;

public class Complaint implements Serializable {
    private String id;
    private String ticketId;
    private String userId;
    private String userName;
    private String userPhone;
    private String category;
    private String subject;
    private String description;
    private String orderId;
    private String status;
    private String priority;
    private String publicResponse;
    private String createdAt;

    public String getId() { return id; }
    public String getTicketId() { return ticketId; }
    public String getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getUserPhone() { return userPhone; }
    public String getCategory() { return category; }
    public String getSubject() { return subject; }
    public String getDescription() { return description; }
    public String getOrderId() { return orderId; }
    public String getStatus() { return status; }
    public String getPriority() { return priority; }
    public String getPublicResponse() { return publicResponse; }
    public String getCreatedAt() { return createdAt; }
}
