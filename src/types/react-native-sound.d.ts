declare module 'react-native-sound' {
  export default class Sound {
    static MAIN_BUNDLE: string;
    static DOCUMENT: string;
    static LIBRARY: string;
    static CACHES: string;
    static setCategory(category: string, mixWithOthers?: boolean): void;
    static setMode(mode: string): void;

    constructor(
      filename: string | number,
      basePathOrError?: string | ((error: any) => void),
      onError?: (error: any) => void,
    );

    play(onEnd?: (success: boolean) => void): void;
    pause(callback?: () => void): void;
    stop(callback?: () => void): void;
    release(): void;
    getDuration(): number;
    getNumberOfChannels(): number;
    isLoaded(): boolean;
    isPlaying(): boolean;
    setVolume(value: number): Sound;
    setNumberOfLoops(value: number): Sound;
  }
}
