import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note, NoteInput } from '../types/note';

const NOTES_STORAGE_KEY = '@securenotes/notes_plaintext';

/**
 * Mengambil daftar catatan dari AsyncStorage (plain text untuk Fase 4).
 * Enkripsi akan diimplementasikan pada Fase 5.
 */
export async function getNotes(userId?: string): Promise<Note[]> {
  try {
    const rawData = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    if (!rawData) {
      return [];
    }

    const allNotes: Note[] = JSON.parse(rawData);

    // Filter berdasarkan userId jika disediakan
    const userNotes = userId
      ? allNotes.filter(n => n.userId === userId)
      : allNotes;

    // Urutkan dari yang terbaru
    return userNotes.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error fetching notes from AsyncStorage:', error);
    return [];
  }
}

/**
 * Membuat catatan baru dan menyimpannya ke AsyncStorage.
 */
export async function createNote(
  input: NoteInput,
  userId: string,
): Promise<Note> {
  const title = input.title.trim();
  const content = input.content.trim();

  if (!title) {
    throw new Error('Judul catatan tidak boleh kosong.');
  }

  const now = Date.now();
  const newNote: Note = {
    id: `note_${now}_${Math.random().toString(36).substring(2, 8)}`,
    title,
    content,
    createdAt: now,
    updatedAt: now,
    userId,
  };

  try {
    const rawData = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    const existingNotes: Note[] = rawData ? JSON.parse(rawData) : [];
    const updatedNotes = [newNote, ...existingNotes];

    await AsyncStorage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify(updatedNotes),
    );

    return newNote;
  } catch (error) {
    console.error('Error creating note in AsyncStorage:', error);
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

    const existingNotes: Note[] = JSON.parse(rawData);
    const updatedNotes = existingNotes.filter(n => n.id !== noteId);

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
  createNote,
  deleteNote,
  clearAllNotes,
};
