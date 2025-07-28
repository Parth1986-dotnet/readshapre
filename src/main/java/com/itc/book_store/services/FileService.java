package com.itc.book_store.services;

import com.itc.book_store.dto.FileUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface FileService {
    FileUploadResponse uploadFile(MultipartFile file);
}

