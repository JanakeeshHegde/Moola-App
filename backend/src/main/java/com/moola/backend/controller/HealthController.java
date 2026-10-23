package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/health", "/api/health"})
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "healthy");
        data.put("service", "MOOLA Spring Boot API");
        data.put("version", "1.0.0");
        data.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}
