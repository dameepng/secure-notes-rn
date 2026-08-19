import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * Memicu Intent native Android (MediaStore.ACTION_IMAGE_CAPTURE) untuk membuka aplikasi kamera bawaan perangkat.
   */
  openCamera(): Promise<boolean>;
}

export default TurboModuleRegistry.get<Spec>('NativeCameraLauncher');
