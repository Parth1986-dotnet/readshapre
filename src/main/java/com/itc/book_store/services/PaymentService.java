package com.itc.book_store.services;

import com.itc.book_store.dto.CreatePaymentIntentRequest;
import com.itc.book_store.dto.CreatePaymentIntentResponse;
import com.itc.book_store.dto.RefundRequest;
import com.itc.book_store.dto.RefundResponse;

public interface PaymentService {
    CreatePaymentIntentResponse createPaymentIntent(CreatePaymentIntentRequest req, Long currentUserId);
    void processWebhook(String payload, String signatureHeader);
    RefundResponse refund(RefundRequest req);
}

