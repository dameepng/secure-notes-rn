import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth';

const STORAGE_KEYS = {
  AUTH_TOKEN: '@securenotes/auth_token',
  AUTH_USER: '@securenotes/auth_user',
};

/**
 * Menyimpan token dan data profil user ke AsyncStorage (plain text untuk Fase 3).
 * Enkripsi akan diimplementasikan pada Fase 5.
 */
export async function saveAuthData(token: string, user: User): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
      AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user)),
    ]);
  } catch (error) {
    console.error('Error saving auth data to AsyncStorage:', error);
    throw error;
  }
}

/**
 * Mengambil token autentikasi dari AsyncStorage.
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error getting auth token from AsyncStorage:', error);
    return null;
  }
}

/**
 * Mengambil data profil user dari AsyncStorage.
 */
export async function getAuthUser(): Promise<User | null> {
  try {
    const rawUser = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (!rawUser) {
      return null;
    }
    return JSON.parse(rawUser) as User;
  } catch (error) {
    console.error('Error getting auth user from AsyncStorage:', error);
    return null;
  }
}

/**
 * Menghapus seluruh data sesi login dari AsyncStorage (Logout).
 */
export async function clearAuthData(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER),
    ]);
  } catch (error) {
    console.error('Error clearing auth data from AsyncStorage:', error);
    throw error;
  }
}

export default {
  saveAuthData,
  getAuthToken,
  getAuthUser,
  clearAuthData,
};
