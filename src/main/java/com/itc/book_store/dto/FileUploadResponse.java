package com.itc.book_store.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FileUploadResponse {
    private String filePath;
    private String fileUrl;
    private LocalDateTime uploadedAt;

}
