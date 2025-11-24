package com.itc.book_store.services.kafka;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.kafka.core.KafkaTemplate;
import com.itc.book_store.dto.kafka.StockEvent;   // ✅ Add this
import com.itc.book_store.entity.Book;
import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class StockEventProducer {

    private final KafkaTemplate<String, StockEvent> kafkaTemplate;

    public void sendStockEvent(Book book) {
        StockEvent event = new StockEvent(
                book.getId(),
                book.getTitle(),
                book.getStock(),
                LocalDateTime.now()
        );

        kafkaTemplate.send("stock-updates", event);
    }
}

