import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

const STATUS_OPTIONS = ['', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_COLORS = {
  PENDING: '#FFA500',
  PROCESSING: '#1E90FF',
  SHIPPED: '#20B2AA',
  DELIVERED: '#32CD32',
  CANCELLED: '#FF4500',
};

// Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081',
  headers: { 'Content-Type': 'application/json' },
});
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function AllOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;
  const [filters, setFilters] = useState({ userEmail: '', status: '' });
  const [editableStatus, setEditableStatus] = useState({});
  const [savingStatus, setSavingStatus] = useState({});

  const fetchOrders = useCallback(
    async (pageNumber = 0, userEmail = '', status = '') => {
      setLoading(true);
      setError('');
      try {
        const params = { page: pageNumber, size: pageSize };
        if (userEmail) params.userEmail = userEmail;
        if (status) params.status = status;

        const response = await axiosInstance.get('/api/orders', { params });
        const data = response.data;

        setOrders(data.content || []);
        setTotalPages(data.totalPages || 1);
        setPage(data.number || pageNumber);

        const statusMap = {};
        (data.content || []).forEach((order) => {
          statusMap[order.id] = order.status || '';
        });
        setEditableStatus(statusMap);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    fetchOrders(page, filters.userEmail.trim(), filters.status);
  }, [fetchOrders, page, filters.userEmail, filters.status]);

  const handleStatusChange = (orderId, newStatus) => {
    setEditableStatus((prev) => ({ ...prev, [orderId]: newStatus }));
  };

  const handleSaveStatus = async (orderId) => {
    const newStatus = editableStatus[orderId];
    if (!newStatus) return;

    setSavingStatus((prev) => ({ ...prev, [orderId]: true }));

    try {
      await axiosInstance.put(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(page, filters.userEmail.trim(), filters.status);
    } catch (err) {
      alert(`Failed to update status for order ${orderId}: ${err.response?.data || err.message}`);
      console.error(err);
    } finally {
      setSavingStatus((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const goPrevPage = () => {
    if (page > 0) setPage(page - 1);
  };
  const goNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: 'auto' }}>
      <h1 style={{ marginBottom: 20 }}>All Orders</h1>

      {/* Filters */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by user email"
          value={filters.userEmail}
          onChange={(e) => setFilters((prev) => ({ ...prev, userEmail: e.target.value }))}
          style={{ flexGrow: 1, minWidth: 200, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          style={{ padding: 6, minWidth: 150, borderRadius: 4, border: '1px solid #ccc' }}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status || 'All Statuses'}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setPage(0);
            fetchOrders(0, filters.userEmail.trim(), filters.status);
          }}
          style={{ padding: '6px 12px', borderRadius: 4, border: 'none', backgroundColor: '#1E90FF', color: '#fff' }}
        >
          Search
        </button>
      </div>

      {/* Desktop Table */}
      <div className="desktop-table">
        <table
          border="1"
          cellPadding="8"
          cellSpacing="0"
          style={{ width: '100%', borderCollapse: 'collapse', borderRadius: 8, overflow: 'hidden' }}
        >
          <thead style={{ backgroundColor: '#f0f0f0' }}>
            <tr>
              <th>ID</th>
              <th>User Email</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Order Date</th>
              <th>Estimated Delivery</th>
              <th>Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const currentStatus = editableStatus[order.id] || '';
                const statusChanged = currentStatus !== order.status;
                return (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.userEmail}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: STATUS_COLORS[order.status] || '#ccc',
                          color: '#fff',
                          marginRight: 6,
                        }}
                      >
                        {order.status}
                      </span>
                      <select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{ minWidth: 120 }}
                      >
                        {STATUS_OPTIONS.map((statusOption) => (
                          <option key={statusOption} value={statusOption}>
                            {statusOption || 'Select Status'}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>£{order.totalAmount?.toFixed(2)}</td>
                    <td>{order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}</td>
                    <td>{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {(order.items || []).map((item, idx) => (
                          <li key={`${order.id}-${item.id ?? idx}`}>
                            {item.bookTitle} (Qty: {item.quantity})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <button
                        onClick={() => handleSaveStatus(order.id)}
                        disabled={!statusChanged || savingStatus[order.id]}
                        style={{ padding: '4px 8px' }}
                      >
                        {savingStatus[order.id] ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="mobile-cards" style={{ display: 'none' }}>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map((order) => {
            const currentStatus = editableStatus[order.id] || '';
            const statusChanged = currentStatus !== order.status;
            return (
              <div
                key={order.id}
                style={{
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 12,
                  backgroundColor: '#fff',
                }}
              >
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>User Email:</strong> {order.userEmail}</p>
                <div>
                  <strong>Status:</strong>{' '}
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: STATUS_COLORS[order.status] || '#ccc',
                      color: '#fff',
                      marginRight: 6,
                    }}
                  >
                    {order.status}
                  </span>
                  <select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={{ minWidth: 120 }}
                  >
                    {STATUS_OPTIONS.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption || 'Select Status'}
                      </option>
                    ))}
                  </select>
                </div>
                <p><strong>Total:</strong> £{order.totalAmount?.toFixed(2)}</p>
                <p><strong>Order Date:</strong> {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}</p>
                <p><strong>Estimated Delivery:</strong> {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'N/A'}</p>
                <div>
                  <strong>Items:</strong>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {(order.items || []).map((item, idx) => (
                      <li key={`${order.id}-${item.id ?? idx}`}>
                        {item.bookTitle} (Qty: {item.quantity})
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => handleSaveStatus(order.id)}
                  disabled={!statusChanged || savingStatus[order.id]}
                  style={{
                    padding: '6px 12px',
                    marginTop: 6,
                    backgroundColor: '#1E90FF',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                  }}
                >
                  {savingStatus[order.id] ? 'Saving...' : 'Save'}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        <button onClick={goPrevPage} disabled={page === 0}>Previous</button>
        <span>Page {page + 1} of {totalPages}</span>
        <button onClick={goNextPage} disabled={page >= totalPages - 1}>Next</button>
      </div>

      {/* Responsive CSS */}
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-table { display: none; }
            .mobile-cards { display: block; }
          }
        `}
      </style>
    </div>
  );
}

export default AllOrdersPage;
