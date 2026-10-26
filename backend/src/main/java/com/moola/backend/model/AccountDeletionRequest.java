package com.moola.backend.model;

public class AccountDeletionRequest {
    private String id;
    private String userId;
    private String userName;
    private String reason;
    private String status;
    private String requestedAt;
    private String processedAt;

    public AccountDeletionRequest() {}

    public AccountDeletionRequest(String id, String userId, String userName, String reason, String status, String requestedAt, String processedAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.reason = reason;
        this.status = status;
        this.requestedAt = requestedAt;
        this.processedAt = processedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRequestedAt() { return requestedAt; }
    public void setRequestedAt(String requestedAt) { this.requestedAt = requestedAt; }
    public String getProcessedAt() { return processedAt; }
    public void setProcessedAt(String processedAt) { this.processedAt = processedAt; }
}
