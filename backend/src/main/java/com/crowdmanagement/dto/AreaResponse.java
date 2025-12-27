package com.crowdmanagement.dto;

import com.crowdmanagement.entity.Area;

/**
 * Area Response DTO
 * -----------------
 * Returned when fetching area data.
 * Includes calculated status field.
 */
public class AreaResponse {
    private Long id;
    private String name;
    private Integer capacity;
    private Integer threshold;
    private Integer currentCount;
    private String status;
    private Double occupancyPercentage;

    public AreaResponse() {}

    public AreaResponse(Long id, String name, Integer capacity, Integer threshold, 
                       Integer currentCount, String status, Double occupancyPercentage) {
        this.id = id;
        this.name = name;
        this.capacity = capacity;
        this.threshold = threshold;
        this.currentCount = currentCount;
        this.status = status;
        this.occupancyPercentage = occupancyPercentage;
    }

    public static AreaResponse fromEntity(Area area) {
        AreaResponse response = new AreaResponse();
        response.setId(area.getId());
        response.setName(area.getName());
        response.setCapacity(area.getCapacity());
        response.setThreshold(area.getThreshold());
        response.setCurrentCount(area.getCurrentCount());
        response.setStatus(area.getStatus());
        response.setOccupancyPercentage(area.getOccupancyPercentage());
        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public Integer getThreshold() { return threshold; }
    public void setThreshold(Integer threshold) { this.threshold = threshold; }
    public Integer getCurrentCount() { return currentCount; }
    public void setCurrentCount(Integer currentCount) { this.currentCount = currentCount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getOccupancyPercentage() { return occupancyPercentage; }
    public void setOccupancyPercentage(Double occupancyPercentage) { this.occupancyPercentage = occupancyPercentage; }
}
