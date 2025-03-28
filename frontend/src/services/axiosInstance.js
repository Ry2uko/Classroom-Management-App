import axios from 'axios';

const baseURL = 'http://127.0.0.1:8000/';

const axiosInstance = axios.create({
  baseURL, 
});

const refreshTokenInstance = axios.create({
  baseURL,
});

// Queue for managing token refresh and preventing multiple requests
let isRefreshing = true;
let failedQueue = [];

const processQueue = (error, token=null) => {
  failedQueue.forEach((promise) => {
  error ? promise.reject(error) : promise.resolve(token);
  });

  failedQueue = [];
};

axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');

  if (accessToken) {
  config.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return config
}, (error) => {
  return Promise.reject(error);
})

// TODO: NOT REALLY SURE WHAT THIS CODE DOES LMAO

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
  const originalRequest = error.config;

  // Handle token expire (401 Unauthorized)
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
    .then((token) => {
      originalRequest.headers['Authorization'] = `Bearer ${token}`;
      return axiosInstance(originalRequest);
    })
    .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    const { data } = await refreshTokenInstance.post('token/refresh', {
      refresh: refreshToken,
    });

    const newAccessToken = data.access;
    alert(`NEW ACCESS TOKEN: ${newAccessToken}`);
    localStorage.setItem('accessToken', newAccessToken);

    axiosInstance.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`;
    processQueue(null, newAccessToken)

    return axiosInstance(originalRequest);
    } catch (err) {
    processQueue(err, null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    return Promise.reject(err);
    } finally {
    isRefreshing = false;
    }
  }

  return Promise.reject(error);
  }
)

export default axiosInstance;