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
    private EmailService emailService;
public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        String jwt = jwtUtils.generateJwtToken(loginRequest.getEmail());

        return new AuthResponse(jwt, user.getEmail(), user.getFirstName(), user.getLastName());
    }    public AuthResponse registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already taken!");
        }

        // Create new user's account
        User user = new User(signUpRequest.getEmail(),
                           encoder.encode(signUpRequest.getPassword()),
                           signUpRequest.getFirstName(),
                           signUpRequest.getLastName());

        // Set user as verified by default (no email verification required)
        user.setEmailVerified(true);

        userRepository.save(user);

        // Generate JWT token immediately since no email verification is needed
        String jwt = jwtUtils.generateJwtToken(user.getEmail());
        return new AuthResponse(jwt, user.getEmail(), user.getFirstName(), user.getLastName());
    }    public boolean validateToken(String token) {
        try {
            return jwtUtils.validateJwtToken(token);
        } catch (Exception e) {
            return false;
        }
    }

    public AuthResponse verifyTokenAndGetUser(String token) {
        if (!validateToken(token)) {
            return null;
        }
        
        String email = jwtUtils.getEmailFromJwtToken(token);
        User user = userRepository.findByEmail(email)
            .orElse(null);
            
        if (user == null) {
            return null;
        }
        
        return new AuthResponse(token, user.getEmail(), user.getFirstName(), user.getLastName());
    }

    public boolean verifyEmail(String token) {
        try {
            User user = userRepository.findByEmailVerificationToken(token)
                .orElse(null);
            
            if (user == null) {
                return false;
            }
            
            // Check if token is expired
            if (user.getEmailVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
                return false;
            }
            
            // Mark user as verified
            user.setEmailVerified(true);
            user.setEmailVerificationToken(null);
            user.setEmailVerificationTokenExpiry(null);
            userRepository.save(user);
            
            return true;
        } catch (Exception e) {
            return false;
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
