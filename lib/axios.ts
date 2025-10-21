import axios from 'axios';
import { logoutAction } from '@/app/(auth)/login/actions';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', // backend API
  withCredentials: true, // if you use cookies
});

export const setHedersAuth = (token?: string) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

// ✅ Add request interceptor (attach token)
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ✅ Handle expired token globally

// Flag to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // console.log('%c❌ [API Error]', 'color: red; font-weight: bold;', error);

    const { refreshToken, setAccessToken, setRefreshToken, setHasPin, setIsVerified } =
      useAuthStore.getState();
    const originalRequest = error.config;

    // --- Handle access token expiration ---
    if (
      error.response?.status === 401 &&
      error.response?.data?.message === 'Invalid or expired token' &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            // ✅ Make sure the retried request uses new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        if (!refreshToken) {
          throw new Error('No refresh token stored');
        }

        // 🔥 Call refresh endpoint
        const { data } = await api.post('/v1/auth/refresh', {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;

        // ✅ Update defaults and store
        setHedersAuth(newAccessToken);
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);

        processQueue(null, newAccessToken);
        isRefreshing = false;

        // ✅ Important: update retried request with new token
        originalRequest._retry = true;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err: any) {
        processQueue(err, null);
        isRefreshing = false;

        // Refresh token expired → log out
        setAccessToken(null);
        setRefreshToken(null);
        setHasPin(false);
        setIsVerified(false);
        await logoutAction();

        return Promise.reject(err);
      }
    } else if (
      error.response?.status === 401 &&
      ['Invalid refresh token', 'Missing or invalid authorization header'].includes(
        error.response?.data?.message
      )
    ) {
      // Refresh token expired → log out
      setAccessToken(null);
      setRefreshToken(null);
      setHasPin(false);
      setIsVerified(false);
      await logoutAction();
    }

    return Promise.reject(error);
  }
);

export default api;
