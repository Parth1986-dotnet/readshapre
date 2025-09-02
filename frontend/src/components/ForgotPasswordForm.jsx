import React, { useState } from 'react';
import axios from 'axios'; // ✅ Add this import

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      alert(response.data); // optional: show server message
    } catch (error) {
      console.error('Error sending reset link:', error);
      alert('Something went wrong.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container mt-4" style={{ maxWidth: 400 }}>
      <h2>Forgot Password</h2>
      <input
        type="email"
        placeholder="Enter your email"
        className="form-control my-3"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-primary w-100">Send Reset Link</button>
    </form>
  );
}

export default ForgotPasswordForm; // ✅ Make sure it's exported properly
