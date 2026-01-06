package com.crowdmanagement.service;

import com.crowdmanagement.dto.ScanRequest;
import com.crowdmanagement.dto.ScanResponse;
import com.crowdmanagement.dto.AreaResponse;
import com.crowdmanagement.entity.Area;
import com.crowdmanagement.entity.ScanLog;
import com.crowdmanagement.entity.ScanType;
import com.crowdmanagement.repository.ScanLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Scan Service
 * ------------
 * Handles QR code scan operations and scan log management.
 */
@Service
public class ScanService {

    @Autowired
    private ScanLogRepository scanLogRepository;

    @Autowired
    private AreaService areaService;

    @Autowired
    private WebSocketService webSocketService;

    @Autowired
    private AlertService alertService;

    /**
     * Process a QR code scan (entry or exit)
     * @param request Scan details
     * @return Scan result with updated count
     */
    @Transactional
    public ScanResponse processScan(ScanRequest request) {
        // Get the area
        Area area = areaService.getAreaEntityById(request.getAreaId());

        // Update the count based on scan type
        Integer newCount;
        if (request.getScanType() == ScanType.ENTRY) {
            newCount = areaService.incrementCount(request.getAreaId());
        } else {
            newCount = areaService.decrementCount(request.getAreaId());
        }

        // Create scan log
        ScanLog scanLog = new ScanLog(area, request.getScanType());
        scanLog = scanLogRepository.save(scanLog);

        // Refresh area entity to get updated count
        area = areaService.getAreaEntityById(request.getAreaId());

        // Check and generate alerts if thresholds are breached
        alertService.checkAndGenerateAlert(area, request.getScanType());

        // Broadcast real-time update via WebSocket
        AreaResponse updatedArea = areaService.getAreaByIdPublic(request.getAreaId());
        webSocketService.broadcastAreaUpdate(updatedArea);
        webSocketService.broadcastScanEvent(request.getAreaId(), request.getScanType().name(), newCount);

        return ScanResponse.fromEntity(scanLog, newCount);
    }

    /**
     * Get recent scan logs
     * @param limit Number of logs to return
     * @return List of recent scans
     */
    public List<ScanResponse> getRecentScans(int limit) {
        return scanLogRepository.findRecentScans(limit)
                .stream()
                .map(log -> ScanResponse.fromEntity(log, log.getArea().getCurrentCount()))
                .collect(Collectors.toList());
    }

    /**
     * Get scans for a specific area
     * @param areaId Area ID
     * @return List of scans for the area
     */
    public List<ScanResponse> getScansByArea(Long areaId) {
        return scanLogRepository.findByAreaIdOrderByTimestampDesc(areaId)
                .stream()
                .map(log -> ScanResponse.fromEntity(log, log.getArea().getCurrentCount()))
                .collect(Collectors.toList());
    }

    /**
     * Get today's scans
     * @return List of today's scans
     */
    public List<ScanResponse> getTodayScans() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        return scanLogRepository.findByTimestampBetweenOrderByTimestampDesc(startOfDay, endOfDay)
                .stream()
                .map(log -> ScanResponse.fromEntity(log, log.getArea().getCurrentCount()))
                .collect(Collectors.toList());
    }

    /**
     * Get hourly trend data for an area
     * @param areaId Area ID
     * @return Hourly scan counts
     */
    public List<HourlyTrendData> getHourlyTrend(Long areaId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        List<Object[]> rawData = scanLogRepository.getHourlyScanCounts(areaId, startOfDay, endOfDay);
        
        List<HourlyTrendData> result = new ArrayList<>();
        for (Object[] row : rawData) {
            Integer hour = (Integer) row[0];
            Long entries = (Long) row[1];
            Long exits = (Long) row[2];
            result.add(new HourlyTrendData(
                    hour + ":00",
                    entries.intValue(),
                    exits.intValue(),
                    entries.intValue() - exits.intValue()
            ));
        }
        return result;
    }

    /**
     * Inner class for hourly trend data
     */
    public static class HourlyTrendData {
        public String hour;
        public Integer entries;
        public Integer exits;
        public Integer count;

        public HourlyTrendData(String hour, Integer entries, Integer exits, Integer count) {
            this.hour = hour;
            this.entries = entries;
            this.exits = exits;
            this.count = count;
        }
    }
}
