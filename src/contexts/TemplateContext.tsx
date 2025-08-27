import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { CardTemplate, CARD_WIDTH_PX, CARD_HEIGHT_PX } from '../types'; 
import { INITIAL_TEMPLATES } from '../constants';
import { v4 as uuidv4 } from 'uuid';

interface TemplateContextType {
  templates: CardTemplate[];
  addTemplate: (template: Omit<CardTemplate, 'id' | 'widthPx' | 'heightPx'>) => CardTemplate;
  updateTemplate: (updatedTemplate: CardTemplate) => void;
  deleteTemplate: (templateId: string) => void;
  getTemplateById: (templateId: string) => CardTemplate | undefined;
  duplicateTemplate: (templateId: string) => CardTemplate | undefined;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);
const LOCAL_USERNAME = 'default_user';

export const TemplateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<CardTemplate[]>(INITIAL_TEMPLATES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
        setIsLoading(true);
        try {
            const key = `templates_${LOCAL_USERNAME}`;
            const savedTemplates = localStorage.getItem(key);
            setTemplates(savedTemplates ? JSON.parse(savedTemplates) : INITIAL_TEMPLATES);
        } catch (e) {
            console.error("Failed to load templates from localStorage", e);
            setTemplates(INITIAL_TEMPLATES);
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        const key = `templates_${LOCAL_USERNAME}`;
        localStorage.setItem(key, JSON.stringify(templates));
      } catch (e) {
        console.error("Failed to save templates to localStorage", e);
      }
    }
  }, [templates, isLoading]);

  const addTemplate = (templateData: Omit<CardTemplate, 'id' | 'widthPx' | 'heightPx'>): CardTemplate => {
    const newTemplate: CardTemplate = { 
      ...templateData, 
      id: uuidv4(),
      widthPx: CARD_WIDTH_PX, 
      heightPx: CARD_HEIGHT_PX, 
      customElements: templateData.customElements || [],
    };
    setTemplates(prevTemplates => [...prevTemplates, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = (updatedTemplate: CardTemplate) => {
    setTemplates(prevTemplates =>
      prevTemplates.map(t => (t.id === updatedTemplate.id ? updatedTemplate : t))
    );
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(prevTemplates => prevTemplates.filter(t => t.id !== templateId));
  };

  const getTemplateById = (templateId: string): CardTemplate | undefined => {
    return templates.find(t => t.id === templateId);
  };

  const duplicateTemplate = (templateId: string): CardTemplate | undefined => {
    const originalTemplate = getTemplateById(templateId);
    if (!originalTemplate) return undefined;

    const duplicatedTemplate: CardTemplate = {
      ...originalTemplate,
      id: uuidv4(),
      name: `${originalTemplate.name} (Copy)`,
      customElements: originalTemplate.customElements.map(el => ({ ...el, id: uuidv4() })),
    };
    setTemplates(prevTemplates => [...prevTemplates, duplicatedTemplate]);
    return duplicatedTemplate;
  };

  return (
    <TemplateContext.Provider value={{ templates, addTemplate, updateTemplate, deleteTemplate, getTemplateById, duplicateTemplate }}>
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplates = (): TemplateContextType => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  return context;
};