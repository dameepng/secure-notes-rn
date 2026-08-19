import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * Mengatur rute audio output ke: 'earpiece' | 'speaker' | 'headset'.
   */
  setAudioOutput(mode: string): void;

  /**
   * Mengambil rute audio output aktif saat ini.
   */
  getAudioOutput(): string;

  /**
   * Memutar simulasi nada dering / chime audio.
   */
  playSimulationSound(): Promise<boolean>;

  /**
   * Menghentikan pemutaran audio simulasi.
   */
  stopSimulationSound(): void;

  /**
   * Mengecek apakah audio simulasi sedang berbunyi.
   */
  isAudioPlaying(): Promise<boolean>;
}

export default TurboModuleRegistry.get<Spec>('NativeAudioRouter');
