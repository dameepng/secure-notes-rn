import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Note } from '../types/note';

interface NoteCardProps {
  note: Note;
  onDelete: (noteId: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete }) => {
  const formattedDate = new Date(note.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title}
        </Text>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(note.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.content} numberOfLines={3}>
        {note.content || '(Tidak ada isi)'}
      </Text>

      <View style={styles.footerRow}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>🔒 AES-256 Encrypted</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    flex: 1,
    marginRight: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 14,
  },
  content: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8,
  },
  dateText: {
    fontSize: 11,
    color: '#64748b',
  },
  statusBadge: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#059669',
  },
  statusText: {
    color: '#a7f3d0',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default NoteCard;
