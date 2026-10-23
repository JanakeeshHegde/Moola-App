package com.moola.backend.repository;

import com.moola.backend.model.Complaint;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends MongoRepository<Complaint, String> {
    Optional<Complaint> findByTicketId(String ticketId);
    List<Complaint> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Complaint> findByStatusOrderByCreatedAtDesc(String status);
    List<Complaint> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
    long countByUserIdAndStatusNotIn(String userId, List<String> closedStatuses);
}
