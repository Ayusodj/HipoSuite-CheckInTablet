// Neutralizado: appearance settings no son usadas en el flujo tablet minimal.
// Si se requieren, restaurar desde git.
import React from 'react';

const placeholder: any = null;

export const AppearanceProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useAppearance = () => ({ appearance: {}, setAppearance: (_: any) => {}, resetAppearance: () => {} });

// REMOVED: moved to /deprecated/removed-by-agent/AppearanceContext.tsx
export {};
