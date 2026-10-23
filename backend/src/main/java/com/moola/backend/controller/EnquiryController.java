package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.dto.EnquiryDto;
import com.moola.backend.model.WhatsAppEnquiry;
import com.moola.backend.service.EnquiryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/enquiries")
public class EnquiryController {

    private final EnquiryService enquiryService;

    public EnquiryController(EnquiryService enquiryService) {
        this.enquiryService = enquiryService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WhatsAppEnquiry>> createEnquiry(
            Authentication authentication,
            @Valid @RequestBody EnquiryDto.CreateEnquiryRequest req) {
        String buyerId = authentication != null ? (String) authentication.getPrincipal() : null;
        WhatsAppEnquiry enquiry = enquiryService.createEnquiry(buyerId, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(enquiry, "WhatsApp enquiry link generated"));
    }

    @GetMapping("/seller")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<WhatsAppEnquiry>>> getSellerEnquiries(Authentication authentication) {
        String sellerId = (String) authentication.getPrincipal();
        List<WhatsAppEnquiry> list = enquiryService.getSellerEnquiries(sellerId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/buyer")
    public ResponseEntity<ApiResponse<List<WhatsAppEnquiry>>> getBuyerEnquiries(Authentication authentication) {
        String buyerId = (String) authentication.getPrincipal();
        List<WhatsAppEnquiry> list = enquiryService.getBuyerEnquiries(buyerId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<WhatsAppEnquiry>> updateStatus(@PathVariable String id,
                                                                     @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "replied");
        WhatsAppEnquiry updated = enquiryService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Status updated"));
    }
}
