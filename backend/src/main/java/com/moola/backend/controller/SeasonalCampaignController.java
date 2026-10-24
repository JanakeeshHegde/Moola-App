package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.PreBooking;
import com.moola.backend.model.SeasonalCampaign;
import com.moola.backend.service.SeasonalCampaignService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/campaigns")
public class SeasonalCampaignController {

    private final SeasonalCampaignService campaignService;

    public SeasonalCampaignController(SeasonalCampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SeasonalCampaign>>> getActiveCampaigns() {
        List<SeasonalCampaign> list = campaignService.getActiveCampaigns();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SeasonalCampaign>> getCampaignById(@PathVariable String id) {
        SeasonalCampaign campaign = campaignService.getCampaignById(id);
        return ResponseEntity.ok(ApiResponse.ok(campaign));
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<SeasonalCampaign>> createCampaign(Authentication authentication,
                                                                        @RequestBody Map<String, Object> body) {
        String userId = (String) authentication.getPrincipal();
        SeasonalCampaign campaign = campaignService.createCampaign(userId, false, body);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(campaign, "Seasonal & festival campaign created successfully"));
    }

    @PostMapping("/{id}/pre-book")
    public ResponseEntity<ApiResponse<PreBooking>> preBook(Authentication authentication,
                                                           @PathVariable String id,
                                                           @RequestBody Map<String, Object> body) {
        String buyerId = (String) authentication.getPrincipal();
        PreBooking booking = campaignService.preBook(id, buyerId, body);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(booking, "Pre-booking confirmed successfully"));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<List<PreBooking>>> getMyBookings(Authentication authentication) {
        String buyerId = (String) authentication.getPrincipal();
        List<PreBooking> list = campaignService.getBuyerBookings(buyerId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/seller-bookings")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<List<PreBooking>>> getSellerBookings(Authentication authentication) {
        String sellerId = (String) authentication.getPrincipal();
        List<PreBooking> list = campaignService.getSellerBookings(sellerId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
