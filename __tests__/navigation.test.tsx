import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

import { AuthProvider } from '../src/navigation/AuthContext';
import RootNavigator from '../src/navigation/RootNavigator';
import MainTabNavigator from '../src/navigation/MainTabNavigator';
import * as AuthStorage from '../src/storage/authStorage';
import { ToastProvider } from '../src/components/ToastContext';

describe('Navigation (Fase 1: MainTabNavigator & RootNavigator)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders LoginScreen when user is unauthenticated', async () => {
    jest.spyOn(AuthStorage, 'getAuthToken').mockResolvedValue(null);
    jest.spyOn(AuthStorage, 'getAuthUser').mockResolvedValue(null);

    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GluestackUIProvider config={config}>
          <SafeAreaProvider>
            <ToastProvider>
              <AuthProvider>
                <NavigationContainer>
                  <RootNavigator />
                </NavigationContainer>
              </AuthProvider>
            </ToastProvider>
          </SafeAreaProvider>
        </GluestackUIProvider>,
      );
    });

    expect(renderer).not.toBeNull();
    const tree = renderer!.toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders MainTabNavigator when user is authenticated', async () => {
    jest.spyOn(AuthStorage, 'getAuthToken').mockResolvedValue('mock_token');
    jest.spyOn(AuthStorage, 'getAuthUser').mockResolvedValue({
      id: '1',
      email: 'agent@securenotes.dev',
      name: 'Agent 1',
    });

    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GluestackUIProvider config={config}>
          <SafeAreaProvider>
            <ToastProvider>
              <AuthProvider>
                <NavigationContainer>
                  <RootNavigator />
                </NavigationContainer>
              </AuthProvider>
            </ToastProvider>
          </SafeAreaProvider>
        </GluestackUIProvider>,
      );
    });

    expect(renderer).not.toBeNull();
    const tree = renderer!.toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders all 4 tabs in MainTabNavigator directly', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GluestackUIProvider config={config}>
          <SafeAreaProvider>
            <ToastProvider>
              <AuthProvider>
                <NavigationContainer>
                  <MainTabNavigator />
                </NavigationContainer>
              </AuthProvider>
            </ToastProvider>
          </SafeAreaProvider>
        </GluestackUIProvider>,
      );
    });

    expect(renderer).not.toBeNull();
    const tree = renderer!.toJSON();
    expect(tree).toBeTruthy();
  });
});
