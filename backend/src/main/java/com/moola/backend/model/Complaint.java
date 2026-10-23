package com.moola.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "complaints")
public class Complaint {

    @Id
    private String id;

    @Indexed(unique = true)
    private String ticketId;

    @Indexed
    private String userId;

    private String userName;
    private String userPhone;

    private String category; // order_quality, seller_fraud, delivery_delay, return_replacement, harassment, unauthorized_payment, data_privacy, other
    private String subject;
    private String description;

    @Indexed
    private String orderId;

    private String status = "SUBMITTED"; // SUBMITTED, ACKNOWLEDGED, UNDER_REVIEW, RESOLVED, CLOSED
    private String priority = "medium"; // low, medium, high, urgent

    private String publicResponse;

    private List<InternalNote> internalNotes = new ArrayList<>();

    private Instant slaDeadline = Instant.now().plus(48, ChronoUnit.HOURS);
    private Instant resolvedAt;
    private Instant closedAt;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public static class InternalNote {
        private String noteId;
        private String authorId;
        private String authorName;
        private String note;
        private Instant createdAt = Instant.now();

        public InternalNote() {}
        public InternalNote(String noteId, String authorId, String authorName, String note) {
            this.noteId = noteId;
            this.authorId = authorId;
            this.authorName = authorName;
            this.note = note;
            this.createdAt = Instant.now();
        }

        public String getNoteId() { return noteId; }
        public void setNoteId(String noteId) { this.noteId = noteId; }

        public String getAuthorId() { return authorId; }
        public void setAuthorId(String authorId) { this.authorId = authorId; }

        public String getAuthorName() { return authorName; }
        public void setAuthorName(String authorName) { this.authorName = authorName; }

        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }

        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    public Complaint() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserPhone() { return userPhone; }
    public void setUserPhone(String userPhone) { this.userPhone = userPhone; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getPublicResponse() { return publicResponse; }
    public void setPublicResponse(String publicResponse) { this.publicResponse = publicResponse; }

    public List<InternalNote> getInternalNotes() { return internalNotes; }
    public void setInternalNotes(List<InternalNote> internalNotes) { this.internalNotes = internalNotes; }

    public Instant getSlaDeadline() { return slaDeadline; }
    public void setSlaDeadline(Instant slaDeadline) { this.slaDeadline = slaDeadline; }

    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }

    public Instant getClosedAt() { return closedAt; }
    public void setClosedAt(Instant closedAt) { this.closedAt = closedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
