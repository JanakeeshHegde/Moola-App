package com.moola.backend.repository;

import com.moola.backend.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findBySellerIdOrderByCreatedAtDesc(String sellerId);
    List<Product> findByCategoryIdAndIsActiveAndIsApproved(String categoryId, boolean isActive, boolean isApproved);
    List<Product> findByIsActiveAndIsApprovedOrderByCreatedAtDesc(boolean isActive, boolean isApproved);
    List<Product> findByIsActiveAndIsApprovedAndIsOrganicOrderByCreatedAtDesc(boolean isActive, boolean isApproved, boolean isOrganic);
    List<Product> findByIsApproved(boolean isApproved);
    long countBySellerId(String sellerId);
    long countBySellerIdAndIsActiveAndIsApproved(String sellerId, boolean isActive, boolean isApproved);
}
