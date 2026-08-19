import { PermissionsAndroid, Platform } from 'react-native';
import NativeCameraLauncher from '../src/native/NativeCameraLauncher';
import {
  checkCameraPermission,
  requestCameraPermission,
  launchNativeCamera,
} from '../src/native/camera';

jest.mock('../src/native/NativeCameraLauncher', () => ({
  __esModule: true,
  default: {
    openCamera: jest.fn(),
  },
}));

describe('Camera Module (Fase 6: Runtime Permissions & Native Intent)', () => {
  const mockCameraLauncher = NativeCameraLauncher as unknown as {
    openCamera: jest.Mock;
  };
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    Platform.OS = 'android';
    jest.clearAllMocks();
  });

  afterAll(() => {
    Platform.OS = originalPlatform;
  });

  it('checks camera permission status correctly', async () => {
    jest.spyOn(PermissionsAndroid, 'check').mockResolvedValueOnce(true);
    let perm = await checkCameraPermission();
    expect(perm).toBe('GRANTED');

    jest.spyOn(PermissionsAndroid, 'check').mockResolvedValueOnce(false);
    perm = await checkCameraPermission();
    expect(perm).toBe('DENIED');
  });

  it('handles permission requests with GRANTED, DENIED, and NEVER_ASK_AGAIN', async () => {
    jest
      .spyOn(PermissionsAndroid, 'request')
      .mockResolvedValueOnce(PermissionsAndroid.RESULTS.GRANTED);
    let result = await requestCameraPermission();
    expect(result).toBe('GRANTED');

    jest
      .spyOn(PermissionsAndroid, 'request')
      .mockResolvedValueOnce(PermissionsAndroid.RESULTS.DENIED);
    result = await requestCameraPermission();
    expect(result).toBe('DENIED');

    jest
      .spyOn(PermissionsAndroid, 'request')
      .mockResolvedValueOnce(PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN);
    result = await requestCameraPermission();
    expect(result).toBe('NEVER_ASK_AGAIN');
  });

  it('launches native camera intent when permission is GRANTED', async () => {
    jest
      .spyOn(PermissionsAndroid, 'request')
      .mockResolvedValueOnce(PermissionsAndroid.RESULTS.GRANTED);
    mockCameraLauncher.openCamera.mockResolvedValueOnce(true);

    const res = await launchNativeCamera();

    expect(res.success).toBe(true);
    expect(res.permissionStatus).toBe('GRANTED');
    expect(mockCameraLauncher.openCamera).toHaveBeenCalledTimes(1);
  });

  it('returns appropriate error message when permission is DENIED', async () => {
    jest
      .spyOn(PermissionsAndroid, 'request')
      .mockResolvedValueOnce(PermissionsAndroid.RESULTS.DENIED);

    const res = await launchNativeCamera();

    expect(res.success).toBe(false);
    expect(res.permissionStatus).toBe('DENIED');
    expect(res.errorMessage).toContain('ditolak');
    expect(mockCameraLauncher.openCamera).not.toHaveBeenCalled();
  });

  it('returns settings guidance when permission is NEVER_ASK_AGAIN', async () => {
    jest
      .spyOn(PermissionsAndroid, 'request')
      .mockResolvedValueOnce(PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN);

    const res = await launchNativeCamera();

    expect(res.success).toBe(false);
    expect(res.permissionStatus).toBe('NEVER_ASK_AGAIN');
    expect(res.errorMessage).toContain('Pengaturan Aplikasi');
    expect(mockCameraLauncher.openCamera).not.toHaveBeenCalled();
  });
});
