import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileDownloadIcon, UploadIcon } from '../icons/Icons';

const UserManagementPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = () => {
    if (!currentUser || currentUser.username === 'guest') {
      setError("Debe iniciar sesión para exportar datos.");
      return;
    }
    setError(null);
    setSuccess(null);
    try {
        const userData: { [key: string]: any } = {};
        const userSuffix = `_${currentUser.username}`;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.endsWith(userSuffix)) {
                const dataKey = key.substring(0, key.length - userSuffix.length);
                const data = localStorage.getItem(key);
                if (data) {
                    userData[dataKey] = JSON.parse(data);
                }
            }
        }

        if (Object.keys(userData).length === 0) {
            setSuccess('No hay datos locales para exportar para este usuario.');
            return;
        }

        const jsonData = JSON.stringify(userData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().split('T')[0];
        a.download = `HipoRecSuite_backup_local_${currentUser.username}_${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setSuccess('Datos exportados correctamente.');
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al exportar los datos.');
    }
  };

  const handleImportClick = () => {
    if (!currentUser || currentUser.username === 'guest') {
      setError("Debe iniciar sesión para importar datos.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || currentUser.username === 'guest') return;

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
        setError('Por favor, selecciona un archivo JSON válido.');
        return;
    }

    if (!window.confirm('¡ADVERTENCIA! Importar un archivo reemplazará TODOS sus datos locales actuales para este usuario. ¿Desea continuar?')) {
        if (event.target) event.target.value = ''; // Reset file input
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        setError(null);
        setSuccess(null);
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') throw new Error("El archivo no se pudo leer correctamente.");
            
            const importedData = JSON.parse(text);
            const userSuffix = `_${currentUser.username}`;

            // Clear existing data for this user first
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                 const key = localStorage.key(i);
                 if (key && key.endsWith(userSuffix)) {
                    keysToRemove.push(key);
                 }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));

            // Set new data from the imported file
            for (const dataKey in importedData) {
                const storageKey = `${dataKey}${userSuffix}`;
                localStorage.setItem(storageKey, JSON.stringify(importedData[dataKey]));
            }
            
            setSuccess('Datos importados correctamente. La aplicación se recargará para reflejar los cambios.');
            setTimeout(() => window.location.reload(), 2000);

        } catch (error) {
            setError(error instanceof Error ? error.message : "Error al procesar el archivo JSON.");
        } finally {
            if (event.target) (event.target as HTMLInputElement).value = '';
        }
    };
    reader.onerror = () => {
        setError("Error al leer el archivo.");
        if (event.target) event.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestión de Datos de la Cuenta (Local)</h2>
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

            <p className="text-sm text-gray-600 mb-4">
                Exporta todos tus datos locales (plantillas, configuraciones, etc.) a un archivo para crear una copia de seguridad. 
                Puedes importar este archivo más tarde en este u otro dispositivo para restaurar tus datos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleExportData}
                    className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 no-theme-button"
                >
                    <FileDownloadIcon className="w-5 h-5 mr-2" />
                    Exportar Mis Datos
                </button>
                <button
                    onClick={handleImportClick}
                    className="flex-1 flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <UploadIcon className="w-5 h-5 mr-2" />
                    Importar a Mi Cuenta
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                />
            </div>
        </div>
    </div>
  );
};

export default UserManagementPanel;