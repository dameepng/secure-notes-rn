import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NoteInput } from '../types/note';

interface AddNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: NoteInput) => Promise<void>;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError('Judul catatan harus diisi.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setTitleError(null);

    try {
      await onSubmit({
        title: trimmedTitle,
        content: content.trim(),
      });
      setTitle('');
      setContent('');
      onClose();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Gagal mengenkripsi dan menyimpan catatan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) {
      return;
    }
    setTitle('');
    setContent('');
    setTitleError(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>➕ Tambah Catatan Baru</Text>
            <TouchableOpacity onPress={handleCancel} disabled={submitting}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Judul Catatan *</Text>
            <TextInput
              style={[styles.input, titleError && styles.inputError]}
              placeholder="Contoh: Ide Project React Native"
              placeholderTextColor="#64748b"
              value={title}
              onChangeText={text => {
                setTitle(text);
                if (titleError) {
                  setTitleError(null);
                }
              }}
              editable={!submitting}
            />
            {titleError && <Text style={styles.fieldErrorText}>{titleError}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Isi Catatan (Akan Dienkripsi AES)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tulis detail catatan Anda di sini..."
              placeholderTextColor="#64748b"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              editable={!submitting}
            />
          </View>

          {submitting && (
            <View style={styles.encryptingBanner}>
              <Text style={styles.encryptingText}>🔒 Mengenkripsi data dengan AES-256...</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancel}
              disabled={submitting}>
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, submitting && styles.btnDisabled]}
              onPress={handleSave}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Simpan Enkripsi</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  closeText: {
    fontSize: 18,
    color: '#94a3b8',
    padding: 4,
  },
  errorBanner: {
    backgroundColor: '#450a0a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  fieldErrorText: {
    color: '#f87171',
    fontSize: 11,
    marginTop: 4,
  },
  textArea: {
    minHeight: 100,
  },
  encryptingBanner: {
    backgroundColor: '#064e3b',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  encryptingText: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});

export default AddNoteModal;
