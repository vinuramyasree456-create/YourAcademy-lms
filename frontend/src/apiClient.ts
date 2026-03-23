import axios from 'axios';
import { config } from './config';
import useAuthStore from './store/authStore';

const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  withCredentials: true, // Send cookies
});

apiClient.interceptors.request.use((reqConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  return reqConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${config.API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const { accessToken } = res.data;
        useAuthStore.getState().setToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
