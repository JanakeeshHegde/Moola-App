package com.moola.backend.repository;

import com.moola.backend.model.SeasonalCampaign;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeasonalCampaignRepository extends MongoRepository<SeasonalCampaign, String> {

    List<SeasonalCampaign> findByIsActiveTrueOrderByStartDateAsc();

    List<SeasonalCampaign> findBySellerIdOrderByCreatedAtDesc(String sellerId);

    List<SeasonalCampaign> findAllByOrderByCreatedAtDesc();
}
