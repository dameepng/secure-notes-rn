import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearAuthData,
  getAuthToken,
  getAuthUser,
  saveAuthData,
} from '../src/storage/authStorage';
import { User } from '../src/types/auth';

describe('authStorage Helper', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  const dummyUser: User = {
    id: 'user_1',
    email: 'adam@securenotes.dev',
    name: 'Adam',
  };
  const dummyToken = 'mock_jwt_token_123456';

  it('should save and retrieve auth data correctly', async () => {
    await saveAuthData(dummyToken, dummyUser);

    const token = await getAuthToken();
    const user = await getAuthUser();

    expect(token).toBe(dummyToken);
    expect(user).toEqual(dummyUser);
  });

  it('should return null when no auth data is stored', async () => {
    const token = await getAuthToken();
    const user = await getAuthUser();

    expect(token).toBeNull();
    expect(user).toBeNull();
  });

  it('should clear auth data on logout', async () => {
    await saveAuthData(dummyToken, dummyUser);

    await clearAuthData();

    const token = await getAuthToken();
    const user = await getAuthUser();

    expect(token).toBeNull();
    expect(user).toBeNull();
  });
});
