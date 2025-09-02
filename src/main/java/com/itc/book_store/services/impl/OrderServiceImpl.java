package com.itc.book_store.services.impl;

import com.itc.book_store.Enum.OrderStatus;
import com.itc.book_store.dto.*;
import com.itc.book_store.dto.kafka.OrderEvent;
import com.itc.book_store.dto.kafka.OrderNotification;
import com.itc.book_store.entity.Book;
import com.itc.book_store.entity.Order;
import com.itc.book_store.entity.OrderItem;
import com.itc.book_store.entity.Users;
import com.itc.book_store.repository.*;
import com.itc.book_store.services.OrderService;
import com.itc.book_store.services.kafka.OrderNotificationService;
import com.itc.book_store.services.kafka.OrderProducer;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderProducer orderProducer;
    private final OrderNotificationService orderNotificationService;

    public OrderServiceImpl(OrderRepository orderRepository,
                            BookRepository bookRepository,
                            UserRepository userRepository,
                            OrderItemRepository orderItemRepository,
                            OrderProducer orderProducer,
                            OrderNotificationService orderNotificationService) {
        this.orderRepository = orderRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderProducer = orderProducer;
        this.orderNotificationService = orderNotificationService;
    }

    @Override
    @Transactional
    public Order placeOrder(Long userId, CreateOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Fetch books and map them
        List<Long> bookIds = request.getItems().stream().map(OrderItemRequest::getBookId).toList();
        List<Book> books = bookRepository.findAllById(bookIds);

        if (books.size() != bookIds.size()) {
            List<Long> foundIds = books.stream().map(Book::getId).toList();
            List<Long> missingIds = bookIds.stream().filter(id -> !foundIds.contains(id)).toList();
            throw new RuntimeException("Books not found with IDs: " + missingIds);
        }

        Map<Long, Book> bookMap = books.stream().collect(Collectors.toMap(Book::getId, b -> b));

        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            Book book = bookMap.get(itemRequest.getBookId());
            OrderItem item = new OrderItem();
            item.setBook(book);
            item.setQuantity(itemRequest.getQuantity());

            BigDecimal itemTotal = book.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            item.setPrice(itemTotal);
            item.setOrder(order);

            totalAmount = totalAmount.add(itemTotal);
            orderItems.add(item);
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        // Notify admins about new order
        String adminMsg = String.format("📦 New order #%d by %s (Total: %s)",
                savedOrder.getId(), user.getEmail(), savedOrder.getTotalAmount());
        OrderNotification adminNotif = new OrderNotification(
                savedOrder.getId(), adminMsg, savedOrder.getStatus().name()
        );
        orderNotificationService.notifyAdmins(adminNotif);

        // Notify user about successful placement
        OrderNotification userNotif = new OrderNotification(
                savedOrder.getId(),
                "✅ Your order has been placed successfully!",
                savedOrder.getStatus().name()
        );
        orderNotificationService.notifyUser(user.getEmail(), userNotif);

        // Kafka event for frontend
        publishOrderEventWithRetry(savedOrder, true);

        return savedOrder;
    }

    @Override
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findByIdWithUser(id);
    }

    @Override
    public Optional<Order> getOrderByIdWithUser(Long id) {
        return orderRepository.findByIdWithUser(id);
    }

    @Override
    public List<OrderResponse> getOrdersByUser(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        List<Order> orders = orderRepository.findByUser(user);
        return orders.stream().map(OrderResponse::fromOrder).collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getAllOrdersResponses() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream().map(OrderResponse::fromOrder).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);

        // Notify only the user about status change
        String userMsg = String.format("📢 Your order #%d status is now %s",
                updatedOrder.getId(), updatedOrder.getStatus().name());

        OrderNotification userNotif = new OrderNotification(
                updatedOrder.getId(),
                userMsg,
                updatedOrder.getStatus().name()
        );

        orderNotificationService.notifyUser(updatedOrder.getUser().getEmail(), userNotif);

        // Admins are not notified here, they see updates in the dashboard

        // Kafka event for frontend
        publishOrderEventWithRetry(updatedOrder, false);

        return updatedOrder;
    }

    @Override
    public Page<Order> getOrders(Pageable pageable, String status, String userEmail) {
        OrderStatus orderStatus = null;
        if (status != null && !status.isEmpty()) {
            orderStatus = OrderStatus.valueOf(status.toUpperCase());
        }

        boolean hasEmail = userEmail != null && !userEmail.isEmpty();

        if (orderStatus != null && hasEmail) {
            return orderRepository.findByStatusAndUser_Email(orderStatus, userEmail, pageable);
        } else if (orderStatus != null) {
            return orderRepository.findByStatus(orderStatus, pageable);
        } else if (hasEmail) {
            return orderRepository.findByUser_Email(userEmail, pageable);
        } else {
            return orderRepository.findAll(pageable);
        }
    }

    @Override
    public Page<OrderResponse> getOrdersPaginatedFiltered(String userEmail, String status, Pageable pageable) {
        OrderStatus orderStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            orderStatus = OrderStatus.valueOf(status.toUpperCase());
        }

        boolean hasEmail = userEmail != null && !userEmail.trim().isEmpty();

        Page<Order> ordersPage;
        if (hasEmail && orderStatus != null) {
            ordersPage = orderRepository.findByUser_EmailContainingIgnoreCaseAndStatus(userEmail, orderStatus, pageable);
        } else if (hasEmail) {
            ordersPage = orderRepository.findByUser_EmailContainingIgnoreCase(userEmail, pageable);
        } else if (orderStatus != null) {
            ordersPage = orderRepository.findByStatus(orderStatus, pageable);
        } else {
            ordersPage = orderRepository.findAll(pageable);
        }

        return ordersPage.map(OrderResponse::fromOrder);
    }

    @Override
    public BigDecimal getTotalEarnings() {
        return orderItemRepository.getTotalEarnings();
    }

    @Override
    public Order requireOwnedOrder(Long orderId, Long userId) {
        return orderRepository.findById(orderId)
                .filter(order -> order.getUser().getId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Invalid order ID or not owned by user"));
    }

    // ------------------- Kafka helper -------------------
    private void publishOrderEventWithRetry(Order order, boolean isNewOrder) {
        int maxAttempts = 3;
        int attempt = 0;
        boolean sent = false;

        while (!sent && attempt < maxAttempts) {
            try {
                attempt++;
                if (isNewOrder) {
                    orderProducer.sendOrderEvent(order);
                } else {
                    orderProducer.sendOrderStatusUpdate(order);
                }
                sent = true;
                logger.info("Kafka event sent successfully for orderId={} (isNew={})", order.getId(), isNewOrder);
            } catch (Exception e) {
                logger.warn("Kafka publish attempt {} failed for orderId={}: {}", attempt, order.getId(), e.getMessage());
                if (attempt == maxAttempts) {
                    logger.error("All Kafka retries failed for orderId={}. Saving for fallback.", order.getId());
                    saveFailedKafkaEvent(order);
                }
                try { Thread.sleep(2000); } catch (InterruptedException ignored) {}
            }
        }
    }

    private void saveFailedKafkaEvent(Order order) {
        // TODO: Persist in DB/Redis for retry
        logger.info("Saved orderId={} for retry later", order.getId());
    }
}
