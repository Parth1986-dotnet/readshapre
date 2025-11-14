import React, { createContext, useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const clientRef = useRef(null);

  const userEmail = localStorage.getItem("userEmail");
  const isAdmin = localStorage.getItem("role") === "ROLE_ADMIN";

  useEffect(() => {
    if (!userEmail) return;
    if (clientRef.current) return; // Prevent duplicate connection

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8081/ws", null, {
        withCredentials: true, // ✅ ensures JWT cookies are sent
      }),
      reconnectDelay: 5000,
      debug: (str) => console.log("[STOMP]", str),
      onConnect: () => {
        const topic = isAdmin
          ? "/topic/notifications/admins"
          : `/topic/notifications/user/${userEmail}`;

        console.log("✅ Connected and subscribing to:", topic);

        client.subscribe(topic, (msg) => {
          if (!msg.body) return;
          try {
            const data = JSON.parse(msg.body);
            setNotifications((prev) => [
              ...prev,
              {
                id: Date.now(),
                text: `Order #${data.orderId} is now ${data.status}`,
                status: data.status,
                date: data.updatedAt || new Date().toLocaleString(),
              },
            ]);
          } catch (err) {
            console.warn("Invalid message:", msg.body);
          }
        });
      },
      onStompError: (frame) => console.error("STOMP error:", frame),
      onWebSocketError: (err) => console.error("WebSocket error:", err),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      console.log("🧹 Disconnecting WebSocket...");
      client.deactivate();
      clientRef.current = null;
    };
  }, [userEmail, isAdmin]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
