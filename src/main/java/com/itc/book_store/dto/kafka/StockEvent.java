package com.itc.book_store.dto.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockEvent {
    private Long bookId;
    private String title;
    private int stock;
    private LocalDateTime updatedAt;
}
