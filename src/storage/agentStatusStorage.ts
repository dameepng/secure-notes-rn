import AsyncStorage from '@react-native-async-storage/async-storage';

export type AgentStatusType = 'AVAILABLE' | 'BUSY' | 'ON_CALL';

export interface AgentStatusRecord {
  status: AgentStatusType;
  updatedAt: string;
}

export const AGENT_STATUS_STORAGE_KEY = '@secure_notes_agent_status';

/**
 * Mengambil status agent terakhir yang tersimpan di AsyncStorage
 */
export const getAgentStatus = async (): Promise<AgentStatusRecord | null> => {
  try {
    const raw = await AsyncStorage.getItem(AGENT_STATUS_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed: AgentStatusRecord = JSON.parse(raw);
    if (!parsed || !parsed.status) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.error('Failed to retrieve agent status from AsyncStorage:', error);
    return null;
  }
};

/**
 * Menyimpan status agent ke AsyncStorage dengan timestamp terbaru
 */
export const saveAgentStatus = async (
  status: AgentStatusType,
): Promise<AgentStatusRecord> => {
  const record: AgentStatusRecord = {
    status,
    updatedAt: new Date().toISOString(),
  };

  try {
    await AsyncStorage.setItem(
      AGENT_STATUS_STORAGE_KEY,
      JSON.stringify(record),
    );
    return record;
  } catch (error) {
    console.error('Failed to save agent status to AsyncStorage:', error);
    throw error;
  }
};

/**
 * Menghapus status agent dari AsyncStorage (untuk testing atau reset)
 */
export const clearAgentStatus = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AGENT_STATUS_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear agent status:', error);
  }
};
