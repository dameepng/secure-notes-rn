import apiClient, { formatApiError } from './client';
import { AuthResponse, LoginCredentials } from '../types/auth';

/**
 * Simulasi request login ke mock API (jsonplaceholder / mock endpoint).
 * Mengirimkan data kredensial ke mock API lalu mengembalikan data dummy user dan token.
 */
export async function loginRequest(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const { email, password } = credentials;

  if (!email || !email.includes('@')) {
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
    // Panggil mock endpoint jsonplaceholder untuk simulasi network roundtrip nyata
    const response = await apiClient.post('/posts', {
      email,
      action: 'auth_login_simulation',
      timestamp: Date.now(),
    });

    const username = email.split('@')[0];
    const sanitizedName = username.charAt(0).toUpperCase() + username.slice(1);

    const authData: AuthResponse = {
      user: {
        id: `user_${response.data.id || 1}`,
        email: email.trim().toLowerCase(),
        name: sanitizedName,
      },
      token: `dummy_jwt_${encodeURIComponent(email)}_${Date.now()}`,
    };

    return authData;
  } catch (error) {
    throw formatApiError(error);
  }
}

export default {
  loginRequest,
};
