import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { 
  EfectivosDepartmentConfig, 
  EfectivosDepartmentDataInput, 
  EfectivosColorTheme,
  EfectivosPageData
} from '../types'; 
import { v4 as uuidv4 } from 'uuid';

export const EFECTIVOS_COLOR_THEMES: EfectivosColorTheme[] = [
  { name: 'Green', departmentCellClass: 'bg-green-200 border-green-400 text-green-800', dataCellClass: 'bg-green-50', departmentCellHex: '#bbf7d0', dataCellHex: '#f0fdf4' },
  { name: 'Yellow', departmentCellClass: 'bg-yellow-200 border-yellow-400 text-yellow-800', dataCellClass: 'bg-yellow-50', departmentCellHex: '#fef08a', dataCellHex: '#fefce8' },
  { name: 'Orange', departmentCellClass: 'bg-orange-200 border-orange-400 text-orange-800', dataCellClass: 'bg-orange-50', departmentCellHex: '#fed7aa', dataCellHex: '#fff7ed' },
  { name: 'Blue', departmentCellClass: 'bg-blue-200 border-blue-400 text-blue-800', dataCellClass: 'bg-blue-50', departmentCellHex: '#bfdbfe', dataCellHex: '#eff6ff' },
  { name: 'Purple', departmentCellClass: 'bg-purple-200 border-purple-400 text-purple-800', dataCellClass: 'bg-purple-50', departmentCellHex: '#e9d5ff', dataCellHex: '#faf5ff' },
  { name: 'Pink', departmentCellClass: 'bg-pink-200 border-pink-400 text-pink-800', dataCellClass: 'bg-pink-50', departmentCellHex: '#fbcfe8', dataCellHex: '#fdf2f8' },
  { name: 'Gray', departmentCellClass: 'bg-gray-200 border-gray-400 text-gray-800', dataCellClass: 'bg-gray-50', departmentCellHex: '#e5e7eb', dataCellHex: '#f9fafb' },
];

interface EfectivosState {
    departmentsConfig: EfectivosDepartmentConfig[];
    pageData: EfectivosPageData;
}

const LOCAL_USERNAME = 'default_user';

const DEFAULT_EFECTIVOS_DEPARTMENTS_CONFIG: EfectivosDepartmentConfig[] = [
  { id: uuidv4(), name: 'CAJA PRINCIPAL', colorThemeName: 'Green' },
  { id: uuidv4(), name: 'CAJA BARES', colorThemeName: 'Yellow' },
  { id: uuidv4(), name: 'CAJA EVENTOS', colorThemeName: 'Orange' },
];

const getDefaultEfectivosState = (configs: EfectivosDepartmentConfig[] = DEFAULT_EFECTIVOS_DEPARTMENTS_CONFIG): EfectivosState => {
  const departmentValues: Record<string, EfectivosDepartmentDataInput> = {};
  configs.forEach(dept => {
    departmentValues[dept.id] = { arqueo: null, faltante: null, recaudacionPlus: null, recaudacionMinus: null };
  });
  return {
      departmentsConfig: configs,
      pageData: { date: new Date().toLocaleDateString('fr-CA'), departmentValues }
  };
};

interface EfectivosContextType {
  departmentsConfig: EfectivosDepartmentConfig[];
  pageData: EfectivosPageData;
  updateDepartmentConfig: (id: string, updatedConfig: Partial<Omit<EfectivosDepartmentConfig, 'id'>>) => void;
  addDepartment: (name: string, colorThemeName?: EfectivosColorTheme['name']) => EfectivosDepartmentConfig;
  removeDepartment: (id: string) => void;
  updateDepartmentValue: (departmentId: string, field: keyof EfectivosDepartmentDataInput, value: number | null) => void;
  updateDate: (date: string) => void;
  isLoading: boolean;
  setDepartmentsConfig: React.Dispatch<React.SetStateAction<EfectivosDepartmentConfig[]>>;
}

const EfectivosContext = createContext<EfectivosContextType | undefined>(undefined);

export const EfectivosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<EfectivosState>(getDefaultEfectivosState());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        try {
            const key = `efectivosState_${LOCAL_USERNAME}`;
            const savedStateStr = localStorage.getItem(key);
            if(savedStateStr) {
                const loadedState: EfectivosState = JSON.parse(savedStateStr);
                // Sync data with current config
                const currentDepartmentValues: Record<string, EfectivosDepartmentDataInput> = {};
                loadedState.departmentsConfig.forEach(dept => {
                    currentDepartmentValues[dept.id] = loadedState.pageData.departmentValues[dept.id] || { arqueo: null, faltante: null, recaudacionPlus: null, recaudacionMinus: null };
                });
                loadedState.pageData.departmentValues = currentDepartmentValues;
                setState(loadedState);
            } else {
                setState(getDefaultEfectivosState());
            }
        } catch(e) {
            console.error("Failed to load efectivos state from localStorage", e);
            setState(getDefaultEfectivosState());
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
        try {
            const key = `efectivosState_${LOCAL_USERNAME}`;
            localStorage.setItem(key, JSON.stringify(state));
        } catch(e) {
            console.error("Failed to save efectivos state to localStorage", e);
        }
    }
  }, [state, isLoading]);
  
  const setDepartmentsConfig = (updater: React.SetStateAction<EfectivosDepartmentConfig[]>) => {
    setState(prev => {
        const newConfigs = typeof updater === 'function' ? updater(prev.departmentsConfig) : updater;
        return { ...prev, departmentsConfig: newConfigs };
    });
  };

  const updateDepartmentConfig = useCallback((id: string, updatedConfig: Partial<Omit<EfectivosDepartmentConfig, 'id'>>) => {
    setState(prev => ({
        ...prev,
        departmentsConfig: prev.departmentsConfig.map(c => c.id === id ? { ...c, ...updatedConfig } : c)
    }));
  }, []);

  const addDepartment = useCallback((name: string, colorThemeName: EfectivosColorTheme['name'] = 'Gray'): EfectivosDepartmentConfig => {
    const newDepartment: EfectivosDepartmentConfig = { id: uuidv4(), name, colorThemeName };
    setState(prev => {
      const newConfigs = [...prev.departmentsConfig, newDepartment];
      const newPageData = {
        ...prev.pageData,
        departmentValues: { ...prev.pageData.departmentValues, [newDepartment.id]: { arqueo: null, faltante: null, recaudacionPlus: null, recaudacionMinus: null }}
      };
      return { departmentsConfig: newConfigs, pageData: newPageData };
    });
    return newDepartment;
  }, []);

  const removeDepartment = useCallback((id: string) => {
    setState(prev => {
      const newConfigs = prev.departmentsConfig.filter(c => c.id !== id);
      const newDepartmentValues = { ...prev.pageData.departmentValues };
      delete newDepartmentValues[id];
      const newPageData = { ...prev.pageData, departmentValues: newDepartmentValues };
      return { departmentsConfig: newConfigs, pageData: newPageData };
    });
  }, []);

  const updateDepartmentValue = useCallback((departmentId: string, field: keyof EfectivosDepartmentDataInput, value: number | null) => {
    setState(prev => ({
      ...prev,
      pageData: {
          ...prev.pageData,
          departmentValues: {
            ...prev.pageData.departmentValues,
            [departmentId]: {
              ...(prev.pageData.departmentValues[departmentId] || { arqueo: null, faltante: null, recaudacionPlus: null, recaudacionMinus: null }),
              [field]: value,
            },
          }
      }
    }));
  }, []);

  const updateDate = useCallback((date: string) => {
    setState(prev => ({ ...prev, pageData: { ...prev.pageData, date }}));
  }, []);

  return (
    <EfectivosContext.Provider value={{
      departmentsConfig: state.departmentsConfig,
      pageData: state.pageData,
      updateDepartmentConfig,
      addDepartment,
      removeDepartment,
      updateDepartmentValue,
      updateDate,
      isLoading,
      setDepartmentsConfig 
    }}>
      {children}
    </EfectivosContext.Provider>
  );
};

export const useEfectivos = (): EfectivosContextType => {
  const context = useContext(EfectivosContext);
  if (!context) {
    throw new Error('useEfectivos must be used within an EfectivosProvider');
  }
  return context;
};