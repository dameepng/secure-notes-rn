import { PermissionsAndroid, Platform } from 'react-native';
import NativeCameraLauncher from './NativeCameraLauncher';

export type CameraPermissionState =
  | 'UNDETERMINED'
  | 'GRANTED'
  | 'DENIED'
  | 'NEVER_ASK_AGAIN';

export interface CameraLaunchResult {
  success: boolean;
  permissionStatus: CameraPermissionState;
  errorMessage?: string;
}

/**
 * Memeriksa status izin kamera saat ini tanpa memicu pop-up dialog.
 */
export async function checkCameraPermission(): Promise<CameraPermissionState> {
  if (Platform.OS !== 'android') {
    return 'GRANTED';
  }

  try {
    const isGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    return isGranted ? 'GRANTED' : 'DENIED';
  } catch (error) {
    console.warn('Failed to check camera permission:', error);
    return 'DENIED';
  }
}

/**
 * Meminta izin kamera runtime dengan penanganan 3 kondisi:
 * 1. GRANTED -> Izin diberikan.
 * 2. DENIED -> Ditolak biasa (bisa diminta ulang).
 * 3. NEVER_ASK_AGAIN -> Ditolak permanen (harus diarahkan ke Settings aplikasi).
 */
export async function requestCameraPermission(): Promise<CameraPermissionState> {
  if (Platform.OS !== 'android') {
    return 'GRANTED';
  }

  try {
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Izin Akses Kamera',
        message:
          'SecureNotes memerlukan akses kamera untuk membuka antarmuka pemotretan native.',
        buttonNeutral: 'Nanti',
        buttonNegative: 'Tolak',
        buttonPositive: 'Izinkan',
      },
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return 'GRANTED';
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      return 'NEVER_ASK_AGAIN';
    } else {
      return 'DENIED';
    }
  } catch (error) {
    console.warn('Error requesting camera permission:', error);
    return 'DENIED';
  }
}

/**
 * Menjalankan alur lengkap: Request Permission -> Buka Kamera Native via Intent.
 */
export async function launchNativeCamera(): Promise<CameraLaunchResult> {
  const permissionStatus = await requestCameraPermission();

  if (permissionStatus === 'DENIED') {
    return {
      success: false,
      permissionStatus: 'DENIED',
      errorMessage:
        'Izin kamera ditolak. Silakan izinkan akses kamera untuk melanjutkan.',
    };
  }

  if (permissionStatus === 'NEVER_ASK_AGAIN') {
    return {
      success: false,
      permissionStatus: 'NEVER_ASK_AGAIN',
      errorMessage:
        'Izin kamera ditolak permanen. Buka Pengaturan Aplikasi untuk mengaktifkan izin.',
    };
  }

  // Permission is GRANTED -> Launch native camera intent
  try {
    if (
      NativeCameraLauncher &&
      typeof NativeCameraLauncher.openCamera === 'function'
    ) {
      const opened = await NativeCameraLauncher.openCamera();
      return {
        success: Boolean(opened),
        permissionStatus: 'GRANTED',
      };
    } else {
      return {
        success: false,
        permissionStatus: 'GRANTED',
        errorMessage: 'Modul NativeCameraLauncher tidak ditemukan.',
      };
    }
  } catch (error: any) {
    console.error('Failed to launch camera intent:', error);
    return {
      success: false,
      permissionStatus: 'GRANTED',
      errorMessage: error?.message || 'Gagal membuka aplikasi kamera.',
    };
  }
}
