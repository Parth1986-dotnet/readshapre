import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosConfig";

function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post("/api/auth/reset-password", {
        token,
        newPassword: password,
      });

      setMsg("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      setMsg(err.response?.data || "Invalid or expired token");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h2>Reset Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          className="form-control mt-3"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn btn-success w-100 mt-3">
          Reset Password
        </button>
      </form>

      {msg && <p className="mt-3 text-info">{msg}</p>}
    </div>
  );
}

export default ResetPassword;
