import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { WebSocketProvider } from './src/context/WebSocketContext';
import TabNavigator from './src/navigation/TabNavigator';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';


export default function App() {
  return (
    <SafeAreaProvider>
      <WebSocketProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <TabNavigator />
        </NavigationContainer>
      </WebSocketProvider>
    </SafeAreaProvider>
  );
}
