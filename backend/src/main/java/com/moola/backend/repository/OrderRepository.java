package com.moola.backend.repository;

import com.moola.backend.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByBuyerIdOrderByCreatedAtDesc(String buyerId);
    List<Order> findBySellerIdOrderByCreatedAtDesc(String sellerId);
    List<Order> findByStatusOrderByCreatedAtDesc(String status);
    List<Order> findAllByOrderByCreatedAtDesc();
    long countByBuyerId(String buyerId);
    long countBySellerId(String sellerId);
    long countBySellerIdAndStatus(String sellerId, String status);
    long countByBuyerIdAndStatusNotIn(String buyerId, List<String> terminalStatuses);
}
