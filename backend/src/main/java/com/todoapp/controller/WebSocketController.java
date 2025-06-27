package com.todoapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.todoapp.service.RedisPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
@CrossOrigin(origins = "${app.frontend.url:http://localhost:3000}")
public class WebSocketController implements MessageListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketController.class);

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
    }    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String channel = new String(pattern);
            String messageBody = new String(message.getBody());
            
            logger.debug("WebSocket received Redis message on channel: {}", channel);
            logger.debug("Message body: {}", messageBody);
            
            // Parse the Redis message
            Map<String, Object> messageData = objectMapper.readValue(messageBody, Map.class);
            
            // Route message based on channel and content
            routeMessage(channel, messageData);
            
        } catch (Exception e) {
            logger.error("Error processing Redis message: {}", e.getMessage(), e);
        }
    }

    private void routeMessage(String channel, Map<String, Object> messageData) {
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
    }    private void handleTaskUpdate(Map<String, Object> messageData) {
        String userId = (String) messageData.get("userId");
        
        logger.debug("Sending task update to user: {}", userId);
        logger.debug("Task data: {}", messageData);
        
        // Send to specific user
        try {
            messagingTemplate.convertAndSendToUser(
                userId, 
                "/queue/tasks", 
                messageData
            );
            logger.debug("Successfully sent to user {} at /user/{}/queue/tasks", userId, userId);
        } catch (Exception e) {
            logger.error("Error sending to user {}: {}", userId, e.getMessage(), e);
        }
        
        // Also broadcast to general task topic for dashboard updates
        try {
            messagingTemplate.convertAndSend("/topic/tasks", messageData);
            logger.debug("Successfully broadcast to /topic/tasks");
        } catch (Exception e) {
            logger.error("Error broadcasting to /topic/tasks: {}", e.getMessage(), e);
        }
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
