package com.crowdmanagement.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Alert Entity
 * ------------
 * Represents an alert generated when an area exceeds thresholds.
 * Multi-tenant: Each alert belongs to a specific owner.
 */
@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id", nullable = false)
    @JsonIgnore
    private Area area;

    @Column(name = "area_id", insertable = false, updatable = false)
    private Long areaId;

    @Column(name = "area_name", length = 100)
    private String areaName;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false, length = 30)
    private AlertType alertType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AlertStatus status = AlertStatus.UNREAD;

    @Column(name = "owner_email", nullable = false, length = 100)
    private String ownerEmail;

    @Column(name = "message", length = 500)
    private String message;

    @Column(name = "occupancy_percentage")
    private Double occupancyPercentage;

    @Column(name = "current_count")
    private Integer currentCount;

    @Column(name = "threshold")
    private Integer threshold;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    public Alert() {}

    public Alert(Area area, AlertType alertType, String message) {
        this.area = area;
        this.areaId = area.getId();
        this.areaName = area.getName();
        this.alertType = alertType;
        this.message = message;
        this.ownerEmail = area.getOwnerEmail();
        this.currentCount = area.getCurrentCount();
        this.threshold = area.getThreshold();
        this.capacity = area.getCapacity();
        this.occupancyPercentage = area.getOccupancyPercentage();
        this.status = AlertStatus.UNREAD;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Helper method to check if alert is critical
    @Transient
    public boolean isCritical() {
        return alertType == AlertType.OVERCROWDING || alertType == AlertType.RAPID_INFLOW;
    }

    // Helper method to get severity label
    @Transient
    public String getSeverity() {
        return isCritical() ? "Critical" : "Warning";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Area getArea() { return area; }
    public void setArea(Area area) { this.area = area; }

    public AlertType getAlertType() { return alertType; }
    public void setAlertType(AlertType alertType) { this.alertType = alertType; }

    public AlertStatus getStatus() { return status; }
    public void setStatus(AlertStatus status) { this.status = status; }

    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }

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

    public Long getAreaId() { return areaId; }
    public void setAreaId(Long areaId) { this.areaId = areaId; }

    public String getAreaName() { return areaName; }
    public void setAreaName(String areaName) { this.areaName = areaName; }
}
