package com.crowdmanagement.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Area Entity
 * -----------
 * Represents a monitored area/zone within an event.
 * Multi-tenant: Each area belongs to a specific user (owner).
 */
@Entity
@Table(name = "areas", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"name", "event_id"})
})
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Area name is required")
    @Size(min = 2, max = 100, message = "Area name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Owner email is required")
    @Column(name = "owner_email", nullable = false, length = 100)
    private String ownerEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    @JsonIgnore
    private Event event;

    @Min(value = 1, message = "Capacity must be at least 1")
    @Column(nullable = false)
    private Integer capacity;

    @Min(value = 1, message = "Threshold must be at least 1")
    @Column(nullable = false)
    private Integer threshold;

    @Min(value = 0, message = "Current count cannot be negative")
    @Column(name = "current_count", nullable = false)
    private Integer currentCount = 0;

    @Column(name = "generate_qr", nullable = false)
    private Boolean generateQr = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Area() {}

    public Area(Long id, String name, String ownerEmail, Integer capacity, Integer threshold, 
                Integer currentCount, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.ownerEmail = ownerEmail;
        this.capacity = capacity;
        this.threshold = threshold;
        this.currentCount = currentCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Transient
    public String getStatus() {
        if (currentCount >= capacity) {
            return "RED";
        } else if (currentCount >= threshold) {
            return "YELLOW";
        } else {
            return "GREEN";
        }
    }

    @Transient
    public double getOccupancyPercentage() {
        if (capacity == 0) return 0;
        return (double) currentCount / capacity * 100;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public Integer getThreshold() { return threshold; }
    public void setThreshold(Integer threshold) { this.threshold = threshold; }
    public Integer getCurrentCount() { return currentCount; }
    public void setCurrentCount(Integer currentCount) { this.currentCount = currentCount; }
    public Boolean getGenerateQr() { return generateQr; }
    public void setGenerateQr(Boolean generateQr) { this.generateQr = generateQr; }
    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
    public Long getEventId() { return event != null ? event.getId() : null; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
