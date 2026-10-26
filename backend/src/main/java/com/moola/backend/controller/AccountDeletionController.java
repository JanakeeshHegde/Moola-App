package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.AccountDeletionRequest;
import com.moola.backend.model.User;
import com.moola.backend.service.DataStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/account-deletion")
@CrossOrigin(origins = "*")
public class AccountDeletionController {

    @Autowired
    private DataStoreService dataStore;

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<AccountDeletionRequest>> requestAccountDeletion(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody(required = false) Map<String, String> body) {
        User user = dataStore.resolveUserFromToken(authHeader);

        String id = "del_req_" + System.currentTimeMillis();
        String reason = body != null ? body.getOrDefault("reason", "User requested deletion") : "User requested deletion";

        AccountDeletionRequest req = new AccountDeletionRequest(
                id,
                user.getId(),
                user.getName(),
                reason,
                "PENDING",
                Instant.now().toString(),
                ""
        );
        dataStore.getDeletionRequests().add(req);
        return ResponseEntity.ok(ApiResponse.success(req, "Account deletion requested successfully"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<AccountDeletionRequest>> getMyDeletionStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        AccountDeletionRequest req = dataStore.getDeletionRequests().stream()
                .filter(r -> user.getId().equals(r.getUserId()))
                .findFirst().orElse(null);
        return ResponseEntity.ok(ApiResponse.success(req));
    }

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<List<AccountDeletionRequest>>> adminListDeletionRequests() {
        return ResponseEntity.ok(ApiResponse.success(dataStore.getDeletionRequests()));
    }

    @PatchMapping("/admin/{requestId}/process")
    public ResponseEntity<ApiResponse<AccountDeletionRequest>> adminProcessDeletionRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, String> body) {
        AccountDeletionRequest req = dataStore.getDeletionRequests().stream()
                .filter(r -> r.getId().equals(requestId))
                .findFirst().orElse(null);

        if (req != null) {
            String status = body.getOrDefault("status", "PROCESSED");
            req.setStatus(status);
            req.setProcessedAt(Instant.now().toString());
        }
        return ResponseEntity.ok(ApiResponse.success(req));
    }
}
