import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type MainTabParamList = {
  HomeTab: undefined;
  AgentStatusTab: undefined;
  CallSimulatorTab: undefined;
  DeviceInfoTab: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
};

export type LoginScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Login'
>;

export type MainScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Main'
>;

export type HomeTabScreenProps = BottomTabScreenProps<
  MainTabParamList,
  'HomeTab'
>;

export type AgentStatusTabScreenProps = BottomTabScreenProps<
  MainTabParamList,
  'AgentStatusTab'
>;

export type CallSimulatorTabScreenProps = BottomTabScreenProps<
  MainTabParamList,
  'CallSimulatorTab'
>;

export type DeviceInfoTabScreenProps = BottomTabScreenProps<
  MainTabParamList,
  'DeviceInfoTab'
>;
