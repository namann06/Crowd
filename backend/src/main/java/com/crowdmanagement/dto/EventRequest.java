package com.crowdmanagement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Event Request DTO
 * -----------------
 * Used for creating/updating events with nested areas.
 */
public class EventRequest {

    @NotBlank(message = "Event name is required")
    @Size(min = 2, max = 200, message = "Event name must be between 2 and 200 characters")
    private String name;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @Size(max = 300, message = "Venue cannot exceed 300 characters")
    private String venue;

    @NotNull(message = "Event date and time is required")
    private LocalDateTime eventDateTime;

    private LocalDateTime endDateTime;

    @Valid
    private List<AreaInput> areas = new ArrayList<>();

    // Nested area input class
    public static class AreaInput {
        @NotBlank(message = "Area name is required")
        private String name;

        @NotNull(message = "Capacity is required")
        private Integer capacity;

        @NotNull(message = "Threshold is required")
        private Integer threshold;

        private Boolean generateQr = true;

        public AreaInput() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Integer getCapacity() { return capacity; }
        public void setCapacity(Integer capacity) { this.capacity = capacity; }
        public Integer getThreshold() { return threshold; }
        public void setThreshold(Integer threshold) { this.threshold = threshold; }
        public Boolean getGenerateQr() { return generateQr; }
        public void setGenerateQr(Boolean generateQr) { this.generateQr = generateQr; }
    }

    public EventRequest() {}

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
    public List<AreaInput> getAreas() { return areas; }
    public void setAreas(List<AreaInput> areas) { this.areas = areas; }
}
