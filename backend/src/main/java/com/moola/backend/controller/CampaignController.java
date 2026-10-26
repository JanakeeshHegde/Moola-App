package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.PreBooking;
import com.moola.backend.model.SeasonalCampaign;
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
@RequestMapping("/api/v1/campaigns")
@CrossOrigin(origins = "*")
public class CampaignController {

    @Autowired
    private DataStoreService dataStore;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SeasonalCampaign>>> getSeasonalCampaigns() {
        return ResponseEntity.ok(ApiResponse.success(dataStore.getCampaigns()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SeasonalCampaign>> getSeasonalCampaignById(@PathVariable String id) {
        SeasonalCampaign campaign = dataStore.getCampaigns().stream()
                .filter(c -> c.getId().equals(id))
                .findFirst().orElse(null);
        return ResponseEntity.ok(ApiResponse.success(campaign));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SeasonalCampaign>> createSeasonalCampaign(@RequestBody Map<String, Object> body) {
        String id = "camp_" + System.currentTimeMillis();
        SeasonalCampaign c = new SeasonalCampaign(
                id,
                (String) body.getOrDefault("title", "Campaign"),
                (String) body.getOrDefault("bannerUrl", ""),
                (String) body.getOrDefault("description", ""),
                body.get("discountPercentage") != null ? Double.valueOf(body.get("discountPercentage").toString()) : 10.0,
                (String) body.getOrDefault("startDate", "2025-01-01"),
                (String) body.getOrDefault("endDate", "2025-12-31"),
                true
        );
        dataStore.getCampaigns().add(c);
        return ResponseEntity.ok(ApiResponse.success(c));
    }

    @PostMapping("/{id}/pre-book")
    public ResponseEntity<ApiResponse<PreBooking>> preBookCampaign(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        User user = dataStore.resolveUserFromToken(authHeader);

        String pbId = "pb_" + System.currentTimeMillis();
        PreBooking pb = new PreBooking(
                pbId,
                id,
                user.getId(),
                user.getName(),
                "user_seller_01",
                "Ramesh Organic Farm & Mandi",
                body.get("quantity") != null ? Integer.valueOf(body.get("quantity").toString()) : 1,
                body.get("advancePayment") != null ? Double.valueOf(body.get("advancePayment").toString()) : 50.0,
                "CONFIRMED",
                Instant.now().toString()
        );
        dataStore.getPreBookings().add(pb);
        return ResponseEntity.ok(ApiResponse.success(pb, "Pre-booking successful"));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<List<PreBooking>>> getMyPreBookings(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        List<PreBooking> list = dataStore.getPreBookings().stream()
                .filter(pb -> user.getId().equals(pb.getBuyerId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/seller-bookings")
    public ResponseEntity<ApiResponse<List<PreBooking>>> getSellerPreBookings(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        List<PreBooking> list = dataStore.getPreBookings().stream()
                .filter(pb -> user.getId().equals(pb.getSellerId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
