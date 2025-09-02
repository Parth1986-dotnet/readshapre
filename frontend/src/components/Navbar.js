// src/components/Navbar.js
import React, { useEffect, useState, useRef } from "react";
import { BsBell, BsBoxArrowRight, BsCart, BsBoxArrowInRight, BsPersonPlus } from "react-icons/bs";
import { useNavigate, Link } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import jwtDecode from "jwt-decode";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const [notifications, setNotifications] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef();

  // Decode JWT to extract email + roles
  useEffect(() => {
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const email = decoded.email || decoded.sub || null;
      setUserEmail(email);
      const roles = decoded.roles || [];
      setIsAdmin(roles.includes("ROLE_ADMIN"));
    } catch (err) {
      console.error("Invalid token:", err);
    }
  }, [token]);

  // WebSocket notifications
  useEffect(() => {
    if (!userEmail) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8081/ws"),
      reconnectDelay: 5000,
      debug: (str) => console.log("[STOMP]", str),
      onConnect: () => {
        const topic = isAdmin
          ? "/topic/notifications/admins"
          : `/topic/notifications/user/${userEmail}`;

        console.log("Subscribing to topic:", topic);

        client.subscribe(topic, (msg) => {
          if (!msg.body) return;

          try {
            const data = JSON.parse(msg.body);
            const message = {
              text: `Order #${data.orderId} is now ${data.status}`,
              status: data.status,
              date: data.updatedAt || new Date().toLocaleString(),
            };
            setNotifications((prev) => [...prev, message]);
            console.log("Received notification:", message);
          } catch (err) {
            console.warn("Invalid message body:", msg.body);
          }
        });
      },
      onStompError: (frame) => console.error("STOMP error:", frame),
      onWebSocketError: (err) => console.error("WebSocket error:", err),
    });

    client.activate();
    return () => client.deactivate();
  }, [userEmail, isAdmin]);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(storedCart);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const getStatusColor = (status) => {
    if (status === "DELIVERED") return "text-success";
    if (status === "PENDING") return "text-warning";
    return "text-secondary";
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      <span className="navbar-brand">📚 Read Sphere</span>

      <div className="ms-auto text-light d-flex align-items-center">
        {/* Show user email if logged in */}
        {userEmail && <span className="me-3">👤 {userEmail}</span>}

        {/* Notifications - only show if logged in */}
        {userEmail && (
          <div
            className="btn btn-outline-light btn-sm me-2 position-relative"
            onClick={() => setShowDropdown((prev) => !prev)}
            ref={dropdownRef}
          >
            <div className="position-relative">
              <BsBell size={20} />
              {notifications.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {notifications.length}
                </span>
              )}
            </div>

            {showDropdown && (
              <div
                className="position-absolute end-0 mt-2 p-2 bg-light text-dark rounded shadow"
                style={{ width: "300px", zIndex: 1000 }}
              >
                {notifications.length === 0 ? (
                  <div className="text-center text-muted">No notifications</div>
                ) : (
                  <>
                    <div className="d-flex justify-content-end mb-1">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setNotifications([])}
                      >
                        Mark all as read
                      </button>
                    </div>
                    {notifications
                      .slice()
                      .reverse()
                      .map((notif, index) => (
                        <div
                          key={index}
                          className={`border-bottom py-1 ${getStatusColor(
                            notif.status
                          )}`}
                          style={{ fontSize: "0.85rem", cursor: "pointer" }}
                          onClick={() =>
                            setNotifications((prev) =>
                              prev.filter(
                                (_, i) =>
                                  i !== notifications.length - 1 - index
                              )
                            )
                          }
                        >
                          {notif.text} <br />
                          <span
                            className="text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {notif.date}
                          </span>
                        </div>
                      ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Shopping Cart */}
        {userEmail && (
          <Link
            to="/cart"
            className="btn btn-outline-light btn-sm me-2 position-relative"
          >
            <div className="position-relative">
              <BsCart size={20} />
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>
        )}

        {/* Show Login + Register buttons if NOT logged in */}
        {!userEmail ? (
          <>
            <button
              className="btn btn-outline-primary btn-sm me-2"
              onClick={() => navigate("/login")}
            >
              <BsBoxArrowInRight className="me-1" /> Login
            </button>
            <button
              className="btn btn-outline-success btn-sm"
              onClick={() => navigate("/register")}
            >
              <BsPersonPlus className="me-1" /> Register
            </button>
          </>
        ) : (
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleLogout}
          >
            <BsBoxArrowRight className="me-1" /> Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
