package com.itc.book_store.services;

import com.itc.book_store.dto.CreateOrderRequest;
import com.itc.book_store.dto.OrderResponse;
import com.itc.book_store.entity.Book;
import com.itc.book_store.entity.Order;
import com.itc.book_store.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

public interface OrderService {

    Order placeOrder(Long userId, CreateOrderRequest request);

    Optional<Order> getOrderById(Long id);

    Optional<Order> getOrderByIdWithUser(Long id);

    List<OrderResponse> getOrdersByUser(String email); // ✅ Use this in controller

    List<OrderResponse> getAllOrdersResponses();

    List<Book> findByStock(int stock);


    Order updateOrderStatus(Long orderId, String status);


    Page<Order> getOrders(Pageable pageable, String status, String userEmail);

    Page<OrderResponse> getOrdersPaginatedFiltered(String userEmail, String status, Pageable pageable);

    BigDecimal getTotalEarnings();

   Order requireOwnedOrder(Long orderId, Long userId);



}
