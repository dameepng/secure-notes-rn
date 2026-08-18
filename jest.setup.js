/* eslint-env jest */
jest.mock('react-native-screens', () => {
  const View = require('react-native').View;
  return {
    enableScreens: jest.fn(),
    screensEnabled: jest.fn(() => true),
    ScreenContainer: View,
    Screen: View,
    NativeScreen: View,
    NativeScreenContainer: View,
    ScreenStack: View,
    ScreenStackHeaderConfig: View,
    ScreenStackHeaderSubview: View,
  };
});

jest.mock('@react-native-async-storage/async-storage', () => {
  const storage = new Map();
  return {
    setItem: jest.fn((k, v) => {
      storage.set(k, v);
      return Promise.resolve();
    }),
    getItem: jest.fn(k => Promise.resolve(storage.get(k) ?? null)),
    removeItem: jest.fn(k => {
      storage.delete(k);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      storage.clear();
      return Promise.resolve();
    }),
  };
});
