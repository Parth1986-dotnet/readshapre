package com.itc.book_store.services.impl;

import com.itc.book_store.services.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendOrderConfirmation(String to, String subject, String htmlContent) {
        sendEmail(to, subject, htmlContent);
    }

    @Override
    public void sendOrderStatusUpdate(String to, String subject, String htmlContent) {
        sendEmail(to, subject, htmlContent);
    }

    @Override
    public void sendPasswordResetEmail(String to, String resetLink) {
        // Build subject + HTML template here
        String subject = "Reset Your Password - ReadSphere BookStore";

        String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2 style="color:#2d6cdf;">Password Reset Request</h2>

                    <p>You requested to reset your password.</p>

                    <p>Click the button below to set a new password:</p>

                    <a href="%s" 
                       style="display:inline-block; background:#2d6cdf; color:white;
                              padding:12px 24px; text-decoration:none; border-radius:6px;">
                        Reset Password
                    </a>

                    <p style="margin-top:20px;">
                        If you didn’t request this, ignore this email.
                    </p>

                    <br>
                    <p>Regards,<br>ReadSphere BookStore</p>
                </div>
                """.formatted(resetLink);

        sendEmail(to, subject, htmlContent);
    }

    private void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }

    }

    @Override
    public void sendWelcomeEmail(String to, String userName) {
        String subject = "Welcome to ReadSphere BookStore!";

        String htmlContent = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h2 style="color:#2d6cdf;">Welcome to ReadSphere BookStore, %s!</h2>

                <p>We're thrilled to have you on board.</p>
                <p>Enjoy exploring our collection of books and exclusive member benefits.</p>

                <br>
                <p>Happy Reading!<br><strong>The ReadSphere Team</strong></p>
            </div>
            """.formatted(userName);

        sendEmail(to, subject, htmlContent);
    }

    @Override
    public void sendLowStockWarning(String to, String bookTitle, int stock) {
        String subject = "⚠ Low Stock Warning: " + bookTitle;

        String body = """
                Dear Admin,
                
                The stock for the book "%s" is low.
                Current Stock: %d
                
                Please restock soon.
                
                Regards,
                ReadSphere Inventory System
                """.formatted(bookTitle, stock);

        sendPlainEmail(to, subject, body);
    }

    @Override
    public void sendOutOfStockAlert(String to, String bookTitle) {
        String subject = "❗ OUT OF STOCK: " + bookTitle;

        String body = """
                Dear Admin,
                
                The book "%s" is now OUT OF STOCK.
                
                Immediate action is required.
                
                Regards,
                ReadSphere Inventory System
                """.formatted(bookTitle);

        sendPlainEmail(to, subject, body);
    }

    // ---------- INTERNAL SHARED EMAIL METHOD ----------
    private void sendPlainEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }

}
