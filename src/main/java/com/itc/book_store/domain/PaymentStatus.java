package com.itc.book_store.domain;

public enum PaymentStatus {
    REQUIRES_PAYMENT_METHOD,
    REQUIRES_CONFIRMATION,
    REQUIRES_ACTION,
    PROCESSING,
    SUCCEEDED,
    CANCELED,
    FAILED,
    REFUNDED
}
