package com.todoapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.todoapp.dto.TaskRequest;
import com.todoapp.dto.TaskResponse;
import com.todoapp.model.Task;
import com.todoapp.model.TaskStatus;
import com.todoapp.model.User;
import com.todoapp.repository.UserRepository;
import com.todoapp.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TaskControllerTest {

    @Mock
    private TaskService taskService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private TaskController taskController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private User testUser;
    private Task testTask;
    private TaskResponse testTaskResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(taskController).build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        // Setup test data
        testUser = new User();
        testUser.setId("user123");
        testUser.setEmail("test@example.com");

        testTask = new Task();
        testTask.setId("task123");
        testTask.setTitle("Test Task");
        testTask.setDescription("Test Description");
        testTask.setStatus(TaskStatus.TODO);
        testTask.setUserId("user123");
        testTask.setCreatedAt(LocalDateTime.now());

        testTaskResponse = new TaskResponse(testTask);

        // Setup security context
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
    }

    @Test
    void getAllTasks_ReturnsTaskList() throws Exception {
        // Given
        List<TaskResponse> tasks = Arrays.asList(testTaskResponse);
        when(taskService.getAllTasksForUser("user123")).thenReturn(tasks);

        // When & Then
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value("task123"))
                .andExpect(jsonPath("$[0].title").value("Test Task"))
                .andExpect(jsonPath("$[0].description").value("Test Description"))
                .andExpect(jsonPath("$[0].status").value("TODO"));

        verify(taskService, times(1)).getAllTasksForUser("user123");
    }

    @Test
    void createTask_ValidRequest_ReturnsCreatedTask() throws Exception {
        // Given
        TaskRequest taskRequest = new TaskRequest();
        taskRequest.setTitle("New Task");
        taskRequest.setDescription("New Description");
        taskRequest.setStatus(TaskStatus.TODO);

        when(taskService.createTask(any(TaskRequest.class), eq("user123"))).thenReturn(testTaskResponse);

        // When & Then
        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("task123"))
                .andExpect(jsonPath("$.title").value("Test Task"));

        verify(taskService, times(1)).createTask(any(TaskRequest.class), eq("user123"));
    }

    @Test
    void createTask_ServiceException_ReturnsBadRequest() throws Exception {
        // Given
        TaskRequest taskRequest = new TaskRequest();
        taskRequest.setTitle("New Task");

        when(taskService.createTask(any(TaskRequest.class), eq("user123")))
                .thenThrow(new RuntimeException("Database error"));

        // When & Then
        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Failed to create task"));

        verify(taskService, times(1)).createTask(any(TaskRequest.class), eq("user123"));
    }

    @Test
    void updateTask_ValidRequest_ReturnsUpdatedTask() throws Exception {
        // Given
        TaskRequest taskRequest = new TaskRequest();
        taskRequest.setTitle("Updated Task");
        taskRequest.setStatus(TaskStatus.IN_PROGRESS);

        TaskResponse updatedTaskResponse = new TaskResponse();
        updatedTaskResponse.setId("task123");
        updatedTaskResponse.setTitle("Updated Task");
        updatedTaskResponse.setStatus(TaskStatus.IN_PROGRESS);

        when(taskService.updateTask(eq("task123"), any(TaskRequest.class), eq("user123")))
                .thenReturn(updatedTaskResponse);

        // When & Then
        mockMvc.perform(put("/api/tasks/task123")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("task123"))
                .andExpect(jsonPath("$.title").value("Updated Task"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        verify(taskService, times(1)).updateTask(eq("task123"), any(TaskRequest.class), eq("user123"));
    }

    @Test
    void updateTask_TaskNotFound_ReturnsBadRequest() throws Exception {
        // Given
        TaskRequest taskRequest = new TaskRequest();
        taskRequest.setTitle("Updated Task");

        when(taskService.updateTask(eq("nonexistent"), any(TaskRequest.class), eq("user123")))
                .thenThrow(new RuntimeException("Task not found"));

        // When & Then
        mockMvc.perform(put("/api/tasks/nonexistent")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Task not found"));

        verify(taskService, times(1)).updateTask(eq("nonexistent"), any(TaskRequest.class), eq("user123"));
    }

    @Test
    void deleteTask_ValidId_ReturnsSuccessMessage() throws Exception {
        // Given
        doNothing().when(taskService).deleteTask("task123", "user123");

        // When & Then
        mockMvc.perform(delete("/api/tasks/task123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Task deleted successfully"));

        verify(taskService, times(1)).deleteTask("task123", "user123");
    }

    @Test
    void deleteTask_TaskNotFound_ReturnsBadRequest() throws Exception {
        // Given
        doThrow(new RuntimeException("Task not found"))
                .when(taskService).deleteTask("nonexistent", "user123");

        // When & Then
        mockMvc.perform(delete("/api/tasks/nonexistent"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Task not found"));

        verify(taskService, times(1)).deleteTask("nonexistent", "user123");
    }

    @Test
    void getTask_ValidId_ReturnsTask() throws Exception {
        // Given
        when(taskService.getTaskById("task123", "user123")).thenReturn(testTaskResponse);

        // When & Then
        mockMvc.perform(get("/api/tasks/task123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("task123"))
                .andExpect(jsonPath("$.title").value("Test Task"));

        verify(taskService, times(1)).getTaskById("task123", "user123");
    }

    @Test
    void getTask_TaskNotFound_ReturnsBadRequest() throws Exception {
        // Given
        when(taskService.getTaskById("nonexistent", "user123"))
                .thenThrow(new RuntimeException("Task not found"));        // When & Then
        mockMvc.perform(get("/api/tasks/nonexistent"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Task not found"));

        verify(taskService, times(1)).getTaskById("nonexistent", "user123");
    }

    @Test
    void getAllTasks_UserNotAuthenticated_ThrowsException() throws Exception {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isBadRequest());
    }
}
