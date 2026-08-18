import React from 'react';
import {
  Card,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  BadgeText,
  Button,
  ButtonText,
  Box,
  Divider,
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
    <Card
      size="md"
      variant="elevated"
      bg="#1e293b"
      borderColor="#334155"
      borderWidth={1}
      borderRadius="$xl"
      p="$4"
      mb="$3">
      <VStack space="sm">
        {/* Card Header */}
        <HStack justifyContent="space-between" alignItems="center">
          <Box flex={1} mr="$2">
            <Heading size="sm" color="#f8fafc" fontWeight="$bold" numberOfLines={1}>
              {note.title}
            </Heading>
          </Box>
          <Button
            size="xs"
            variant="link"
            action="negative"
            p="$1"
            onPress={() => onDelete(note.id)}>
            <ButtonText fontSize="$xs">🗑️</ButtonText>
          </Button>
        </HStack>

        {/* Content */}
        <Text size="sm" color="#94a3b8" numberOfLines={3} lineHeight="$sm">
          {note.content || '(Tidak ada isi)'}
        </Text>

        <Divider bg="#334155" my="$1" />

        {/* Card Footer */}
        <HStack justifyContent="space-between" alignItems="center">
          <Text size="2xs" color="#64748b">
            {formattedDate}
          </Text>
          <Badge
            size="sm"
            variant="solid"
            action="success"
            bg="#064e3b"
            borderColor="#059669"
            borderWidth={1}
            borderRadius="$xs"
            px="$2"
            py="$0.5">
            <BadgeText color="#a7f3d0" fontSize="$2xs" fontWeight="$bold">
              🔒 AES-256 Encrypted
            </BadgeText>
          </Badge>
        </HStack>
      </VStack>
    </Card>
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
