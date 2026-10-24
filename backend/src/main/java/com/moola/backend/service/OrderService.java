package com.moola.backend.service;

import com.moola.backend.dto.OrderDto;
import com.moola.backend.model.Order;
import com.moola.backend.model.Product;
import com.moola.backend.model.SellerProfile;
import com.moola.backend.model.User;
import com.moola.backend.repository.OrderRepository;
import com.moola.backend.repository.ProductRepository;
import com.moola.backend.repository.SellerProfileRepository;
import com.moola.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        SellerProfileRepository sellerProfileRepository,
                        UserRepository userRepository,
                        NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Order directOrderRequest(String buyerId, OrderDto.DirectOrderRequest req) {
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (!product.isActive() || !product.isApproved()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product is currently unavailable");
        }

        Order order = new Order();
        order.setOrderNumber("ORD-" + (100000 + new Random().nextInt(900000)));
        order.setBuyerId(buyerId);
        order.setSellerId(product.getSellerId());

        Order.OrderItem item = new Order.OrderItem(
                product.getId(),
                product.getName().getEn(),
                product.getPrice(),
                req.getQty(),
                product.getUnit(),
                product.getThumbnailUrl()
        );
        order.getItems().add(item);

        double subtotal = product.getPrice() * req.getQty();
        order.setSubtotal(subtotal);
        order.setShippingFee(0);
        order.setDiscount(0);
        order.setTotal(subtotal);

        order.setShippingAddress(req.getShippingAddress());
        order.setStatus("ORDER_REQUESTED");
        order.setOrderStatus("ORDER_REQUESTED");
        order.setPaymentStatus("PAYMENT_PENDING");
        order.setShipmentStatus("NOT_SHIPPED");

        order.getStatusHistory().add(new Order.StatusHistoryItem("ORDER_REQUESTED", "Order request placed by customer"));

        order = orderRepository.save(order);
        enrichOrder(order);

        // Notify seller about incoming order
        try {
            notificationService.createNotification(
                    order.getSellerId(),
                    "New Order Request #" + order.getOrderNumber(),
                    "Order request placed by " + (order.getBuyerName() != null ? order.getBuyerName() : "Customer") + " for ₹" + order.getTotal() + ".",
                    "ORDER_STATUS",
                    order.getId(),
                    "ORDER"
            );
        } catch (Exception ignored) {}

        return order;
    }

    public Order createFromCart(String buyerId, OrderDto.CartOrderRequest req) {
        if (req.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        Order order = new Order();
        order.setOrderNumber("ORD-" + (100000 + new Random().nextInt(900000)));
        order.setBuyerId(buyerId);
        order.setSellerId(req.getSellerId());
        order.setItems(req.getItems());

        double subtotal = 0;
        for (Order.OrderItem it : req.getItems()) {
            subtotal += it.getPrice() * it.getQty();
        }
        order.setSubtotal(subtotal);
        order.setShippingFee(0);
        order.setTotal(subtotal);

        order.setShippingAddress(req.getShippingAddress());
        order.setStatus("ORDER_REQUESTED");
        order.setOrderStatus("ORDER_REQUESTED");
        order.setPaymentStatus("PAYMENT_PENDING");
        order.setShipmentStatus("NOT_SHIPPED");
        order.getStatusHistory().add(new Order.StatusHistoryItem("ORDER_REQUESTED", "Order placed via cart"));

        order = orderRepository.save(order);
        enrichOrder(order);

        // Notify seller about incoming order
        try {
            notificationService.createNotification(
                    order.getSellerId(),
                    "New Order Request #" + order.getOrderNumber(),
                    "Order placed via cart for ₹" + order.getTotal() + ".",
                    "ORDER_STATUS",
                    order.getId(),
                    "ORDER"
            );
        } catch (Exception ignored) {}

        return order;
    }

    public List<Order> getBuyerOrders(String buyerId) {
        List<Order> orders = orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
        orders.forEach(this::enrichOrder);
        return orders;
    }

    public List<Order> getSellerOrders(String sellerId) {
        List<Order> orders = orderRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
        orders.forEach(this::enrichOrder);
        return orders;
    }

    public Order getOrderById(String orderId, String userId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!isAdmin && !order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        enrichOrder(order);
        return order;
    }

    public Order submitPaymentUtr(String orderId, String buyerId, String utr) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getBuyerId().equals(buyerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        order.setPaymentReferenceUtr(utr);
        order.setPaymentReferenceSubmittedAt(Instant.now());
        order.setPaymentStatus("PAYMENT_VERIFICATION_PENDING");
        order.getStatusHistory().add(new Order.StatusHistoryItem("PAYMENT_VERIFICATION_PENDING", "Buyer submitted UPI UTR: " + utr));

        order.setUpdatedAt(Instant.now());
        order = orderRepository.save(order);
        enrichOrder(order);
        return order;
    }

    public Order confirmOrder(String orderId, String sellerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getSellerId().equals(sellerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        order.setStatus("ORDER_CONFIRMED");
        order.setOrderStatus("ORDER_CONFIRMED");
        order.getStatusHistory().add(new Order.StatusHistoryItem("ORDER_CONFIRMED", "Seller confirmed availability"));
        order.setUpdatedAt(Instant.now());
        order = orderRepository.save(order);
        enrichOrder(order);

        try {
            notificationService.createNotification(
                    order.getBuyerId(),
                    "Order Confirmed #" + order.getOrderNumber(),
                    "The maker confirmed your order. Fresh preparation in progress.",
                    "ORDER_STATUS",
                    order.getId(),
                    "ORDER"
            );
        } catch (Exception ignored) {}

        return order;
    }

    public Order declineOrder(String orderId, String sellerId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getSellerId().equals(sellerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        order.setStatus("CANCELLED");
        order.setOrderStatus("CANCELLED");
        order.setCancellationReason(reason != null ? reason : "Declined by seller");
        order.getStatusHistory().add(new Order.StatusHistoryItem("CANCELLED", "Seller declined: " + reason));
        order.setUpdatedAt(Instant.now());
        order = orderRepository.save(order);
        enrichOrder(order);

        try {
            notificationService.createNotification(
                    order.getBuyerId(),
                    "Order Declined #" + order.getOrderNumber(),
                    "Seller could not fulfill order: " + reason,
                    "ORDER_STATUS",
                    order.getId(),
                    "ORDER"
            );
        } catch (Exception ignored) {}

        return order;
    }

    public Order markPacked(String orderId, String sellerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getSellerId().equals(sellerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        order.setStatus("PACKED");
        order.setOrderStatus("PACKED");
        order.setShipmentStatus("PACKED");
        order.setCurrentStep(2);
        order.getStatusHistory().add(new Order.StatusHistoryItem("PACKED", "Order prepared and packed in kitchen"));
        order.setUpdatedAt(Instant.now());
        order = orderRepository.save(order);
        enrichOrder(order);

        try {
            notificationService.createNotification(
                    order.getBuyerId(),
                    "Order Packed Fresh #" + order.getOrderNumber(),
                    "Your batch has been packed and is ready for courier pickup.",
                    "ORDER_STATUS",
                    order.getId(),
                    "ORDER"
            );
        } catch (Exception ignored) {}

        return order;
    }

    public Order recordShipment(String orderId, String sellerId, OrderDto.ShipmentRequest req) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getSellerId().equals(sellerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        order.setCarrierName(req.getCarrierName() != null ? req.getCarrierName() : "India Post Speed Post");
        order.setConsignmentNumber(req.getConsignmentNumber());
        order.setTrackingUrl(req.getTrackingUrl() != null && !req.getTrackingUrl().isBlank()
                ? req.getTrackingUrl()
                : "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx");
        order.setDispatchNotes(req.getDispatchNotes());
        order.setDispatchDate(Instant.now());
        order.setStatus("HANDED_TO_COURIER");
        order.setOrderStatus("HANDED_TO_COURIER");
        order.setShipmentStatus("HANDED_TO_COURIER");
        order.setCurrentStep(3);
        order.getStatusHistory().add(new Order.StatusHistoryItem("HANDED_TO_COURIER",
                "Consignment handed over to " + order.getCarrierName() + " (AWB: " + req.getConsignmentNumber() + ")"));
        order.setUpdatedAt(Instant.now());
        order = orderRepository.save(order);
        enrichOrder(order);

        try {
            notificationService.createNotification(
                    order.getBuyerId(),
                    "Parcel Dispatched #" + order.getOrderNumber(),
                    "Handed over to " + order.getCarrierName() + " (AWB: " + req.getConsignmentNumber() + "). Track your parcel in app.",
                    "ORDER_STATUS",
                    order.getId(),
                    "ORDER"
            );
        } catch (Exception ignored) {}

        return order;
    }

    public Order updateFulfillmentStatus(String orderId, String userId, boolean isAdmin, String newStatus, String note) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!isAdmin && !order.getSellerId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        String st = newStatus.toUpperCase();
        order.setStatus(st);
        order.setOrderStatus(st);
        order.setShipmentStatus(st);

        if ("PACKED".equals(st)) {
            order.setCurrentStep(2);
        } else if ("HANDED_TO_COURIER".equals(st) || "SHIPPED".equals(st)) {
            order.setCurrentStep(3);
        } else if ("IN_TRANSIT".equals(st)) {
            order.setCurrentStep(4);
        } else if ("OUT_FOR_DELIVERY".equals(st)) {
            order.setCurrentStep(4);
        } else if ("DELIVERED".equals(st)) {
            order.setCurrentStep(5);
            order.setDeliveredAt(Instant.now());
        }

        order.getStatusHistory().add(new Order.StatusHistoryItem(st, note != null ? note : "Shipment status updated to " + st));
        order.setUpdatedAt(Instant.now());
        order = orderRepository.save(order);
        enrichOrder(order);

        try {
            notificationService.createNotification(
                    order.getBuyerId(),
                    "Shipment Update #" + order.getOrderNumber(),
                    "Your parcel status has been updated to: " + st + (note != null ? " (" + note + ")" : "") + ".",
                    "ORDER_STATUS",
                    order.getId(),
                    "ORDER"
            );
        } catch (Exception ignored) {}

        return order;
    }

    public Order submitReview(String orderId, String buyerId, int rating, String reviewNote) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getBuyerId().equals(buyerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        if (!"DELIVERED".equalsIgnoreCase(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reviews can only be submitted for delivered orders");
        }

        order.setRating(Math.max(1, Math.min(5, rating)));
        order.setReviewNote(reviewNote != null ? reviewNote.trim() : "");
        order.getStatusHistory().add(new Order.StatusHistoryItem("REVIEWED", "Customer submitted " + rating + "★ review"));
        order.setUpdatedAt(Instant.now());
        order = orderRepository.save(order);
        enrichOrder(order);
        return order;
    }

    public Order verifyPayment(String orderId, String sellerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getSellerId().equals(sellerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        order.setPaymentStatus("PAID");
        order.setStatus("PAID");
        order.getStatusHistory().add(new Order.StatusHistoryItem("PAID", "Seller verified UPI payment receipt"));
        order.setUpdatedAt(Instant.now());
        order = orderRepository.save(order);
        enrichOrder(order);
        return order;
    }

    public Order cancelOrder(String orderId, String userId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        order.setStatus("CANCELLED");
        order.setOrderStatus("CANCELLED");
        order.setCancellationReason(reason != null ? reason : "Cancelled by user");
        order.getStatusHistory().add(new Order.StatusHistoryItem("CANCELLED", "Order cancelled: " + reason));
        order.setUpdatedAt(Instant.now());
        order = orderRepository.save(order);
        enrichOrder(order);
        return order;
    }

    private void enrichOrder(Order order) {
        if (order.getBuyerId() != null) {
            userRepository.findById(order.getBuyerId()).ifPresent(u -> {
                order.setBuyerName(u.getName());
                order.setBuyerPhone(u.getPhone());
            });
        }
        if (order.getSellerId() != null) {
            userRepository.findById(order.getSellerId()).ifPresent(u -> {
                order.setSellerName(u.getName());
            });
            sellerProfileRepository.findByUserId(order.getSellerId()).ifPresent(sp -> {
                order.setSellerShopName(sp.getShopName());
                order.setSellerWhatsApp(sp.getWhatsappNumber());
                order.setSellerUpiId(sp.getUpiId());
            });
        }
    }
}
