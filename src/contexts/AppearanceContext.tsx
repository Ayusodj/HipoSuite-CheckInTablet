import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppearanceState = {
  sidebarBg: string;
  pageBg: string;
  selectedBg: string;
  selectedButtonBg?: string;
  hoverBg: string;
  textColor: string;
  textSize: string; // e.g. 'base', 'sm', 'lg', or px value
  buttonBg: string; // background color for primary buttons in the page area
  buttonTextColor: string; // text color for those buttons
};

const DEFAULTS: AppearanceState = {
  sidebarBg: '#053F3F',
  pageBg: '#F3F4F6',
  selectedBg: '#00B1A9',
  selectedButtonBg: '#00B1A9',
  hoverBg: '#0B6B6B',
  textColor: '#1F2937',
  textSize: '16px',
  buttonBg: '#3B82F6', // blue-500
  buttonTextColor: '#FFFFFF'
};

type AppearanceContextValue = {
  appearance: AppearanceState;
  setAppearance: (patch: Partial<AppearanceState>) => void;
  resetAppearance: () => void;
};

const AppearanceContext = createContext<AppearanceContextValue | undefined>(undefined);

export const AppearanceProvider: React.FC<{ children: React.ReactNode; userId?: string }> = ({ children, userId }) => {
  const storageKey = userId ? `appearance_settings_${userId}` : 'appearance_settings_default_user';
  const [appearance, setAppearanceState] = useState<AppearanceState>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return { ...DEFAULTS, ...JSON.parse(raw) } as AppearanceState;
    } catch (e) {
      // ignore
    }
    return DEFAULTS;
  });

  useEffect(() => {
    // apply CSS variables to :root
    const root = document.documentElement;
    root.style.setProperty('--app-sidebar-bg', appearance.sidebarBg);
    root.style.setProperty('--app-page-bg', appearance.pageBg);
    root.style.setProperty('--app-selected-bg', appearance.selectedBg);
    // optional separate variable used specifically for selected buttons (fallback to selectedBg if not set)
    root.style.setProperty('--app-selected-button-bg', appearance.selectedButtonBg || appearance.selectedBg);
    root.style.setProperty('--app-hover-bg', appearance.hoverBg);
    root.style.setProperty('--app-text-color', appearance.textColor);
    root.style.setProperty('--app-text-size', appearance.textSize);
  // Button colors (used for primary buttons in page area; can be scoped via CSS)
  root.style.setProperty('--app-button-bg', appearance.buttonBg);
  root.style.setProperty('--app-button-text-color', appearance.buttonTextColor);

    try {
      localStorage.setItem(storageKey, JSON.stringify(appearance));
    } catch (e) {
      // ignore
    }
  }, [appearance]);

  const setAppearance = (patch: Partial<AppearanceState>) => {
    setAppearanceState(prev => ({ ...prev, ...patch }));
  };

  const resetAppearance = () => setAppearanceState(DEFAULTS);

  return (
    <AppearanceContext.Provider value={{ appearance, setAppearance, resetAppearance }}>
      {children}
    </AppearanceContext.Provider>
  );
};

export const useAppearance = () => {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error('useAppearance must be used within AppearanceProvider');
  return ctx;
};

export default AppearanceContext;
