package com.crowdmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * AdminUser Entity
 * ----------------
 * Represents an admin user who can login to the system.
 * Supports both traditional login and Google OAuth.
 * Maps to the 'admin_users' table in the database.
 */
@Entity
@Table(name = "admin_users")
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Column(length = 50)
    private String username;

    @Size(min = 6, max = 255, message = "Password must be at least 6 characters")
    @Column(length = 255)
    private String password;

    @Email(message = "Invalid email format")
    @Column(unique = true, length = 100)
    private String email;

    @Column(length = 100)
    private String name;

    @Column(name = "auth_provider", length = 20)
    private String authProvider;  // "LOCAL" or "GOOGLE"

    @Column(name = "google_id", length = 100)
    private String googleId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    public AdminUser() {}

    public AdminUser(Long id, String username, String password, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.createdAt = createdAt;
        this.authProvider = "LOCAL";
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (authProvider == null) {
            authProvider = "LOCAL";
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAuthProvider() { return authProvider; }
    public void setAuthProvider(String authProvider) { this.authProvider = authProvider; }
    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
}
