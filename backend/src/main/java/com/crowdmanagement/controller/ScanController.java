package com.crowdmanagement.controller;

import com.crowdmanagement.dto.ScanRequest;
import com.crowdmanagement.dto.ScanResponse;
import com.crowdmanagement.service.ScanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Scan Controller
 * ---------------
 * REST API for QR code scan operations.
 * 
 * Endpoints:
 * POST /api/scans              - Process a new scan
 * GET  /api/scans/recent       - Get recent scans
 * GET  /api/scans/area/{id}    - Get scans for an area
 * GET  /api/scans/today        - Get today's scans
 * GET  /api/scans/area/{id}/trend - Get hourly trend for area
 */
@RestController
@RequestMapping("/api/scans")
public class ScanController {

    @Autowired
    private ScanService scanService;

    /**
     * Process a QR code scan (entry or exit)
     * @param request Scan details (areaId, scanType)
     * @return Scan result with updated count
     */
    @PostMapping
    public ResponseEntity<?> processScan(@RequestBody ScanRequest request) {
        try {
            ScanResponse response = scanService.processScan(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get recent scans
     * @param limit Number of scans to return (default 50)
     * @return List of recent scans
     */
    @GetMapping("/recent")
    public ResponseEntity<List<ScanResponse>> getRecentScans(
            @RequestParam(defaultValue = "50") int limit) {
        List<ScanResponse> scans = scanService.getRecentScans(limit);
        return ResponseEntity.ok(scans);
    }

    /**
     * Get scans for a specific area
     * @param areaId Area ID
     * @return List of scans for the area
     */
    @GetMapping("/area/{areaId}")
    public ResponseEntity<List<ScanResponse>> getScansByArea(@PathVariable Long areaId) {
        List<ScanResponse> scans = scanService.getScansByArea(areaId);
        return ResponseEntity.ok(scans);
    }

    /**
     * Get today's scans
     * @return List of today's scans
     */
    @GetMapping("/today")
    public ResponseEntity<List<ScanResponse>> getTodayScans() {
        List<ScanResponse> scans = scanService.getTodayScans();
        return ResponseEntity.ok(scans);
    }

    /**
     * Get hourly trend data for an area
     * @param areaId Area ID
     * @return Hourly trend data
     */
    @GetMapping("/area/{areaId}/trend")
    public ResponseEntity<List<ScanService.HourlyTrendData>> getHourlyTrend(@PathVariable Long areaId) {
        List<ScanService.HourlyTrendData> trend = scanService.getHourlyTrend(areaId);
        return ResponseEntity.ok(trend);
    }
}
