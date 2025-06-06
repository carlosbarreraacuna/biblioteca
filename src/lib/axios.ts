import axios from 'axios';

let token: string | null = null;

export function setAuthToken(authToken: string | null) {
  token = authToken;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  console.log('Token usado en petición:', token); // 👈 DEBUG
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
