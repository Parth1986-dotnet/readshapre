package com.itc.book_store.services;

public interface EmailService {
    // ==== ORDER EMAILS ====
    void sendOrderConfirmation(String to, String subject, String htmlContent);
    void sendOrderStatusUpdate(String to, String subject, String htmlContent);

    // ==== USER EMAILS ====
    void sendPasswordResetEmail(String to, String resetLink);
    void sendWelcomeEmail(String to, String userName);

    // ==== INVENTORY EMAILS ====
    void sendLowStockWarning(String to, String bookTitle, int stock);
    void sendOutOfStockAlert(String to, String bookTitle);
}