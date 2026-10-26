package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/config")
@CrossOrigin(origins = "*")
public class ConfigController {

    @GetMapping("/commerce")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCommerceConfig() {
        Map<String, Object> map = new HashMap<>();
        map.put("currencySymbol", "₹");
        map.put("supportPhone", "+91 9876543210");
        map.put("appVersion", "1.0.0");
        map.put("maintenanceMode", false);
        return ResponseEntity.ok(ApiResponse.success(map));
    }
}
