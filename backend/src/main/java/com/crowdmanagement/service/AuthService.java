package com.crowdmanagement.service;

import com.crowdmanagement.dto.LoginRequest;
import com.crowdmanagement.dto.LoginResponse;
import com.crowdmanagement.entity.AdminUser;
import com.crowdmanagement.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Auth Service
 * ------------
 * Handles admin authentication.
 * Supports both traditional login and Google OAuth.
 */
@Service
public class AuthService {

    @Autowired
    private AdminUserRepository adminUserRepository;

    /**
     * Authenticate admin user with username/password
     * @param request Login credentials
     * @return LoginResponse with success/failure status
     */
    public LoginResponse login(LoginRequest request) {
        // Find user by username and password
        Optional<AdminUser> user = adminUserRepository
                .findByUsernameAndPassword(request.getUsername(), request.getPassword());

        if (user.isPresent()) {
            // Update last login time
            AdminUser adminUser = user.get();
            adminUser.setLastLogin(LocalDateTime.now());
            adminUserRepository.save(adminUser);
            
            return new LoginResponse(true, "Login successful", adminUser.getUsername());
        } else {
            return new LoginResponse(false, "Invalid username or password", null);
        }
    }

    /**
     * Register or update a Google OAuth user
     * @param email User's Google email
     * @param name User's display name from Google
     * @return The admin user
     */
    public AdminUser registerOrUpdateGoogleUser(String email, String name) {
        Optional<AdminUser> existingUser = adminUserRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            // Update existing user
            AdminUser user = existingUser.get();
            user.setName(name);
            user.setLastLogin(LocalDateTime.now());
            return adminUserRepository.save(user);
        } else {
            // Create new user
            AdminUser newUser = new AdminUser();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setUsername(email);  // Use email as username
            newUser.setAuthProvider("GOOGLE");
            newUser.setLastLogin(LocalDateTime.now());
            return adminUserRepository.save(newUser);
        }
    }

    /**
     * Find admin user by email
     * @param email Email to search for
     * @return Optional containing the admin user
     */
    public Optional<AdminUser> findByEmail(String email) {
        return adminUserRepository.findByEmail(email);
    }

    /**
     * Check if admin user exists
     * @param username Username to check
     * @return true if exists
     */
    public boolean userExists(String username) {
        return adminUserRepository.existsByUsername(username);
    }

    /**
     * Check if email is registered
     * @param email Email to check
     * @return true if exists
     */
    public boolean emailExists(String email) {
        return adminUserRepository.existsByEmail(email);
    }
}
