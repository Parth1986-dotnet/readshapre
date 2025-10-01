import React, { useEffect, useState, useRef } from "react";
import { BsBell, BsBoxArrowRight, BsCart, BsBoxArrowInRight, BsPersonPlus } from "react-icons/bs";
import { useNavigate, Link } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "../axiosConfig";

function Navbar() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef();

  // ✅ Fetch logged-in user profile using cookie
  useEffect(() => {
    axios.get("/api/users/profile", { withCredentials: true })
      .then(res => {
        setUserEmail(res.data.username);
        setIsAdmin(res.data.role === "ROLE_ADMIN");
      })
      .catch(() => {
        setUserEmail(null);
        setIsAdmin(false);
      });
  }, []);

  // WebSocket notifications (works after userEmail is set)
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

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true }); // ✅ clears cookie
    } catch (err) {
      console.warn("Logout failed:", err);
    }
    localStorage.removeItem("refreshToken");
    setUserEmail(null);
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
        {userEmail && <span className="me-3">👤 {userEmail}</span>}

        {/* Notifications */}
        {userEmail && (
          <div
            className="btn btn-outline-light btn-sm me-2 position-relative"
            onClick={() => setShowDropdown((prev) => !prev)}
            ref={dropdownRef}
          >
            <BsBell size={20} />
            {notifications.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {notifications.length}
              </span>
            )}

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
                    {notifications.slice().reverse().map((notif, index) => (
                      <div
                        key={index}
                        className={`border-bottom py-1 ${getStatusColor(notif.status)}`}
                        style={{ fontSize: "0.85rem", cursor: "pointer" }}
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.filter((_, i) => i !== notifications.length - 1 - index)
                          )
                        }
                      >
                        {notif.text} <br />
                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>
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

        {/* Cart */}
        {userEmail && (
          <Link to="/cart" className="btn btn-outline-light btn-sm me-2 position-relative">
            <BsCart size={20} />
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                {cartCount}
              </span>
            )}
          </Link>
        )}

        {/* Auth buttons */}
        {!userEmail ? (
          <>
            <button className="btn btn-outline-primary btn-sm me-2" onClick={() => navigate("/login")}>
              <BsBoxArrowInRight className="me-1" /> Login
            </button>
            <button className="btn btn-outline-success btn-sm" onClick={() => navigate("/register")}>
              <BsPersonPlus className="me-1" /> Register
            </button>
          </>
        ) : (
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
            <BsBoxArrowRight className="me-1" /> Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
