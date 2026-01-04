package com.crowdmanagement.service;

import com.crowdmanagement.dto.EventRequest;
import com.crowdmanagement.dto.EventResponse;
import com.crowdmanagement.entity.Area;
import com.crowdmanagement.entity.Event;
import com.crowdmanagement.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Event Service
 * -------------
 * Business logic for event management.
 * Multi-tenant: All operations are scoped to the owner's email.
 */
@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    /**
     * Get all events for a specific owner
     */
    public List<EventResponse> getAllEvents(String ownerEmail) {
        return eventRepository.findByOwnerEmailOrderByEventDateTimeDesc(ownerEmail)
                .stream()
                .map(EventResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get live events (currently active)
     */
    public List<EventResponse> getLiveEvents(String ownerEmail) {
        LocalDateTime now = LocalDateTime.now();
        return eventRepository.findLiveEvents(ownerEmail, now)
                .stream()
                .map(EventResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get upcoming events (not started yet)
     */
    public List<EventResponse> getUpcomingEvents(String ownerEmail) {
        LocalDateTime now = LocalDateTime.now();
        return eventRepository.findUpcomingEvents(ownerEmail, now)
                .stream()
                .map(EventResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get completed events (ended)
     */
    public List<EventResponse> getCompletedEvents(String ownerEmail) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dayAgo = now.minusHours(24);
        return eventRepository.findCompletedEvents(ownerEmail, now, dayAgo)
                .stream()
                .map(EventResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get event by ID
     */
    public EventResponse getEventById(Long id, String ownerEmail) {
        Event event = eventRepository.findByIdAndOwnerEmail(id, ownerEmail)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        return EventResponse.fromEntity(event);
    }

    /**
     * Get event by ID (public access for scanning)
     */
    public EventResponse getEventByIdPublic(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        return EventResponse.fromEntity(event);
    }

    /**
     * Create a new event with areas
     */
    @Transactional
    public EventResponse createEvent(EventRequest request, String ownerEmail) {
        // Check if event name already exists for this owner
        if (eventRepository.existsByNameAndOwnerEmail(request.getName(), ownerEmail)) {
            throw new RuntimeException("Event with name '" + request.getName() + "' already exists");
        }

        // Validate end date if provided
        if (request.getEndDateTime() != null && request.getEndDateTime().isBefore(request.getEventDateTime())) {
            throw new RuntimeException("End date/time cannot be before start date/time");
        }

        // Create event
        Event event = new Event();
        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setVenue(request.getVenue());
        event.setEventDateTime(request.getEventDateTime());
        event.setEndDateTime(request.getEndDateTime());
        event.setOwnerEmail(ownerEmail);

        // Add areas
        if (request.getAreas() != null) {
            for (EventRequest.AreaInput areaInput : request.getAreas()) {
                // Validate threshold <= capacity
                if (areaInput.getThreshold() > areaInput.getCapacity()) {
                    throw new RuntimeException("Threshold cannot exceed capacity for area: " + areaInput.getName());
                }

                Area area = new Area();
                area.setName(areaInput.getName());
                area.setCapacity(areaInput.getCapacity());
                area.setThreshold(areaInput.getThreshold());
                area.setGenerateQr(areaInput.getGenerateQr() != null ? areaInput.getGenerateQr() : true);
                area.setOwnerEmail(ownerEmail);
                area.setCurrentCount(0);
                event.addArea(area);
            }
        }

        Event saved = eventRepository.save(event);
        return EventResponse.fromEntity(saved);
    }

    /**
     * Update an existing event
     */
    @Transactional
    public EventResponse updateEvent(Long id, EventRequest request, String ownerEmail) {
        Event event = eventRepository.findByIdAndOwnerEmail(id, ownerEmail)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));

        // Check if new name conflicts with existing event
        if (!event.getName().equals(request.getName()) && 
            eventRepository.existsByNameAndOwnerEmail(request.getName(), ownerEmail)) {
            throw new RuntimeException("Event with name '" + request.getName() + "' already exists");
        }

        // Validate end date if provided
        if (request.getEndDateTime() != null && request.getEndDateTime().isBefore(request.getEventDateTime())) {
            throw new RuntimeException("End date/time cannot be before start date/time");
        }

        // Update event fields
        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setVenue(request.getVenue());
        event.setEventDateTime(request.getEventDateTime());
        event.setEndDateTime(request.getEndDateTime());

        // Update areas - clear and re-add (simple approach)
        // Note: This will reset currentCount for existing areas
        event.getAreas().clear();
        
        if (request.getAreas() != null) {
            for (EventRequest.AreaInput areaInput : request.getAreas()) {
                if (areaInput.getThreshold() > areaInput.getCapacity()) {
                    throw new RuntimeException("Threshold cannot exceed capacity for area: " + areaInput.getName());
                }

                Area area = new Area();
                area.setName(areaInput.getName());
                area.setCapacity(areaInput.getCapacity());
                area.setThreshold(areaInput.getThreshold());
                area.setGenerateQr(areaInput.getGenerateQr() != null ? areaInput.getGenerateQr() : true);
                area.setOwnerEmail(ownerEmail);
                area.setCurrentCount(0);
                event.addArea(area);
            }
        }

        Event saved = eventRepository.save(event);
        return EventResponse.fromEntity(saved);
    }

    /**
     * Delete an event
     */
    @Transactional
    public void deleteEvent(Long id, String ownerEmail) {
        Event event = eventRepository.findByIdAndOwnerEmail(id, ownerEmail)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        eventRepository.delete(event);
    }

    /**
     * Get event entity by ID (for internal use)
     */
    public Event getEventEntityById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
    }
}
