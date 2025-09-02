package com.itc.book_store.services.kafka;

import com.itc.book_store.dto.kafka.OrderEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderConsumer.class);
    private final SimpMessagingTemplate messagingTemplate;

    public OrderConsumer(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @KafkaListener(
            topics = "${app.kafka.topic.orders}",
            groupId = "order-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consume(OrderEvent event) {
        if (event == null) {
            log.warn("⏭ Skipping null or deserialization-failed event");
            return;
        }

        log.info("📩 Received order event: {}", event);

        try {
            // Send to user-specific WebSocket
            messagingTemplate.convertAndSend("/topic/orders/" + event.getUserEmail(), event);

            // Broadcast to admin
            messagingTemplate.convertAndSend("/topic/orders", event);

        } catch (Exception e) {
            log.error("❌ Error sending WebSocket message for order {}: {}", event.getOrderId(), e.getMessage(), e);
        }
    }
}
