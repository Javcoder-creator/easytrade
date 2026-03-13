import axios from 'axios';

// Production (Render): VITE_API_URL = backend origin, /api/v1 qo‘shiladi
// Development: /api/v1 (vite proxy orqali)
const origin = import.meta.env.VITE_API_URL;
const BASE_URL = origin ? origin.replace(/\/$/, '') + '/api/v1' : '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch (refreshErr) {
        const status = refreshErr.response?.status;
        const msg = refreshErr.response?.data?.message || refreshErr.message;
        if (process.env.NODE_ENV !== 'production') {
          console.error('Token yangilash muvaffaqiyatsiz:', status, msg);
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
