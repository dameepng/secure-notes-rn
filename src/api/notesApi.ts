import apiClient, { formatApiError } from './client';
import { StoredNote } from '../storage/noteStorage';

export interface MockApiNote {
  id: string;
  title: string;
  content: string; // Ciphertext AES
  isEncrypted: boolean;
  createAt?: number;
  updateAt?: number;
  createdAt?: number;
  updatedAt?: number;
  userId: string;
}

/**
 * Mengambil daftar catatan dari MockAPI endpoint `/notes`.
 */
export async function fetchNotesFromApi(
  userId?: string,
): Promise<MockApiNote[]> {
  try {
    const response = await apiClient.get<MockApiNote[]>('/notes');
    const allNotes = Array.isArray(response.data) ? response.data : [];
    if (userId) {
      return allNotes.filter(
        n => String(n.userId).toLowerCase() === String(userId).toLowerCase(),
      );
    }
    return allNotes;
  } catch (error) {
    throw formatApiError(error);
  }
}

/**
 * Menyimpan catatan baru ke MockAPI endpoint `/notes`.
 */
export async function createNoteInApi(
  note: StoredNote,
): Promise<MockApiNote> {
  try {
    const response = await apiClient.post<MockApiNote>('/notes', {
      title: note.title,
      content: note.content,
      isEncrypted: note.isEncrypted,
      createAt: note.createdAt,
      updateAt: note.updatedAt,
      userId: String(note.userId),
    });
    return response.data;
  } catch (error) {
    throw formatApiError(error);
  }
}

/**
 * Menghapus catatan dari MockAPI berdasarkan ID.
 */
export async function deleteNoteFromApi(noteId: string): Promise<void> {
  try {
    await apiClient.delete(`/notes/${noteId}`);
  } catch (error) {
    throw formatApiError(error);
  }
}

export default {
  fetchNotesFromApi,
  createNoteInApi,
  deleteNoteFromApi,
};
