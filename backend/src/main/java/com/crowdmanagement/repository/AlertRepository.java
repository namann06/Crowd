package com.crowdmanagement.repository;

import com.crowdmanagement.entity.Alert;
import com.crowdmanagement.entity.AlertStatus;
import com.crowdmanagement.entity.AlertType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Alert Repository
 * ----------------
 * Data access for Alert entities.
 */
@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    /**
     * Find all alerts for an owner, ordered by creation time
     */
    List<Alert> findByOwnerEmailOrderByCreatedAtDesc(String ownerEmail);

    /**
     * Find alerts by owner and status
     */
    List<Alert> findByOwnerEmailAndStatusOrderByCreatedAtDesc(String ownerEmail, AlertStatus status);

    /**
     * Find alerts by owner and alert type
     */
    List<Alert> findByOwnerEmailAndAlertTypeOrderByCreatedAtDesc(String ownerEmail, AlertType alertType);

    /**
     * Find alerts by area
     */
    List<Alert> findByArea_IdOrderByCreatedAtDesc(Long areaId);

    /**
     * Find unresolved alerts for an area (to check for duplicates)
     */
    @Query("SELECT a FROM Alert a WHERE a.area.id = :areaId AND a.alertType = :alertType AND a.status <> com.crowdmanagement.entity.AlertStatus.RESOLVED")
    List<Alert> findUnresolvedByAreaAndType(@Param("areaId") Long areaId, @Param("alertType") AlertType alertType);

    /**
     * Find alerts within a date range for an owner
     */
    @Query("SELECT a FROM Alert a WHERE a.ownerEmail = :ownerEmail AND a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    List<Alert> findByOwnerEmailAndDateRange(
            @Param("ownerEmail") String ownerEmail,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Count unread alerts for an owner
     */
    long countByOwnerEmailAndStatus(String ownerEmail, AlertStatus status);

    /**
     * Find active (unresolved) alerts for an owner
     */
    @Query("SELECT a FROM Alert a WHERE a.ownerEmail = :ownerEmail AND a.status <> com.crowdmanagement.entity.AlertStatus.RESOLVED ORDER BY a.createdAt DESC")
    List<Alert> findActiveAlertsByOwner(@Param("ownerEmail") String ownerEmail);

    /**
     * Find recent alerts (last N)
     */
    List<Alert> findTop10ByOwnerEmailOrderByCreatedAtDesc(String ownerEmail);

    /**
     * Auto-resolve old alerts that are no longer valid
     * (When area count drops below threshold, related threshold alerts can be resolved)
     */
    @Query("SELECT a FROM Alert a WHERE a.area.id = :areaId AND a.status <> com.crowdmanagement.entity.AlertStatus.RESOLVED AND a.alertType = :alertType")
    List<Alert> findAlertsToAutoResolve(@Param("areaId") Long areaId, @Param("alertType") AlertType alertType);
}
