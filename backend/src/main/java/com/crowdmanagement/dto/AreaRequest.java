package com.crowdmanagement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

/**
 * Area Request DTO
 * ----------------
 * Used for creating/updating areas.
 */
public class AreaRequest {
    
    @NotBlank(message = "Area name is required")
    private String name;
    
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;
    
    @Min(value = 1, message = "Threshold must be at least 1")
    private Integer threshold;

    public AreaRequest() {}

    public AreaRequest(String name, Integer capacity, Integer threshold) {
        this.name = name;
        this.capacity = capacity;
        this.threshold = threshold;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public Integer getThreshold() { return threshold; }
    public void setThreshold(Integer threshold) { this.threshold = threshold; }
}
