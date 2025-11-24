// src/App.js
import React from 'react';
import './axiosConfig';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import AddBook from './pages/AddBook';
import BookList from './pages/BookList';
import EditBook from './pages/EditBook';
import 'bootstrap/dist/css/bootstrap.min.css';

import AllBooksPage from './pages/AllBooksPage';

import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import AdminRoute from './components/AdminRoute';
import PrivateRoute from './components/PrivateRoute';
import Unauthorized from './components/Unauthorized';
import AdminUsers from './components/AdminUsers';

import { CartProvider } from './context/CartContext';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage'; // Correct import
import BookDetailsPage from './pages/BookDetailsPage';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderDetailsPage from "./pages/OrderDetailsPage";
import OrderManagement from "./pages/OrderManagement";
import AllOrdersPage from "./pages/AllOrdersPage"; // Import AllOrdersPage
import { NotificationProvider } from './context/NotificationProvider';
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
  <NotificationProvider>
    <CartProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Layout with nested routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<AllBooksPage />} /> {/* Show AllBooksPage at / */}
            <Route path="dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
            <Route path="add" element={<AddBook />} />
            <Route path="list" element={<BookList />} />
            <Route path="edit-book/:id" element={<EditBook />} />
            <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

            {/* Cart and Checkout Pages */}
            <Route path="cart" element={<CartPage />} />
            <Route path="all-books" element={<AllBooksPage />} />
            <Route path="books/:id" element={<BookDetailsPage />} />
            <Route path="OrderConfirmation" element={<OrderConfirmation />} />
            <Route path="my-orders" element={<MyOrdersPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="order-details" element={<OrderDetailsPage />} />
            <Route path="order-management" element={<OrderManagement />} />
            <Route path="/orders" element={<AllOrdersPage />} />

          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </CartProvider>
    </NotificationProvider>
  );
}

export default App;
