import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { placeOrder } from "../context/OrderService";
import axios from "../axiosConfig";
import { useCart } from "../context/CartContext";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Helper to calculate total
const calculateTotal = (cartItems = []) =>
  cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const totalAmount = calculateTotal(cartItems);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (cartItems.length === 0 || totalAmount <= 0) {
      setMessage("Your cart is empty. Add some books before checkout.");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      // 1️⃣ Place order
      const orderPayload = cartItems.map(item => ({
        bookId: item.id,
        quantity: item.quantity || 1,
      }));

      const orderResponse = await placeOrder(orderPayload);

      if (!orderResponse?.order?.id || !orderResponse?.order?.totalAmount) {
        throw new Error("Invalid order response from server");
      }

      // 2️⃣ Create Stripe payment intent
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("User not authenticated");

      const { data: paymentIntent } = await axios.post(
        "/api/payments/intent",
        {
          amount: Math.round(orderResponse.order.totalAmount * 100),
          currency: "GBP",
          orderId: orderResponse.order.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!paymentIntent?.clientSecret) {
        throw new Error("Failed to create payment intent");
      }

      // 3️⃣ Confirm payment
      const card = elements.getElement(CardElement);
      const { error, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        { payment_method: { card } }
      );

      if (error) {
        setMessage(error.message);
        setIsError(true);
      } else if (confirmedPayment?.status === "succeeded") {
        setMessage("Payment successful! Order confirmed.");
        clearCart();
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to place order or process payment. See console.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>Checkout</h2>

      {cartItems.length > 0 ? (
        <div style={{ marginBottom: "20px" }}>
          <h3>Cart Summary</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Book</th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ccc" }}>Qty</th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ccc" }}>Price</th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ccc" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => {
                const price = Number(item.price) || 0;
                const quantity = Number(item.quantity) || 1;
                return (
                  <tr key={item.id}>
                    <td>{item.title || "Unnamed Book"}</td>
                    <td style={{ textAlign: "right" }}>{quantity}</td>
                    <td style={{ textAlign: "right" }}>£{price.toFixed(2)}</td>
                    <td style={{ textAlign: "right" }}>£{(price * quantity).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign: "right", fontWeight: "bold" }}>Total:</td>
                <td style={{ textAlign: "right", fontWeight: "bold" }}>£{totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p style={{ color: "gray" }}>Your cart is empty. Add some books to proceed with checkout.</p>
      )}

      <CardElement options={{ hidePostalCode: true }} style={{ marginBottom: "20px" }} />

      <button
        type="submit"
        disabled={!stripe || loading || cartItems.length === 0}
        style={{ marginTop: "20px", padding: "10px 20px", fontSize: "16px" }}
      >
        {loading
          ? "Processing..."
          : cartItems.length === 0
            ? "Cart is empty"
            : `Pay £${totalAmount.toFixed(2)}`}
      </button>

      {message && <p style={{ marginTop: "10px", color: isError ? "red" : "green" }}>{message}</p>}
    </form>
  );
};

const CheckoutPage = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default CheckoutPage;
