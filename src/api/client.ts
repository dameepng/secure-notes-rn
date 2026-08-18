import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../types/api';

const DEFAULT_BASE_URL = 'https://jsonplaceholder.typicode.com';
export const DUMMY_AUTH_TOKEN = 'dummy_token_securenotes_phase2';

export const apiClient: AxiosInstance = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export function formatApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError;
    if (
      axiosErr.code === 'ECONNABORTED' ||
      axiosErr.message?.includes('timeout')
    ) {
      return {
        code: 'TIMEOUT_ERROR',
        message: 'Koneksi waktu habis (Request timeout). Silakan coba lagi.',
        statusCode: axiosErr.response?.status,
        originalError: error,
      };
    }
    if (!axiosErr.response) {
      return {
        code: 'NETWORK_ERROR',
        message:
          'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        originalError: error,
      };
    }
    const status = axiosErr.response.status;
    if (status === 401 || status === 403) {
      return {
        code: 'UNAUTHORIZED',
        message: 'Sesi login tidak valid atau telah berakhir.',
        statusCode: status,
        originalError: error,
      };
    }
    if (status >= 400 && status < 500) {
      return {
        code: 'BAD_REQUEST',
        message:
          (axiosErr.response.data as { message?: string })?.message ||
          'Permintaan tidak valid.',
        statusCode: status,
        originalError: error,
      };
    }
    if (status >= 500) {
      return {
        code: 'SERVER_ERROR',
        message:
          'Terjadi gangguan pada server. Silakan coba beberapa saat lagi.',
        statusCode: status,
        originalError: error,
      };
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message:
      (error as Error)?.message || 'Terjadi kesalahan yang tidak diketahui.',
    originalError: error,
  };
}

// Request Interceptor: Attach dummy auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${DUMMY_AUTH_TOKEN}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(formatApiError(error));
  },
);

// Response Interceptor: Global error handling
apiClient.interceptors.response.use(
  response => response,
  (error: unknown) => {
    const formatted = formatApiError(error);
    return Promise.reject(formatted);
  },
);

export default apiClient;
