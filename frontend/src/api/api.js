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
    // store original request
    const originalReq = error.config;

    // Handle expired access token
    if (error.response?.status === 401 && !originalReq._retry) {
      
      originalReq._retry = true;

      try {
        const resp = await api.post("/auth/refresh-token");

        const newAccessToken = resp.data.data.accessToken;
        setAccessToken(newAccessToken);

        // Retry original request
        originalReq.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalReq);

      } catch (err) {   // Refresh token also expired or invalid then logout
        clearAccessToken();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;