package com.moola.backend.service;

import com.moola.backend.model.CustomRequest;
import com.moola.backend.model.Order;
import com.moola.backend.model.SellerProfile;
import com.moola.backend.model.User;
import com.moola.backend.repository.CustomRequestRepository;
import com.moola.backend.repository.OrderRepository;
import com.moola.backend.repository.SellerProfileRepository;
import com.moola.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class CustomRequestService {

    private final CustomRequestRepository customRequestRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final NotificationService notificationService;

    public CustomRequestService(CustomRequestRepository customRequestRepository,
                                OrderRepository orderRepository,
                                UserRepository userRepository,
                                SellerProfileRepository sellerProfileRepository,
                                NotificationService notificationService) {
        this.customRequestRepository = customRequestRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.notificationService = notificationService;
    }

    public CustomRequest createRequest(String buyerId, Map<String, Object> req) {
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String title = (String) req.get("title");
        String categoryId = (String) req.get("categoryId");
        String categoryName = (String) req.get("categoryName");
        Number qtyNum = (Number) req.get("quantity");
        String unit = (String) req.get("unit");
        Number budgetNum = (Number) req.get("budget");
        String deliveryLocation = (String) req.get("deliveryLocation");
        String description = (String) req.get("description");

        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product request title is required");
        }
        if (qtyNum == null || qtyNum.doubleValue() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valid quantity is required");
        }
        if (unit == null || unit.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unit is required");
        }

        CustomRequest request = new CustomRequest();
        request.setBuyerId(buyerId);
        request.setBuyerName(buyer.getName());
        request.setBuyerPhone(buyer.getPhone());
        request.setTitle(title.trim());
        request.setCategoryId(categoryId);
        request.setCategoryName(categoryName != null ? categoryName : "Homemade Pantry");
        request.setQuantity(qtyNum.doubleValue());
        request.setUnit(unit.trim());
        if (budgetNum != null) {
            request.setBudget(budgetNum.doubleValue());
        }
        request.setDeliveryLocation(deliveryLocation != null ? deliveryLocation : "");
        request.setDescription(description != null ? description : "");

        int expiresInDays = 7;
        if (req.containsKey("expiresInDays") && req.get("expiresInDays") instanceof Number) {
            expiresInDays = Math.max(1, Math.min(30, ((Number) req.get("expiresInDays")).intValue()));
        }
        request.setExpiresAt(Instant.now().plus(expiresInDays, ChronoUnit.DAYS));
        request.setStatus("OPEN");
        request = customRequestRepository.save(request);

        // Notify active makers about the buyer demand
        try {
            List<SellerProfile> sellers = sellerProfileRepository.findAll();
            for (SellerProfile sp : sellers) {
                if (sp.getUserId() != null && !sp.getUserId().equals(buyerId)) {
                    notificationService.createNotification(
                            sp.getUserId(),
                            "New Buyer Demand: " + request.getTitle(),
                            request.getBuyerName() + " posted a requirement for " + request.getQuantity() + " " + request.getUnit() + " of " + request.getTitle() + ".",
                            "BUYER_REQUEST",
                            request.getId(),
                            "CUSTOM_REQUEST"
                    );
                }
            }
        } catch (Exception ignored) {}

        return request;
    }

    public List<CustomRequest> getBuyerRequests(String buyerId) {
        List<CustomRequest> list = customRequestRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
        updateExpiredStatuses(list);
        return list;
    }

    public List<CustomRequest> getSellerBoardRequests() {
        Instant now = Instant.now();
        List<CustomRequest> list = customRequestRepository.findByStatusInAndExpiresAtAfterOrderByCreatedAtDesc(
                Arrays.asList("OPEN", "OFFERS_RECEIVED"), now);
        return list;
    }

    public CustomRequest getRequestById(String id, String userId, boolean isAdmin) {
        CustomRequest req = customRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        updateExpiredStatus(req);
        return req;
    }

    public CustomRequest submitOffer(String requestId, String sellerId, Map<String, Object> body) {
        CustomRequest req = customRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        updateExpiredStatus(req);
        if (!"OPEN".equals(req.getStatus()) && !"OFFERS_RECEIVED".equals(req.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This request is no longer accepting offers");
        }
        if (req.getExpiresAt() != null && Instant.now().isAfter(req.getExpiresAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This request has expired");
        }

        // Check if seller already has active offer
        for (CustomRequest.Offer o : req.getOffers()) {
            if (sellerId.equals(o.getSellerId()) && ("PENDING".equals(o.getStatus()) || "ACCEPTED".equals(o.getStatus()))) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already submitted an active offer for this request");
            }
        }

        SellerProfile sellerProfile = sellerProfileRepository.findByUserId(sellerId).orElse(null);
        User sellerUser = userRepository.findById(sellerId).orElse(null);

        Number priceNum = (Number) body.get("price");
        if (priceNum == null || priceNum.doubleValue() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valid offer price is required");
        }

        Number qtyNum = (Number) body.get("quantity");
        double offerQty = qtyNum != null ? qtyNum.doubleValue() : req.getQuantity();

        Number daysNum = (Number) body.get("deliveryEstimateDays");
        int estDays = daysNum != null ? daysNum.intValue() : 3;

        String message = (String) body.get("message");

        CustomRequest.Offer offer = new CustomRequest.Offer();
        offer.setId("off-" + System.currentTimeMillis() + "-" + new Random().nextInt(1000));
        offer.setSellerId(sellerId);
        offer.setSellerName(sellerUser != null ? sellerUser.getName() : "Artisan Maker");
        offer.setSellerShopName(sellerProfile != null ? sellerProfile.getShopName() : "Kitchen");
        offer.setSellerRating(sellerProfile != null ? sellerProfile.getAverageRating() : 5.0);
        offer.setPrice(priceNum.doubleValue());
        offer.setQuantity(offerQty);
        offer.setUnit(req.getUnit());
        offer.setDeliveryEstimateDays(estDays);
        offer.setMessage(message != null ? message : "Fresh homemade preparation ready for dispatch.");
        offer.setStatus("PENDING");
        offer.setCreatedAt(Instant.now());

        req.getOffers().add(offer);
        req.setStatus("OFFERS_RECEIVED");
        req.setUpdatedAt(Instant.now());

        req = customRequestRepository.save(req);

        // Notify requesting buyer about the new offer
        try {
            notificationService.createNotification(
                    req.getBuyerId(),
                    "New Offer Received for " + req.getTitle(),
                    offer.getSellerShopName() + " submitted an offer of ₹" + offer.getPrice() + " for " + offer.getQuantity() + " " + offer.getUnit() + ".",
                    "SELLER_OFFER",
                    req.getId(),
                    "CUSTOM_REQUEST"
            );
        } catch (Exception ignored) {}

        return req;
    }

    public CustomRequest acceptOffer(String requestId, String offerId, String buyerId) {
        CustomRequest req = customRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        if (!buyerId.equals(req.getBuyerId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the request owner can accept an offer");
        }

        if ("ACCEPTED".equals(req.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "An offer has already been accepted for this request");
        }

        updateExpiredStatus(req);
        if (req.getExpiresAt() != null && Instant.now().isAfter(req.getExpiresAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This request has expired and offers cannot be accepted");
        }

        CustomRequest.Offer selectedOffer = null;
        for (CustomRequest.Offer o : req.getOffers()) {
            if (offerId.equals(o.getId())) {
                selectedOffer = o;
                break;
            }
        }

        if (selectedOffer == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer not found");
        }
        if (!"PENDING".equals(selectedOffer.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Offer is no longer pending");
        }

        // Accept chosen offer, reject all other offers
        for (CustomRequest.Offer o : req.getOffers()) {
            if (offerId.equals(o.getId())) {
                o.setStatus("ACCEPTED");
            } else if ("PENDING".equals(o.getStatus())) {
                o.setStatus("REJECTED");
            }
        }

        req.setAcceptedOfferId(offerId);
        req.setAcceptedAt(Instant.now());
        req.setStatus("ACCEPTED");

        // Convert accepted offer to Order automatically
        if (req.getResultingOrderId() == null) {
            Order order = new Order();
            order.setOrderNumber("ORD-REQ-" + (100000 + new Random().nextInt(900000)));
            order.setBuyerId(buyerId);
            order.setSellerId(selectedOffer.getSellerId());

            Order.OrderItem item = new Order.OrderItem(
                    "custom-req-" + req.getId(),
                    req.getTitle(),
                    selectedOffer.getPrice(),
                    (int) Math.round(selectedOffer.getQuantity()),
                    req.getUnit(),
                    req.getImages().isEmpty() ? null : req.getImages().get(0)
            );
            order.getItems().add(item);
            order.setSubtotal(selectedOffer.getPrice());
            order.setTotal(selectedOffer.getPrice());
            order.setStatus("ORDER_CONFIRMED");
            order.setOrderStatus("ORDER_CONFIRMED");
            order.setPaymentStatus("PAYMENT_PENDING");
            order.setShipmentStatus("NOT_SHIPPED");

            Order.ShippingAddress addr = new Order.ShippingAddress();
            addr.setName(req.getBuyerName());
            addr.setPhone(req.getBuyerPhone());
            addr.setLine1(req.getDeliveryLocation() != null ? req.getDeliveryLocation() : "Customer Address");
            addr.setCity("Customer City");
            addr.setState("Karnataka");
            addr.setPincode("560001");
            order.setShippingAddress(addr);

            order.getStatusHistory().add(new Order.StatusHistoryItem("ORDER_CONFIRMED",
                    "Order created from accepted custom request: " + req.getTitle() + " (Offer ₹" + selectedOffer.getPrice() + ")"));

            order = orderRepository.save(order);
            req.setResultingOrderId(order.getId());

            // Notify seller of accepted offer
            try {
                notificationService.createNotification(
                        selectedOffer.getSellerId(),
                        "Offer Accepted! Order #" + order.getOrderNumber(),
                        req.getBuyerName() + " accepted your offer for " + req.getTitle() + ". Order has been confirmed.",
                        "ORDER_STATUS",
                        order.getId(),
                        "ORDER"
                );
            } catch (Exception ignored) {}
        }

        req.setUpdatedAt(Instant.now());
        return customRequestRepository.save(req);
    }

    public CustomRequest cancelRequest(String requestId, String buyerId) {
        CustomRequest req = customRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        if (!buyerId.equals(req.getBuyerId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        if ("ACCEPTED".equals(req.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Accepted request cannot be cancelled");
        }

        req.setStatus("CANCELLED");
        for (CustomRequest.Offer o : req.getOffers()) {
            if ("PENDING".equals(o.getStatus())) {
                o.setStatus("REJECTED");
            }
        }
        req.setUpdatedAt(Instant.now());
        return customRequestRepository.save(req);
    }

    private void updateExpiredStatuses(List<CustomRequest> list) {
        Instant now = Instant.now();
        for (CustomRequest r : list) {
            if (("OPEN".equals(r.getStatus()) || "OFFERS_RECEIVED".equals(r.getStatus()))
                    && r.getExpiresAt() != null && now.isAfter(r.getExpiresAt())) {
                r.setStatus("EXPIRED");
                customRequestRepository.save(r);
            }
        }
    }

    private void updateExpiredStatus(CustomRequest r) {
        Instant now = Instant.now();
        if (("OPEN".equals(r.getStatus()) || "OFFERS_RECEIVED".equals(r.getStatus()))
                && r.getExpiresAt() != null && now.isAfter(r.getExpiresAt())) {
            r.setStatus("EXPIRED");
            customRequestRepository.save(r);
        }
    }
}
