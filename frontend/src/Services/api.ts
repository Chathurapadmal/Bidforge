import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:7032/api', // change this to match your backend
});

export default api;
