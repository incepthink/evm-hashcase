import axios from "axios";
import Cookies from "js-cookie";
// TODO
const axiosInstance = axios.create({
  baseURL:  "https://api.hashcase.co",
});

let del

axiosInstance.interceptors.request.use(
  (config) => {
    const jwt = Cookies.get("jwt");
    if (jwt) {
      config.headers.Authorization = `Bearer ${jwt}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized request - user not authenticated");
      // Don't throw the error, let individual components handle it
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;