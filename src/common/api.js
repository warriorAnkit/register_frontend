import axios from 'axios';

// use only for image upload
const api = axios?.create({
  baseURL: process.env.REACT_APP_SERVER_REST_URL,
});

export default api;
