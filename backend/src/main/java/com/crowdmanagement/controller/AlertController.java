package com.crowdmanagement.controller;

import com.crowdmanagement.dto.AlertResponse;
import com.crowdmanagement.entity.AlertStatus;
import com.crowdmanagement.entity.AlertType;
import com.crowdmanagement.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Alert Controller
 * ----------------
 * REST API endpoints for alert management.
 * Multi-tenant: Uses X-User-Email header for owner identification.
 */
@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(originPatterns = "*", allowCredentials = "false")
public class AlertController {

    @Autowired
    private AlertService alertService;

    /**
     * Get all alerts for the current user
     */
    @GetMapping
    public ResponseEntity<List<AlertResponse>> getAllAlerts(
            @RequestHeader("X-User-Email") String ownerEmail,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long areaId,
            @RequestParam(required = false, defaultValue = "24h") String dateRange) {

        List<AlertResponse> alerts;

        if (areaId != null) {
            alerts = alertService.getAlertsByArea(areaId);
        } else if (status != null && !status.isEmpty() && !status.equals("all")) {
            AlertStatus alertStatus = AlertStatus.valueOf(status.toUpperCase());
            alerts = alertService.getAlertsByStatus(ownerEmail, alertStatus);
        } else if (type != null && !type.isEmpty() && !type.equals("all")) {
            AlertType alertType = AlertType.valueOf(type.toUpperCase());
            alerts = alertService.getAlertsByType(ownerEmail, alertType);
        } else {
            alerts = alertService.getAlertsByDateRange(ownerEmail, dateRange);
        }

        return ResponseEntity.ok(alerts);
    }

    /**
     * Get active (unresolved) alerts
     */
    @GetMapping("/active")
    public ResponseEntity<List<AlertResponse>> getActiveAlerts(
            @RequestHeader("X-User-Email") String ownerEmail) {
        return ResponseEntity.ok(alertService.getActiveAlerts(ownerEmail));
    }

    /**
     * Get unread alert count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader("X-User-Email") String ownerEmail) {
        long count = alertService.getUnreadCount(ownerEmail);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Mark alert as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<AlertResponse> markAsRead(
            @PathVariable Long id,
            @RequestHeader("X-User-Email") String ownerEmail) {
        return ResponseEntity.ok(alertService.markAsRead(id, ownerEmail));
    }

    /**
     * Mark alert as resolved
     */
    @PutMapping("/{id}/resolve")
    public ResponseEntity<AlertResponse> resolveAlert(
            @PathVariable Long id,
            @RequestHeader("X-User-Email") String ownerEmail) {
        return ResponseEntity.ok(alertService.resolveAlert(id, ownerEmail));
    }

    /**
     * Mark all alerts as read
     */
    @PutMapping("/mark-all-read")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            @RequestHeader("X-User-Email") String ownerEmail) {
        alertService.markAllAsRead(ownerEmail);
        Map<String, String> response = new HashMap<>();
        response.put("message", "All alerts marked as read");
        return ResponseEntity.ok(response);
    }
}
