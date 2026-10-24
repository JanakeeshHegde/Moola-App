package com.moola.backend.repository;

import com.moola.backend.model.CustomRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface CustomRequestRepository extends MongoRepository<CustomRequest, String> {

    List<CustomRequest> findByBuyerIdOrderByCreatedAtDesc(String buyerId);

    List<CustomRequest> findByStatusInAndExpiresAtAfterOrderByCreatedAtDesc(List<String> statuses, Instant now);

    List<CustomRequest> findAllByOrderByCreatedAtDesc();
}
