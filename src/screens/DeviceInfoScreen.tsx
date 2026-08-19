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
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryWarning,
  Zap,
} from 'lucide-react-native';

import { getDeviceBatteryStatus, BatteryStatus } from '../native/battery';

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
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus>({
    level: -1,
    isCharging: false,
    source: 'UNAVAILABLE',
  });
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchDeviceInfo = useCallback(async () => {
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

      // Fetch live battery status from Native TurboModule / Fallback
      const battery = await getDeviceBatteryStatus();
      setBatteryStatus(battery);
    } catch (error) {
      console.error('Failed to reload device info or battery status:', error);
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

  const getBatteryIcon = () => {
    if (batteryStatus.isCharging) {
      return BatteryCharging;
    }
    if (batteryStatus.level >= 80) {
      return BatteryFull;
    }
    if (batteryStatus.level >= 40) {
      return BatteryMedium;
    }
    if (batteryStatus.level >= 15) {
      return BatteryLow;
    }
    if (batteryStatus.level >= 0) {
      return BatteryWarning;
    }
    return Battery;
  };

  const BatteryStateIcon = getBatteryIcon();

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
          <ButtonText color="#888888" fontSize="$2xs">
            Refresh
          </ButtonText>
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
                <BadgeText color="#ffffff" fontSize="$2xs">
                  Native
                </BadgeText>
              </Badge>
            </HStack>
          </Box>

          {/* Real-time Battery Status Card (TurboModule) */}
          <VStack space="xs">
            <Text
              size="xs"
              color="#888888"
              fontWeight="$bold"
              px="$1"
              textTransform="uppercase">
              Status Baterai Perangkat (Real-Time)
            </Text>

            <Box
              bg="#111111"
              borderColor="#222222"
              borderWidth={1.5}
              borderRadius="$xl"
              p="$5">
              <VStack space="md">
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <Center w={36} h={36} borderRadius="$full" bg="#1a1a1a">
                      <BatteryStateIcon size={20} color="#ffffff" />
                    </Center>
                    <VStack>
                      <Heading size="sm" color="#ffffff" fontWeight="$bold">
                        Level Baterai
                      </Heading>
                      <HStack space="xs" alignItems="center">
                        {batteryStatus.isCharging ? (
                          <>
                            <Zap size={12} color="#ffffff" />
                            <Text size="2xs" color="#ffffff" fontWeight="$bold">
                              Mengisi Daya (Charging)
                            </Text>
                          </>
                        ) : (
                          <Text size="2xs" color="#888888">
                            Daya Baterai
                          </Text>
                        )}
                      </HStack>
                    </VStack>
                  </HStack>

                  <VStack alignItems="flex-end">
                    <Heading
                      size="xl"
                      color="#ffffff"
                      fontWeight="$bold"
                      testID="battery-level-value">
                      {batteryStatus.level >= 0 ? `${batteryStatus.level}%` : 'N/A'}
                    </Heading>
                    <Badge
                      size="sm"
                      variant="solid"
                      bg={
                        batteryStatus.source === 'TURBOMODULE'
                          ? '#ffffff'
                          : '#222222'
                      }
                      borderRadius="$sm">
                      <BadgeText
                        color={
                          batteryStatus.source === 'TURBOMODULE'
                            ? '#000000'
                            : '#aaaaaa'
                        }
                        fontSize="$2xs"
                        fontWeight="$bold"
                        testID="battery-source-badge">
                        {batteryStatus.source === 'TURBOMODULE'
                          ? 'TurboModule JSI'
                          : batteryStatus.source === 'DEVICE_INFO'
                          ? 'Device Info'
                          : 'Unavailable'}
                      </BadgeText>
                    </Badge>
                  </VStack>
                </HStack>

                {/* Battery Progress Bar Gauge */}
                <Box
                  w="100%"
                  h={8}
                  bg="#1a1a1a"
                  borderRadius="$full"
                  overflow="hidden">
                  <Box
                    h="100%"
                    w={`${Math.max(0, Math.min(100, batteryStatus.level >= 0 ? batteryStatus.level : 0))}%`}
                    bg="#ffffff"
                    borderRadius="$full"
                  />
                </Box>
              </VStack>
            </Box>
          </VStack>

          {/* Hardware & Device Specifications */}
          <VStack space="xs">
            <Text
              size="xs"
              color="#888888"
              fontWeight="$bold"
              px="$1"
              textTransform="uppercase">
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
                    <Text size="sm" color="#aaaaaa">
                      Brand
                    </Text>
                  </HStack>
                  <Text
                    size="sm"
                    color="#ffffff"
                    fontWeight="$bold"
                    testID="device-brand-value">
                    {deviceData.brand}
                  </Text>
                </HStack>

                <Box h={1} bg="#1a1a1a" />

                {/* Model */}
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <Smartphone size={16} color="#888888" />
                    <Text size="sm" color="#aaaaaa">
                      Model
                    </Text>
                  </HStack>
                  <Text
                    size="sm"
                    color="#ffffff"
                    fontWeight="$bold"
                    testID="device-model-value">
                    {deviceData.model}
                  </Text>
                </HStack>

                <Box h={1} bg="#1a1a1a" />

                {/* OS Version */}
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <Cpu size={16} color="#888888" />
                    <Text size="sm" color="#aaaaaa">
                      Sistem Operasi
                    </Text>
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
            <Text
              size="xs"
              color="#888888"
              fontWeight="$bold"
              px="$1"
              textTransform="uppercase">
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
                    <Text size="sm" color="#aaaaaa">
                      Versi Aplikasi
                    </Text>
                  </HStack>
                  <Text
                    size="sm"
                    color="#ffffff"
                    fontWeight="$bold"
                    testID="device-version-value">
                    v{deviceData.appVersion}
                  </Text>
                </HStack>

                <Box h={1} bg="#1a1a1a" />

                {/* Bundle ID */}
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <Info size={16} color="#888888" />
                    <Text size="sm" color="#aaaaaa">
                      Package / Bundle ID
                    </Text>
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
            <Text
              size="xs"
              color="#888888"
              fontWeight="$bold"
              px="$1"
              textTransform="uppercase">
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
                    <Text size="sm" color="#aaaaaa">
                      TurboModule JSI
                    </Text>
                  </HStack>
                  <Badge size="sm" variant="solid" bg="#1a1a1a" borderRadius="$md">
                    <BadgeText color="#ffffff" fontSize="$2xs">
                      Aktif
                    </BadgeText>
                  </Badge>
                </HStack>

                <Box h={1} bg="#1a1a1a" />

                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <Cpu size={16} color="#888888" />
                    <Text size="sm" color="#aaaaaa">
                      Fabric UI Manager
                    </Text>
                  </HStack>
                  <Badge size="sm" variant="solid" bg="#1a1a1a" borderRadius="$md">
                    <BadgeText color="#ffffff" fontSize="$2xs">
                      Aktif
                    </BadgeText>
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
                Fitur Native Lanjutan (Fase 6, 7)
              </Heading>
              <Text size="2xs" color="#555555">
                Akses kamera via Intent dan routing audio output native akan ditambahkan pada fase berikutnya.
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
