package com.crowdmanagement.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * ScanLog Entity
 * --------------
 * Records every QR code scan event.
 */
@Entity
@Table(name = "scan_logs")
public class ScanLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id", nullable = false)
    private Area area;

    @Enumerated(EnumType.STRING)
    @Column(name = "scan_type", nullable = false)
    private ScanType scanType;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public ScanLog() {}

    public ScanLog(Long id, Area area, ScanType scanType, LocalDateTime timestamp) {
        this.id = id;
        this.area = area;
        this.scanType = scanType;
        this.timestamp = timestamp;
    }

    public ScanLog(Area area, ScanType scanType) {
        this.area = area;
        this.scanType = scanType;
        this.timestamp = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Area getArea() { return area; }
    public void setArea(Area area) { this.area = area; }
    public ScanType getScanType() { return scanType; }
    public void setScanType(ScanType scanType) { this.scanType = scanType; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
