import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export const api = axios.create({
    baseURL,
    timeout: 20000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("admin_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
