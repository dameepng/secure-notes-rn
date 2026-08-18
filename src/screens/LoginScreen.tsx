import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    <KeyboardAvoidingView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>FASE 8 — ERROR HANDLING & UX</Text>
          </View>
          <Text style={styles.appName}>SecureNotes</Text>
          <Text style={styles.appTagline}>
            Aplikasi Catatan Pribadi Terenkripsi AES-256
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Masuk ke Akun</Text>
          <Text style={styles.formSubtitle}>
            Gunakan akun dummy untuk memulai sesi terenkripsi Anda
          </Text>

          {generalError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{generalError}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              placeholder="contoh@email.com"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (emailError) {
                  setEmailError(null);
                }
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
            {emailError && <Text style={styles.fieldErrorText}>{emailError}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, passwordError && styles.inputError]}
              placeholder="Minimal 6 karakter"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (passwordError) {
                  setPasswordError(null);
                }
              }}
              secureTextEntry
              editable={!loading}
            />
            {passwordError && (
              <Text style={styles.fieldErrorText}>{passwordError}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginBtnText}>Masuk</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickFillBtn}
            onPress={handleQuickFill}
            disabled={loading}>
            <Text style={styles.quickFillText}>
              ⚡ Isi Otomatis Akun Demo (Quick Fill)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            🔒 Sesi login dan token JWT disimpan lokal via AsyncStorage terenkripsi.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  badgeContainer: {
    backgroundColor: '#0369a1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: '#e0f2fe',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f8fafc',
  },
  appTagline: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 6,
  },
  formCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
  },
  formSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 20,
  },
  errorBanner: {
    backgroundColor: '#450a0a',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  fieldErrorText: {
    color: '#f87171',
    fontSize: 11,
    marginTop: 4,
  },
  loginBtn: {
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  quickFillBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  quickFillText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '600',
  },
  footerNote: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LoginScreen;
