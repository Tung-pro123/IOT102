import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [serverIp, setServerIp] = useState('10.87.2.6');
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState({
    garbage_level: 0,
    gas: 0,
    temperature: 0,
    humidity: 0,
    is_lid_open: false
  });
  const [prediction, setPrediction] = useState('Đang thu thập dữ liệu...');
  const [peakTime, setPeakTime] = useState('Đang thu thập...');
  const [historyData, setHistoryData] = useState([]);
  const [theme, setTheme] = useState('dark'); // Mặc định là dark mode

  // Load saved IP and Theme on startup
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedIp = await AsyncStorage.getItem('SERVER_IP');
        if (savedIp) setServerIp(savedIp);
        
        const savedTheme = await AsyncStorage.getItem('THEME');
        if (savedTheme) setTheme(savedTheme);
      } catch (e) {
        console.error('Error loading settings', e);
      }
    };
    loadSettings();
  }, []);

  const changeTheme = async (newTheme) => {
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('THEME', newTheme);
    } catch (e) {
      console.error('Error saving theme', e);
    }
  };

  // Thay thế hoàn toàn WebSocket bằng HTTP Polling (Khắc phục lỗi Event.NONE trên RN)
  useEffect(() => {
    if (!serverIp) return;
    let isMounted = true;

    const pollData = async () => {
      try {
        // Gọi lên server lấy data live
        const response = await fetch(`http://${serverIp}:3001/api/live`, {
          // Timeout ngắn để tránh treo
          signal: AbortSignal.timeout ? AbortSignal.timeout(1500) : undefined
        });
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            if (data.sensor) setSensorData(data.sensor);
            if (data.prediction) {
              setPrediction(data.prediction.prediction || 'Đang thu thập dữ liệu...');
              setPeakTime(data.prediction.peak_time || 'Đang thu thập...');
              if (data.prediction.history) {
                setHistoryData(data.prediction.history);
              }
            }
            if (!isConnected) setIsConnected(true);
          }
        } else {
          if (isMounted && isConnected) setIsConnected(false);
        }
      } catch (error) {
        if (isMounted && isConnected) setIsConnected(false);
      }
    };

    pollData();
    const intervalId = setInterval(pollData, 1500);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [serverIp, isConnected]);

  // Gửi lệnh qua HTTP POST
  const sendCommand = async (cmd) => {
    try {
      await fetch(`http://${serverIp}:3001/api/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
    } catch (e) {
      console.log('Lỗi gửi lệnh:', e);
    }
  };

  return (
    <WebSocketContext.Provider value={{
      serverIp,
      setServerIp,
      isConnected,
      sensorData,
      prediction,
      peakTime,
      historyData,
      theme,
      changeTheme,
      sendCommand
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};
