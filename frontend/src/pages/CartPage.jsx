// src/pages/CartPage.jsx
import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

// ------------------- Cart Page -------------------//

function CartPage() {
  const { cartItems, removeFromCart, clearCart } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container mt-4">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty. <Link to="/">Browse books</Link>.</p>
      ) : (
        <>
          <table className="table table-bordered mt-3">
            <thead>
              <tr>
                <th>Title</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.quantity}</td>
                  <td>£{item.price.toFixed(2)}</td>
                  <td>£{(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => removeFromCart(item.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h4>Total: £{total.toFixed(2)}</h4>
          <div className="mt-3">
            <Link to="/checkout" className="btn btn-success me-2">Checkout</Link>
            <button className="btn btn-outline-danger" onClick={clearCart}>Clear Cart</button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
