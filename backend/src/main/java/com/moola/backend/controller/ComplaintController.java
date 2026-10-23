package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.dto.ComplaintDto;
import com.moola.backend.model.Complaint;
import com.moola.backend.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Complaint>> submitComplaint(Authentication authentication,
                                                                  @Valid @RequestBody ComplaintDto.SubmitComplaintRequest req) {
        String userId = (String) authentication.getPrincipal();
        Complaint complaint = complaintService.submitComplaint(userId, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(complaint, "Complaint ticket submitted successfully"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Complaint>>> getMyComplaints(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        List<Complaint> complaints = complaintService.getUserComplaints(userId);
        return ResponseEntity.ok(ApiResponse.ok(complaints));
    }

    @GetMapping("/my/{ticketId}")
    public ResponseEntity<ApiResponse<Complaint>> getMyComplaint(Authentication authentication,
                                                                 @PathVariable String ticketId) {
        String userId = (String) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Complaint complaint = complaintService.getByTicketId(ticketId, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(complaint));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Complaint>>> adminListComplaints(
            @RequestParam(required = false) String status) {
        List<Complaint> complaints = complaintService.adminListComplaints(status);
        return ResponseEntity.ok(ApiResponse.ok(complaints));
    }

    @PatchMapping("/admin/{ticketId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Complaint>> adminUpdateComplaint(Authentication authentication,
                                                                       @PathVariable String ticketId,
                                                                       @RequestBody ComplaintDto.AdminUpdateComplaintRequest req) {
        String adminId = (String) authentication.getPrincipal();
        Complaint updated = complaintService.adminUpdateComplaint(ticketId, adminId, req);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Complaint ticket updated"));
    }
}
