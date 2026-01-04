package com.crowdmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Event Entity
 * ------------
 * Represents an event that contains multiple areas.
 * Events have a start/end date and can be live, upcoming, or completed.
 */
@Entity
@Table(name = "events", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"name", "owner_email"})
})
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Event name is required")
    @Size(min = 2, max = 200, message = "Event name must be between 2 and 200 characters")
    @Column(nullable = false, length = 200)
    private String name;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    @Column(length = 1000)
    private String description;

    @Size(max = 300, message = "Venue cannot exceed 300 characters")
    @Column(length = 300)
    private String venue;

    @NotNull(message = "Event date and time is required")
    @Column(name = "event_date_time", nullable = false)
    private LocalDateTime eventDateTime;

    @Column(name = "end_date_time")
    private LocalDateTime endDateTime;

    @NotBlank(message = "Owner email is required")
    @Column(name = "owner_email", nullable = false, length = 100)
    private String ownerEmail;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Area> areas = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Event() {}

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Get event status based on current time
     * UPCOMING - event hasn't started yet
     * LIVE - event is currently active
     * COMPLETED - event has ended
     */
    @Transient
    public String getStatus() {
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(eventDateTime)) {
            return "UPCOMING";
        } else if (endDateTime != null && now.isAfter(endDateTime)) {
            return "COMPLETED";
        } else if (endDateTime == null && now.isAfter(eventDateTime.plusHours(24))) {
            // Default: event lasts 24 hours if no end time specified
            return "COMPLETED";
        }
        return "LIVE";
    }

    /**
     * Get total capacity across all areas
     */
    @Transient
    public Integer getTotalCapacity() {
        return areas.stream()
                .mapToInt(Area::getCapacity)
                .sum();
    }

    /**
     * Get total current count across all areas
     */
    @Transient
    public Integer getTotalCurrentCount() {
        return areas.stream()
                .mapToInt(Area::getCurrentCount)
                .sum();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public LocalDateTime getEventDateTime() {
        return eventDateTime;
    }

    public void setEventDateTime(LocalDateTime eventDateTime) {
        this.eventDateTime = eventDateTime;
    }

    public LocalDateTime getEndDateTime() {
        return endDateTime;
    }

    public void setEndDateTime(LocalDateTime endDateTime) {
        this.endDateTime = endDateTime;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public List<Area> getAreas() {
        return areas;
    }

    public void setAreas(List<Area> areas) {
        this.areas = areas;
    }

    public void addArea(Area area) {
        areas.add(area);
        area.setEvent(this);
    }

    public void removeArea(Area area) {
        areas.remove(area);
        area.setEvent(null);
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
