import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearAllNotes,
  createNote,
  deleteNote,
  getNotes,
} from '../src/storage/noteStorage';

describe('noteStorage CRUD Operations', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  const userId = 'user_123';

  it('should return an empty array when no notes exist', async () => {
    const notes = await getNotes(userId);
    expect(notes).toEqual([]);
  });

  it('should create and persist a new note', async () => {
    const newNote = await createNote(
      { title: 'Catatan Rahasia', content: 'Isi catatan rahasia' },
      userId,
    );

    expect(newNote).toHaveProperty('id');
    expect(newNote.title).toBe('Catatan Rahasia');
    expect(newNote.content).toBe('Isi catatan rahasia');
    expect(newNote.userId).toBe(userId);
    expect(newNote.createdAt).toBeGreaterThan(0);

    const savedNotes = await getNotes(userId);
    expect(savedNotes).toHaveLength(1);
    expect(savedNotes[0].id).toBe(newNote.id);
  });

  it('should throw an error if note title is empty', async () => {
    await expect(
      createNote({ title: '   ', content: 'Isi' }, userId),
    ).rejects.toThrow('Judul catatan tidak boleh kosong.');
  });

  it('should filter notes by userId', async () => {
    await createNote({ title: 'User 1 Note', content: '1' }, 'user_1');
    await createNote({ title: 'User 2 Note', content: '2' }, 'user_2');

    const user1Notes = await getNotes('user_1');
    const user2Notes = await getNotes('user_2');

    expect(user1Notes).toHaveLength(1);
    expect(user1Notes[0].title).toBe('User 1 Note');

    expect(user2Notes).toHaveLength(1);
    expect(user2Notes[0].title).toBe('User 2 Note');
  });

  it('should delete a note by ID', async () => {
    const note1 = await createNote({ title: 'Note 1', content: '1' }, userId);
    const note2 = await createNote({ title: 'Note 2', content: '2' }, userId);

    let notes = await getNotes(userId);
    expect(notes).toHaveLength(2);

    await deleteNote(note1.id);

    notes = await getNotes(userId);
    expect(notes).toHaveLength(1);
    expect(notes[0].id).toBe(note2.id);
  });

  it('should clear all notes', async () => {
    await createNote({ title: 'Note 1', content: '1' }, userId);
    await createNote({ title: 'Note 2', content: '2' }, userId);

    await clearAllNotes();

    const notes = await getNotes(userId);
    expect(notes).toEqual([]);
  });
});
