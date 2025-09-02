package com.itc.book_store.dto.kafka;

import com.itc.book_store.entity.OrderItem;
import java.math.BigDecimal;

public class OrderItemEvent {
    private Long bookId;
    private String title;
    private int quantity;
    private BigDecimal price;

    // ===== Getters & Setters =====
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    // ===== Static Converter from OrderItem entity =====
    public static OrderItemEvent fromOrderItem(OrderItem item) {
        OrderItemEvent event = new OrderItemEvent();
        event.setBookId(item.getBook().getId());
        event.setTitle(item.getBook().getTitle());
        event.setQuantity(item.getQuantity());
        event.setPrice(item.getPrice());
        return event;
    }
}
