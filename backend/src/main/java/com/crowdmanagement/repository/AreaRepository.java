package com.crowdmanagement.repository;

import com.crowdmanagement.entity.Area;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Area Repository
 * ---------------
 * Provides database operations for Area entity.
 * Includes custom queries for crowd management operations.
 */
@Repository
public interface AreaRepository extends JpaRepository<Area, Long> {

    /**
     * Find an area by its name
     * 
     * @param name The area name
     * @return Optional containing the area if found
     */
    Optional<Area> findByName(String name);

    /**
     * Check if an area exists with the given name
     * 
     * @param name The area name to check
     * @return true if exists, false otherwise
     */
    boolean existsByName(String name);

    /**
     * Find all areas ordered by name
     * 
     * @return List of areas sorted by name
     */
    List<Area> findAllByOrderByNameAsc();

    /**
     * Find areas where current count is at or above threshold (WARNING or CRITICAL)
     * 
     * @return List of areas that need attention
     */
    @Query("SELECT a FROM Area a WHERE a.currentCount >= a.threshold")
    List<Area> findAreasNeedingAttention();

    /**
     * Find areas that are at full capacity
     * 
     * @return List of areas at capacity
     */
    @Query("SELECT a FROM Area a WHERE a.currentCount >= a.capacity")
    List<Area> findAreasAtCapacity();

    /**
     * Increment the current count for an area (for entry scan)
     * Uses native query for atomic operation
     * 
     * @param areaId The ID of the area
     * @return Number of rows updated
     */
    @Modifying
    @Query("UPDATE Area a SET a.currentCount = a.currentCount + 1, a.updatedAt = CURRENT_TIMESTAMP WHERE a.id = :areaId")
    int incrementCount(@Param("areaId") Long areaId);

    /**
     * Decrement the current count for an area (for exit scan)
     * Ensures count doesn't go below 0
     * 
     * @param areaId The ID of the area
     * @return Number of rows updated
     */
    @Modifying
    @Query("UPDATE Area a SET a.currentCount = CASE WHEN a.currentCount > 0 THEN a.currentCount - 1 ELSE 0 END, a.updatedAt = CURRENT_TIMESTAMP WHERE a.id = :areaId")
    int decrementCount(@Param("areaId") Long areaId);

    /**
     * Reset the current count for an area to zero
     * Useful for daily reset or manual correction
     * 
     * @param areaId The ID of the area
     * @return Number of rows updated
     */
    @Modifying
    @Query("UPDATE Area a SET a.currentCount = 0, a.updatedAt = CURRENT_TIMESTAMP WHERE a.id = :areaId")
    int resetCount(@Param("areaId") Long areaId);

    /**
     * Reset all areas to zero count
     * Useful for daily reset
     * 
     * @return Number of rows updated
     */
    @Modifying
    @Query("UPDATE Area a SET a.currentCount = 0, a.updatedAt = CURRENT_TIMESTAMP")
    int resetAllCounts();
}
