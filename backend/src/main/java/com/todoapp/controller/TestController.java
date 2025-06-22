package com.todoapp.controller;

import com.todoapp.service.RedisPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TestController {

    @Autowired(required = false)
    private RedisPublisher redisPublisher;

    @GetMapping("/test-connection")
    public Map<String, Object> testConnection() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Backend is running correctly");
        response.put("timestamp", System.currentTimeMillis());
        response.put("port", "8080");
        return response;
    }    /**
     * Test endpoint to publish a Redis message directly
     */
    @PostMapping("/test-publish-message")
    public ResponseEntity<Map<String, Object>> publishTestMessage(@RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            String message = request.getOrDefault("message", "Test message");

            if (userId == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "userId is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Create test task data
            Map<String, Object> taskData = new HashMap<>();
            taskData.put("id", "test-" + System.currentTimeMillis());
            taskData.put("title", "Test Task");
            taskData.put("description", message);
            taskData.put("userId", userId);
            taskData.put("status", "TODO");
            taskData.put("createdAt", System.currentTimeMillis());

            // Publish Redis message using the correct method signature
            if (redisPublisher != null) {
                redisPublisher.publishTaskUpdate(userId, (String) taskData.get("id"), "CREATE", taskData);
                System.out.println("🔔 Published Redis message for user: " + userId);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Redis message published successfully");
            response.put("taskData", taskData);
            response.put("userId", userId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to publish message: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Test endpoint to broadcast to general topic (should reach all connected clients)
     */
    @PostMapping("/test-broadcast-message")
    public ResponseEntity<Map<String, Object>> broadcastTestMessage(@RequestBody Map<String, String> request) {
        try {
            String message = request.getOrDefault("message", "Test broadcast message");

            // Create test task data
            Map<String, Object> taskData = new HashMap<>();
            taskData.put("id", "broadcast-" + System.currentTimeMillis());
            taskData.put("title", "Broadcast Test Task");
            taskData.put("description", message);
            taskData.put("userId", "broadcast");
            taskData.put("status", "TODO");
            taskData.put("createdAt", System.currentTimeMillis());

            // Publish Redis message that will be broadcast to /topic/tasks (all clients)
            if (redisPublisher != null) {
                redisPublisher.publishTaskUpdate("broadcast", (String) taskData.get("id"), "CREATE", taskData);
                System.out.println("🔔 Published broadcast Redis message");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Broadcast message published successfully");
            response.put("taskData", taskData);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to publish broadcast message: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
