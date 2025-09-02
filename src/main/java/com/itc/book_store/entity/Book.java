package com.itc.book_store.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.math.BigDecimal; // ✅ added

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "author")
    private String author;

    @Column(name = "publisher")
    private String publisher;

    @Column(name = "isbn")
    private String isbn;

    @Column(name = "category")
    private String category;

    @Lob
    @Column(name = "description", nullable = false)
    private String description;

//    @Column(name = "price", nullable = false)
//    private double price;

    @Column(name = "price", nullable = false)
    //private Double price; // ✅ Changed from double
    private BigDecimal price;
    @Column(name = "stock", nullable = false)
    private int stock;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @Column(name = "publication_date")
    private LocalDate publicationDate;

    @Column(name = "available", nullable = false)
    private boolean available;

    


}
