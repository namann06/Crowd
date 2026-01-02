package com.crowdmanagement.controller;

import com.crowdmanagement.dto.AreaRequest;
import com.crowdmanagement.dto.AreaResponse;
import com.crowdmanagement.service.AreaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Area Controller
 * ---------------
 * REST API for area management.
 * Multi-tenant: Uses X-User-Email header to identify the owner.
 * 
 * Endpoints:
 * GET    /api/areas           - Get all areas for current user
 * GET    /api/areas/{id}      - Get area by ID
 * POST   /api/areas           - Create new area
 * PUT    /api/areas/{id}      - Update area
 * DELETE /api/areas/{id}      - Delete area
 * POST   /api/areas/{id}/reset - Reset area count
 * GET    /api/areas/attention - Get areas needing attention
 */
@RestController
@RequestMapping("/api/areas")
public class AreaController {

    @Autowired
    private AreaService areaService;

    /**
     * Get all areas for the current user
     * @param ownerEmail User's email from header
     * @return List of all areas with status
     */
    @GetMapping
    public ResponseEntity<?> getAllAreas(@RequestHeader(value = "X-User-Email", required = false) String ownerEmail) {
        if (ownerEmail == null || ownerEmail.isEmpty()) {
            return ResponseEntity.badRequest().body(errorResponse("X-User-Email header is required"));
        }
        List<AreaResponse> areas = areaService.getAllAreas(ownerEmail);
        return ResponseEntity.ok(areas);
    }

    /**
     * Get area by ID
     * @param id Area ID
     * @param ownerEmail User's email from header
     * @return Area details
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAreaById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Email", required = false) String ownerEmail) {
        try {
            // If no owner email, use public access (for QR scanning)
            if (ownerEmail == null || ownerEmail.isEmpty()) {
                AreaResponse area = areaService.getAreaByIdPublic(id);
                return ResponseEntity.ok(area);
            }
            AreaResponse area = areaService.getAreaById(id, ownerEmail);
            return ResponseEntity.ok(area);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create a new area
     * @param request Area data
     * @param ownerEmail User's email from header
     * @return Created area
     */
    @PostMapping
    public ResponseEntity<?> createArea(
            @Valid @RequestBody AreaRequest request,
            @RequestHeader(value = "X-User-Email", required = false) String ownerEmail) {
        if (ownerEmail == null || ownerEmail.isEmpty()) {
            return ResponseEntity.badRequest().body(errorResponse("X-User-Email header is required"));
        }
        try {
            AreaResponse area = areaService.createArea(request, ownerEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(area);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(errorResponse(e.getMessage()));
        }
    }

    /**
     * Update an existing area
     * @param id Area ID
     * @param request Updated data
     * @param ownerEmail User's email from header
     * @return Updated area
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateArea(
            @PathVariable Long id, 
            @Valid @RequestBody AreaRequest request,
            @RequestHeader(value = "X-User-Email", required = false) String ownerEmail) {
        if (ownerEmail == null || ownerEmail.isEmpty()) {
            return ResponseEntity.badRequest().body(errorResponse("X-User-Email header is required"));
        }
        try {
            AreaResponse area = areaService.updateArea(id, request, ownerEmail);
            return ResponseEntity.ok(area);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(errorResponse(e.getMessage()));
        }
    }

    /**
     * Delete an area
     * @param id Area ID
     * @param ownerEmail User's email from header
     * @return Success message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArea(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Email", required = false) String ownerEmail) {
        if (ownerEmail == null || ownerEmail.isEmpty()) {
            return ResponseEntity.badRequest().body(errorResponse("X-User-Email header is required"));
        }
        try {
            areaService.deleteArea(id, ownerEmail);
            return ResponseEntity.ok(successResponse("Area deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(errorResponse(e.getMessage()));
        }
    }

    /**
     * Reset area count to zero
     * @param id Area ID
     * @param ownerEmail User's email from header
     * @return Success message
     */
    @PostMapping("/{id}/reset")
    public ResponseEntity<?> resetCount(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Email", required = false) String ownerEmail) {
        if (ownerEmail == null || ownerEmail.isEmpty()) {
            return ResponseEntity.badRequest().body(errorResponse("X-User-Email header is required"));
        }
        try {
            areaService.resetCount(id, ownerEmail);
            return ResponseEntity.ok(successResponse("Area count reset successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(errorResponse(e.getMessage()));
        }
    }

    /**
     * Get areas needing attention (at or above threshold)
     * @param ownerEmail User's email from header
     * @return List of areas needing attention
     */
    @GetMapping("/attention")
    public ResponseEntity<?> getAreasNeedingAttention(
            @RequestHeader(value = "X-User-Email", required = false) String ownerEmail) {
        if (ownerEmail == null || ownerEmail.isEmpty()) {
            return ResponseEntity.badRequest().body(errorResponse("X-User-Email header is required"));
        }
        List<AreaResponse> areas = areaService.getAreasNeedingAttention(ownerEmail);
        return ResponseEntity.ok(areas);
    }

    // Helper methods for response formatting
    private Map<String, String> errorResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("error", message);
        return response;
    }

    private Map<String, String> successResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return response;
    }
}
