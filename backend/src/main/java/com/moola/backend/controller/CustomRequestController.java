package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.CustomRequest;
import com.moola.backend.service.CustomRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/custom-requests")
public class CustomRequestController {

    private final CustomRequestService customRequestService;

    public CustomRequestController(CustomRequestService customRequestService) {
        this.customRequestService = customRequestService;
    }

    @PostMapping
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<CustomRequest>> createRequest(Authentication authentication,
                                                                   @RequestBody Map<String, Object> req) {
        String buyerId = (String) authentication.getPrincipal();
        CustomRequest request = customRequestService.createRequest(buyerId, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(request, "Product request published successfully to seller board"));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<List<CustomRequest>>> getMyRequests(Authentication authentication) {
        String buyerId = (String) authentication.getPrincipal();
        List<CustomRequest> list = customRequestService.getBuyerRequests(buyerId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/board")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<CustomRequest>>> getSellerBoard() {
        List<CustomRequest> list = customRequestService.getSellerBoardRequests();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomRequest>> getRequestById(Authentication authentication,
                                                                    @PathVariable String id) {
        String userId = (String) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        CustomRequest req = customRequestService.getRequestById(id, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(req));
    }

    @PostMapping("/{id}/offers")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<CustomRequest>> submitOffer(Authentication authentication,
                                                                  @PathVariable String id,
                                                                  @RequestBody Map<String, Object> body) {
        String sellerId = (String) authentication.getPrincipal();
        CustomRequest req = customRequestService.submitOffer(id, sellerId, body);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(req, "Custom price offer submitted to buyer"));
    }

    @PostMapping("/{id}/offers/{offerId}/accept")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<CustomRequest>> acceptOffer(Authentication authentication,
                                                                  @PathVariable String id,
                                                                  @PathVariable String offerId) {
        String buyerId = (String) authentication.getPrincipal();
        CustomRequest req = customRequestService.acceptOffer(id, offerId, buyerId);
        return ResponseEntity.ok(ApiResponse.ok(req, "Offer accepted! Order has been created successfully."));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<CustomRequest>> cancelRequest(Authentication authentication,
                                                                    @PathVariable String id) {
        String buyerId = (String) authentication.getPrincipal();
        CustomRequest req = customRequestService.cancelRequest(id, buyerId);
        return ResponseEntity.ok(ApiResponse.ok(req, "Product request cancelled"));
    }
}
