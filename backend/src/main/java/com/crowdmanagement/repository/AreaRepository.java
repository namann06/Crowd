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
 * Multi-tenant: Most queries filter by owner email.
 */
@Repository
public interface AreaRepository extends JpaRepository<Area, Long> {

    /**
     * Find all areas for a specific owner, ordered by name
     */
    List<Area> findByOwnerEmailOrderByNameAsc(String ownerEmail);

    /**
     * Find an area by its name and owner
     */
    Optional<Area> findByNameAndOwnerEmail(String name, String ownerEmail);

    /**
     * Check if an area exists with the given name for a specific owner
     */
    boolean existsByNameAndOwnerEmail(String name, String ownerEmail);

    /**
     * Find area by ID and owner (for security - ensures user can only access their own areas)
     */
    Optional<Area> findByIdAndOwnerEmail(Long id, String ownerEmail);

    /**
     * Find an area by its name (legacy - for QR scanning which doesn't require auth)
     */
    Optional<Area> findByName(String name);

    /**
     * Check if an area exists with the given name (legacy)
     */
    boolean existsByName(String name);

    /**
     * Find all areas ordered by name (legacy - for admin purposes)
     */
    List<Area> findAllByOrderByNameAsc();

    /**
     * Find areas where current count is at or above threshold for a specific owner
     */
    @Query("SELECT a FROM Area a WHERE a.ownerEmail = :ownerEmail AND a.currentCount >= a.threshold")
    List<Area> findAreasNeedingAttentionByOwner(@Param("ownerEmail") String ownerEmail);

    /**
     * Find areas that are at full capacity for a specific owner
     */
    @Query("SELECT a FROM Area a WHERE a.ownerEmail = :ownerEmail AND a.currentCount >= a.capacity")
    List<Area> findAreasAtCapacityByOwner(@Param("ownerEmail") String ownerEmail);

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
