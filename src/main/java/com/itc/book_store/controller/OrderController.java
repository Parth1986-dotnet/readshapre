package com.itc.book_store.controller;

import com.itc.book_store.dto.*;
import com.itc.book_store.dto.kafka.OrderNotification;
import com.itc.book_store.entity.Order;
import com.itc.book_store.entity.Users;
import com.itc.book_store.services.OrderService;
import com.itc.book_store.services.NotificationService;
import com.itc.book_store.services.impl.UserService;
import com.itc.book_store.services.kafka.OrderNotificationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;
    private final NotificationService notificationService;
    private final OrderNotificationService orderNotificationService;


    public OrderController(OrderService orderService,
                           UserService userService,
                           NotificationService notificationService,
                           OrderNotificationService orderNotificationService) {
        this.orderService = orderService;
        this.userService = userService;
       this.notificationService = notificationService;
       this.orderNotificationService = orderNotificationService;
    }

    // 1️⃣ Place Order (USER or ADMIN)
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> placeOrder(
            @RequestBody CreateOrderRequest createOrderRequest,
            Authentication auth) {

        String email = auth.getName(); // ✅ The JWT subject is email
        Users user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        Order placedOrder = orderService.placeOrder(user.getId(), createOrderRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", placedOrder.getId());
        response.put("message", "Order created successfully");
        response.put("order", OrderResponse.fromOrder(placedOrder));

        return ResponseEntity.ok(response);
    }

    // 2️⃣ Update Order Status (ADMIN only)
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> updateStatus(
            @PathVariable Long orderId,
            @RequestBody @Valid UpdateOrderStatusRequest request,
            BindingResult bindingResult) {

        // Validate request
        if (bindingResult.hasErrors()) {
            StringBuilder errors = new StringBuilder();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.append(error.getField())
                        .append(": ")
                        .append(error.getDefaultMessage())
                        .append("; ");
            }
            return ResponseEntity.badRequest().body(errors.toString());
        }

        try {
            // Update status
            Order updatedOrder = orderService.updateOrderStatus(orderId, request.getStatus());

            // 🔹 Optionally, return notification info in response
            OrderNotification statusNotification = new OrderNotification(
                    updatedOrder.getId(),
                    "Your order #" + updatedOrder.getId() + " is now " + updatedOrder.getStatus().name(),
                    updatedOrder.getStatus().name()
            );

            return ResponseEntity.ok("Order status updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // 3️⃣ Get current user's orders (USER only)
    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<OrderResponse>> getMyOrders(Authentication auth) {
        String email = auth.getName();
        Users user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<OrderResponse> orders = orderService.getOrdersByUser(user.getEmail());
        return ResponseEntity.ok(orders);
    }

    // 4️⃣ Get all orders paginated & filtered (ADMIN only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) String status) {

        Pageable pageable = PageRequest.of(page, size);
        Page<OrderResponse> orderPage = orderService.getOrdersPaginatedFiltered(userEmail, status, pageable);
        return ResponseEntity.ok(orderPage);
    }

    // 5️⃣ Get total earnings (ADMIN only)
    @GetMapping("/earnings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BigDecimal> getTotalEarnings() {
        BigDecimal totalEarnings = orderService.getTotalEarnings();
        return ResponseEntity.ok(totalEarnings);
    }
}
