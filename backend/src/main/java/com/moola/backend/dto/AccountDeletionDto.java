package com.moola.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AccountDeletionDto {

    public static class DeletionRequest {
        @NotBlank(message = "Reason is required")
        @Size(max = 1000, message = "Reason cannot exceed 1000 characters")
        private String reason;

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class PublicDeletionRequest {
        @NotBlank(message = "Phone number is required")
        private String phone;

        private String name;

        @NotBlank(message = "Reason is required")
        private String reason;

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class ProcessDeletionRequest {
        @NotBlank(message = "Action is required")
        private String action; // "approve" or "reject"

        private String reason;

        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
