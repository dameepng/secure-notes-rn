import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [fadeAnim, slideAnim]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToast({
        id: `toast_${Date.now()}`,
        type,
        title,
        message,
      });

      fadeAnim.setValue(0);
      slideAnim.setValue(-20);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        hideToast();
      }, 3500);
    },
    [fadeAnim, hideToast, slideAnim],
  );

  const showSuccess = useCallback(
    (message: string, title: string = 'Berhasil') => {
      showToast(message, 'success', title);
    },
    [showToast],
  );

  const showError = useCallback(
    (message: string, title: string = 'Terjadi Kesalahan') => {
      showToast(message, 'error', title);
    },
    [showToast],
  );

  const showWarning = useCallback(
    (message: string, title: string = 'Perhatian') => {
      showToast(message, 'warning', title);
    },
    [showToast],
  );

  const showInfo = useCallback(
    (message: string, title: string = 'Informasi') => {
      showToast(message, 'info', title);
    },
    [showToast],
  );

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getContainerStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return styles.toastSuccess;
      case 'error':
        return styles.toastError;
      case 'warning':
        return styles.toastWarning;
      case 'info':
      default:
        return styles.toastInfo;
    }
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideToast,
      }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            getContainerStyle(toast.type),
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <Text style={styles.toastIcon}>{getIcon(toast.type)}</Text>
          <View style={styles.toastContent}>
            {toast.title && (
              <Text style={styles.toastTitle}>{toast.title}</Text>
            )}
            <Text style={styles.toastMessage}>{toast.message}</Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={hideToast}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback gracefully jika dipanggil di luar provider
    return {
      showToast: () => {},
      showSuccess: () => {},
      showError: () => {},
      showWarning: () => {},
      showInfo: () => {},
      hideToast: () => {},
    };
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  toastSuccess: {
    backgroundColor: '#064e3b',
    borderColor: '#059669',
  },
  toastError: {
    backgroundColor: '#450a0a',
    borderColor: '#dc2626',
  },
  toastWarning: {
    backgroundColor: '#451a03',
    borderColor: '#d97706',
  },
  toastInfo: {
    backgroundColor: '#0c4a6e',
    borderColor: '#0284c7',
  },
  toastIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  toastMessage: {
    color: '#e2e8f0',
    fontSize: 12,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
  closeIcon: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ToastProvider;
