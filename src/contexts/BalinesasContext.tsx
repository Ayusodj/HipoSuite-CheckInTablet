import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { ReservationData } from '../types';

interface BalinesasContextType {
  reservations: ReservationData;
  setMultipleReservations: (keys: string[], roomNumber: string) => void;
  clearMultipleReservations: (keys: string[]) => void;
  isLoading: boolean;
  undo: () => void;
  canUndo: boolean;
}

const BalinesasContext = createContext<BalinesasContextType | undefined>(undefined);
const LOCAL_USERNAME = 'default_user';

export const BalinesasProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reservationsHistory, setReservationsHistory] = useState<ReservationData[]>([{}]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
        setIsLoading(true);
        try {
            const key = `balinesasHistory_${LOCAL_USERNAME}`;
            const loadedHistoryStr = localStorage.getItem(key);
            if (loadedHistoryStr) {
                const loadedHistory = JSON.parse(loadedHistoryStr);
                if (Array.isArray(loadedHistory) && loadedHistory.length > 0) {
                    setReservationsHistory(loadedHistory);
                } else {
                    setReservationsHistory([{}]);
                }
            } else {
                setReservationsHistory([{}]);
            }
        } catch (e) {
            console.error("Failed to load balinesas history from localStorage", e);
            setReservationsHistory([{}]);
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
        try {
            const key = `balinesasHistory_${LOCAL_USERNAME}`;
            localStorage.setItem(key, JSON.stringify(reservationsHistory));
        } catch(e) {
            console.error("Failed to save balinesas history to localStorage", e);
        }
    }
  }, [reservationsHistory, isLoading]);

  const pushNewState = useCallback((newReservations: ReservationData) => {
    setReservationsHistory(prev => [...prev, newReservations]);
  }, []);

  const setMultipleReservations = useCallback((keys: string[], roomNumber: string) => {
    const currentReservations = reservationsHistory[reservationsHistory.length - 1];
    const newReservations = { ...currentReservations };
    keys.forEach(key => {
      newReservations[key] = { roomNumber };
    });
    pushNewState(newReservations);
  }, [reservationsHistory, pushNewState]);

  const clearMultipleReservations = useCallback((keys: string[]) => {
    const currentReservations = reservationsHistory[reservationsHistory.length - 1];
    const newReservations = { ...currentReservations };
    keys.forEach(key => {
      delete newReservations[key];
    });
    pushNewState(newReservations);
  }, [reservationsHistory, pushNewState]);

  const undo = useCallback(() => {
    setReservationsHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);
  
  const reservations = reservationsHistory[reservationsHistory.length - 1] || {};

  return (
    <BalinesasContext.Provider value={{
        reservations,
        setMultipleReservations,
        clearMultipleReservations,
        isLoading,
        undo,
        canUndo: reservationsHistory.length > 1,
    }}>
      {children}
    </BalinesasContext.Provider>
  );
};

export const useBalinesas = (): BalinesasContextType => {
  const context = useContext(BalinesasContext);
  if (!context) {
    throw new Error('useBalinesas must be used within a BalinesasProvider');
  }
  return context;
};