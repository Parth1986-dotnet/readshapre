import axios from 'axios';

// ✅ Create instance
const instance = axios.create({
  baseURL: 'http://localhost:8081',
  withCredentials: true, // ensures cookies (JWT or refresh token) are sent
});

// ✅ Request Interceptor — attach accessToken to every request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor — handle 401 and refresh logic
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔄 Try refreshing token if 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('Missing refresh token');

        // Call refresh-token endpoint
        const res = await axios.post(
          'http://localhost:8081/api/auth/refresh-token',
          { refreshToken },
          { withCredentials: true }
        );

        // ✅ Save new tokens (if returned by backend)
        if (res.data?.accessToken) {
          localStorage.setItem('accessToken', res.data.accessToken);
        }
        if (res.data?.refreshToken) {
          localStorage.setItem('refreshToken', res.data.refreshToken);
        }

        // ✅ Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login'; // force re-login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
