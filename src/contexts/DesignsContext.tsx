import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Design {
  id: string;
  name: string;
  dataUrl: string; // base64 data URL
}

interface DesignsContextType {
  designs: Design[];
  addDesign: (file: File) => Promise<void>;
  deleteDesign: (designId: string) => void;
  isLoading: boolean;
}

const DesignsContext = createContext<DesignsContextType | undefined>(undefined);
const LOCAL_USERNAME = 'default_user';

export const DesignsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
        setIsLoading(true);
        try {
            const key = `designs_${LOCAL_USERNAME}`;
            const savedDesigns = localStorage.getItem(key);
            setDesigns(savedDesigns ? JSON.parse(savedDesigns) : []);
        } catch (e) {
            console.error("Failed to load designs from localStorage", e);
            setDesigns([]);
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        const key = `designs_${LOCAL_USERNAME}`;
        const dataToStore = JSON.stringify(designs);
        if (dataToStore.length > 4.5 * 1024 * 1024) { // ~4.5MB, with some buffer
            console.warn("Los datos de los diseños se están acercando al límite de localStorage. Considere la posibilidad de eliminar algunos diseños.");
        }
        localStorage.setItem(key, dataToStore);
      } catch (e) {
        console.error("No se pudieron guardar los diseños en localStorage. Podría estar lleno.", e);
      }
    }
  }, [designs, isLoading]);

  const addDesign = useCallback(async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (dataUrl) {
                const newDesign: Design = {
                    id: uuidv4(),
                    name: file.name,
                    dataUrl: dataUrl,
                };
                setDesigns(prevDesigns => [...prevDesigns, newDesign]);
                resolve();
            } else {
                reject(new Error("No se pudieron leer los datos del archivo."));
            }
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
  }, []);

  const deleteDesign = useCallback((designId: string) => {
    setDesigns(prevDesigns => prevDesigns.filter(d => d.id !== designId));
  }, []);

  return (
    <DesignsContext.Provider value={{ designs, addDesign, deleteDesign, isLoading }}>
      {children}
    </DesignsContext.Provider>
  );
};

export const useDesigns = (): DesignsContextType => {
  const context = useContext(DesignsContext);
  if (!context) {
    throw new Error('useDesigns must be used within a DesignsProvider');
  }
  return context;
};
