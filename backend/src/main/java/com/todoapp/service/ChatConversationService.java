package com.todoapp.service;

import com.todoapp.model.ChatConversation;
import com.todoapp.model.ChatMessage;
import com.todoapp.repository.ChatConversationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ChatConversationService {
    
    private static final Logger logger = LoggerFactory.getLogger(ChatConversationService.class);
    
    @Autowired
    private ChatConversationRepository conversationRepository;
    
    /**
     * Get or create a conversation for a user
     */
    public ChatConversation getOrCreateConversation(String userId, String conversationId) {
        if (conversationId == null || conversationId.trim().isEmpty()) {
            conversationId = generateMainConversationId(userId);
        }
        
        Optional<ChatConversation> existing = conversationRepository.findByUserIdAndConversationId(userId, conversationId);
        if (existing.isPresent()) {
            ChatConversation conversation = existing.get();
            // Extend expiration if conversation is accessed
            conversation.setExpiresAt(LocalDateTime.now().plusDays(7));
            return conversationRepository.save(conversation);
        }
        
        // Create new conversation
        ChatConversation conversation = new ChatConversation(userId, conversationId);
        return conversationRepository.save(conversation);
    }
    
    /**
     * Get main conversation for a user (creates if not exists)
     */
    public ChatConversation getMainConversation(String userId) {
        String mainConversationId = generateMainConversationId(userId);
        return getOrCreateConversation(userId, mainConversationId);
    }
      /**
     * Save a message to a conversation
     */
    public ChatConversation saveMessage(String userId, String conversationId, String role, String content) {
        ChatConversation conversation = getOrCreateConversation(userId, conversationId);
        ChatMessage message = new ChatMessage(role, content);
        conversation.addMessage(message);
        return conversationRepository.save(conversation);
    }
    
    /**
     * Save a file message to a conversation
     */
    public ChatConversation saveFileMessage(String userId, String conversationId, String content, String fileName) {
        ChatConversation conversation = getOrCreateConversation(userId, conversationId);
        conversation.addFileMessage(content, fileName);
        return conversationRepository.save(conversation);
    }
    
    /**
     * Get conversation by ID
     */
    public Optional<ChatConversation> getConversation(String conversationId) {
        return conversationRepository.findByConversationId(conversationId);
    }
    
    /**
     * Get all active conversations for a user
     */
    public List<ChatConversation> getUserConversations(String userId) {
        return conversationRepository.findActiveConversationsByUserId(userId, LocalDateTime.now());
    }
    
    /**
     * Delete a conversation
     */
    public void deleteConversation(String conversationId) {
        conversationRepository.findByConversationId(conversationId)
                .ifPresent(conversationRepository::delete);
    }
    
    /**
     * Generate main conversation ID for a user
     */
    private String generateMainConversationId(String userId) {
        return "main_" + userId;
    }
    
    /**
     * Clean up expired conversations (runs daily at 2 AM)
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupExpiredConversations() {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<ChatConversation> expired = conversationRepository.findExpiredConversations(now);
            
            if (!expired.isEmpty()) {
                conversationRepository.deleteAll(expired);
                logger.info("Cleaned up {} expired conversations", expired.size());
            }
        } catch (Exception e) {
            logger.error("Error during conversation cleanup: {}", e.getMessage(), e);
        }
    }
}
