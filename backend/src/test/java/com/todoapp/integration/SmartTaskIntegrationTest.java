package com.todoapp.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.todoapp.dto.AuthResponse;
import com.todoapp.dto.LoginRequest;
import com.todoapp.dto.RegisterRequest;
import com.todoapp.dto.TaskRequest;
import com.todoapp.model.TaskStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class SmartTaskIntegrationTest {

    @Container
    static MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:6.0")
            .withExposedPorts(27017);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri", mongoDBContainer::getReplicaSetUrl);
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String jwtToken;

    @BeforeEach
    void setUp() throws Exception {
        // Register a test user and get JWT token
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("integration@test.com");
        registerRequest.setPassword("password123");
        registerRequest.setFirstName("Integration");
        registerRequest.setLastName("Test");

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(responseContent, AuthResponse.class);
        jwtToken = authResponse.getToken();
    }

    @Test
    void completeUserJourney_RegisterLoginCreateTasksUpdateDelete() throws Exception {
        // 1. Login with existing user
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("integration@test.com");
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("integration@test.com"));

        // 2. Create a task
        TaskRequest taskRequest = new TaskRequest();
        taskRequest.setTitle("Integration Test Task");
        taskRequest.setDescription("This is a test task for integration testing");
        taskRequest.setStatus(TaskStatus.TODO);
        taskRequest.setDueDate(LocalDateTime.now().plusDays(1));

        MvcResult createResult = mockMvc.perform(post("/api/tasks")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Integration Test Task"))
                .andExpect(jsonPath("$.description").value("This is a test task for integration testing"))
                .andExpect(jsonPath("$.status").value("TODO"))
                .andReturn();

        // Extract task ID from response
        String taskResponseJson = createResult.getResponse().getContentAsString();
        String taskId = objectMapper.readTree(taskResponseJson).get("id").asText();

        // 3. Get all tasks
        mockMvc.perform(get("/api/tasks")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].title").value("Integration Test Task"));

        // 4. Get specific task
        mockMvc.perform(get("/api/tasks/" + taskId)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(taskId))
                .andExpect(jsonPath("$.title").value("Integration Test Task"));

        // 5. Update the task
        TaskRequest updateRequest = new TaskRequest();
        updateRequest.setTitle("Updated Integration Test Task");
        updateRequest.setStatus(TaskStatus.IN_PROGRESS);

        mockMvc.perform(put("/api/tasks/" + taskId)
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Integration Test Task"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        // 6. Delete the task
        mockMvc.perform(delete("/api/tasks/" + taskId)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Task deleted successfully"));

        // 7. Verify task is deleted
        mockMvc.perform(get("/api/tasks/" + taskId)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Task not found"));
    }

    @Test
    void authFlow_InvalidCredentials_ReturnsError() throws Exception {
        // Test login with invalid credentials
        LoginRequest invalidLogin = new LoginRequest();
        invalidLogin.setEmail("nonexistent@test.com");
        invalidLogin.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidLogin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    void taskOperations_UnauthorizedAccess_ReturnsError() throws Exception {
        // Try to access tasks without authentication
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isUnauthorized());

        // Try to create task without authentication
        TaskRequest taskRequest = new TaskRequest();
        taskRequest.setTitle("Unauthorized Task");

        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registerUser_DuplicateEmail_ReturnsError() throws Exception {
        // Try to register with same email again
        RegisterRequest duplicateRegister = new RegisterRequest();
        duplicateRegister.setEmail("integration@test.com");
        duplicateRegister.setPassword("anotherpassword");
        duplicateRegister.setFirstName("Another");
        duplicateRegister.setLastName("User");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(duplicateRegister)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Error: Email is already taken!"));
    }

    @Test
    void taskCRUD_CrossUserAccess_ReturnsError() throws Exception {
        // Create another user
        RegisterRequest anotherUser = new RegisterRequest();
        anotherUser.setEmail("another@test.com");
        anotherUser.setPassword("password123");
        anotherUser.setFirstName("Another");
        anotherUser.setLastName("User");

        MvcResult anotherUserResult = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(anotherUser)))
                .andExpect(status().isOk())
                .andReturn();

        String anotherUserToken = objectMapper.readTree(anotherUserResult.getResponse().getContentAsString())
                .get("token").asText();

        // Create a task with first user
        TaskRequest taskRequest = new TaskRequest();
        taskRequest.setTitle("First User Task");

        MvcResult taskResult = mockMvc.perform(post("/api/tasks")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String taskId = objectMapper.readTree(taskResult.getResponse().getContentAsString())
                .get("id").asText();

        // Try to access the task with another user's token
        mockMvc.perform(get("/api/tasks/" + taskId)
                .header("Authorization", "Bearer " + anotherUserToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Task not found"));

        // Try to update the task with another user's token
        TaskRequest updateRequest = new TaskRequest();
        updateRequest.setTitle("Hacked Task");

        mockMvc.perform(put("/api/tasks/" + taskId)
                .header("Authorization", "Bearer " + anotherUserToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Task not found"));

        // Try to delete the task with another user's token
        mockMvc.perform(delete("/api/tasks/" + taskId)
                .header("Authorization", "Bearer " + anotherUserToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Task not found"));
    }

    @Test
    void healthCheck_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SmartTask API is running"))
                .andExpect(jsonPath("$.timestamp").exists());
    }
}
