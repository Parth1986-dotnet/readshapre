package com.itc.book_store.controller;

import com.itc.book_store.dto.kafka.OrderEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class OrderWebSocketController {

    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;

    public OrderWebSocketController(KafkaTemplate<String, OrderEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    // Client → /app/orders
    @MessageMapping("/orders")
    public void handleOrder(OrderEvent orderEvent) {
        System.out.println("📤 WebSocket received new order: " + orderEvent);

        // Send into Kafka topic
        kafkaTemplate.send("om_kafka_order", orderEvent);
    }
}
