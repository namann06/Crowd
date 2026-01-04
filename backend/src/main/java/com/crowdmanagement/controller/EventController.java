package com.crowdmanagement.controller;

import com.crowdmanagement.dto.EventRequest;
import com.crowdmanagement.dto.EventResponse;
import com.crowdmanagement.service.EventService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Event Controller
 * ----------------
 * REST API endpoints for event management.
 * Multi-tenant: Uses X-User-Email header for owner identification.
 */
@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    /**
     * Get all events for the authenticated user
     */
    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents(
            @RequestHeader("X-User-Email") String ownerEmail) {
        return ResponseEntity.ok(eventService.getAllEvents(ownerEmail));
    }

    /**
     * Get events grouped by status (live, upcoming, completed)
     */
    @GetMapping("/grouped")
    public ResponseEntity<Map<String, List<EventResponse>>> getEventsGrouped(
            @RequestHeader("X-User-Email") String ownerEmail) {
        Map<String, List<EventResponse>> grouped = new HashMap<>();
        grouped.put("live", eventService.getLiveEvents(ownerEmail));
        grouped.put("upcoming", eventService.getUpcomingEvents(ownerEmail));
        grouped.put("completed", eventService.getCompletedEvents(ownerEmail));
        return ResponseEntity.ok(grouped);
    }

    /**
     * Get live events only
     */
    @GetMapping("/live")
    public ResponseEntity<List<EventResponse>> getLiveEvents(
            @RequestHeader("X-User-Email") String ownerEmail) {
        return ResponseEntity.ok(eventService.getLiveEvents(ownerEmail));
    }

    /**
     * Get upcoming events only
     */
    @GetMapping("/upcoming")
    public ResponseEntity<List<EventResponse>> getUpcomingEvents(
            @RequestHeader("X-User-Email") String ownerEmail) {
        return ResponseEntity.ok(eventService.getUpcomingEvents(ownerEmail));
    }

    /**
     * Get completed events only
     */
    @GetMapping("/completed")
    public ResponseEntity<List<EventResponse>> getCompletedEvents(
            @RequestHeader("X-User-Email") String ownerEmail) {
        return ResponseEntity.ok(eventService.getCompletedEvents(ownerEmail));
    }

    /**
     * Get event by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(
            @PathVariable Long id,
            @RequestHeader("X-User-Email") String ownerEmail) {
        return ResponseEntity.ok(eventService.getEventById(id, ownerEmail));
    }

    /**
     * Get event by ID (public - for scanning)
     */
    @GetMapping("/public/{id}")
    public ResponseEntity<EventResponse> getEventByIdPublic(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventByIdPublic(id));
    }

    /**
     * Create a new event
     */
    @PostMapping
    public ResponseEntity<EventResponse> createEvent(
            @Valid @RequestBody EventRequest request,
            @RequestHeader("X-User-Email") String ownerEmail) {
        return ResponseEntity.ok(eventService.createEvent(request, ownerEmail));
    }

    /**
     * Update an existing event
     */
    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequest request,
            @RequestHeader("X-User-Email") String ownerEmail) {
        return ResponseEntity.ok(eventService.updateEvent(id, request, ownerEmail));
    }

    /**
     * Delete an event
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteEvent(
            @PathVariable Long id,
            @RequestHeader("X-User-Email") String ownerEmail) {
        eventService.deleteEvent(id, ownerEmail);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Event deleted successfully");
        return ResponseEntity.ok(response);
    }
}
