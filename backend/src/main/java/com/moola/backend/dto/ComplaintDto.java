package com.moola.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ComplaintDto {

    public static class SubmitComplaintRequest {
        @NotBlank(message = "Category is required")
        private String category;

        @NotBlank(message = "Subject is required")
        @Size(max = 200, message = "Subject cannot exceed 200 characters")
        private String subject;

        @NotBlank(message = "Description is required")
        @Size(max = 2000, message = "Description cannot exceed 2000 characters")
        private String description;

        private String orderId;
        private String priority = "medium";

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
    }

    public static class AdminUpdateComplaintRequest {
        private String status; // SUBMITTED, ACKNOWLEDGED, UNDER_REVIEW, RESOLVED, CLOSED
        private String priority;
        private String publicResponse;
        private String internalNote;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }

        public String getPublicResponse() { return publicResponse; }
        public void setPublicResponse(String publicResponse) { this.publicResponse = publicResponse; }

        public String getInternalNote() { return internalNote; }
        public void setInternalNote(String internalNote) { this.internalNote = internalNote; }
    }
}
