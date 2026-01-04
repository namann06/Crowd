package com.crowdmanagement.dto;

import com.crowdmanagement.entity.Event;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Event Response DTO
 * ------------------
 * Returns event details with nested areas.
 */
public class EventResponse {

    private Long id;
    private String name;
    private String description;
    private String venue;
    private LocalDateTime eventDateTime;
    private LocalDateTime endDateTime;
    private String status; // UPCOMING, LIVE, COMPLETED
    private Integer totalAreas;
    private Integer totalCapacity;
    private Integer totalCurrentCount;
    private Double occupancyPercentage;
    private List<AreaResponse> areas;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public EventResponse() {}

    public static EventResponse fromEntity(Event event) {
        EventResponse response = new EventResponse();
        response.setId(event.getId());
        response.setName(event.getName());
        response.setDescription(event.getDescription());
        response.setVenue(event.getVenue());
        response.setEventDateTime(event.getEventDateTime());
        response.setEndDateTime(event.getEndDateTime());
        response.setStatus(event.getStatus());
        response.setTotalAreas(event.getAreas().size());
        response.setTotalCapacity(event.getTotalCapacity());
        response.setTotalCurrentCount(event.getTotalCurrentCount());
        
        // Calculate occupancy percentage
        int capacity = event.getTotalCapacity();
        int current = event.getTotalCurrentCount();
        response.setOccupancyPercentage(capacity > 0 ? (double) current / capacity * 100 : 0);
        
        // Convert areas to response DTOs
        response.setAreas(event.getAreas().stream()
                .map(AreaResponse::fromEntity)
                .collect(Collectors.toList()));
        
        response.setCreatedAt(event.getCreatedAt());
        response.setUpdatedAt(event.getUpdatedAt());
        
        return response;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public LocalDateTime getEventDateTime() { return eventDateTime; }
    public void setEventDateTime(LocalDateTime eventDateTime) { this.eventDateTime = eventDateTime; }
    public LocalDateTime getEndDateTime() { return endDateTime; }
    public void setEndDateTime(LocalDateTime endDateTime) { this.endDateTime = endDateTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getTotalAreas() { return totalAreas; }
    public void setTotalAreas(Integer totalAreas) { this.totalAreas = totalAreas; }
    public Integer getTotalCapacity() { return totalCapacity; }
    public void setTotalCapacity(Integer totalCapacity) { this.totalCapacity = totalCapacity; }
    public Integer getTotalCurrentCount() { return totalCurrentCount; }
    public void setTotalCurrentCount(Integer totalCurrentCount) { this.totalCurrentCount = totalCurrentCount; }
    public Double getOccupancyPercentage() { return occupancyPercentage; }
    public void setOccupancyPercentage(Double occupancyPercentage) { this.occupancyPercentage = occupancyPercentage; }
    public List<AreaResponse> getAreas() { return areas; }
    public void setAreas(List<AreaResponse> areas) { this.areas = areas; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
