package com.itc.book_store.services;

import com.itc.book_store.entity.Book;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Map;

public interface BookService {

    // ✅ Create a new book
    Book createBook(String title,
                    String author,
                    String publisher,
                    String isbn,
                    String category,
                    String description,
                    BigDecimal price,
                    int stock,
                    String publicationDateStr,
                    boolean available,
                    MultipartFile imageFile,
                    String previewText); // ✅ ADD THIS

    // ✅ Get a book by ID
    Optional<Book> getBookById(Long id);

    // ✅ Get all books — ADD THIS
    List<Book> getAllBooks();

    // ✅ DELETE a book by ID → ADD THIS METHOD
    void deleteBook(Long id);

    // ✅ Update a book by ID
    Book updateBook(Long id, Book updatedBook, MultipartFile imageFile);

    Map<String, Integer> getBookStats();

    // 👉 Only declare the method to get out-of-stock books
    List<Book> getOutOfStockBooks();

    List<Book> getBooksWithLowStock();

    // 🔥 ADD THIS — FIXES @Override ERROR
    void reduceStock(Long bookId, int quantity);
}
