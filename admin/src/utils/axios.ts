// src/utils/axios.ts
import axios from "axios";

const instance = axios.create({
  baseURL: "/api/v1/dashboard", // tất cả API đều bắt đầu từ đây
});

export default instance;
