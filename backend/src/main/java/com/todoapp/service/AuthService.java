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

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(loginRequest.getEmail());

        User user = userRepository.findByEmail(loginRequest.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        return new AuthResponse(jwt, user.getEmail(), user.getFirstName(), user.getLastName());
    }

    public AuthResponse registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already taken!");
        }

        // Create new user's account
        User user = new User(signUpRequest.getEmail(),
                           encoder.encode(signUpRequest.getPassword()),
                           signUpRequest.getFirstName(),
                           signUpRequest.getLastName());

        userRepository.save(user);

        // Generate JWT token
        String jwt = jwtUtils.generateJwtToken(user.getEmail());

        return new AuthResponse(jwt, user.getEmail(), user.getFirstName(), user.getLastName());
    }

    public boolean validateToken(String token) {
        try {
            return jwtUtils.validateJwtToken(token);
        } catch (Exception e) {
            return false;
        }
    }
}
