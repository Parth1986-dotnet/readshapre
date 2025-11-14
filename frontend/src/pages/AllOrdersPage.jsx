import React, { useEffect, useState, useCallback } from 'react';
import axiosConfig from '../axiosConfig';

const STATUS_OPTIONS = ['', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STATUS_COLORS = {
  PENDING: '#FFA500',
  PROCESSING: '#1E90FF',
  SHIPPED: '#20B2AA',
  DELIVERED: '#32CD32',
  CANCELLED: '#FF4500',
};

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
  const [userRole, setUserRole] = useState('');

  // ✅ Fetch logged-in user's profile (to check if admin or user)
  const fetchProfile = async () => {
    try {
      const res = await axiosConfig.get('/api/users/profile', { withCredentials: true });
      setUserRole(res.data.role); // e.g. ROLE_USER or ROLE_ADMIN
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
    }
  };

  // ✅ Fetch orders dynamically based on role
  const fetchOrders = useCallback(
    async (pageNumber = 0, userEmail = '', status = '') => {
      setLoading(true);
      setError('');

      try {
        let response;

        if (userRole === 'ROLE_ADMIN') {
          // Admin can view all orders with pagination/filter
          const params = { page: pageNumber, size: pageSize };
          if (userEmail) params.userEmail = userEmail;
          if (status) params.status = status;

          response = await axiosConfig.get('/api/orders', {
            params,
            withCredentials: true,
          });

          const data = response.data;
          setOrders(data.content || []);
          setTotalPages(data.totalPages || 1);
          setPage(data.number || pageNumber);
        } else if (userRole === 'ROLE_USER') {
          // Normal user → only their own orders
          response = await axiosConfig.get('/api/orders/my', {
            withCredentials: true,
          });
          setOrders(response.data || []);
          setTotalPages(1);
          setPage(0);
        }

        // Map editable statuses
        const statusMap = {};
        (response.data.content || response.data || []).forEach(order => {
          statusMap[order.id] = order.status || '';
        });
        setEditableStatus(statusMap);

      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    },
    [pageSize, userRole]
  );

  useEffect(() => {
    fetchProfile(); // get user role on mount
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchOrders(page, filters.userEmail.trim(), filters.status);
    }
  }, [userRole, fetchOrders, page, filters.userEmail, filters.status]);

  const handleStatusChange = (orderId, newStatus) => {
    setEditableStatus(prev => ({ ...prev, [orderId]: newStatus }));
  };

  const handleSaveStatus = async (orderId) => {
    const newStatus = editableStatus[orderId];
    if (!newStatus) return;
    setSavingStatus(prev => ({ ...prev, [orderId]: true }));

    try {
      await axiosConfig.put(`/api/orders/${orderId}/status`, { status: newStatus }, {
        withCredentials: true,
      });
      fetchOrders(page, filters.userEmail.trim(), filters.status);
    } catch (err) {
      alert(`Failed to update status for order ${orderId}: ${err.response?.data || err.message}`);
    } finally {
      setSavingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const goPrevPage = () => page > 0 && setPage(page - 1);
  const goNextPage = () => page < totalPages - 1 && setPage(page + 1);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: 'auto' }}>
      <h1>{userRole === 'ROLE_ADMIN' ? 'All Orders (Admin)' : 'My Orders'}</h1>

      {/* Filters visible only to admin */}
      {userRole === 'ROLE_ADMIN' && (
        <div style={{ marginBottom: '1rem', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by user email"
            value={filters.userEmail}
            onChange={(e) => setFilters(prev => ({ ...prev, userEmail: e.target.value }))}
            style={{ flexGrow: 1, minWidth: 200 }}
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            style={{ minWidth: 150 }}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status || 'All Statuses'}
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchOrders(0, filters.userEmail.trim(), filters.status)}
            style={{ padding: '6px 12px', backgroundColor: '#1E90FF', color: '#fff', border: 'none', borderRadius: 4 }}
          >
            Search
          </button>
        </div>
      )}

      {/* Orders Table */}
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>User Email</th>
            <th>Status</th>
            <th>Total</th>
            <th>Order Date</th>
            <th>Items</th>
            {userRole === 'ROLE_ADMIN' && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr><td colSpan="7" className="text-center">No orders found</td></tr>
          ) : (
            orders.map(order => {
              const currentStatus = editableStatus[order.id] || '';
              const statusChanged = currentStatus !== order.status;

              return (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.userEmail}</td>
                  <td>
                    <span style={{
                      backgroundColor: STATUS_COLORS[order.status] || '#ccc',
                      color: '#fff', padding: '2px 6px', borderRadius: 4, marginRight: 6
                    }}>
                      {order.status}
                    </span>
                    {userRole === 'ROLE_ADMIN' && (
                      <select
                        value={currentStatus}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        style={{ minWidth: 120 }}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || 'Select Status'}</option>)}
                      </select>
                    )}
                  </td>
                  <td>£{order.totalAmount?.toFixed(2)}</td>
                  <td>{order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}</td>
                  <td>
                    <ul>
                      {(order.items || []).map((item, i) => (
                        <li key={i}>{item.bookTitle} (x{item.quantity})</li>
                      ))}
                    </ul>
                  </td>
                  {userRole === 'ROLE_ADMIN' && (
                    <td>
                      <button
                        disabled={!statusChanged || savingStatus[order.id]}
                        onClick={() => handleSaveStatus(order.id)}
                      >
                        {savingStatus[order.id] ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination (admins only) */}
      {userRole === 'ROLE_ADMIN' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
          <button onClick={goPrevPage} disabled={page === 0}>Previous</button>
          <span>Page {page + 1} of {totalPages}</span>
          <button onClick={goNextPage} disabled={page >= totalPages - 1}>Next</button>
        </div>
      )}
    </div>
  );
}

export default AllOrdersPage;
