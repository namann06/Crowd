package com.crowdmanagement.service;

import com.crowdmanagement.dto.AreaResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * WebSocket Service
 * -----------------
 * Broadcasts real-time updates to connected clients.
 */
@Service
public class WebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcast area update to all subscribed clients
     * @param area Updated area data
     */
    public void broadcastAreaUpdate(AreaResponse area) {
        messagingTemplate.convertAndSend("/topic/area/" + area.getId(), area);
        messagingTemplate.convertAndSend("/topic/areas", area);
    }

    /**
     * Broadcast all areas update (for dashboard refresh)
     * @param areas List of all areas
     */
    public void broadcastAllAreas(List<AreaResponse> areas) {
        messagingTemplate.convertAndSend("/topic/areas/all", areas);
    }

    /**
     * Broadcast scan event
     * @param areaId Area that was scanned
     * @param scanType ENTRY or EXIT
     * @param newCount Updated count
     */
    public void broadcastScanEvent(Long areaId, String scanType, Integer newCount) {
        var event = new ScanEvent(areaId, scanType, newCount);
        messagingTemplate.convertAndSend("/topic/scans", event);
    }

    /**
     * Simple scan event record for broadcasting
     */
    public record ScanEvent(Long areaId, String scanType, Integer newCount) {}
}
