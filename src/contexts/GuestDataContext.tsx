import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { GuestData } from '../types';
import { INITIAL_GUESTS } from '../constants'; 
import { v4 as uuidv4 } from 'uuid';

interface GuestDataContextType {
  guests: GuestData[];
  addGuest: (guest: Omit<GuestData, 'id'>) => void;
  addGuestsBatch: (newGuests: Omit<GuestData, 'id'>[]) => void;
  updateGuest: (updatedGuest: GuestData) => void;
  deleteGuest: (guestId: string) => void;
  clearGuests: () => void;
}

const GuestDataContext = createContext<GuestDataContextType | undefined>(undefined);
const LOCAL_USERNAME = 'default_user';

export const GuestDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [guests, setGuests] = useState<GuestData[]>(INITIAL_GUESTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
        setIsLoading(true);
        try {
            const key = `guests_${LOCAL_USERNAME}`;
            const savedGuests = localStorage.getItem(key);
            setGuests(savedGuests ? JSON.parse(savedGuests) : INITIAL_GUESTS);
        } catch (e) {
            console.error("Failed to load guests from localStorage", e);
            setGuests(INITIAL_GUESTS);
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
        try {
            const key = `guests_${LOCAL_USERNAME}`;
            localStorage.setItem(key, JSON.stringify(guests));
        } catch (e) {
            console.error("Failed to save guests to localStorage", e);
        }
    }
  }, [guests, isLoading]);

  const addGuest = (guestData: Omit<GuestData, 'id'>) => {
    const { roomNumber, guestName, mealPlanRegime, ...otherProps } = guestData;
    const newGuest: GuestData = { 
      id: uuidv4(),
      roomNumber,
      guestName,
      mealPlanRegime,
      ...otherProps
    };
    setGuests(prevGuests => [...prevGuests, newGuest]);
  };

  const addGuestsBatch = (newGuestsData: Omit<GuestData, 'id'>[]) => {
    const newGuestsWithIds: GuestData[] = newGuestsData.map((gInput): GuestData => {
      const { roomNumber, guestName, mealPlanRegime, ...otherProps } = gInput;
      return {
        id: uuidv4(),
        roomNumber,
        guestName,
        mealPlanRegime,
        ...otherProps
      };
    });
    setGuests(prevGuests => [...prevGuests, ...newGuestsWithIds]);
  };

  const updateGuest = (updatedGuest: GuestData) => {
    setGuests(prevGuests =>
      prevGuests.map(g => (g.id === updatedGuest.id ? updatedGuest : g))
    );
  };

  const deleteGuest = (guestId: string) => {
    setGuests(prevGuests => prevGuests.filter(g => g.id !== guestId));
  };
  
  const clearGuests = () => {
    setGuests([]);
  }

  return (
    <GuestDataContext.Provider value={{ guests, addGuest, addGuestsBatch, updateGuest, deleteGuest, clearGuests }}>
      {children}
    </GuestDataContext.Provider>
  );
};

export const useGuestData = (): GuestDataContextType => {
  const context = useContext(GuestDataContext);
  if (!context) {
    throw new Error('useGuestData must be used within a GuestDataProvider');
  }
  return context;
};