import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert as RNAlert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  Badge,
  BadgeText,
  Button,
  ButtonText,
  ButtonSpinner,
  Spinner,
  Alert,
  AlertText,
  Center,
} from '@gluestack-ui/themed';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
  Plus,
  Zap,
  Trash2,
  LogOut,
  FileText,
  AlertCircle,
  PlusCircle,
  Layers,
} from 'lucide-react-native';

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
import { useToast } from '../components/ToastContext';

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
  const { showSuccess, showError, showInfo } = useToast();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
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
    setLoadError(null);
    try {
      const data = await getNotes(user?.id);
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
      const msg = 'Gagal memuat catatan dari penyimpanan lokal.';
      setLoadError(msg);
      showError(msg, 'Storage Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, showError]);

  const loadSecurityDiagnostics = useCallback(async () => {
    setCheckingSecurity(true);
    try {
      const status = await checkDeviceSecurityStatus();
      setSecurityStatus(status);
    } catch (error) {
      console.error('Failed to load native security status:', error);
      showError('Gagal memanggil native security module.', 'TurboModule Error');
    } finally {
      setCheckingSecurity(false);
    }
  }, [showError]);

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
    try {
      const newNote = await createNote(input, userId);
      setNotes(prev => [newNote, ...prev]);
      showSuccess(`Catatan "${newNote.title}" berhasil dienkripsi & disimpan.`);
    } catch (error) {
      showError((error as Error).message || 'Gagal menyimpan catatan.');
      throw error;
    }
  };

  const handleDeleteNote = useCallback(
    (noteId: string) => {
      RNAlert.alert(
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
                showInfo('Catatan berhasil dihapus.');
              } catch (error) {
                showError('Gagal menghapus catatan dari penyimpanan.');
              }
            },
          },
        ],
      );
    },
    [showInfo, showError],
  );

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
        const benchmarkMsg = `Berhasil generate & enkripsi ${count} catatan dalam ${elapsedMs}ms! Total: ${
          notes.length + count
        } items.`;
        setPerfBenchmarkText(benchmarkMsg);
        showSuccess(`Berhasil membuat ${count} catatan (${elapsedMs}ms).`);
      } catch (error) {
        console.error('Stress test generation failed:', error);
        showError('Gagal membuat catatan dummy untuk stress test.');
      } finally {
        setGeneratingCount(null);
      }
    },
    [notes.length, userId, showSuccess, showError],
  );

  const handleClearAllNotes = useCallback(() => {
    if (notes.length === 0) {
      return;
    }

    RNAlert.alert(
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
              setPerfBenchmarkText('Semua catatan berhasil dibersihkan.');
              showInfo('Seluruh catatan berhasil dibersihkan.');
            } catch (error) {
              showError('Gagal mengosongkan catatan.');
            }
          },
        },
      ],
    );
  }, [notes.length, showInfo, showError]);

  const handleLogout = () => {
    RNAlert.alert('Konfirmasi Logout', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
            showInfo('Sesi login telah berakhir.');
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
      <VStack space="md" mb="$2">
        {/* Storage Load Error Banner */}
        {loadError && (
          <Alert action="error" variant="accent" bg="#450a0a" borderColor="#ef4444" borderRadius="$xl" p="$3">
            <HStack justifyContent="space-between" alignItems="center" flex={1}>
              <HStack space="xs" alignItems="center" flex={1} mr="$2">
                <AlertCircle size={16} color="#fca5a5" />
                <AlertText color="#fca5a5" size="xs" flex={1}>
                  {loadError}
                </AlertText>
              </HStack>
              <Button size="xs" variant="solid" action="negative" bg="#dc2626" borderRadius="$md" onPress={loadNotes}>
                <ButtonText color="#ffffff" fontSize="$2xs">Coba Lagi</ButtonText>
              </Button>
            </HStack>
          </Alert>
        )}

        {/* Custom TurboModule Native Security Diagnostic Card */}
        <Card
          size="md"
          variant="elevated"
          bg="#131e32"
          borderColor="#1e3a8a"
          borderWidth={1}
          borderRadius="$2xl"
          p="$4">
          <VStack space="sm">
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space="xs" alignItems="center">
                <ShieldCheck size={20} color="#38bdf8" />
                <Heading size="sm" color="#f8fafc" fontWeight="$bold">
                  Native Security Status
                </Heading>
              </HStack>
              <Badge size="sm" variant="solid" action="info" bg="#0369a1" borderRadius="$md">
                <BadgeText color="#e0f2fe" fontSize="$2xs" fontWeight="$bold">
                  JSI TURBOMODULE
                </BadgeText>
              </Badge>
            </HStack>

            <Text size="xs" color="#94a3b8" lineHeight="$xs">
              Status hardware & sistem keamanan Android dipanggil langsung melalui C++ JSI tanpa async bridge.
            </Text>

            {/* Grid Detail */}
            <Box bg="#0f172a" borderRadius="$xl" p="$3" borderColor="#1e293b" borderWidth={1}>
              <VStack space="xs">
                <HStack justifyContent="space-between" alignItems="center">
                  <Text size="xs" color="#cbd5e1">Tingkat Keamanan:</Text>
                  <Badge
                    size="sm"
                    variant="solid"
                    bg={
                      securityStatus?.securityLevel === 'HIGH'
                        ? '#064e3b'
                        : securityStatus?.securityLevel === 'MEDIUM'
                        ? '#78350f'
                        : '#7f1d1d'
                    }
                    borderRadius="$sm">
                    <BadgeText color="#ffffff" fontSize="$2xs" fontWeight="$bold">
                      {securityStatus?.securityLevel || 'CHECKING...'}
                    </BadgeText>
                  </Badge>
                </HStack>

                <HStack justifyContent="space-between" alignItems="center">
                  <Text size="xs" color="#cbd5e1">Kunci Layar (PIN/Biometrik):</Text>
                  <HStack space="xs" alignItems="center">
                    {securityStatus?.isDeviceSecure ? (
                      <>
                        <CheckCircle2 size={13} color="#34d399" />
                        <Text size="xs" fontWeight="$bold" color="#34d399">
                          AKTIF
                        </Text>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={13} color="#fbbf24" />
                        <Text size="xs" fontWeight="$bold" color="#fbbf24">
                          TIDAK AKTIF
                        </Text>
                      </>
                    )}
                  </HStack>
                </HStack>

                <HStack justifyContent="space-between" alignItems="center">
                  <Text size="xs" color="#cbd5e1">Hardware Keystore (TEE):</Text>
                  <HStack space="xs" alignItems="center">
                    {securityStatus?.hasHardwareKeystore ? (
                      <>
                        <Lock size={13} color="#34d399" />
                        <Text size="xs" fontWeight="$bold" color="#34d399">
                          DIDUKUNG
                        </Text>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={13} color="#fbbf24" />
                        <Text size="xs" fontWeight="$bold" color="#fbbf24">
                          SOFTWARE-ONLY
                        </Text>
                      </>
                    )}
                  </HStack>
                </HStack>
              </VStack>
            </Box>

            <Button
              size="xs"
              variant="link"
              action="primary"
              onPress={loadSecurityDiagnostics}
              isDisabled={checkingSecurity}
              alignSelf="center">
              {checkingSecurity ? (
                <ButtonSpinner color="#38bdf8" mr="$1" />
              ) : (
                <HStack space="xs" alignItems="center">
                  <RefreshCw size={12} color="#38bdf8" />
                  <ButtonText color="#38bdf8" fontSize="$xs" fontWeight="$semibold">
                    Re-check via JSI Direct Call
                  </ButtonText>
                </HStack>
              )}
            </Button>
          </VStack>
        </Card>

        {/* Section Action Bar */}
        <HStack justifyContent="space-between" alignItems="center" py="$2">
          <VStack>
            <Heading size="md" color="#f1f5f9" fontWeight="$bold">
              Daftar Catatan
            </Heading>
            <Text size="xs" color="#94a3b8">
              {notes.length} catatan terenkripsi (AES)
            </Text>
          </VStack>
          <Button
            size="sm"
            variant="solid"
            action="primary"
            bg="#0284c7"
            borderRadius="$xl"
            onPress={() => setIsModalVisible(true)}>
            <HStack space="xs" alignItems="center">
              <Plus size={14} color="#ffffff" />
              <ButtonText color="#ffffff" fontWeight="$bold" fontSize="$xs">
                Tambah
              </ButtonText>
            </HStack>
          </Button>
        </HStack>

        {/* Stress Test & Performance Control Card */}
        <Card
          size="md"
          variant="elevated"
          bg="#1e293b"
          borderColor="#334155"
          borderWidth={1}
          borderRadius="$2xl"
          p="$4">
          <VStack space="sm">
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space="xs" alignItems="center">
                <Zap size={16} color="#38bdf8" />
                <Heading size="sm" color="#f8fafc" fontWeight="$bold">
                  Fabric FlatList Stress-Test
                </Heading>
              </HStack>
              <Badge size="sm" variant="solid" action="info" bg="#0284c7" borderRadius="$sm">
                <BadgeText color="#e0f2fe" fontSize="$2xs" fontWeight="$bold">
                  FASE 6
                </BadgeText>
              </Badge>
            </HStack>

            <Text size="xs" color="#94a3b8" lineHeight="$xs">
              Uji performa Fabric UI recycling dengan me-render ratusan catatan terenkripsi AES secara instan.
            </Text>

            <HStack space="xs">
              <Button
                flex={1}
                size="xs"
                variant="solid"
                action="primary"
                bg="#0369a1"
                borderRadius="$lg"
                isDisabled={generatingCount !== null}
                onPress={() => handleGenerateStressTest(100)}>
                {generatingCount === 100 ? (
                  <ButtonSpinner color="#ffffff" />
                ) : (
                  <HStack space="xs" alignItems="center">
                    <PlusCircle size={11} color="#ffffff" />
                    <ButtonText color="#ffffff" fontWeight="$bold" fontSize="$2xs">
                      100 Notes
                    </ButtonText>
                  </HStack>
                )}
              </Button>

              <Button
                flex={1}
                size="xs"
                variant="solid"
                action="primary"
                bg="#6d28d9"
                borderRadius="$lg"
                isDisabled={generatingCount !== null}
                onPress={() => handleGenerateStressTest(500)}>
                {generatingCount === 500 ? (
                  <ButtonSpinner color="#ffffff" />
                ) : (
                  <HStack space="xs" alignItems="center">
                    <Layers size={11} color="#ffffff" />
                    <ButtonText color="#ffffff" fontWeight="$bold" fontSize="$2xs">
                      500 Notes
                    </ButtonText>
                  </HStack>
                )}
              </Button>

              <Button
                flex={1}
                size="xs"
                variant="solid"
                action="negative"
                bg="#991b1b"
                borderRadius="$lg"
                isDisabled={generatingCount !== null || notes.length === 0}
                onPress={handleClearAllNotes}>
                <HStack space="xs" alignItems="center">
                  <Trash2 size={11} color="#ffffff" />
                  <ButtonText color="#ffffff" fontWeight="$bold" fontSize="$2xs">
                    Bersihkan
                  </ButtonText>
                </HStack>
              </Button>
            </HStack>

            {perfBenchmarkText && (
              <Box bg="#0f172a" borderRadius="$lg" p="$2.5" borderColor="#0284c7" borderWidth={1}>
                <HStack space="xs" alignItems="center">
                  <Zap size={12} color="#38bdf8" />
                  <Text size="2xs" color="#38bdf8" fontWeight="$semibold" flex={1}>
                    {perfBenchmarkText}
                  </Text>
                </HStack>
              </Box>
            )}
          </VStack>
        </Card>
      </VStack>
    ),
    [
      loadError,
      loadNotes,
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
    <Box
      flex={1}
      bg="#0f172a"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* App Bar */}
      <HStack
        justifyContent="space-between"
        alignItems="center"
        px="$5"
        pt="$3"
        pb="$4"
        borderBottomWidth={1}
        borderBottomColor="#1e293b">
        <VStack>
          <Text size="xs" color="#94a3b8">Halo,</Text>
          <Heading size="xl" color="#f8fafc" fontWeight="$extrabold">
            {user?.name || 'Pengguna'}
          </Heading>
        </VStack>

        <Button
          size="sm"
          variant="outline"
          action="negative"
          borderColor="#334155"
          bg="#1e293b"
          borderRadius="$lg"
          onPress={handleLogout}
          isDisabled={loggingOut}>
          {loggingOut ? (
            <ButtonSpinner color="#ef4444" mr="$1" />
          ) : (
            <HStack space="xs" alignItems="center">
              <LogOut size={13} color="#f87171" />
              <ButtonText color="#f87171" fontSize="$xs" fontWeight="$bold">
                Logout
              </ButtonText>
            </HStack>
          )}
        </Button>
      </HStack>

      {/* Main FlatList with Fabric High Performance Optimizations */}
      {loading ? (
        <Center flex={1}>
          <Spinner size="large" color="#38bdf8" />
          <Text size="xs" color="#94a3b8" mt="$2">
            Memuat catatan terenkripsi...
          </Text>
        </Center>
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
            <Center py="$10" px="$4">
              <Box mb="$3">
                <FileText size={48} color="#475569" strokeWidth={1.5} />
              </Box>
              <Heading size="md" color="#f8fafc" fontWeight="$bold" mb="$1">
                Belum Ada Catatan
              </Heading>
              <Text size="xs" color="#64748b" textAlign="center" lineHeight="$sm">
                Tekan tombol "Tambah" atau gunakan fitur stress-test di atas
                untuk menguji scrolling 60/120 FPS dengan Gluestack UI.
              </Text>
            </Center>
          }
        />
      )}

      {/* Add Note Modal */}
      <AddNoteModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateNote}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
});

export default HomeScreen;
