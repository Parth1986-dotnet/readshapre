package com.itc.book_store.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import org.hibernate.annotations.GenericGenerator;
import com.vladmihalcea.hibernate.type.json.JsonType;
import org.hibernate.annotations.Type;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import org.hibernate.annotations.Type;
import jakarta.persistence.Entity;


@Entity
@Table(name = "payments", indexes = {
        @Index(name = "idx_payments_order_id", columnList = "order_id"),
        @Index(name = "idx_payments_provider_payment_id", columnList = "provider_payment_id")
})
public class Payment {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "amount", precision = 19, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "currency", length = 3, nullable = false)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 40, nullable = false)
    private PaymentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "method", length = 40)
    private PaymentMethod method;

    @Column(name = "provider", length = 40, nullable = false)
    private String provider; // e.g., "stripe"

    @Column(name = "provider_payment_id", length = 128)
    private String providerPaymentId; // Stripe PaymentIntent id

    @Type(JsonType.class)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // getters and setters omitted for brevity
    @PrePersist
    public void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    // builder-style helpers
    public UUID getId() { return id; }
    public Long getOrderId() { return orderId; }
    public Payment setOrderId(Long orderId) { this.orderId = orderId; return this; }
    public Long getUserId() { return userId; }
    public Payment setUserId(Long userId) { this.userId = userId; return this; }
    public BigDecimal getAmount() { return amount; }
    public Payment setAmount(BigDecimal amount) { this.amount = amount; return this; }
    public String getCurrency() { return currency; }
    public Payment setCurrency(String currency) { this.currency = currency; return this; }
    public PaymentStatus getStatus() { return status; }
    public Payment setStatus(PaymentStatus status) { this.status = status; return this; }
    public PaymentMethod getMethod() { return method; }
    public Payment setMethod(PaymentMethod method) { this.method = method; return this; }
    public String getProvider() { return provider; }
    public Payment setProvider(String provider) { this.provider = provider; return this; }
    public String getProviderPaymentId() { return providerPaymentId; }
    public Payment setProviderPaymentId(String providerPaymentId) { this.providerPaymentId = providerPaymentId; return this; }
    public Map<String, Object> getMetadata() { return metadata; }
    public Payment setMetadata(Map<String, Object> metadata) { this.metadata = metadata; return this; }
}