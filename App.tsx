import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { TurboModuleRegistry } from 'react-native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

import { AuthProvider } from './src/navigation/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { ToastProvider } from './src/components/ToastContext';

const globalObj = globalThis as any;
const isFabric = Boolean(globalObj.nativeFabricUIManager);
const isBridgeless = Boolean(globalObj.RN$Bridgeless);
const hasTurboModuleProxy = Boolean(globalObj.__turboModuleProxy);
// In React Native 0.81+ Bridgeless Mode, all modules run through TurboModule architecture
const isTurboModule =
  hasTurboModuleProxy ||
  isBridgeless ||
  Boolean(
    TurboModuleRegistry.get('DeviceInfo') ||
      TurboModuleRegistry.get('PlatformConstants'),
  );
const isHermes = Boolean(globalObj.HermesInternal);

console.log('====================================');
console.log('🚀 [SecureNotes] New Architecture Verification:');
console.log(` - Fabric UI Manager: ${isFabric ? 'ACTIVE ✅' : 'INACTIVE ❌'}`);
console.log(` - Bridgeless Mode: ${isBridgeless ? 'ACTIVE ✅' : 'INACTIVE ❌'}`);
console.log(
  ` - TurboModules System: ${isTurboModule ? 'ACTIVE ✅' : 'INACTIVE ❌'}`,
);
console.log(` - Hermes Engine: ${isHermes ? 'ACTIVE ✅' : 'INACTIVE ❌'}`);
console.log(` - React Version: ${React.version}`);
console.log('====================================');

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    border: '#334155',
    primary: '#38bdf8',
  },
};

function App() {
  return (
    <ErrorBoundary>
      <GluestackUIProvider config={config}>
        <SafeAreaProvider style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
          <ToastProvider>
            <AuthProvider>
              <NavigationContainer theme={customDarkTheme}>
                <RootNavigator />
              </NavigationContainer>
            </AuthProvider>
          </ToastProvider>
        </SafeAreaProvider>
      </GluestackUIProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});

export default App;
