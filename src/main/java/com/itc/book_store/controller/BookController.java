package com.itc.book_store.controller;

import com.itc.book_store.entity.Book;
import com.itc.book_store.services.BookService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.math.BigDecimal;
import java.time.LocalDate;


@RestController
@RequestMapping("/api/books")
//@CrossOrigin(origins = "*")  // You can restrict this to your frontend URL in production
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
    //@PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        List<Book> books = bookService.getAllBooks();
        if (books.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(books);
    }

    // ✅ Get book by ID (for editing)
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return bookService.getBookById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // Create book
    @PreAuthorize("hasRole('ADMIN')")
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
            @RequestParam("image") MultipartFile imageFile,

            // ✅ ADD THIS
            @RequestParam(value = "previewText", required = false) String previewText
    ) {
        BigDecimal priceDecimal = BigDecimal.valueOf(price);

        Book saved = bookService.createBook(
                title, author, publisher, isbn, category, description,
                priceDecimal, stock, publicationDateStr, available, imageFile, previewText
        );
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
            //@RequestParam("price") double price,
            @RequestParam("price") BigDecimal price, // ✅ Changed from double
            @RequestParam("stock") int stock,
            @RequestParam("publicationDate") String publicationDateStr,
            @RequestParam("available") boolean available,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "previewText", required = false) String previewText
            ) {

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
                .previewText(previewText)
                .build();

        Book updated = bookService.updateBook(id, updatedBook, imageFile);
        return ResponseEntity.ok(updated);
    }


    // Delete book
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Integer>> getBookStats() {
        Map<String, Integer> stats = bookService.getBookStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<String> getBookPreview(@PathVariable Long id) {
        return bookService.getBookById(id)
                .map(book -> {
                    if (book.getPreviewText() == null || book.getPreviewText().isBlank()) {
                        return ResponseEntity.status(HttpStatus.NO_CONTENT).body("");
                    }
                    return ResponseEntity.ok(book.getPreviewText());
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Book not found"));
    }




}
