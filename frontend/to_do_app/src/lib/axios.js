import axios from "axios";

const BaseURL = import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api`
    : import.meta.env.MODE === "development" 
        ? "http://localhost:5000/api"
        : "/api";

const api = axios.create({
    baseURL: BaseURL,        
    timeout: 15000, // Increased timeout for face processing
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        console.log(`Response from ${response.config.url}:`, response.status);
        return response;
    },
    (error) => {
        console.error('Response error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export default api;