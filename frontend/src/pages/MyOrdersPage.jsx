import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import jwtDecode from "jwt-decode";
import axiosConfig from "../axiosConfig"; // ✅ central axios instance

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch user's orders via /my
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosConfig.get("/api/orders/my");
        setOrders(res.data || []);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else if (err.response?.status === 403) {
          alert("Not authorized to view orders.");
          navigate("/");
        } else {
          console.error("Failed to fetch orders:", err);
        }
      }
    };

    fetchOrders();
  }, [navigate]);

  // ✅ Subscribe to WebSocket for real-time order updates
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error("Invalid token:", err);
      return;
    }

    const userEmail = decoded.sub; // ✅ reliable claim for email/username
    if (!userEmail) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8081/ws"),
      reconnectDelay: 5000,
      debug: (str) => console.log("[STOMP]", str),
      onConnect: () => {
        console.log("Connected to WebSocket ✅");
        const topic = `/topic/notifications/user/${encodeURIComponent(userEmail)}`;
        console.log("Subscribing to topic:", topic);

        client.subscribe(topic, (msg) => {
          if (!msg.body) return;
          const data = JSON.parse(msg.body);

          // Update order status in UI
          setOrders((prev) =>
            prev.map((order) =>
              order.id === data.orderId ? { ...order, status: data.status } : order
            )
          );
        });
      },
    });

    client.activate();
    return () => client.deactivate();
  }, []);

  // ✅ Badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return "badge bg-success";
      case "PENDING":
        return "badge bg-warning text-dark";
      case "PROCESSING":
        return "badge bg-info text-dark";
      case "SHIPPED":
        return "badge bg-primary";
      case "CANCELLED":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-semibold">🛒 No orders found.</h2>
        <button className="btn btn-primary mt-4" onClick={() => navigate("/")}>
          Browse Books
        </button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">📦 My Orders</h1>

      {orders.map((order) => (
        <div key={order.id} className="card p-4 mb-6 shadow rounded-lg border border-gray-300">
          <p>
            <strong>Order ID:</strong> #{order.id}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={getStatusBadge(order.status)}>{order.status}</span>
          </p>
          <p>
            <strong>Date:</strong> {new Date(order.orderDate).toLocaleString()}
          </p>
          <p>
            <strong>Total:</strong> £{order.totalAmount.toFixed(2)}
          </p>

          <div className="mt-4">
            <h2 className="font-semibold mb-2">Items:</h2>
            {order.items.map((item, idx) => (
              <div key={idx} className="border p-2 rounded mb-2">
                <p>
                  <strong>Book:</strong> {item.title}
                </p>
                <p>
                  <strong>Quantity:</strong> {item.quantity}
                </p>
                <p>
                  <strong>Price:</strong> £{item.price.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <button
            className="btn btn-sm btn-outline mt-4"
            onClick={() => navigate(`/orders/${order.id}`)}
          >
            View Details
          </button>
        </div>
      ))}
    </div>
  );
}

export default MyOrdersPage;
