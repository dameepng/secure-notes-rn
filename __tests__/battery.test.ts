import DeviceInfo from 'react-native-device-info';
import NativeBatteryInfo from '../src/native/NativeBatteryInfo';
import { getDeviceBatteryStatus } from '../src/native/battery';

jest.mock('../src/native/NativeBatteryInfo', () => ({
  __esModule: true,
  default: {
    getBatteryLevel: jest.fn(),
    isCharging: jest.fn(),
  },
}));

describe('Battery Module (Fase 5: TurboModule & Device Info)', () => {
  const mockBatteryTurboModule = NativeBatteryInfo as unknown as {
    getBatteryLevel: jest.Mock;
    isCharging: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches battery status via TurboModule when available', async () => {
    mockBatteryTurboModule.getBatteryLevel.mockResolvedValue(92);
    mockBatteryTurboModule.isCharging.mockResolvedValue(true);

    const result = await getDeviceBatteryStatus();

    expect(result.level).toBe(92);
    expect(result.isCharging).toBe(true);
    expect(result.source).toBe('TURBOMODULE');
    expect(mockBatteryTurboModule.getBatteryLevel).toHaveBeenCalled();
  });

  it('falls back to DeviceInfo when TurboModule is rejected or throws', async () => {
    mockBatteryTurboModule.getBatteryLevel.mockRejectedValue(
      new Error('TurboModule error'),
    );

    (DeviceInfo.getBatteryLevel as jest.Mock).mockResolvedValueOnce(0.75);
    (DeviceInfo.isBatteryCharging as jest.Mock).mockResolvedValueOnce(false);

    const result = await getDeviceBatteryStatus();

    expect(result.level).toBe(75);
    expect(result.isCharging).toBe(false);
    expect(result.source).toBe('DEVICE_INFO');
  });

  it('handles negative / unavailable values gracefully', async () => {
    mockBatteryTurboModule.getBatteryLevel.mockRejectedValue(
      new Error('Module not linked'),
    );
    (DeviceInfo.getBatteryLevel as jest.Mock).mockResolvedValueOnce(-1);
    (DeviceInfo.isBatteryCharging as jest.Mock).mockResolvedValueOnce(false);

    const result = await getDeviceBatteryStatus();

    expect(result.level).toBe(-1);
    expect(result.source).toBe('UNAVAILABLE');
  });
});
