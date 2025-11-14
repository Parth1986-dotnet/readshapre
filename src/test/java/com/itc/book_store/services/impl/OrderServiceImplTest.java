package com.itc.book_store.services.impl;

import com.itc.book_store.dto.CreateOrderRequest;
import com.itc.book_store.dto.OrderItemRequest;
import com.itc.book_store.entity.Book;
import com.itc.book_store.entity.Order;
import com.itc.book_store.entity.Users;
import com.itc.book_store.repository.BookRepository;
import com.itc.book_store.repository.OrderRepository;
import com.itc.book_store.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    @Test
    void testPlaceOrder() {
        // Given
        Long userId = 1L;
        Users user = new Users();
        user.setId(userId);

        Book book = new Book();
        book.setId(10L);
        book.setPrice(BigDecimal.valueOf(500));

        CreateOrderRequest request = new CreateOrderRequest();
        request.setItems(List.of(new OrderItemRequest(10L, 2)));

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(bookRepository.findAllById(List.of(10L))).thenReturn(List.of(book));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        // When
        Order result = orderService.placeOrder(userId, request);

        // Then
        assertNotNull(result);
        assertEquals(userId, result.getUser().getId());
        assertEquals(1, result.getOrderItems().size());
        verify(orderRepository, times(1)).save(any(Order.class));
    }
}
