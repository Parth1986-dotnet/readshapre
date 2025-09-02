package com.itc.book_store.services.stripe;

import com.itc.book_store.domain.Payment;
import com.itc.book_store.domain.PaymentStatus;
import com.itc.book_store.dto.CreatePaymentIntentRequest;
import com.itc.book_store.dto.CreatePaymentIntentResponse;
import com.itc.book_store.dto.RefundRequest;
import com.itc.book_store.dto.RefundResponse;
import com.itc.book_store.repository.PaymentRepository;
import com.itc.book_store.services.PaymentProvider;
import com.stripe.exception.StripeException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.net.RequestOptions;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
public class StripePaymentProvider implements PaymentProvider {

    private final PaymentRepository paymentRepository;
    private final String webhookSecret;

    public StripePaymentProvider(PaymentRepository paymentRepository,
                                 @Value("${app.payments.webhook-secret}") String webhookSecret) {
        this.paymentRepository = paymentRepository;
        this.webhookSecret = webhookSecret;
    }

    @Override
    public String providerName() {
        return "stripe";
    }

    @Override
    @Transactional
    public CreatePaymentIntentResponse createPaymentIntent(CreatePaymentIntentRequest req, Payment payment, String idempotencyKey) {
        long amountMinor = req.getAmount().movePointRight(2).longValueExact();

        PaymentIntentCreateParams.Builder builder = PaymentIntentCreateParams.builder()
                .setAmount(amountMinor)
                .setCurrency(req.getCurrency().toLowerCase())
                .putMetadata("orderId", String.valueOf(req.getOrderId()))
                .putMetadata("paymentId", payment.getId().toString())
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
                );

        if (req.getCustomerEmail() != null) {
            builder.setReceiptEmail(req.getCustomerEmail());
        }

        try {
            RequestOptions options = RequestOptions.builder()
                    .setIdempotencyKey(idempotencyKey)
                    .build();

            PaymentIntent pi = PaymentIntent.create(builder.build(), options);
            payment.setStatus(mapStripeStatus(pi.getStatus()));
            payment.setProviderPaymentId(pi.getId());
            paymentRepository.save(payment);

            return new CreatePaymentIntentResponse(payment.getId(), pi.getId(), pi.getClientSecret());
        } catch (StripeException e) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void handlePaymentSucceeded(String providerPaymentId) {
        Payment payment = paymentRepository.findByProviderPaymentId(providerPaymentId)
                .orElseThrow(() -> new IllegalStateException("Payment not found for provider id: " + providerPaymentId));
        payment.setStatus(PaymentStatus.SUCCEEDED);
        paymentRepository.save(payment);
        // TODO: integrate with your OrderService to mark order as paid
    }

    @Override
    @Transactional
    public void handlePaymentFailed(String providerPaymentId, String failureMessage) {
        Payment payment = paymentRepository.findByProviderPaymentId(providerPaymentId)
                .orElseThrow(() -> new IllegalStateException("Payment not found for provider id: " + providerPaymentId));
        payment.setStatus(PaymentStatus.FAILED);
        Map<String, Object> meta = Optional.ofNullable(payment.getMetadata()).orElseGet(HashMap::new);
        meta.put("failureMessage", failureMessage);
        payment.setMetadata(meta);
        paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public RefundResponse refund(RefundRequest req) {
        Payment payment = paymentRepository.findByProviderPaymentId(req.getProviderPaymentId())
                .orElseThrow(() -> new IllegalArgumentException("Unknown provider payment id"));

        long amountMinor = req.getAmount().movePointRight(2).longValueExact();

        RefundCreateParams.Builder refundBuilder = RefundCreateParams.builder()
                .setPaymentIntent(req.getProviderPaymentId())
                .setAmount(amountMinor);

        if (req.getReason() != null) {
            refundBuilder.setReason(RefundCreateParams.Reason.valueOf(req.getReason().toUpperCase()));
        }

        try {
            Refund refund = Refund.create(refundBuilder.build());
            payment.setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);
            return new RefundResponse(refund.getId(), req.getAmount(), refund.getStatus());
        } catch (StripeException e) {
            throw new RuntimeException("Refund failed: " + e.getMessage(), e);
        }
    }

    @Override
    public Optional<String> extractProviderPaymentIdFromWebhook(String payload, String sigHeader) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            if (event.getDataObjectDeserializer().getObject().isPresent()) {
                if ("payment_intent.succeeded".equals(event.getType())) {
                    PaymentIntent pi = (PaymentIntent) event.getDataObjectDeserializer().getObject().get();
                    handlePaymentSucceeded(pi.getId());
                    return Optional.of(pi.getId());
                } else if ("payment_intent.payment_failed".equals(event.getType())) {
                    PaymentIntent pi = (PaymentIntent) event.getDataObjectDeserializer().getObject().get();
                    String failure = pi.getLastPaymentError() != null ? pi.getLastPaymentError().getMessage() : "unknown";
                    handlePaymentFailed(pi.getId(), failure);
                    return Optional.of(pi.getId());
                }
            }

            return Optional.empty();
        } catch (SignatureVerificationException e) {
            throw new RuntimeException("Invalid webhook signature", e);
        }
    }

    private PaymentStatus mapStripeStatus(String stripeStatus) {
        if (stripeStatus == null) return PaymentStatus.PROCESSING;

        return switch (stripeStatus) {
            case "requires_payment_method" -> PaymentStatus.REQUIRES_PAYMENT_METHOD;
            case "requires_confirmation" -> PaymentStatus.REQUIRES_CONFIRMATION;
            case "requires_action" -> PaymentStatus.REQUIRES_ACTION;
            case "processing" -> PaymentStatus.PROCESSING;
            case "succeeded" -> PaymentStatus.SUCCEEDED;
            case "canceled" -> PaymentStatus.CANCELED;
            default -> PaymentStatus.PROCESSING;
        };
    }
}
