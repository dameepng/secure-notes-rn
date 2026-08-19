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
  Button,
  ButtonText,
  ButtonSpinner,
  Spinner,
  Center,
} from '@gluestack-ui/themed';

import { useAuth } from '../navigation/AuthContext';
import {
  bulkCreateNotes,
  clearAllNotes,
  createNote,
  deleteNote,
  getNotes,
  getRawStoredNotes,
  syncNotesFromApi,
} from '../storage/noteStorage';
import {
  createNoteInApi,
  deleteNoteFromApi,
} from '../api/notesApi';
import { Note, NoteInput } from '../types/note';
import NoteCard from '../components/NoteCard';
import AddNoteModal from '../components/AddNoteModal';
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

  const userId = user?.id || 'guest_user';

  const loadNotes = useCallback(async () => {
    setLoadError(null);
    try {
      // 1. Tampilkan catatan lokal terlebih dahulu
      const localData = await getNotes(user?.id);
      setNotes(localData);

      // 2. Sinkronkan dengan MockAPI di background
      const syncedData = await syncNotesFromApi(user?.id);
      if (syncedData && syncedData.length > 0) {
        setNotes(syncedData);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
      const msg = 'Gagal memuat catatan.';
      setLoadError(msg);
      showError(msg, 'Storage Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, showError]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const synced = await syncNotesFromApi(user?.id);
      setNotes(synced);
    } catch (error) {
      console.warn('Refresh sync failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.id]);

  const handleCreateNote = async (input: NoteInput) => {
    try {
      const newNote = await createNote(input, userId);
      setNotes(prev => [newNote, ...prev]);

      // Kirim data terenkripsi ke MockAPI endpoint /notes
      try {
        const rawNotes = await getRawStoredNotes();
        const stored = rawNotes.find(n => n.id === newNote.id);
        if (stored) {
          await createNoteInApi(stored);
        }
      } catch (apiError) {
        console.warn('Gagal sinkronisasi catatan ke MockAPI (tersimpan lokal):', apiError);
      }

      showSuccess(`"${newNote.title}" disimpan.`);
    } catch (error) {
      showError((error as Error).message || 'Gagal menyimpan catatan.');
      throw error;
    }
  };

  const handleDeleteNote = useCallback(
    (noteId: string) => {
      RNAlert.alert(
        'Hapus Catatan',
        'Yakin ingin menghapus catatan ini?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteNote(noteId);
                deleteNoteFromApi(noteId).catch(() => {});
                setNotes(prev => prev.filter(n => n.id !== noteId));
                showInfo('Catatan dihapus.');
              } catch (error) {
                showError('Gagal menghapus catatan.');
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
        const benchmarkMsg = `${count} catatan dibuat dalam ${elapsedMs}ms. Total: ${
          notes.length + count
        }.`;
        setPerfBenchmarkText(benchmarkMsg);
        showSuccess(`${count} catatan dibuat (${elapsedMs}ms).`);
      } catch (error) {
        console.error('Stress test generation failed:', error);
        showError('Gagal membuat catatan dummy.');
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
      'Hapus Semua',
      `Hapus ${notes.length} catatan?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllNotes();
              setNotes([]);
              setPerfBenchmarkText(null);
              showInfo('Semua catatan dihapus.');
            } catch (error) {
              showError('Gagal mengosongkan catatan.');
            }
          },
        },
      ],
    );
  }, [notes.length, showInfo, showError]);

  const handleLogout = () => {
    RNAlert.alert('Logout', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
            showInfo('Sesi berakhir.');
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
      <VStack space="md" mb="$4">
        {/* Load Error */}
        {loadError && (
          <HStack
            justifyContent="space-between"
            alignItems="center"
            bg="#1a1a1a"
            borderRadius="$lg"
            p="$3">
            <Text color="#999999" size="xs" flex={1}>
              {loadError}
            </Text>
            <Button size="xs" variant="solid" bg="#333333" borderRadius="$md" onPress={loadNotes}>
              <ButtonText color="#ffffff" fontSize="$2xs">Coba Lagi</ButtonText>
            </Button>
          </HStack>
        )}

        {/* Notes Header */}
        <HStack justifyContent="space-between" alignItems="center" py="$1">
          <VStack>
            <Heading size="md" color="#ffffff" fontWeight="$bold">
              Catatan
            </Heading>
            <Text size="xs" color="#666666">
              {notes.length} catatan
            </Text>
          </VStack>
          <Button
            size="sm"
            variant="solid"
            action="primary"
            bg="#ffffff"
            borderRadius="$lg"
            onPress={() => setIsModalVisible(true)}>
            <ButtonText color="#000000" fontWeight="$bold" fontSize="$xs">
              Tambah
            </ButtonText>
          </Button>
        </HStack>

        {/* Stress Test */}
        <Box bg="#111111" borderColor="#222222" borderWidth={1} borderRadius="$lg" p="$4">
          <VStack space="sm">
            <Text size="xs" color="#888888">
              Stress Test
            </Text>

            <HStack space="sm">
              <Button
                flex={1}
                size="xs"
                variant="solid"
                action="primary"
                bg="#222222"
                borderRadius="$lg"
                isDisabled={generatingCount !== null}
                onPress={() => handleGenerateStressTest(100)}>
                {generatingCount === 100 ? (
                  <ButtonSpinner color="#ffffff" />
                ) : (
                  <ButtonText color="#ffffff" fontWeight="$bold" fontSize="$2xs">
                    +100
                  </ButtonText>
                )}
              </Button>

              <Button
                flex={1}
                size="xs"
                variant="solid"
                action="primary"
                bg="#222222"
                borderRadius="$lg"
                isDisabled={generatingCount !== null}
                onPress={() => handleGenerateStressTest(500)}>
                {generatingCount === 500 ? (
                  <ButtonSpinner color="#ffffff" />
                ) : (
                  <ButtonText color="#ffffff" fontWeight="$bold" fontSize="$2xs">
                    +500
                  </ButtonText>
                )}
              </Button>

              <Button
                flex={1}
                size="xs"
                variant="solid"
                action="negative"
                bg="#222222"
                borderRadius="$lg"
                isDisabled={generatingCount !== null || notes.length === 0}
                onPress={handleClearAllNotes}>
                <ButtonText color="#666666" fontWeight="$bold" fontSize="$2xs">
                  Hapus Semua
                </ButtonText>
              </Button>
            </HStack>

            {perfBenchmarkText && (
              <Text size="2xs" color="#666666">
                {perfBenchmarkText}
              </Text>
            )}
          </VStack>
        </Box>
      </VStack>
    ),
    [
      loadError,
      loadNotes,
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
      bg="#000000"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* App Bar */}
      <HStack
        justifyContent="space-between"
        alignItems="center"
        px="$5"
        pt="$3"
        pb="$4"
        borderBottomWidth={1}
        borderBottomColor="#1a1a1a">
        <Heading size="xl" color="#ffffff" fontWeight="$bold">
          {user?.name || 'Pengguna'}
        </Heading>

        <Button
          size="sm"
          variant="outline"
          action="secondary"
          borderColor="#333333"
          borderRadius="$lg"
          onPress={handleLogout}
          isDisabled={loggingOut}>
          {loggingOut ? (
            <ButtonSpinner color="#666666" />
          ) : (
            <ButtonText color="#666666" fontSize="$xs" fontWeight="$bold">
              Logout
            </ButtonText>
          )}
        </Button>
      </HStack>

      {/* Main FlatList */}
      {loading ? (
        <Center flex={1}>
          <Spinner size="large" color="#ffffff" />
        </Center>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={headerComponent}
          contentContainerStyle={styles.listContent}
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
              tintColor="#ffffff"
              colors={['#ffffff']}
            />
          }
          ListEmptyComponent={
            <Center py="$10" px="$4">
              <Heading size="md" color="#ffffff" fontWeight="$bold" mb="$1">
                Belum Ada Catatan
              </Heading>
              <Text size="xs" color="#555555" textAlign="center">
                Tekan "Tambah" untuk membuat catatan baru.
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
    paddingTop: 16,
    paddingBottom: 32,
  },
});

export default HomeScreen;
