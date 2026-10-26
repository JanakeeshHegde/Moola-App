package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.Complaint;
import com.moola.backend.model.User;
import com.moola.backend.service.DataStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    @Autowired
    private DataStoreService dataStore;

    @PostMapping
    public ResponseEntity<ApiResponse<Complaint>> submitComplaint(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {
        User user = dataStore.resolveUserFromToken(authHeader);

        String ticketId = "ticket_" + System.currentTimeMillis();
        Complaint complaint = new Complaint(
                ticketId,
                user.getId(),
                user.getName(),
                (String) body.getOrDefault("title", "Issue"),
                (String) body.getOrDefault("description", ""),
                (String) body.getOrDefault("category", "General"),
                "OPEN",
                "",
                Instant.now().toString()
        );
        dataStore.getComplaints().add(complaint);
        return ResponseEntity.ok(ApiResponse.success(complaint, "Complaint submitted successfully"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Complaint>>> getMyComplaints(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        List<Complaint> list = dataStore.getComplaints().stream()
                .filter(c -> user.getId().equals(c.getUserId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/my/{ticketId}")
    public ResponseEntity<ApiResponse<Complaint>> getMyComplaint(@PathVariable String ticketId) {
        Complaint complaint = dataStore.getComplaints().stream()
                .filter(c -> c.getTicketId().equals(ticketId))
                .findFirst().orElse(null);
        return ResponseEntity.ok(ApiResponse.success(complaint));
    }

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<List<Complaint>>> adminListComplaints(
            @RequestParam(required = false) String status) {
        List<Complaint> list = dataStore.getComplaints().stream()
                .filter(c -> status == null || status.isBlank() || status.equalsIgnoreCase(c.getStatus()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PatchMapping("/admin/{ticketId}")
    public ResponseEntity<ApiResponse<Complaint>> adminUpdateComplaint(
            @PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        Complaint complaint = dataStore.getComplaints().stream()
                .filter(c -> c.getTicketId().equals(ticketId))
                .findFirst().orElse(null);

        if (complaint != null) {
            if (body.containsKey("status")) complaint.setStatus((String) body.get("status"));
            if (body.containsKey("resolution")) complaint.setResolution((String) body.get("resolution"));
        }
        return ResponseEntity.ok(ApiResponse.success(complaint));
    }
}
