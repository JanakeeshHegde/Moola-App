package com.moola.backend;

import com.moola.backend.controller.BuyerController;
import com.moola.backend.dto.ApiResponse;
import com.moola.backend.dto.BuyerDashboardDto;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class BuyerDashboardTests {

    private UserRepository userRepository;
    private OrderService orderService;
    private CustomRequestService customRequestService;
    private SellerFollowService sellerFollowService;
    private SellerFollowRepository sellerFollowRepository;
    private ConversationRepository conversationRepository;
    private NotificationRepository notificationRepository;
    private BuyerController buyerController;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        orderService = Mockito.mock(OrderService.class);
        customRequestService = Mockito.mock(CustomRequestService.class);
        sellerFollowService = Mockito.mock(SellerFollowService.class);
        sellerFollowRepository = Mockito.mock(SellerFollowRepository.class);
        conversationRepository = Mockito.mock(ConversationRepository.class);
        notificationRepository = Mockito.mock(NotificationRepository.class);

        buyerController = new BuyerController(
                userRepository,
                orderService,
                customRequestService,
                sellerFollowService,
                sellerFollowRepository,
                conversationRepository,
                notificationRepository
        );
    }

    @Test
    void testBuyerDashboardReturnsAccurateOrderAndDemandsData() {
        String buyerId = "buyer-001";
        Authentication auth = new UsernamePasswordAuthenticationToken(buyerId, null);

        User buyer = new User();
        buyer.setId(buyerId);
        buyer.setName("Arjun Sharma");
        buyer.setPhone("9000000003");
        buyer.setRole("buyer");
        when(userRepository.findById(buyerId)).thenReturn(Optional.of(buyer));

        Order order = new Order();
        order.setId("ord-1");
        order.setBuyerId(buyerId);
        order.setStatus("IN_TRANSIT");
        order.setTotal(450.0);
        when(orderService.getBuyerOrders(buyerId)).thenReturn(List.of(order));

        CustomRequest req = new CustomRequest();
        req.setId("req-1");
        req.setTitle("Pure Forest Honey");
        req.setStatus("OPEN");
        when(customRequestService.getBuyerRequests(buyerId)).thenReturn(List.of(req));

        SellerProfile sellerProfile = new SellerProfile();
        sellerProfile.setUserId("seller-001");
        sellerProfile.setShopName("Kodagu Forest Honey & Spices");
        sellerProfile.setVerified(true);
        when(sellerFollowService.getFollowedSellers(buyerId)).thenReturn(List.of(sellerProfile));
        when(sellerFollowRepository.countBySellerId("seller-001")).thenReturn(12L);

        when(conversationRepository.findByBuyerIdOrderByLastMessageAtDesc(buyerId)).thenReturn(Collections.emptyList());
        when(notificationRepository.countByRecipientIdAndIsReadFalse(buyerId)).thenReturn(2L);

        ResponseEntity<ApiResponse<BuyerDashboardDto>> response = buyerController.getBuyerDashboard(auth);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());

        BuyerDashboardDto dto = response.getBody().getData();
        assertNotNull(dto);
        assertEquals("Arjun Sharma", dto.getUser().getName());
        assertEquals(1, dto.getActiveOrdersCount());
        assertEquals(1, dto.getTotalOrdersCount());
        assertEquals(1, dto.getActiveDemandsCount());
        assertEquals(1, dto.getFollowedShopsCount());
        assertEquals("Kodagu Forest Honey & Spices", dto.getFollowedShops().get(0).getShopName());
        assertEquals(2L, dto.getUnreadNotificationsCount());
    }

    @Test
    void testEmptyBuyerDashboardProvidesSafeEmptyStatesWithoutFailures() {
        String buyerId = "buyer-empty";
        Authentication auth = new UsernamePasswordAuthenticationToken(buyerId, null);

        when(userRepository.findById(buyerId)).thenReturn(Optional.empty());
        when(orderService.getBuyerOrders(buyerId)).thenReturn(Collections.emptyList());
        when(customRequestService.getBuyerRequests(buyerId)).thenReturn(Collections.emptyList());
        when(sellerFollowService.getFollowedSellers(buyerId)).thenReturn(Collections.emptyList());
        when(conversationRepository.findByBuyerIdOrderByLastMessageAtDesc(buyerId)).thenReturn(Collections.emptyList());
        when(notificationRepository.countByRecipientIdAndIsReadFalse(buyerId)).thenReturn(0L);

        ResponseEntity<ApiResponse<BuyerDashboardDto>> response = buyerController.getBuyerDashboard(auth);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());

        BuyerDashboardDto dto = response.getBody().getData();
        assertNotNull(dto);
        assertEquals(0, dto.getActiveOrdersCount());
        assertEquals(0, dto.getTotalOrdersCount());
        assertTrue(dto.getRecentOrders().isEmpty());
        assertEquals(0, dto.getActiveDemandsCount());
        assertTrue(dto.getFollowedShops().isEmpty());
        assertEquals(0L, dto.getUnreadNotificationsCount());
    }
}
