package com.todoapp.config;

import com.todoapp.model.User;
import com.todoapp.repository.UserRepository;
import com.todoapp.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Starting database initialization...");
        
        // Clear existing data
        logger.info("Clearing existing users and tasks...");
        userRepository.deleteAll();
        taskRepository.deleteAll();
        logger.info("Database cleared successfully!");

        // Create test user
        createTestUser();
        
        logger.info("Database initialization completed!");
    }

    private void createTestUser() {
        String testEmail = "test@test.com";
        String testPassword = "investor";
        
        logger.info("Creating test user with email: {}", testEmail);
        
        User testUser = new User();
        testUser.setEmail(testEmail);
        testUser.setPassword(passwordEncoder.encode(testPassword));
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setEnabled(true);
        
        User savedUser = userRepository.save(testUser);
        logger.info("Test user created successfully with ID: {}", savedUser.getId());
        logger.info("Login credentials - Email: {} | Password: {}", testEmail, testPassword);
    }
}
