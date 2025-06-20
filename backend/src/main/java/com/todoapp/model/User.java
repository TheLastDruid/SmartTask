package com.todoapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.Set;

@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;    private String firstName;
    private String lastName;
    private LocalDateTime createdAt;
    private boolean enabled = true;
    private boolean emailVerified = false;
    private String emailVerificationToken;
    private LocalDateTime emailVerificationTokenExpiry;

    public User() {
        this.createdAt = LocalDateTime.now();
    }

    public User(String email, String password, String firstName, String lastName) {
        this();
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getEmailVerificationToken() {
        return emailVerificationToken;
    }

    public void setEmailVerificationToken(String emailVerificationToken) {
        this.emailVerificationToken = emailVerificationToken;
    }

    public LocalDateTime getEmailVerificationTokenExpiry() {
        return emailVerificationTokenExpiry;
    }

    public void setEmailVerificationTokenExpiry(LocalDateTime emailVerificationTokenExpiry) {
        this.emailVerificationTokenExpiry = emailVerificationTokenExpiry;
    }
}
