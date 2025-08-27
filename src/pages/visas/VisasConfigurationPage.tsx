
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVisas } from '../../contexts/VisasContext';
import { TpvDefinition } from '../../types';
import { SaveIcon, XCircleIcon, PlusCircleIcon, TrashIcon } from '../../components/icons/Icons';
import { v4 as uuidv4 } from 'uuid';

interface TpvSectionEditorProps {
  title: string;
  tpvs: TpvDefinition[];
  onAddTpv: () => void;
  onRemoveTpv: (tpvId: string) => void;
  onUpdateTpvLabel: (tpvId: string, newLabel: string) => void;
}

const TpvSectionEditor: React.FC<TpvSectionEditorProps> = ({ title, tpvs, onAddTpv, onRemoveTpv, onUpdateTpvLabel }) => {
  return (
    <div className="mb-8 p-4 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">{title}</h3>
      {tpvs.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No hay TPVs configurados para esta sección.</p>}
      <ul className="space-y-2">
        {tpvs.map(tpv => (
          <li key={tpv.id} className="flex items-center space-x-2">
            <input
              type="text"
              value={tpv.label}
              onChange={(e) => onUpdateTpvLabel(tpv.id, e.target.value)}
              className="flex-grow p-2 border border-gray-300 dark:border-slate-500 rounded-md text-sm bg-white dark:bg-slate-600 text-gray-900 dark:text-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
              aria-label={`Etiqueta para TPV ${tpv.id}`}
            />
            <button
              onClick={() => onRemoveTpv(tpv.id)}
              className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-md hover:bg-red-100 dark:hover:bg-slate-600"
              title="Eliminar TPV"
              aria-label={`Eliminar TPV ${tpv.label}`}
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={onAddTpv}
        className="mt-4 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
      >
        <PlusCircleIcon className="w-5 h-5" />
        <span>Añadir TPV</span>
      </button>
    </div>
  );
};

const VisasConfigurationPage: React.FC = () => {
  const navigate = useNavigate();
  const { config: initialConfig, updateConfig, isLoading } = useVisas(); // Removed unused context functions for now
  
  // Local state for editing, commit to context on save
  const [editableConfig, setEditableConfig] = useState(initialConfig);

  React.useEffect(() => {
    // Keep local state in sync if context changes (e.g., due to other tabs or initial load)
     if (!isLoading) {
        setEditableConfig(initialConfig);
    }
  }, [initialConfig, isLoading]);


  const handleAdd = (section: 'baresTpvs' | 'recepcionTpvs') => {
    const newId = uuidv4();
    const newItem: TpvDefinition = { id: newId, label: 'Nuevo TPV' };
    setEditableConfig(prev => ({
        ...prev,
        [section]: [...prev[section], newItem]
    }));
  };
  
  const handleRemove = (section: 'baresTpvs' | 'recepcionTpvs', tpvId: string) => {
     setEditableConfig(prev => ({
        ...prev,
        [section]: prev[section].filter(item => item.id !== tpvId)
    }));
  };

  const handleLabelChange = (section: 'baresTpvs' | 'recepcionTpvs', tpvId: string, newLabel: string) => {
    setEditableConfig(prev => ({
        ...prev,
        [section]: prev[section].map(item => item.id === tpvId ? {...item, label: newLabel} : item)
    }));
  };


  const handleSave = () => {
    updateConfig(editableConfig);
    navigate('/visas');
  };

  const handleCancel = () => {
    setEditableConfig(initialConfig); // Reset changes on cancel
    navigate('/visas');
  };
  
  if (isLoading) {
     return <div className="p-6 text-center text-gray-700 dark:text-gray-300">Cargando configuración...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-full">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Configurar Listas de TPVs</h1>

        <TpvSectionEditor
          title="TPVs de Bares"
          tpvs={editableConfig.baresTpvs}
          onAddTpv={() => handleAdd('baresTpvs')}
          onRemoveTpv={(id) => handleRemove('baresTpvs', id)}
          onUpdateTpvLabel={(id, label) => handleLabelChange('baresTpvs', id, label)}
        />

        <TpvSectionEditor
          title="TPVs de Recepción"
          tpvs={editableConfig.recepcionTpvs}
          onAddTpv={() => handleAdd('recepcionTpvs')}
          onRemoveTpv={(id) => handleRemove('recepcionTpvs', id)}
          onUpdateTpvLabel={(id, label) => handleLabelChange('recepcionTpvs', id, label)}
        />
        
        {/* Placeholder for OTROS TPVs if needed in future
        <TpvSectionEditor
          title="Otros TPVs"
          tpvs={editableConfig.otrosTpvs || []}
          onAddTpv={() => handleAdd('otrosTpvs')}
          onRemoveTpv={(id) => handleRemove('otrosTpvs', id)}
          onUpdateTpvLabel={(id, label) => handleLabelChange('otrosTpvs', id, label)}
        />
        */}

        <div className="mt-8 flex justify-end space-x-3">
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
            <span>Guardar Configuración</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisasConfigurationPage;