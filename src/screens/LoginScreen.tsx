import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Box,
  VStack,
  Heading,
  Text,
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
      setEmailError('Format email tidak valid.');
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
      showSuccess('Selamat datang!', 'Login Berhasil');
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message =
        apiErr.message || 'Gagal login. Periksa kredensial dan koneksi Anda.';
      setGeneralError(message);
      showError(message, 'Login Gagal');
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
      bg="#000000"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Header */}
          <Center mb="$10">
            <Heading size="3xl" color="#ffffff" fontWeight="$bold" letterSpacing={-1}>
              SecureNotes
            </Heading>
          </Center>

          {/* Form */}
          <VStack space="xl">
            {generalError && (
              <Alert action="error" variant="accent" bg="#1a1a1a" borderColor="#666666" borderRadius="$lg" p="$3">
                <AlertText color="#cccccc" size="xs">
                  {generalError}
                </AlertText>
              </Alert>
            )}

            {/* Email */}
            <FormControl isInvalid={Boolean(emailError)} isRequired>
              <FormControlLabel mb="$2">
                <FormControlLabelText color="#999999" fontSize="$xs" fontWeight="$medium">
                  Email
                </FormControlLabelText>
              </FormControlLabel>
              <Input
                variant="outline"
                size="lg"
                bg="#111111"
                borderColor={emailError ? '#ff4444' : '#333333'}
                borderRadius="$lg">
                <InputField
                  placeholder="email@contoh.com"
                  placeholderTextColor="#555555"
                  color="#ffffff"
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
                  <FormControlErrorText color="#ff6666" fontSize="$2xs">
                    {emailError}
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            {/* Password */}
            <FormControl isInvalid={Boolean(passwordError)} isRequired>
              <FormControlLabel mb="$2">
                <FormControlLabelText color="#999999" fontSize="$xs" fontWeight="$medium">
                  Password
                </FormControlLabelText>
              </FormControlLabel>
              <Input
                variant="outline"
                size="lg"
                bg="#111111"
                borderColor={passwordError ? '#ff4444' : '#333333'}
                borderRadius="$lg">
                <InputField
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor="#555555"
                  color="#ffffff"
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
                  <FormControlErrorText color="#ff6666" fontSize="$2xs">
                    {passwordError}
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            {/* Submit */}
            <Button
              size="lg"
              variant="solid"
              action="primary"
              bg="#ffffff"
              borderRadius="$lg"
              onPress={handleLogin}
              isDisabled={loading}
              mt="$2"
              sx={{ ':active': { bg: '#e0e0e0' } }}>
              {loading ? (
                <ButtonSpinner color="#000000" />
              ) : (
                <ButtonText color="#000000" fontWeight="$bold" fontSize="$sm">
                  Masuk
                </ButtonText>
              )}
            </Button>

            {/* Quick Fill */}
            <Button
              size="sm"
              variant="link"
              action="secondary"
              onPress={handleQuickFill}
              isDisabled={loading}>
              <ButtonText color="#666666" fontSize="$xs">
                Isi akun demo
              </ButtonText>
            </Button>
          </VStack>
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
    padding: 32,
    justifyContent: 'center',
    flexGrow: 1,
  },
});

export default LoginScreen;
