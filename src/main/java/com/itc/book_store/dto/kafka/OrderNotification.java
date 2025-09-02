package com.itc.book_store.dto.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class OrderNotification {
    private Long orderId;
    private String message;
    private String status; // e.g., "PLACED", "DELIVERED"
}
