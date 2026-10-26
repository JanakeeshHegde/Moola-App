package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.*;
import com.moola.backend.service.DataStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class SellerController {

    @Autowired
    private DataStoreService dataStore;

    @GetMapping("/seller/profile")
    public ResponseEntity<ApiResponse<SellerProfile>> getSellerProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        SellerProfile profile = dataStore.getSellerProfiles().get(user.getId());
        if (profile == null) {
            profile = dataStore.getSellerProfiles().get("user_seller_01");
        }
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PatchMapping("/seller/profile")
    public ResponseEntity<ApiResponse<SellerProfile>> updateSellerProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {
        User user = dataStore.resolveUserFromToken(authHeader);
        SellerProfile profile = dataStore.getSellerProfiles().get(user.getId());
        if (profile != null) {
            if (body.containsKey("shopName")) profile.setShopName((String) body.get("shopName"));
            if (body.containsKey("bio")) profile.setBio((String) body.get("bio"));
            if (body.containsKey("upiId")) profile.setUpiId((String) body.get("upiId"));
            if (body.containsKey("address")) profile.setAddress((String) body.get("address"));
        }
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PostMapping("/seller/apply")
    public ResponseEntity<ApiResponse<SellerProfile>> applyForSeller(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, String> body) {
        User user = dataStore.resolveUserFromToken(authHeader);
        user.setRole("seller");

        SellerProfile profile = new SellerProfile(
                "seller_profile_" + System.currentTimeMillis(),
                user.getId(),
                body.getOrDefault("shopName", user.getName() + "'s Shop"),
                body.getOrDefault("bio", "Welcome to my shop!"),
                5.0,
                0,
                true,
                user.getPhone() + "@upi",
                body.getOrDefault("address", "Local Hub")
        );
        dataStore.getSellerProfiles().put(user.getId(), profile);
        return ResponseEntity.ok(ApiResponse.success(profile, "Seller application submitted successfully"));
    }

    @GetMapping("/seller/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSellerAnalytics() {
        Map<String, Object> map = new HashMap<>();
        map.put("totalRevenue", 45200.0);
        map.put("totalOrdersCount", 142);
        map.put("pendingOrdersCount", 5);
        map.put("rating", 4.8);
        return ResponseEntity.ok(ApiResponse.success(map));
    }

    @GetMapping("/sellers")
    public ResponseEntity<ApiResponse<List<PublicSellerProfile>>> getPublicSellers(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false) String search) {
        User user = dataStore.resolveUserFromToken(authHeader);
        List<PublicSellerProfile> list = dataStore.getSellerProfiles().values().stream()
                .filter(p -> search == null || search.isBlank() || p.getShopName().toLowerCase().contains(search.toLowerCase()))
                .map(sp -> buildPublicProfile(sp, user.getId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/sellers/search")
    public ResponseEntity<ApiResponse<List<PublicSellerProfile>>> searchPublicSellers(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false) String q) {
        return getPublicSellers(authHeader, q);
    }

    @GetMapping("/sellers/{id}/shop")
    public ResponseEntity<ApiResponse<SellerShop>> getSellerShop(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        User user = dataStore.resolveUserFromToken(authHeader);
        SellerProfile profile = dataStore.getSellerProfiles().values().stream()
                .filter(sp -> sp.getId().equals(id) || sp.getUserId().equals(id))
                .findFirst()
                .orElse(dataStore.getSellerProfiles().get("user_seller_01"));

        PublicSellerProfile pub = buildPublicProfile(profile, user.getId());
        List<Product> sellerProds = dataStore.getProducts().stream()
                .filter(p -> p.getSellerId().equals(profile.getUserId()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(new SellerShop(pub, sellerProds)));
    }

    @PostMapping("/sellers/{id}/follow")
    public ResponseEntity<ApiResponse<Map<String, Object>>> followSeller(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        User user = dataStore.resolveUserFromToken(authHeader);
        dataStore.getSellerFollowers().computeIfAbsent(id, k -> new HashSet<>()).add(user.getId());

        Map<String, Object> map = new HashMap<>();
        map.put("isFollowing", true);
        map.put("followerCount", dataStore.getSellerFollowers().get(id).size());
        return ResponseEntity.ok(ApiResponse.success(map));
    }

    @DeleteMapping("/sellers/{id}/follow")
    public ResponseEntity<ApiResponse<Map<String, Object>>> unfollowSellerDelete(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        return unfollowSellerInternal(authHeader, id);
    }

    @PostMapping("/sellers/{id}/unfollow")
    public ResponseEntity<ApiResponse<Map<String, Object>>> unfollowSellerPost(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        return unfollowSellerInternal(authHeader, id);
    }

    private ResponseEntity<ApiResponse<Map<String, Object>>> unfollowSellerInternal(String authHeader, String id) {
        User user = dataStore.resolveUserFromToken(authHeader);
        Set<String> set = dataStore.getSellerFollowers().get(id);
        if (set != null) {
            set.remove(user.getId());
        }

        Map<String, Object> map = new HashMap<>();
        map.put("isFollowing", false);
        map.put("followerCount", set != null ? set.size() : 0);
        return ResponseEntity.ok(ApiResponse.success(map));
    }

    @GetMapping("/sellers/{id}/follow-status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFollowStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        User user = dataStore.resolveUserFromToken(authHeader);
        Set<String> set = dataStore.getSellerFollowers().getOrDefault(id, Collections.emptySet());

        Map<String, Object> map = new HashMap<>();
        map.put("isFollowing", set.contains(user.getId()));
        map.put("followerCount", set.size());
        return ResponseEntity.ok(ApiResponse.success(map));
    }

    @GetMapping("/sellers/following")
    public ResponseEntity<ApiResponse<List<SellerProfile>>> getFollowedSellers(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        List<SellerProfile> followed = new ArrayList<>();
        dataStore.getSellerFollowers().forEach((sellerId, buyers) -> {
            if (buyers.contains(user.getId())) {
                SellerProfile sp = dataStore.getSellerProfiles().get(sellerId);
                if (sp != null) followed.add(sp);
            }
        });
        return ResponseEntity.ok(ApiResponse.success(followed));
    }

    @GetMapping("/sellers/feed/followed")
    public ResponseEntity<ApiResponse<List<Product>>> getFollowedFeed(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        Set<String> followedSellers = new HashSet<>();
        dataStore.getSellerFollowers().forEach((sellerId, buyers) -> {
            if (buyers.contains(user.getId())) followedSellers.add(sellerId);
        });

        List<Product> feed = dataStore.getProducts().stream()
                .filter(p -> followedSellers.contains(p.getSellerId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(feed));
    }

    private PublicSellerProfile buildPublicProfile(SellerProfile sp, String currentUserId) {
        Set<String> followers = dataStore.getSellerFollowers().getOrDefault(sp.getUserId(), Collections.emptySet());
        return new PublicSellerProfile(sp, followers.size(), followers.contains(currentUserId));
    }
}
