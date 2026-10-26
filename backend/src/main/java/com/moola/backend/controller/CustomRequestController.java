package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.CustomRequest;
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
@RequestMapping("/api/v1/custom-requests")
@CrossOrigin(origins = "*")
public class CustomRequestController {

    @Autowired
    private DataStoreService dataStore;

    @PostMapping
    public ResponseEntity<ApiResponse<CustomRequest>> createCustomRequest(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {
        User user = dataStore.resolveUserFromToken(authHeader);

        String id = "custom_req_" + System.currentTimeMillis();
        CustomRequest req = new CustomRequest(
                id,
                user.getId(),
                user.getName(),
                (String) body.getOrDefault("title", "Custom Request"),
                (String) body.getOrDefault("description", ""),
                (String) body.getOrDefault("categoryId", "cat_1"),
                body.get("targetPrice") != null ? Double.valueOf(body.get("targetPrice").toString()) : 100.0,
                (String) body.getOrDefault("quantity", "1"),
                (String) body.getOrDefault("deadline", "7 days"),
                "OPEN",
                Instant.now().toString()
        );
        dataStore.getCustomRequests().add(req);
        return ResponseEntity.ok(ApiResponse.success(req, "Custom request created successfully"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<CustomRequest>>> getMyCustomRequests(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        List<CustomRequest> list = dataStore.getCustomRequests().stream()
                .filter(r -> user.getId().equals(r.getBuyerId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/board")
    public ResponseEntity<ApiResponse<List<CustomRequest>>> getCustomRequestsBoard() {
        return ResponseEntity.ok(ApiResponse.success(dataStore.getCustomRequests()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomRequest>> getCustomRequestById(@PathVariable String id) {
        CustomRequest req = dataStore.getCustomRequests().stream()
                .filter(r -> r.getId().equals(id))
                .findFirst().orElse(null);
        return ResponseEntity.ok(ApiResponse.success(req));
    }

    @PostMapping("/{id}/offers")
    public ResponseEntity<ApiResponse<CustomRequest>> submitCustomOffer(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        User user = dataStore.resolveUserFromToken(authHeader);
        CustomRequest req = dataStore.getCustomRequests().stream()
                .filter(r -> r.getId().equals(id))
                .findFirst().orElse(null);

        if (req != null) {
            String offerId = "offer_" + System.currentTimeMillis();
            CustomRequest.CustomOffer offer = new CustomRequest.CustomOffer(
                    offerId,
                    id,
                    user.getId(),
                    user.getName(),
                    body.get("price") != null ? Double.valueOf(body.get("price").toString()) : 100.0,
                    (String) body.getOrDefault("notes", ""),
                    Instant.now().toString()
            );
            req.getOffers().add(offer);
        }
        return ResponseEntity.ok(ApiResponse.success(req));
    }

    @PostMapping("/{id}/offers/{offerId}/accept")
    public ResponseEntity<ApiResponse<CustomRequest>> acceptCustomOffer(
            @PathVariable String id, @PathVariable String offerId) {
        CustomRequest req = dataStore.getCustomRequests().stream()
                .filter(r -> r.getId().equals(id))
                .findFirst().orElse(null);

        if (req != null) {
            req.setStatus("ACCEPTED");
        }
        return ResponseEntity.ok(ApiResponse.success(req));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<CustomRequest>> cancelCustomRequest(@PathVariable String id) {
        CustomRequest req = dataStore.getCustomRequests().stream()
                .filter(r -> r.getId().equals(id))
                .findFirst().orElse(null);

        if (req != null) {
            req.setStatus("CANCELLED");
        }
        return ResponseEntity.ok(ApiResponse.success(req));
    }
}
