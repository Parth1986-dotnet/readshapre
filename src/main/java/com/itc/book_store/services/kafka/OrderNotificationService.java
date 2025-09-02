package com.itc.book_store.services.kafka;

import com.itc.book_store.dto.kafka.OrderNotification;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public OrderNotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Send notification to a specific user
    public void notifyUser(String userEmail, OrderNotification notification) {
        System.out.println("Sending notification to user " + userEmail + ": " + notification.getMessage());
        messagingTemplate.convertAndSend(
                "/topic/notifications/user/" + userEmail,
                notification
        );
    }

    // Send notification to all admins
    public void notifyAdmins(OrderNotification notification) {
        System.out.println("Sending notification to admins: " + notification.getMessage());
        messagingTemplate.convertAndSend("/topic/notifications/admins", notification);
    }
}
