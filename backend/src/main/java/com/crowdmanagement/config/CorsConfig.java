package com.crowdmanagement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

/**
 * CORS Configuration
 * ------------------
 * Configures Cross-Origin Resource Sharing to allow
 * the React frontend (running on port 5173) to communicate
 * with this backend (running on port 8080).
 * 
 * Without this configuration, browser would block requests
 * from frontend to backend due to same-origin policy.
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
        registry.addMapping("/api/**")  // Apply to all API endpoints
                .allowedOrigins(allowedOrigins.split(","))  // Frontend URL(s)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")  // Allow all headers
                .allowCredentials(true)  // Allow cookies/auth
                .maxAge(3600);  // Cache preflight for 1 hour
    }

    /**
     * Alternative CORS configuration using CorsConfigurationSource
     * This provides more fine-grained control if needed
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Set allowed origins
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        
        // Set allowed HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        
        // Set allowed headers
        configuration.setAllowedHeaders(List.of("*"));
        
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // Apply to all paths
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        
        return source;
    }
}
