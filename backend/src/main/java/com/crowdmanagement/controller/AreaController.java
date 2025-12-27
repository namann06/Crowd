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
 * 
 * Endpoints:
 * GET    /api/areas           - Get all areas
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
     * Get all areas
     * @return List of all areas with status
     */
    @GetMapping
    public ResponseEntity<List<AreaResponse>> getAllAreas() {
        List<AreaResponse> areas = areaService.getAllAreas();
        return ResponseEntity.ok(areas);
    }

    /**
     * Get area by ID
     * @param id Area ID
     * @return Area details
     */
    @GetMapping("/{id}")
    public ResponseEntity<AreaResponse> getAreaById(@PathVariable Long id) {
        try {
            AreaResponse area = areaService.getAreaById(id);
            return ResponseEntity.ok(area);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create a new area
     * @param request Area data
     * @return Created area
     */
    @PostMapping
    public ResponseEntity<?> createArea(@Valid @RequestBody AreaRequest request) {
        try {
            AreaResponse area = areaService.createArea(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(area);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(errorResponse(e.getMessage()));
        }
    }

    /**
     * Update an existing area
     * @param id Area ID
     * @param request Updated data
     * @return Updated area
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateArea(@PathVariable Long id, @Valid @RequestBody AreaRequest request) {
        try {
            AreaResponse area = areaService.updateArea(id, request);
            return ResponseEntity.ok(area);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(errorResponse(e.getMessage()));
        }
    }

    /**
     * Delete an area
     * @param id Area ID
     * @return Success message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArea(@PathVariable Long id) {
        try {
            areaService.deleteArea(id);
            return ResponseEntity.ok(successResponse("Area deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(errorResponse(e.getMessage()));
        }
    }

    /**
     * Reset area count to zero
     * @param id Area ID
     * @return Success message
     */
    @PostMapping("/{id}/reset")
    public ResponseEntity<?> resetCount(@PathVariable Long id) {
        try {
            areaService.resetCount(id);
            return ResponseEntity.ok(successResponse("Area count reset successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(errorResponse(e.getMessage()));
        }
    }

    /**
     * Get areas needing attention (at or above threshold)
     * @return List of areas needing attention
     */
    @GetMapping("/attention")
    public ResponseEntity<List<AreaResponse>> getAreasNeedingAttention() {
        List<AreaResponse> areas = areaService.getAreasNeedingAttention();
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
