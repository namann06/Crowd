package com.crowdmanagement.dto;

import com.crowdmanagement.entity.ScanLog;
import com.crowdmanagement.entity.ScanType;

import java.time.LocalDateTime;

/**
 * Scan Response DTO
 * -----------------
 * Returned after a scan is registered.
 */
public class ScanResponse {
    private Long id;
    private Long areaId;
    private String areaName;
    private ScanType scanType;
    private LocalDateTime timestamp;
    private Integer newCount;

    public ScanResponse() {}

    public ScanResponse(Long id, Long areaId, String areaName, ScanType scanType, 
                       LocalDateTime timestamp, Integer newCount) {
        this.id = id;
        this.areaId = areaId;
        this.areaName = areaName;
        this.scanType = scanType;
        this.timestamp = timestamp;
        this.newCount = newCount;
    }

    public static ScanResponse fromEntity(ScanLog scanLog, Integer newCount) {
        ScanResponse response = new ScanResponse();
        response.setId(scanLog.getId());
        response.setAreaId(scanLog.getArea().getId());
        response.setAreaName(scanLog.getArea().getName());
        response.setScanType(scanLog.getScanType());
        response.setTimestamp(scanLog.getTimestamp());
        response.setNewCount(newCount);
        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAreaId() { return areaId; }
    public void setAreaId(Long areaId) { this.areaId = areaId; }
    public String getAreaName() { return areaName; }
    public void setAreaName(String areaName) { this.areaName = areaName; }
    public ScanType getScanType() { return scanType; }
    public void setScanType(ScanType scanType) { this.scanType = scanType; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public Integer getNewCount() { return newCount; }
    public void setNewCount(Integer newCount) { this.newCount = newCount; }
}
