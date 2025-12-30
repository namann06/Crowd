package com.crowdmanagement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS Configuration
 * ------------------
 * Configures Cross-Origin Resource Sharing to allow
 * the React frontend (running on port 5173) to communicate
 * with this backend (running on port 8080).
 * 
 * Without this configuration, browser would block requests
 * from frontend to backend due to same-origin policy.
 * 
 * Note: The corsConfigurationSource bean is defined in SecurityConfig
 * for integration with Spring Security OAuth2.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    /**
     * Allowed origins from application.properties
     * Default: http://localhost:5173 (Vite dev server)
     */
    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    /**
     * Configure CORS mappings for all endpoints
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // Apply to all endpoints
                .allowedOrigins(allowedOrigins.split(","))  // Frontend URL(s)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")  // Allow all headers
                .allowCredentials(true)  // Allow cookies/auth
                .maxAge(3600);  // Cache preflight for 1 hour
    }
}
