// Archived placeholder of AppearanceContext moved here by agent
import React from 'react';

const placeholder: any = null;

export const AppearanceProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useAppearance = () => ({ appearance: {}, setAppearance: (_: any) => {}, resetAppearance: () => {} });
