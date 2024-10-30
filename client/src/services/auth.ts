import axios from 'axios';
import { User } from '../types/auth';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true
});

export const login = async (username: string, password: string): Promise<User> => {
  const response = await api.post('/login', { username, password });
  return response.data;
};

export const register = async (username: string, password: string): Promise<User> => {
  const response = await api.post('/register', { username, password });
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.get('/logout');
};

export const checkAuthStatus = async (): Promise<User> => {
  const response = await api.get('/profile');
  return response.data;
};
