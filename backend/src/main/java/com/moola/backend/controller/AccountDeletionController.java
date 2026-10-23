package com.moola.backend.controller;

import com.moola.backend.dto.AccountDeletionDto;
import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.AccountDeletionRequest;
import com.moola.backend.service.AccountDeletionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/account-deletion")
public class AccountDeletionController {

    private final AccountDeletionService deletionService;

    public AccountDeletionController(AccountDeletionService deletionService) {
        this.deletionService = deletionService;
    }

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<AccountDeletionRequest>> requestDeletion(Authentication authentication,
                                                                               @Valid @RequestBody AccountDeletionDto.DeletionRequest req) {
        String userId = (String) authentication.getPrincipal();
        AccountDeletionRequest request = deletionService.requestDeletion(userId, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(request, "Account deletion request submitted for administrative review"));
    }

    @PostMapping("/public-request")
    public ResponseEntity<ApiResponse<AccountDeletionRequest>> publicDeletionRequest(
            @Valid @RequestBody AccountDeletionDto.PublicDeletionRequest req) {
        AccountDeletionRequest request = deletionService.publicDeletionRequest(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(request, "Public account deletion request submitted"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<AccountDeletionRequest>> getMyStatus(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        AccountDeletionRequest request = deletionService.getMyStatus(userId);
        return ResponseEntity.ok(ApiResponse.ok(request));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AccountDeletionRequest>>> adminListRequests() {
        List<AccountDeletionRequest> list = deletionService.adminListRequests();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PatchMapping("/admin/{requestId}/process")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AccountDeletionRequest>> adminProcessRequest(Authentication authentication,
                                                                                   @PathVariable String requestId,
                                                                                   @Valid @RequestBody AccountDeletionDto.ProcessDeletionRequest req) {
        String adminId = (String) authentication.getPrincipal();
        AccountDeletionRequest request = deletionService.adminProcessRequest(requestId, adminId, req);
        return ResponseEntity.ok(ApiResponse.ok(request, "Deletion request processed"));
    }
}
