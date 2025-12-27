package com.crowdmanagement.entity;

/**
 * ScanType Enum
 * -------------
 * Represents the type of QR code scan.
 * ENTRY: Person entering the area (increments count)
 * EXIT: Person leaving the area (decrements count)
 */
public enum ScanType {
    ENTRY,  // QR scan at entry point
    EXIT    // QR scan at exit point
}
