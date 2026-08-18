import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { loginRequest } from '../api/auth';
import {
  clearAuthData,
  getAuthToken,
  getAuthUser,
  saveAuthData,
} from '../storage/authStorage';
import { AuthResponse, LoginCredentials, User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore persisted auth session on app launch
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [persistedToken, persistedUser] = await Promise.all([
          getAuthToken(),
          getAuthUser(),
        ]);
        if (persistedToken && persistedUser) {
          setToken(persistedToken);
          setUser(persistedUser);
        }
      } catch (error) {
        console.error('Failed to restore auth session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await loginRequest(credentials);
      await saveAuthData(response.token, response.user);
      setToken(response.token);
      setUser(response.user);
      return response;
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await clearAuthData();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setToken(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
