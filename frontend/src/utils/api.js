import axios from 'axios';

const api = axios.create({
    // baseURL: 'http://localhost:8080/api/v1',
    baseURL:'https://internship-demo-backend.onrender.com/api/v1'
});

// Automatically attach JWT to requests if it exists in session
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;