package com.crowdmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Application Class
 * -----------------------
 * This is the entry point for the Spring Boot application.
 * The @SpringBootApplication annotation combines:
 * - @Configuration: Tags the class as a source of bean definitions
 * - @EnableAutoConfiguration: Tells Spring Boot to start adding beans
 * - @ComponentScan: Tells Spring to scan for components in this package
 */
@SpringBootApplication
public class CrowdManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(CrowdManagementApplication.class, args);
        System.out.println("===========================================");
        System.out.println("Crowd Management System Backend Started!");
        System.out.println("API Running at: http://localhost:8080");
        System.out.println("===========================================");
    }
}
