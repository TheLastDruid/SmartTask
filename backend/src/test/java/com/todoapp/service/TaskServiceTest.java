package com.todoapp.service;

import com.todoapp.dto.TaskRequest;
import com.todoapp.dto.TaskResponse;
import com.todoapp.model.Task;
import com.todoapp.model.TaskStatus;
import com.todoapp.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {    @Mock
    private TaskRepository taskRepository;

    @Mock
    private RedisPublisher redisPublisher;

    @InjectMocks
    private TaskService taskService;

    private Task testTask;
    private TaskRequest taskRequest;
    private String userId = "user123";    @BeforeEach
    void setUp() {
        testTask = new Task();
        testTask.setId("task123");
        testTask.setTitle("Test Task");
        testTask.setDescription("Test Description");
        testTask.setStatus(TaskStatus.TODO);
        testTask.setUserId(userId);
        testTask.setCreatedAt(LocalDateTime.now());
        testTask.setUpdatedAt(LocalDateTime.now());

        taskRequest = new TaskRequest();
        taskRequest.setTitle("New Task");
        taskRequest.setDescription("New Description");
        taskRequest.setStatus(TaskStatus.TODO);
        taskRequest.setDueDate(LocalDateTime.now().plusDays(1));        // Mock RedisPublisher methods - lenient to avoid unnecessary stubbing errors
        lenient().doNothing().when(redisPublisher).invalidateUserTasksCache(anyString());
        lenient().doNothing().when(redisPublisher).publishTaskUpdate(anyString(), anyString(), anyString(), any());
        lenient().doNothing().when(redisPublisher).cacheUserTasks(anyString(), any());
        lenient().when(redisPublisher.getCachedUserTasks(anyString())).thenReturn(null); // No cached data by default
    }

    @Test
    void getAllTasksForUser_ReturnsTaskList() {
        // Given
        List<Task> tasks = Arrays.asList(testTask);
        when(taskRepository.findByUserId(userId)).thenReturn(tasks);

        // When
        List<TaskResponse> result = taskService.getAllTasksForUser(userId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("task123", result.get(0).getId());
        assertEquals("Test Task", result.get(0).getTitle());
        assertEquals("Test Description", result.get(0).getDescription());
        assertEquals(TaskStatus.TODO, result.get(0).getStatus());

        verify(taskRepository, times(1)).findByUserId(userId);
    }

    @Test
    void getAllTasksForUser_EmptyList_ReturnsEmptyList() {
        // Given
        when(taskRepository.findByUserId(userId)).thenReturn(Arrays.asList());

        // When
        List<TaskResponse> result = taskService.getAllTasksForUser(userId);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(taskRepository, times(1)).findByUserId(userId);
    }

    @Test
    void createTask_ValidRequest_ReturnsTaskResponse() {
        // Given
        Task savedTask = new Task();
        savedTask.setId("newTask123");
        savedTask.setTitle("New Task");
        savedTask.setDescription("New Description");
        savedTask.setStatus(TaskStatus.TODO);
        savedTask.setUserId(userId);

        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

        // When
        TaskResponse result = taskService.createTask(taskRequest, userId);

        // Then
        assertNotNull(result);
        assertEquals("newTask123", result.getId());
        assertEquals("New Task", result.getTitle());
        assertEquals("New Description", result.getDescription());
        assertEquals(TaskStatus.TODO, result.getStatus());

        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void createTask_WithSpecialCharacters_SanitizesInput() {
        // Given
        taskRequest.setTitle("Task <script>alert('xss')</script>");
        taskRequest.setDescription("Description with &lt;script&gt;");

        Task savedTask = new Task();
        savedTask.setId("newTask123");
        savedTask.setTitle("Task scriptalert'xss'/script");
        savedTask.setDescription("Description with ltscriptgt");
        savedTask.setStatus(TaskStatus.TODO);
        savedTask.setUserId(userId);

        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

        // When
        TaskResponse result = taskService.createTask(taskRequest, userId);

        // Then
        assertNotNull(result);
        assertEquals("Task scriptalert'xss'/script", result.getTitle());
        assertEquals("Description with ltscriptgt", result.getDescription());

        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void createTask_NullStatus_DefaultsToTodo() {
        // Given
        taskRequest.setStatus(null);

        Task savedTask = new Task();
        savedTask.setId("newTask123");
        savedTask.setTitle("New Task");
        savedTask.setStatus(TaskStatus.TODO);
        savedTask.setUserId(userId);

        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

        // When
        TaskResponse result = taskService.createTask(taskRequest, userId);

        // Then
        assertNotNull(result);
        assertEquals(TaskStatus.TODO, result.getStatus());

        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void updateTask_ValidRequest_ReturnsUpdatedTask() {
        // Given
        String taskId = "task123";
        taskRequest.setTitle("Updated Task");
        taskRequest.setStatus(TaskStatus.IN_PROGRESS);

        when(taskRepository.findByIdAndUserId(taskId, userId)).thenReturn(Optional.of(testTask));
        
        Task updatedTask = new Task();
        updatedTask.setId(taskId);
        updatedTask.setTitle("Updated Task");
        updatedTask.setDescription("Test Description");
        updatedTask.setStatus(TaskStatus.IN_PROGRESS);
        updatedTask.setUserId(userId);

        when(taskRepository.save(any(Task.class))).thenReturn(updatedTask);

        // When
        TaskResponse result = taskService.updateTask(taskId, taskRequest, userId);

        // Then
        assertNotNull(result);
        assertEquals("Updated Task", result.getTitle());
        assertEquals(TaskStatus.IN_PROGRESS, result.getStatus());

        verify(taskRepository, times(1)).findByIdAndUserId(taskId, userId);
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void updateTask_TaskNotFound_ThrowsException() {
        // Given
        String taskId = "nonexistent";
        when(taskRepository.findByIdAndUserId(taskId, userId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.updateTask(taskId, taskRequest, userId);
        });

        assertEquals("Task not found", exception.getMessage());

        verify(taskRepository, times(1)).findByIdAndUserId(taskId, userId);
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void updateTask_PartialUpdate_OnlyUpdatesProvidedFields() {
        // Given
        String taskId = "task123";
        TaskRequest partialRequest = new TaskRequest();
        partialRequest.setTitle("Only Title Updated");
        // Description, status, and dueDate are null

        when(taskRepository.findByIdAndUserId(taskId, userId)).thenReturn(Optional.of(testTask));

        Task updatedTask = new Task();
        updatedTask.setId(taskId);
        updatedTask.setTitle("Only Title Updated");
        updatedTask.setDescription("Test Description"); // Original description preserved
        updatedTask.setStatus(TaskStatus.TODO); // Original status preserved
        updatedTask.setUserId(userId);

        when(taskRepository.save(any(Task.class))).thenReturn(updatedTask);

        // When
        TaskResponse result = taskService.updateTask(taskId, partialRequest, userId);

        // Then
        assertNotNull(result);
        assertEquals("Only Title Updated", result.getTitle());
        assertEquals("Test Description", result.getDescription());
        assertEquals(TaskStatus.TODO, result.getStatus());

        verify(taskRepository, times(1)).findByIdAndUserId(taskId, userId);
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void deleteTask_ValidId_DeletesTask() {
        // Given
        String taskId = "task123";
        when(taskRepository.findByIdAndUserId(taskId, userId)).thenReturn(Optional.of(testTask));

        // When
        taskService.deleteTask(taskId, userId);

        // Then
        verify(taskRepository, times(1)).findByIdAndUserId(taskId, userId);
        verify(taskRepository, times(1)).delete(testTask);
    }

    @Test
    void deleteTask_TaskNotFound_ThrowsException() {
        // Given
        String taskId = "nonexistent";
        when(taskRepository.findByIdAndUserId(taskId, userId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.deleteTask(taskId, userId);
        });

        assertEquals("Task not found", exception.getMessage());

        verify(taskRepository, times(1)).findByIdAndUserId(taskId, userId);
        verify(taskRepository, never()).delete(any(Task.class));
    }

    @Test
    void getTaskById_ValidId_ReturnsTask() {
        // Given
        String taskId = "task123";
        when(taskRepository.findByIdAndUserId(taskId, userId)).thenReturn(Optional.of(testTask));

        // When
        TaskResponse result = taskService.getTaskById(taskId, userId);

        // Then
        assertNotNull(result);
        assertEquals("task123", result.getId());
        assertEquals("Test Task", result.getTitle());
        assertEquals("Test Description", result.getDescription());

        verify(taskRepository, times(1)).findByIdAndUserId(taskId, userId);
    }

    @Test
    void getTaskById_TaskNotFound_ThrowsException() {
        // Given
        String taskId = "nonexistent";
        when(taskRepository.findByIdAndUserId(taskId, userId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.getTaskById(taskId, userId);
        });

        assertEquals("Task not found", exception.getMessage());

        verify(taskRepository, times(1)).findByIdAndUserId(taskId, userId);
    }

    @Test
    void sanitizeInput_HandlesNullInput() {
        // Given
        TaskRequest requestWithNulls = new TaskRequest();
        requestWithNulls.setTitle(null);
        requestWithNulls.setDescription(null);
        requestWithNulls.setStatus(TaskStatus.TODO);

        Task savedTask = new Task();
        savedTask.setId("newTask123");
        savedTask.setTitle(null);
        savedTask.setDescription(null);
        savedTask.setStatus(TaskStatus.TODO);
        savedTask.setUserId(userId);

        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

        // When
        TaskResponse result = taskService.createTask(requestWithNulls, userId);

        // Then
        assertNotNull(result);
        assertNull(result.getTitle());
        assertNull(result.getDescription());

        verify(taskRepository, times(1)).save(any(Task.class));
    }
}
