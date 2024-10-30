import axios from 'axios';
import { Constituent, CreateConstituentInput, BatchUploadResult } from '../types/constituent';

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true
});

export const getConstituents = async (page: number = 1, pageSize: number = 10) => {
  const response = await api.get(`/constituents`, { params: { page, pageSize } });
  return response.data;
};

export const addConstituent = async (data: CreateConstituentInput): Promise<Constituent> => {
  const response = await api.post('/constituents', data);
  return response.data;
};

export const downloadConstituentsCsv = async (startDate: string, endDate: string): Promise<void> => {
  const response = await api.get('/constituents/download-csv', {
    params: { startDate, endDate },
    responseType: 'blob'
  });

  if (response.status === 200) {
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'constituents.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } else {
    throw new Error('Failed to download CSV');
  }
};

export const batchUploadConstituents = async (constituents: FormData) => {
  const response = await api.post('/constituents/batch-upload', constituents, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data as BatchUploadResult;
};