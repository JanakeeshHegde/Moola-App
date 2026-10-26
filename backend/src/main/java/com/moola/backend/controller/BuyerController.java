package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.BuyerDashboardData;
import com.moola.backend.model.User;
import com.moola.backend.service.DataStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/buyer")
@CrossOrigin(origins = "*")
public class BuyerController {

    @Autowired
    private DataStoreService dataStore;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<BuyerDashboardData>> getBuyerDashboard(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        long activeOrdersCount = dataStore.getOrders().stream()
                .filter(o -> user.getId().equals(o.getBuyerId()) && !"DELIVERED".equalsIgnoreCase(o.getStatus()) && !"CANCELLED".equalsIgnoreCase(o.getStatus()))
                .count();

        BuyerDashboardData data = new BuyerDashboardData(
                250.0,
                (int) activeOrdersCount,
                dataStore.getCategories(),
                dataStore.getProducts()
        );
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
