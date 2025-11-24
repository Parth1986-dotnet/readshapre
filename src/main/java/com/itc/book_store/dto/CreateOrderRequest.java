package com.itc.book_store.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {

    @NotEmpty(message = "Order must have at least one item.")
    private List<OrderItemRequest> items;

    @NotNull(message = "Shipping address is required.")
    private String shippingAddress;

    @NotNull(message = "Estimated delivery date is required.")
    @JsonFormat(pattern = "EEE, dd MMM yyyy", locale = "en")   // ✅ FIXED
    private LocalDate estimatedDelivery;
}
