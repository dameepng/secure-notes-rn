import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FileText, PhoneCall, Smartphone, UserCheck } from 'lucide-react-native';

import { MainTabParamList } from '../types/navigation';
import HomeScreen from '../screens/HomeScreen';
import AgentStatusScreen from '../screens/AgentStatusScreen';
import CallSimulatorScreen from '../screens/CallSimulatorScreen';
import DeviceInfoScreen from '../screens/DeviceInfoScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#666666',
        tabBarLabelStyle: styles.tabBarLabel,
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
  tabBar: {
    backgroundColor: '#000000',
    borderTopColor: '#1a1a1a',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 60,
    paddingBottom: Platform.OS === 'ios' ? 26 : 8,
    paddingTop: 6,
    elevation: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default MainTabNavigator;
