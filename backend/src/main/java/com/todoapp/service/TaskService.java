package com.todoapp.service;

import com.todoapp.dto.TaskRequest;
import com.todoapp.dto.TaskResponse;
import com.todoapp.model.Task;
import com.todoapp.model.TaskStatus;
import com.todoapp.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private RedisPublisher redisPublisher;

    @Autowired
    private SequenceGeneratorService sequenceGeneratorService;    public List<TaskResponse> getAllTasksForUser(String userId) {
        // Try to get from cache first
        Object cachedTasks = redisPublisher.getCachedUserTasks(userId);
        if (cachedTasks != null) {
            try {
                @SuppressWarnings("unchecked")
                List<TaskResponse> tasks = (List<TaskResponse>) cachedTasks;
                return tasks;
            } catch (Exception e) {
                // If cache fails, fall back to database
            }
        }
        
        List<Task> tasks = taskRepository.findByUserId(userId);
        List<TaskResponse> taskResponses = tasks.stream()
            .map(TaskResponse::new)
            .collect(Collectors.toList());
            
        // Cache the results
        redisPublisher.cacheUserTasks(userId, taskResponses);
        
        return taskResponses;
    }    public TaskResponse createTask(TaskRequest taskRequest, String userId) {
        Task task = new Task();
        task.setTitle(sanitizeInput(taskRequest.getTitle()));
        task.setDescription(sanitizeInput(taskRequest.getDescription()));
        task.setStatus(taskRequest.getStatus() != null ? taskRequest.getStatus() : TaskStatus.TODO);
        task.setDueDate(taskRequest.getDueDate());
        task.setPriority(taskRequest.getPriority());
        task.setUserId(userId);
        
        // Generate and assign ticket number
        Integer ticketNumber = sequenceGeneratorService.generateSequence("task_ticket");
        task.setTicketNumber(ticketNumber);

        Task savedTask = taskRepository.save(task);
        TaskResponse taskResponse = new TaskResponse(savedTask);
        
        // Invalidate cache and publish update
        redisPublisher.invalidateUserTasksCache(userId);
        redisPublisher.publishTaskUpdate(userId, savedTask.getId(), "CREATE", taskResponse);
        
        return taskResponse;
    }    public TaskResponse updateTask(String taskId, TaskRequest taskRequest, String userId) {
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
        TaskResponse taskResponse = new TaskResponse(updatedTask);
        
        // Invalidate cache and publish update
        redisPublisher.invalidateUserTasksCache(userId);
        redisPublisher.publishTaskUpdate(userId, updatedTask.getId(), "UPDATE", taskResponse);
        
        return taskResponse;
    }    public void deleteTask(String taskId, String userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        
        taskRepository.delete(task);
        
        // Invalidate cache and publish update
        redisPublisher.invalidateUserTasksCache(userId);
        redisPublisher.publishTaskUpdate(userId, taskId, "DELETE", null);
    }

    public TaskResponse getTaskById(String taskId, String userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        
        return new TaskResponse(task);
    }

    public TaskResponse getTaskByTicketNumber(Integer ticketNumber, String userId) {
        Task task = taskRepository.findByTicketNumberAndUserId(ticketNumber, userId)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        
        return new TaskResponse(task);
    }    public int bulkMarkTasksComplete(String userId) {
        List<Task> tasks = taskRepository.findByUserId(userId);
        int updatedCount = 0;
        List<TaskResponse> updatedTasks = new ArrayList<>();
        
        for (Task task : tasks) {
            if (task.getStatus() != TaskStatus.DONE) {
                task.setStatus(TaskStatus.DONE);
                task.setUpdatedAt(LocalDateTime.now());
                taskRepository.save(task);
                updatedCount++;
                updatedTasks.add(new TaskResponse(task));
            }
        }
        
        // Invalidate cache first
        redisPublisher.invalidateUserTasksCache(userId);
        
        // Get fresh data and cache it
        List<TaskResponse> freshTasks = getAllTasksForUser(userId);
        redisPublisher.cacheUserTasks(userId, freshTasks);
        
        // Publish a single bulk update event
        if (updatedCount > 0) {
            redisPublisher.publishBulkTaskUpdate(userId, "BULK_MARK_COMPLETE", updatedTasks);
        }
        
        return updatedCount;
    }

    private String sanitizeInput(String input) {
        if (input == null) return null;
        // Basic sanitization to prevent XSS and NoSQL injection
        return input.replaceAll("[<>\"'%;()&+]", "").trim();
    }
}
