import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactTestRenderer from 'react-test-renderer';
import { getNotes } from '../src/storage/noteStorage';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { ToastProvider, useToast } from '../src/components/ToastContext';

// Komponen rusak untuk menguji ErrorBoundary
const CrashingComponent: React.FC<{ shouldCrash: boolean }> = ({ shouldCrash }) => {
  if (shouldCrash) {
    throw new Error('Test crash in child component');
  }
  return <Text>Aplikasi Normal</Text>;
};

// Komponen helper untuk menguji useToast
const ToastTester: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  return (
    <>
      <TouchableOpacity
        testID="btn-success"
        onPress={() => showSuccess('Operasi Berhasil')}>
        <Text>Success</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="btn-error"
        onPress={() => showError('Terjadi Error')}>
        <Text>Error</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="btn-warning"
        onPress={() => showWarning('Peringatan')}>
        <Text>Warning</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="btn-info"
        onPress={() => showInfo('Informasi')}>
        <Text>Info</Text>
      </TouchableOpacity>
    </>
  );
};

describe('Fase 8: Error Handling & Resilience', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('Storage Resilience & Data Corruption', () => {
    it('should return empty array without crashing when storage contains corrupted JSON', async () => {
      await AsyncStorage.setItem(
        '@securenotes/notes_encrypted_v1',
        'MALFORMED_CORRUPTED_JSON_STRING{{{',
      );

      const notes = await getNotes('user_123');
      expect(notes).toEqual([]);
    });

    it('should return empty array if stored data is not an array', async () => {
      await AsyncStorage.setItem(
        '@securenotes/notes_encrypted_v1',
        JSON.stringify({ notAnArray: true }),
      );

      const notes = await getNotes('user_123');
      expect(notes).toEqual([]);
    });

    it('should handle individual corrupted encrypted note gracefully without failing whole list', async () => {
      const storedData = [
        {
          id: 'note_corrupt',
          title: 'Catatan Rusak',
          content: 'U2FsdGVkX1_INVALID_CORRUPT_BASE64_PAYLOAD',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          userId: 'user_123',
          isEncrypted: true,
        },
      ];

      await AsyncStorage.setItem(
        '@securenotes/notes_encrypted_v1',
        JSON.stringify(storedData),
      );

      const notes = await getNotes('user_123');
      expect(notes).toHaveLength(1);
      expect(notes[0].title).toBe('Catatan Rusak');
      expect(notes[0].content).toContain('Terkunci');
    });
  });

  describe('ErrorBoundary Component', () => {
    const originalConsoleError = console.error;
    beforeAll(() => {
      console.error = jest.fn();
    });
    afterAll(() => {
      console.error = originalConsoleError;
    });

    it('should catch rendering error and display fallback error UI', () => {
      let renderer: any = null;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <ErrorBoundary>
            <CrashingComponent shouldCrash={true} />
          </ErrorBoundary>,
        );
      });

      expect(renderer).not.toBeNull();
      const treeStr = JSON.stringify(renderer.toJSON());
      expect(treeStr).toContain('Terjadi Kesalahan Aplikasi');
    });

    it('should render children normally when there is no error', () => {
      let renderer: any = null;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <ErrorBoundary>
            <CrashingComponent shouldCrash={false} />
          </ErrorBoundary>,
        );
      });

      const treeStr = JSON.stringify(renderer.toJSON());
      expect(treeStr).toContain('Aplikasi Normal');
    });
  });

  describe('ToastContext & Provider', () => {
    it('should render toast provider and trigger notifications without error', () => {
      let renderer: any = null;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <ToastProvider>
            <ToastTester />
          </ToastProvider>,
        );
      });

      expect(renderer).not.toBeNull();
    });
  });
});
