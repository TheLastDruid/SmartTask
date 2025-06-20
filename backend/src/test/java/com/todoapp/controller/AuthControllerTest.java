package com.todoapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.todoapp.dto.AuthResponse;
import com.todoapp.dto.LoginRequest;
import com.todoapp.dto.RegisterRequest;
import com.todoapp.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void authenticateUser_ValidCredentials_ReturnsAuthResponse() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        AuthResponse authResponse = new AuthResponse("jwt-token", "test@example.com", "John", "Doe");

        when(authService.authenticateUser(any(LoginRequest.class))).thenReturn(authResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"));

        verify(authService, times(1)).authenticateUser(any(LoginRequest.class));
    }

    @Test
    void authenticateUser_InvalidCredentials_ReturnsBadRequest() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("wrongpassword");

        when(authService.authenticateUser(any(LoginRequest.class)))
                .thenThrow(new RuntimeException("Invalid credentials"));

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));

        verify(authService, times(1)).authenticateUser(any(LoginRequest.class));
    }

    @Test
    void registerUser_ValidRequest_ReturnsAuthResponse() throws Exception {
        // Given
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("newuser@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFirstName("Jane");
        registerRequest.setLastName("Smith");

        AuthResponse authResponse = new AuthResponse("jwt-token", "newuser@example.com", "Jane", "Smith");

        when(authService.registerUser(any(RegisterRequest.class))).thenReturn(authResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("newuser@example.com"))
                .andExpect(jsonPath("$.firstName").value("Jane"))
                .andExpect(jsonPath("$.lastName").value("Smith"));

        verify(authService, times(1)).registerUser(any(RegisterRequest.class));
    }

    @Test
    void registerUser_EmailAlreadyExists_ReturnsBadRequest() throws Exception {
        // Given
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("existing@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFirstName("Jane");
        registerRequest.setLastName("Smith");

        when(authService.registerUser(any(RegisterRequest.class)))
                .thenThrow(new RuntimeException("Error: Email is already taken!"));

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Error: Email is already taken!"));

        verify(authService, times(1)).registerUser(any(RegisterRequest.class));
    }

    @Test
    void verifyToken_ReturnsValidStatus() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/auth/verify"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("valid"));
    }

    @Test
    void authenticateUser_EmptyRequestBody_ReturnsBadRequest() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerUser_EmptyRequestBody_ReturnsBadRequest() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
