package com.crowdmanagement.dto;

import com.crowdmanagement.entity.Alert;
import com.crowdmanagement.entity.AlertStatus;
import com.crowdmanagement.entity.AlertType;

import java.time.LocalDateTime;

/**
 * Alert Response DTO
 * ------------------
 * Response object for Alert entity.
 */
public class AlertResponse {

    private Long id;
    private Long areaId;
    private String areaName;
    private String eventName;
    private AlertType alertType;
    private String alertTypeDisplay;
    private AlertStatus status;
    private String severity;
    private boolean critical;
    private String message;
    private Double occupancyPercentage;
    private Integer currentCount;
    private Integer threshold;
    private Integer capacity;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    public AlertResponse() {}

    public static AlertResponse fromEntity(Alert alert) {
        AlertResponse response = new AlertResponse();
        response.setId(alert.getId());
        response.setAreaId(alert.getAreaId());
        response.setAreaName(alert.getAreaName());
        response.setAlertType(alert.getAlertType());
        response.setAlertTypeDisplay(formatAlertType(alert.getAlertType()));
        response.setStatus(alert.getStatus());
        response.setSeverity(alert.getSeverity());
        response.setCritical(alert.isCritical());
        response.setMessage(alert.getMessage());
        response.setOccupancyPercentage(alert.getOccupancyPercentage());
        response.setCurrentCount(alert.getCurrentCount());
        response.setThreshold(alert.getThreshold());
        response.setCapacity(alert.getCapacity());
        response.setCreatedAt(alert.getCreatedAt());
        response.setResolvedAt(alert.getResolvedAt());
        
        // Get event name from area's event if available
        if (alert.getArea() != null && alert.getArea().getEvent() != null) {
            response.setEventName(alert.getArea().getEvent().getName());
        }
        
        return response;
    }

    private static String formatAlertType(AlertType type) {
        switch (type) {
            case OVERCROWDING:
                return "Overcrowding";
            case THRESHOLD_BREACH:
                return "Threshold Breach";
            case RAPID_INFLOW:
                return "Rapid Inflow";
            default:
                return type.name();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAreaId() { return areaId; }
    public void setAreaId(Long areaId) { this.areaId = areaId; }

    public String getAreaName() { return areaName; }
    public void setAreaName(String areaName) { this.areaName = areaName; }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }

    public AlertType getAlertType() { return alertType; }
    public void setAlertType(AlertType alertType) { this.alertType = alertType; }

    public String getAlertTypeDisplay() { return alertTypeDisplay; }
    public void setAlertTypeDisplay(String alertTypeDisplay) { this.alertTypeDisplay = alertTypeDisplay; }

    public AlertStatus getStatus() { return status; }
    public void setStatus(AlertStatus status) { this.status = status; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public boolean isCritical() { return critical; }
    public void setCritical(boolean critical) { this.critical = critical; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Double getOccupancyPercentage() { return occupancyPercentage; }
    public void setOccupancyPercentage(Double occupancyPercentage) { this.occupancyPercentage = occupancyPercentage; }

    public Integer getCurrentCount() { return currentCount; }
    public void setCurrentCount(Integer currentCount) { this.currentCount = currentCount; }

    public Integer getThreshold() { return threshold; }
    public void setThreshold(Integer threshold) { this.threshold = threshold; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}
