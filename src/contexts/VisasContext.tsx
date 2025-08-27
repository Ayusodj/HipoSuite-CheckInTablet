import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { VisasTpvListConfig, VisasFormData, TpvDefinition } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface VisasState {
    config: VisasTpvListConfig;
    data: VisasFormData;
}

const LOCAL_USERNAME = 'default_user';

const DEFAULT_VISAS_TPV_CONFIG: VisasTpvListConfig = {
  baresTpvs: [
    { id: uuidv4(), label: 'B.Sa 214' },
    { id: uuidv4(), label: 'B.Pi 596' },
    { id: uuidv4(), label: 'Rest. 602' },
  ],
  recepcionTpvs: [
    { id: uuidv4(), label: 'Rec. 323' },
    { id: uuidv4(), label: 'Rec. 324' },
  ],
};

const getDefaultVisasState = (config: VisasTpvListConfig = DEFAULT_VISAS_TPV_CONFIG): VisasState => {
  const initialTpvValues: { [tpvId: string]: number | null } = {};
  config.baresTpvs.forEach(tpv => initialTpvValues[tpv.id] = null);
  config.recepcionTpvs.forEach(tpv => initialTpvValues[tpv.id] = null);
  
  return {
      config,
      data: {
        date: new Date().toLocaleDateString('fr-CA'),
        tpvValues: initialTpvValues,
        visas: null,
        amex: null,
      }
  };
};

interface VisasContextType {
  config: VisasTpvListConfig;
  data: VisasFormData;
  updateConfig: (newConfig: VisasTpvListConfig) => void;
  updateDate: (date: string) => void;
  updateTpvValue: (tpvId: string, value: number | null) => void;
  updateVisas: (value: number | null) => void;
  updateAmex: (value: number | null) => void;
  addTpvItem: (section: keyof Pick<VisasTpvListConfig, 'baresTpvs' | 'recepcionTpvs'>, label?: string) => void;
  removeTpvItem: (section: keyof Pick<VisasTpvListConfig, 'baresTpvs' | 'recepcionTpvs'>, tpvId: string) => void;
  updateTpvItemLabel: (section: keyof Pick<VisasTpvListConfig, 'baresTpvs' | 'recepcionTpvs'>, tpvId: string, newLabel: string) => void;
  isLoading: boolean;
}

const VisasContext = createContext<VisasContextType | undefined>(undefined);

export const VisasProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<VisasState>(getDefaultVisasState());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
        setIsLoading(true);
        try {
            const key = `visasState_${LOCAL_USERNAME}`;
            const savedStateStr = localStorage.getItem(key);
            if (savedStateStr) {
                const loadedState = JSON.parse(savedStateStr);
                
                // Sync data with current config to prevent mismatches
                const currentTpvIds = new Set([...loadedState.config.baresTpvs.map((t: TpvDefinition) => t.id), ...loadedState.config.recepcionTpvs.map((t: TpvDefinition) => t.id)]);
                const syncedTpvValues: { [tpvId: string]: number | null } = {};
                currentTpvIds.forEach(id => {
                    syncedTpvValues[id] = loadedState.data.tpvValues?.[id] ?? null;
                });
                loadedState.data.tpvValues = syncedTpvValues;

                setState(loadedState);
            } else {
                setState(getDefaultVisasState());
            }
        } catch (e) {
            console.error("Failed to load visas state from localStorage", e);
            setState(getDefaultVisasState());
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
        try {
            const key = `visasState_${LOCAL_USERNAME}`;
            localStorage.setItem(key, JSON.stringify(state));
        } catch(e) {
            console.error("Failed to save visas state to localStorage", e);
        }
    }
  }, [state, isLoading]);

  const updateConfig = useCallback((newConfig: VisasTpvListConfig) => {
    setState(prevState => {
        const newTpvValues: { [tpvId: string]: number | null } = {};
        newConfig.baresTpvs.forEach(tpv => newTpvValues[tpv.id] = prevState.data.tpvValues[tpv.id] ?? null);
        newConfig.recepcionTpvs.forEach(tpv => newTpvValues[tpv.id] = prevState.data.tpvValues[tpv.id] ?? null);
        return { 
            ...prevState,
            config: newConfig,
            data: { ...prevState.data, tpvValues: newTpvValues }
        };
    });
  }, []);

  const updateDate = useCallback((date: string) => setState(prev => ({ ...prev, data: {...prev.data, date} })), []);
  const updateTpvValue = useCallback((tpvId: string, value: number | null) => {
    setState(prev => ({ ...prev, data: { ...prev.data, tpvValues: { ...prev.data.tpvValues, [tpvId]: value } } }));
  }, []);
  const updateVisas = useCallback((value: number | null) => setState(prev => ({ ...prev, data: {...prev.data, visas: value } })), []);
  const updateAmex = useCallback((value: number | null) => setState(prev => ({ ...prev, data: {...prev.data, amex: value } })), []);

  const addTpvItem = useCallback((section: keyof Pick<VisasTpvListConfig, 'baresTpvs' | 'recepcionTpvs'>, label: string = "Nuevo TPV") => {
    const newItem: TpvDefinition = { id: uuidv4(), label };
    setState(prev => {
      const newConfig = { ...prev.config, [section]: [...prev.config[section], newItem] };
      const newData = { ...prev.data, tpvValues: { ...prev.data.tpvValues, [newItem.id]: null } };
      return { config: newConfig, data: newData };
    });
  }, []);
  
  const removeTpvItem = useCallback((section: keyof Pick<VisasTpvListConfig, 'baresTpvs' | 'recepcionTpvs'>, tpvId: string) => {
    setState(prev => {
        const newConfig = { ...prev.config, [section]: prev.config[section].filter(item => item.id !== tpvId) };
        const newTpvValues = {...prev.data.tpvValues};
        delete newTpvValues[tpvId];
        const newData = {...prev.data, tpvValues: newTpvValues};
        return { config: newConfig, data: newData };
    });
  }, []);

  const updateTpvItemLabel = useCallback((section: keyof Pick<VisasTpvListConfig, 'baresTpvs' | 'recepcionTpvs'>, tpvId: string, newLabel: string) => {
    setState(prev => {
        const newConfig = { ...prev.config, [section]: prev.config[section].map(item => item.id === tpvId ? { ...item, label: newLabel } : item) };
        return { ...prev, config: newConfig };
    });
  }, []);


  return (
    <VisasContext.Provider value={{
      config: state.config, data: state.data, updateConfig,
      updateDate, updateTpvValue, updateVisas, updateAmex,
      addTpvItem, removeTpvItem, updateTpvItemLabel,
      isLoading
    }}>
      {children}
    </VisasContext.Provider>
  );
};

export const useVisas = (): VisasContextType => {
  const context = useContext(VisasContext);
  if (!context) {
    throw new Error('useVisas must be used within a VisasProvider');
  }
  return context;
};