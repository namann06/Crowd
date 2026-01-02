package com.crowdmanagement.config;

import com.crowdmanagement.entity.AdminUser;
import com.crowdmanagement.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Data Initializer
 * ----------------
 * Initializes the database with default admin user on startup.
 * Note: Areas are now user-specific (multi-tenant), so no sample areas are created.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Override
    public void run(String... args) {
        // Create default admin user if not exists
        if (!adminUserRepository.existsByUsername("admin")) {
            AdminUser admin = new AdminUser();
            admin.setUsername("admin");
            admin.setPassword("admin123"); // In production, use BCrypt!
            admin.setEmail("admin@crowdcontrol.com");
            admin.setName("Admin User");
            adminUserRepository.save(admin);
            System.out.println("✅ Default admin user created (admin/admin123)");
        }

        System.out.println("===========================================");
        System.out.println("🎯 Crowd Management System Ready!");
        System.out.println("   API: http://localhost:8080/api");
        System.out.println("   Admin: admin / admin123");
        System.out.println("   Multi-tenant: Each user has their own areas");
        System.out.println("===========================================");
    }
}
