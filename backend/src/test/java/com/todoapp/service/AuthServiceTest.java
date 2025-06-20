package com.todoapp.service;

import com.todoapp.config.JwtUtils;
import com.todoapp.dto.AuthResponse;
import com.todoapp.dto.LoginRequest;
import com.todoapp.dto.RegisterRequest;
import com.todoapp.model.User;
import com.todoapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private LoginRequest loginRequest;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId("user123");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        registerRequest = new RegisterRequest();
        registerRequest.setEmail("newuser@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFirstName("Jane");
        registerRequest.setLastName("Smith");
    }

    @Test
    void authenticateUser_ValidCredentials_ReturnsAuthResponse() {
        // Given
        String jwtToken = "jwt-token-123";
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateJwtToken("test@example.com")).thenReturn(jwtToken);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // When
        AuthResponse result = authService.authenticateUser(loginRequest);

        // Then
        assertNotNull(result);
        assertEquals(jwtToken, result.getToken());
        assertEquals("test@example.com", result.getEmail());
        assertEquals("John", result.getFirstName());
        assertEquals("Doe", result.getLastName());

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils, times(1)).generateJwtToken("test@example.com");
        verify(userRepository, times(1)).findByEmail("test@example.com");
    }

    @Test
    void authenticateUser_InvalidCredentials_ThrowsException() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        // When & Then
        assertThrows(BadCredentialsException.class, () -> {
            authService.authenticateUser(loginRequest);
        });

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils, never()).generateJwtToken(anyString());
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void authenticateUser_UserNotFound_ThrowsException() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.authenticateUser(loginRequest);
        });

        assertEquals("User not found", exception.getMessage());

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository, times(1)).findByEmail("test@example.com");
    }

    @Test
    void registerUser_ValidRequest_ReturnsAuthResponse() {
        // Given
        String encodedPassword = "encodedPassword123";
        String jwtToken = "jwt-token-456";
        User savedUser = new User("newuser@example.com", encodedPassword, "Jane", "Smith");
        savedUser.setId("newuser123");

        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(encoder.encode("password123")).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtils.generateJwtToken("newuser@example.com")).thenReturn(jwtToken);

        // When
        AuthResponse result = authService.registerUser(registerRequest);

        // Then
        assertNotNull(result);
        assertEquals(jwtToken, result.getToken());
        assertEquals("newuser@example.com", result.getEmail());
        assertEquals("Jane", result.getFirstName());
        assertEquals("Smith", result.getLastName());

        verify(userRepository, times(1)).existsByEmail("newuser@example.com");
        verify(encoder, times(1)).encode("password123");
        verify(userRepository, times(1)).save(any(User.class));
        verify(jwtUtils, times(1)).generateJwtToken("newuser@example.com");
    }

    @Test
    void registerUser_EmailAlreadyExists_ThrowsException() {
        // Given
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(true);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.registerUser(registerRequest);
        });

        assertEquals("Error: Email is already taken!", exception.getMessage());

        verify(userRepository, times(1)).existsByEmail("newuser@example.com");
        verify(encoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
        verify(jwtUtils, never()).generateJwtToken(anyString());
    }

    @Test
    void registerUser_DatabaseError_ThrowsException() {
        // Given
        String encodedPassword = "encodedPassword123";

        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(encoder.encode("password123")).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenThrow(new RuntimeException("Database error"));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.registerUser(registerRequest);
        });

        assertEquals("Database error", exception.getMessage());

        verify(userRepository, times(1)).existsByEmail("newuser@example.com");
        verify(encoder, times(1)).encode("password123");
        verify(userRepository, times(1)).save(any(User.class));
        verify(jwtUtils, never()).generateJwtToken(anyString());
    }

    @Test
    void authenticateUser_NullLoginRequest_ThrowsException() {
        // When & Then
        assertThrows(NullPointerException.class, () -> {
            authService.authenticateUser(null);
        });
    }

    @Test
    void registerUser_NullRegisterRequest_ThrowsException() {
        // When & Then
        assertThrows(NullPointerException.class, () -> {
            authService.registerUser(null);
        });
    }
}
