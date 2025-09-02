package com.itc.book_store.services.kafka;

import com.itc.book_store.dto.kafka.OrderEvent;
import com.itc.book_store.entity.Order;
import com.itc.book_store.repository.OrderRepository;
import com.itc.book_store.services.NotificationServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderStatusKafkaListener {

    private final NotificationServiceImpl notificationService;
    private final OrderRepository orderRepository;

    @KafkaListener(topics = "${app.kafka.topic.order-status}", groupId = "order-status-group")
    public void listenOrderStatusUpdate(OrderEvent event) {
        log.info("Received order status update for orderId={} user={}", event.getOrderId(), event.getUserEmail());

        // Retrieve full Order entity from DB
        Order order = orderRepository.findById(event.getOrderId()).orElse(null);
        if (order != null) {
            notificationService.notifyUserOrderStatusChange(order);
        }
    }
}
