import React from 'react';
import {
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  ButtonText,
  Box,
} from '@gluestack-ui/themed';
import { Note } from '../types/note';

interface NoteCardProps {
  note: Note;
  onDelete: (noteId: string) => void;
}

const NoteCardComponent: React.FC<NoteCardProps> = ({ note, onDelete }) => {
  const formattedDate = new Date(note.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Box
      bg="#111111"
      borderColor="#222222"
      borderWidth={1}
      borderRadius="$lg"
      p="$4"
      mb="$3">
      <VStack space="sm">
        <HStack justifyContent="space-between" alignItems="center">
          <Box flex={1} mr="$2">
            <Heading size="sm" color="#ffffff" fontWeight="$bold" numberOfLines={1}>
              {note.title}
            </Heading>
          </Box>
          <Button
            size="xs"
            variant="link"
            action="negative"
            p="$1.5"
            onPress={() => onDelete(note.id)}>
            <ButtonText color="#666666" fontSize="$2xs">
              Hapus
            </ButtonText>
          </Button>
        </HStack>

        <Text size="sm" color="#888888" numberOfLines={3} lineHeight="$sm">
          {note.content || '(Tidak ada isi)'}
        </Text>

        <Text size="2xs" color="#555555" mt="$1">
          {formattedDate}
        </Text>
      </VStack>
    </Box>
  );
};

// Optimasi React.memo untuk mencegah re-render saat scrolling FlatList dengan Fabric UI recycling
export const NoteCard = React.memo(NoteCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.title === nextProps.note.title &&
    prevProps.note.content === nextProps.note.content &&
    prevProps.note.updatedAt === nextProps.note.updatedAt &&
    prevProps.onDelete === nextProps.onDelete
  );
});

export default NoteCard;

