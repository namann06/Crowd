package com.crowdmanagement.controller;

import com.crowdmanagement.dto.LoginRequest;
import com.crowdmanagement.dto.LoginResponse;
import com.crowdmanagement.entity.AdminUser;
import com.crowdmanagement.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Auth Controller
 * ---------------
 * Handles authentication endpoints.
 * Supports both traditional login and Google OAuth.
 * 
 * Endpoints:
 * POST /api/auth/login     - Admin login with username/password
 * GET  /api/auth/validate  - Check if session is valid
 * GET  /api/auth/user      - Get current authenticated user info
 * GET  /api/auth/google    - Initiate Google OAuth login
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Value("${app.backend.url:http://localhost:8080}")
    private String backendUrl;

    /**
     * Admin login endpoint (username/password)
     * @param request Login credentials (username, password)
     * @return Login result
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(response);
        }
    }

    /**
     * Get Google OAuth login URL
     * Frontend redirects user to this URL to start OAuth flow
     * @return URL to initiate Google OAuth
     */
    @GetMapping("/google/url")
    public ResponseEntity<Map<String, String>> getGoogleAuthUrl() {
        Map<String, String> response = new HashMap<>();
        response.put("url", backendUrl + "/oauth2/authorization/google");
        return ResponseEntity.ok(response);
    }

    /**
     * Validate Google login with email
     * Called by frontend after OAuth redirect
     * @param email The email from Google OAuth
     * @return Login response with user info
     */
    @PostMapping("/google/validate")
    public ResponseEntity<LoginResponse> validateGoogleLogin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(new LoginResponse(false, "Email is required", null));
        }

        Optional<AdminUser> user = authService.findByEmail(email);
        
        if (user.isPresent()) {
            return ResponseEntity.ok(
                new LoginResponse(true, "Login successful", user.get().getName())
            );
        } else {
            return ResponseEntity.status(401)
                .body(new LoginResponse(false, "User not authorized", null));
        }
    }

    /**
     * Validate session
     * @return Validation result
     */
    @GetMapping("/validate")
    public ResponseEntity<LoginResponse> validate() {
        return ResponseEntity.ok(new LoginResponse(true, "Session valid", null));
    }

    /**
     * Get current user info (for OAuth users)
     */
    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("email", principal.getAttribute("email"));
        userInfo.put("name", principal.getAttribute("name"));
        userInfo.put("picture", principal.getAttribute("picture"));
        
        return ResponseEntity.ok(userInfo);
    }
}
