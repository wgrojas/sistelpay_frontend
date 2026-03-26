// import axios from "axios";

// const API = "http://localhost:3001/api";

// export const getSaldo = () => axios.get(`${API}/saldo`);
// export const transferir = (data) => axios.post(`${API}/transferir`, data);
// export const pagar = (data) => axios.post(`${API}/pagar`, data);


import axios from "axios";

const api = axios.create({
   baseURL: "https://sistelpay-d79dfc670530.herokuapp.com", // tu backend
  // baseURL: "http://localhost:4000", // tu backend
  timeout: 10000,
 
});

export default api;