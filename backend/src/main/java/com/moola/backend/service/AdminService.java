package com.moola.backend.service;

import com.moola.backend.model.Product;
import com.moola.backend.model.SellerProfile;
import com.moola.backend.model.User;
import com.moola.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ComplaintRepository complaintRepository;
    private final AccountDeletionRepository deletionRepository;

    public AdminService(UserRepository userRepository,
                        SellerProfileRepository sellerProfileRepository,
                        ProductRepository productRepository,
                        OrderRepository orderRepository,
                        ComplaintRepository complaintRepository,
                        AccountDeletionRepository deletionRepository) {
        this.userRepository = userRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.complaintRepository = complaintRepository;
        this.deletionRepository = deletionRepository;
    }

    public Map<String, Object> getAnalytics() {
        long totalBuyers = userRepository.countByRole("buyer");
        long totalSellers = userRepository.countByRole("seller");
        long verifiedSellers = sellerProfileRepository.countByIsVerified(true);
        long pendingKyc = sellerProfileRepository.countByKycStatus("pending") + sellerProfileRepository.countByKycStatus("under_review");
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        long pendingComplaints = complaintRepository.countByStatus("SUBMITTED") + complaintRepository.countByStatus("UNDER_REVIEW");
        long pendingDeletions = deletionRepository.countByStatus("PENDING");

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalBuyers", totalBuyers);
        analytics.put("totalSellers", totalSellers);
        analytics.put("verifiedSellers", verifiedSellers);
        analytics.put("pendingKyc", pendingKyc);
        analytics.put("totalProducts", totalProducts);
        analytics.put("totalOrders", totalOrders);
        analytics.put("pendingComplaints", pendingComplaints);
        analytics.put("pendingDeletions", pendingDeletions);
        return analytics;
    }

    public List<User> listBuyers() {
        return userRepository.findByRoleOrderByCreatedAtDesc("buyer");
    }

    public List<SellerProfile> listSellers() {
        return sellerProfileRepository.findAll();
    }

    public SellerProfile reviewSellerKyc(String sellerId, String action, String reason) {
        SellerProfile profile = sellerProfileRepository.findByUserId(sellerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller profile not found"));

        if ("approve".equalsIgnoreCase(action)) {
            profile.setKycStatus("verified");
            profile.setVerified(true);
            profile.setVerifiedAt(Instant.now());
            // Upgrade user role to seller if not already
            userRepository.findById(sellerId).ifPresent(u -> {
                u.setRole("seller");
                userRepository.save(u);
            });
        } else {
            profile.setKycStatus("rejected");
            profile.setVerified(false);
            profile.setRejectionReason(reason);
        }

        profile.setUpdatedAt(Instant.now());
        return sellerProfileRepository.save(profile);
    }

    public User updateBuyerStatus(String buyerId, boolean isActive) {
        User user = userRepository.findById(buyerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setActive(isActive);
        return userRepository.save(user);
    }

    public Product moderateProduct(String productId, boolean isApproved, String note) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        product.setApproved(isApproved);
        product.setModerationNote(note);
        product.setUpdatedAt(Instant.now());
        return productRepository.save(product);
    }
}
