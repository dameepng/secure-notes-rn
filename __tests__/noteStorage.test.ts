import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  bulkCreateNotes,
  clearAllNotes,
  createNote,
  deleteNote,
  getNotes,
  getRawStoredNotes,
} from '../src/storage/noteStorage';

describe('noteStorage with AES Encryption', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  const userId = 'user_123';
  const plainTitle = 'Rencana Rahasia 2026';
  const sensitiveContent = 'Password brankas: 987654321 dan kunci rahasia!';

  it('should return an empty array when no notes exist', async () => {
    const notes = await getNotes(userId);
    expect(notes).toEqual([]);
  });

  it('should encrypt note content in raw storage and decrypt on retrieval', async () => {
    const createdNote = await createNote(
      { title: plainTitle, content: sensitiveContent },
      userId,
    );

    // 1. Verifikasi data mentah di AsyncStorage (Raw Storage Verification)
    const rawStoredList = await getRawStoredNotes();
    expect(rawStoredList).toHaveLength(1);

    const rawNote = rawStoredList[0];
    expect(rawNote.isEncrypted).toBe(true);
    // Pastikan isi mentah di storage TIDAK sama dengan plain text sensitif
    expect(rawNote.content).not.toBe(sensitiveContent);
    // Ciphertext AES berawalan Salted__ ("U2FsdGVkX1") dalam format Base64
    expect(rawNote.content).toContain('U2FsdGVkX1');

    // 2. Verifikasi fungsi getNotes() berhasil mendekripsi kembali ke plain text
    const decryptedList = await getNotes(userId);
    expect(decryptedList).toHaveLength(1);
    expect(decryptedList[0].id).toBe(createdNote.id);
    expect(decryptedList[0].title).toBe(plainTitle);
    expect(decryptedList[0].content).toBe(sensitiveContent);
  });

  it('should support bulkCreateNotes for high performance stress test with encryption', async () => {
    const dummyInputs = Array.from({ length: 50 }, (_, i) => ({
      title: `Bulk Note #${i + 1}`,
      content: `Sensitive Payload #${i + 1}`,
    }));

    const created = await bulkCreateNotes(dummyInputs, userId);
    expect(created).toHaveLength(50);

    const rawStored = await getRawStoredNotes();
    expect(rawStored).toHaveLength(50);
    expect(rawStored[0].isEncrypted).toBe(true);
    expect(rawStored[0].content).toContain('U2FsdGVkX1');

    const decrypted = await getNotes(userId);
    expect(decrypted).toHaveLength(50);
    expect(decrypted[0].title).toBeDefined();
    expect(decrypted[0].content).toContain('Sensitive Payload');
  });

  it('should return empty array when bulkCreateNotes receives empty inputs', async () => {
    const result = await bulkCreateNotes([], userId);
    expect(result).toEqual([]);
  });

  it('should throw an error if note title is empty', async () => {
    await expect(
      createNote({ title: '   ', content: 'Isi' }, userId),
    ).rejects.toThrow('Judul catatan tidak boleh kosong.');
  });

  it('should filter decrypted notes by userId', async () => {
    await createNote(
      { title: 'User 1 Note', content: 'Rahasia User 1' },
      'user_1',
    );
    await createNote(
      { title: 'User 2 Note', content: 'Rahasia User 2' },
      'user_2',
    );

    const user1Notes = await getNotes('user_1');
    const user2Notes = await getNotes('user_2');

    expect(user1Notes).toHaveLength(1);
    expect(user1Notes[0].title).toBe('User 1 Note');
    expect(user1Notes[0].content).toBe('Rahasia User 1');

    expect(user2Notes).toHaveLength(1);
    expect(user2Notes[0].title).toBe('User 2 Note');
    expect(user2Notes[0].content).toBe('Rahasia User 2');
  });

  it('should delete an encrypted note by ID', async () => {
    const note1 = await createNote(
      { title: 'Note 1', content: 'Isi 1' },
      userId,
    );
    const note2 = await createNote(
      { title: 'Note 2', content: 'Isi 2' },
      userId,
    );

    let notes = await getNotes(userId);
    expect(notes).toHaveLength(2);

    await deleteNote(note1.id);

    notes = await getNotes(userId);
    expect(notes).toHaveLength(1);
    expect(notes[0].id).toBe(note2.id);
    expect(notes[0].content).toBe('Isi 2');
  });

  it('should clear all encrypted notes', async () => {
    await createNote({ title: 'Note 1', content: '1' }, userId);
    await createNote({ title: 'Note 2', content: '2' }, userId);

    await clearAllNotes();

    const notes = await getNotes(userId);
    expect(notes).toEqual([]);
  });
});
