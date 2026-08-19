import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import DeviceInfo from 'react-native-device-info';

import DeviceInfoScreen from '../src/screens/DeviceInfoScreen';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe('DeviceInfoScreen (Fase 2: Device Info Dasar)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and calls DeviceInfo native methods', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    ReactTestRenderer.act(() => {
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

  it('renders device brand, model, and app version values in UI tree', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    ReactTestRenderer.act(() => {
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
});
