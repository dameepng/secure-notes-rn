import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note, NoteInput } from '../types/note';
import { decrypt, encrypt } from './encryption';
import { fetchNotesFromApi } from '../api/notesApi';

const NOTES_STORAGE_KEY = '@securenotes/notes_encrypted_v1';

export interface StoredNote {
  id: string;
  title: string;
  content: string; // Stored as AES ciphertext
  createdAt: number;
  updatedAt: number;
  userId: string;
  isEncrypted: boolean;
}

/**
 * Mengambil daftar catatan dari AsyncStorage lokal dan mendekripsinya menjadi plain text secara aman.
 * Menangani kasus data korup / JSON malformed tanpa menyebabkan aplikasi crash.
 */
export async function getNotes(userId?: string): Promise<Note[]> {
  try {
    const rawData = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    if (!rawData) {
      return [];
    }

    let storedNotes: StoredNote[] = [];
    try {
      storedNotes = JSON.parse(rawData);
      if (!Array.isArray(storedNotes)) {
        console.warn(
          'Stored notes data is not an array, initializing empty list.',
        );
        return [];
      }
    } catch (parseError) {
      console.error(
        'Failed to parse notes JSON from storage (Data corrupted):',
        parseError,
      );
      return [];
    }

    // Filter berdasarkan userId jika disediakan
    const userNotes = userId
      ? storedNotes.filter(n => n && String(n.userId) === String(userId))
      : storedNotes.filter(Boolean);

    // Dekripsi setiap catatan secara aman
    const decryptedNotes: Note[] = userNotes.map(item => {
      let decryptedContent = item.content || '';

      if (item.isEncrypted && item.content) {
        try {
          decryptedContent = decrypt(item.content);
        } catch (error) {
          console.warn(`Failed to decrypt note ${item.id}:`, error);
          decryptedContent = '[Terkunci: Gagal mendekripsi atau data korup]';
        }
      }

      return {
        id: item.id || `note_corrupt_${Math.random()}`,
        title: item.title || '(Tanpa Judul)',
        content: decryptedContent,
        createdAt: item.createdAt || Date.now(),
        updatedAt: item.updatedAt || Date.now(),
        userId: item.userId || 'unknown',
      };
    });

    // Urutkan dari yang terbaru
    return decryptedNotes.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error fetching/decrypting notes from AsyncStorage:', error);
    return [];
  }
}

/**
 * Mengambil data mentah (raw ciphertext) langsung dari AsyncStorage untuk verifikasi keamanan.
 */
export async function getRawStoredNotes(): Promise<StoredNote[]> {
  try {
    const rawData = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    if (!rawData) {
      return [];
    }
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading raw stored notes:', error);
    return [];
  }
}

/**
 * Mengambil daftar catatan dari MockAPI dan menyinkronkannya ke local AsyncStorage.
 */
export async function syncNotesFromApi(userId?: string): Promise<Note[]> {
  try {
    const remoteNotes = await fetchNotesFromApi(userId);
    if (Array.isArray(remoteNotes) && remoteNotes.length > 0) {
      const decryptedNotes: Note[] = [];
      const storedNotesToSave: StoredNote[] = [];

      remoteNotes.forEach(item => {
        let decryptedContent = item.content || '';
        if (item.isEncrypted && item.content) {
          try {
            decryptedContent = decrypt(item.content);
          } catch {
            decryptedContent = item.content;
          }
        }

        const created = item.createAt || item.createdAt || Date.now();
        const updated = item.updateAt || item.updatedAt || created;

        decryptedNotes.push({
          id: String(item.id),
          title: item.title || '(Tanpa Judul)',
          content: decryptedContent,
          createdAt: Number(created),
          updatedAt: Number(updated),
          userId: String(item.userId || 'unknown'),
        });

        storedNotesToSave.push({
          id: String(item.id),
          title: item.title || '(Tanpa Judul)',
          content: item.content || '',
          createdAt: Number(created),
          updatedAt: Number(updated),
          userId: String(item.userId || 'unknown'),
          isEncrypted: Boolean(item.isEncrypted),
        });
      });

      await AsyncStorage.setItem(
        NOTES_STORAGE_KEY,
        JSON.stringify(storedNotesToSave),
      );

      return decryptedNotes.sort((a, b) => b.createdAt - a.createdAt);
    }
  } catch (error) {
    console.warn('Failed to sync notes from MockAPI:', error);
  }

  // Fallback to local storage
  return getNotes(userId);
}

/**
 * Membuat catatan baru dengan mengenkripsi kontennya (AES) sebelum disimpan ke AsyncStorage.
 */
export async function createNote(
  input: NoteInput,
  userId: string,
): Promise<Note> {
  const title = input.title?.trim() || '';
  const plainContent = input.content?.trim() || '';

  if (!title) {
    throw new Error('Judul catatan tidak boleh kosong.');
  }

  // Enkripsi isi catatan menggunakan AES
  let cipherContent = '';
  if (plainContent) {
    try {
      cipherContent = encrypt(plainContent);
    } catch (encError) {
      console.error('Failed to encrypt note content:', encError);
      throw new Error('Gagal mengenkripsi isi catatan.');
    }
  }

  const now = Date.now();
  const storedNote: StoredNote = {
    id: `note_${now}_${Math.random().toString(36).substring(2, 8)}`,
    title,
    content: cipherContent,
    createdAt: now,
    updatedAt: now,
    userId,
    isEncrypted: true,
  };

  try {
    const rawData = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    let existingNotes: StoredNote[] = [];
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        if (Array.isArray(parsed)) {
          existingNotes = parsed;
        }
      } catch {
        existingNotes = [];
      }
    }

    const updatedNotes = [storedNote, ...existingNotes];

    await AsyncStorage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify(updatedNotes),
    );

    // Return format Note dengan plainContent asli untuk state UI
    return {
      id: storedNote.id,
      title: storedNote.title,
      content: plainContent,
      createdAt: storedNote.createdAt,
      updatedAt: storedNote.updatedAt,
      userId: storedNote.userId,
    };
  } catch (error) {
    console.error('Error saving note to AsyncStorage:', error);
    throw error;
  }
}

/**
 * Membuat banyak catatan sekaligus (bulk) dengan enkripsi untuk kebutuhan stress-test performa.
 */
export async function bulkCreateNotes(
  inputs: NoteInput[],
  userId: string,
): Promise<Note[]> {
  if (inputs.length === 0) {
    return [];
  }

  const baseTimestamp = Date.now();
  const newStoredNotes: StoredNote[] = [];
  const newPlainNotes: Note[] = [];

  inputs.forEach((input, index) => {
    const title = input.title?.trim() || `Catatan #${index + 1}`;
    const plainContent = input.content?.trim() || '';
    const cipherContent = plainContent ? encrypt(plainContent) : '';
    const noteTime = baseTimestamp + index;

    const stored: StoredNote = {
      id: `note_bulk_${noteTime}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      content: cipherContent,
      createdAt: noteTime,
      updatedAt: noteTime,
      userId,
      isEncrypted: true,
    };

    newStoredNotes.push(stored);
    newPlainNotes.push({
      id: stored.id,
      title: stored.title,
      content: plainContent,
      createdAt: stored.createdAt,
      updatedAt: stored.updatedAt,
      userId: stored.userId,
    });
  });

  try {
    const rawData = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    let existingNotes: StoredNote[] = [];
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        if (Array.isArray(parsed)) {
          existingNotes = parsed;
        }
      } catch {
        existingNotes = [];
      }
    }

    const updatedNotes = [...newStoredNotes.reverse(), ...existingNotes];

    await AsyncStorage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify(updatedNotes),
    );

    return newPlainNotes.reverse();
  } catch (error) {
    console.error('Error in bulkCreateNotes:', error);
    throw error;
  }
}

/**
 * Menghapus catatan berdasarkan ID dari AsyncStorage.
 */
export async function deleteNote(noteId: string): Promise<void> {
  try {
    const rawData = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    if (!rawData) {
      return;
    }

    let existingNotes: StoredNote[] = [];
    try {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed)) {
        existingNotes = parsed;
      }
    } catch {
      return;
    }

    const updatedNotes = existingNotes.filter(n => n && n.id !== noteId);

    await AsyncStorage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify(updatedNotes),
    );
  } catch (error) {
    console.error('Error deleting note from AsyncStorage:', error);
    throw error;
  }
}

/**
 * Menghapus semua catatan (berguna untuk testing/reset).
 */
export async function clearAllNotes(): Promise<void> {
  try {
    await AsyncStorage.removeItem(NOTES_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing notes from AsyncStorage:', error);
    throw error;
  }
}

export default {
  getNotes,
  getRawStoredNotes,
  syncNotesFromApi,
  createNote,
  bulkCreateNotes,
  deleteNote,
  clearAllNotes,
};
