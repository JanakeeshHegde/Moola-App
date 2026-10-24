package com.moola.backend;

import com.moola.backend.dto.OrderDto;
import com.moola.backend.model.Order;
import com.moola.backend.repository.NotificationRepository;
import com.moola.backend.repository.OrderRepository;
import com.moola.backend.repository.ProductRepository;
import com.moola.backend.repository.SellerProfileRepository;
import com.moola.backend.repository.UserRepository;
import com.moola.backend.service.NotificationService;
import com.moola.backend.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class OwnershipSecurityTests {

    private OrderRepository orderRepository;
    private ProductRepository productRepository;
    private SellerProfileRepository sellerProfileRepository;
    private UserRepository userRepository;
    private NotificationRepository notificationRepository;
    private NotificationService notificationService;
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderRepository = Mockito.mock(OrderRepository.class);
        productRepository = Mockito.mock(ProductRepository.class);
        sellerProfileRepository = Mockito.mock(SellerProfileRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        notificationRepository = Mockito.mock(NotificationRepository.class);
        notificationService = new NotificationService(notificationRepository);
        orderService = new OrderService(orderRepository, productRepository, sellerProfileRepository, userRepository, notificationService);
    }

    @Test
    void testUnauthorizedSellerCannotShipAnotherSellersOrder() {
        Order order = new Order();
        order.setId("ord-123");
        order.setSellerId("seller-alice");
        order.setBuyerId("buyer-bob");
        order.setStatus("ORDER_CONFIRMED");

        when(orderRepository.findById("ord-123")).thenReturn(Optional.of(order));

        OrderDto.ShipmentRequest req = new OrderDto.ShipmentRequest();
        req.setCarrierName("India Post");
        req.setConsignmentNumber("EK123456789IN");

        // Attacker "seller-mallory" attempts to record shipment on Alice's order
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> orderService.recordShipment("ord-123", "seller-mallory", req));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void testUnauthorizedBuyerCannotSubmitUtrOnAnotherBuyersOrder() {
        Order order = new Order();
        order.setId("ord-456");
        order.setSellerId("seller-alice");
        order.setBuyerId("buyer-bob");

        when(orderRepository.findById("ord-456")).thenReturn(Optional.of(order));

        // Attacker "buyer-mallory" attempts to submit UTR for Bob's order
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> orderService.submitPaymentUtr("ord-456", "buyer-mallory", "UTR999999"));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void testBuyerCannotAccessAnotherBuyersPrivateOrder() {
        Order order = new Order();
        order.setId("ord-789");
        order.setSellerId("seller-alice");
        order.setBuyerId("buyer-bob");

        when(orderRepository.findById("ord-789")).thenReturn(Optional.of(order));

        // Attacker "buyer-mallory" attempts to read Bob's order without admin privileges
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> orderService.getOrderById("ord-789", "buyer-mallory", false));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void testAuthorizedSellerCanConfirmOrder() {
        Order order = new Order();
        order.setId("ord-123");
        order.setSellerId("seller-alice");
        order.setBuyerId("buyer-bob");
        order.setStatus("ORDER_REQUESTED");

        when(orderRepository.findById("ord-123")).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        Order confirmed = orderService.confirmOrder("ord-123", "seller-alice");
        assertEquals("ORDER_CONFIRMED", confirmed.getStatus());
    }
}
