import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8081', // adjust to your backend port
  withCredentials: true, // ✅ ensures cookies (JWT) are sent with every request
});

// ✅ Response Interceptor to handle 401 + refresh token logic
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Call refresh-token endpoint (backend will set a new cookie)
        await axios.post(
          'http://localhost:8081/api/auth/refresh-token',
          { refreshToken: localStorage.getItem('refreshToken') },
          { withCredentials: true }
        );

        // ✅ Retry the original request after refreshing cookie
        return instance(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);

        // Clear refresh token from storage
        localStorage.removeItem('refreshToken');

        // Redirect to login page
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
