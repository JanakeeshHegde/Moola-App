package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.Product;
import com.moola.backend.model.SellerProfile;
import com.moola.backend.model.User;
import com.moola.backend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        Map<String, Object> data = adminService.getAnalytics();
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/buyers")
    public ResponseEntity<ApiResponse<List<User>>> listBuyers() {
        List<User> buyers = adminService.listBuyers();
        return ResponseEntity.ok(ApiResponse.ok(buyers));
    }

    @PatchMapping("/buyers/{id}/status")
    public ResponseEntity<ApiResponse<User>> updateBuyerStatus(@PathVariable String id,
                                                               @RequestBody Map<String, Boolean> body) {
        boolean isActive = body.getOrDefault("isActive", true);
        User user = adminService.updateBuyerStatus(id, isActive);
        return ResponseEntity.ok(ApiResponse.ok(user, "Buyer status updated"));
    }

    @GetMapping("/sellers")
    public ResponseEntity<ApiResponse<List<SellerProfile>>> listSellers() {
        List<SellerProfile> sellers = adminService.listSellers();
        return ResponseEntity.ok(ApiResponse.ok(sellers));
    }

    @PutMapping("/sellers/{id}/kyc")
    public ResponseEntity<ApiResponse<SellerProfile>> reviewSellerKyc(@PathVariable String id,
                                                                      @RequestBody Map<String, String> body) {
        String action = body.get("action");
        String reason = body.get("reason");
        SellerProfile profile = adminService.reviewSellerKyc(id, action, reason);
        return ResponseEntity.ok(ApiResponse.ok(profile, "Seller KYC status updated"));
    }

    @PutMapping("/products/{id}/moderate")
    public ResponseEntity<ApiResponse<Product>> moderateProduct(@PathVariable String id,
                                                                @RequestBody Map<String, Object> body) {
        boolean isApproved = Boolean.TRUE.equals(body.get("isApproved"));
        String note = (String) body.get("moderationNote");
        Product product = adminService.moderateProduct(id, isApproved, note);
        return ResponseEntity.ok(ApiResponse.ok(product, "Product moderation updated"));
    }
}
