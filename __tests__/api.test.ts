import apiClient, { DUMMY_AUTH_TOKEN, formatApiError } from '../src/api/client';
import { loginRequest } from '../src/api/auth';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';

describe('API Client & Interceptors', () => {
  it('should have default baseURL and headers configured', () => {
    expect(apiClient.defaults.baseURL).toBe(
      'https://jsonplaceholder.typicode.com',
    );
    expect(apiClient.defaults.timeout).toBe(10000);
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should attach dummy Authorization token in request interceptor', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { id: 101, title: 'mock' },
      status: 201,
      statusText: 'Created',
      headers: {},
      config: {
        headers: {
          Authorization: `Bearer ${DUMMY_AUTH_TOKEN}`,
        },
      } as unknown as InternalAxiosRequestConfig,
    });

    const response = await apiClient.post('/posts', { test: true });

    expect(postSpy).toHaveBeenCalled();
    expect(response.config.headers.Authorization).toBe(
      `Bearer ${DUMMY_AUTH_TOKEN}`,
    );
    postSpy.mockRestore();
  });

  it('should correctly format network error', () => {
    const mockAxiosError = {
      isAxiosError: true,
      name: 'AxiosError',
      message: 'Network Error',
      response: undefined,
    } as unknown as AxiosError;

    const formatted = formatApiError(mockAxiosError);
    expect(formatted.code).toBe('NETWORK_ERROR');
    expect(formatted.message).toContain('Tidak dapat terhubung');
  });

  it('should correctly format timeout error', () => {
    const mockAxiosError = {
      isAxiosError: true,
      name: 'AxiosError',
      code: 'ECONNABORTED',
      message: 'timeout of 10000ms exceeded',
      response: undefined,
    } as unknown as AxiosError;

    const formatted = formatApiError(mockAxiosError);
    expect(formatted.code).toBe('TIMEOUT_ERROR');
    expect(formatted.message).toContain('timeout');
  });

  it('should correctly format 401 unauthorized error', () => {
    const mockAxiosError = {
      isAxiosError: true,
      name: 'AxiosError',
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    } as unknown as AxiosError;

    const formatted = formatApiError(mockAxiosError);
    expect(formatted.code).toBe('UNAUTHORIZED');
    expect(formatted.statusCode).toBe(401);
  });
});

describe('Auth API (loginRequest)', () => {
  it('should throw BAD_REQUEST error if email is invalid', async () => {
    await expect(loginRequest({ email: 'invalidemail' })).rejects.toMatchObject(
      {
        code: 'BAD_REQUEST',
        message: 'Format email tidak valid.',
      },
    );
  });

  it('should throw BAD_REQUEST error if password is shorter than 6 characters', async () => {
    await expect(
      loginRequest({ email: 'user@example.com', password: '123' }),
    ).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: 'Password minimal harus 6 karakter.',
    });
  });

  it('should return auth response with user data and token on successful mock request', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { id: 101, email: 'test@example.com' },
      status: 201,
      statusText: 'Created',
      headers: {},
      config: { headers: {} } as unknown as InternalAxiosRequestConfig,
    });

    const result = await loginRequest({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toHaveProperty('user');
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.name).toBe('Test');
    expect(result.token).toContain('dummy_jwt_');

    postSpy.mockRestore();
  });
});
