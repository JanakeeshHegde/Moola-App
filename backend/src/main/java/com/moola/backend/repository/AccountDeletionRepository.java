package com.moola.backend.repository;

import com.moola.backend.model.AccountDeletionRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountDeletionRepository extends MongoRepository<AccountDeletionRequest, String> {
    Optional<AccountDeletionRequest> findByRequestId(String requestId);
    Optional<AccountDeletionRequest> findFirstByUserIdOrderByCreatedAtDesc(String userId);
    List<AccountDeletionRequest> findByStatusOrderByCreatedAtDesc(String status);
    List<AccountDeletionRequest> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
}
