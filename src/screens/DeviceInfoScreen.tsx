import React, { useCallback, useEffect, useState } from 'react';
import { Linking, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Center,
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
  Camera,
  Settings,
  AlertCircle,
  CheckCircle2,
  Volume2,
  Headphones,
  Phone,
  Play,
  Square,
  Radio,
} from 'lucide-react-native';

import { getDeviceBatteryStatus, BatteryStatus } from '../native/battery';
import {
  checkCameraPermission,
  launchNativeCamera,
  CameraPermissionState,
} from '../native/camera';
import {
  setDeviceAudioOutput,
  getDeviceAudioOutput,
  playSimulationAudio,
  stopSimulationAudio,
  AudioOutputMode,
} from '../native/audioRouter';

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
  const [cameraPermission, setCameraPermission] =
    useState<CameraPermissionState>('UNDETERMINED');
  const [cameraMessage, setCameraMessage] = useState<string | null>(null);
  const [isLaunchingCamera, setIsLaunchingCamera] = useState<boolean>(false);

  // Fase 7: Audio routing & playback state
  const [audioOutput, setAudioOutput] = useState<AudioOutputMode>('speaker');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

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

      // Fetch live battery status
      const battery = await getDeviceBatteryStatus();
      setBatteryStatus(battery);

      // Check current camera permission without dialog prompt
      const perm = await checkCameraPermission();
      setCameraPermission(perm);

      // Check active audio output
      const currentAudio = getDeviceAudioOutput();
      setAudioOutput(currentAudio);
    } catch (error) {
      console.error('Failed to reload device info or native statuses:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDeviceInfo();

    return () => {
      stopSimulationAudio();
    };
  }, [fetchDeviceInfo]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDeviceInfo();
  }, [fetchDeviceInfo]);

  const handleOpenCamera = useCallback(async () => {
    setIsLaunchingCamera(true);
    setCameraMessage(null);

    try {
      const result = await launchNativeCamera();
      setCameraPermission(result.permissionStatus);

      if (result.success) {
        setCameraMessage('Aplikasi kamera native berhasil dibuka.');
      } else {
        setCameraMessage(result.errorMessage || 'Gagal membuka kamera.');
      }
    } catch (error: any) {
      console.error('Failed to trigger camera:', error);
      setCameraMessage(error?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLaunchingCamera(false);
    }
  }, []);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings().catch(err => {
      console.error('Failed to open app settings:', err);
    });
  }, []);

  // Audio routing selection handler
  const handleSelectAudioOutput = useCallback((mode: AudioOutputMode) => {
    setAudioOutput(mode);
    setDeviceAudioOutput(mode);
  }, []);

  // Audio simulation playback toggle handler
  const handleTogglePlayAudio = useCallback(async () => {
    if (isPlayingAudio) {
      stopSimulationAudio();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const started = await playSimulationAudio(() => {
        setIsPlayingAudio(false);
      });
      if (!started) {
        setIsPlayingAudio(false);
      }
    }
  }, [isPlayingAudio]);

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

  const getPermissionLabel = () => {
    switch (cameraPermission) {
      case 'GRANTED':
        return 'Diizinkan';
      case 'DENIED':
        return 'Ditolak';
      case 'NEVER_ASK_AGAIN':
        return 'Ditolak Permanen';
      default:
        return 'Belum Diminta';
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
            </HStack>
          </Box>

          {/* Real-time Battery Status Card */}
          <VStack space="xs">
            <Text
              size="xs"
              color="#888888"
              fontWeight="$bold"
              px="$1"
              textTransform="uppercase">
              Status Baterai
            </Text>

            <Box
              bg="#111111"
              borderColor="#222222"
              borderWidth={1}
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
                            <Text size="2xs" color="#ffffff" fontWeight="$medium">
                              Charging
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
                    <Text
                      size="2xs"
                      color="#666666"
                      fontWeight="$medium"
                      testID="battery-source-badge">
                      {batteryStatus.source === 'TURBOMODULE'
                        ? 'TurboModule JSI'
                        : batteryStatus.source === 'DEVICE_INFO'
                        ? 'Device Info'
                        : 'Unavailable'}
                    </Text>
                  </VStack>
                </HStack>

                {/* Battery Progress Bar Gauge */}
                <Box
                  w="100%"
                  h={6}
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

          {/* Native Camera Access Card */}
          <VStack space="xs">
            <Text
              size="xs"
              color="#888888"
              fontWeight="$bold"
              px="$1"
              textTransform="uppercase">
              Akses Kamera
            </Text>

            <Box
              bg="#111111"
              borderColor="#222222"
              borderWidth={1}
              borderRadius="$xl"
              p="$5">
              <VStack space="md">
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <Center w={36} h={36} borderRadius="$full" bg="#1a1a1a">
                      <Camera size={20} color="#ffffff" />
                    </Center>
                    <VStack>
                      <Heading size="sm" color="#ffffff" fontWeight="$bold">
                        Kamera Native
                      </Heading>
                      <Text size="2xs" color="#888888">
                        MediaStore Intent
                      </Text>
                    </VStack>
                  </HStack>

                  <Text
                    size="xs"
                    color={cameraPermission === 'GRANTED' ? '#ffffff' : '#888888'}
                    fontWeight="$medium"
                    testID="camera-permission-badge">
                    {getPermissionLabel()}
                  </Text>
                </HStack>

                {/* Status Message / Alert Feedback */}
                {cameraMessage ? (
                  <Box
                    bg="#0d0d0d"
                    borderColor="#222222"
                    borderWidth={1}
                    borderRadius="$lg"
                    p="$3">
                    <HStack space="xs" alignItems="center">
                      {cameraPermission === 'GRANTED' ? (
                        <CheckCircle2 size={16} color="#ffffff" />
                      ) : (
                        <AlertCircle size={16} color="#ff6666" />
                      )}
                      <Text size="xs" color="#cccccc" flex={1}>
                        {cameraMessage}
                      </Text>
                    </HStack>
                  </Box>
                ) : null}

                {/* Action Buttons */}
                <VStack space="xs">
                  <Button
                    size="md"
                    variant="solid"
                    bg="#ffffff"
                    borderRadius="$xl"
                    onPress={handleOpenCamera}
                    isDisabled={isLaunchingCamera}
                    px="$4"
                    testID="btn-open-camera">
                    <HStack space="xs" alignItems="center" justifyContent="center">
                      <Camera size={16} color="#000000" />
                      <ButtonText color="#000000" fontWeight="$bold" fontSize="$xs">
                        {isLaunchingCamera ? 'Membuka Kamera...' : 'Buka Kamera Bawaan'}
                      </ButtonText>
                    </HStack>
                  </Button>

                  {cameraPermission === 'NEVER_ASK_AGAIN' ? (
                    <Button
                      size="md"
                      variant="outline"
                      borderColor="#444444"
                      bg="#1a1a1a"
                      borderRadius="$xl"
                      onPress={handleOpenSettings}
                      px="$4"
                      testID="btn-open-settings">
                      <HStack space="xs" alignItems="center" justifyContent="center">
                        <Settings size={16} color="#ffffff" />
                        <ButtonText color="#ffffff" fontWeight="$medium" fontSize="$xs">
                          Buka Pengaturan Aplikasi
                        </ButtonText>
                      </HStack>
                    </Button>
                  ) : null}
                </VStack>
              </VStack>
            </Box>
          </VStack>

          {/* Audio Output Routing & Playback Card */}
          <VStack space="xs">
            <Text
              size="xs"
              color="#888888"
              fontWeight="$bold"
              px="$1"
              textTransform="uppercase">
              Routing Audio & Playback
            </Text>

            <Box
              bg="#111111"
              borderColor="#222222"
              borderWidth={1}
              borderRadius="$xl"
              p="$5">
              <VStack space="md">
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <Center w={36} h={36} borderRadius="$full" bg="#1a1a1a">
                      <Radio size={20} color="#ffffff" />
                    </Center>
                    <VStack>
                      <Heading size="sm" color="#ffffff" fontWeight="$bold">
                        Output Audio
                      </Heading>
                      <Text size="2xs" color="#888888">
                        AudioManager Switching
                      </Text>
                    </VStack>
                  </HStack>

                  <Text
                    size="xs"
                    color="#888888"
                    fontWeight="$medium"
                    testID="audio-active-route-badge">
                    {audioOutput.toUpperCase()}
                  </Text>
                </HStack>

                {/* 3 Output Mode Selection Buttons */}
                <HStack space="xs">
                  {/* Speaker */}
                  <Button
                    flex={1}
                    size="sm"
                    variant={audioOutput === 'speaker' ? 'solid' : 'outline'}
                    bg={audioOutput === 'speaker' ? '#ffffff' : '#111111'}
                    borderColor={audioOutput === 'speaker' ? '#ffffff' : '#222222'}
                    borderRadius="$lg"
                    onPress={() => handleSelectAudioOutput('speaker')}
                    px="$2"
                    testID="btn-route-speaker">
                    <HStack space="xs" alignItems="center" justifyContent="center">
                      <Volume2
                        size={14}
                        color={audioOutput === 'speaker' ? '#000000' : '#888888'}
                      />
                      <ButtonText
                        color={audioOutput === 'speaker' ? '#000000' : '#888888'}
                        fontWeight="$bold"
                        fontSize="$2xs">
                        Speaker
                      </ButtonText>
                    </HStack>
                  </Button>

                  {/* Earpiece */}
                  <Button
                    flex={1}
                    size="sm"
                    variant={audioOutput === 'earpiece' ? 'solid' : 'outline'}
                    bg={audioOutput === 'earpiece' ? '#ffffff' : '#111111'}
                    borderColor={audioOutput === 'earpiece' ? '#ffffff' : '#222222'}
                    borderRadius="$lg"
                    onPress={() => handleSelectAudioOutput('earpiece')}
                    px="$2"
                    testID="btn-route-earpiece">
                    <HStack space="xs" alignItems="center" justifyContent="center">
                      <Phone
                        size={14}
                        color={audioOutput === 'earpiece' ? '#000000' : '#888888'}
                      />
                      <ButtonText
                        color={audioOutput === 'earpiece' ? '#000000' : '#888888'}
                        fontWeight="$bold"
                        fontSize="$2xs">
                        Earpiece
                      </ButtonText>
                    </HStack>
                  </Button>

                  {/* Headset */}
                  <Button
                    flex={1}
                    size="sm"
                    variant={audioOutput === 'headset' ? 'solid' : 'outline'}
                    bg={audioOutput === 'headset' ? '#ffffff' : '#111111'}
                    borderColor={audioOutput === 'headset' ? '#ffffff' : '#222222'}
                    borderRadius="$lg"
                    onPress={() => handleSelectAudioOutput('headset')}
                    px="$2"
                    testID="btn-route-headset">
                    <HStack space="xs" alignItems="center" justifyContent="center">
                      <Headphones
                        size={14}
                        color={audioOutput === 'headset' ? '#000000' : '#888888'}
                      />
                      <ButtonText
                        color={audioOutput === 'headset' ? '#000000' : '#888888'}
                        fontWeight="$bold"
                        fontSize="$2xs">
                        Headset
                      </ButtonText>
                    </HStack>
                  </Button>
                </HStack>

                {/* Simulation Audio Playback Toggle */}
                <Button
                  size="md"
                  variant={isPlayingAudio ? 'outline' : 'solid'}
                  action={isPlayingAudio ? 'negative' : 'primary'}
                  bg={isPlayingAudio ? '#220a0a' : '#ffffff'}
                  borderColor={isPlayingAudio ? '#552222' : '#ffffff'}
                  borderRadius="$xl"
                  onPress={handleTogglePlayAudio}
                  px="$4"
                  testID="btn-toggle-audio-playback">
                  <HStack space="xs" alignItems="center" justifyContent="center">
                    {isPlayingAudio ? (
                      <Square size={16} color="#ff6666" />
                    ) : (
                      <Play size={16} color="#000000" />
                    )}
                    <ButtonText
                      color={isPlayingAudio ? '#ff6666' : '#000000'}
                      fontWeight="$bold"
                      fontSize="$xs">
                      {isPlayingAudio
                        ? 'Hentikan Audio Simulasi'
                        : 'Putar Simulasi Ringtone'}
                    </ButtonText>
                  </HStack>
                </Button>
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
              Informasi Perangkat
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
                      Package ID
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
              Arsitektur Native
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
                  <Text size="xs" color="#ffffff" fontWeight="$medium">
                    Aktif
                  </Text>
                </HStack>

                <Box h={1} bg="#1a1a1a" />

                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <Cpu size={16} color="#888888" />
                    <Text size="sm" color="#aaaaaa">
                      Fabric UI Manager
                    </Text>
                  </HStack>
                  <Text size="xs" color="#ffffff" fontWeight="$medium">
                    Aktif
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </VStack>
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
