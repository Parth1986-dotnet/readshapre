package com.itc.book_store.dto;

import com.itc.book_store.entity.Order;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class OrderResponse {

    private Long id;
    private String status;
    private BigDecimal totalAmount;
    private LocalDateTime orderDate;
    private LocalDate estimatedDelivery; // Optional, auto-filled
    private List<OrderItemResponse> items = new ArrayList<>(); // Prevent null
    private String userEmail;

    // Getters and setters (unchanged)

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public LocalDate getEstimatedDelivery() { return estimatedDelivery; }
    public void setEstimatedDelivery(LocalDate estimatedDelivery) { this.estimatedDelivery = estimatedDelivery; }

    public List<OrderItemResponse> getItems() { return items; }
    public void setItems(List<OrderItemResponse> items) { this.items = items; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    // Convert single Order -> OrderResponse safely
    public static OrderResponse fromOrder(Order order) {
        OrderResponse dto = new OrderResponse();
        dto.setId(order.getId());
        dto.setStatus(order.getStatus() != null ? order.getStatus().name() : "UNKNOWN");
        dto.setTotalAmount(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO);
        dto.setOrderDate(order.getOrderDate() != null ? order.getOrderDate() : LocalDateTime.now());

        // Set estimated delivery: use existing or default 5 days from orderDate
        dto.setEstimatedDelivery(order.getEstimatedDelivery() != null ?
                order.getEstimatedDelivery() :
                dto.getOrderDate().toLocalDate().plusDays(5));

        // Map order items safely
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            List<OrderItemResponse> itemResponses = order.getOrderItems()
                    .stream()
                    .map(OrderItemResponse::fromOrderItem)
                    .collect(Collectors.toList());
            dto.setItems(itemResponses);
        }

        // Safe user email
        dto.setUserEmail(order.getUser() != null ? order.getUser().getEmail() : "unknown@example.com");

        return dto;
    }

    // Convert List<Order> -> List<OrderResponse>
    public static List<OrderResponse> fromOrderList(List<Order> orders) {
        return orders.stream()
                .map(OrderResponse::fromOrder)
                .collect(Collectors.toList());
    }
}
