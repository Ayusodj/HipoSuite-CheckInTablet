
import React, { useState, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useTemplates } from '../../contexts/TemplateContext'; 
import { CardTemplate, TextElement, ImageElement, Alignment, CARD_WIDTH_PX, CARD_HEIGHT_PX } from '../../types'; 
import { DEFAULT_TEMPLATE_DATA } from '../../constants'; 
import DesignCanvas from '../../components/DesignCanvas'; 
import TemplateConfigurationPanel from '../../components/TemplateConfigurationPanel'; 
import ElementPropertiesPanel from '../../components/ElementPropertiesPanel'; 
import { SaveIcon, XCircleIcon } from '../../components/icons/Icons'; 
import { v4 as uuidv4 } from 'uuid';

const NAV_BAR_HEIGHT_PX = 48; // Approximate height of SubNavBarHCG in HipoCardGeniusModule
const DESIGN_CANVAS_AREA_WIDTH_PX = 680;

const TemplateEditorPage: React.FC = () => {
  const { templateId } = ReactRouterDOM.useParams<{ templateId?: string }>();
  const navigate = ReactRouterDOM.useNavigate();
  const { getTemplateById, addTemplate, updateTemplate } = useTemplates();

  const [currentTemplate, setCurrentTemplate] = useState<CardTemplate | null>(null);
  const [isNewTemplate, setIsNewTemplate] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null); 

  useEffect(() => {
    setIsLoading(true);
    if (templateId) {
      const existingTemplate = getTemplateById(templateId);
      if (existingTemplate) {
        const baseStructure: CardTemplate = {
            id: existingTemplate.id,
            widthPx: existingTemplate.widthPx || CARD_WIDTH_PX, 
            heightPx: existingTemplate.heightPx || CARD_HEIGHT_PX,
            name: DEFAULT_TEMPLATE_DATA.name, 
            notes: DEFAULT_TEMPLATE_DATA.notes, 
            backgroundColor: DEFAULT_TEMPLATE_DATA.backgroundColor, 
            guestNameConfig: { ...DEFAULT_TEMPLATE_DATA.guestNameConfig, position: { ...DEFAULT_TEMPLATE_DATA.guestNameConfig.position }, style: { ...DEFAULT_TEMPLATE_DATA.guestNameConfig.style }},
            roomNumberConfig: { ...DEFAULT_TEMPLATE_DATA.roomNumberConfig, position: { ...DEFAULT_TEMPLATE_DATA.roomNumberConfig.position }, style: { ...DEFAULT_TEMPLATE_DATA.roomNumberConfig.style }},
            mealPlanBlockConfig: { ...DEFAULT_TEMPLATE_DATA.mealPlanBlockConfig, position: { ...DEFAULT_TEMPLATE_DATA.mealPlanBlockConfig.position }, style: { ...DEFAULT_TEMPLATE_DATA.mealPlanBlockConfig.style }, mealTimes: { ...DEFAULT_TEMPLATE_DATA.mealPlanBlockConfig.mealTimes }},
            customElements: [], 
        };
        
        const robustTemplate: CardTemplate = {
          ...baseStructure,
          name: existingTemplate.name,
          notes: existingTemplate.notes || '',
          backgroundColor: existingTemplate.backgroundColor || DEFAULT_TEMPLATE_DATA.backgroundColor,
          guestNameConfig: { ...baseStructure.guestNameConfig, ...(existingTemplate.guestNameConfig || {}), position: { ...baseStructure.guestNameConfig.position, ...(existingTemplate.guestNameConfig?.position || {}),}, style: { ...baseStructure.guestNameConfig.style, ...(existingTemplate.guestNameConfig?.style || {}),}},
          roomNumberConfig: { ...baseStructure.roomNumberConfig, ...(existingTemplate.roomNumberConfig || {}), position: { ...baseStructure.roomNumberConfig.position, ...(existingTemplate.roomNumberConfig?.position || {}),}, style: { ...baseStructure.roomNumberConfig.style, ...(existingTemplate.roomNumberConfig?.style || {}),}},
          mealPlanBlockConfig: { ...baseStructure.mealPlanBlockConfig, ...(existingTemplate.mealPlanBlockConfig || {}), position: { ...baseStructure.mealPlanBlockConfig.position, ...(existingTemplate.mealPlanBlockConfig?.position || {}),}, style: { ...baseStructure.mealPlanBlockConfig.style, ...(existingTemplate.mealPlanBlockConfig?.style || {}),}, mealTimes: { ...baseStructure.mealPlanBlockConfig.mealTimes, ...(existingTemplate.mealPlanBlockConfig?.mealTimes || {}),}},
          customElements: existingTemplate.customElements ? JSON.parse(JSON.stringify(existingTemplate.customElements)) : [],
        };

        setCurrentTemplate(robustTemplate);
        setIsNewTemplate(false);
      } else {
        console.error(`Template with id ${templateId} not found.`);
        navigate('/hipocardgenius', { replace: true }); 
      }
    } else {
      const newTemplateShell: CardTemplate = {
        id: uuidv4(),
        widthPx: CARD_WIDTH_PX,
        heightPx: CARD_HEIGHT_PX,
        name: DEFAULT_TEMPLATE_DATA.name,
        notes: DEFAULT_TEMPLATE_DATA.notes || '', 
        backgroundColor: DEFAULT_TEMPLATE_DATA.backgroundColor, 
        guestNameConfig: { ...DEFAULT_TEMPLATE_DATA.guestNameConfig, position: { ...DEFAULT_TEMPLATE_DATA.guestNameConfig.position }, style: { ...DEFAULT_TEMPLATE_DATA.guestNameConfig.style }},
        roomNumberConfig: { ...DEFAULT_TEMPLATE_DATA.roomNumberConfig, position: { ...DEFAULT_TEMPLATE_DATA.roomNumberConfig.position }, style: { ...DEFAULT_TEMPLATE_DATA.roomNumberConfig.style }},
        mealPlanBlockConfig: { ...DEFAULT_TEMPLATE_DATA.mealPlanBlockConfig, position: { ...DEFAULT_TEMPLATE_DATA.mealPlanBlockConfig.position }, style: { ...DEFAULT_TEMPLATE_DATA.mealPlanBlockConfig.style }, mealTimes: { ...DEFAULT_TEMPLATE_DATA.mealPlanBlockConfig.mealTimes }},
        customElements: DEFAULT_TEMPLATE_DATA.customElements ? JSON.parse(JSON.stringify(DEFAULT_TEMPLATE_DATA.customElements)) : [],
      };
      setCurrentTemplate(newTemplateShell);
      setIsNewTemplate(true);
    }
    setSelectedElementId(null); 
    setIsLoading(false);
  }, [templateId, getTemplateById, navigate]);

  const handleUpdateCurrentTemplate = useCallback((updatedProps: Partial<CardTemplate>) => {
    setCurrentTemplate(prev => {
      if (!prev) return null;
      const newTemplate = { ...prev, ...updatedProps };
      if (updatedProps.guestNameConfig) {
        newTemplate.guestNameConfig = { ...prev.guestNameConfig, ...updatedProps.guestNameConfig };
        if (updatedProps.guestNameConfig.style) newTemplate.guestNameConfig.style = { ...prev.guestNameConfig.style, ...updatedProps.guestNameConfig.style};
        if (updatedProps.guestNameConfig.position) newTemplate.guestNameConfig.position = { ...prev.guestNameConfig.position, ...updatedProps.guestNameConfig.position};
      }
      if (updatedProps.roomNumberConfig) {
        newTemplate.roomNumberConfig = { ...prev.roomNumberConfig, ...updatedProps.roomNumberConfig };
         if (updatedProps.roomNumberConfig.style) newTemplate.roomNumberConfig.style = { ...prev.roomNumberConfig.style, ...updatedProps.roomNumberConfig.style};
        if (updatedProps.roomNumberConfig.position) newTemplate.roomNumberConfig.position = { ...prev.roomNumberConfig.position, ...updatedProps.roomNumberConfig.position};
      }
      if (updatedProps.mealPlanBlockConfig) {
        newTemplate.mealPlanBlockConfig = { ...prev.mealPlanBlockConfig, ...updatedProps.mealPlanBlockConfig };
        if (updatedProps.mealPlanBlockConfig.style) newTemplate.mealPlanBlockConfig.style = { ...prev.mealPlanBlockConfig.style, ...updatedProps.mealPlanBlockConfig.style};
        if (updatedProps.mealPlanBlockConfig.position) newTemplate.mealPlanBlockConfig.position = { ...prev.mealPlanBlockConfig.position, ...updatedProps.mealPlanBlockConfig.position};
        if (updatedProps.mealPlanBlockConfig.mealTimes) newTemplate.mealPlanBlockConfig.mealTimes = { ...prev.mealPlanBlockConfig.mealTimes, ...updatedProps.mealPlanBlockConfig.mealTimes};
      }
      return newTemplate;
    });
  }, []);

  const handleAddElement = (type: 'text' | 'image') => {
    if (!currentTemplate) return;
    let newElement: TextElement | ImageElement;
    const defaultTextColorIsDark = document.documentElement.classList.contains('dark');
    const defaultTextColor = defaultTextColorIsDark ? '#E5E7EB' : '#333333'; 
    const defaultPosition = { x: 60, y: 50 }; 
    
    if (type === 'text') {
      newElement = {
        id: uuidv4(), type: 'text', text: 'Nuevo Texto', position: defaultPosition,
        style: { fontFamily: 'Inter', fontSize: 14, color: defaultTextColor, textAlign: Alignment.Left, fontWeight: 'normal', fontStyle: 'normal'},
        width: 30, 
      };
    } else {
      newElement = {
        id: uuidv4(), type: 'image', src: `https://picsum.photos/seed/${uuidv4().slice(0,8)}/200/150`, position: defaultPosition, 
        size: { width: 20, height: 20 }, altText: 'Nueva Imagen' // Changed height from 'auto' to 20
      };
    }
    const updatedElements = [...currentTemplate.customElements, newElement];
    handleUpdateCurrentTemplate({ customElements: updatedElements });
    setSelectedElementId(newElement.id); 
  };
  
  const handleUpdateElementCurrentTemplate = (updatedElement: TextElement | ImageElement) => {
     if (!currentTemplate) return;
     setCurrentTemplate(prev => {
       if (!prev) return null;
       const newElements = prev.customElements.map(el => el.id === updatedElement.id ? updatedElement : el);
       return { ...prev, customElements: newElements };
     });
  };

  const handleDeleteElement = (elementId: string) => {
    if (!currentTemplate) return;
    setCurrentTemplate(prev => {
        if (!prev) return null;
        const newElements = prev.customElements.filter(el => el.id !== elementId);
        if (selectedElementId === elementId) {
            setSelectedElementId(null); 
        }
        return { ...prev, customElements: newElements };
    });
  };

  const handleSave = () => {
    if (!currentTemplate) return;
    const { ...templateToSaveCleaned } = currentTemplate; 
    if (isNewTemplate) {
      const { id, ...templateDataToSave } = templateToSaveCleaned; 
      addTemplate(templateDataToSave);
    } else {
      updateTemplate(templateToSaveCleaned);
    }
    navigate('/hipocardgenius', { replace: true }); 
  };

  const handleCancel = () => {
    navigate('/hipocardgenius', { replace: true }); 
  };

  if (isLoading || !currentTemplate) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-4 text-lg text-gray-600 dark:text-gray-300">Cargando Editor de Plantillas...</p>
      </div>
    );
  }

  const selectedElementForPanel = currentTemplate.customElements.find(el => el.id === selectedElementId);
  
  return (
    <>
      {/* Fixed Left Panel for Canvas and Element Properties */}
      <div
        className="fixed h-full overflow-y-auto bg-gray-100 dark:bg-slate-900/70 shadow-lg print:hidden"
        style={{
          top: `${NAV_BAR_HEIGHT_PX}px`,
          left: `var(--sidebar-width)`,
          width: `${DESIGN_CANVAS_AREA_WIDTH_PX}px`,
          height: `calc(100vh - ${NAV_BAR_HEIGHT_PX}px)`,
          zIndex: 20, 
          willChange: 'transform', 
        }}
      >
        <div className="p-4 md:p-6 flex flex-col h-full items-center justify-center"> 
          <div className="flex-shrink-0"> 
            {currentTemplate && (
              <DesignCanvas
                template={currentTemplate}
                onUpdateTemplate={handleUpdateCurrentTemplate}
                onUpdateElement={handleUpdateElementCurrentTemplate}
                onDeleteElement={handleDeleteElement}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
              />
            )}
          </div>
          {selectedElementForPanel && (
            <div className="mt-4 flex-shrink-0 w-full max-w-md mx-auto"> 
              <ElementPropertiesPanel
                element={selectedElementForPanel}
                onUpdateElement={handleUpdateElementCurrentTemplate}
                onClose={() => setSelectedElementId(null)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Right Panel for Template Configuration */}
      <div 
        className="flex flex-col h-full print:ml-0" 
        style={{ marginLeft: `${DESIGN_CANVAS_AREA_WIDTH_PX}px` }}
      >
        <div className="flex-shrink-0 p-4 lg:p-6 bg-white dark:bg-slate-800 shadow">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 truncate">
              {isNewTemplate ? 'Crear Nueva Plantilla' : `Editando: ${currentTemplate.name}`}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors flex items-center space-x-2"
              >
                <XCircleIcon className="w-5 h-5" />
                <span>Cancelar</span>
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors flex items-center space-x-2"
              >
                <SaveIcon className="w-5 h-5" />
                <span>Guardar Plantilla</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex-grow p-6 overflow-y-auto min-h-0 bg-white dark:bg-slate-800"> 
          {currentTemplate && (
            <TemplateConfigurationPanel
              template={currentTemplate}
              onUpdateTemplate={handleUpdateCurrentTemplate}
              onAddElement={handleAddElement}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default TemplateEditorPage;
