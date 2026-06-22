import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // Generous timeout to tolerate free-tier cold starts, but never hang forever.
  timeout: 60000,
});

// Attach the JWT to every request if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 (expired/invalid token), clear auth and redirect to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Turn network/timeout failures into a friendly message components can show.
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
      error.friendlyMessage =
        'Could not reach the server. It may be waking up from sleep — please wait a moment and try again.';
    }

    // On 401 (expired/invalid token), clear auth and redirect to login.
    if (error.response?.status === 401) {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
