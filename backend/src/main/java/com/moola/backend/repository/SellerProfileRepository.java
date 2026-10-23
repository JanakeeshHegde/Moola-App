package com.moola.backend.repository;

import com.moola.backend.model.SellerProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerProfileRepository extends MongoRepository<SellerProfile, String> {
    Optional<SellerProfile> findByUserId(String userId);
    List<SellerProfile> findByKycStatus(String kycStatus);
    long countByKycStatus(String kycStatus);
    long countByIsVerified(boolean isVerified);
}
