import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../navigation/AuthContext';
import {
  bulkCreateNotes,
  clearAllNotes,
  createNote,
  deleteNote,
  getNotes,
} from '../storage/noteStorage';
import { Note, NoteInput } from '../types/note';
import NoteCard from '../components/NoteCard';
import AddNoteModal from '../components/AddNoteModal';
import { checkDeviceSecurityStatus, SecurityStatus } from '../native';

const SAMPLE_TOPICS = [
  'Kunci Enkripsi Server API',
  'Rencana Pengembangan Fitur Q3',
  'Daftar Belanja Kebutuhan Kantor',
  'Catatan Harian Antigravity IDE',
  'Meeting Notes Sprint Review',
  'Konfigurasi TurboModule & Fabric',
  'Ide Startup React Native New Architecture',
  'Audit Keamanan Password & Token',
];

const SAMPLE_CONTENTS = [
  'Pastikan seluruh payload sensitif dienkripsi AES sebelum masuk ke AsyncStorage lokal.',
  'Arsitektur New Arch menggunakan Fabric UI Manager untuk rendering C++ langsung tanpa bridge.',
  'Benchmarking FlatList dengan windowSize=5 dan removeClippedSubviews=true menunjukkan FPS 60/120 stabil.',
  'Gunakan keyExtractor yang stabil dan React.memo pada item component untuk meminimalisir overhead render.',
  'Koneksi TurboModules berjalan sinkron dan langsung mengeksekusi C++ native methods via JSI.',
];

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [generatingCount, setGeneratingCount] = useState<number | null>(null);
  const [perfBenchmarkText, setPerfBenchmarkText] = useState<string | null>(null);

  // TurboModule Security Checker State
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [checkingSecurity, setCheckingSecurity] = useState<boolean>(false);

  const userId = user?.id || 'guest_user';

  const loadNotes = useCallback(async () => {
    try {
      const data = await getNotes(user?.id);
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  const loadSecurityDiagnostics = useCallback(async () => {
    setCheckingSecurity(true);
    try {
      const status = await checkDeviceSecurityStatus();
      setSecurityStatus(status);
    } catch (error) {
      console.error('Failed to load native security status:', error);
    } finally {
      setCheckingSecurity(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
    loadSecurityDiagnostics();
  }, [loadNotes, loadSecurityDiagnostics]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotes();
    loadSecurityDiagnostics();
  }, [loadNotes, loadSecurityDiagnostics]);

  const handleCreateNote = async (input: NoteInput) => {
    const newNote = await createNote(input, userId);
    setNotes(prev => [newNote, ...prev]);
  };

  const handleDeleteNote = useCallback((noteId: string) => {
    Alert.alert(
      'Hapus Catatan',
      'Apakah Anda yakin ingin menghapus catatan ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(noteId);
              setNotes(prev => prev.filter(n => n.id !== noteId));
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus catatan.');
            }
          },
        },
      ],
    );
  }, []);

  const handleGenerateStressTest = useCallback(
    async (count: number) => {
      setGeneratingCount(count);
      setPerfBenchmarkText(null);

      const startTime = Date.now();
      const dummyInputs: NoteInput[] = [];

      for (let i = 1; i <= count; i++) {
        const topic =
          SAMPLE_TOPICS[(i - 1) % SAMPLE_TOPICS.length] + ` #${notes.length + i}`;
        const content =
          SAMPLE_CONTENTS[(i - 1) % SAMPLE_CONTENTS.length] +
          ` [StressTest Item ${i}/${count}]`;

        dummyInputs.push({
          title: topic,
          content: content,
        });
      }

      try {
        const createdNotes = await bulkCreateNotes(dummyInputs, userId);
        const elapsedMs = Date.now() - startTime;

        setNotes(prev => [...createdNotes, ...prev]);
        setPerfBenchmarkText(
          `⚡ Berhasil generate & enkripsi ${count} catatan dalam ${elapsedMs}ms! Total: ${
            notes.length + count
          } items.`,
        );
      } catch (error) {
        console.error('Stress test generation failed:', error);
        Alert.alert('Error', 'Gagal membuat catatan dummy.');
      } finally {
        setGeneratingCount(null);
      }
    },
    [notes.length, userId],
  );

  const handleClearAllNotes = useCallback(() => {
    if (notes.length === 0) {
      return;
    }

    Alert.alert(
      'Bersihkan Semua Catatan',
      `Apakah Anda yakin ingin menghapus seluruh ${notes.length} catatan dari storage?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllNotes();
              setNotes([]);
              setPerfBenchmarkText('🧹 Semua catatan berhasil dibersihkan.');
            } catch (error) {
              Alert.alert('Error', 'Gagal mengosongkan catatan.');
            }
          },
        },
      ],
    );
  }, [notes.length]);

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

  const keyExtractor = useCallback((item: Note) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: Note }) => (
      <NoteCard note={item} onDelete={handleDeleteNote} />
    ),
    [handleDeleteNote],
  );

  const headerComponent = useMemo(
    () => (
      <View style={styles.listHeaderContainer}>
        {/* Custom TurboModule Native Security Diagnostic Card */}
        <View style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <View style={styles.securityTitleRow}>
              <Text style={styles.securityIcon}>🛡️</Text>
              <Text style={styles.securityTitle}>Native Security Status</Text>
            </View>
            <View style={styles.turboBadgeContainer}>
              <Text style={styles.turboBadgeText}>JSI TURBOMODULE</Text>
            </View>
          </View>

          <Text style={styles.securityDesc}>
            Status hardware & sistem keamanan Android dipanggil langsung melalui C++ JSI tanpa async bridge.
          </Text>

          <View style={styles.securityGrid}>
            <View style={styles.securityRow}>
              <Text style={styles.securityLabel}>Tingkat Keamanan:</Text>
              <View
                style={[
                  styles.levelBadge,
                  securityStatus?.securityLevel === 'HIGH'
                    ? styles.levelHigh
                    : securityStatus?.securityLevel === 'MEDIUM'
                    ? styles.levelMedium
                    : styles.levelLow,
                ]}>
                <Text style={styles.levelText}>
                  {securityStatus?.securityLevel || 'CHECKING...'}
                </Text>
              </View>
            </View>

            <View style={styles.securityRow}>
              <Text style={styles.securityLabel}>Kunci Layar (PIN/Biometrik):</Text>
              <Text
                style={[
                  styles.statusVal,
                  securityStatus?.isDeviceSecure
                    ? styles.statusSuccess
                    : styles.statusWarning,
                ]}>
                {securityStatus?.isDeviceSecure ? 'AKTIF ✅' : 'TIDAK AKTIF ⚠️'}
              </Text>
            </View>

            <View style={styles.securityRow}>
              <Text style={styles.securityLabel}>Hardware Keystore (TEE):</Text>
              <Text
                style={[
                  styles.statusVal,
                  securityStatus?.hasHardwareKeystore
                    ? styles.statusSuccess
                    : styles.statusWarning,
                ]}>
                {securityStatus?.hasHardwareKeystore
                  ? 'DIDUKUNG 🔐'
                  : 'SOFTWARE-ONLY ⚠️'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.recheckBtn}
            onPress={loadSecurityDiagnostics}
            disabled={checkingSecurity}>
            {checkingSecurity ? (
              <ActivityIndicator size="small" color="#38bdf8" />
            ) : (
              <Text style={styles.recheckBtnText}>🔄 Re-check via JSI</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Top Action Bar */}
        <View style={styles.actionBar}>
          <View style={styles.titleCol}>
            <Text style={styles.sectionTitle}>Daftar Catatan</Text>
            <Text style={styles.sectionSubtitle}>
              {notes.length} catatan terenkripsi (AES)
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setIsModalVisible(true)}>
            <Text style={styles.addBtnText}>+ Tambah</Text>
          </TouchableOpacity>
        </View>

        {/* Stress Test & Performance Control Card */}
        <View style={styles.stressCard}>
          <View style={styles.stressHeader}>
            <Text style={styles.stressTitle}>🚀 Fabric FlatList Stress-Test</Text>
            <Text style={styles.stressBadge}>FASE 6</Text>
          </View>
          <Text style={styles.stressDesc}>
            Uji performa Fabric UI recycling dengan me-render ratusan catatan terenkripsi AES secara instan.
          </Text>

          <View style={styles.stressButtonsRow}>
            <TouchableOpacity
              style={[
                styles.stressBtn,
                generatingCount === 100 && styles.stressBtnDisabled,
              ]}
              disabled={generatingCount !== null}
              onPress={() => handleGenerateStressTest(100)}>
              {generatingCount === 100 ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.stressBtnText}>+100 Notes</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.stressBtn,
                styles.stressBtnPurple,
                generatingCount === 500 && styles.stressBtnDisabled,
              ]}
              disabled={generatingCount !== null}
              onPress={() => handleGenerateStressTest(500)}>
              {generatingCount === 500 ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.stressBtnText}>+500 Notes</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.stressBtn,
                styles.stressBtnRed,
                (generatingCount !== null || notes.length === 0) &&
                  styles.stressBtnDisabled,
              ]}
              disabled={generatingCount !== null || notes.length === 0}
              onPress={handleClearAllNotes}>
              <Text style={styles.stressBtnText}>Bersihkan</Text>
            </TouchableOpacity>
          </View>

          {perfBenchmarkText && (
            <View style={styles.perfResultBox}>
              <Text style={styles.perfResultText}>{perfBenchmarkText}</Text>
            </View>
          )}
        </View>
      </View>
    ),
    [
      securityStatus,
      checkingSecurity,
      loadSecurityDiagnostics,
      notes.length,
      generatingCount,
      perfBenchmarkText,
      handleGenerateStressTest,
      handleClearAllNotes,
    ],
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      {/* App Bar */}
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

      {/* Main FlatList with Fabric High Performance Optimizations */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>Memuat catatan terenkripsi...</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={headerComponent}
          contentContainerStyle={styles.listContent}
          // High performance FlatList & Fabric optimization props
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          updateCellsBatchingPeriod={50}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#38bdf8"
              colors={['#38bdf8']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>Belum Ada Catatan</Text>
              <Text style={styles.emptySubtitle}>
                Tekan tombol "+ Tambah" atau gunakan fitur "+100 Notes" di atas
                untuk menguji scrolling 60/120 FPS.
              </Text>
            </View>
          }
        />
      )}

      {/* Add Note Modal */}
      <AddNoteModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateNote}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  greeting: {
    fontSize: 13,
    color: '#94a3b8',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  logoutBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoutText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 12,
  },
  listHeaderContainer: {
    marginBottom: 8,
  },
  securityCard: {
    backgroundColor: '#131e32',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e3a8a',
    marginTop: 12,
    marginBottom: 8,
  },
  securityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  securityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityIcon: {
    fontSize: 16,
  },
  securityTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
  turboBadgeContainer: {
    backgroundColor: '#0369a1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  turboBadgeText: {
    color: '#e0f2fe',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  securityDesc: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  securityGrid: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  securityLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '500',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levelHigh: {
    backgroundColor: '#064e3b',
  },
  levelMedium: {
    backgroundColor: '#78350f',
  },
  levelLow: {
    backgroundColor: '#7f1d1d',
  },
  levelText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  statusVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusSuccess: {
    color: '#34d399',
  },
  statusWarning: {
    color: '#fbbf24',
  },
  recheckBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 10,
  },
  recheckBtnText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  titleCol: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  stressCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  stressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stressTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  stressBadge: {
    backgroundColor: '#0284c7',
    color: '#e0f2fe',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stressDesc: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  stressButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stressBtn: {
    flex: 1,
    backgroundColor: '#0369a1',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stressBtnPurple: {
    backgroundColor: '#6d28d9',
  },
  stressBtnRed: {
    backgroundColor: '#991b1b',
  },
  stressBtnDisabled: {
    opacity: 0.5,
  },
  stressBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  perfResultBox: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  perfResultText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default HomeScreen;
