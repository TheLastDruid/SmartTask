package com.todoapp.dto;

import com.todoapp.model.ChatMessage;
import java.time.LocalDateTime;

public class ChatMessageDto {
    private String id;
    private String role;
    private String content;
    private LocalDateTime createdAt;
    private boolean isFile;
    private String fileName;
    
    // Constructors
    public ChatMessageDto() {}
    
    public ChatMessageDto(ChatMessage message) {
        this.id = message.getId();
        this.role = message.getRole();
        this.content = message.getContent();
        this.createdAt = message.getCreatedAt();
        this.isFile = message.isFile();
        this.fileName = message.getFileName();
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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
}
