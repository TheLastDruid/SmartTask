package com.todoapp.controller;

import com.todoapp.dto.TaskRequest;
import com.todoapp.dto.TaskResponse;
import com.todoapp.repository.UserRepository;
import com.todoapp.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks() {
        try {
            String userId = getCurrentUserId();
            List<TaskResponse> tasks = taskService.getAllTasksForUser(userId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createTask(@Valid @RequestBody TaskRequest taskRequest) {
        try {
            String userId = getCurrentUserId();
            TaskResponse task = taskService.createTask(taskRequest, userId);
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create task");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable String id, @Valid @RequestBody TaskRequest taskRequest) {
        try {
            String userId = getCurrentUserId();
            TaskResponse task = taskService.updateTask(id, taskRequest, userId);
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            taskService.deleteTask(id, userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Task deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTask(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            TaskResponse task = taskService.getTaskById(id, userId);
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"))
            .getId();
    }
}
