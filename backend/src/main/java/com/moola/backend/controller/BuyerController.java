package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.dto.BuyerDashboardDto;
import com.moola.backend.dto.PublicSellerProfileDto;
import com.moola.backend.model.CustomRequest;
import com.moola.backend.model.Order;
import com.moola.backend.model.SellerProfile;
import com.moola.backend.model.User;
import com.moola.backend.repository.ConversationRepository;
import com.moola.backend.repository.NotificationRepository;
import com.moola.backend.repository.SellerFollowRepository;
import com.moola.backend.repository.UserRepository;
import com.moola.backend.service.CustomRequestService;
import com.moola.backend.service.OrderService;
import com.moola.backend.service.SellerFollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/buyer")
public class BuyerController {

    private final UserRepository userRepository;
    private final OrderService orderService;
    private final CustomRequestService customRequestService;
    private final SellerFollowService sellerFollowService;
    private final SellerFollowRepository sellerFollowRepository;
    private final ConversationRepository conversationRepository;
    private final NotificationRepository notificationRepository;

    public BuyerController(UserRepository userRepository,
                           OrderService orderService,
                           CustomRequestService customRequestService,
                           SellerFollowService sellerFollowService,
                           SellerFollowRepository sellerFollowRepository,
                           ConversationRepository conversationRepository,
                           NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.orderService = orderService;
        this.customRequestService = customRequestService;
        this.sellerFollowService = sellerFollowService;
        this.sellerFollowRepository = sellerFollowRepository;
        this.conversationRepository = conversationRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BuyerDashboardDto>> getBuyerDashboard(Authentication authentication) {
        String buyerId = (String) authentication.getPrincipal();

        User user = userRepository.findById(buyerId).orElse(null);
        if (user == null) {
            user = new User();
            user.setId(buyerId);
            user.setName("MOOLA Customer");
            user.setRole("buyer");
        }

        BuyerDashboardDto dto = new BuyerDashboardDto();
        dto.setUser(user);

        // 1. Orders
        List<Order> allOrders = orderService.getBuyerOrders(buyerId);
        dto.setTotalOrdersCount(allOrders.size());
        List<String> activeStatuses = Arrays.asList(
                "ORDER_REQUESTED", "ORDER_CONFIRMED", "PAID", "PACKED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"
        );
        long activeCount = allOrders.stream().filter(o -> {
            String st = o.getStatus() != null ? o.getStatus().toUpperCase() : "";
            return activeStatuses.contains(st);
        }).count();
        dto.setActiveOrdersCount(activeCount);
        dto.setRecentOrders(allOrders.stream().limit(3).collect(Collectors.toList()));

        // 2. Custom Demands & Reverse Offers
        List<CustomRequest> allDemands = customRequestService.getBuyerRequests(buyerId);
        dto.setTotalDemandsCount(allDemands.size());
        long activeDemands = allDemands.stream().filter(d -> {
            String st = d.getStatus() != null ? d.getStatus().toUpperCase() : "";
            return "OPEN".equals(st) || "OFFERS_RECEIVED".equals(st);
        }).count();
        dto.setActiveDemandsCount(activeDemands);
        dto.setRecentDemands(allDemands.stream().limit(3).collect(Collectors.toList()));

        // 3. Followed Artisan Shops
        List<SellerProfile> followedProfiles = sellerFollowService.getFollowedSellers(buyerId);
        dto.setFollowedShopsCount(followedProfiles.size());
        List<PublicSellerProfileDto> followedDtos = new ArrayList<>();
        for (SellerProfile sp : followedProfiles) {
            long followers = sellerFollowRepository.countBySellerId(sp.getUserId());
            String slug = PublicSellerProfileDto.generateSlug(sp.getShopName());
            PublicSellerProfileDto pDto = new PublicSellerProfileDto(
                    sp.getUserId(),
                    sp.getShopName() != null ? sp.getShopName() : "Artisan Kitchen",
                    "@" + slug,
                    sp.getDescription(),
                    sp.getLogo(),
                    sp.isVerified(),
                    sp.isVerified() ? "verified" : "pending",
                    sp.getAverageRating() > 0 ? sp.getAverageRating() : 4.8,
                    sp.getRatingCount(),
                    followers,
                    0
            );
            followedDtos.add(pDto);
        }
        dto.setFollowedShops(followedDtos);

        // 4. Unread Messages & Notifications
        long unreadChats = 0;
        try {
            unreadChats = conversationRepository.findByBuyerIdOrderByLastMessageAtDesc(buyerId)
                    .stream().mapToLong(c -> c.getBuyerUnreadCount()).sum();
        } catch (Exception ignored) {}
        dto.setUnreadMessagesCount(unreadChats);

        long unreadNotifs = 0;
        try {
            unreadNotifs = notificationRepository.countByRecipientIdAndIsReadFalse(buyerId);
        } catch (Exception ignored) {}
        dto.setUnreadNotificationsCount(unreadNotifs);

        return ResponseEntity.ok(ApiResponse.ok(dto));
    }
}
