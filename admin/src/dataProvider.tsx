import axios from "axios";
import simpleRestDataProvider from "@refinedev/simple-rest";

// Tạo axios instance với baseURL
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

// Thêm interceptor để tự động chèn token vào header
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

const dataProvider = simpleRestDataProvider("http://localhost:5000/api/v1", axiosInstance);

export default dataProvider;
