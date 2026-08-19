import DeviceInfo from 'react-native-device-info';
import NativeBatteryInfo from './NativeBatteryInfo';

export interface BatteryStatus {
  level: number; // 0 - 100
  isCharging: boolean;
  source: 'TURBOMODULE' | 'DEVICE_INFO' | 'UNAVAILABLE';
}

/**
 * Mengambil informasi level dan status pengisian daya baterai secara real-time.
 * Mengutamakan TurboModule kustom (NativeBatteryInfo) dan fallback ke react-native-device-info jika diperlukan.
 */
export async function getDeviceBatteryStatus(): Promise<BatteryStatus> {
  // 1. Coba menggunakan Custom TurboModule NativeBatteryInfo
  if (NativeBatteryInfo && typeof NativeBatteryInfo.getBatteryLevel === 'function') {
    try {
      const [level, isCharging] = await Promise.all([
        NativeBatteryInfo.getBatteryLevel(),
        typeof NativeBatteryInfo.isCharging === 'function'
          ? NativeBatteryInfo.isCharging()
          : Promise.resolve(false),
      ]);

      if (typeof level === 'number' && level >= 0) {
        return {
          level: Math.round(level),
          isCharging: Boolean(isCharging),
          source: 'TURBOMODULE',
        };
      }
    } catch (e) {
      console.warn(
        'NativeBatteryInfo TurboModule invocation failed, falling back to DeviceInfo:',
        e,
      );
    }
  }

  // 2. Fallback menggunakan react-native-device-info
  try {
    const [rawLevel, isCharging] = await Promise.all([
      DeviceInfo.getBatteryLevel(),
      DeviceInfo.isBatteryCharging(),
    ]);

    const level =
      typeof rawLevel === 'number' && rawLevel >= 0
        ? Math.round(rawLevel * 100)
        : -1;

    return {
      level,
      isCharging: Boolean(isCharging),
      source: level >= 0 ? 'DEVICE_INFO' : 'UNAVAILABLE',
    };
  } catch (e) {
    console.warn('DeviceInfo battery fallback failed:', e);
    return {
      level: -1,
      isCharging: false,
      source: 'UNAVAILABLE',
    };
  }
}
