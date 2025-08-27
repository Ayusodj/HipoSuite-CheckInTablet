import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import {
  ArqueoContextState,
  ValeItemConfig,
  ArqueoCajaDiariaData,
  ArqueoCajaNocheData,
  COIN_DENOMINATIONS,
  BILLETE_DENOMINATIONS,
  CoinDenomination,
  BilleteDenomination
} from '../types';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_USERNAME = 'default_user';

const getDefaultCajaDiariaData = (valesConfig: ValeItemConfig[]): ArqueoCajaDiariaData => {
  const monedasQuantitiesBarra: Partial<Record<CoinDenomination, number | null>> = {};
  COIN_DENOMINATIONS.forEach(denom => monedasQuantitiesBarra[denom] = null);
  const billetesQuantitiesBarra: Partial<Record<BilleteDenomination, number | null>> = {};
  BILLETE_DENOMINATIONS.forEach(denom => billetesQuantitiesBarra[denom] = null);

  const monedasQuantitiesCajaFuerte: Partial<Record<CoinDenomination, number | null>> = {};
  COIN_DENOMINATIONS.forEach(denom => monedasQuantitiesCajaFuerte[denom] = null);
  const billetesQuantitiesCajaFuerte: Partial<Record<BilleteDenomination, number | null>> = {};
  BILLETE_DENOMINATIONS.forEach(denom => billetesQuantitiesCajaFuerte[denom] = null);
  
  const valesAmounts: Record<string, number | null> = {};
  valesConfig.forEach(vale => valesAmounts[vale.id] = null);

  return {
    monedasQuantitiesBarra,
    billetesQuantitiesBarra,
    monedasQuantitiesCajaFuerte,
    billetesQuantitiesCajaFuerte,
    divisaAmount: null,
    divisaDiaAmount: null,
    valesAmounts,
    tarjetasAmount: null,
    entregadoAmount: null,
  };
};

const getDefaultCajaNocheData = (): ArqueoCajaNocheData => {
  const monedasQuantitiesNoche: Partial<Record<CoinDenomination, number | null>> = {};
  COIN_DENOMINATIONS.forEach(denom => monedasQuantitiesNoche[denom] = null);
  const billetesQuantitiesNoche: Partial<Record<BilleteDenomination, number | null>> = {};
  BILLETE_DENOMINATIONS.forEach(denom => billetesQuantitiesNoche[denom] = null);
  return {
    monedasQuantitiesNoche,
    billetesQuantitiesNoche,
  };
};

const defaultArqueoState: ArqueoContextState = {
    valesConfig: [],
    cajaDiariaData: getDefaultCajaDiariaData([]),
    cajaNocheData: getDefaultCajaNocheData(),
};

interface ArqueoContextType extends ArqueoContextState {
  updateValeConfigLabel: (id: string, label: string) => void;
  addValeConfig: (label: string) => ValeItemConfig;
  removeValeConfig: (id: string) => void;
  
  updateMonedaQuantityBarra: (denomination: CoinDenomination, quantity: number | null) => void;
  updateBilleteQuantityBarra: (denomination: BilleteDenomination, quantity: number | null) => void;
  updateMonedaQuantityCajaFuerte: (denomination: CoinDenomination, quantity: number | null) => void;
  updateBilleteQuantityCajaFuerte: (denomination: BilleteDenomination, quantity: number | null) => void;
  updateDivisaAmount: (amount: number | null) => void;
  updateDivisaDiaAmount: (amount: number | null) => void;
  updateValeAmount: (valeId: string, amount: number | null) => void;
  updateTarjetasAmount: (amount: number | null) => void;
  updateEntregadoDiariaAmount: (amount: number | null) => void;

  updateMonedaQuantityNoche: (denomination: CoinDenomination, quantity: number | null) => void;
  updateBilleteQuantityNoche: (denomination: BilleteDenomination, quantity: number | null) => void;
  
  isLoading: boolean;
  resetCajaDiaria: () => void;
  resetCajaNoche: () => void;
}

const ArqueoContext = createContext<ArqueoContextType | undefined>(undefined);

export const ArqueoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ArqueoContextState>(defaultArqueoState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
        setIsLoading(true);
        try {
            const key = `arqueo_${LOCAL_USERNAME}`;
            const savedStateStr = localStorage.getItem(key);
            if (savedStateStr) {
                const loadedState: ArqueoContextState = JSON.parse(savedStateStr);
                
                // Sync vale amounts with current config
                const syncedValesAmounts: Record<string, number | null> = {};
                if(loadedState.valesConfig) {
                    loadedState.valesConfig.forEach(v => {
                        syncedValesAmounts[v.id] = loadedState.cajaDiariaData?.valesAmounts?.[v.id] ?? null;
                    });
                }
                if(loadedState.cajaDiariaData) {
                    loadedState.cajaDiariaData.valesAmounts = syncedValesAmounts;
                }
                setState(loadedState);
            } else {
                setState(defaultArqueoState);
            }
        } catch (e) {
            console.error("Failed to load arqueo state from localStorage", e);
            setState(defaultArqueoState);
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        const key = `arqueo_${LOCAL_USERNAME}`;
        localStorage.setItem(key, JSON.stringify(state));
      } catch (e) {
          console.error("Failed to save arqueo state to localStorage", e);
      }
    }
  }, [state, isLoading]);

  const updateValeConfigLabel = useCallback((id: string, label: string) => {
    setState(prev => ({ ...prev, valesConfig: prev.valesConfig.map(v => v.id === id ? { ...v, label } : v) }));
  }, []);

  const addValeConfig = useCallback((label: string): ValeItemConfig => {
    const newVale: ValeItemConfig = { id: uuidv4(), label };
    setState(prev => ({ ...prev, valesConfig: [...prev.valesConfig, newVale] }));
    return newVale;
  }, []);

  const removeValeConfig = useCallback((id: string) => {
    setState(prev => {
        const newValeConfig = prev.valesConfig.filter(v => v.id !== id);
        const newValeAmounts = { ...prev.cajaDiariaData.valesAmounts };
        delete newValeAmounts[id];
        return {
            ...prev,
            valesConfig: newValeConfig,
            cajaDiariaData: { ...prev.cajaDiariaData, valesAmounts: newValeAmounts }
        };
    });
  }, []);

  const updateCajaDiaria = useCallback((updater: (prev: ArqueoCajaDiariaData) => ArqueoCajaDiariaData) => {
      setState(prev => ({ ...prev, cajaDiariaData: updater(prev.cajaDiariaData) }));
  }, []);
  
  const updateCajaNoche = useCallback((updater: (prev: ArqueoCajaNocheData) => ArqueoCajaNocheData) => {
      setState(prev => ({ ...prev, cajaNocheData: updater(prev.cajaNocheData) }));
  }, []);

  const updateMonedaQuantityBarra = useCallback((denomination: CoinDenomination, quantity: number | null) => {
    updateCajaDiaria(prev => ({ ...prev, monedasQuantitiesBarra: { ...prev.monedasQuantitiesBarra, [denomination]: quantity } }));
  }, [updateCajaDiaria]);
  const updateBilleteQuantityBarra = useCallback((denomination: BilleteDenomination, quantity: number | null) => {
    updateCajaDiaria(prev => ({ ...prev, billetesQuantitiesBarra: { ...prev.billetesQuantitiesBarra, [denomination]: quantity } }));
  }, [updateCajaDiaria]);
  const updateMonedaQuantityCajaFuerte = useCallback((denomination: CoinDenomination, quantity: number | null) => {
    updateCajaDiaria(prev => ({ ...prev, monedasQuantitiesCajaFuerte: { ...prev.monedasQuantitiesCajaFuerte, [denomination]: quantity } }));
  }, [updateCajaDiaria]);
  const updateBilleteQuantityCajaFuerte = useCallback((denomination: BilleteDenomination, quantity: number | null) => {
    updateCajaDiaria(prev => ({ ...prev, billetesQuantitiesCajaFuerte: { ...prev.billetesQuantitiesCajaFuerte, [denomination]: quantity } }));
  }, [updateCajaDiaria]);
  const updateDivisaAmount = useCallback((amount: number | null) => {
    updateCajaDiaria(prev => ({ ...prev, divisaAmount: amount }));
  }, [updateCajaDiaria]);
  const updateDivisaDiaAmount = useCallback((amount: number | null) => {
    updateCajaDiaria(prev => ({ ...prev, divisaDiaAmount: amount }));
  }, [updateCajaDiaria]);
  const updateValeAmount = useCallback((valeId: string, amount: number | null) => {
    updateCajaDiaria(prev => ({ ...prev, valesAmounts: { ...prev.valesAmounts, [valeId]: amount } }));
  }, [updateCajaDiaria]);
  const updateTarjetasAmount = useCallback((amount: number | null) => {
    updateCajaDiaria(prev => ({ ...prev, tarjetasAmount: amount }));
  }, [updateCajaDiaria]);
  const updateEntregadoDiariaAmount = useCallback((amount: number | null) => {
    updateCajaDiaria(prev => ({ ...prev, entregadoAmount: amount }));
  }, [updateCajaDiaria]);

  const updateMonedaQuantityNoche = useCallback((denomination: CoinDenomination, quantity: number | null) => {
    updateCajaNoche(prev => ({ ...prev, monedasQuantitiesNoche: { ...prev.monedasQuantitiesNoche, [denomination]: quantity } }));
  }, [updateCajaNoche]);
  const updateBilleteQuantityNoche = useCallback((denomination: BilleteDenomination, quantity: number | null) => {
    updateCajaNoche(prev => ({ ...prev, billetesQuantitiesNoche: { ...prev.billetesQuantitiesNoche, [denomination]: quantity } }));
  }, [updateCajaNoche]);

  const resetCajaDiaria = useCallback(() => {
    setState(prev => ({...prev, cajaDiariaData: getDefaultCajaDiariaData(prev.valesConfig)}));
  },[]);

  const resetCajaNoche = useCallback(() => {
    setState(prev => ({...prev, cajaNocheData: getDefaultCajaNocheData()}));
  },[]);

  return (
    <ArqueoContext.Provider value={{
      ...state,
      updateValeConfigLabel, addValeConfig, removeValeConfig,
      updateMonedaQuantityBarra, updateBilleteQuantityBarra, 
      updateMonedaQuantityCajaFuerte, updateBilleteQuantityCajaFuerte,
      updateDivisaAmount, updateDivisaDiaAmount,
      updateValeAmount, updateTarjetasAmount, updateEntregadoDiariaAmount,
      updateMonedaQuantityNoche, updateBilleteQuantityNoche,
      isLoading,
      resetCajaDiaria, resetCajaNoche
    }}>
      {children}
    </ArqueoContext.Provider>
  );
};

export const useArqueo = (): ArqueoContextType => {
  const context = useContext(ArqueoContext);
  if (!context) {
    throw new Error('useArqueo must be used within an ArqueoProvider');
  }
  return context;
};