// BookServiceImpl.java
package com.itc.book_store.services.impl;

import com.itc.book_store.dto.FileUploadResponse;
import com.itc.book_store.entity.Book;
import com.itc.book_store.repository.BookRepository;
import com.itc.book_store.services.BookService;
import com.itc.book_store.services.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

import java.util.Optional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
    public class BookServiceImpl implements BookService {

    @Autowired
    private BookRepository bookRepository;
    @Autowired
    private final FileService fileService;


    @Override
    public Book createBook(String title,
                           String author,
                           String publisher,
                           String isbn,
                           String category,
                           String description,
                           double price,
                           int stock,
                           String publicationDateStr,
                           boolean available,
                           MultipartFile imageFile) {
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

                    if (imageFile != null && !imageFile.isEmpty()) {
                        FileUploadResponse upload = fileService.uploadFile(imageFile);
                        book.setCoverImageUrl(upload.getFileUrl());
                    }

                    return bookRepository.save(book);
                })
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
    }
}



