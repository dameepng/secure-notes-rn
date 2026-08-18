import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../navigation/AuthContext';

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert('Konfirmasi Logout', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Halo,</Text>
            <Text style={styles.userName}>{user?.name || 'Pengguna'} 👋</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            disabled={loggingOut}>
            {loggingOut ? (
              <ActivityIndicator color="#ef4444" size="small" />
            ) : (
              <Text style={styles.logoutText}>Logout</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* User Profile Card */}
        <View style={styles.userCard}>
          <View style={styles.badgeRow}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>TERAUTENTIKASI</Text>
            </View>
            <Text style={styles.phaseBadge}>FASE 3 SELESAI</Text>
          </View>

          <Text style={styles.userEmailLabel}>Email Terdaftar:</Text>
          <Text style={styles.userEmail}>{user?.email || '-'}</Text>
          <Text style={styles.userId}>User ID: {user?.id || '-'}</Text>
        </View>

        {/* Info Card for Next Phase */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📝 Catatan Pribadi (SecureNotes)</Text>
          <Text style={styles.infoDesc}>
            Navigasi & Auth Flow berhasil terhubung. Sesi Anda tersimpan di
            AsyncStorage sehingga saat aplikasi di-restart, Anda akan tetap login
            di halaman ini.
          </Text>
          <View style={styles.nextPhaseBox}>
            <Text style={styles.nextPhaseTitle}>Tahap Berikutnya:</Text>
            <Text style={styles.nextPhaseText}>
              • Fase 4: CRUD Catatan (Create, Read, Delete plain text)
            </Text>
            <Text style={styles.nextPhaseText}>
              • Fase 5: Enkripsi AES dengan crypto-js & polyfill
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  greeting: {
    fontSize: 14,
    color: '#94a3b8',
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
  },
  logoutBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  logoutText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 13,
  },
  userCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064e3b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  statusText: {
    color: '#a7f3d0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  phaseBadge: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  userEmailLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  infoDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 19,
    marginBottom: 14,
  },
  nextPhaseBox: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#38bdf8',
    gap: 4,
  },
  nextPhaseTitle: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  nextPhaseText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
});

export default HomeScreen;
