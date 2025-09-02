package com.itc.book_store.services.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itc.book_store.dto.kafka.OrderEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderEventBridge {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public OrderEventBridge(SimpMessagingTemplate messagingTemplate, ObjectMapper objectMapper) {
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Listen for user-specific order events
     */
    @KafkaListener(topics = "om_kafka_order", groupId = "order-group")
    public void consumeUserOrder(OrderEvent event) {
        try {
            System.out.println("📩 Received user order event: " + event);

            // Send only to that user's channel
            messagingTemplate.convertAndSend("/topic/orders/" + event.getUserId(), event);

        } catch (Exception e) {
            System.err.println("❌ Failed to process user order event: " + e.getMessage());
        }
    }

    /**
     * Listen for global order events
     */
    @KafkaListener(topics = "order-events", groupId = "bookstore-group")
    public void consumeGlobalOrder(String message) {
        try {
            OrderEvent event = objectMapper.readValue(message, OrderEvent.class);
            System.out.println("📩 Received global order event: " + event);

            // Broadcast to everyone
            messagingTemplate.convertAndSend("/topic/orders", event);

        } catch (Exception e) {
            System.err.println("❌ Failed to process global order event: " + e.getMessage());
        }
    }
}
