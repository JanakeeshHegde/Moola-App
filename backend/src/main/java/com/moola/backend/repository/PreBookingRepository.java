package com.moola.backend.repository;

import com.moola.backend.model.PreBooking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreBookingRepository extends MongoRepository<PreBooking, String> {

    List<PreBooking> findByBuyerIdOrderByCreatedAtDesc(String buyerId);

    List<PreBooking> findBySellerIdOrderByCreatedAtDesc(String sellerId);

    List<PreBooking> findByCampaignIdOrderByCreatedAtDesc(String campaignId);
}
