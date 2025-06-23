package com.todoapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "SmartTask Backend");
        return ResponseEntity.ok(status);
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, String>> apiHealth() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "SmartTask API is running");
        status.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(status);
    }

    @GetMapping("/health/redis")
    public ResponseEntity<Map<String, String>> redisHealth() {
        Map<String, String> status = new HashMap<>();
        try {
            // Test Redis connection
            redisTemplate.opsForValue().set("health-check", "test");
            String value = (String) redisTemplate.opsForValue().get("health-check");

            if ("test".equals(value)) {
                status.put("redis", "UP");
                status.put("message", "Redis connection successful");
            } else {
                status.put("redis", "DOWN");
                status.put("message", "Redis test failed");
            }
        } catch (Exception e) {
            status.put("redis", "DOWN");
            status.put("message", "Redis connection failed: " + e.getMessage());
        }
        return ResponseEntity.ok(status);
    }
}
