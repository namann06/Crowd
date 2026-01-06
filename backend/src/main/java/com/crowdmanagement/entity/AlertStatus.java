package com.crowdmanagement.entity;

/**
 * Alert Status Enum
 * -----------------
 * Defines the status of an alert.
 */
public enum AlertStatus {
    UNREAD,     // Alert is new and unread
    READ,       // Alert has been viewed
    RESOLVED    // Alert has been resolved/acknowledged
}
