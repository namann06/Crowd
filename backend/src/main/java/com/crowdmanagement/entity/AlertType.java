package com.crowdmanagement.entity;

/**
 * Alert Type Enum
 * ----------------
 * Defines the types of alerts that can be generated.
 */
public enum AlertType {
    OVERCROWDING,       // Critical - Area is at or over capacity
    THRESHOLD_BREACH,   // Warning - Area has exceeded threshold but below capacity
    RAPID_INFLOW        // Critical - Sudden surge in entries detected
}
