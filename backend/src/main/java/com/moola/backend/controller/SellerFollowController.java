package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.dto.PublicSellerProfileDto;
import com.moola.backend.dto.SellerShopDto;
import com.moola.backend.model.Product;
import com.moola.backend.model.SellerProfile;
import com.moola.backend.service.SellerFollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sellers")
public class SellerFollowController {

    private final SellerFollowService sellerFollowService;

    public SellerFollowController(SellerFollowService sellerFollowService) {
        this.sellerFollowService = sellerFollowService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PublicSellerProfileDto>>> getPublicSellers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String q) {
        String query = search != null ? search : q;
        List<PublicSellerProfileDto> list = sellerFollowService.getPublicSellers(query);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PublicSellerProfileDto>>> searchPublicSellers(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String search) {
        String query = q != null ? q : search;
        List<PublicSellerProfileDto> list = sellerFollowService.getPublicSellers(query);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}/shop")
    public ResponseEntity<ApiResponse<SellerShopDto>> getSellerShop(@PathVariable String id,
                                                                   Authentication authentication) {
        String currentBuyerId = (authentication != null && authentication.getPrincipal() instanceof String)
                ? (String) authentication.getPrincipal()
                : null;
        SellerShopDto shop = sellerFollowService.getSellerShop(id, currentBuyerId);
        return ResponseEntity.ok(ApiResponse.ok(shop));
    }

    @PostMapping("/{id}/follow")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> followSeller(@PathVariable String id,
                                                                        Authentication authentication) {
        String buyerId = (String) authentication.getPrincipal();
        Map<String, Object> result = sellerFollowService.followSeller(buyerId, id);
        return ResponseEntity.ok(ApiResponse.ok(result, "Followed seller successfully"));
    }

    @DeleteMapping("/{id}/follow")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> unfollowSeller(@PathVariable String id,
                                                                          Authentication authentication) {
        String buyerId = (String) authentication.getPrincipal();
        Map<String, Object> result = sellerFollowService.unfollowSeller(buyerId, id);
        return ResponseEntity.ok(ApiResponse.ok(result, "Unfollowed seller successfully"));
    }

    @PostMapping("/{id}/unfollow")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> unfollowSellerPost(@PathVariable String id,
                                                                              Authentication authentication) {
        String buyerId = (String) authentication.getPrincipal();
        Map<String, Object> result = sellerFollowService.unfollowSeller(buyerId, id);
        return ResponseEntity.ok(ApiResponse.ok(result, "Unfollowed seller successfully"));
    }

    @GetMapping("/{id}/follow-status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFollowStatus(@PathVariable String id,
                                                                           Authentication authentication) {
        String buyerId = (authentication != null && authentication.getPrincipal() instanceof String)
                ? (String) authentication.getPrincipal()
                : null;
        Map<String, Object> result = sellerFollowService.getFollowStatus(buyerId, id);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/following")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<List<SellerProfile>>> getFollowedSellers(Authentication authentication) {
        String buyerId = (String) authentication.getPrincipal();
        List<SellerProfile> list = sellerFollowService.getFollowedSellers(buyerId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/feed/followed")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<List<Product>>> getFollowedFeed(Authentication authentication) {
        String buyerId = (String) authentication.getPrincipal();
        List<Product> list = sellerFollowService.getFollowedSellersFeed(buyerId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
