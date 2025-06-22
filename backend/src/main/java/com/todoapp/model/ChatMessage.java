package com.todoapp.model;

import java.time.LocalDateTime;

public class ChatMessage {
    private String id;
    private String role; // "user" or "assistant"
    private String content;
    private LocalDateTime timestamp;
    private String messageType; // "text", "file", "task_confirmation", etc.
    private boolean isFile = false;
    private String fileName;
    
    public ChatMessage() {
        this.timestamp = LocalDateTime.now();
    }
    
    public ChatMessage(String role, String content) {
        this();
        this.role = role;
        this.content = content;
        this.messageType = "text";
    }
    
    public ChatMessage(String role, String content, String messageType) {
        this();
        this.role = role;
        this.content = content;
        this.messageType = messageType;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getMessageType() {
        return messageType;
    }
    
    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }
    
    public boolean isFile() {
        return isFile;
    }
    
    public void setFile(boolean file) {
        isFile = file;
    }
    
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    // Helper methods for backward compatibility
    public LocalDateTime getCreatedAt() {
        return timestamp;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.timestamp = createdAt;
    }
}
