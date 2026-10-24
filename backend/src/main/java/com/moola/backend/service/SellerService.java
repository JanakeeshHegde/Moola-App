package com.moola.backend.service;

import com.moola.backend.model.Product;
import com.moola.backend.model.SellerProfile;
import com.moola.backend.repository.OrderRepository;
import com.moola.backend.repository.ProductRepository;
import com.moola.backend.repository.SellerProfileRepository;
import com.moola.backend.repository.WhatsAppEnquiryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.moola.backend.repository.UserRepository;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
public class SellerService {

    private final SellerProfileRepository sellerProfileRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final WhatsAppEnquiryRepository enquiryRepository;
    private final UserRepository userRepository;
    private final com.moola.backend.repository.SellerFollowRepository sellerFollowRepository;

    public SellerService(SellerProfileRepository sellerProfileRepository,
                         ProductRepository productRepository,
                         OrderRepository orderRepository,
                         WhatsAppEnquiryRepository enquiryRepository,
                         UserRepository userRepository,
                         com.moola.backend.repository.SellerFollowRepository sellerFollowRepository) {
        this.sellerProfileRepository = sellerProfileRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.enquiryRepository = enquiryRepository;
        this.userRepository = userRepository;
        this.sellerFollowRepository = sellerFollowRepository;
    }

    public SellerProfile getProfile(String userId) {
        return sellerProfileRepository.findByUserId(userId).orElseGet(() -> {
            com.moola.backend.model.User user = userRepository.findById(userId).orElse(null);
            if (user != null && ("seller".equalsIgnoreCase(user.getRole()) || "admin".equalsIgnoreCase(user.getRole()))) {
                SellerProfile profile = new SellerProfile();
                profile.setUserId(userId);
                profile.setShopName(user.getName() != null ? user.getName() + "'s Kitchen" : "Artisan Kitchen");
                profile.setDescription("Authentic homemade products prepared fresh upon order placement.");
                profile.setWhatsappNumber(user.getPhone());
                profile.setKycStatus("verified");
                profile.setVerified(true);
                return sellerProfileRepository.save(profile);
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller profile not found.");
        });
    }

    public SellerProfile updateProfile(String userId, SellerProfile req) {
        SellerProfile profile = getProfile(userId);
        if (req.getShopName() != null && !req.getShopName().isBlank()) {
            String name = req.getShopName().trim();
            if (name.length() < 3 || name.length() > 60) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Shop name must be between 3 and 60 characters");
            }
            profile.setShopName(name);
        }
        if (req.getDescription() != null) {
            String desc = req.getDescription().trim();
            if (desc.length() > 500) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description must not exceed 500 characters");
            }
            profile.setDescription(desc);
        }
        if (req.getWhatsappNumber() != null) profile.setWhatsappNumber(req.getWhatsappNumber().trim());
        if (req.getUpiId() != null) profile.setUpiId(req.getUpiId().trim());
        if (req.getPaymentInstructions() != null) profile.setPaymentInstructions(req.getPaymentInstructions().trim());
        if (req.getLogo() != null) profile.setLogo(req.getLogo().trim());

        profile.setUpdatedAt(Instant.now());
        return sellerProfileRepository.save(profile);
    }

    public SellerProfile applyForSeller(String userId, String shopName, String description, String whatsapp) {
        SellerProfile profile = sellerProfileRepository.findByUserId(userId).orElse(new SellerProfile());
        profile.setUserId(userId);
        profile.setShopName(shopName);
        profile.setDescription(description);
        profile.setWhatsappNumber(whatsapp);
        profile.setKycStatus("pending");
        profile.setVerified(false);
        profile.setUpdatedAt(Instant.now());
        return sellerProfileRepository.save(profile);
    }

    public Map<String, Object> getAnalytics(String userId) {
        SellerProfile profile = getProfile(userId);
        long totalProducts = productRepository.countBySellerId(userId);
        long activeProducts = productRepository.countBySellerIdAndIsActiveAndIsApproved(userId, true, true);
        long newOrderRequests = orderRepository.countBySellerIdAndStatus(userId, "ORDER_REQUESTED");
        long pendingOrders = orderRepository.countBySellerIdAndStatus(userId, "ORDER_CONFIRMED")
                + orderRepository.countBySellerIdAndStatus(userId, "PAID");
        long pendingEnquiries = enquiryRepository.countBySellerIdAndStatus(userId, "initiated");
        long followerCount = 0;
        try {
            followerCount = sellerFollowRepository.countBySellerId(userId);
        } catch (Exception ignored) {}

        Map<String, Object> res = new HashMap<>();
        res.put("totalProducts", totalProducts);
        res.put("activeProducts", activeProducts);
        res.put("newOrderRequests", newOrderRequests);
        res.put("pendingOrders", pendingOrders);
        res.put("whatsappEnquiries", pendingEnquiries);
        res.put("followerCount", followerCount);
        res.put("totalSales", profile.getTotalSales());
        res.put("totalRevenue", profile.getTotalRevenue());
        res.put("averageRating", profile.getAverageRating());
        res.put("kycStatus", profile.getKycStatus());
        res.put("isVerified", profile.isVerified());
        res.put("shopName", profile.getShopName());
        res.put("whatsappNumber", profile.getWhatsappNumber());
        res.put("upiId", profile.getUpiId());
        res.put("paymentInstructions", profile.getPaymentInstructions());
        return res;
    }
}
