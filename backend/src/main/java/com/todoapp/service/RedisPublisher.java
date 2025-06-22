package com.todoapp.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class RedisPublisher {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private RedisTemplate<String, Object> redisTemplateForCaching;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String TASK_CHANNEL = "task_updates";
    private static final String USER_CHANNEL = "user_updates";

    public void publishTaskUpdate(String userId, String taskId, String action, Object taskData) {
        try {
            Map<String, Object> message = new HashMap<>();            message.put("userId", userId);
            message.put("taskId", taskId);
            message.put("action", action); // CREATE, UPDATE, DELETE
            message.put("data", taskData);
            message.put("timestamp", System.currentTimeMillis()); // Use timestamp in milliseconds
            message.put("type", "TASK_UPDATE");

            String jsonMessage = objectMapper.writeValueAsString(message);
            
            // Publish to general task channel
            redisTemplate.convertAndSend(TASK_CHANNEL, jsonMessage);
            
            // Publish to user-specific channel
            redisTemplate.convertAndSend(getUserChannel(userId), jsonMessage);
            
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error publishing task update", e);
        }
    }

    public void publishUserUpdate(String userId, String action, Object userData) {
        try {
            Map<String, Object> message = new HashMap<>();            message.put("userId", userId);
            message.put("action", action); // LOGIN, LOGOUT, PROFILE_UPDATE, etc.
            message.put("data", userData);
            message.put("timestamp", System.currentTimeMillis()); // Use timestamp in milliseconds
            message.put("type", "USER_UPDATE");

            String jsonMessage = objectMapper.writeValueAsString(message);
            
            // Publish to user channel
            redisTemplate.convertAndSend(USER_CHANNEL, jsonMessage);
            redisTemplate.convertAndSend(getUserChannel(userId), jsonMessage);
            
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error publishing user update", e);
        }
    }

    public void publishSystemNotification(String message, String type) {
        try {
            Map<String, Object> notification = new HashMap<>();            notification.put("message", message);
            notification.put("type", type); // INFO, WARNING, ERROR
            notification.put("timestamp", System.currentTimeMillis()); // Use timestamp in milliseconds
            notification.put("broadcast", true);

            String jsonMessage = objectMapper.writeValueAsString(notification);
            
            // Publish to system notification channel
            redisTemplate.convertAndSend("system_notifications", jsonMessage);
            
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error publishing system notification", e);
        }
    }

    private String getUserChannel(String userId) {
        return "user_" + userId;
    }    // Cache operations for frequently accessed data
    public void cacheUserTasks(String userId, Object tasks) {
        String key = "user_tasks:" + userId;
        redisTemplateForCaching.opsForValue().set(key, tasks);
        // Set expiration to 1 hour
        redisTemplateForCaching.expire(key, java.time.Duration.ofHours(1));
    }

    public Object getCachedUserTasks(String userId) {
        String key = "user_tasks:" + userId;
        return redisTemplateForCaching.opsForValue().get(key);
    }

    public void invalidateUserTasksCache(String userId) {
        String key = "user_tasks:" + userId;
        redisTemplateForCaching.delete(key);
    }
}
