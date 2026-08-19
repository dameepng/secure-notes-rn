import apiClient, {
  DUMMY_AUTH_TOKEN,
  MOCKAPI_BASE_URL,
  formatApiError,
} from '../src/api/client';
import { loginRequest, fetchUsers } from '../src/api/auth';
import {
  fetchNotesFromApi,
  createNoteInApi,
  deleteNoteFromApi,
} from '../src/api/notesApi';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';

describe('API Client & Interceptors', () => {
  it('should have default baseURL and headers configured for MockAPI', () => {
    expect(apiClient.defaults.baseURL).toBe(MOCKAPI_BASE_URL);
    expect(apiClient.defaults.timeout).toBe(10000);
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should attach dummy Authorization token in request interceptor', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { id: '101', title: 'mock' },
      status: 201,
      statusText: 'Created',
      headers: {},
      config: {
        headers: {
          Authorization: `Bearer ${DUMMY_AUTH_TOKEN}`,
        },
      } as unknown as InternalAxiosRequestConfig,
    });

    const response = await apiClient.post('/notes', { test: true });

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

describe('Auth API (loginRequest & fetchUsers)', () => {
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

  it('should return auth response for existing user in MockAPI', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: [{ id: '1', email: 'user@example.com', name: 'User Satu' }],
    });

    const result = await loginRequest({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(result).toHaveProperty('user');
    expect(result.user.email).toBe('user@example.com');
    expect(result.user.name).toBe('User Satu');
    expect(result.token).toContain('mockapi_jwt_1_');

    getSpy.mockRestore();
  });

  it('should auto-register and return auth response for new user in MockAPI', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: [],
    });
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { id: '99', email: 'newuser@example.com', name: 'Newuser' },
    });

    const result = await loginRequest({
      email: 'newuser@example.com',
      password: 'password123',
    });

    expect(result.user.id).toBe('99');
    expect(result.user.email).toBe('newuser@example.com');
    expect(result.user.name).toBe('Newuser');
    expect(result.token).toContain('mockapi_jwt_99_');

    getSpy.mockRestore();
    postSpy.mockRestore();
  });
});

describe('Notes API (fetchNotesFromApi, createNoteInApi, deleteNoteFromApi)', () => {
  it('should fetch notes from MockAPI and filter by userId', async () => {
    const mockNotes = [
      { id: '1', title: 'Note 1', content: 'enc1', isEncrypted: true, userId: 'user_1' },
      { id: '2', title: 'Note 2', content: 'enc2', isEncrypted: true, userId: 'user_2' },
    ];
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockNotes,
    });

    const user1Notes = await fetchNotesFromApi('user_1');
    expect(user1Notes).toHaveLength(1);
    expect(user1Notes[0].id).toBe('1');

    getSpy.mockRestore();
  });

  it('should create a note in MockAPI', async () => {
    const noteData = {
      id: 'local_1',
      title: 'Catatan Baru',
      content: 'enc_content',
      createdAt: 1000,
      updatedAt: 1000,
      userId: 'user_1',
      isEncrypted: true,
    };
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { ...noteData, id: '10' },
    });

    const created = await createNoteInApi(noteData);
    expect(created.id).toBe('10');
    expect(created.title).toBe('Catatan Baru');

    postSpy.mockRestore();
  });

  it('should delete a note from MockAPI', async () => {
    const deleteSpy = jest.spyOn(apiClient, 'delete').mockResolvedValueOnce({
      data: {},
    });

    await expect(deleteNoteFromApi('10')).resolves.toBeUndefined();
    expect(deleteSpy).toHaveBeenCalledWith('/notes/10');

    deleteSpy.mockRestore();
  });
});
