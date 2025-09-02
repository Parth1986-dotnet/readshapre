import React, { useEffect, useState } from 'react';
import axiosConfig from '../axiosConfig'; // Fixed import spelling

const roles = ['ROLE_USER', 'ROLE_ADMIN'];

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editedRoles, setEditedRoles] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Create user state
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'ROLE_USER',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchUsers = async () => {
    const token = localStorage.getItem('accessToken');
    setLoading(true);
    try {
      const res = await axiosConfig.get(`/api/admin/roles/users?search=${searchTerm}&page=0&size=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (Array.isArray(res.data)) {
        setUsers(res.data);
        setFilteredUsers(res.data);
      } else {
        setError('Unexpected response format');
      }
    } catch (error) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectChange = (userId, newRole) => {
    setEditedRoles(prev => ({ ...prev, [userId]: newRole }));
  };

  const handleUpdateClick = (userId) => {
    const newRole = editedRoles[userId];
    if (!newRole) return;

    const token = localStorage.getItem('accessToken');
    axiosConfig.put(`/api/admin/roles/users/${userId}/role`, { role: newRole }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(() => {
        const updatedUsers = users.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        );
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        setEditedRoles(prev => ({ ...prev, [userId]: undefined }));
        alert('Role updated successfully!');
      })
      .catch(() => {
        alert('Failed to update role');
      });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = users.filter(
      u =>
        u.username.toLowerCase().includes(value) ||
        u.email.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');

    const token = localStorage.getItem('accessToken');

    try {
      await axiosConfig.post('/api/users/register', newUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('User created successfully!');
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'ROLE_USER',
      });

      await fetchUsers();
    } catch (error) {
      setCreateError(error.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>Manage Users</h2>

      {/* ✅ Create New User Form */}
      <div className="mb-4 p-3 border rounded bg-light">
        <h4>Create New User</h4>
        {createError && <div className="alert alert-danger">{createError}</div>}
        <form onSubmit={handleCreateUser}>
          <div className="row g-2">
            <div className="col-md-3">
              <input
                type="text"
                name="username"
                value={newUser.username}
                onChange={handleNewUserChange}
                placeholder="Username"
                required
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleNewUserChange}
                placeholder="Email"
                required
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <input
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleNewUserChange}
                placeholder="Password"
                required
                className="form-control"
              />
            </div>
            <div className="col-md-2">
              <select
                name="role"
                value={newUser.role}
                onChange={handleNewUserChange}
                className="form-select"
              >
                {roles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="col-md-1 d-grid">
              <button type="submit" className="btn btn-success" disabled={creating}>
                {creating ? '...' : 'Add'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 🔍 Search bar */}
      <input
        type="text"
        placeholder="Search by username or email..."
        className="form-control w-50 my-3"
        value={searchTerm}
        onChange={handleSearch}
      />

      {/* 📋 Table */}
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.length > 0 ? (
            currentUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    className="form-select"
                    value={editedRoles[user.id] || user.role}
                    onChange={e => handleSelectChange(user.id, e.target.value)}
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={!editedRoles[user.id] || editedRoles[user.id] === user.role}
                    onClick={() => handleUpdateClick(user.id)}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">No users found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            {[...Array(totalPages).keys()].map(num => (
              <li key={num} className={`page-item ${currentPage === num + 1 ? 'active' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(num + 1)}
                >
                  {num + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

export default AdminUsers;
