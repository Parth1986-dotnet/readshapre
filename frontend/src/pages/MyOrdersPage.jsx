import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import jwtDecode from "jwt-decode";

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  // Fetch user's orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch("http://localhost:8081/api/orders/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        } else if (res.status === 401) {
          navigate("/login");
        } else {
          console.error("Failed to fetch orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrders();
  }, [navigate]);

  // Subscribe to WebSocket notifications for order status updates
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

    const userEmail = decoded.email || decoded.sub;
    if (!userEmail) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8081/ws"),
      reconnectDelay: 5000,
      debug: (str) => console.log("[STOMP]", str),
      onConnect: () => {
        console.log("Connected to WebSocket");
        client.subscribe(`/topic/notifications/${userEmail}`, (msg) => {
          if (!msg.body) return;
          const data = JSON.parse(msg.body);
          console.log("Received notification:", data);

          // Update order status in state
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

  // Determine badge color based on status
  const getStatusBadge = (status) => {
    if (status === "DELIVERED") return "badge bg-success";
    if (status === "PLACED") return "badge bg-warning";
    return "badge bg-secondary";
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
        <div
          key={order.id}
          className="card p-4 mb-6 shadow rounded-lg border border-gray-300"
        >
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
            onClick={() => {
              if (order.status === "PLACED") {
                navigate(`/orders/${order.id}`);
              } else {
                alert(
                  "Order is not placed yet. You can only view details for placed orders."
                );
              }
            }}
          >
            View Details
          </button>
        </div>
      ))}
    </div>
  );
}

export default MyOrdersPage;
