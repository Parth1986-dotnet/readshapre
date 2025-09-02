    package com.itc.book_store.services;

    import com.itc.book_store.entity.Order;

    public interface NotificationService {

        // Notify admin when a new order is placed
        void notifyAdminNewOrder(Order order);

        // Notify user when their order status changes
        void notifyUserOrderStatusChange(Order order);
    }
