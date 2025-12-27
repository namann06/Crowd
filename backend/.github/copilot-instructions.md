# Crowd Management System - Backend

## Project Overview
This is the Spring Boot backend for the Crowd Management & Control System.

## Tech Stack
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: MySQL
- **ORM**: Spring Data JPA with Hibernate
- **Build Tool**: Maven

## Project Structure
```
backend/
├── src/main/java/com/crowdmanagement/
│   ├── CrowdManagementApplication.java  # Main entry point
│   ├── config/                          # Configuration classes
│   │   └── CorsConfig.java              # CORS settings
│   ├── entity/                          # JPA Entities
│   │   ├── AdminUser.java               # Admin user entity
│   │   ├── Area.java                    # Monitored area entity
│   │   ├── ScanLog.java                 # Scan log entity
│   │   └── ScanType.java                # Enum for scan types
│   └── repository/                      # Data access layer
│       ├── AdminUserRepository.java
│       ├── AreaRepository.java
│       └── ScanLogRepository.java
├── src/main/resources/
│   ├── application.properties           # App configuration
│   └── schema.sql                       # Database schema
└── pom.xml                              # Maven dependencies
```

## Setup Instructions
1. Ensure MySQL is running on localhost:3306
2. Create database: `CREATE DATABASE crowd_management_db;`
3. Update `application.properties` with your MySQL credentials
4. Run: `mvn spring-boot:run`

## Database Tables
- `admin_users` - Admin login credentials
- `areas` - Monitored areas with capacity/threshold
- `scan_logs` - Entry/exit scan history

## Coding Guidelines
- Use Lombok for reducing boilerplate
- Follow REST API conventions
- Keep controllers thin, services fat
- Use DTOs for API responses
