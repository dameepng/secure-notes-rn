import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import DeviceInfo from 'react-native-device-info';

import DeviceInfoScreen from '../src/screens/DeviceInfoScreen';
import * as audioRouter from '../src/native/audioRouter';

jest.mock('../src/native/audioRouter', () => ({
  setDeviceAudioOutput: jest.fn(),
  getDeviceAudioOutput: jest.fn().mockReturnValue('speaker'),
  playSimulationAudio: jest.fn().mockImplementation((cb: () => void) => {
    if (cb) {
      cb();
    }
    return Promise.resolve(true);
  }),
  stopSimulationAudio: jest.fn(),
}));

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe('DeviceInfoScreen (Fase 2, 5, 6, 7)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and calls DeviceInfo native methods', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GluestackUIProvider config={config}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <DeviceInfoScreen />
          </SafeAreaProvider>
        </GluestackUIProvider>,
      );
    });

    expect(renderer).not.toBeNull();
    const tree = renderer!.toJSON();
    expect(tree).toBeTruthy();

    expect(DeviceInfo.getBrand).toHaveBeenCalled();
    expect(DeviceInfo.getModel).toHaveBeenCalled();
    expect(DeviceInfo.getVersion).toHaveBeenCalled();
  });

  it('renders device brand, model, and app version values in UI tree', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GluestackUIProvider config={config}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <DeviceInfoScreen />
          </SafeAreaProvider>
        </GluestackUIProvider>,
      );
    });

    const root = renderer!.root;
    const brandElement = root.findByProps({ testID: 'device-brand-value' });
    const modelElement = root.findByProps({ testID: 'device-model-value' });
    const versionElement = root.findByProps({ testID: 'device-version-value' });

    expect(brandElement.props.children).toBe('Google');
    expect(modelElement.props.children).toBe('Pixel 8 Pro');
    expect(versionElement.props.children).toContain('0.0.1');
  });

  it('renders battery level and source badge in UI tree', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GluestackUIProvider config={config}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <DeviceInfoScreen />
          </SafeAreaProvider>
        </GluestackUIProvider>,
      );
    });

    const root = renderer!.root;
    const batteryLevel = root.findByProps({ testID: 'battery-level-value' });
    const batteryBadge = root.findByProps({ testID: 'battery-source-badge' });

    expect(batteryLevel.props.children).toBeTruthy();
    expect(batteryBadge.props.children).toBeTruthy();
  });

  it('renders camera card and triggers open camera on button press', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GluestackUIProvider config={config}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <DeviceInfoScreen />
          </SafeAreaProvider>
        </GluestackUIProvider>,
      );
    });

    const root = renderer!.root;
    const cameraBadge = root.findByProps({
      testID: 'camera-permission-badge',
    });
    const btnCamera = root.findByProps({ testID: 'btn-open-camera' });

    expect(cameraBadge).toBeTruthy();
    expect(btnCamera).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      btnCamera.props.onPress();
    });
  });

  it('renders audio output routing buttons and handles route switching and audio playback', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GluestackUIProvider config={config}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <DeviceInfoScreen />
          </SafeAreaProvider>
        </GluestackUIProvider>,
      );
    });

    const root = renderer!.root;
    const audioRouteBadge = root.findByProps({
      testID: 'audio-active-route-badge',
    });
    const btnEarpiece = root.findByProps({ testID: 'btn-route-earpiece' });
    const btnHeadset = root.findByProps({ testID: 'btn-route-headset' });
    const btnSpeaker = root.findByProps({ testID: 'btn-route-speaker' });
    const btnAudioToggle = root.findByProps({
      testID: 'btn-toggle-audio-playback',
    });

    expect(audioRouteBadge).toBeTruthy();
    expect(btnEarpiece).toBeTruthy();
    expect(btnHeadset).toBeTruthy();
    expect(btnSpeaker).toBeTruthy();
    expect(btnAudioToggle).toBeTruthy();

    // Tap Earpiece
    await ReactTestRenderer.act(async () => {
      btnEarpiece.props.onPress();
    });
    expect(audioRouter.setDeviceAudioOutput).toHaveBeenCalledWith('earpiece');

    // Tap Headset
    await ReactTestRenderer.act(async () => {
      btnHeadset.props.onPress();
    });
    expect(audioRouter.setDeviceAudioOutput).toHaveBeenCalledWith('headset');

    // Tap Toggle Audio Playback
    await ReactTestRenderer.act(async () => {
      btnAudioToggle.props.onPress();
    });
    expect(audioRouter.playSimulationAudio).toHaveBeenCalled();
  });
});
