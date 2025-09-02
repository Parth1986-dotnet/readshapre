import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const res = await fetch(`http://localhost:8081/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else if (res.status === 403) {
          setError("You are not authorized to view this order.");
        } else if (res.status === 404) {
          setError("Order not found.");
        } else {
          setError("Failed to fetch order details.");
        }
      } catch (err) {
        setError("An error occurred while fetching order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <div className="text-center p-10">Loading order details...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-semibold text-red-500">❌ {error}</h2>
        <button className="btn btn-primary mt-4" onClick={() => navigate("/my-orders")}>
          Back to My Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return null; // Just in case
  }

  return (
    <div className="container max-w-3xl mx-auto p-6 mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Order Details - #{order.orderId}</h1>

      <div className="card p-4 mb-4">
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
        <p><strong>Email:</strong> {order.userEmail || "N/A"}</p>
        <p><strong>Estimated Delivery:</strong> {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : "N/A"}</p>
      </div>

      <div>
        <h2 className="h4 mt-4 mb-2">📚 Items:</h2>
        {order.items.map((item, idx) => (
          <div key={idx} className="border p-3 rounded mb-2">
            <p><strong>Title:</strong> {item.title}</p>
            <p><strong>Quantity:</strong> {item.quantity}</p>
            <p><strong>Price:</strong> £{item.price.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="text-end fw-bold fs-5 mt-4">
        Total: £{order.totalAmount.toFixed(2)}
      </div>

      <div className="d-flex justify-content-between pt-4">
        <button className="btn btn-outline-primary" onClick={() => navigate("/")}>
          🏠 Continue Shopping
        </button>
        <button className="btn btn-primary" onClick={() => navigate("/my-orders")}>
          📦 Back to My Orders
        </button>
      </div>
    </div>
  );
}

export default OrderDetailsPage;
