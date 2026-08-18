import { checkDeviceSecurityStatus } from '../src/native';
import NativeSecurityChecker from '../src/native/NativeSecurityChecker';

jest.mock('../src/native/NativeSecurityChecker', () => ({
  __esModule: true,
  default: {
    isDeviceSecure: jest.fn(),
    getSecurityLevel: jest.fn(),
    hasHardwareKeystore: jest.fn(),
  },
}));

describe('NativeSecurityChecker Custom TurboModule (JSI)', () => {
  const mockTurboModule = NativeSecurityChecker as unknown as {
    isDeviceSecure: jest.Mock;
    getSecurityLevel: jest.Mock;
    hasHardwareKeystore: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve high security status via JSI synchronous and asynchronous methods', async () => {
    mockTurboModule.getSecurityLevel.mockReturnValue('HIGH');
    mockTurboModule.isDeviceSecure.mockResolvedValue(true);
    mockTurboModule.hasHardwareKeystore.mockResolvedValue(true);

    const result = await checkDeviceSecurityStatus();

    expect(result.isTurboModuleActive).toBe(true);
    expect(result.securityLevel).toBe('HIGH');
    expect(result.isDeviceSecure).toBe(true);
    expect(result.hasHardwareKeystore).toBe(true);
    expect(mockTurboModule.getSecurityLevel).toHaveBeenCalledTimes(1);
    expect(mockTurboModule.isDeviceSecure).toHaveBeenCalledTimes(1);
    expect(mockTurboModule.hasHardwareKeystore).toHaveBeenCalledTimes(1);
  });

  it('should resolve medium security status when device has lock but software keystore', async () => {
    mockTurboModule.getSecurityLevel.mockReturnValue('MEDIUM');
    mockTurboModule.isDeviceSecure.mockResolvedValue(true);
    mockTurboModule.hasHardwareKeystore.mockResolvedValue(false);

    const result = await checkDeviceSecurityStatus();

    expect(result.isTurboModuleActive).toBe(true);
    expect(result.securityLevel).toBe('MEDIUM');
    expect(result.isDeviceSecure).toBe(true);
    expect(result.hasHardwareKeystore).toBe(false);
  });

  it('should gracefully handle unexpected errors from native calls', async () => {
    mockTurboModule.getSecurityLevel.mockImplementation(() => {
      throw new Error('JSI native crash');
    });

    const result = await checkDeviceSecurityStatus();

    expect(result.isTurboModuleActive).toBe(true);
    expect(result.securityLevel).toBe('LOW');
    expect(result.isDeviceSecure).toBe(false);
    expect(result.hasHardwareKeystore).toBe(false);
  });
});
