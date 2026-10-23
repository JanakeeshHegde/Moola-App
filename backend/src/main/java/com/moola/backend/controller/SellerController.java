package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.SellerProfile;
import com.moola.backend.service.SellerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/seller")
public class SellerController {

    private final SellerService sellerService;

    public SellerController(SellerService sellerService) {
        this.sellerService = sellerService;
    }

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SellerProfile>> getProfile(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        SellerProfile profile = sellerService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PatchMapping("/profile")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SellerProfile>> updateProfile(Authentication authentication,
                                                                    @RequestBody SellerProfile req) {
        String userId = (String) authentication.getPrincipal();
        SellerProfile profile = sellerService.updateProfile(userId, req);
        return ResponseEntity.ok(ApiResponse.ok(profile, "Seller profile updated"));
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<SellerProfile>> applyForSeller(Authentication authentication,
                                                                     @RequestBody Map<String, String> body) {
        String userId = (String) authentication.getPrincipal();
        String shopName = body.get("shopName");
        String description = body.get("description");
        String whatsapp = body.get("whatsappNumber");
        SellerProfile profile = sellerService.applyForSeller(userId, shopName, description, whatsapp);
        return ResponseEntity.ok(ApiResponse.ok(profile, "Seller onboarding application submitted for admin review"));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        Map<String, Object> data = sellerService.getAnalytics(userId);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}
