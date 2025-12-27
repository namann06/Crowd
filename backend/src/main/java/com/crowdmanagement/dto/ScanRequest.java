package com.crowdmanagement.dto;

import com.crowdmanagement.entity.ScanType;

/**
 * Scan Request DTO
 * ----------------
 * Used when registering a new scan.
 */
public class ScanRequest {
    private Long areaId;
    private ScanType scanType;

    public ScanRequest() {}

    public ScanRequest(Long areaId, ScanType scanType) {
        this.areaId = areaId;
        this.scanType = scanType;
    }

    public Long getAreaId() { return areaId; }
    public void setAreaId(Long areaId) { this.areaId = areaId; }
    public ScanType getScanType() { return scanType; }
    public void setScanType(ScanType scanType) { this.scanType = scanType; }
}
