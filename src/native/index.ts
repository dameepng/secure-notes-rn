import NativeSecurityChecker, { Spec } from './NativeSecurityChecker';

export interface SecurityStatus {
  isDeviceSecure: boolean;
  securityLevel: string;
  hasHardwareKeystore: boolean;
  isTurboModuleActive: boolean;
}

/**
 * Memeriksa status keamanan perangkat menggunakan Custom TurboModule (JSI Native Module).
 * Menguji pemanggilan method synchronous (getSecurityLevel) dan asynchronous (isDeviceSecure, hasHardwareKeystore).
 */
export async function checkDeviceSecurityStatus(): Promise<SecurityStatus> {
  const isAvailable = Boolean(NativeSecurityChecker);

  if (!isAvailable) {
    return {
      isDeviceSecure: false,
      securityLevel: 'UNKNOWN',
      hasHardwareKeystore: false,
      isTurboModuleActive: false,
    };
  }

  try {
    // 1. Pemanggilan sinkron langsung via JSI (Zero Bridge Overhead)
    const securityLevel =
      typeof NativeSecurityChecker?.getSecurityLevel === 'function'
        ? NativeSecurityChecker.getSecurityLevel()
        : 'UNKNOWN';

    // 2. Pemanggilan asinkron via TurboModule Promise
    const [isSecure, hasHwKeystore] = await Promise.all([
      typeof NativeSecurityChecker?.isDeviceSecure === 'function'
        ? NativeSecurityChecker.isDeviceSecure()
        : Promise.resolve(false),
      typeof NativeSecurityChecker?.hasHardwareKeystore === 'function'
        ? NativeSecurityChecker.hasHardwareKeystore()
        : Promise.resolve(false),
    ]);

    return {
      isDeviceSecure: isSecure,
      securityLevel,
      hasHardwareKeystore: hasHwKeystore,
      isTurboModuleActive: true,
    };
  } catch (error) {
    console.warn('SecurityChecker TurboModule call failed:', error);
    return {
      isDeviceSecure: false,
      securityLevel: 'LOW',
      hasHardwareKeystore: false,
      isTurboModuleActive: true,
    };
  }
}

export { NativeSecurityChecker };
export type { Spec };
export { default as NativeBatteryInfo } from './NativeBatteryInfo';
export { getDeviceBatteryStatus } from './battery';
export type { BatteryStatus } from './battery';
export { default as NativeCameraLauncher } from './NativeCameraLauncher';
export {
  checkCameraPermission,
  requestCameraPermission,
  launchNativeCamera,
} from './camera';
export type { CameraPermissionState, CameraLaunchResult } from './camera';
export default NativeSecurityChecker;
