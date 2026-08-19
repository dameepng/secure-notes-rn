import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAgentStatus,
  saveAgentStatus,
  clearAgentStatus,
  AGENT_STATUS_STORAGE_KEY,
} from '../src/storage/agentStatusStorage';

describe('agentStatusStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('returns null when no agent status is saved in storage', async () => {
    const status = await getAgentStatus();
    expect(status).toBeNull();
  });

  it('saves agent status and updatedAt timestamp to AsyncStorage', async () => {
    const saved = await saveAgentStatus('BUSY');
    expect(saved.status).toBe('BUSY');
    expect(saved.updatedAt).toBeTruthy();

    const storedRaw = await AsyncStorage.getItem(AGENT_STATUS_STORAGE_KEY);
    expect(storedRaw).not.toBeNull();
    const parsed = JSON.parse(storedRaw!);
    expect(parsed.status).toBe('BUSY');
  });

  it('retrieves saved agent status correctly', async () => {
    await saveAgentStatus('ON_CALL');
    const retrieved = await getAgentStatus();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.status).toBe('ON_CALL');
  });

  it('clears saved agent status from AsyncStorage', async () => {
    await saveAgentStatus('AVAILABLE');
    await clearAgentStatus();
    const retrieved = await getAgentStatus();
    expect(retrieved).toBeNull();
  });
});
