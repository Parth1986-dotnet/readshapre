package com.itc.book_store.services.stripe;

import com.itc.book_store.services.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/payments")
public class StripeWebhookHandler {

    private final PaymentService paymentService;

    public StripeWebhookHandler(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping(value = "/webhook", consumes = "application/json")
    public ResponseEntity<String> handleStripeWebhook(HttpServletRequest request, @RequestHeader("Stripe-Signature") String sig) throws IOException {
        String payload = StreamUtils.copyToString(request.getInputStream(), StandardCharsets.UTF_8);
        paymentService.processWebhook(payload, sig);
        return ResponseEntity.status(HttpStatus.OK).body("ok");
    }
}
