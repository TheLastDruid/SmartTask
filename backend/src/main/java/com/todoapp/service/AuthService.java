package com.todoapp.service;

import com.todoapp.config.JwtUtils;
import com.todoapp.dto.AuthResponse;
import com.todoapp.dto.LoginRequest;
import com.todoapp.dto.RegisterRequest;
import com.todoapp.model.User;
import com.todoapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if email is verified
        if (!user.isEmailVerified()) {
            throw new RuntimeException("Please verify your email address before logging in");
        }

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

        // Generate email verification token
        String verificationToken = UUID.randomUUID().toString();
        user.setEmailVerificationToken(verificationToken);
        user.setEmailVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        user.setEmailVerified(false);

        userRepository.save(user);

        // Send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), verificationToken);
        } catch (Exception e) {
            // If email sending fails, we still want to create the user
            // They can request another verification email later
            System.err.println("Failed to send verification email: " + e.getMessage());
        }

        // Don't generate JWT token yet - user needs to verify email first
        return new AuthResponse(null, user.getEmail(), user.getFirstName(), user.getLastName());
    }

    public boolean validateToken(String token) {
        try {
            return jwtUtils.validateJwtToken(token);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean verifyEmail(String token) {
        Optional<User> userOptional = userRepository.findByEmailVerificationToken(token);
        
        if (userOptional.isEmpty()) {
            return false;
        }
        
        User user = userOptional.get();
        
        // Check if token is expired
        if (user.getEmailVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            return false;
        }
        
        // Verify the email
        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);
        userRepository.save(user);
        
        return true;
    }

    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        // Generate new verification token
        String verificationToken = UUID.randomUUID().toString();
        user.setEmailVerificationToken(verificationToken);
        user.setEmailVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), verificationToken);
    }
}
