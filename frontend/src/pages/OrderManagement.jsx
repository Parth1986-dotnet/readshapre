import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Button,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "../axiosConfig";
import jwtDecode from "jwt-decode";
import debounce from "lodash.debounce";

const STATUS_OPTIONS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrderManagement() {
  const navigate = useNavigate();

  // States
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [snack, setSnack] = useState({ open: false, severity: "info", message: "" });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);

  const [filterStatus, setFilterStatus] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchEmail(value);
    }, 500),
    []
  );

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const params = { page, size: pageSize };
      if (filterStatus) params.status = filterStatus;
      if (searchEmail) params.userEmail = searchEmail;

      const res = await axios.get("/api/orders", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(res.data.content || []);
      setTotalOrders(res.data.totalElements || 0);
    } catch (error) {
      const status = error.response?.status;
      setFetchError(error.response?.data?.message || error.message || "Failed to fetch orders");

      if (status === 401 || status === 403) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterStatus, searchEmail, navigate]);

  // Admin check
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const roles = decoded.roles || [decoded.role];
      if (!roles.includes("ROLE_ADMIN")) {
        alert("Access denied: Admins only");
        navigate("/");
        return;
      }
    } catch (err) {
      console.error("Invalid token:", err);
      navigate("/login");
      return;
    }

    fetchOrders();
  }, [fetchOrders, navigate]);

  // Reset page on filter/search
  useEffect(() => {
    setPage(0);
  }, [filterStatus, searchEmail]);

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    const prevOrders = [...orders];
    const token = localStorage.getItem("accessToken");

    try {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      await axios.put(
        `/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnack({ open: true, severity: "success", message: "Order status updated" });
    } catch (err) {
      setOrders(prevOrders);
      setSnack({
        open: true,
        severity: "error",
        message: err.response?.data || "Failed to update status",
      });

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCloseSnack = () => setSnack((s) => ({ ...s, open: false }));

  const columns = [
    { field: "id", headerName: "Order ID", width: 100 },
    { field: "userEmail", headerName: "User Email", width: 220, flex: 1 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => {
        const row = params.row;
        const disabled = updatingOrderId === row.id;
        return (
          <Select
            size="small"
            value={row.status}
            onChange={(e) => handleUpdateStatus(row.id, e.target.value)}
            disabled={disabled}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        );
      },
    },
    {
      field: "orderDate",
      headerName: "Order Date",
      width: 180,
      valueGetter: (params) => (params.row.orderDate ? new Date(params.row.orderDate).toLocaleString() : ""),
    },
    {
      field: "totalAmount",
      headerName: "Total (£)",
      width: 120,
      valueGetter: (params) => params.row.totalAmount?.toFixed(2) || "",
      headerAlign: "right",
      align: "right",
    },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Admin — Order Management
      </Typography>

      <Box mb={2} display="flex" gap={2} alignItems="center" flexWrap="wrap">
        <TextField
          size="small"
          placeholder="Filter by user email"
          onChange={(e) => debouncedSearch(e.target.value)}
        />
        <Select
          size="small"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          displayEmpty
          style={{ minWidth: 150 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </Select>
        <Button variant="contained" onClick={fetchOrders} disabled={loading}>
          Refresh
        </Button>
        {loading && <CircularProgress size={24} />}
      </Box>

      {fetchError ? (
        <Alert severity="error">{fetchError}</Alert>
      ) : (
        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={orders}
            columns={columns}
            page={page}
            pageSize={pageSize}
            rowsPerPageOptions={[10, 25, 50]}
            pagination
            rowCount={totalOrders}
            paginationMode="server"
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newSize) => setPageSize(newSize)}
            getRowId={(row) => row.id}
            disableSelectionOnClick
          />
        </div>
      )}

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={handleCloseSnack}>
        <Alert severity={snack.severity} onClose={handleCloseSnack} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
