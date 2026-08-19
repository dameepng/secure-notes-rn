import NativeAudioRouter from '../src/native/NativeAudioRouter';
import {
  setDeviceAudioOutput,
  getDeviceAudioOutput,
  playSimulationAudio,
  stopSimulationAudio,
} from '../src/native/audioRouter';

jest.mock('../src/native/NativeAudioRouter', () => ({
  __esModule: true,
  default: {
    setAudioOutput: jest.fn(),
    getAudioOutput: jest.fn().mockReturnValue('speaker'),
    playSimulationSound: jest.fn().mockResolvedValue(true),
    stopSimulationSound: jest.fn(),
    isAudioPlaying: jest.fn().mockResolvedValue(false),
  },
}));

jest.mock('react-native-sound', () => {
  return class MockSound {
    static MAIN_BUNDLE = 'MAIN_BUNDLE';
    static setCategory = jest.fn();
    constructor(_file: string, _bundle: any, cb: (err: any) => void) {
      if (cb) {
        cb(null);
      }
    }
    play = jest.fn((cb: () => void) => cb && cb());
    stop = jest.fn();
    release = jest.fn();
  };
});

describe('Audio Router Module (Fase 7: Native Audio Routing & Playback)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets audio output to earpiece, speaker, and headset via Native TurboModule', () => {
    setDeviceAudioOutput('earpiece');
    expect(NativeAudioRouter?.setAudioOutput).toHaveBeenCalledWith('earpiece');

    setDeviceAudioOutput('speaker');
    expect(NativeAudioRouter?.setAudioOutput).toHaveBeenCalledWith('speaker');

    setDeviceAudioOutput('headset');
    expect(NativeAudioRouter?.setAudioOutput).toHaveBeenCalledWith('headset');
  });

  it('gets current audio output from Native TurboModule', () => {
    (NativeAudioRouter?.getAudioOutput as jest.Mock).mockReturnValueOnce('earpiece');
    const mode = getDeviceAudioOutput();
    expect(mode).toBe('earpiece');
  });

  it('plays simulation audio successfully using NativeAudioRouter TurboModule', async () => {
    (NativeAudioRouter?.playSimulationSound as jest.Mock).mockResolvedValueOnce(true);
    const onFinish = jest.fn();

    const success = await playSimulationAudio(onFinish);
    expect(success).toBe(true);
    expect(NativeAudioRouter?.playSimulationSound).toHaveBeenCalledTimes(1);
  });

  it('stops simulation audio cleanly', () => {
    stopSimulationAudio();
    expect(NativeAudioRouter?.stopSimulationSound).toHaveBeenCalledTimes(1);
  });
});
