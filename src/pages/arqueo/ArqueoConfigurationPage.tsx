
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArqueo } from '../../contexts/ArqueoContext';
import { ValeItemConfig } from '../../types';
import { SaveIcon, XCircleIcon, PlusCircleIcon, TrashIcon } from '../../components/icons/Icons';

const ArqueoConfigurationPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    valesConfig: initialValesConfig, 
    addValeConfig, 
    removeValeConfig,
    updateValeConfigLabel,
    isLoading 
  } = useArqueo();

  const [editableVales, setEditableVales] = useState<ValeItemConfig[]>([]);
  const [newValeLabel, setNewValeLabel] = useState('');

  useEffect(() => {
    if (!isLoading) {
      setEditableVales(JSON.parse(JSON.stringify(initialValesConfig)));
    }
  }, [initialValesConfig, isLoading]);

  const handleAddVale = () => {
    if (newValeLabel.trim() === '') {
      alert('La etiqueta del vale no puede estar vacía.');
      return;
    }
    addValeConfig(newValeLabel.trim());
    setNewValeLabel('');
  };

  const handleRemoveVale = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este tipo de vale?')) {
      removeValeConfig(id);
    }
  };

  const handleUpdateValeLabel = (id: string, label: string) => {
     // Update local state for immediate feedback
    setEditableVales(prev => prev.map(vale => vale.id === id ? { ...vale, label } : vale));
    // Debounce or call on blur/save to update context
    // For simplicity, updating context directly here
    updateValeConfigLabel(id, label);
  };

  const handleSave = () => {
    // Context state is source of truth, already updated by individual actions
    navigate('/arqueo');
  };

  const handleCancel = () => {
     // Reset local changes if any were not propagated to context (not the case here)
    setEditableVales(JSON.parse(JSON.stringify(initialValesConfig)));
    navigate('/arqueo');
  };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-700 dark:text-gray-300">Cargando configuración de Vales...</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-slate-900 min-h-full">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Configurar Tipos de Vales (Caja Diaria)</h1>

        <div className="mb-8 p-4 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Añadir Nuevo Tipo de Vale</h2>
          <div className="flex items-end space-x-3">
            <div className="flex-grow">
              <label htmlFor="newValeLabel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Etiqueta del Vale</label>
              <input
                type="text"
                id="newValeLabel"
                value={newValeLabel}
                onChange={(e) => setNewValeLabel(e.target.value)}
                placeholder="Ej: Invitación Café"
                className="w-full p-2 border border-gray-300 dark:border-slate-500 rounded-md text-sm bg-white dark:bg-slate-600 text-gray-900 dark:text-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleAddVale}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
            >
              <PlusCircleIcon className="w-5 h-5" />
              <span>Añadir Vale</span>
            </button>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Vales Existentes</h2>
        {editableVales.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No hay tipos de vales configurados.</p>
        ) : (
          <ul className="space-y-3">
            {editableVales.map((vale) => (
              <li key={vale.id} className="p-3 border border-gray-200 dark:border-slate-600 rounded-md flex items-center justify-between gap-3 bg-white dark:bg-slate-700/30">
                <input
                  type="text"
                  value={vale.label}
                  onChange={(e) => handleUpdateValeLabel(vale.id, e.target.value)}
                  className="flex-grow p-2 border border-gray-300 dark:border-slate-500 rounded-md text-sm bg-white dark:bg-slate-600 text-gray-900 dark:text-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                  aria-label={`Etiqueta para ${vale.label}`}
                />
                <button
                  onClick={() => handleRemoveVale(vale.id)}
                  className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-md hover:bg-red-100 dark:hover:bg-slate-600 transition-colors"
                  title="Eliminar Tipo de Vale"
                  aria-label={`Eliminar vale ${vale.label}`}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors flex items-center justify-center space-x-2"
          >
            <XCircleIcon className="w-5 h-5" />
            <span>Cancelar</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors flex items-center justify-center space-x-2"
          >
            <SaveIcon className="w-5 h-5" />
            <span>Guardar y Volver</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArqueoConfigurationPage;
