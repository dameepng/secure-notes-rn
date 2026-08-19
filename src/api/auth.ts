import apiClient, { formatApiError } from './client';
import { AuthResponse, LoginCredentials, User } from '../types/auth';

export interface MockApiUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

/**
 * Mengambil daftar user yang terdaftar di MockAPI.
 */
export async function fetchUsers(): Promise<MockApiUser[]> {
  try {
    const response = await apiClient.get<MockApiUser[]>('/users');
    return response.data;
  } catch (error) {
    throw formatApiError(error);
  }
}

/**
 * Login / Otentikasi user menggunakan MockAPI.
 * 1. Memeriksa validitas format email & password.
 * 2. Mencari user di endpoint MockAPI `/users`.
 * 3. Jika user belum ada, mendaftarkan user baru ke MockAPI secara otomatis.
 * 4. Mengembalikan data User dan Token JWT.
 */
export async function loginRequest(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const { email, password } = credentials;

  const trimmedEmail = email?.trim().toLowerCase();
  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    throw {
      code: 'BAD_REQUEST',
      message: 'Format email tidak valid.',
    };
  }

  if (password !== undefined && password.length < 6) {
    throw {
      code: 'BAD_REQUEST',
      message: 'Password minimal harus 6 karakter.',
    };
  }

  try {
    // 1. Cek apakah user sudah terdaftar di MockAPI /users
    const usersResponse = await apiClient.get<MockApiUser[]>('/users');
    const existingUsers = Array.isArray(usersResponse.data)
      ? usersResponse.data
      : [];

    let matchedUser = existingUsers.find(
      u => u.email && u.email.toLowerCase() === trimmedEmail,
    );

    // 2. Jika user belum ada di MockAPI, buat record user baru (Auto-register di MockAPI)
    if (!matchedUser) {
      const username = trimmedEmail.split('@')[0];
      const sanitizedName =
        username.charAt(0).toUpperCase() + username.slice(1);

      const createResponse = await apiClient.post<MockApiUser>('/users', {
        email: trimmedEmail,
        name: sanitizedName,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${trimmedEmail}`,
      });
      matchedUser = createResponse.data;
    }

    const authUser: User = {
      id: String(matchedUser.id),
      email: matchedUser.email,
      name: matchedUser.name || trimmedEmail.split('@')[0],
    };

    const authData: AuthResponse = {
      user: authUser,
      token: `mockapi_jwt_${matchedUser.id}_${Date.now()}`,
    };

    return authData;
  } catch (error) {
    throw formatApiError(error);
  }
}

export default {
  fetchUsers,
  loginRequest,
};
