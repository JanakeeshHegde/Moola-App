package com.moola.backend.repository;

import com.moola.backend.model.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {

    List<Conversation> findByParticipantsContainingOrderByLastMessageAtDesc(String userId);

    Optional<Conversation> findByParticipantsContainingAndParticipantsContaining(String user1, String user2);

    List<Conversation> findByBuyerIdOrderByLastMessageAtDesc(String buyerId);

    List<Conversation> findBySellerIdOrderByLastMessageAtDesc(String sellerId);
}
