// src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from "react";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axiosConfig from "../axiosConfig";
import { placeOrder } from "../context/OrderService";
import { useCart } from "../context/CartContext";
import { FaLock, FaCreditCard, FaTruck } from "react-icons/fa";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🧾 Customer Details
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // 🚚 Estimated delivery date (+5 days)
  const [deliveryDate, setDeliveryDate] = useState("");

  useEffect(() => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    const formatted = date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    setDeliveryDate(formatted);
  }, []);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (!name || !address || !city || !postalCode) {
      setMessage("⚠️ Please fill in your shipping details before payment.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const orderPayload = {
        items: cartItems.map((item) => ({
          bookId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: `${name}, ${address}, ${city}, ${postalCode}`,
        estimatedDelivery: deliveryDate,
      };

      const orderResponse = await placeOrder(orderPayload);
      const order = orderResponse.order || orderResponse;

      const { data: paymentIntent } = await axiosConfig.post(
        "/api/payments/intent",
        {
          amount: Math.round(order.totalAmount * 100),
          currency: "GBP",
          orderId: order.id,
        },
        { withCredentials: true }
      );

      const { error, paymentIntent: confirmedPayment } =
        await stripe.confirmCardPayment(paymentIntent.clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: { name },
          },
        });

      if (error) {
        setMessage(`❌ ${error.message}`);
      } else if (confirmedPayment.status === "succeeded") {
        setMessage(
          `✅ Payment successful! Your order will arrive by ${deliveryDate}.`
        );
        clearCart();
      } else {
        setMessage("❌ Payment failed. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
        padding: "40px 0",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "rgba(255, 255, 255, 0.98)",
          borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          padding: "35px",
          width: "450px",
          maxWidth: "90%",
        }}
      >
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <FaCreditCard size={40} color="#2a5298" />
          <h3 style={{ color: "#2a5298", marginTop: "10px", fontWeight: "600" }}>
            Checkout
          </h3>
          <p style={{ fontSize: "14px", color: "#555" }}>
            Complete your purchase and get it delivered by{" "}
            <b>{deliveryDate}</b>.
          </p>
        </div>

        {/* SHIPPING INFO */}
        <h5 style={{ color: "#2a5298", marginBottom: "10px" }}>Shipping Info</h5>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Postal Code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          required
          style={inputStyle}
        />

        {/* PAYMENT */}
        <h5 style={{ color: "#2a5298", marginTop: "20px" }}>Payment Method</h5>
        <div
          style={{
            backgroundColor: "#f9f9f9",
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "12px 15px",
            marginBottom: "20px",
          }}
        >
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#32325d",
                  "::placeholder": { color: "#aab7c4" },
                },
                invalid: { color: "#fa755a" },
              },
              hidePostalCode: true,
            }}
          />
        </div>

        {/* ORDER SUMMARY */}
        <div
          style={{
            background: "#eef3fb",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "15px",
            }}
          >
            <span>Subtotal:</span>
            <span>£{totalAmount.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "5px",
              fontSize: "15px",
            }}
          >
            <span>Shipping:</span>
            <span>Free 🚚</span>
          </div>
          <hr />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "600",
              color: "#2a5298",
              fontSize: "17px",
            }}
          >
            <span>Total:</span>
            <span>£{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background:
              "linear-gradient(90deg, #2a5298 0%, #1e3c72 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "14px",
            fontSize: "17px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.opacity = 0.85)}
          onMouseLeave={(e) => (e.target.style.opacity = 1)}
        >
          {loading ? "Processing..." : `Pay £${totalAmount.toFixed(2)}`}
        </button>

        {message && (
          <p
            style={{
              marginTop: "15px",
              textAlign: "center",
              color: message.startsWith("✅") ? "green" : "red",
              fontWeight: "500",
            }}
          >
            {message}
          </p>
        )}

        {/* FOOTER */}
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            color: "#666",
            fontSize: "13px",
          }}
        >
          <FaLock size={12} /> Payments secured by <b>Stripe</b> |{" "}
          <FaTruck size={12} /> Delivery in 5 days
        </div>
      </form>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  marginBottom: "10px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
};

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
