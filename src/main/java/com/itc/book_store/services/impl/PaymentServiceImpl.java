package com.itc.book_store.services.impl;

import com.itc.book_store.domain.Payment;
import com.itc.book_store.domain.PaymentStatus;
import com.itc.book_store.dto.CreatePaymentIntentRequest;
import com.itc.book_store.dto.CreatePaymentIntentResponse;
import com.itc.book_store.dto.RefundRequest;
import com.itc.book_store.dto.RefundResponse;
import com.itc.book_store.repository.PaymentRepository;
import com.itc.book_store.services.PaymentProvider;
import com.itc.book_store.services.PaymentService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.itc.book_store.entity.Order;
import com.itc.book_store.services.OrderService;
import com.itc.book_store.services.impl.OrderServiceImpl;


import java.math.BigDecimal;
import java.util.Optional;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentProvider provider;
    private final String defaultCurrency;
    private final OrderService orderService;  // correct type

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                              PaymentProvider provider,
                              OrderService orderService,      // correct type and order
                              @Value("${app.payments.currency:GBP}") String defaultCurrency) {
        this.paymentRepository = paymentRepository;
        this.provider = provider;
        this.orderService = orderService;     // assign it!
        this.defaultCurrency = defaultCurrency;
    }

    @Override
    @Transactional
    public CreatePaymentIntentResponse createPaymentIntent(CreatePaymentIntentRequest req, Long currentUserId) {
        // 1️⃣ Fetch and validate order
        Order order = orderService.requireOwnedOrder(req.getOrderId(), currentUserId);

        // Convert order total to minor units (pence) as BigDecimal
        BigDecimal orderAmountInPence = order.getGrandTotal()
                .multiply(BigDecimal.valueOf(100));

        // Convert request amount to BigDecimal for comparison
        BigDecimal amountInPence = req.getAmount();

        if (amountInPence.compareTo(orderAmountInPence) != 0) {
            throw new IllegalArgumentException(
                    "Amount mismatch: request=" + amountInPence + ", order=" + orderAmountInPence
            );
        }

        // Save payment
        Payment payment = paymentRepository.save(
                new Payment()
                        .setOrderId(order.getId())
                        .setUserId(currentUserId)
                        .setAmount(orderAmountInPence) // already in pence
                        .setCurrency(Optional.ofNullable(req.getCurrency()).orElse(defaultCurrency))
                        .setStatus(PaymentStatus.REQUIRES_PAYMENT_METHOD)
                        .setProvider(provider.providerName())
                        .setMetadata(req.getMetadata())
        );

        // 3️⃣ Create PaymentIntent with idempotency key
        CreatePaymentIntentResponse resp = provider.createPaymentIntent(req, payment, payment.getId().toString());

        // 4️⃣ Save provider payment ID
        payment.setProviderPaymentId(resp.getProviderPaymentId());
        paymentRepository.save(payment);

        return resp;
    }

    @Override
    @Transactional
    public void processWebhook(String payload, String signatureHeader) {
        provider.extractProviderPaymentIdFromWebhook(payload, signatureHeader)
                .ifPresent(providerPaymentId -> {
                    // In Stripe handler we already interpret event; here we no-op
                });
    }

    @Override
    @Transactional
    public RefundResponse refund(RefundRequest req) {
        return provider.refund(req);
    }
}

