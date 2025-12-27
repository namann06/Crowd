package com.crowdmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * AdminUser Entity
 * ----------------
 * Represents an admin user who can login to the system.
 * Maps to the 'admin_users' table in the database.
 */
@Entity
@Table(name = "admin_users")
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 255, message = "Password must be at least 6 characters")
    @Column(nullable = false, length = 255)
    private String password;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public AdminUser() {}

    public AdminUser(Long id, String username, String password, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
