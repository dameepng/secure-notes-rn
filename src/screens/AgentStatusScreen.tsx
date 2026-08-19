import React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box, VStack, HStack, Heading, Text, Center } from '@gluestack-ui/themed';
import { UserCheck } from 'lucide-react-native';

export const AgentStatusScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Box
      flex={1}
      bg="#000000"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* App Bar */}
      <HStack
        justifyContent="space-between"
        alignItems="center"
        px="$5"
        pt="$3"
        pb="$4"
        borderBottomWidth={1}
        borderBottomColor="#1a1a1a">
        <Heading size="xl" color="#ffffff" fontWeight="$bold">
          Agent Status
        </Heading>
      </HStack>

      <Center flex={1} px="$6">
        <VStack space="md" alignItems="center" bg="#111111" p="$6" borderRadius="$xl" borderColor="#222222" borderWidth={1} width="100%">
          <Center w={56} h={56} borderRadius="$full" bg="#1a1a1a" mb="$2">
            <UserCheck size={28} color="#ffffff" />
          </Center>
          <Heading size="md" color="#ffffff" textAlign="center">
            Status Agent
          </Heading>
          <Text size="sm" color="#777777" textAlign="center">
            Fitur perubahan dan persistensi status ketersediaan agent (Available, Busy, On Call) akan diimplementasikan pada Fase 3.
          </Text>
        </VStack>
      </Center>
    </Box>
  );
};

export default AgentStatusScreen;
