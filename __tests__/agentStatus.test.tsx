import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AgentStatusScreen from '../src/screens/AgentStatusScreen';
import {
  saveAgentStatus,
  AGENT_STATUS_STORAGE_KEY,
} from '../src/storage/agentStatusStorage';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe('AgentStatusScreen (Fase 3: Agent Status & Persisted Storage)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('renders correctly and defaults to AVAILABLE when no saved status', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GluestackUIProvider config={config}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <AgentStatusScreen />
          </SafeAreaProvider>
        </GluestackUIProvider>,
      );
      await Promise.resolve();
    });

    const root = renderer!.root;
    const activeBadge = root.findByProps({ testID: 'active-status-badge' });
    expect(activeBadge.props.children).toBe('AVAILABLE');
  });

  it('restores persisted status from AsyncStorage on mount (Read-Before-Render)', async () => {
    await saveAgentStatus('BUSY');

    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GluestackUIProvider config={config}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <AgentStatusScreen />
          </SafeAreaProvider>
        </GluestackUIProvider>,
      );
      await Promise.resolve();
    });

    const root = renderer!.root;
    const activeBadge = root.findByProps({ testID: 'active-status-badge' });
    expect(activeBadge.props.children).toBe('BUSY');
  });

  it('updates status and saves to AsyncStorage when user selects another option', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GluestackUIProvider config={config}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <AgentStatusScreen />
          </SafeAreaProvider>
        </GluestackUIProvider>,
      );
      await Promise.resolve();
    });

    const root = renderer!.root;
    const onCallButton = root.findByProps({ testID: 'status-option-ON_CALL' });

    await ReactTestRenderer.act(async () => {
      onCallButton.props.onPress();
      await Promise.resolve();
    });

    const activeBadge = root.findByProps({ testID: 'active-status-badge' });
    expect(activeBadge.props.children).toBe('ON CALL');

    const raw = await AsyncStorage.getItem(AGENT_STATUS_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.status).toBe('ON_CALL');
  });
});
