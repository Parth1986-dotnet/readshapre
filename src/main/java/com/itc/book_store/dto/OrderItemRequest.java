package com.itc.book_store.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequest {

    @NotNull(message = "Book ID cannot be null")
    private Long bookId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;
}