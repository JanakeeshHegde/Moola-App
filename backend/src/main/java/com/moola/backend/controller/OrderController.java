package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.Order;
import com.moola.backend.model.User;
import com.moola.backend.service.DataStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private DataStoreService dataStore;

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<Order>> directOrderRequest(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {
        User user = dataStore.resolveUserFromToken(authHeader);

        String id = "ord_" + System.currentTimeMillis();
        String sellerId = body.get("sellerId") != null ? (String) body.get("sellerId") : "user_seller_01";
        Double totalAmount = body.get("totalAmount") != null ? Double.valueOf(body.get("totalAmount").toString()) : 100.0;

        List<Order.OrderItem> items = new ArrayList<>();
        if (body.get("items") instanceof List) {
            List<?> rawList = (List<?>) body.get("items");
            for (Object obj : rawList) {
                if (obj instanceof Map) {
                    Map<?, ?> itemMap = (Map<?, ?>) obj;
                    items.add(new Order.OrderItem(
                            String.valueOf(itemMap.get("productId")),
                            String.valueOf(itemMap.get("title")),
                            Integer.parseInt(String.valueOf(itemMap.get("quantity"))),
                            Double.parseDouble(String.valueOf(itemMap.get("price")))
                    ));
                }
            }
        }

        Order order = new Order(
                id,
                user.getId(),
                user.getName(),
                user.getPhone(),
                sellerId,
                "Ramesh Organic Farm & Mandi",
                items,
                totalAmount,
                "PENDING",
                "PENDING",
                Instant.now().toString()
        );
        dataStore.getOrders().add(order);

        return ResponseEntity.ok(ApiResponse.success(order, "Order requested successfully"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Order>>> getBuyerOrders(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        List<Order> list = dataStore.getOrders().stream()
                .filter(o -> user.getId().equals(o.getBuyerId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/seller")
    public ResponseEntity<ApiResponse<List<Order>>> getSellerOrders(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        List<Order> list = dataStore.getOrders().stream()
                .filter(o -> user.getId().equals(o.getSellerId()) || "admin".equals(user.getRole()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Order>> getOrderById(@PathVariable String id) {
        Order order = dataStore.getOrders().stream()
                .filter(o -> o.getId().equals(id))
                .findFirst()
                .orElse(dataStore.getOrders().isEmpty() ? null : dataStore.getOrders().get(0));
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<Order>> confirmOrder(@PathVariable String id) {
        Order order = findOrder(id);
        if (order != null) order.setStatus("CONFIRMED");
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping("/{id}/decline")
    public ResponseEntity<ApiResponse<Order>> declineOrder(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        Order order = findOrder(id);
        if (order != null) order.setStatus("DECLINED");
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping("/{id}/shipment")
    public ResponseEntity<ApiResponse<Order>> recordShipment(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Order order = findOrder(id);
        if (order != null) {
            order.setStatus("SHIPPED");
            if (body.containsKey("trackingNumber")) {
                order.setTrackingNumber((String) body.get("trackingNumber"));
            }
        }
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PatchMapping("/{id}/verify-payment")
    public ResponseEntity<ApiResponse<Order>> verifyPayment(@PathVariable String id) {
        Order order = findOrder(id);
        if (order != null) order.setPaymentStatus("VERIFIED");
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping("/{id}/utr")
    public ResponseEntity<ApiResponse<Order>> submitPaymentUtr(@PathVariable String id, @RequestBody Map<String, String> body) {
        Order order = findOrder(id);
        if (order != null) {
            order.setUtrNumber(body.get("utrNumber"));
            order.setPaymentStatus("SUBMITTED");
        }
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Order>> cancelOrder(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        Order order = findOrder(id);
        if (order != null) order.setStatus("CANCELLED");
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping("/{id}/packed")
    public ResponseEntity<ApiResponse<Order>> markOrderPacked(@PathVariable String id) {
        Order order = findOrder(id);
        if (order != null) {
            order.setStatus("PACKED");
            order.setFulfillmentStep("PACKED");
        }
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping("/{id}/fulfillment-step")
    public ResponseEntity<ApiResponse<Order>> updateFulfillmentStep(@PathVariable String id, @RequestBody Map<String, String> body) {
        Order order = findOrder(id);
        if (order != null && body.containsKey("step")) {
            order.setFulfillmentStep(body.get("step"));
        }
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ApiResponse<Order>> submitOrderReview(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Order order = findOrder(id);
        if (order != null) {
            if (body.containsKey("rating")) order.setReviewRating(Double.valueOf(body.get("rating").toString()));
            if (body.containsKey("comment")) order.setReviewComment((String) body.get("comment"));
        }
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    private Order findOrder(String id) {
        return dataStore.getOrders().stream().filter(o -> o.getId().equals(id)).findFirst().orElse(null);
    }
}
