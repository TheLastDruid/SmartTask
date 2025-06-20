package com.todoapp.service;

import com.todoapp.dto.TaskRequest;
import com.todoapp.dto.TaskResponse;
import com.todoapp.model.Task;
import com.todoapp.model.TaskStatus;
import com.todoapp.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;    public List<TaskResponse> getAllTasksForUser(String userId) {
        List<Task> tasks = taskRepository.findByUserId(userId);
        return tasks.stream()
            .map(TaskResponse::new)
            .collect(Collectors.toList());
    }public TaskResponse createTask(TaskRequest taskRequest, String userId) {
        Task task = new Task();
        task.setTitle(sanitizeInput(taskRequest.getTitle()));
        task.setDescription(sanitizeInput(taskRequest.getDescription()));
        task.setStatus(taskRequest.getStatus() != null ? taskRequest.getStatus() : TaskStatus.TODO);
        task.setDueDate(taskRequest.getDueDate());
        task.setPriority(taskRequest.getPriority());
        task.setUserId(userId);

        Task savedTask = taskRepository.save(task);
        return new TaskResponse(savedTask);
    }

    public TaskResponse updateTask(String taskId, TaskRequest taskRequest, String userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
            .orElseThrow(() -> new RuntimeException("Task not found"));

        if (taskRequest.getTitle() != null) {
            task.setTitle(sanitizeInput(taskRequest.getTitle()));
        }
        if (taskRequest.getDescription() != null) {
            task.setDescription(sanitizeInput(taskRequest.getDescription()));
        }
        if (taskRequest.getStatus() != null) {
            task.setStatus(taskRequest.getStatus());
        }
        if (taskRequest.getDueDate() != null) {
            task.setDueDate(taskRequest.getDueDate());
        }
        task.setUpdatedAt(LocalDateTime.now());

        Task updatedTask = taskRepository.save(task);
        return new TaskResponse(updatedTask);
    }

    public void deleteTask(String taskId, String userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        
        taskRepository.delete(task);
    }

    public TaskResponse getTaskById(String taskId, String userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        
        return new TaskResponse(task);
    }

    private String sanitizeInput(String input) {
        if (input == null) return null;
        // Basic sanitization to prevent XSS and NoSQL injection
        return input.replaceAll("[<>\"'%;()&+]", "").trim();
    }
}
