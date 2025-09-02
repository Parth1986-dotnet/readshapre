package com.itc.book_store.dto;
import java.math.BigDecimal;

public class RefundResponse {
    private String refundId;
    private BigDecimal amount;
    private String status;

    public RefundResponse(String refundId, BigDecimal amount, String status) {
        this.refundId = refundId;
        this.amount = amount;
        this.status = status;
    }
    public String getRefundId() { return refundId; }
    public BigDecimal getAmount() { return amount; }
    public String getStatus() { return status; }
}

