import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * Mengambil persentase level baterai perangkat (0 - 100).
   */
  getBatteryLevel(): Promise<number>;

  /**
   * Mengecek apakah perangkat sedang dalam proses pengisian daya (charging).
   */
  isCharging(): Promise<boolean>;
}

export default TurboModuleRegistry.get<Spec>('NativeBatteryInfo');
