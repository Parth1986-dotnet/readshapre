package com.itc.book_store.controller;

import com.itc.book_store.services.NotificationServiceImpl;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;


@RestController
public class NotificationController {

    private final NotificationServiceImpl notificationService;

    public NotificationController(NotificationServiceImpl notificationService) {
        this.notificationService = notificationService;
    }

    // SSE endpoint
    @GetMapping(value = "/api/notifications/orders", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamOrders() {
        return notificationService.getOrderSink().asFlux();
    }
}