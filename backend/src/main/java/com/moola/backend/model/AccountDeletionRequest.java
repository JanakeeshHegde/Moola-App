package com.moola.backend.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "accountdeletionrequests")
public class AccountDeletionRequest {

    @Id
    private String id;

    @Indexed(unique = true)
    private String requestId;

    @Indexed
    private String userId;

    private String userName;
    private String userPhone;
    private String userRole; // buyer, seller

    private String reason;
    private String status = "PENDING"; // PENDING, APPROVED, PROCESSING, COMPLETED, REJECTED
    private String verificationState = "authenticated_session";

    private int activeOrdersCount = 0;
    private int unresolvedComplaintsCount = 0;

    private String processedBy;
    private String completionReason;
    private String rejectionReason;
    private Instant processedAt;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public AccountDeletionRequest() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserPhone() { return userPhone; }
    public void setUserPhone(String userPhone) { this.userPhone = userPhone; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getVerificationState() { return verificationState; }
    public void setVerificationState(String verificationState) { this.verificationState = verificationState; }

    public int getActiveOrdersCount() { return activeOrdersCount; }
    public void setActiveOrdersCount(int activeOrdersCount) { this.activeOrdersCount = activeOrdersCount; }

    public int getUnresolvedComplaintsCount() { return unresolvedComplaintsCount; }
    public void setUnresolvedComplaintsCount(int unresolvedComplaintsCount) { this.unresolvedComplaintsCount = unresolvedComplaintsCount; }

    public String getProcessedBy() { return processedBy; }
    public void setProcessedBy(String processedBy) { this.processedBy = processedBy; }

    public String getCompletionReason() { return completionReason; }
    public void setCompletionReason(String completionReason) { this.completionReason = completionReason; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public Instant getProcessedAt() { return processedAt; }
    public void setProcessedAt(Instant processedAt) { this.processedAt = processedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
