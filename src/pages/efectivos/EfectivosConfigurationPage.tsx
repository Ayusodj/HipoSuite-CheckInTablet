import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEfectivos, EFECTIVOS_COLOR_THEMES } from '../../contexts/EfectivosContext'; // Changed to Efectivos
import { EfectivosDepartmentConfig, EfectivosColorTheme } from '../../types'; // Changed to Efectivos
import { SaveIcon, XCircleIcon, PlusCircleIcon, TrashIcon } from '../../components/icons/Icons';

const EfectivosConfigurationPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    departmentsConfig: initialDepartmentsConfig, 
    addDepartment, 
    removeDepartment,
    updateDepartmentConfig,
    isLoading 
  } = useEfectivos(); // Changed to useEfectivos

  const [editableDepartments, setEditableDepartments] = useState<EfectivosDepartmentConfig[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentColor, setNewDepartmentColor] = useState<EfectivosColorTheme['name']>(EFECTIVOS_COLOR_THEMES[0]?.name || 'Gray');

  useEffect(() => {
    if (!isLoading) {
      setEditableDepartments(JSON.parse(JSON.stringify(initialDepartmentsConfig)));
    }
  }, [initialDepartmentsConfig, isLoading]);

  const handleAddDepartment = () => {
    if (newDepartmentName.trim() === '') {
      alert('El nombre del punto de efectivo no puede estar vacío.'); // Changed "departamento" to "punto de efectivo"
      return;
    }
    addDepartment(newDepartmentName.trim(), newDepartmentColor);
    setNewDepartmentName('');
    setNewDepartmentColor(EFECTIVOS_COLOR_THEMES[0]?.name || 'Gray');
  };

  const handleRemoveDepartment = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este punto de efectivo? Se perderán todos los datos asociados.')) { // Changed
      removeDepartment(id);
    }
  };

  const handleUpdateDepartmentName = (id: string, name: string) => {
    updateDepartmentConfig(id, { name });
  };
  
  const handleUpdateDepartmentColor = (id: string, colorThemeName: EfectivosColorTheme['name']) => {
     updateDepartmentConfig(id, { colorThemeName });
  };

  const handleSave = () => {
    // Context state is source of truth, already updated by individual actions
    navigate('/efectivos'); // Navigate to Efectivos main page
  };

  const handleCancel = () => {
     // Reset local changes if any were not propagated to context (not the case here)
    setEditableDepartments(JSON.parse(JSON.stringify(initialDepartmentsConfig)));
    navigate('/efectivos'); // Navigate to Efectivos main page
  };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-700 dark:text-gray-300">Cargando configuración de Efectivo...</div>; // Changed
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-slate-900 min-h-full">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Configurar Puntos de Efectivo</h1> {/* Changed */}

        <div className="mb-8 p-4 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Añadir Nuevo Punto de Efectivo</h2> {/* Changed */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-2">
              <label htmlFor="newDeptName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Punto</label> {/* Changed */}
              <input
                type="text"
                id="newDeptName"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                placeholder="Ej: CAJA BARRA"
                className="w-full p-2 border border-gray-300 dark:border-slate-500 rounded-md text-sm bg-white dark:bg-slate-600 text-gray-900 dark:text-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="newDeptColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color del Tema</label>
              <div className="styled-select-container">
                <select
                  id="newDeptColor"
                  value={newDepartmentColor}
                  onChange={(e) => setNewDepartmentColor(e.target.value as EfectivosColorTheme['name'])} // Changed
                  className="styled-select-global w-full p-2 border border-gray-300 dark:border-slate-500 rounded-md text-sm bg-white dark:bg-slate-600 text-gray-900 dark:text-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {EFECTIVOS_COLOR_THEMES.map(theme => ( // Changed
                    <option key={theme.name} value={theme.name}>{theme.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
           <button
              onClick={handleAddDepartment}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
            >
              <PlusCircleIcon className="w-5 h-5" />
              <span>Añadir Punto</span> {/* Changed */}
            </button>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Puntos Existentes</h2> {/* Changed */}
        {editableDepartments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No hay puntos de efectivo configurados.</p> // Changed
        ) : (
          <ul className="space-y-3">
            {editableDepartments.map((dept) => {
              const theme = EFECTIVOS_COLOR_THEMES.find(t => t.name === dept.colorThemeName) || EFECTIVOS_COLOR_THEMES[0]; // Changed
              return (
              <li key={dept.id} className={`p-3 border rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${theme.dataCellClass} border-gray-300 dark:border-slate-600`}>
                <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <input
                    type="text"
                    value={dept.name}
                    onChange={(e) => handleUpdateDepartmentName(dept.id, e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-slate-500 rounded-md text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                    aria-label={`Nombre del punto ${dept.name}`} // Changed
                    />
          <div className="styled-select-container">
            <select
              value={dept.colorThemeName}
              onChange={(e) => handleUpdateDepartmentColor(dept.id, e.target.value as EfectivosColorTheme['name'])} // Changed
              className="styled-select-global w-full p-2 border border-gray-300 dark:border-slate-500 rounded-md text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
              aria-label={`Color para ${dept.name}`}
            >
              {EFECTIVOS_COLOR_THEMES.map(t => (
                <option key={t.name} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
                </div>
                <button
                  onClick={() => handleRemoveDepartment(dept.id)}
                  className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-md hover:bg-red-100 dark:hover:bg-slate-600 transition-colors self-start sm:self-center"
                  title="Eliminar Punto de Efectivo" // Changed
                  aria-label={`Eliminar punto ${dept.name}`} // Changed
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </li>
            )})}
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

export default EfectivosConfigurationPage;