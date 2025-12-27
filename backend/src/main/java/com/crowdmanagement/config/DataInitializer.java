package com.crowdmanagement.config;

import com.crowdmanagement.entity.AdminUser;
import com.crowdmanagement.entity.Area;
import com.crowdmanagement.repository.AdminUserRepository;
import com.crowdmanagement.repository.AreaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Data Initializer
 * ----------------
 * Initializes the database with sample data on startup.
 * Creates default admin user and sample areas if they don't exist.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private AreaRepository areaRepository;

    @Override
    public void run(String... args) {
        // Create default admin user if not exists
        if (!adminUserRepository.existsByUsername("admin")) {
            AdminUser admin = new AdminUser();
            admin.setUsername("admin");
            admin.setPassword("admin123"); // In production, use BCrypt!
            adminUserRepository.save(admin);
            System.out.println("✅ Default admin user created (admin/admin123)");
        }

        // Create sample areas if none exist
        if (areaRepository.count() == 0) {
            createSampleArea("Main Entrance", 500, 400);
            createSampleArea("Food Court", 200, 160);
            createSampleArea("Conference Hall A", 100, 80);
            createSampleArea("Conference Hall B", 100, 80);
            createSampleArea("Exhibition Area", 300, 240);
            createSampleArea("Parking Lot", 150, 120);
            System.out.println("✅ Sample areas created");
        }

        System.out.println("===========================================");
        System.out.println("🎯 Crowd Management System Ready!");
        System.out.println("   API: http://localhost:8080/api");
        System.out.println("   Admin: admin / admin123");
        System.out.println("===========================================");
    }

    private void createSampleArea(String name, int capacity, int threshold) {
        Area area = new Area();
        area.setName(name);
        area.setCapacity(capacity);
        area.setThreshold(threshold);
        area.setCurrentCount(0);
        areaRepository.save(area);
    }
}
