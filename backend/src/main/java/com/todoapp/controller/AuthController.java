package com.todoapp.controller;

import com.todoapp.dto.AuthResponse;
import com.todoapp.dto.LoginRequest;
import com.todoapp.dto.RegisterRequest;
import com.todoapp.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = authService.authenticateUser(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            String message = e.getMessage();
            if (message.contains("Bad credentials") || message.contains("User not found")) {
                error.put("message", "Invalid email or password");
            } else {
                error.put("message", "Authentication failed. Please try again.");
            }
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Authentication failed. Please try again.");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        try {
            AuthResponse response = authService.registerUser(signUpRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(HttpServletRequest request) {
        try {
            String jwt = parseJwt(request);
            if (jwt == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "No token provided");
                return ResponseEntity.badRequest().body(error);
            }

            // Use JwtUtils to validate token
            if (authService.validateToken(jwt)) {
                Map<String, String> response = new HashMap<>();
                response.put("status", "valid");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid or expired token");
                return ResponseEntity.status(401).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Token validation failed");
            return ResponseEntity.status(401).body(error);
        }
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String token) {
        try {
            boolean isVerified = authService.verifyEmail(token);
            if (isVerified) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Email verified successfully");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid or expired verification token");
                return ResponseEntity.badRequest().body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email verification failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerificationEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email is required");
                return ResponseEntity.badRequest().body(error);
            }

            authService.resendVerificationEmail(email);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Verification email sent successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to resend verification email");
            return ResponseEntity.badRequest().body(error);
        }
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}
