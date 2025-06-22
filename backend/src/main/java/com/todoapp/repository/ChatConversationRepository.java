package com.todoapp.repository;

import com.todoapp.model.ChatConversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatConversationRepository extends MongoRepository<ChatConversation, String> {
    
    Optional<ChatConversation> findByConversationId(String conversationId);
    
    List<ChatConversation> findByUserIdOrderByUpdatedAtDesc(String userId);
    
    Optional<ChatConversation> findByUserIdAndConversationId(String userId, String conversationId);
    
    @Query("{'userId': ?0, 'expiresAt': {'$gte': ?1}}")
    List<ChatConversation> findActiveConversationsByUserId(String userId, LocalDateTime now);
    
    @Query("{'expiresAt': {'$lt': ?0}}")
    List<ChatConversation> findExpiredConversations(LocalDateTime now);
    
    boolean existsByConversationId(String conversationId);
    
    void deleteByExpiresAtBefore(LocalDateTime expiredBefore);
}
