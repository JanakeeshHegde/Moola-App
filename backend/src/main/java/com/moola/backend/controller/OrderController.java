package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.dto.OrderDto;
import com.moola.backend.model.Order;
import com.moola.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<Order>> directOrderRequest(Authentication authentication,
                                                                 @Valid @RequestBody OrderDto.DirectOrderRequest req) {
        String buyerId = (String) authentication.getPrincipal();
        Order order = orderService.directOrderRequest(buyerId, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(order, "Order request submitted to seller"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Order>> createFromCart(Authentication authentication,
                                                             @Valid @RequestBody OrderDto.CartOrderRequest req) {
        String buyerId = (String) authentication.getPrincipal();
        Order order = orderService.createFromCart(buyerId, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(order, "Order request submitted to seller"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Order>>> getBuyerOrders(Authentication authentication) {
        String buyerId = (String) authentication.getPrincipal();
        List<Order> orders = orderService.getBuyerOrders(buyerId);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/seller")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Order>>> getSellerOrders(Authentication authentication) {
        String sellerId = (String) authentication.getPrincipal();
        List<Order> orders = orderService.getSellerOrders(sellerId);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Order>> getOrderById(Authentication authentication,
                                                           @PathVariable String id) {
        String userId = (String) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Order order = orderService.getOrderById(id, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Order>> confirmOrder(Authentication authentication,
                                                           @PathVariable String id) {
        String sellerId = (String) authentication.getPrincipal();
        Order order = orderService.confirmOrder(id, sellerId);
        return ResponseEntity.ok(ApiResponse.ok(order, "Order confirmed by seller"));
    }

    @PostMapping("/{id}/decline")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Order>> declineOrder(Authentication authentication,
                                                           @PathVariable String id,
                                                           @RequestBody(required = false) Map<String, String> body) {
        String sellerId = (String) authentication.getPrincipal();
        String reason = body != null ? body.get("reason") : "Declined by seller";
        Order order = orderService.declineOrder(id, sellerId, reason);
        return ResponseEntity.ok(ApiResponse.ok(order, "Order declined"));
    }

    @PostMapping("/{id}/packed")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Order>> markPacked(Authentication authentication,
                                                         @PathVariable String id) {
        String sellerId = (String) authentication.getPrincipal();
        Order order = orderService.markPacked(id, sellerId);
        return ResponseEntity.ok(ApiResponse.ok(order, "Order marked as PACKED"));
    }

    @PostMapping("/{id}/shipment")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Order>> recordShipment(Authentication authentication,
                                                             @PathVariable String id,
                                                             @Valid @RequestBody OrderDto.ShipmentRequest req) {
        String sellerId = (String) authentication.getPrincipal();
        Order order = orderService.recordShipment(id, sellerId, req);
        return ResponseEntity.ok(ApiResponse.ok(order, "Shipment recorded successfully"));
    }

    @PostMapping("/{id}/fulfillment-step")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Order>> updateFulfillmentStep(Authentication authentication,
                                                                    @PathVariable String id,
                                                                    @RequestBody Map<String, String> body) {
        String userId = (String) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        String status = "IN_TRANSIT";
        if (body != null) {
            if (body.containsKey("status") && body.get("status") != null) {
                status = body.get("status");
            } else if (body.containsKey("step") && body.get("step") != null) {
                status = body.get("step");
            }
        }
        String note = body != null ? body.get("note") : null;
        Order order = orderService.updateFulfillmentStatus(id, userId, isAdmin, status, note);
        return ResponseEntity.ok(ApiResponse.ok(order, "Fulfillment step updated to " + status));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ApiResponse<Order>> submitReview(Authentication authentication,
                                                           @PathVariable String id,
                                                           @RequestBody Map<String, Object> body) {
        String buyerId = (String) authentication.getPrincipal();
        int rating = body.containsKey("rating") ? ((Number) body.get("rating")).intValue() : 5;
        String note = (String) body.get("reviewNote");
        Order order = orderService.submitReview(id, buyerId, rating, note);
        return ResponseEntity.ok(ApiResponse.ok(order, "Review submitted successfully"));
    }

    @PatchMapping("/{id}/verify-payment")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Order>> verifyPayment(Authentication authentication,
                                                            @PathVariable String id) {
        String sellerId = (String) authentication.getPrincipal();
        Order order = orderService.verifyPayment(id, sellerId);
        return ResponseEntity.ok(ApiResponse.ok(order, "Payment verified"));
    }

    @PostMapping("/{id}/utr")
    public ResponseEntity<ApiResponse<Order>> submitPaymentUtr(Authentication authentication,
                                                               @PathVariable String id,
                                                               @Valid @RequestBody OrderDto.VerifyPaymentRequest req) {
        String buyerId = (String) authentication.getPrincipal();
        Order order = orderService.submitPaymentUtr(id, buyerId, req.getUtr());
        return ResponseEntity.ok(ApiResponse.ok(order, "Payment reference UTR submitted for seller verification"));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Order>> cancelOrder(Authentication authentication,
                                                          @PathVariable String id,
                                                          @RequestBody(required = false) Map<String, String> body) {
        String userId = (String) authentication.getPrincipal();
        String reason = body != null ? body.get("reason") : "Cancelled";
        Order order = orderService.cancelOrder(id, userId, reason);
        return ResponseEntity.ok(ApiResponse.ok(order, "Order cancelled"));
    }
}
