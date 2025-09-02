package com.itc.book_store.dto;

import jakarta.validation.constraints.NotBlank;
import com.itc.book_store.Enum.OrderStatus;

public class UpdateOrderStatusRequest {

    @NotBlank(message = "Status is required")
    private String status;

    public UpdateOrderStatusRequest() {}

    public UpdateOrderStatusRequest(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
