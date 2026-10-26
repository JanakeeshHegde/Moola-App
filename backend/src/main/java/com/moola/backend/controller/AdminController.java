package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.Product;
import com.moola.backend.model.SellerProfile;
import com.moola.backend.model.User;
import com.moola.backend.service.DataStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private DataStoreService dataStore;

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminAnalytics() {
        Map<String, Object> map = new HashMap<>();
        map.put("totalUsers", dataStore.getUsers().size());
        map.put("totalBuyers", dataStore.getUsers().stream().filter(u -> "buyer".equalsIgnoreCase(u.getRole())).count());
        map.put("totalSellers", dataStore.getUsers().stream().filter(u -> "seller".equalsIgnoreCase(u.getRole())).count());
        map.put("totalVolume", 1250000.0);
        return ResponseEntity.ok(ApiResponse.success(map));
    }

    @GetMapping("/buyers")
    public ResponseEntity<ApiResponse<List<User>>> getAdminBuyers() {
        List<User> list = dataStore.getUsers().stream()
                .filter(u -> "buyer".equalsIgnoreCase(u.getRole()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PatchMapping("/buyers/{id}/status")
    public ResponseEntity<ApiResponse<User>> updateBuyerStatus(@PathVariable String id, @RequestBody Map<String, Boolean> body) {
        User user = dataStore.getUsers().stream().filter(u -> u.getId().equals(id)).findFirst().orElse(null);
        if (user != null && body.containsKey("isActive")) {
            user.setIsActive(body.get("isActive"));
        }
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/sellers")
    public ResponseEntity<ApiResponse<List<SellerProfile>>> getAdminSellers() {
        return ResponseEntity.ok(ApiResponse.success(new ArrayList<>(dataStore.getSellerProfiles().values())));
    }

    @PutMapping("/sellers/{id}/kyc")
    public ResponseEntity<ApiResponse<SellerProfile>> reviewSellerKyc(@PathVariable String id, @RequestBody Map<String, String> body) {
        SellerProfile sp = dataStore.getSellerProfiles().values().stream()
                .filter(s -> s.getId().equals(id) || s.getUserId().equals(id))
                .findFirst().orElse(null);
        if (sp != null && body.containsKey("status")) {
            sp.setIsVerifiedKyc("APPROVED".equalsIgnoreCase(body.get("status")));
        }
        return ResponseEntity.ok(ApiResponse.success(sp));
    }

    @PutMapping("/products/{id}/moderate")
    public ResponseEntity<ApiResponse<Product>> moderateProduct(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Product p = dataStore.getProducts().stream().filter(pr -> pr.getId().equals(id)).findFirst().orElse(null);
        if (p != null && body.containsKey("status")) {
            p.setStatus(String.valueOf(body.get("status")));
        }
        return ResponseEntity.ok(ApiResponse.success(p));
    }
}
