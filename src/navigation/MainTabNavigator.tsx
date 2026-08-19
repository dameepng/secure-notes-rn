import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FileText, PhoneCall, Smartphone, UserCheck } from 'lucide-react-native';

import { MainTabParamList } from '../types/navigation';
import HomeScreen from '../screens/HomeScreen';
import AgentStatusScreen from '../screens/AgentStatusScreen';
import CallSimulatorScreen from '../screens/CallSimulatorScreen';
import DeviceInfoScreen from '../screens/DeviceInfoScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  // Standar safe area bottom padding (Material 3 & Apple HIG 2026 best practice):
  // Menjamin ada jarak aman minimal di atas gesture navigation handle Android & home indicator iOS
  const bottomInset = Math.max(
    insets.bottom,
    Platform.select({ ios: 28, android: 32, default: 32 }),
  );
  const tabBarHeight = 60 + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#050505',
          borderTopColor: '#1a1a1a',
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: bottomInset,
          elevation: 8,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#666666',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarHideOnKeyboard: true,
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Notes',
          tabBarIcon: ({ color, size }) => (
            <FileText size={22} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tab.Screen
        name="AgentStatusTab"
        component={AgentStatusScreen}
        options={{
          tabBarLabel: 'Status',
          tabBarIcon: ({ color, size }) => (
            <UserCheck size={22} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tab.Screen
        name="CallSimulatorTab"
        component={CallSimulatorScreen}
        options={{
          tabBarLabel: 'Call Sim',
          tabBarIcon: ({ color, size }) => (
            <PhoneCall size={22} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tab.Screen
        name="DeviceInfoTab"
        component={DeviceInfoScreen}
        options={{
          tabBarLabel: 'Device',
          tabBarIcon: ({ color, size }) => (
            <Smartphone size={22} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  tabBarIcon: {
    marginTop: 2,
  },
});

export default MainTabNavigator;
