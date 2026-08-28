import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchLiveTelemetryFeed } from '../services/api';
import { LiveTelemetryItem } from '../types';

export type ThemeMode = 'dark' | 'light';
export type FontSizeScale = 'normal' | 'large' | 'xlarge';
export type TelemetryMode = 'historical' | 'live';

interface UIContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  fontSize: FontSizeScale;
  setFontSizeScale: (size: FontSizeScale) => void;
  telemetryMode: TelemetryMode;
  setTelemetryMode: (mode: TelemetryMode) => void;
  toggleTelemetryMode: () => void;
  liveBeds: LiveTelemetryItem[];
  liveHospitalStatus: string;
  isStreaming: boolean;
  lastStreamTime: string;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  // 1. Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('hai_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  // 2. Font size scaling
  const [fontSize, setFontSize] = useState<FontSizeScale>(() => {
    const saved = localStorage.getItem('hai_font_size');
    return (saved === 'normal' || saved === 'large' || saved === 'xlarge') ? saved : 'large';
  });

  // 3. Real-Time Telemetry Mode
  const [telemetryMode, setTelemetryModeState] = useState<TelemetryMode>(() => {
    const saved = localStorage.getItem('hai_telemetry_mode');
    return saved === 'live' ? 'live' : 'historical';
  });

  const [liveBeds, setLiveBeds] = useState<LiveTelemetryItem[]>([]);
  const [liveHospitalStatus, setLiveHospitalStatus] = useState<string>('STREAMING_READY');
  const [lastStreamTime, setLastStreamTime] = useState<string>(() => new Date().toLocaleTimeString());

  // Apply theme to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('hai_theme', theme);
  }, [theme]);

  // Apply font size scaling to <html> element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-xlarge');
    root.classList.add(`font-scale-${fontSize}`);
    localStorage.setItem('hai_font_size', fontSize);
  }, [fontSize]);

  // Handle live telemetry polling when mode is 'live'
  useEffect(() => {
    localStorage.setItem('hai_telemetry_mode', telemetryMode);
    
    let interval: any = null;
    if (telemetryMode === 'live') {
      const pollFeed = async () => {
        try {
          const res = await fetchLiveTelemetryFeed();
          setLiveBeds(res.live_telemetry);
          setLiveHospitalStatus(res.hospital_status);
          setLastStreamTime(res.timestamp);
        } catch (e) {
          console.warn("Live telemetry poll fallback:", e);
        }
      };

      pollFeed();
      interval = setInterval(pollFeed, 3000); // 3-second live heartbeat
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [telemetryMode]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setThemeMode = (mode: ThemeMode) => {
    setTheme(mode);
  };

  const setFontSizeScale = (size: FontSizeScale) => {
    setFontSize(size);
  };

  const toggleTelemetryMode = () => {
    setTelemetryModeState(prev => (prev === 'historical' ? 'live' : 'historical'));
  };

  const setTelemetryMode = (mode: TelemetryMode) => {
    setTelemetryModeState(mode);
  };

  return (
    <UIContext.Provider
      value={{
        theme,
        toggleTheme,
        setThemeMode,
        fontSize,
        setFontSizeScale,
        telemetryMode,
        setTelemetryMode,
        toggleTelemetryMode,
        liveBeds,
        liveHospitalStatus,
        isStreaming: telemetryMode === 'live',
        lastStreamTime,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
