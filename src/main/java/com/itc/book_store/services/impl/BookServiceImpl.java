    package com.itc.book_store.services.impl;

    import com.itc.book_store.dto.FileUploadResponse;
    import com.itc.book_store.entity.Book;
    import com.itc.book_store.repository.BookRepository;
    import com.itc.book_store.services.BookService;
    import com.itc.book_store.services.FileService;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Service;
    import org.springframework.web.multipart.MultipartFile;

    import java.math.BigDecimal;
    import java.time.LocalDate;
    import java.time.format.DateTimeFormatter;
    import java.util.List;
    import java.util.Map;
    import java.util.HashMap;
    import java.util.Optional;



    @Service
    @RequiredArgsConstructor
    public class BookServiceImpl implements BookService {

        private final BookRepository bookRepository;

        private final FileService fileService;

        @Override
        public Book createBook(String title,
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
                               String previewText) { // ✅ must match

            FileUploadResponse upload = fileService.uploadFile(imageFile);

            Book book = Book.builder()
                    .title(title)
                    .author(author)
                    .publisher(publisher)
                    .category(category)
                    .isbn(isbn)
                    .description(description)
                    .price(price)
                    .stock(stock)
                    .publicationDate(LocalDate.parse(publicationDateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd")))
                    .available(available)
                    .coverImageUrl(upload.getFileUrl())
                    .previewText(previewText) // ✅ include previewText
                    .build();

            return bookRepository.save(book);
        }

        @Override
        public List<Book> getAllBooks() {
            return bookRepository.findAll();
        }

        @Override
        public Optional<Book> getBookById(Long id) {
            return bookRepository.findById(id);
        }

        @Override
        public void deleteBook(Long id) {
            bookRepository.deleteById(id);
        }

        @Override
        public Book updateBook(Long id, Book updatedBook, MultipartFile imageFile) {
            return bookRepository.findById(id)
                    .map(book -> {
                        book.setTitle(updatedBook.getTitle());
                        book.setAuthor(updatedBook.getAuthor());
                        book.setPublisher(updatedBook.getPublisher());
                        book.setIsbn(updatedBook.getIsbn());
                        book.setCategory(updatedBook.getCategory());
                        book.setDescription(updatedBook.getDescription());
                        book.setPrice(updatedBook.getPrice());
                        book.setStock(updatedBook.getStock());
                        book.setPublicationDate(updatedBook.getPublicationDate());
                        book.setAvailable(updatedBook.isAvailable());

                        // ✅ THIS WAS MISSING
                        book.setPreviewText(updatedBook.getPreviewText());

                        if (imageFile != null && !imageFile.isEmpty()) {
                            FileUploadResponse upload = fileService.uploadFile(imageFile);
                            book.setCoverImageUrl(upload.getFileUrl());
                        }

                        return bookRepository.save(book);
                    })
                    .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        }


        @Override
        public Map<String, Integer> getBookStats() {
            List<Book> books = bookRepository.findAll();

            int total = books.size();
            int inStock = (int) books.stream().filter(book -> book.getStock() > 0).count();
            int outOfStock = total - inStock;

            Map<String, Integer> stats = new HashMap<>();
            stats.put("total", total);
            stats.put("inStock", inStock);
            stats.put("outOfStock", outOfStock);

            return stats;
        }


    }
