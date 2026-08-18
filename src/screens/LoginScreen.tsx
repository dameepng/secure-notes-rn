import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  Badge,
  BadgeText,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  Input,
  InputField,
  Button,
  ButtonText,
  ButtonSpinner,
  Alert,
  AlertText,
  Center,
} from '@gluestack-ui/themed';
import { ShieldCheck, LogIn, Zap, Lock, Mail, KeyRound } from 'lucide-react-native';

import { useAuth } from '../navigation/AuthContext';
import { ApiError } from '../types/api';
import { useToast } from '../components/ToastContext';

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Email tidak boleh kosong.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Format email tidak valid (contoh: nama@domain.com).');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password tidak boleh kosong.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password minimal 6 karakter.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setGeneralError(null);

    try {
      await login({ email: email.trim(), password });
      showSuccess('Selamat datang di SecureNotes!', 'Login Berhasil');
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message =
        apiErr.message ||
        'Gagal login. Pastikan kredensial benar dan koneksi internet aktif.';
      setGeneralError(message);
      showError(message, 'Autentikasi Gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('adam@securenotes.dev');
    setPassword('password123');
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);
  };

  return (
    <Box
      flex={1}
      bg="#0f172a"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Header Brand */}
          <Center mb="$8">
            <Badge
              size="md"
              variant="solid"
              action="info"
              bg="#0369a1"
              borderRadius="$full"
              px="$3"
              py="$1"
              mb="$3">
              <BadgeText color="#e0f2fe" fontWeight="$bold" fontSize="$xs">
                GLUESTACK UI • NEW ARCHITECTURE
              </BadgeText>
            </Badge>

            <HStack space="xs" alignItems="center" justifyContent="center">
              <ShieldCheck size={32} color="#38bdf8" />
              <Heading size="3xl" color="#f8fafc" fontWeight="$extrabold" textAlign="center">
                SecureNotes
              </Heading>
            </HStack>
            <Text size="sm" color="#94a3b8" mt="$1" textAlign="center">
              Aplikasi Catatan Pribadi Terenkripsi AES-256
            </Text>

            <HStack space="xs" mt="$3">
              <Badge size="sm" variant="outline" borderColor="#334155" borderRadius="$md">
                <BadgeText color="#38bdf8" fontSize="$2xs">Fabric UI</BadgeText>
              </Badge>
              <Badge size="sm" variant="outline" borderColor="#334155" borderRadius="$md">
                <BadgeText color="#38bdf8" fontSize="$2xs">TurboModule JSI</BadgeText>
              </Badge>
              <Badge size="sm" variant="outline" borderColor="#334155" borderRadius="$md">
                <BadgeText color="#38bdf8" fontSize="$2xs">AES-256</BadgeText>
              </Badge>
            </HStack>
          </Center>

          {/* Gluestack Card Form */}
          <Card
            size="md"
            variant="elevated"
            bg="#1e293b"
            borderColor="#334155"
            borderWidth={1}
            borderRadius="$2xl"
            p="$6">
            <VStack space="lg">
              <VStack space="xs">
                <Heading size="lg" color="#f8fafc" fontWeight="$bold">
                  Masuk ke Akun
                </Heading>
                <Text size="xs" color="#94a3b8">
                  Gunakan akun dummy untuk memulai sesi terenkripsi Anda
                </Text>
              </VStack>

              {generalError && (
                <Alert action="error" variant="accent" bg="#450a0a" borderColor="#ef4444" borderRadius="$lg" p="$3">
                  <AlertText color="#fca5a5" size="xs">
                    {generalError}
                  </AlertText>
                </Alert>
              )}

              {/* FormControl: Email */}
              <FormControl isInvalid={Boolean(emailError)} isRequired>
                <FormControlLabel mb="$1">
                  <HStack space="xs" alignItems="center">
                    <Mail size={12} color="#94a3b8" />
                    <FormControlLabelText color="#cbd5e1" fontSize="$xs" fontWeight="$semibold">
                      Email
                    </FormControlLabelText>
                  </HStack>
                </FormControlLabel>
                <Input
                  variant="outline"
                  size="md"
                  bg="#0f172a"
                  borderColor={emailError ? '#ef4444' : '#334155'}
                  borderRadius="$xl">
                  <InputField
                    placeholder="contoh@email.com"
                    placeholderTextColor="#64748b"
                    color="#f8fafc"
                    value={email}
                    onChangeText={(text: string) => {
                      setEmail(text);
                      if (emailError) {
                        setEmailError(null);
                      }
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                  />
                </Input>
                {emailError && (
                  <FormControlError mt="$1">
                    <FormControlErrorText color="#f87171" fontSize="$2xs">
                      {emailError}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* FormControl: Password */}
              <FormControl isInvalid={Boolean(passwordError)} isRequired>
                <FormControlLabel mb="$1">
                  <HStack space="xs" alignItems="center">
                    <KeyRound size={12} color="#94a3b8" />
                    <FormControlLabelText color="#cbd5e1" fontSize="$xs" fontWeight="$semibold">
                      Password
                    </FormControlLabelText>
                  </HStack>
                </FormControlLabel>
                <Input
                  variant="outline"
                  size="md"
                  bg="#0f172a"
                  borderColor={passwordError ? '#ef4444' : '#334155'}
                  borderRadius="$xl">
                  <InputField
                    placeholder="Minimal 6 karakter"
                    placeholderTextColor="#64748b"
                    color="#f8fafc"
                    value={password}
                    onChangeText={(text: string) => {
                      setPassword(text);
                      if (passwordError) {
                        setPasswordError(null);
                      }
                    }}
                    secureTextEntry
                    editable={!loading}
                  />
                </Input>
                {passwordError && (
                  <FormControlError mt="$1">
                    <FormControlErrorText color="#f87171" fontSize="$2xs">
                      {passwordError}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Gluestack Submit Button */}
              <Button
                size="lg"
                variant="solid"
                action="primary"
                bg="#0284c7"
                borderRadius="$xl"
                onPress={handleLogin}
                isDisabled={loading}
                mt="$2">
                {loading ? (
                  <ButtonSpinner color="#ffffff" mr="$2" />
                ) : (
                  <HStack space="xs" alignItems="center">
                    <LogIn size={16} color="#ffffff" />
                    <ButtonText color="#ffffff" fontWeight="$bold" fontSize="$sm">
                      Masuk ke Aplikasi
                    </ButtonText>
                  </HStack>
                )}
              </Button>

              {/* Quick Fill Button */}
              <Button
                size="sm"
                variant="link"
                action="secondary"
                onPress={handleQuickFill}
                isDisabled={loading}>
                <HStack space="xs" alignItems="center">
                  <Zap size={14} color="#38bdf8" />
                  <ButtonText color="#38bdf8" fontSize="$xs" fontWeight="$semibold">
                    Isi Otomatis Akun Demo (Quick Fill)
                  </ButtonText>
                </HStack>
              </Button>
            </VStack>
          </Card>

          {/* Footer Note */}
          <Center mt="$8">
            <HStack space="xs" alignItems="center" px="$4">
              <Lock size={12} color="#64748b" />
              <Text size="xs" color="#64748b" textAlign="center" lineHeight="$sm">
                Sesi login dan token JWT disimpan lokal via AsyncStorage terenkripsi.
              </Text>
            </HStack>
          </Center>
        </ScrollView>
      </KeyboardAvoidingView>
    </Box>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
});

export default LoginScreen;
