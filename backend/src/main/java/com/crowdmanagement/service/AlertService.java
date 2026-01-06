package com.crowdmanagement.service;

import com.crowdmanagement.dto.AlertResponse;
import com.crowdmanagement.entity.*;
import com.crowdmanagement.repository.AlertRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Alert Service
 * -------------
 * Business logic for alert management and generation.
 */
@Service
public class AlertService {

    private static final Logger log = LoggerFactory.getLogger(AlertService.class);

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private WebSocketService webSocketService;

    // Track recent entries for rapid inflow detection (areaId -> timestamps)
    private final Map<Long, List<LocalDateTime>> recentEntries = new HashMap<>();
    
    // Rapid inflow threshold: X entries within Y seconds
    private static final int RAPID_INFLOW_COUNT = 10;
    private static final int RAPID_INFLOW_SECONDS = 30;

    /**
     * Check and generate alerts based on area status after a scan
     * @param area The area that was scanned
     * @param scanType Entry or Exit
     * @return Generated alert if any, null otherwise
     */
    @Transactional
    public Alert checkAndGenerateAlert(Area area, ScanType scanType) {
        log.info("Checking alerts for area: {} (id={}), scanType: {}, currentCount: {}, threshold: {}, capacity: {}", 
                area.getName(), area.getId(), scanType, area.getCurrentCount(), area.getThreshold(), area.getCapacity());
        
        if (scanType == ScanType.EXIT) {
            // Check if we should auto-resolve alerts when count drops
            autoResolveAlerts(area);
            return null;
        }

        // Check for overcrowding (at or above capacity)
        if (area.getCurrentCount() >= area.getCapacity()) {
            log.info("Overcrowding detected! Count {} >= Capacity {}", area.getCurrentCount(), area.getCapacity());
            return generateAlertIfNotExists(area, AlertType.OVERCROWDING,
                    String.format("%s is overcrowded at %d%% capacity (%d/%d)",
                            area.getName(),
                            (int) area.getOccupancyPercentage(),
                            area.getCurrentCount(),
                            area.getCapacity()));
        }

        // Check for threshold breach (above threshold but below capacity)
        if (area.getCurrentCount() >= area.getThreshold()) {
            log.info("Threshold breach detected! Count {} >= Threshold {}", area.getCurrentCount(), area.getThreshold());
            return generateAlertIfNotExists(area, AlertType.THRESHOLD_BREACH,
                    String.format("%s has breached threshold at %d%% capacity (%d/%d)",
                            area.getName(),
                            (int) area.getOccupancyPercentage(),
                            area.getCurrentCount(),
                            area.getCapacity()));
        }

        // Check for rapid inflow
        if (detectRapidInflow(area.getId())) {
            log.info("Rapid inflow detected for area {}", area.getName());
            return generateAlertIfNotExists(area, AlertType.RAPID_INFLOW,
                    String.format("Rapid inflow detected at %s - %d entries in %d seconds",
                            area.getName(),
                            RAPID_INFLOW_COUNT,
                            RAPID_INFLOW_SECONDS));
        }

        log.info("No alert conditions met for area {}", area.getName());
        return null;
    }

    /**
     * Generate alert if one doesn't already exist for this area and type
     */
    private Alert generateAlertIfNotExists(Area area, AlertType alertType, String message) {
        log.info("Checking alert generation for area: {} ({}), type: {}, count: {}/{}/{}", 
                area.getName(), area.getId(), alertType, area.getCurrentCount(), area.getThreshold(), area.getCapacity());
        
        // Check if there's already an unresolved alert of this type for this area
        List<Alert> existingAlerts = alertRepository.findUnresolvedByAreaAndType(area.getId(), alertType);
        if (!existingAlerts.isEmpty()) {
            log.info("Alert already exists for area {} and type {}, skipping", area.getName(), alertType);
            return null; // Don't create duplicate alerts
        }

        Alert alert = new Alert(area, alertType, message);
        alert = alertRepository.save(alert);
        log.info("Created new alert: id={}, area={}, type={}, message={}", alert.getId(), alert.getAreaName(), alertType, message);

        // Broadcast alert via WebSocket
        AlertResponse alertResponse = AlertResponse.fromEntity(alert);
        log.info("Broadcasting alert via WebSocket: {}", alertResponse.getId());
        webSocketService.broadcastAlert(alertResponse);

        return alert;
    }

    /**
     * Detect rapid inflow by tracking recent entries
     */
    private boolean detectRapidInflow(Long areaId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoff = now.minusSeconds(RAPID_INFLOW_SECONDS);

        // Get or create entry list for this area
        List<LocalDateTime> entries = recentEntries.computeIfAbsent(areaId, 
                k -> new java.util.ArrayList<>());

        // Add current entry
        entries.add(now);

        // Remove old entries
        entries.removeIf(time -> time.isBefore(cutoff));

        // Check if we've exceeded the threshold
        return entries.size() >= RAPID_INFLOW_COUNT;
    }

    /**
     * Auto-resolve alerts when area count drops below thresholds
     */
    private void autoResolveAlerts(Area area) {
        // If below threshold, resolve threshold breach alerts
        if (area.getCurrentCount() < area.getThreshold()) {
            List<Alert> thresholdAlerts = alertRepository.findAlertsToAutoResolve(
                    area.getId(), AlertType.THRESHOLD_BREACH);
            for (Alert alert : thresholdAlerts) {
                alert.setStatus(AlertStatus.RESOLVED);
                alert.setResolvedAt(LocalDateTime.now());
                alertRepository.save(alert);
            }
        }

        // If below capacity, resolve overcrowding alerts
        if (area.getCurrentCount() < area.getCapacity()) {
            List<Alert> overcrowdingAlerts = alertRepository.findAlertsToAutoResolve(
                    area.getId(), AlertType.OVERCROWDING);
            for (Alert alert : overcrowdingAlerts) {
                alert.setStatus(AlertStatus.RESOLVED);
                alert.setResolvedAt(LocalDateTime.now());
                alertRepository.save(alert);
            }
        }
    }

    /**
     * Get all alerts for an owner
     */
    public List<AlertResponse> getAllAlerts(String ownerEmail) {
        return alertRepository.findByOwnerEmailOrderByCreatedAtDesc(ownerEmail)
                .stream()
                .map(AlertResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get alerts filtered by status
     */
    public List<AlertResponse> getAlertsByStatus(String ownerEmail, AlertStatus status) {
        return alertRepository.findByOwnerEmailAndStatusOrderByCreatedAtDesc(ownerEmail, status)
                .stream()
                .map(AlertResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get alerts filtered by type
     */
    public List<AlertResponse> getAlertsByType(String ownerEmail, AlertType alertType) {
        return alertRepository.findByOwnerEmailAndAlertTypeOrderByCreatedAtDesc(ownerEmail, alertType)
                .stream()
                .map(AlertResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get alerts for a specific area
     */
    public List<AlertResponse> getAlertsByArea(Long areaId) {
        return alertRepository.findByArea_IdOrderByCreatedAtDesc(areaId)
                .stream()
                .map(AlertResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get alerts within a date range
     */
    public List<AlertResponse> getAlertsByDateRange(String ownerEmail, String range) {
        LocalDateTime startDate;
        LocalDateTime endDate = LocalDateTime.now();

        switch (range.toLowerCase()) {
            case "today":
                startDate = LocalDate.now().atStartOfDay();
                break;
            case "24h":
                startDate = LocalDateTime.now().minusHours(24);
                break;
            case "7d":
                startDate = LocalDateTime.now().minusDays(7);
                break;
            case "30d":
                startDate = LocalDateTime.now().minusDays(30);
                break;
            default:
                startDate = LocalDateTime.now().minusHours(24);
        }

        return alertRepository.findByOwnerEmailAndDateRange(ownerEmail, startDate, endDate)
                .stream()
                .map(AlertResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get active (unresolved) alerts
     */
    public List<AlertResponse> getActiveAlerts(String ownerEmail) {
        return alertRepository.findActiveAlertsByOwner(ownerEmail)
                .stream()
                .map(AlertResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get count of unread alerts
     */
    public long getUnreadCount(String ownerEmail) {
        return alertRepository.countByOwnerEmailAndStatus(ownerEmail, AlertStatus.UNREAD);
    }

    /**
     * Mark alert as read
     */
    @Transactional
    public AlertResponse markAsRead(Long alertId, String ownerEmail) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found with id: " + alertId));

        if (!alert.getOwnerEmail().equals(ownerEmail)) {
            throw new RuntimeException("Not authorized to access this alert");
        }

        if (alert.getStatus() == AlertStatus.UNREAD) {
            alert.setStatus(AlertStatus.READ);
            alert = alertRepository.save(alert);
        }

        return AlertResponse.fromEntity(alert);
    }

    /**
     * Mark alert as resolved
     */
    @Transactional
    public AlertResponse resolveAlert(Long alertId, String ownerEmail) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found with id: " + alertId));

        if (!alert.getOwnerEmail().equals(ownerEmail)) {
            throw new RuntimeException("Not authorized to access this alert");
        }

        alert.setStatus(AlertStatus.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());
        alert = alertRepository.save(alert);

        return AlertResponse.fromEntity(alert);
    }

    /**
     * Mark all alerts as read
     */
    @Transactional
    public void markAllAsRead(String ownerEmail) {
        List<Alert> unreadAlerts = alertRepository.findByOwnerEmailAndStatusOrderByCreatedAtDesc(
                ownerEmail, AlertStatus.UNREAD);
        for (Alert alert : unreadAlerts) {
            alert.setStatus(AlertStatus.READ);
            alertRepository.save(alert);
        }
    }
}
