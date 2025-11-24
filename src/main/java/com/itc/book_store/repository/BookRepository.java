package com.itc.book_store.repository;

import com.itc.book_store.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    // You can add custom query methods here if needed
    List<Book> findByStock(int stock);
    List<Book> findByStockLessThanEqual(int stock);
}