package com.itc.book_store.controller;

import com.itc.book_store.entity.Book;
import com.itc.book_store.services.BookService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")  // You can restrict this to your frontend URL in production
public class BookController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Autowired
    private final BookService bookService;

    @Autowired
    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    // Get all books
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        List<Book> books = bookService.getAllBooks();
        if (books.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(books);
    }

    // ✅ Get book by ID (for editing)
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return bookService.getBookById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // Create book
    @PostMapping("")
    public ResponseEntity<Book> createBook(
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam("publisher") String publisher,
            @RequestParam("isbn") String isbn,
            @RequestParam("category") String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("price") double price,
            @RequestParam("stock") int stock,
            @RequestParam("publicationDate") String publicationDateStr,
            @RequestParam("available") boolean available,
            @RequestParam("image") MultipartFile imageFile) {

        Book saved = bookService.createBook(title, author, publisher, isbn, category, description, price, stock, publicationDateStr, available, imageFile);
        return ResponseEntity.ok(saved);
    }

    // Update book by ID with optional image file
    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam("publisher") String publisher,
            @RequestParam("isbn") String isbn,
            @RequestParam("category") String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("price") double price,
            @RequestParam("stock") int stock,
            @RequestParam("publicationDate") String publicationDateStr,
            @RequestParam("available") boolean available,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {

        Book updatedBook = Book.builder()
                .title(title)
                .author(author)
                .publisher(publisher)
                .isbn(isbn)
                .category(category)
                .description(description)
                .price(price)
                .stock(stock)
                .publicationDate(LocalDate.parse(publicationDateStr))
                .available(available)
                .build();

        Book updated = bookService.updateBook(id, updatedBook, imageFile);
        return ResponseEntity.ok(updated);
    }


    // Delete book
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }
}
