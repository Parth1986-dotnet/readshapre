package com.itc.book_store.dto;

import java.util.UUID;

public class CreatePaymentIntentResponse {
    private UUID paymentId; // internal id
    private String providerPaymentId; // e.g., pi_123
    private String clientSecret; // for frontend to confirm

    public CreatePaymentIntentResponse(UUID paymentId, String providerPaymentId, String clientSecret) {
        this.paymentId = paymentId;
        this.providerPaymentId = providerPaymentId;
        this.clientSecret = clientSecret;
    }
    public UUID getPaymentId() { return paymentId; }
    public String getProviderPaymentId() { return providerPaymentId; }
    public String getClientSecret() { return clientSecret; }
}
