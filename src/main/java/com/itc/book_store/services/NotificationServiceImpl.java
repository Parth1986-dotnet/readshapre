package com.itc.book_store.services;

import com.itc.book_store.entity.Order;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Sinks;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final Sinks.Many<String> orderSink;

    public NotificationServiceImpl() {
        // Multicast sink with backpressure buffer for real-time notifications
        this.orderSink = Sinks.many().multicast().onBackpressureBuffer();
    }

    @Override
    public void notifyAdminNewOrder(Order order) {
        String message = "📦 New order from " + order.getUser().getEmail()
                + " (Order #" + order.getId() + ")";
        orderSink.tryEmitNext(message);
    }

    @Override
    public void notifyUserOrderStatusChange(Order order) {
        String message = "🔔 Your order #" + order.getId()
                + " status changed to " + order.getStatus();
        orderSink.tryEmitNext(message);
    }

    public Sinks.Many<String> getOrderSink() {
        return orderSink;
    }
}
