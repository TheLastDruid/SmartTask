package com.todoapp.service;

import com.todoapp.config.JwtUtils;
import com.todoapp.dto.AuthResponse;
import com.todoapp.dto.LoginRequest;
import com.todoapp.dto.RegisterRequest;
import com.todoapp.model.User;
import com.todoapp.repository.UserRepository;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        // First, check if user exists and is verified
        User user = userRepository.findByEmail(loginRequest.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if email is verified
        if (!user.isEmailVerified()) {
            throw new RuntimeException("Email not verified. Please check your email and verify your account before logging in.");
        }

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(loginRequest.getEmail());

        return new AuthResponse(jwt, user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), user.isEmailVerified());
    }public AuthResponse registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already taken!");
        }

        // Create new user's account
        User user = new User(signUpRequest.getEmail(),
                           encoder.encode(signUpRequest.getPassword()),
                           signUpRequest.getFirstName(),
                           signUpRequest.getLastName());

        // Generate email verification token
        String verificationToken = java.util.UUID.randomUUID().toString();
        user.setEmailVerificationToken(verificationToken);
        user.setEmailVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        user.setEmailVerified(false); // User must verify email

        userRepository.save(user);        // Send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), verificationToken);
        } catch (Exception e) {
            // Log email sending failure but don't delete user for development testing
            System.out.println("WARNING: Failed to send verification email to " + user.getEmail() + 
                             ". Error: " + e.getMessage() + 
                             ". User created but email not sent. Verification token: " + verificationToken);
        }

        // Don't generate JWT token - user must verify email first
        // Return response indicating verification is required
        return new AuthResponse(null, user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), false);
    }public boolean validateToken(String token) {
        try {
            return jwtUtils.validateJwtToken(token);
        } catch (Exception e) {
            return false;
        }
    }    public AuthResponse verifyTokenAndGetUser(String token) {
        if (!validateToken(token)) {
            return null;
        }
        
        String email = jwtUtils.getEmailFromJwtToken(token);
        User user = userRepository.findByEmail(email)
            .orElse(null);
            
        if (user == null) {
            return null;
        }
        
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), user.isEmailVerified());
    }    public String verifyEmail(String token) {
        try {
            // First check if we can find a user with this token
            User user = userRepository.findByEmailVerificationToken(token)
                .orElse(null);
            
            if (user == null) {
                // Token not found - this could mean:
                // 1. Token is completely invalid
                // 2. User was already verified and token was cleared
                // 
                // For better UX, let's assume this is likely an already verified user
                // since invalid tokens are less common than repeated clicks on verification links
                return "already_verified";
            }
            
            // Check if user is already verified (shouldn't happen with token present, but just in case)
            if (user.isEmailVerified()) {
                // Clear the token since verification is complete
                user.setEmailVerificationToken(null);
                user.setEmailVerificationTokenExpiry(null);
                userRepository.save(user);
                return "already_verified";
            }
            
            // Check if token is expired
            if (user.getEmailVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
                return "expired";
            }
            
            // Mark user as verified
            user.setEmailVerified(true);
            user.setEmailVerificationToken(null);
            user.setEmailVerificationTokenExpiry(null);
            userRepository.save(user);
            
            return "success";
        } catch (Exception e) {
            return "error";
        }
    }

    public boolean resendVerificationEmail(String email) {
        try {
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user == null || user.isEmailVerified()) {
                return false;
            }
            
            // Generate new verification token
            String verificationToken = java.util.UUID.randomUUID().toString();
            user.setEmailVerificationToken(verificationToken);
            user.setEmailVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
            userRepository.save(user);
              // Send verification email
            emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), verificationToken);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
