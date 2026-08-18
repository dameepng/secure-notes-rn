import React, { useState } from 'react';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { TurboModuleRegistry } from 'react-native';
import { loginRequest } from './src/api/auth';
import { AuthResponse } from './src/types/auth';
import { ApiError } from './src/types/api';

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

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleTestLogin = async (isValid: boolean) => {
    setLoading(true);
    setApiResult(null);
    setApiError(null);

    const credentials = isValid
      ? { email: 'adam@securenotes.dev', password: 'securepassword123' }
      : { email: 'invalid-email', password: '123' };

    console.log(
      `📡 [Fase 2 API] Testing loginRequest with credentials:`,
      credentials,
    );

    try {
      const response: AuthResponse = await loginRequest(credentials);
      console.log('✅ [Fase 2 API] loginRequest Success:', response);
      setApiResult(JSON.stringify(response, null, 2));
    } catch (err: unknown) {
      const errorObj = err as ApiError;
      console.warn('❌ [Fase 2 API] loginRequest Failed:', errorObj);
      setApiError(`[${errorObj.code}] ${errorObj.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checks = [
    {
      title: 'New Architecture (Fabric)',
      description: 'Concurrent rendering & synchronous layout system',
      status: isFabric,
    },
    {
      title: 'TurboModules',
      description: 'Type-safe, synchronous C++ JSI native bridge',
      status: isTurboModule,
    },
    {
      title: 'Hermes JavaScript Engine',
      description: 'Bytecode precompilation & optimized memory usage',
      status: isHermes,
    },
    {
      title: `React ${React.version}`,
      description: 'React 19.1.0 integration confirmed',
      status: React.version.startsWith('19'),
    },
  ];

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.badge}>FASE 2 — NETWORKING LAYER (AXIOS)</Text>
          <Text style={styles.title}>SecureNotes</Text>
          <Text style={styles.subtitle}>
            Axios Client, Interceptors & Mock Auth Test
          </Text>
        </View>

        {/* Phase 2: Interactive API Test Section */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>📡 Network Layer Test</Text>
          <Text style={styles.sectionDesc}>
            Test fungsi loginRequest() via axios instance dengan request/response
            interceptor.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSuccess]}
              disabled={loading}
              onPress={() => handleTestLogin(true)}>
              <Text style={styles.btnText}>Test Login (Valid)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnError]}
              disabled={loading}
              onPress={() => handleTestLogin(false)}>
              <Text style={styles.btnText}>Test Error (Invalid)</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#38bdf8" />
              <Text style={styles.loadingText}>Menghubungi mock server...</Text>
            </View>
          )}

          {apiResult && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>✅ Response Berhasil:</Text>
              <Text style={styles.resultJson}>{apiResult}</Text>
            </View>
          )}

          {apiError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorLabel}>❌ Error Ter-handle:</Text>
              <Text style={styles.errorText}>{apiError}</Text>
            </View>
          )}
        </View>

        {/* Diagnostic Status Cards */}
        <View style={styles.cardContainer}>
          <Text style={styles.sectionTitle}>⚙️ Environment Status</Text>
          {checks.map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View
                  style={[
                    styles.statusPill,
                    item.status ? styles.statusActive : styles.statusInactive,
                  ]}>
                  <Text style={styles.statusText}>
                    {item.status ? 'ACTIVE' : 'INACTIVE'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardDesc}>{item.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Networking Layer Config:</Text>
          <Text style={styles.footerValue}>• Axios Instance: src/api/client.ts</Text>
          <Text style={styles.footerValue}>• Request Interceptor: Bearer Token injected</Text>
          <Text style={styles.footerValue}>• Response Interceptor: Safe ApiError mapping</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  badge: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  testSection: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#38bdf8',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSuccess: {
    backgroundColor: '#0284c7',
  },
  btnError: {
    backgroundColor: '#334155',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 8,
  },
  loadingText: {
    color: '#38bdf8',
    fontSize: 13,
  },
  resultBox: {
    backgroundColor: '#064e3b',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  resultLabel: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  resultJson: {
    color: '#ecfdf5',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  errorBox: {
    backgroundColor: '#450a0a',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  errorLabel: {
    color: '#fecaca',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorText: {
    color: '#fee2e2',
    fontSize: 12,
  },
  cardContainer: {
    gap: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f1f5f9',
    flex: 1,
  },
  cardDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: '#065f46',
  },
  statusInactive: {
    backgroundColor: '#7f1d1d',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ecfdf5',
  },
  footerInfo: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#38bdf8',
  },
  footerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 6,
  },
  footerValue: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
    fontFamily: 'monospace',
  },
});

export default App;
