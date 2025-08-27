import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DiarioState, DiarioDayData } from '../types';

interface DiarioContextType extends DiarioState {
  getTodaysData: (date: string) => DiarioDayData;
  updateCell: (date: string, section: keyof Omit<DiarioDayData, 'stats' | 'images'>, index: number, field: string, value: string | number) => void;
  updateStatsCell: (date: string, field: keyof DiarioDayData['stats'], value: string) => void;
  toggleSectionVisibility: (section: keyof DiarioState['sectionVisibility']) => void;
  addImage: (date: string, imageDataUrl: string) => void;
  deleteImage: (date: string, imageId: string) => void;
  isLoading: boolean;
}

const DiarioContext = createContext<DiarioContextType | undefined>(undefined);
const LOCAL_USERNAME = 'default_user';

const createEmptyDay = (): DiarioDayData => ({
    stats: { ocupPct: '', ocupPax: '', ocupHabs: '', entradas: '', salidas: '' },
    events: [{ id: uuidv4(), group: '', when: '', where: '', what: '' }],
    birthdays: [{ id: uuidv4(), extra1: '', name: '', room: '', extra2: '' }],
    roomChanges: [{ id: uuidv4(), name: '', from: '', to: '', reason: '', status: 'Pendiente' }],
    dailyInfo: [{ id: uuidv4(), content: '<p><font size="3"><br></font></p>' }],
    tasks: [{ id: uuidv4(), priority: 1, task: '<p><font size="3"><br></font></p>', notifier: '', status: 'Pendiente' }],
    images: [],
});

const defaultDiarioState: DiarioState = {
    data: {},
    sectionVisibility: { stats: true, events: true, birthdays: true, roomChanges: true, dailyInfo: true, tasks: true, images: true },
};

export const DiarioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DiarioState>(defaultDiarioState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
        setIsLoading(true);
        try {
            const key = `diario_${LOCAL_USERNAME}`;
            const savedStateStr = localStorage.getItem(key);
            setState(savedStateStr ? JSON.parse(savedStateStr) : defaultDiarioState);
        } catch (e) {
            console.error("Failed to load diario data from localStorage", e);
            setState(defaultDiarioState);
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
        try {
            const key = `diario_${LOCAL_USERNAME}`;
            localStorage.setItem(key, JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save diario data to localStorage", e);
        }
    }
  }, [state, isLoading]);

  const getTodaysData = useCallback((date: string): DiarioDayData => {
    return state.data[date] || createEmptyDay();
  }, [state.data]);
  
  const updateStatsCell = useCallback((date: string, field: keyof DiarioDayData['stats'], value: string) => {
    setState(prevState => {
        const dayData = prevState.data[date] || createEmptyDay();
        const newDayData = {
            ...dayData,
            stats: { ...dayData.stats, [field]: value }
        };
        return {
            ...prevState,
            data: { ...prevState.data, [date]: newDayData }
        };
    });
  }, []);

  const updateCell = useCallback((date: string, section: keyof Omit<DiarioDayData, 'stats' | 'images'>, index: number, field: string, value: string | number) => {
    setState(prevState => {
      const dayData = prevState.data[date] || createEmptyDay();
      const newDayData = JSON.parse(JSON.stringify(dayData)); 

      if (Array.isArray(newDayData[section])) {
        if (newDayData[section][index]) {
          (newDayData[section][index] as any)[field] = value;
        }

        const isLastRow = index === newDayData[section].length - 1;
        const rowData = newDayData[section][index];
        const rowHasContent = Object.entries(rowData).some(([key, val]) => {
            if (key === 'id' || (key === 'status' && val === 'Pendiente') || (key === 'priority' && val === 1)) return false;
            const content = typeof val === 'string' ? val.trim() : val;
            return content !== '' && content !== '<p><br></p>' && content !== '<p><font size="3"><br></font></p>' && content !== null;
        });

        if (isLastRow && rowHasContent) {
            switch(section) {
                case 'events':
                    newDayData.events.push({ id: uuidv4(), group: '', when: '', where: '', what: '' });
                    break;
                case 'birthdays':
                    newDayData.birthdays.push({ id: uuidv4(), extra1: '', name: '', room: '', extra2: '' });
                    break;
                case 'roomChanges':
                    newDayData.roomChanges.push({ id: uuidv4(), name: '', from: '', to: '', reason: '', status: 'Pendiente' });
                    break;
                case 'tasks':
                    newDayData.tasks.push({ id: uuidv4(), priority: 1, task: '<p><font size="3"><br></font></p>', notifier: '', status: 'Pendiente' });
                    break;
                case 'dailyInfo':
                    newDayData.dailyInfo.push({ id: uuidv4(), content: '<p><font size="3"><br></font></p>' });
                    break;
            }
        }

        if (section === 'tasks') {
            const contentTasks = newDayData.tasks.filter((t: any) => (t.task && t.task.replace(/<[^>]*>?/gm, '').trim()) || (t.notifier && t.notifier.trim()));
            const emptyTasks = newDayData.tasks.filter((t: any) => !(t.task && t.task.replace(/<[^>]*>?/gm, '').trim()) && !(t.notifier && t.notifier.trim()));
            const activeContentTasks = contentTasks.filter((t: any) => t.status !== 'OK');
            const completedContentTasks = contentTasks.filter((t: any) => t.status === 'OK');
            activeContentTasks.sort((a: any, b: any) => (b.priority || 1) - (a.priority || 1));
            newDayData.tasks = [...activeContentTasks, ...completedContentTasks, ...emptyTasks];
        }

        if (section === 'roomChanges') {
            const contentChanges = newDayData.roomChanges.filter((rc: any) => rc.name || rc.from || rc.to || rc.reason);
            const emptyChanges = newDayData.roomChanges.filter((rc: any) => !rc.name && !rc.from && !rc.to && !rc.reason);
            const activeChanges = contentChanges.filter((rc: any) => rc.status !== 'OK');
            const completedChanges = contentChanges.filter((rc: any) => rc.status === 'OK');
            newDayData.roomChanges = [...activeChanges, ...completedChanges, ...emptyChanges];
        }
      }

      return { ...prevState, data: { ...prevState.data, [date]: newDayData } };
    });
  }, []);

  const toggleSectionVisibility = useCallback((section: keyof DiarioState['sectionVisibility']) => {
    setState(prevState => ({
      ...prevState,
      sectionVisibility: {
        ...prevState.sectionVisibility,
        [section]: !prevState.sectionVisibility[section]
      }
    }));
  }, []);

  const addImage = useCallback((date: string, imageDataUrl: string) => {
    setState(prevState => {
        const dayData = prevState.data[date] || createEmptyDay();
        const newImage = { id: uuidv4(), src: imageDataUrl };
        const newImages = [...dayData.images, newImage];
        const newDayData = { ...dayData, images: newImages };
        return { ...prevState, data: { ...prevState.data, [date]: newDayData } };
    });
  }, []);

  const deleteImage = useCallback((date: string, imageId: string) => {
    setState(prevState => {
        const dayData = prevState.data[date] || createEmptyDay();
        const newImages = dayData.images.filter(img => img.id !== imageId);
        const newDayData = { ...dayData, images: newImages };
        return { ...prevState, data: { ...prevState.data, [date]: newDayData } };
    });
  }, []);


  return (
    <DiarioContext.Provider value={{
      ...state,
      getTodaysData,
      updateCell,
      updateStatsCell,
      toggleSectionVisibility,
      addImage,
      deleteImage,
      isLoading
    }}>
      {children}
    </DiarioContext.Provider>
  );
};

export const useDiario = (): DiarioContextType => {
  const context = useContext(DiarioContext);
  if (!context) {
    throw new Error('useDiario must be used within a DiarioProvider');
  }
  return context;
};