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
    private AuthService authService;    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = authService.authenticateUser(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            String message = e.getMessage();            if (message.contains("Bad credentials") || message.contains("User not found") || message.equals("Invalid credentials")) {
                error.put("message", "Invalid credentials");
            } else if (message.contains("Email not verified")) {
                error.put("message", "Please verify your email address before logging in. Check your inbox for the verification link.");
                error.put("requiresVerification", "true");
            } else {
                error.put("message", "Authentication failed. Please try again.");
            }
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Authentication failed. Please try again.");
            return ResponseEntity.badRequest().body(error);
        }
    }    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        try {
            AuthResponse response = authService.registerUser(signUpRequest);
            if (!response.isEmailVerified()) {
                // User registered but needs email verification
                response.setMessage("Registration successful! Please check your email to verify your account before logging in.");
                response.setRequiresVerification(true);
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(HttpServletRequest request) {
        try {
            String jwt = parseJwt(request);
            if (jwt == null) {
                // Return a simple status check instead of error when no token is provided
                Map<String, String> response = new HashMap<>();
                response.put("status", "valid");
                return ResponseEntity.ok(response);
            }

            // Get user information from token
            AuthResponse userInfo = authService.verifyTokenAndGetUser(jwt);
            if (userInfo != null) {
                return ResponseEntity.ok(userInfo);
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

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        try {
            String jwt = parseJwt(request);
            if (jwt == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "No token provided");
                return ResponseEntity.status(401).body(error);
            }

            // Get user information from token
            AuthResponse userInfo = authService.verifyTokenAndGetUser(jwt);
            if (userInfo != null) {
                return ResponseEntity.ok(userInfo);
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
    }    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            String result = authService.verifyEmail(token);
            Map<String, String> response = new HashMap<>();
            
            switch (result) {
                case "success":
                    response.put("message", "Email verified successfully! You can now log in to your account.");
                    response.put("status", "success");
                    return ResponseEntity.ok(response);                case "already_verified":
                    response.put("message", "Email is already verified. You can log in to your account.");
                    response.put("status", "already_verified");
                    return ResponseEntity.ok(response);
                case "expired":
                    response.put("message", "Verification token has expired. Please request a new verification email.");
                    response.put("status", "expired");
                    return ResponseEntity.badRequest().body(response);
                case "invalid":
                    response.put("message", "Invalid verification token. If you've already verified your email, you can proceed to log in.");
                    response.put("status", "invalid");
                    return ResponseEntity.badRequest().body(response);
                default:
                    response.put("message", "Email verification failed. Please try again or contact support.");
                    response.put("status", "error");
                    return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email verification failed. Please try again or contact support.");
            error.put("status", "error");
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

            boolean sent = authService.resendVerificationEmail(email);
            if (sent) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Verification email sent successfully");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Failed to send verification email. Please check if the email is registered.");
                return ResponseEntity.badRequest().body(error);
            }
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
