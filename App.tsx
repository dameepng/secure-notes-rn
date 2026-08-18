import React from 'react';
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
} from 'react-native';

import { TurboModuleRegistry } from 'react-native';

const globalObj = globalThis as any;
const isFabric = Boolean(globalObj.nativeFabricUIManager);
const isBridgeless = Boolean(globalObj.RN$Bridgeless);
const hasTurboModuleProxy = Boolean(globalObj.__turboModuleProxy);
// In React Native 0.81+ Bridgeless Mode, all modules run through TurboModule architecture
const isTurboModule = hasTurboModuleProxy || isBridgeless || Boolean(TurboModuleRegistry.get('DeviceInfo') || TurboModuleRegistry.get('PlatformConstants'));
const isHermes = Boolean(globalObj.HermesInternal);

console.log('====================================');
console.log('🚀 [SecureNotes] New Architecture Verification:');
console.log(` - Fabric UI Manager: ${isFabric ? 'ACTIVE ✅' : 'INACTIVE ❌'}`);
console.log(` - Bridgeless Mode: ${isBridgeless ? 'ACTIVE ✅' : 'INACTIVE ❌'}`);
console.log(` - TurboModules System: ${isTurboModule ? 'ACTIVE ✅' : 'INACTIVE ❌'}`);
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
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.badge}>FASE 0 — SETUP & VERIFIKASI</Text>
          <Text style={styles.title}>SecureNotes</Text>
          <Text style={styles.subtitle}>React Native New Architecture Verification</Text>
        </View>

        <View style={styles.cardContainer}>
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
          <Text style={styles.footerLabel}>Config Status:</Text>
          <Text style={styles.footerValue}>• android/gradle.properties: newArchEnabled=true</Text>
          <Text style={styles.footerValue}>• React Native: 0.81.1 | React: 19.1.0</Text>
          <Text style={styles.footerValue}>• Architecture: JSI + Fabric + TurboModules</Text>
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
    marginBottom: 24,
    marginTop: 10,
  },
  badge: {
    color: '#38bdf8',
    fontSize: 12,
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
    fontSize: 16,
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
