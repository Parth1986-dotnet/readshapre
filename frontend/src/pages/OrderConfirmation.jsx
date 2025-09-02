// src/pages/OrderConfirmation.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "../axiosConfig";

const STATUS_COLORS = {
  PENDING: "bg-yellow-200 text-yellow-800",
  PROCESSING: "bg-blue-200 text-blue-800",
  SHIPPED: "bg-purple-200 text-purple-800",
  DELIVERED: "bg-green-200 text-green-800",
  CANCELLED: "bg-red-200 text-red-800",
};

const STATUS_ORDER = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

function OrderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = useParams();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      if (order) return;

      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          alert("You must be logged in to view this page.");
          navigate("/login");
          return;
        }

        const res = await axios.get(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrder(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [order, orderId, navigate]);

  const handleReorder = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("You must login to reorder.");
        navigate("/login");
        return;
      }

      const payload = order.items.map((item) => ({
        bookId: item.bookId,
        quantity: item.quantity,
      }));

      const res = await axios.post("/api/orders/reorder", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Order placed successfully!");
      navigate(`/order-confirmation/${res.data.id}`, { state: { order: res.data } });
    } catch (err) {
      console.error(err);
      alert("Failed to reorder. See console for details.");
    }
  };

  if (loading) return <div className="text-center py-10">Loading order details...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!order) return null;

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const totalAmount = order.totalAmount || 0;

  const renderTimeline = () => (
    <div className="flex items-center justify-between my-6">
      {STATUS_ORDER.map((status, index) => {
        const completed = STATUS_ORDER.indexOf(order.status) >= index;
        return (
          <div key={status} className="flex-1 flex flex-col items-center relative">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                completed ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
              }`}
            >
              {completed ? "✓" : index + 1}
            </div>
            <span className="text-sm text-center">{status}</span>
            {index < STATUS_ORDER.length - 1 && (
              <div
                className={`absolute top-3 left-1/2 w-full h-1 z-0 ${
                  completed ? "bg-green-500" : "bg-gray-300"
                }`}
                style={{ transform: "translateX(50%)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="container max-w-4xl mx-auto p-6 mt-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-green-600">✅ Order Confirmed!</h2>
        <p className="mt-2 text-gray-700">Thank you for your purchase.</p>
        <p className="text-gray-500">
          Order Number: <strong>#{order.id}</strong>
        </p>
        <p>
          Status:{" "}
          <span
            className={`px-2 py-1 rounded ${STATUS_COLORS[order.status] || "bg-gray-200 text-gray-800"}`}
          >
            {order.status}
          </span>
        </p>
        <p className="text-gray-500">Order Date: {new Date(order.orderDate).toLocaleString()}</p>
        <p className="text-gray-500">Estimated Delivery: {estimatedDelivery.toDateString()}</p>
        <p className="text-gray-500">
          Total Paid: <strong>£{totalAmount.toFixed(2)}</strong>
        </p>
      </div>

      {/* Track Order Timeline */}
      {renderTimeline()}

      {/* Order Summary */}
      <div className="card shadow rounded-lg border border-gray-300 p-4">
        <h3 className="text-xl font-semibold mb-4">🛒 Order Summary</h3>
        {order.items && order.items.length > 0 ? (
          order.items.map((item) => (
            <div key={item.bookId} className="flex items-center border-b py-2 last:border-b-0">
              <img
                src={item.image || "https://via.placeholder.com/80x100"}
                alt={item.title}
                className="w-20 h-28 object-cover rounded mr-4"
              />
              <div className="flex-1">
                <p className="font-semibold">{item.title}</p>
                <p className="text-gray-500">Quantity: {item.quantity}</p>
                <p className="text-gray-700 font-semibold">£{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No items found.</p>
        )}

        {/* Total */}
        <div className="mt-4 pt-3 border-t flex justify-between text-lg font-semibold">
          <span>Total:</span>
          <span>£{totalAmount.toFixed(2)}</span>
        </div>

        {/* Customer Details */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-2">📦 Shipping Information</h4>
          <p>
            <strong>Name:</strong> {order.customerName}
          </p>
          <p>
            <strong>Address:</strong> {order.address}
          </p>
          <p>
            <strong>Postal Code:</strong> {order.postalCode}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mt-6 gap-4">
          <button className="btn btn-primary px-6 py-2" onClick={() => navigate("/")}>
            Back to Home
          </button>
          <button className="btn btn-outline px-6 py-2" onClick={handleReorder}>
            Reorder
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;
