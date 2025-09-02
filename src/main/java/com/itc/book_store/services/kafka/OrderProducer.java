package com.itc.book_store.services.kafka;

import com.itc.book_store.dto.kafka.OrderEvent;
import com.itc.book_store.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderProducer {

    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;

    @Value("${app.kafka.topic.orders}")
    private String ordersTopic;

    @Value("${app.kafka.topic.order-status:order_status_updated}")
    private String orderStatusTopic;

    public void sendOrderEvent(Order order) {
        OrderEvent event = OrderEvent.fromOrder(order);
        kafkaTemplate.send(ordersTopic, order.getId().toString(), event);
    }

    public void sendOrderStatusUpdate(Order order) {
        OrderEvent event = OrderEvent.fromOrder(order);
        kafkaTemplate.send(orderStatusTopic, order.getId().toString(), event);
    }

}
