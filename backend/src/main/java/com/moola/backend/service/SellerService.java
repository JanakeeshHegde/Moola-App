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

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
public class SellerService {

    private final SellerProfileRepository sellerProfileRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final WhatsAppEnquiryRepository enquiryRepository;

    public SellerService(SellerProfileRepository sellerProfileRepository,
                         ProductRepository productRepository,
                         OrderRepository orderRepository,
                         WhatsAppEnquiryRepository enquiryRepository) {
        this.sellerProfileRepository = sellerProfileRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.enquiryRepository = enquiryRepository;
    }

    public SellerProfile getProfile(String userId) {
        return sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller profile not found."));
    }

    public SellerProfile updateProfile(String userId, SellerProfile req) {
        SellerProfile profile = getProfile(userId);
        if (req.getShopName() != null && !req.getShopName().isBlank()) profile.setShopName(req.getShopName());
        if (req.getDescription() != null) profile.setDescription(req.getDescription());
        if (req.getWhatsappNumber() != null) profile.setWhatsappNumber(req.getWhatsappNumber());
        if (req.getUpiId() != null) profile.setUpiId(req.getUpiId());
        if (req.getPaymentInstructions() != null) profile.setPaymentInstructions(req.getPaymentInstructions());
        if (req.getLogo() != null) profile.setLogo(req.getLogo());

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

        Map<String, Object> res = new HashMap<>();
        res.put("totalProducts", totalProducts);
        res.put("activeProducts", activeProducts);
        res.put("newOrderRequests", newOrderRequests);
        res.put("pendingOrders", pendingOrders);
        res.put("whatsappEnquiries", pendingEnquiries);
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
