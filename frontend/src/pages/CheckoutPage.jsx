// src/pages/CheckoutPage.jsx
import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "../context/CartContext";
import axiosInstance from "../axiosConfig";
import { placeOrder } from "../context/OrderService";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// ------------------- Checkout Form -------------------
const CheckoutForm = ({ cartItems, total, clearCart }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [customerInfo, setCustomerInfo] = useState({ customerName: "", address: "", postalCode: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    if (!stripe || !elements) return;
    if (cartItems.length === 0) return setMessage("❌ Your cart is empty.");
    if (!customerInfo.customerName || !customerInfo.address || !customerInfo.postalCode)
      return setMessage("❌ Please fill in all customer details.");

    setIsProcessing(true);
    setMessage("");

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("You must be logged in to pay.");

      // 1️⃣ Place Order
      const orderPayload = cartItems.map((item) => ({
        bookId: item.id,
        quantity: item.quantity || 1,
      }));

      const orderResponse = await placeOrder(orderPayload);
      console.log("📦 Raw orderResponse:", orderResponse);

      // Handle both response shapes
      const order = orderResponse?.order || orderResponse;

      if (!order?.id || !order?.totalAmount) {
        throw new Error("Failed to create order.");
      }

      // 2️⃣ Create PaymentIntent
      const { data } = await axiosInstance.post(
        "/api/payments/intent",
        {
          amount: Math.round(order.totalAmount * 100),
          currency: "GBP",
          orderId: order.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { clientSecret } = data;

      // 3️⃣ Confirm Payment
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.customerName,
            address: { line1: customerInfo.address, postal_code: customerInfo.postalCode },
          },
        },
      });

      if (error) {
        setMessage(`❌ ${error.message}`);
      } else if (paymentIntent?.status === "succeeded") {
        setMessage("✅ Payment successful! Your order has been placed.");
        clearCart();
        // Optionally redirect to an order confirmation page
        // navigate("/orders/confirmation");
      } else {
        setMessage("❌ Payment failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setMessage(`❌ ${err.message || "Something went wrong."}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="row g-4">
      {/* Left Panel: Customer Details */}
      <div className="col-lg-7">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-4">🧾 Customer Details</h5>
            <div className="d-flex flex-column gap-3">
              <input
                type="text"
                name="customerName"
                placeholder="Full Name"
                value={customerInfo.customerName}
                onChange={(e) => setCustomerInfo({ ...customerInfo, customerName: e.target.value })}
                className="form-control"
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                className="form-control"
                required
              />
              <input
                type="text"
                name="postalCode"
                placeholder="Postal Code"
                value={customerInfo.postalCode}
                onChange={(e) => setCustomerInfo({ ...customerInfo, postalCode: e.target.value })}
                className="form-control"
                required
              />
              <div className="form-control p-2">
                <CardElement options={{ hidePostalCode: true }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Cart Summary */}
      <div className="col-lg-5">
        <div
          className="card shadow-sm sticky-top"
          style={{ top: "20px", maxHeight: "80vh", display: "flex", flexDirection: "column" }}
        >
          <div className="card-body d-flex flex-column flex-grow-1">
            <h5 className="card-title mb-3">🛒 Cart Summary</h5>

            {/* Scrollable cart list */}
            <ul
              className="list-group list-group-flush mb-3 flex-grow-1 overflow-auto"
              style={{ maxHeight: "calc(80vh - 120px)" }}
            >
              {cartItems.length === 0 ? (
                <li className="list-group-item text-muted">Your cart is empty.</li>
              ) : (
                cartItems.map((item) => (
                  <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                    {item.title} (x{item.quantity})
                    <span>£{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))
              )}
            </ul>

            {/* Total + Pay Button */}
            <div className="mt-auto text-end">
              <h5>Total: £{total.toFixed(2)}</h5>
              <button
                className="btn btn-primary btn-lg w-100 mt-3"
                onClick={handlePayment}
                disabled={isProcessing || cartItems.length === 0}
              >
                {isProcessing ? "Processing..." : `Pay £${total.toFixed(2)}`}
              </button>
              {message && (
                <div className={`mt-2 text-center ${message.startsWith("✅") ? "text-success" : "text-danger"}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------- Parent Checkout Page -------------------
const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Elements stripe={stripePromise}>
      <div className="container py-5">
        <h1 className="mb-5 text-center">Checkout</h1>
        <CheckoutForm cartItems={cartItems} total={total} clearCart={clearCart} />
      </div>
    </Elements>
  );
};

export default CheckoutPage;
