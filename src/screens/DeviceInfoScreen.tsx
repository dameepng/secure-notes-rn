import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Center,
  Badge,
  BadgeText,
  Button,
  ButtonText,
  ButtonIcon,
} from '@gluestack-ui/themed';
import {
  Smartphone,
  Tag,
  Cpu,
  Layers,
  Info,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react-native';

export interface DeviceInfoData {
  brand: string;
  model: string;
  appVersion: string;
  systemName: string;
  systemVersion: string;
  bundleId: string;
}

export const DeviceInfoScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [deviceData, setDeviceData] = useState<DeviceInfoData>({
    brand: 'Loading...',
    model: 'Loading...',
    appVersion: '1.0.0',
    systemName: 'Android',
    systemVersion: '',
    bundleId: 'com.securenotes',
  });
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchDeviceInfo = useCallback(() => {
    try {
      const brand = DeviceInfo.getBrand() || 'Unknown';
      const model = DeviceInfo.getModel() || 'Unknown';
      const appVersion = DeviceInfo.getVersion() || '1.0.0';
      const systemName = DeviceInfo.getSystemName() || 'Android';
      const systemVersion = DeviceInfo.getSystemVersion() || 'Unknown';
      const bundleId = DeviceInfo.getBundleId() || 'com.securenotes';

      setDeviceData({
        brand,
        model,
        appVersion,
        systemName,
        systemVersion,
        bundleId,
      });
    } catch (error) {
      console.error('Failed to reload device info:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDeviceInfo();
  }, [fetchDeviceInfo]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDeviceInfo();
  }, [fetchDeviceInfo]);

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
        <Heading size="xl" color="#ffffff" fontWeight="$bold">
          Device Info
        </Heading>
        <Button
          size="xs"
          variant="outline"
          action="secondary"
          borderColor="#333333"
          borderRadius="$lg"
          onPress={handleRefresh}
          isDisabled={refreshing}>
          <ButtonIcon as={() => <RefreshCw size={14} color="#888888" />} mr="$1" />
          <ButtonText color="#888888" fontSize="$2xs">Refresh</ButtonText>
        </Button>
      </HStack>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#ffffff"
            colors={['#ffffff']}
          />
        }>
        <VStack space="lg">
          {/* Header Hero Info */}
          <Box
            bg="#111111"
            borderColor="#222222"
            borderWidth={1}
            borderRadius="$xl"
            p="$5">
            <HStack space="md" alignItems="center">
              <Center w={48} h={48} borderRadius="$full" bg="#1a1a1a">
                <Smartphone size={24} color="#ffffff" />
              </Center>
              <VStack flex={1}>
                <Heading size="md" color="#ffffff" fontWeight="$bold">
                  {deviceData.brand} {deviceData.model}
                </Heading>
                <Text size="xs" color="#888888">
                  {deviceData.systemName} {deviceData.systemVersion}
                </Text>
              </VStack>
              <Badge size="sm" variant="solid" bg="#222222" borderRadius="$md">
                <BadgeText color="#ffffff" fontSize="$2xs">Native</BadgeText>
              </Badge>
            </HStack>
          </Box>

          {/* Hardware & Device Specifications */}
          <VStack space="xs">
            <Text size="xs" color="#888888" fontWeight="$bold" px="$1" textTransform="uppercase">
              Informasi Perangkat Dasar
            </Text>

            <Box
              bg="#111111"
              borderColor="#222222"
              borderWidth={1}
              borderRadius="$xl"
              p="$4">
              <VStack space="md">
                {/* Brand */}
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <Tag size={16} color="#888888" />
                    <Text size="sm" color="#aaaaaa">Brand</Text>
                  </HStack>
                  <Text size="sm" color="#ffffff" fontWeight="$bold" testID="device-brand-value">
                    {deviceData.brand}
                  </Text>
                </HStack>

                <Box h={1} bg="#1a1a1a" />

                {/* Model */}
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <Smartphone size={16} color="#888888" />
                    <Text size="sm" color="#aaaaaa">Model</Text>
                  </HStack>
                  <Text size="sm" color="#ffffff" fontWeight="$bold" testID="device-model-value">
                    {deviceData.model}
                  </Text>
                </HStack>

                <Box h={1} bg="#1a1a1a" />

                {/* OS Version */}
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <Cpu size={16} color="#888888" />
                    <Text size="sm" color="#aaaaaa">Sistem Operasi</Text>
                  </HStack>
                  <Text size="sm" color="#ffffff" fontWeight="$bold">
                    {deviceData.systemName} {deviceData.systemVersion}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </VStack>

          {/* Application Specifications */}
          <VStack space="xs">
            <Text size="xs" color="#888888" fontWeight="$bold" px="$1" textTransform="uppercase">
              Informasi Aplikasi
            </Text>

            <Box
              bg="#111111"
              borderColor="#222222"
              borderWidth={1}
              borderRadius="$xl"
              p="$4">
              <VStack space="md">
                {/* App Version */}
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <Layers size={16} color="#888888" />
                    <Text size="sm" color="#aaaaaa">Versi Aplikasi</Text>
                  </HStack>
                  <Text size="sm" color="#ffffff" fontWeight="$bold" testID="device-version-value">
                    v{deviceData.appVersion}
                  </Text>
                </HStack>

                <Box h={1} bg="#1a1a1a" />

                {/* Bundle ID */}
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <Info size={16} color="#888888" />
                    <Text size="sm" color="#aaaaaa">Package / Bundle ID</Text>
                  </HStack>
                  <Text size="2xs" color="#aaaaaa" fontWeight="$medium">
                    {deviceData.bundleId}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </VStack>

          {/* Native Bridge Architecture */}
          <VStack space="xs">
            <Text size="xs" color="#888888" fontWeight="$bold" px="$1" textTransform="uppercase">
              Native Bridge & Arsitektur
            </Text>

            <Box
              bg="#111111"
              borderColor="#222222"
              borderWidth={1}
              borderRadius="$xl"
              p="$4">
              <VStack space="md">
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <ShieldCheck size={16} color="#888888" />
                    <Text size="sm" color="#aaaaaa">TurboModule JSI</Text>
                  </HStack>
                  <Badge size="sm" variant="solid" bg="#1a1a1a" borderRadius="$md">
                    <BadgeText color="#ffffff" fontSize="$2xs">Aktif</BadgeText>
                  </Badge>
                </HStack>

                <Box h={1} bg="#1a1a1a" />

                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <Cpu size={16} color="#888888" />
                    <Text size="sm" color="#aaaaaa">Fabric UI Manager</Text>
                  </HStack>
                  <Badge size="sm" variant="solid" bg="#1a1a1a" borderRadius="$md">
                    <BadgeText color="#ffffff" fontSize="$2xs">Aktif</BadgeText>
                  </Badge>
                </HStack>
              </VStack>
            </Box>
          </VStack>

          {/* Upcoming Phase Modules Indicator */}
          <Box
            bg="#0a0a0a"
            borderColor="#1a1a1a"
            borderWidth={1}
            borderRadius="$xl"
            p="$4">
            <VStack space="xs">
              <Heading size="xs" color="#888888">
                Fitur Native Lanjutan (Fase 5, 6, 7)
              </Heading>
              <Text size="2xs" color="#555555">
                Modul baterai real-time, akses kamera via Intent, dan routing audio output akan ditambahkan pada fase berikutnya.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </ScrollView>
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

export default DeviceInfoScreen;
