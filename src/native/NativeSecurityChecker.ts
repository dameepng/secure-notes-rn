import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * Mengecek apakah device memiliki proteksi keamanan layar (PIN, Pola, Password, atau Biometrik).
   */
  isDeviceSecure(): Promise<boolean>;

  /**
   * Mengembalikan level keamanan perangkat secara sinkron (Synchronous JSI direct call).
   * Nilai: 'HIGH' | 'MEDIUM' | 'LOW'
   */
  getSecurityLevel(): string;

  /**
   * Mengecek apakah Android Keystore didukung oleh hardware chip keamanan (TEE / StrongBox Keymaster).
   */
  hasHardwareKeystore(): Promise<boolean>;
}

export default TurboModuleRegistry.get<Spec>('NativeSecurityChecker');
