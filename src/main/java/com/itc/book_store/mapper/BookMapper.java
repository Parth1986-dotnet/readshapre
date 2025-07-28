package com.itc.book_store.mapper;

import com.itc.book_store.dto.BookDTO;
import com.itc.book_store.entity.Book;

public class BookMapper {

    public static BookDTO toDTO(Book book) {
        if (book == null) {
            return null;
        }

        BookDTO dto = new BookDTO();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setPublisher(book.getPublisher());
        dto.setIsbn(book.getIsbn());
        dto.setCategory(book.getCategory());
        dto.setDescription(book.getDescription());
        dto.setPrice(book.getPrice());
        dto.setStock(book.getStock());
        dto.setCoverImageUrl(book.getCoverImageUrl());
        dto.setPublicationDate(book.getPublicationDate());
        dto.setAvailable(book.isAvailable());
        return dto;
    }

    public static Book toEntity(BookDTO dto) {
        if (dto == null) {
            return null;
        }

        Book book = new Book();
        book.setId(dto.getId());
        book.setTitle(dto.getTitle());
        book.setAuthor(dto.getAuthor());
        book.setPublisher(dto.getPublisher());
        book.setIsbn(dto.getIsbn());
        book.setCategory(dto.getCategory());
        book.setDescription(dto.getDescription());
        book.setPrice(dto.getPrice());
        book.setStock(dto.getStock());
        book.setCoverImageUrl(dto.getCoverImageUrl());
        book.setPublicationDate(dto.getPublicationDate());
        book.setAvailable(dto.isAvailable());
        return book;
    }
}
