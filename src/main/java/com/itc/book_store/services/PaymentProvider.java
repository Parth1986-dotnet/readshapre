package com.itc.book_store.services;

import com.itc.book_store.domain.Payment;
import com.itc.book_store.dto.CreatePaymentIntentRequest;
import com.itc.book_store.dto.CreatePaymentIntentResponse;
import com.itc.book_store.dto.RefundRequest;
import com.itc.book_store.dto.RefundResponse;
import com.stripe.model.PaymentIntent;

import java.util.Optional;

public interface PaymentProvider {
    String providerName(); // e.g., "stripe"

    CreatePaymentIntentResponse createPaymentIntent(CreatePaymentIntentRequest req, Payment payment, String idempotencyKey);

    void handlePaymentSucceeded(String providerPaymentId);

    void handlePaymentFailed(String providerPaymentId, String failureMessage);

    RefundResponse refund(RefundRequest req);

    Optional<String> extractProviderPaymentIdFromWebhook(String payload, String sigHeader);


}
