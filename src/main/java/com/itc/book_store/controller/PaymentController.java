package com.itc.book_store.controller;

import com.itc.book_store.dto.CreatePaymentIntentRequest;
import com.itc.book_store.dto.CreatePaymentIntentResponse;
import com.itc.book_store.dto.RefundRequest;
import com.itc.book_store.dto.RefundResponse;
import com.itc.book_store.security.CustomUserDetails;
import com.itc.book_store.services.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/intent")
    public ResponseEntity<?> createIntent(
            @Valid @RequestBody CreatePaymentIntentRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            if (!(userDetails instanceof CustomUserDetails)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not authenticated properly");
            }
            CustomUserDetails customUser = (CustomUserDetails) userDetails;

            // Validate amount
            if (req.getAmount() == null || req.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body("Payment amount must be greater than 0.");
            }

            // Call Stripe service
            CreatePaymentIntentResponse response = paymentService.createPaymentIntent(req, customUser.getId());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace(); // Logs full stack trace
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Stripe payment creation failed: " + e.getMessage());
        }
    }

    @PostMapping("/refund")
    public ResponseEntity<?> refund(@Valid @RequestBody RefundRequest req) {
        try {
            RefundResponse response = paymentService.refund(req);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            String errorMsg = e.getMessage() != null ? e.getMessage() :
                    "Failed to process refund. Try again later.";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorMsg);
        }
    }
}
