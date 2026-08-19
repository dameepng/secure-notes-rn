import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

import CallSimulatorScreen, {
  formatCallDuration,
} from '../src/screens/CallSimulatorScreen';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe('formatCallDuration helper', () => {
  it('formats seconds into mm:ss format properly', () => {
    expect(formatCallDuration(0)).toBe('00:00');
    expect(formatCallDuration(9)).toBe('00:09');
    expect(formatCallDuration(65)).toBe('01:05');
    expect(formatCallDuration(600)).toBe('10:00');
  });
});

describe('CallSimulatorScreen (Fase 4: State Machine & Timers)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    ReactTestRenderer.act(() => {
      jest.clearAllTimers();
    });
    jest.useRealTimers();
  });

  it('renders in IDLE state with disabled action buttons', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <GluestackUIProvider config={config}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <CallSimulatorScreen />
          </SafeAreaProvider>
        </GluestackUIProvider>,
      );
    });

    const root = renderer!.root;
    const badge = root.findByProps({ testID: 'call-state-badge' });
    expect(badge.props.children).toBe('IDLE');

    const btnStart = root.findByProps({ testID: 'btn-start-call' });
    const btnEnd = root.findByProps({ testID: 'btn-end-call' });
    const btnFailure = root.findByProps({ testID: 'btn-simulate-failure' });
    const btnRetry = root.findByProps({ testID: 'btn-retry' });

    expect(btnStart.props.isDisabled).toBe(false);
    expect(btnEnd.props.isDisabled).toBe(true);
    expect(btnFailure.props.isDisabled).toBe(true);
    expect(btnRetry.props.isDisabled).toBe(true);
  });

  it('transitions from IDLE -> CONNECTING -> RINGING -> CONNECTED with timers', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <GluestackUIProvider config={config}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <CallSimulatorScreen />
          </SafeAreaProvider>
        </GluestackUIProvider>,
      );
    });

    const root = renderer!.root;
    const btnStart = root.findByProps({ testID: 'btn-start-call' });

    // Step 1: Start call -> CONNECTING
    ReactTestRenderer.act(() => {
      btnStart.props.onPress();
    });
    expect(root.findByProps({ testID: 'call-state-badge' }).props.children).toBe(
      'CONNECTING',
    );

    // Step 2: Advance 2s -> RINGING
    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(root.findByProps({ testID: 'call-state-badge' }).props.children).toBe(
      'RINGING',
    );

    // Step 3: Advance 2s -> CONNECTED
    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(root.findByProps({ testID: 'call-state-badge' }).props.children).toBe(
      'CONNECTED',
    );

    // Step 4: Advance 5s in CONNECTED state -> timer increments
    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(
      root.findByProps({ testID: 'call-duration-text' }).props.children,
    ).toBe('00:05');
  });

  it('handles End Call during connected call and auto-returns to IDLE', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <GluestackUIProvider config={config}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <CallSimulatorScreen />
          </SafeAreaProvider>
        </GluestackUIProvider>,
      );
    });

    const root = renderer!.root;
    ReactTestRenderer.act(() => {
      root.findByProps({ testID: 'btn-start-call' }).props.onPress();
      jest.advanceTimersByTime(4000); // Now CONNECTED
    });

    // End Call
    const btnEnd = root.findByProps({ testID: 'btn-end-call' });
    ReactTestRenderer.act(() => {
      btnEnd.props.onPress();
    });
    expect(root.findByProps({ testID: 'call-state-badge' }).props.children).toBe(
      'ENDED',
    );

    // Auto-transition to IDLE after 1500ms
    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(root.findByProps({ testID: 'call-state-badge' }).props.children).toBe(
      'IDLE',
    );
  });

  it('handles Simulate Failure and Retry action flow', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <GluestackUIProvider config={config}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <CallSimulatorScreen />
          </SafeAreaProvider>
        </GluestackUIProvider>,
      );
    });

    const root = renderer!.root;
    ReactTestRenderer.act(() => {
      root.findByProps({ testID: 'btn-start-call' }).props.onPress();
      jest.advanceTimersByTime(1000); // In CONNECTING state
    });

    // Simulate Failure
    ReactTestRenderer.act(() => {
      root.findByProps({ testID: 'btn-simulate-failure' }).props.onPress();
    });
    expect(root.findByProps({ testID: 'call-state-badge' }).props.children).toBe(
      'FAILED',
    );

    const btnRetry = root.findByProps({ testID: 'btn-retry' });
    expect(btnRetry.props.isDisabled).toBe(false);

    // Tap Retry -> returns to CONNECTING
    ReactTestRenderer.act(() => {
      btnRetry.props.onPress();
    });
    expect(root.findByProps({ testID: 'call-state-badge' }).props.children).toBe(
      'CONNECTING',
    );
  });

  it('cleans up active timers on unmount without throwing errors', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <GluestackUIProvider config={config}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <CallSimulatorScreen />
          </SafeAreaProvider>
        </GluestackUIProvider>,
      );
    });

    const root = renderer!.root;
    ReactTestRenderer.act(() => {
      root.findByProps({ testID: 'btn-start-call' }).props.onPress();
    });

    // Unmount while connecting timer is running
    expect(() => {
      ReactTestRenderer.act(() => {
        renderer!.unmount();
      });
    }).not.toThrow();
  });
});
