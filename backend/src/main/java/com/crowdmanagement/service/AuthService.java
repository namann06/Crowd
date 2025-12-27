package com.crowdmanagement.service;

import com.crowdmanagement.dto.LoginRequest;
import com.crowdmanagement.dto.LoginResponse;
import com.crowdmanagement.entity.AdminUser;
import com.crowdmanagement.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Auth Service
 * ------------
 * Handles admin authentication.
 * For this project, we use simple username/password matching.
 * In production, use Spring Security with BCrypt password hashing.
 */
@Service
public class AuthService {

    @Autowired
    private AdminUserRepository adminUserRepository;

    /**
     * Authenticate admin user
     * @param request Login credentials
     * @return LoginResponse with success/failure status
     */
    public LoginResponse login(LoginRequest request) {
        // Find user by username and password
        Optional<AdminUser> user = adminUserRepository
                .findByUsernameAndPassword(request.getUsername(), request.getPassword());

        if (user.isPresent()) {
            return new LoginResponse(true, "Login successful", user.get().getUsername());
        } else {
            return new LoginResponse(false, "Invalid username or password", null);
        }
    }

    /**
     * Check if admin user exists
     * @param username Username to check
     * @return true if exists
     */
    public boolean userExists(String username) {
        return adminUserRepository.existsByUsername(username);
    }
}
