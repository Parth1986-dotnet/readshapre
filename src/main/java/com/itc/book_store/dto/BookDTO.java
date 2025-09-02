package com.itc.book_store.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookDTO {

    private Long id;

    private String title;

    private String author;

    private String publisher;

    private String isbn;

    private String category;

    private String description;

    private BigDecimal price;

    private int stock;

    private String coverImageUrl;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate publicationDate;

    private boolean available;
}
