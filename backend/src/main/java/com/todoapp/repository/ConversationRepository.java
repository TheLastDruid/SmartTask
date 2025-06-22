package com.todoapp.repository;

import com.todoapp.model.ChatConversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<ChatConversation, String> {
    
    Optional<ChatConversation> findByConversationId(String conversationId);
    
    List<ChatConversation> findByUserIdOrderByUpdatedAtDesc(String userId);
    
    @Query("{'conversationId': ?0}")
    Optional<ChatConversation> findByConversationIdWithMessages(String conversationId);
    
    @Query("{'userId': ?0}")
    List<ChatConversation> findByUserIdWithMessagesOrderByUpdatedAtDesc(String userId);
    
    boolean existsByConversationId(String conversationId);
    
    Optional<ChatConversation> findByUserIdAndConversationId(String userId, String conversationId);
    
    void deleteByConversationId(String conversationId);
}
