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
        FileUploadResponse resp = new FileUploadResponse();
        try {
            String datePath = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
            String key = datePath + "/" + file.getOriginalFilename();

            ObjectMetadata meta = new ObjectMetadata();
            meta.setContentLength(file.getSize());
            meta.setContentType(file.getContentType());

            s3Client.putObject(bucketName, key, file.getInputStream(), meta);

            String url = s3Client.getUrl(bucketName, key).toString();

            resp.setFilePath(key);
            resp.setFileUrl(url);
            resp.setUploadedAt(LocalDateTime.now());

            return resp;
        } catch (IOException ex) {
            log.error("File upload failed: {}", ex.getMessage());
            throw new RuntimeException("Failed to upload file", ex);
        }
    }
}

