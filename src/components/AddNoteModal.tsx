import React, { useState } from 'react';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Heading,
  Text,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  Input,
  InputField,
  Textarea,
  TextareaInput,
  Button,
  ButtonText,
  ButtonSpinner,
  Badge,
  BadgeText,
  Alert,
  AlertText,
  VStack,
  HStack,
  Box,
} from '@gluestack-ui/themed';
import { FilePlus, X, Lock } from 'lucide-react-native';
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
      isOpen={visible}
      onClose={handleCancel}
      size="lg">
      <ModalBackdrop bg="rgba(0, 0, 0, 0.75)" />
      <ModalContent
        bg="#1e293b"
        borderColor="#334155"
        borderWidth={1}
        borderRadius="$2xl"
        p="$4">
        {/* Header */}
        <ModalHeader borderBottomColor="#334155" borderBottomWidth={1} pb="$3">
          <HStack alignItems="center" space="xs" flex={1}>
            <FilePlus size={18} color="#38bdf8" />
            <Heading size="md" color="#f8fafc" fontWeight="$bold">
              Tambah Catatan Baru
            </Heading>
          </HStack>
          <ModalCloseButton onPress={handleCancel} disabled={submitting}>
            <X size={18} color="#94a3b8" />
          </ModalCloseButton>
        </ModalHeader>

        {/* Body */}
        <ModalBody py="$4">
          <VStack space="md">
            {errorMessage && (
              <Alert action="error" variant="accent" bg="#450a0a" borderColor="#ef4444" borderRadius="$lg" p="$3">
                <AlertText color="#fca5a5" size="xs">
                  {errorMessage}
                </AlertText>
              </Alert>
            )}

            {/* Form Title */}
            <FormControl isInvalid={Boolean(titleError)} isRequired>
              <FormControlLabel mb="$1">
                <FormControlLabelText color="#cbd5e1" fontSize="$xs" fontWeight="$semibold">
                  Judul Catatan *
                </FormControlLabelText>
              </FormControlLabel>
              <Input
                variant="outline"
                size="md"
                bg="#0f172a"
                borderColor={titleError ? '#ef4444' : '#334155'}
                borderRadius="$xl">
                <InputField
                  placeholder="Contoh: Ide Project React Native"
                  placeholderTextColor="#64748b"
                  color="#f8fafc"
                  value={title}
                  onChangeText={(text: string) => {
                    setTitle(text);
                    if (titleError) {
                      setTitleError(null);
                    }
                  }}
                  editable={!submitting}
                />
              </Input>
              {titleError && (
                <FormControlError mt="$1">
                  <FormControlErrorText color="#f87171" fontSize="$2xs">
                    {titleError}
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            {/* Form Content */}
            <FormControl>
              <FormControlLabel mb="$1">
                <FormControlLabelText color="#cbd5e1" fontSize="$xs" fontWeight="$semibold">
                  Isi Catatan (Akan Dienkripsi AES-256)
                </FormControlLabelText>
              </FormControlLabel>
              <Textarea
                size="md"
                bg="#0f172a"
                borderColor="#334155"
                borderRadius="$xl"
                h={120}>
                <TextareaInput
                  placeholder="Tulis detail catatan rahasia Anda di sini..."
                  placeholderTextColor="#64748b"
                  color="#f8fafc"
                  value={content}
                  onChangeText={(text: string) => setContent(text)}
                  editable={!submitting}
                />
              </Textarea>
            </FormControl>

            {submitting && (
              <Box bg="#064e3b" p="$2" borderRadius="$lg" alignItems="center">
                <HStack space="xs" alignItems="center">
                  <Badge size="sm" variant="solid" action="success" bg="#059669" borderRadius="$full">
                    <BadgeText color="#ffffff" fontSize="$2xs">AES-256 GCM</BadgeText>
                  </Badge>
                  <Text size="xs" color="#a7f3d0" fontWeight="$semibold">
                    Mengenkripsi payload catatan...
                  </Text>
                </HStack>
              </Box>
            )}
          </VStack>
        </ModalBody>

        {/* Footer Buttons */}
        <ModalFooter borderTopColor="#334155" borderTopWidth={1} pt="$3">
          <HStack space="sm" flex={1}>
            <Button
              flex={1}
              size="md"
              variant="outline"
              action="secondary"
              borderColor="#475569"
              borderRadius="$xl"
              onPress={handleCancel}
              isDisabled={submitting}>
              <ButtonText color="#cbd5e1" fontSize="$sm">Batal</ButtonText>
            </Button>
            <Button
              flex={1}
              size="md"
              variant="solid"
              action="primary"
              bg="#0284c7"
              borderRadius="$xl"
              onPress={handleSave}
              isDisabled={submitting}>
              {submitting ? (
                <ButtonSpinner color="#ffffff" mr="$1" />
              ) : (
                <HStack space="xs" alignItems="center">
                  <Lock size={14} color="#ffffff" />
                  <ButtonText color="#ffffff" fontWeight="$bold" fontSize="$sm">
                    Simpan Enkripsi
                  </ButtonText>
                </HStack>
              )}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddNoteModal;
