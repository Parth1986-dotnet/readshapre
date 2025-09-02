package com.itc.book_store.dto.kafka;

import com.itc.book_store.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderEvent {
    private Long orderId;
    private Long userId;
    private String userEmail;
    private String status;
    private BigDecimal totalAmount;
    private List<OrderItemEvent> items;

    // ===== Static Converter from Order entity =====
    public static OrderEvent fromOrder(Order order) {
        OrderEvent event = new OrderEvent();
        event.setOrderId(order.getId());
        event.setUserId(order.getUser().getId());
        event.setUserEmail(order.getUser().getEmail()); // ✅ keep email here
        event.setStatus(order.getStatus().toString());
        event.setTotalAmount(order.getTotalAmount());
        event.setItems(
                order.getOrderItems()
                        .stream()
                        .map(OrderItemEvent::fromOrderItem)
                        .collect(Collectors.toList())
        );
        return event;
    }
}
