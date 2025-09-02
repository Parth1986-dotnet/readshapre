import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axiosConfig'; // make sure this is your axios instance

function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'ROLE_USER', // default role
  });
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('/api/users/register', formData);
      navigate('/login'); // redirect after successful registration
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(to right, #e8f5e9, #c8e6c9)' }}
    >
      <div
        className="p-4 rounded shadow-lg bg-white"
        style={{ maxWidth: '400px', width: '100%' }}
      >
        <div className="text-center mb-3">
          <h3 className="text-success">BookStore</h3>
        </div>

        <div className="text-center mb-3">
          <h4 className="fw-bold">Create Account</h4>
          <p className="text-muted">Register to start shopping 📚</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            className="form-control mb-3"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
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

          {/* Optional role selection */}
          {/* <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="form-control mb-3"
          >
            <option value="ROLE_USER">User</option>
            <option value="ROLE_ADMIN">Admin</option>
          </select> */}

          <button type="submit" className="btn btn-success w-100">
            Register
          </button>
        </form>

        <div className="text-center mt-3">
          <Link to="/login" className="text-decoration-none text-primary">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
