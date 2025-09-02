package com.itc.book_store.repository;

import com.itc.book_store.entity.Order;
import com.itc.book_store.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.itc.book_store.Enum.OrderStatus;
import org.springframework.data.jpa.repository.Modifying;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUser(Users user);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByUser_Email(String email);

    @Query("SELECT o FROM Order o JOIN FETCH o.user LEFT JOIN FETCH o.orderItems WHERE o.id = :id")
    Optional<Order> findByIdWithUser(@Param("id") Long id);

    Page<Order> findByStatusAndUser_Email(OrderStatus status, String email, Pageable pageable);

    Page<Order> findByUser_Email(String email, Pageable pageable);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    List<Order> findByStatusAndUser_Email(OrderStatus status, String email );

    Page<Order> findByUser_EmailContainingIgnoreCase(String email, Pageable pageable);

    Page<Order> findByUser_EmailContainingIgnoreCaseAndStatus(String email, OrderStatus status, Pageable pageable);

    @Modifying
    @Query("UPDATE Order o SET o.status = :status WHERE o.id = :id")
    int updateOrderStatus(@Param("id") Long id, @Param("status") OrderStatus status);

    @Query("SELECT COALESCE(SUM(oi.quantity * oi.price), 0) FROM OrderItem oi")
    BigDecimal getTotalEarnings();
}
