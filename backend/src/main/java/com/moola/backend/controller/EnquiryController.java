package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.User;
import com.moola.backend.model.WhatsAppEnquiry;
import com.moola.backend.service.DataStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/enquiries")
@CrossOrigin(origins = "*")
public class EnquiryController {

    @Autowired
    private DataStoreService dataStore;

    @PostMapping
    public ResponseEntity<ApiResponse<WhatsAppEnquiry>> createEnquiry(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {
        User user = dataStore.resolveUserFromToken(authHeader);

        String id = "enq_" + System.currentTimeMillis();
        WhatsAppEnquiry enq = new WhatsAppEnquiry(
                id,
                (String) body.getOrDefault("productId", "prod_1"),
                user.getId(),
                user.getName(),
                (String) body.getOrDefault("sellerId", "user_seller_01"),
                (String) body.getOrDefault("message", "Hi, I am interested in your product."),
                Instant.now().toString()
        );
        dataStore.getEnquiries().add(enq);
        return ResponseEntity.ok(ApiResponse.success(enq));
    }

    @GetMapping("/seller")
    public ResponseEntity<ApiResponse<List<WhatsAppEnquiry>>> getSellerEnquiries(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        List<WhatsAppEnquiry> list = dataStore.getEnquiries().stream()
                .filter(e -> user.getId().equals(e.getSellerId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/buyer")
    public ResponseEntity<ApiResponse<List<WhatsAppEnquiry>>> getBuyerEnquiries(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        List<WhatsAppEnquiry> list = dataStore.getEnquiries().stream()
                .filter(e -> user.getId().equals(e.getBuyerId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
