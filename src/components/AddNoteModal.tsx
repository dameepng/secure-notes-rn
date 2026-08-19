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
  VStack,
  HStack,
} from '@gluestack-ui/themed';
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
      setTitleError('Judul tidak boleh kosong.');
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
      setErrorMessage((err as Error).message || 'Gagal menyimpan catatan.');
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
      <ModalBackdrop bg="rgba(0, 0, 0, 0.85)" />
      <ModalContent
        bg="#111111"
        borderColor="#222222"
        borderWidth={1}
        borderRadius="$xl"
        p="$4">
        {/* Header */}
        <ModalHeader pb="$3">
          <Heading size="md" color="#ffffff" fontWeight="$bold" flex={1}>
            Catatan Baru
          </Heading>
          <ModalCloseButton onPress={handleCancel} disabled={submitting}>
            <Text color="#666666" fontSize="$sm">✕</Text>
          </ModalCloseButton>
        </ModalHeader>

        {/* Body */}
        <ModalBody py="$3">
          <VStack space="lg">
            {errorMessage && (
              <Text color="#999999" size="xs">
                {errorMessage}
              </Text>
            )}

            {/* Title */}
            <FormControl isInvalid={Boolean(titleError)} isRequired>
              <FormControlLabel mb="$2">
                <FormControlLabelText color="#999999" fontSize="$xs" fontWeight="$medium">
                  Judul
                </FormControlLabelText>
              </FormControlLabel>
              <Input
                variant="outline"
                size="lg"
                bg="#0a0a0a"
                borderColor={titleError ? '#ff4444' : '#333333'}
                borderRadius="$lg">
                <InputField
                  placeholder="Judul catatan"
                  placeholderTextColor="#555555"
                  color="#ffffff"
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
                  <FormControlErrorText color="#ff6666" fontSize="$2xs">
                    {titleError}
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            {/* Content */}
            <FormControl>
              <FormControlLabel mb="$2">
                <FormControlLabelText color="#999999" fontSize="$xs" fontWeight="$medium">
                  Isi Catatan
                </FormControlLabelText>
              </FormControlLabel>
              <Textarea
                size="md"
                bg="#0a0a0a"
                borderColor="#333333"
                borderRadius="$lg"
                h={120}>
                <TextareaInput
                  placeholder="Tulis catatan..."
                  placeholderTextColor="#555555"
                  color="#ffffff"
                  value={content}
                  onChangeText={(text: string) => setContent(text)}
                  editable={!submitting}
                />
              </Textarea>
            </FormControl>

            {submitting && (
              <Text size="xs" color="#666666" textAlign="center">
                Menyimpan...
              </Text>
            )}
          </VStack>
        </ModalBody>

        {/* Footer */}
        <ModalFooter pt="$3">
          <HStack space="sm" flex={1}>
            <Button
              flex={1}
              size="md"
              variant="outline"
              action="secondary"
              borderColor="#333333"
              borderRadius="$lg"
              onPress={handleCancel}
              isDisabled={submitting}>
              <ButtonText color="#666666" fontSize="$sm">Batal</ButtonText>
            </Button>
            <Button
              flex={1}
              size="md"
              variant="solid"
              action="primary"
              bg="#ffffff"
              borderRadius="$lg"
              onPress={handleSave}
              isDisabled={submitting}>
              {submitting ? (
                <ButtonSpinner color="#000000" />
              ) : (
                <ButtonText color="#000000" fontWeight="$bold" fontSize="$sm">
                  Simpan
                </ButtonText>
              )}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddNoteModal;

