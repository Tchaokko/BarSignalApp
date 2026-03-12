import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import SignalFeedScreen from '../screens/signals/SignalFeedScreen';
import SendSignalScreen from '../screens/signals/SendSignalScreen';
import FriendsScreen from '../screens/friends/FriendsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

export type TabParamList = {
  Feed: undefined;
  Send: undefined;
  Friends: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

function icon(emoji: string) {
  return () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#F59E0B',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { borderTopColor: '#F3F4F6' },
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={SignalFeedScreen}
        options={{ title: 'Signal Feed', tabBarIcon: icon('📡') }}
      />
      <Tab.Screen
        name="Send"
        component={SendSignalScreen}
        options={{ title: 'Send Signal', tabBarIcon: icon('🍺') }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{ tabBarIcon: icon('👥') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: icon('👤') }}
      />
    </Tab.Navigator>
  );
}
