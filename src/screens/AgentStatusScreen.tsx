import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Center,
  Spinner,
  Badge,
  BadgeText,
} from '@gluestack-ui/themed';
import {
  UserCheck,
  CheckCircle2,
  Clock,
  PhoneCall,
  Activity,
  Shield,
  CircleDot,
} from 'lucide-react-native';

import {
  AgentStatusType,
  AgentStatusRecord,
  getAgentStatus,
  saveAgentStatus,
} from '../storage/agentStatusStorage';

interface StatusOption {
  type: AgentStatusType;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    type: 'AVAILABLE',
    title: 'Available',
    subtitle: 'Siap Menerima Panggilan',
    description: 'Agent online dan dapat menerima tiket panggilan atau tugas baru secara otomatis.',
    icon: CheckCircle2,
  },
  {
    type: 'BUSY',
    title: 'Busy',
    subtitle: 'Sedang Bertugas / Sibuk',
    description: 'Agent sedang menyelesaikan catatan investigasi atau tugas backend internal.',
    icon: Clock,
  },
  {
    type: 'ON_CALL',
    title: 'On Call',
    subtitle: 'Dalam Sesi Panggilan',
    description: 'Agent sedang dalam sambungan aktif dengan pelanggan atau operator lain.',
    icon: PhoneCall,
  },
];

export const AgentStatusScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [currentStatus, setCurrentStatus] = useState<AgentStatusType | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Pattern "Read-Before-Render": restore state dari AsyncStorage saat mount
  useEffect(() => {
    let isMounted = true;

    const restoreStatus = async () => {
      try {
        const stored = await getAgentStatus();
        if (isMounted) {
          if (stored) {
            setCurrentStatus(stored.status);
            setLastUpdated(stored.updatedAt);
          } else {
            // Default awal jika baru pertama kali dipasang
            setCurrentStatus('AVAILABLE');
            setLastUpdated(new Date().toISOString());
          }
        }
      } catch (error) {
        console.error('Failed to restore agent status:', error);
        if (isMounted) {
          setCurrentStatus('AVAILABLE');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectStatus = useCallback(
    async (status: AgentStatusType) => {
      if (status === currentStatus || saving) {
        return;
      }

      setSaving(true);
      try {
        const record: AgentStatusRecord = await saveAgentStatus(status);
        setCurrentStatus(record.status);
        setLastUpdated(record.updatedAt);
      } catch (error) {
        console.error('Failed to update agent status:', error);
      } finally {
        setSaving(false);
      }
    },
    [currentStatus, saving],
  );

  const formatTimestamp = (isoString: string | null) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getStatusDisplay = (status: AgentStatusType | null) => {
    switch (status) {
      case 'AVAILABLE':
        return { label: 'AVAILABLE', color: '#ffffff', bg: '#1a1a1a' };
      case 'BUSY':
        return { label: 'BUSY', color: '#aaaaaa', bg: '#1a1a1a' };
      case 'ON_CALL':
        return { label: 'ON CALL', color: '#ffffff', bg: '#1a1a1a' };
      default:
        return { label: 'UNKNOWN', color: '#888888', bg: '#111111' };
    }
  };

  return (
    <Box flex={1} bg="#000000" style={{ paddingTop: insets.top }}>
      {/* App Bar */}
      <HStack
        justifyContent="space-between"
        alignItems="center"
        px="$5"
        pt="$3"
        pb="$4"
        borderBottomWidth={1}
        borderBottomColor="#1a1a1a">
        <HStack space="sm" alignItems="center">
          <UserCheck size={22} color="#ffffff" />
          <Heading size="xl" color="#ffffff" fontWeight="$bold">
            Agent Status
          </Heading>
        </HStack>
        {saving && <Spinner size="small" color="#ffffff" />}
      </HStack>

      {/* Loading Skeleton / State (Read-Before-Render) */}
      {loading ? (
        <Center flex={1} testID="status-loading-spinner">
          <Spinner size="large" color="#ffffff" />
          <Text size="xs" color="#666666" mt="$3">
            Memuat status agent dari penyimpanan...
          </Text>
        </Center>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <VStack space="xl">
            {/* Active Status Hero Card */}
            <Box
              bg="#111111"
              borderColor="#222222"
              borderWidth={1}
              borderRadius="$xl"
              p="$5">
              <VStack space="md">
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <Activity size={16} color="#888888" />
                    <Text size="xs" color="#888888" textTransform="uppercase" fontWeight="$bold">
                      Status Saat Ini
                    </Text>
                  </HStack>
                  <Badge
                    size="sm"
                    variant="solid"
                    bg={getStatusDisplay(currentStatus).bg}
                    borderRadius="$md">
                    <BadgeText
                      color={getStatusDisplay(currentStatus).color}
                      fontSize="$2xs"
                      testID="active-status-badge">
                      {getStatusDisplay(currentStatus).label}
                    </BadgeText>
                  </Badge>
                </HStack>

                <HStack space="md" alignItems="center">
                  <Center w={48} h={48} borderRadius="$full" bg="#1a1a1a">
                    <CircleDot size={24} color="#ffffff" />
                  </Center>
                  <VStack flex={1}>
                    <Heading size="lg" color="#ffffff" fontWeight="$bold" testID="active-status-title">
                      {STATUS_OPTIONS.find(o => o.type === currentStatus)?.title || 'Available'}
                    </Heading>
                    <Text size="xs" color="#aaaaaa">
                      {STATUS_OPTIONS.find(o => o.type === currentStatus)?.subtitle}
                    </Text>
                  </VStack>
                </HStack>

                <Box h={1} bg="#1a1a1a" />

                <HStack justifyContent="space-between" alignItems="center">
                  <Text size="xs" color="#666666">
                    Penyimpanan: AsyncStorage (Persisted)
                  </Text>
                  <Text size="xs" color="#888888" testID="last-updated-text">
                    Diperbarui: {formatTimestamp(lastUpdated)}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Status Selection Cards */}
            <VStack space="sm">
              <Text size="xs" color="#888888" fontWeight="$bold" px="$1" textTransform="uppercase">
                Pilih Status Kerja
              </Text>

              {STATUS_OPTIONS.map(option => {
                const isSelected = currentStatus === option.type;
                const IconComponent = option.icon;

                return (
                  <TouchableOpacity
                    key={option.type}
                    activeOpacity={0.7}
                    onPress={() => handleSelectStatus(option.type)}
                    testID={`status-option-${option.type}`}>
                    <Box
                      bg={isSelected ? '#151515' : '#0d0d0d'}
                      borderColor={isSelected ? '#ffffff' : '#1f1f1f'}
                      borderWidth={isSelected ? 1.5 : 1}
                      borderRadius="$xl"
                      p="$4">
                      <HStack space="md" alignItems="center">
                        <Center
                          w={40}
                          h={40}
                          borderRadius="$lg"
                          bg={isSelected ? '#222222' : '#141414'}>
                          <IconComponent
                            size={20}
                            color={isSelected ? '#ffffff' : '#666666'}
                          />
                        </Center>

                        <VStack flex={1} space="xs">
                          <HStack justifyContent="space-between" alignItems="center">
                            <Heading
                              size="sm"
                              color={isSelected ? '#ffffff' : '#cccccc'}
                              fontWeight={isSelected ? '$bold' : '$medium'}>
                              {option.title}
                            </Heading>
                            {isSelected && (
                              <Badge size="sm" variant="solid" bg="#ffffff" borderRadius="$full">
                                <BadgeText color="#000000" fontSize="$2xs" fontWeight="$bold">
                                  AKTIF
                                </BadgeText>
                              </Badge>
                            )}
                          </HStack>
                          <Text size="xs" color="#888888" numberOfLines={2}>
                            {option.description}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </TouchableOpacity>
                );
              })}
            </VStack>

            {/* Info Persistence Card */}
            <Box
              bg="#0a0a0a"
              borderColor="#1a1a1a"
              borderWidth={1}
              borderRadius="$xl"
              p="$4">
              <HStack space="sm" alignItems="center">
                <Shield size={16} color="#666666" />
                <VStack flex={1}>
                  <Heading size="xs" color="#888888">
                    Status Tersimpan Permanen
                  </Heading>
                  <Text size="xs" color="#555555" mt="$1">
                    Status yang Anda pilih akan tetap tersimpan meskipun aplikasi di-kill atau perangkat dimatikan.
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </VStack>
        </ScrollView>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
});

export default AgentStatusScreen;
