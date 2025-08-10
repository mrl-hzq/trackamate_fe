import axios from 'axios';

// const API_BASE = 'http://192.168.100.108:5000';
const API_BASE = 'http://127.0.0.1:5000';

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  return axios.post(`${API_BASE}/user/register`, data);
};

export const  loginUser = async (data: {
  email: string;
  password: string;
}) => {
  return axios.post(`${API_BASE}/user/login`, data);
};


        // method: 'POST',
        // headers: {
        //   'Content-Type': 'application/json',
        // },
        // body: JSON.stringify({ email: username, password }),
