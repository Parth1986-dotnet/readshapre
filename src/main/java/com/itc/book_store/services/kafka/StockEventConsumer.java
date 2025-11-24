package com.itc.book_store.services.kafka;

import com.itc.book_store.dto.kafka.StockEvent;
import com.itc.book_store.controller.StockWebSocketController;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StockEventConsumer {

    private final StockWebSocketController wsController;

    @KafkaListener(topics = "stock-updates", groupId = "stock-group")
    public void consumeStockEvent(StockEvent event) {
        System.out.println("🔥 Kafka Stock Event Received: " + event);

        // Forward event to all dashboards
        wsController.broadcastStockUpdate(event);
    }
}
