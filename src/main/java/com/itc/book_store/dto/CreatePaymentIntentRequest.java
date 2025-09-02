package com.itc.book_store.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.Map;

public class CreatePaymentIntentRequest {
    @NotNull
    private Long orderId;

    @NotNull
    @DecimalMin(value = "0.5")
    private BigDecimal amount; // in major units e.g., 12.34 GBP

    @NotBlank
    private String currency; // e.g., GBP

    @Email
    private String customerEmail;

    private Map<String, Object> metadata; // optional

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
}
