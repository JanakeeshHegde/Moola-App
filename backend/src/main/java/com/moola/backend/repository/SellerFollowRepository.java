package com.moola.backend.repository;

import com.moola.backend.model.SellerFollow;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerFollowRepository extends MongoRepository<SellerFollow, String> {

    List<SellerFollow> findByBuyerIdOrderByCreatedAtDesc(String buyerId);

    List<SellerFollow> findBySellerIdOrderByCreatedAtDesc(String sellerId);

    long countBySellerId(String sellerId);

    boolean existsByBuyerIdAndSellerId(String buyerId, String sellerId);

    Optional<SellerFollow> findByBuyerIdAndSellerId(String buyerId, String sellerId);

    void deleteByBuyerIdAndSellerId(String buyerId, String sellerId);
}
