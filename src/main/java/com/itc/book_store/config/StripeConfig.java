package com.itc.book_store.config;

import com.stripe.Stripe;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

@Configuration
public class StripeConfig {

    @Value("${app.payments.stripe.api-key}")
    private String apiKey;

    @Value("${app.payments.stripe.account:}") // optional Connect account
    private String stripeAccount;

    @Value("${app.payments.webhook-secret}")
    private String webhookSecret;

    @Value("${app.payments.stripe.frontend-origin}")
    private String frontendOrigin;

    @PostConstruct
    public void init() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Stripe API key is not configured in application.properties");
        }
        Stripe.apiKey = apiKey; // set global API key
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }

    public String getFrontendOrigin() {
        return frontendOrigin;
    }

    public String getStripeAccount() {
        return stripeAccount; // pass this to RequestOptions when needed
    }
}

