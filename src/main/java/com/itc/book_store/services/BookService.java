package com.itc.book_store.services;

import com.itc.book_store.entity.Book;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface BookService {

    // ✅ Create a new book
    Book createBook(String title,
                    String author,
                    String publisher,
                    String isbn,
                    String category,
                    String description,
                    double price,
                    int stock,
                    String publicationDateStr,
                    boolean available,
                    MultipartFile imageFile);

    // ✅ Get a book by ID
    Optional<Book> getBookById(Long id);

    // ✅ Get all books — ADD THIS
    List<Book> getAllBooks();

    // ✅ DELETE a book by ID → ADD THIS METHOD
    void deleteBook(Long id);

    // ✅ Update a book by ID
    Book updateBook(Long id, Book updatedBook, MultipartFile imageFile);

}
