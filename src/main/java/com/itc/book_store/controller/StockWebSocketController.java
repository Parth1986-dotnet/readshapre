package com.itc.book_store.controller;

import com.itc.book_store.dto.kafka.StockEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class StockWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    // Broadcast to all connected dashboards
    public void broadcastStockUpdate(StockEvent event) {
        messagingTemplate.convertAndSend("/topic/stock-updates", event);
    }
}
