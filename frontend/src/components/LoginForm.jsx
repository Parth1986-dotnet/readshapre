import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axiosConfig'; // Use your configured axios instance

function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const getRoleFromToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload.role || (payload.roles && payload.roles[0]) || null;
    } catch (err) {
      console.error('Token parse error:', err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const res = await axios.post('/api/auth/login', formData);

      const { accessToken, refreshToken } = res.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      const role = getRoleFromToken(accessToken);
      if (role === 'ROLE_ADMIN' || role === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Login failed';
      setError(message);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(to right, #e8f5e9, #c8e6c9)' }}
    >
      <div className="p-4 rounded shadow-lg bg-white" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-3">
          <h3 className="text-success">BookStore</h3>
        </div>

        <div className="text-center mb-3">
          <h4 className="fw-bold">Welcome Back!</h4>
          <p className="text-muted">Login to continue shopping 📚</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            className="form-control mb-3"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            className="form-control mb-3"
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn btn-success w-100">
            Login
          </button>
        </form>

        <div className="text-center mt-3">
          <Link to="/register" className="text-decoration-none text-primary">
            Don't have an account? Register
          </Link>
          <br />
          <Link to="/forgot-password" className="text-decoration-none text-primary">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
