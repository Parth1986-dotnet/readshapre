package com.itc.book_store.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

import jakarta.validation.constraints.NotEmpty;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotEmpty(message = "Order must have at least one item.")
    private List<OrderItemRequest> items;

    @NotNull(message = "Shipping address is required.")
    private String shippingAddress;

    @NotNull(message = "Estimated delivery date is required.")
    private String estimatedDelivery;
}
