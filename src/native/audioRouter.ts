import Sound from 'react-native-sound';
import NativeAudioRouter from './NativeAudioRouter';

export type AudioOutputMode = 'speaker' | 'earpiece' | 'headset';

export interface AudioRouterState {
  currentOutput: AudioOutputMode;
  isPlaying: boolean;
}

let activeSoundInstance: Sound | null = null;

/**
 * Mengubah rute output audio perangkat (Speaker, Earpiece, atau Headset).
 */
export function setDeviceAudioOutput(mode: AudioOutputMode): void {
  try {
    if (
      NativeAudioRouter &&
      typeof NativeAudioRouter.setAudioOutput === 'function'
    ) {
      NativeAudioRouter.setAudioOutput(mode);
    }
  } catch (error) {
    console.warn('Failed to set audio output via TurboModule:', error);
  }
}

/**
 * Mengambil status rute audio output saat ini.
 */
export function getDeviceAudioOutput(): AudioOutputMode {
  try {
    if (
      NativeAudioRouter &&
      typeof NativeAudioRouter.getAudioOutput === 'function'
    ) {
      const mode = NativeAudioRouter.getAudioOutput();
      if (mode === 'earpiece' || mode === 'headset' || mode === 'speaker') {
        return mode;
      }
    }
  } catch (error) {
    console.warn('Failed to get audio output:', error);
  }
  return 'speaker';
}

/**
 * Memutar simulasi audio chime / ringtone.
 * Mengutamakan pemutaran via NativeAudioRouter (native MediaPlayer raw resource),
 * dengan fallback ke react-native-sound.
 */
export async function playSimulationAudio(
  onFinish?: () => void,
): Promise<boolean> {
  // 1. Coba via NativeAudioRouter TurboModule
  if (
    NativeAudioRouter &&
    typeof NativeAudioRouter.playSimulationSound === 'function'
  ) {
    try {
      const success = await NativeAudioRouter.playSimulationSound();
      if (success) {
        return true;
      }
    } catch (e) {
      console.warn(
        'NativeAudioRouter play sound failed, trying Sound fallback:',
        e,
      );
    }
  }

  // 2. Fallback via react-native-sound
  return new Promise(resolve => {
    try {
      stopSimulationAudio();

      Sound.setCategory('Playback');
      const sound = new Sound(
        'simulation_ringtone.mp3',
        Sound.MAIN_BUNDLE,
        error => {
          if (error) {
            console.warn(
              'Failed to load sound file in react-native-sound:',
              error,
            );
            resolve(false);
            return;
          }

          activeSoundInstance = sound;
          sound.play(() => {
            activeSoundInstance = null;
            sound.release();
            if (onFinish) {
              onFinish();
            }
          });
          resolve(true);
        },
      );
    } catch (err) {
      console.warn('react-native-sound play failed:', err);
      resolve(false);
    }
  });
}

/**
 * Menghentikan pemutaran audio simulasi yang sedang berjalan.
 */
export function stopSimulationAudio(): void {
  try {
    if (
      NativeAudioRouter &&
      typeof NativeAudioRouter.stopSimulationSound === 'function'
    ) {
      NativeAudioRouter.stopSimulationSound();
    }
  } catch (e) {
    console.warn('Failed to stop native sound:', e);
  }

  if (activeSoundInstance) {
    try {
      activeSoundInstance.stop();
      activeSoundInstance.release();
    } catch (e) {
      console.warn('Failed to release sound instance:', e);
    }
    activeSoundInstance = null;
  }
}
