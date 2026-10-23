package com.moola.backend.repository;

import com.moola.backend.model.WhatsAppEnquiry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WhatsAppEnquiryRepository extends MongoRepository<WhatsAppEnquiry, String> {
    List<WhatsAppEnquiry> findBySellerIdOrderByCreatedAtDesc(String sellerId);
    List<WhatsAppEnquiry> findByBuyerIdOrderByCreatedAtDesc(String buyerId);
    long countBySellerIdAndStatus(String sellerId, String status);
}
