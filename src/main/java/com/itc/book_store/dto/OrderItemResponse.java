    package com.itc.book_store.dto;

    import com.itc.book_store.entity.OrderItem;
    import java.math.BigDecimal;
    import com.itc.book_store.dto.OrderItemRequest;
    import com.itc.book_store.dto.OrderItemResponse;


    public class OrderItemResponse {
        private String title;
        private int quantity;
        private BigDecimal price;

        // Getters and Setters
        public String getTitle() {
            return title;
        }
        public void setTitle(String title) {
            this.title = title;
        }

        public int getQuantity() {
            return quantity;
        }
        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }

        public BigDecimal getPrice() {
            return price;
        }
        public void setPrice(BigDecimal price) {
            this.price = price;
        }

        // Static factory method to convert from OrderItem entity to DTO
        public static OrderItemResponse fromOrderItem(OrderItem item) {
            OrderItemResponse dto = new OrderItemResponse();
            dto.setTitle(item.getBook().getTitle());
            dto.setQuantity(item.getQuantity());
            dto.setPrice(item.getPrice());
            return dto;
        }
    }
