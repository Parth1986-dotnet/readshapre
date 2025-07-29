package com.itc.book_store.services.impl;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.itc.book_store.dto.FileUploadResponse;
import com.itc.book_store.services.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final AmazonS3 s3Client;

    @Value("${aws.s3.bucketName}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    @Override
    public FileUploadResponse uploadFile(MultipartFile file) {
        // ✅ Validation: null or empty
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("❌ File is empty or missing.");
        }

        // ✅ Validation: allowed types
        String contentType = file.getContentType();
        if (!("image/jpeg".equals(contentType) || "image/png".equals(contentType))) {
            throw new IllegalArgumentException("❌ Only JPG and PNG images are allowed.");
        }

        // ✅ Validation: file size (max 2MB)
        long maxSize = 2 * 1024 * 1024; // 2MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("❌ File size exceeds 2MB limit.");
        }

        FileUploadResponse resp = new FileUploadResponse();

        try {
            // ✅ Sanitize file name and build unique S3 key
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf('.')) : "";
            String sanitizedFilename = System.currentTimeMillis() + "_" + java.util.UUID.randomUUID() + extension;

            String datePath = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
            String key = datePath + "/" + sanitizedFilename;

            // ✅ Set metadata
            ObjectMetadata meta = new ObjectMetadata();
            meta.setContentLength(file.getSize());
            meta.setContentType(contentType);

            // ✅ Upload to S3
            s3Client.putObject(bucketName, key, file.getInputStream(), meta);

            String url = s3Client.getUrl(bucketName, key).toString();

            // ✅ Build response
            resp.setFilePath(key);
            resp.setFileUrl(url);
            resp.setUploadedAt(LocalDateTime.now());

            return resp;

        } catch (IOException ex) {
            log.error("❌ File upload failed: {}", ex.getMessage());
            throw new RuntimeException("Failed to upload file", ex);
        }
    }

}

