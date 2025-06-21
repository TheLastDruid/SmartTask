package com.todoapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.todoapp.service.RedisPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import jakarta.annotation.PostConstruct;
import java.util.Map;

@Controller
@CrossOrigin(origins = "http://localhost:3000")
public class WebSocketController implements MessageListener {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private RedisMessageListenerContainer redisMessageListenerContainer;

    @Autowired
    private ObjectMapper objectMapper;

    @PostConstruct
    public void init() {
        // Subscribe to Redis channels
        redisMessageListenerContainer.addMessageListener(this, new ChannelTopic("task_updates"));
        redisMessageListenerContainer.addMessageListener(this, new ChannelTopic("user_updates"));
        redisMessageListenerContainer.addMessageListener(this, new ChannelTopic("system_notifications"));
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String channel = new String(pattern);
            String messageBody = new String(message.getBody());
            
            // Parse the Redis message
            Map<String, Object> messageData = objectMapper.readValue(messageBody, Map.class);
            
            // Route message based on channel and content
            routeMessage(channel, messageData);
            
        } catch (Exception e) {
            System.err.println("Error processing Redis message: " + e.getMessage());
        }
    }

    private void routeMessage(String channel, Map<String, Object> messageData) {
        String messageType = (String) messageData.get("type");
        
        switch (channel) {
            case "task_updates":
                handleTaskUpdate(messageData);
                break;
            case "user_updates":
                handleUserUpdate(messageData);
                break;
            case "system_notifications":
                handleSystemNotification(messageData);
                break;
            default:
                // Handle user-specific channels
                if (channel.startsWith("user_")) {
                    handleUserSpecificUpdate(channel, messageData);
                }
                break;
        }
    }

    private void handleTaskUpdate(Map<String, Object> messageData) {
        String userId = (String) messageData.get("userId");
        String action = (String) messageData.get("action");
        
        // Send to specific user
        messagingTemplate.convertAndSendToUser(
            userId, 
            "/queue/tasks", 
            messageData
        );
        
        // Also broadcast to general task topic for dashboard updates
        messagingTemplate.convertAndSend("/topic/tasks", messageData);
    }

    private void handleUserUpdate(Map<String, Object> messageData) {
        String userId = (String) messageData.get("userId");
        
        // Send to specific user
        messagingTemplate.convertAndSendToUser(
            userId, 
            "/queue/profile", 
            messageData
        );
    }

    private void handleSystemNotification(Map<String, Object> messageData) {
        // Broadcast system notifications to all connected users
        messagingTemplate.convertAndSend("/topic/notifications", messageData);
    }

    private void handleUserSpecificUpdate(String channel, Map<String, Object> messageData) {
        // Extract user ID from channel name (user_123 -> 123)
        String userId = channel.substring(5);
        
        // Send to specific user's queue
        messagingTemplate.convertAndSendToUser(
            userId, 
            "/queue/updates", 
            messageData
        );
    }

    // Method to send real-time task statistics
    public void sendTaskStatistics(String userId, Map<String, Object> statistics) {
        messagingTemplate.convertAndSendToUser(
            userId, 
            "/queue/statistics", 
            statistics
        );
    }

    // Method to send real-time notifications
    public void sendNotification(String userId, String message, String type) {
        Map<String, Object> notification = Map.of(
            "message", message,
            "type", type,
            "timestamp", System.currentTimeMillis()
        );
        
        messagingTemplate.convertAndSendToUser(
            userId, 
            "/queue/notifications", 
            notification
        );
    }
}
