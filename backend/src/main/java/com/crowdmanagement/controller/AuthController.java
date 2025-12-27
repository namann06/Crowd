package com.crowdmanagement.controller;

import com.crowdmanagement.dto.LoginRequest;
import com.crowdmanagement.dto.LoginResponse;
import com.crowdmanagement.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Auth Controller
 * ---------------
 * Handles authentication endpoints.
 * 
 * Endpoints:
 * POST /api/auth/login - Admin login
 * GET /api/auth/validate - Check if session is valid
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Admin login endpoint
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
     * Validate session (placeholder for future JWT implementation)
     * @return Validation result
     */
    @GetMapping("/validate")
    public ResponseEntity<LoginResponse> validate() {
        // For now, just return a success response
        // In production, verify JWT token here
        return ResponseEntity.ok(new LoginResponse(true, "Session valid", null));
    }
}
