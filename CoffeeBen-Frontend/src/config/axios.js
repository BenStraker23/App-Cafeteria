import axios from 'axios';

const clienteAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: false
});

// Interceptor para requests
clienteAxios.interceptors.request.use(
    config => {
        console.log('Request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    error => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Interceptor para responses
clienteAxios.interceptors.response.use(
    response => {
        console.log('Response:', response.status, response.config.url);
        return response;
    },
    error => {
        console.error('Response Error:', error.response?.status, error.config?.url);
        return Promise.reject(error);
    }
);

export default clienteAxios;