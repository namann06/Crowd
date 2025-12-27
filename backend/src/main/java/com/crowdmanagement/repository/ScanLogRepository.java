package com.crowdmanagement.repository;

import com.crowdmanagement.entity.ScanLog;
import com.crowdmanagement.entity.ScanType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ScanLog Repository
 * ------------------
 * Provides database operations for ScanLog entity.
 * Includes custom queries for analytics and reporting.
 */
@Repository
public interface ScanLogRepository extends JpaRepository<ScanLog, Long> {

    /**
     * Find all scan logs for a specific area
     * 
     * @param areaId The ID of the area
     * @return List of scan logs for the area
     */
    List<ScanLog> findByAreaIdOrderByTimestampDesc(Long areaId);

    /**
     * Find scan logs for an area within a time range
     * 
     * @param areaId The ID of the area
     * @param startTime Start of the time range
     * @param endTime End of the time range
     * @return List of scan logs within the time range
     */
    @Query("SELECT s FROM ScanLog s WHERE s.area.id = :areaId AND s.timestamp BETWEEN :startTime AND :endTime ORDER BY s.timestamp DESC")
    List<ScanLog> findByAreaAndTimeRange(
            @Param("areaId") Long areaId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /**
     * Find all scan logs within a time range (for all areas)
     * 
     * @param startTime Start of the time range
     * @param endTime End of the time range
     * @return List of scan logs within the time range
     */
    List<ScanLog> findByTimestampBetweenOrderByTimestampDesc(
            LocalDateTime startTime,
            LocalDateTime endTime
    );

    /**
     * Count scans by type for an area within a time range
     * 
     * @param areaId The ID of the area
     * @param scanType ENTRY or EXIT
     * @param startTime Start of the time range
     * @param endTime End of the time range
     * @return Count of scans
     */
    @Query("SELECT COUNT(s) FROM ScanLog s WHERE s.area.id = :areaId AND s.scanType = :scanType AND s.timestamp BETWEEN :startTime AND :endTime")
    Long countByAreaAndTypeAndTimeRange(
            @Param("areaId") Long areaId,
            @Param("scanType") ScanType scanType,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /**
     * Get hourly scan counts for an area on a specific date
     * Returns hour and count for charting purposes
     * 
     * @param areaId The ID of the area
     * @param startTime Start of the day
     * @param endTime End of the day
     * @return List of Object arrays [hour, entryCount, exitCount]
     */
    @Query("SELECT HOUR(s.timestamp) as hour, " +
           "SUM(CASE WHEN s.scanType = 'ENTRY' THEN 1 ELSE 0 END) as entries, " +
           "SUM(CASE WHEN s.scanType = 'EXIT' THEN 1 ELSE 0 END) as exits " +
           "FROM ScanLog s WHERE s.area.id = :areaId AND s.timestamp BETWEEN :startTime AND :endTime " +
           "GROUP BY HOUR(s.timestamp) ORDER BY hour")
    List<Object[]> getHourlyScanCounts(
            @Param("areaId") Long areaId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /**
     * Get total scans per area for dashboard
     * 
     * @param startTime Start of the time range
     * @param endTime End of the time range
     * @return List of Object arrays [areaId, areaName, totalScans]
     */
    @Query("SELECT s.area.id, s.area.name, COUNT(s) as totalScans " +
           "FROM ScanLog s WHERE s.timestamp BETWEEN :startTime AND :endTime " +
           "GROUP BY s.area.id, s.area.name ORDER BY totalScans DESC")
    List<Object[]> getTotalScansByArea(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /**
     * Get recent scans for live feed display
     * 
     * @param limit Number of recent scans to return
     * @return List of recent scan logs
     */
    @Query("SELECT s FROM ScanLog s ORDER BY s.timestamp DESC LIMIT :limit")
    List<ScanLog> findRecentScans(@Param("limit") int limit);

    /**
     * Delete scan logs older than a specific date
     * Useful for data cleanup
     * 
     * @param beforeDate Delete logs before this date
     * @return Number of deleted records
     */
    Long deleteByTimestampBefore(LocalDateTime beforeDate);
}
