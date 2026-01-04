package com.crowdmanagement.repository;

import com.crowdmanagement.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Event Repository
 * ----------------
 * Data access layer for Event entity.
 */
@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    /**
     * Find all events for a specific owner, ordered by event date
     */
    List<Event> findByOwnerEmailOrderByEventDateTimeDesc(String ownerEmail);

    /**
     * Find event by ID and owner
     */
    Optional<Event> findByIdAndOwnerEmail(Long id, String ownerEmail);

    /**
     * Check if event name exists for owner
     */
    boolean existsByNameAndOwnerEmail(String name, String ownerEmail);

    /**
     * Find live events (current time is between event start and end)
     */
    @Query("SELECT e FROM Event e WHERE e.ownerEmail = :ownerEmail " +
           "AND e.eventDateTime <= :now " +
           "AND (e.endDateTime IS NULL OR e.endDateTime >= :now) " +
           "ORDER BY e.eventDateTime DESC")
    List<Event> findLiveEvents(@Param("ownerEmail") String ownerEmail, @Param("now") LocalDateTime now);

    /**
     * Find upcoming events (event hasn't started yet)
     */
    @Query("SELECT e FROM Event e WHERE e.ownerEmail = :ownerEmail " +
           "AND e.eventDateTime > :now " +
           "ORDER BY e.eventDateTime ASC")
    List<Event> findUpcomingEvents(@Param("ownerEmail") String ownerEmail, @Param("now") LocalDateTime now);

    /**
     * Find completed events (event has ended)
     */
    @Query("SELECT e FROM Event e WHERE e.ownerEmail = :ownerEmail " +
           "AND ((e.endDateTime IS NOT NULL AND e.endDateTime < :now) " +
           "OR (e.endDateTime IS NULL AND e.eventDateTime < :dayAgo)) " +
           "ORDER BY e.eventDateTime DESC")
    List<Event> findCompletedEvents(@Param("ownerEmail") String ownerEmail, 
                                     @Param("now") LocalDateTime now,
                                     @Param("dayAgo") LocalDateTime dayAgo);
}
