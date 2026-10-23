package com.moola.app.data.model;

import java.io.Serializable;

public class AccountDeletionRequest implements Serializable {
    private String id;
    private String requestId;
    private String userId;
    private String userName;
    private String userPhone;
    private String reason;
    private String status;
    private int activeOrdersCount;
    private int unresolvedComplaintsCount;
    private String completionReason;
    private String rejectionReason;
    private String createdAt;

    public String getId() { return id; }
    public String getRequestId() { return requestId; }
    public String getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getUserPhone() { return userPhone; }
    public String getReason() { return reason; }
    public String getStatus() { return status; }
    public int getActiveOrdersCount() { return activeOrdersCount; }
    public int getUnresolvedComplaintsCount() { return unresolvedComplaintsCount; }
    public String getCompletionReason() { return completionReason; }
    public String getRejectionReason() { return rejectionReason; }
    public String getCreatedAt() { return createdAt != null ? createdAt : "Recent Request"; }
}
