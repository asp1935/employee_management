import axios from "axios";
import { clearAccessToken, getAccessToken, setAccessToken } from "../auth/authToken";

const API_BASE = import.meta.env.VITE_API_URL 

//url setup
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, 
});

// attach access token to every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


// handle access token expiration
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalReq = error.config;
    const requestUrl = originalReq?.url || '';

    const isAuthRequest = [
      '/auth/login',
      '/auth/signup',
      '/auth/refresh-token',
      '/auth/logout',
    ].some((path) => requestUrl.includes(path));

    // Do not attempt refresh for auth routes themselves
    if (isAuthRequest) {
      return Promise.reject(error);
    }

    // Handle expired access token for non-auth requests only
    if (error.response?.status === 401 && originalReq && !originalReq._retry) {
      originalReq._retry = true;

      try {
        const resp = await api.post('/auth/refresh-token');
        const newAccessToken = resp.data.data.accessToken;
        setAccessToken(newAccessToken);

        originalReq.headers = originalReq.headers || {};
        originalReq.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalReq);
      } catch (err) {
        clearAccessToken();
        const publicPaths = ['/', '/login', '/signup'];
        const currentPath = window.location.pathname;

        if (!publicPaths.includes(currentPath)) {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;