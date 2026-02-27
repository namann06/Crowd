package com.crowdmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;


@SpringBootApplication
public class CrowdManagementApplication {

    public static void main(String[] args) {
        // Force UTC timezone for the entire JVM so event time comparisons
        // behave identically on local dev machines and deployed servers.
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(CrowdManagementApplication.class, args);
        System.out.println("===========================================");
        System.out.println("Crowd Management System Backend Started!");
        System.out.println("API Running at: http://localhost:8080");
        System.out.println("===========================================");
    }
}
