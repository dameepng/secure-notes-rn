import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
} from '@gluestack-ui/themed';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneForwarded,
  PhoneIncoming,
  AlertOctagon,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  History,
} from 'lucide-react-native';

export type CallState =
  | 'IDLE'
  | 'CONNECTING'
  | 'RINGING'
  | 'CONNECTED'
  | 'ENDED'
  | 'FAILED';

export interface CallLogItem {
  id: string;
  timestamp: string;
  duration: number;
  status: 'COMPLETED' | 'FAILED' | 'CANCELLED';
}

export const formatCallDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const CallSimulatorScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [callState, setCallState] = useState<CallState>('IDLE');
  const [duration, setDuration] = useState<number>(0);
  const [callLogs, setCallLogs] = useState<CallLogItem[]>([]);

  // Refs untuk menyimpan timer ID agar selalu bisa dibersihkan secara aman
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef = useRef<number>(0);

  // Sinkronisasi durationRef dengan duration state
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  // Membersihkan semua timer aktif
  const clearTimers = useCallback(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  // Cleanup saat unmount (mencegah ghost timer saat pindah screen / tab)
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // State machine transition effects
  useEffect(() => {
    clearTimers();

    if (callState === 'CONNECTING') {
      // Auto-transition: CONNECTING -> (2 detik) -> RINGING
      transitionTimerRef.current = setTimeout(() => {
        setCallState('RINGING');
      }, 2000);
    } else if (callState === 'RINGING') {
      // Auto-transition: RINGING -> (2 detik) -> CONNECTED
      transitionTimerRef.current = setTimeout(() => {
        setCallState('CONNECTED');
      }, 2000);
    } else if (callState === 'CONNECTED') {
      // Mulai counter durasi panggilan aktif tiap 1 detik
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else if (callState === 'ENDED') {
      // Auto-transition: ENDED -> (1.5 detik) -> IDLE
      transitionTimerRef.current = setTimeout(() => {
        setCallState('IDLE');
        setDuration(0);
      }, 1500);
    }

    return () => {
      clearTimers();
    };
  }, [callState, clearTimers]);

  const addLog = useCallback(
    (status: 'COMPLETED' | 'FAILED' | 'CANCELLED', callDuration: number) => {
      const newLog: CallLogItem = {
        id: `call_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        duration: callDuration,
        status,
      };
      setCallLogs(prev => [newLog, ...prev.slice(0, 4)]);
    },
    [],
  );

  // Actions
  const handleStartCall = useCallback(() => {
    if (callState !== 'IDLE') return;
    setDuration(0);
    setCallState('CONNECTING');
  }, [callState]);

  const handleEndCall = useCallback(() => {
    if (!['CONNECTING', 'RINGING', 'CONNECTED'].includes(callState)) return;
    const finalDuration = durationRef.current;
    const logStatus = callState === 'CONNECTED' ? 'COMPLETED' : 'CANCELLED';
    addLog(logStatus, finalDuration);
    setCallState('ENDED');
  }, [callState, addLog]);

  const handleSimulateFailure = useCallback(() => {
    if (!['CONNECTING', 'RINGING', 'CONNECTED'].includes(callState)) return;
    const finalDuration = durationRef.current;
    addLog('FAILED', finalDuration);
    setCallState('FAILED');
  }, [callState, addLog]);

  const handleRetry = useCallback(() => {
    if (callState !== 'FAILED') return;
    setDuration(0);
    setCallState('CONNECTING');
  }, [callState]);

  // Visual helper per state
  const getStateConfig = (state: CallState) => {
    switch (state) {
      case 'IDLE':
        return {
          title: 'Siap Memanggil',
          subtitle: 'Tekan "Start Call" untuk memulai simulasi',
          badgeText: 'IDLE',
          badgeBg: '#1a1a1a',
          badgeColor: '#888888',
          icon: Phone,
          borderColor: '#222222',
        };
      case 'CONNECTING':
        return {
          title: 'Menghubungkan...',
          subtitle: 'Melakukan handshake ke server gateway...',
          badgeText: 'CONNECTING',
          badgeBg: '#2a2a2a',
          badgeColor: '#ffffff',
          icon: PhoneForwarded,
          borderColor: '#555555',
        };
      case 'RINGING':
        return {
          title: 'Memanggil (Ringing)',
          subtitle: 'Sinyal berdering di sisi penerima...',
          badgeText: 'RINGING',
          badgeBg: '#ffffff',
          badgeColor: '#000000',
          icon: PhoneIncoming,
          borderColor: '#ffffff',
        };
      case 'CONNECTED':
        return {
          title: 'Panggilan Terhubung',
          subtitle: 'Sesi audio aktif dan terenkripsi',
          badgeText: 'CONNECTED',
          badgeBg: '#ffffff',
          badgeColor: '#000000',
          icon: PhoneCall,
          borderColor: '#ffffff',
        };
      case 'ENDED':
        return {
          title: 'Panggilan Selesai',
          subtitle: `Total durasi: ${formatCallDuration(duration)}`,
          badgeText: 'ENDED',
          badgeBg: '#1a1a1a',
          badgeColor: '#aaaaaa',
          icon: PhoneOff,
          borderColor: '#333333',
        };
      case 'FAILED':
        return {
          title: 'Panggilan Terputus',
          subtitle: 'Koneksi jaringan gagal atau ditolak gateway',
          badgeText: 'FAILED',
          badgeBg: '#1a1a1a',
          badgeColor: '#ff5555',
          icon: AlertOctagon,
          borderColor: '#442222',
        };
    }
  };

  const currentConfig = getStateConfig(callState);
  const StateIcon = currentConfig.icon;

  const isCallActive = ['CONNECTING', 'RINGING', 'CONNECTED'].includes(callState);

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
          Call Simulator
        </Heading>
      </HStack>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <VStack space="lg">
          {/* Main State Hero Card */}
          <Box
            bg="#111111"
            borderColor={currentConfig.borderColor}
            borderWidth={1.5}
            borderRadius="$xl"
            p="$5">
            <VStack space="md" alignItems="center">
              <HStack w="100%" justifyContent="space-between" alignItems="center">
                <HStack space="xs" alignItems="center">
                  <Activity size={16} color="#888888" />
                  <Text size="xs" color="#888888" textTransform="uppercase" fontWeight="$bold">
                    State Machine
                  </Text>
                </HStack>
                <Badge
                  size="sm"
                  variant="solid"
                  bg={currentConfig.badgeBg}
                  borderRadius="$md">
                  <BadgeText
                    color={currentConfig.badgeColor}
                    fontSize="$2xs"
                    fontWeight="$bold"
                    testID="call-state-badge">
                    {currentConfig.badgeText}
                  </BadgeText>
                </Badge>
              </HStack>

              {/* Call Status Icon */}
              <Center w={64} h={64} borderRadius="$full" bg="#1a1a1a" my="$2">
                <StateIcon size={32} color="#ffffff" />
              </Center>

              <Heading size="lg" color="#ffffff" fontWeight="$bold" textAlign="center" testID="call-state-title">
                {currentConfig.title}
              </Heading>
              <Text size="xs" color="#888888" textAlign="center">
                {currentConfig.subtitle}
              </Text>

              {/* Live Duration Timer Display */}
              <Box
                bg="#0a0a0a"
                borderColor="#1f1f1f"
                borderWidth={1}
                borderRadius="$lg"
                px="$5"
                py="$2"
                mt="$1">
                <HStack space="sm" alignItems="center">
                  <Clock size={16} color="#aaaaaa" />
                  <Heading size="md" color="#ffffff" fontWeight="$bold" testID="call-duration-text">
                    {formatCallDuration(duration)}
                  </Heading>
                </HStack>
              </Box>

              {/* Step Flow Indicators */}
              <HStack space="xs" alignItems="center" mt="$2">
                <Box
                  w={12}
                  h={4}
                  borderRadius="$full"
                  bg={callState === 'IDLE' ? '#ffffff' : '#222222'}
                />
                <Box
                  w={12}
                  h={4}
                  borderRadius="$full"
                  bg={callState === 'CONNECTING' ? '#ffffff' : '#222222'}
                />
                <Box
                  w={12}
                  h={4}
                  borderRadius="$full"
                  bg={callState === 'RINGING' ? '#ffffff' : '#222222'}
                />
                <Box
                  w={12}
                  h={4}
                  borderRadius="$full"
                  bg={callState === 'CONNECTED' ? '#ffffff' : '#222222'}
                />
              </HStack>
            </VStack>
          </Box>

          {/* Action Control Panel (4 Buttons) */}
          <VStack space="sm">
            <Text size="xs" color="#888888" fontWeight="$bold" px="$1" textTransform="uppercase">
              Kontrol Aksi State
            </Text>

            {/* Row 1: Start Call & End Call */}
            <HStack space="sm">
              <Button
                flex={1}
                size="md"
                variant="solid"
                bg="#ffffff"
                borderRadius="$xl"
                onPress={handleStartCall}
                isDisabled={callState !== 'IDLE'}
                px="$3"
                testID="btn-start-call">
                <HStack space="xs" alignItems="center" justifyContent="center">
                  <Phone size={16} color="#000000" />
                  <ButtonText color="#000000" fontWeight="$bold" fontSize="$xs">
                    Start Call
                  </ButtonText>
                </HStack>
              </Button>

              <Button
                flex={1}
                size="md"
                variant="outline"
                action="negative"
                borderColor="#442222"
                bg="#1a0a0a"
                borderRadius="$xl"
                onPress={handleEndCall}
                isDisabled={!isCallActive}
                px="$3"
                testID="btn-end-call">
                <HStack space="xs" alignItems="center" justifyContent="center">
                  <PhoneOff size={16} color="#ff6666" />
                  <ButtonText color="#ff6666" fontWeight="$bold" fontSize="$xs">
                    End Call
                  </ButtonText>
                </HStack>
              </Button>
            </HStack>

            {/* Row 2: Simulate Failure & Retry */}
            <HStack space="sm">
              <Button
                flex={1}
                size="md"
                variant="outline"
                action="secondary"
                borderColor="#333333"
                bg="#111111"
                borderRadius="$xl"
                onPress={handleSimulateFailure}
                isDisabled={!isCallActive}
                px="$3"
                testID="btn-simulate-failure">
                <HStack space="xs" alignItems="center" justifyContent="center">
                  <AlertOctagon size={16} color="#aaaaaa" />
                  <ButtonText color="#cccccc" fontWeight="$medium" fontSize="$xs">
                    Simulate Failure
                  </ButtonText>
                </HStack>
              </Button>

              <Button
                flex={1}
                size="md"
                variant="outline"
                borderColor={callState === 'FAILED' ? '#ffffff' : '#222222'}
                bg="#111111"
                borderRadius="$xl"
                onPress={handleRetry}
                isDisabled={callState !== 'FAILED'}
                px="$3"
                testID="btn-retry">
                <HStack space="xs" alignItems="center" justifyContent="center">
                  <RotateCcw
                    size={16}
                    color={callState === 'FAILED' ? '#ffffff' : '#555555'}
                  />
                  <ButtonText
                    color={callState === 'FAILED' ? '#ffffff' : '#555555'}
                    fontWeight="$medium"
                    fontSize="$xs">
                    Retry
                  </ButtonText>
                </HStack>
              </Button>
            </HStack>
          </VStack>

          {/* Session Call Logs */}
          <VStack space="xs">
            <HStack space="xs" alignItems="center" px="$1">
              <History size={14} color="#888888" />
              <Text size="xs" color="#888888" fontWeight="$bold" textTransform="uppercase">
                Riwayat Sesi Simulasi
              </Text>
            </HStack>

            {callLogs.length === 0 ? (
              <Box
                bg="#0d0d0d"
                borderColor="#1a1a1a"
                borderWidth={1}
                borderRadius="$xl"
                p="$4">
                <Text size="xs" color="#555555" textAlign="center">
                  Belum ada riwayat panggilan pada sesi ini.
                </Text>
              </Box>
            ) : (
              <VStack space="xs">
                {callLogs.map(log => (
                  <Box
                    key={log.id}
                    bg="#0d0d0d"
                    borderColor="#1a1a1a"
                    borderWidth={1}
                    borderRadius="$lg"
                    px="$4"
                    py="$3">
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack space="sm" alignItems="center">
                        {log.status === 'COMPLETED' ? (
                          <CheckCircle2 size={16} color="#ffffff" />
                        ) : (
                          <XCircle size={16} color="#888888" />
                        )}
                        <VStack>
                          <Text size="xs" color="#cccccc" fontWeight="$bold">
                            {log.status === 'COMPLETED'
                              ? 'Panggilan Berhasil'
                              : log.status === 'FAILED'
                              ? 'Panggilan Gagal'
                              : 'Dibatalkan'}
                          </Text>
                          <Text size="2xs" color="#666666">
                            {log.timestamp}
                          </Text>
                        </VStack>
                      </HStack>
                      <Badge size="sm" variant="solid" bg="#1a1a1a" borderRadius="$md">
                        <BadgeText color="#aaaaaa" fontSize="$2xs">
                          {formatCallDuration(log.duration)}
                        </BadgeText>
                      </Badge>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
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

export default CallSimulatorScreen;
