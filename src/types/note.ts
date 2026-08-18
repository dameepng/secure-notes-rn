export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
}

export interface NoteInput {
  title: string;
  content: string;
}
