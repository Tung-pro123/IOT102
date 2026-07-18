import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { WebSocketContext } from '../context/WebSocketContext';

import DashboardScreen from '../screens/DashboardScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import NotificationScreen from '../screens/NotificationScreen';
import GuideScreen from '../screens/GuideScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { theme } = useContext(WebSocketContext);
  const isDark = theme === 'dark';

  return (
    <Tab.Navigator
      detachInactiveScreens={false}
      screenOptions={({ route }) => ({
        freezeOnBlur: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'apps' : 'apps-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Guide') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#38BDF8' : '#4F46E5',
        tabBarInactiveTintColor: isDark ? '#475569' : '#94A3B8',
        tabBarStyle: {
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          borderTopColor: isDark ? '#1E293B' : '#E2E8F0',
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
          height: 82,
          paddingBottom: 22,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold'
        }
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'EcoPulse' }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{ title: 'AI Phân tích' }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationScreen} 
        options={{ title: 'Nhật ký' }}
      />
      <Tab.Screen 
        name="Guide" 
        component={GuideScreen} 
        options={{ title: 'Hướng dẫn' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Cài đặt' }}
      />
    </Tab.Navigator>
  );
}
