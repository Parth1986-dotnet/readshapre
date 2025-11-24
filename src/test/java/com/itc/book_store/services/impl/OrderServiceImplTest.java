package com.itc.book_store.services.impl;

import com.itc.book_store.dto.CreateOrderRequest;
import com.itc.book_store.dto.OrderItemRequest;
import com.itc.book_store.entity.Book;
import com.itc.book_store.entity.Order;
import com.itc.book_store.entity.Users;
import com.itc.book_store.repository.*;
import com.itc.book_store.services.EmailService;
import com.itc.book_store.services.kafka.OrderNotificationService;
import com.itc.book_store.services.kafka.OrderProducer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private OrderProducer orderProducer;

    @Mock
    private OrderNotificationService orderNotificationService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private OrderServiceImpl orderService;

    @Test
    void testPlaceOrder() {
        Long userId = 1L;

        Users user = new Users();
        user.setId(userId);
        user.setEmail("test@example.com");
        user.setUsername("Parth");

        Book book = new Book();
        book.setId(10L);
        book.setPrice(BigDecimal.valueOf(500));
        book.setStock(20);

        // Avoid unnecessary stubbing errors
        lenient().doNothing().when(emailService).sendOrderConfirmation(any(), any(), any());
        lenient().doNothing().when(emailService).sendOrderStatusUpdate(any(), any(), any());

        CreateOrderRequest request = CreateOrderRequest.builder()
                .items(List.of(new OrderItemRequest(10L, 2)))
                .shippingAddress("221B Baker Street, London")
                .estimatedDelivery(LocalDate.now().plusDays(3))
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(bookRepository.findAllById(List.of(10L))).thenReturn(List.of(book));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = orderService.placeOrder(userId, request);

        assertNotNull(result);
        assertEquals(userId, result.getUser().getId());
        assertEquals(1, result.getOrderItems().size());
        assertEquals(BigDecimal.valueOf(1000), result.getTotalAmount());

        verify(orderRepository, times(1)).save(any(Order.class));
    }
}
