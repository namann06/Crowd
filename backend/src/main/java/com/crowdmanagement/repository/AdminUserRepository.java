package com.crowdmanagement.repository;

import com.crowdmanagement.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * AdminUser Repository
 * --------------------
 * Provides database operations for AdminUser entity.
 * Extends JpaRepository which provides:
 * - save(), findById(), findAll(), delete(), etc.
 * 
 * Spring Data JPA automatically implements this interface at runtime.
 */
@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {

    /**
     * Find an admin user by username
     * Spring Data JPA automatically creates the query from method name
     * 
     * @param username The username to search for
     * @return Optional containing the admin user if found
     */
    Optional<AdminUser> findByUsername(String username);

    /**
     * Find an admin user by email (for Google OAuth)
     * 
     * @param email The email to search for
     * @return Optional containing the admin user if found
     */
    Optional<AdminUser> findByEmail(String email);

    /**
     * Check if an admin user exists with the given username
     * 
     * @param username The username to check
     * @return true if exists, false otherwise
     */
    boolean existsByUsername(String username);

    /**
     * Check if an admin user exists with the given email
     * 
     * @param email The email to check
     * @return true if exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Find admin user by username and password (for simple authentication)
     * Note: In production, use proper password hashing and Spring Security
     * 
     * @param username The username
     * @param password The password (plain text for now)
     * @return Optional containing the admin user if credentials match
     */
    Optional<AdminUser> findByUsernameAndPassword(String username, String password);
}
