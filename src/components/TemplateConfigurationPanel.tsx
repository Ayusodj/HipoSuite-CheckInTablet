
import React from 'react';
import { CardTemplate, Alignment, FONT_FAMILY_OPTIONS, PREDEFINED_COLORS, FixedElementConfig } from '../types';
import { PlusCircleIcon } from './icons/Icons';

interface TemplateConfigurationPanelProps {
  template: CardTemplate;
  onUpdateTemplate: (updatedProps: Partial<CardTemplate>) => void;
  onAddElement: (type: 'text' | 'image') => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-md font-semibold text-gray-700 mt-4 mb-2 border-b pb-1">{children}</h3>
);

const ConfigInput: React.FC<{ label: string; id: string; children: React.ReactNode; description?: string;}> = ({label, id, children, description}) => (
  <div className="mb-3">
    <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    {children}
    {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
  </div>
);

const FixedElementStyleEditor: React.FC<{
  config: FixedElementConfig;
  onUpdate: (newConfig: FixedElementConfig) => void;
  elementName: string;
}> = ({ config, onUpdate, elementName }) => {
  return (
    <div className="space-y-2 p-3 border rounded-md bg-gray-50">
      <ConfigInput label="Fuente" id={`${elementName}-fontFamily`}>
        <div className="styled-select-container">
          <select
            value={config.fontFamily}
            onChange={(e) => onUpdate({ ...config, fontFamily: e.target.value })}
            className="styled-select-global w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900"
          >
            {FONT_FAMILY_OPTIONS.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>
      </ConfigInput>

      <ConfigInput label="Grosor de Fuente" id={`${elementName}-fontWeight`}>
        <div className="styled-select-container">
          <select
            value={config.fontWeight}
            onChange={(e) => onUpdate({ ...config, fontWeight: e.target.value as 'normal' | 'bold' })}
            className="styled-select-global w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900"
          >
            <option value="normal">Normal</option>
            <option value="bold">Negrita</option>
          </select>
        </div>
      </ConfigInput>

      <ConfigInput label="Color" id={`${elementName}-color`}>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={config.color}
            onChange={e => onUpdate({ ...config, color: e.target.value })}
            className="w-8 h-7 rounded border-gray-300 p-0.5 bg-white cursor-pointer"
            aria-label={`Color para ${elementName}`}
          />
          <input
            type="text"
            value={config.color}
            onChange={e => onUpdate({ ...config, color: e.target.value })}
            className="w-24 p-1 border border-gray-300 rounded text-sm bg-white"
          />
        </div>
      </ConfigInput>
    </div>
  );
};


const TemplateConfigurationPanel: React.FC<TemplateConfigurationPanelProps> = ({ template, onUpdateTemplate, onAddElement }) => {
  
  const handleFixedConfigUpdate = (
    configName: 'guestNameConfig' | 'roomNumberConfig' | 'mealPlanBlockConfig',
    newStyle: FixedElementConfig
  ) => {
    onUpdateTemplate({ [configName]: { ...template[configName], style: newStyle } });
  };
  
  const handleMealTimeChange = (meal: 'breakfast' | 'lunch' | 'dinner', value: string) => {
    onUpdateTemplate({
      mealPlanBlockConfig: {
        ...template.mealPlanBlockConfig,
        mealTimes: {
          ...template.mealPlanBlockConfig.mealTimes,
          [meal]: value,
        }
      }
    });
  };


  return (
    <div className="text-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Configuración de Plantilla</h2>
      
      <SectionTitle>Información General</SectionTitle>
      <ConfigInput label="Nombre de la Plantilla" id="templateName">
        <input
          type="text"
          id="templateName"
          value={template.name}
          onChange={(e) => onUpdateTemplate({ name: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
        />
      </ConfigInput>
      <ConfigInput label="Carpeta / Categoría" id="templateCategory">
        <input
          type="text"
          id="templateCategory"
          value={template.category || ''}
          onChange={(e) => onUpdateTemplate({ category: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
          placeholder="Ej: Bienvenida, Eventos..."
        />
      </ConfigInput>
      <ConfigInput label="Notas / Descripción Interna" id="templateNotes">
        <textarea
          id="templateNotes"
          value={template.notes || ''}
          onChange={(e) => onUpdateTemplate({ notes: e.target.value })}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
        />
      </ConfigInput>
      <ConfigInput label="Color de Fondo" id="templateBackgroundColor">
        <div className="flex space-x-1 items-center">
          {PREDEFINED_COLORS.map(color => (
            <button
              key={color.value}
              title={color.name}
              onClick={() => onUpdateTemplate({ backgroundColor: color.value })}
              className={`w-6 h-6 rounded-full border-2 no-theme-button ${template.backgroundColor === color.value ? 'ring-2 ring-offset-1 ring-indigo-500' : 'border-gray-300'}`}
              style={{ backgroundColor: color.value }}
              aria-label={`Seleccionar color de fondo ${color.name}`}
            />
          ))}
          <input
            type="color"
            id="templateBackgroundColorPicker"
            value={template.backgroundColor}
            onChange={e => onUpdateTemplate({ backgroundColor: e.target.value })}
            className="w-8 h-7 rounded border-gray-300 p-0.5 bg-white cursor-pointer no-theme-button"
          />
        </div>
      </ConfigInput>


      <SectionTitle>Nombre del Huésped</SectionTitle>
      <FixedElementStyleEditor 
          config={template.guestNameConfig.style}
          onUpdate={(newStyle) => handleFixedConfigUpdate('guestNameConfig', newStyle)}
          elementName="guestName"
      />

      <SectionTitle>Número de Habitación</SectionTitle>
      <FixedElementStyleEditor 
          config={template.roomNumberConfig.style}
          onUpdate={(newStyle) => handleFixedConfigUpdate('roomNumberConfig', newStyle)}
          elementName="roomNumber"
      />

      <SectionTitle>Bloque de Plan de Comidas</SectionTitle>
        <ConfigInput label="Habilitar Bloque de Plan de Comidas" id="enableMealPlanBlock">
          <div className="flex items-center">
            <input type="checkbox" id="enableMealPlanBlock" checked={template.mealPlanBlockConfig.enabled} onChange={e => onUpdateTemplate({ mealPlanBlockConfig: {...template.mealPlanBlockConfig, enabled: e.target.checked}})} className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
            <span className="text-gray-700">Mostrar información del plan de comidas</span>
          </div>
        </ConfigInput>
      {template.mealPlanBlockConfig.enabled && (
        <div className="space-y-2 p-3 border rounded-md bg-gray-50">
          <p className="text-xs text-gray-500 mb-2">El bloque del Plan de Comidas es arrastrable en el lienzo. Su estilo de texto general se configura aquí.</p>
          <FixedElementStyleEditor 
              config={template.mealPlanBlockConfig.style}
              onUpdate={(newStyle) => handleFixedConfigUpdate('mealPlanBlockConfig', newStyle)}
              elementName="mealPlanBlock"
          />
          <ConfigInput label="Texto Hora Desayuno" id="mealTimeBreakfast">
            <input type="text" value={template.mealPlanBlockConfig.mealTimes.breakfast} onChange={e => handleMealTimeChange('breakfast', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900" placeholder="e.g., 07:00 - 10:00"/>
          </ConfigInput>
          <ConfigInput label="Texto Hora Almuerzo" id="mealTimeLunch">
            <input type="text" value={template.mealPlanBlockConfig.mealTimes.lunch} onChange={e => handleMealTimeChange('lunch', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900" placeholder="e.g., 12:30 - 14:30"/>
          </ConfigInput>
          <ConfigInput label="Texto Hora Cena" id="mealTimeDinner">
            <input type="text" value={template.mealPlanBlockConfig.mealTimes.dinner} onChange={e => handleMealTimeChange('dinner', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900" placeholder="e.g., 19:00 - 21:30"/>
          </ConfigInput>
        </div>
      )}

      <SectionTitle>Elementos Personalizados</SectionTitle>
      <div className="space-y-2">
        <button onClick={() => onAddElement('text')} className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <PlusCircleIcon className="w-5 h-5" />
          <span>Añadir Texto</span>
        </button>
        <button onClick={() => onAddElement('image')} className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <PlusCircleIcon className="w-5 h-5" />
          <span>Añadir Imagen</span>
        </button>
      </div>
    </div>
  );
};

export default TemplateConfigurationPanel;