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
  const bottomInset = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 12 : 16);
  const tabBarHeight = 56 + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#1a1a1a',
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: bottomInset + 2,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#666666',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarHideOnKeyboard: true,
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Notes',
          tabBarIcon: ({ color, size }) => (
            <FileText size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AgentStatusTab"
        component={AgentStatusScreen}
        options={{
          tabBarLabel: 'Status',
          tabBarIcon: ({ color, size }) => (
            <UserCheck size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CallSimulatorTab"
        component={CallSimulatorScreen}
        options={{
          tabBarLabel: 'Call Sim',
          tabBarIcon: ({ color, size }) => (
            <PhoneCall size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="DeviceInfoTab"
        component={DeviceInfoScreen}
        options={{
          tabBarLabel: 'Device',
          tabBarIcon: ({ color, size }) => (
            <Smartphone size={size - 2} color={color} />
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
    marginTop: 2,
  },
  tabBarItem: {
    paddingVertical: 2,
  },
});

export default MainTabNavigator;
