package com.todoapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Document(collection = "chat_conversations")
public class ChatConversation {
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    @Indexed
    private String conversationId;
    
    private List<ChatMessage> messages;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Indexed(expireAfterSeconds = 604800) // 7 days = 604800 seconds
    private LocalDateTime expiresAt;
    
    public ChatConversation() {
        this.messages = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusDays(7);
    }
    
    public ChatConversation(String userId, String conversationId) {
        this();
        this.userId = userId;
        this.conversationId = conversationId;
    }
      public void addMessage(ChatMessage message) {
        this.messages.add(message);
        this.updatedAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusDays(7); // Reset expiration
    }
    
    public void addMessage(String role, String content) {
        ChatMessage message = new ChatMessage(role, content);
        addMessage(message);
    }
    
    public void addFileMessage(String content, String fileName) {
        ChatMessage message = new ChatMessage("user", content);
        message.setFile(true);
        message.setFileName(fileName);
        addMessage(message);
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getConversationId() {
        return conversationId;
    }
    
    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }
    
    public List<ChatMessage> getMessages() {
        return messages;
    }
    
    public void setMessages(List<ChatMessage> messages) {
        this.messages = messages;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
}