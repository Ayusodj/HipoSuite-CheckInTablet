
import React, { useState } from 'react';
import { useGuestData } from '../../contexts/GuestDataContext'; 
import { parseGuestData } from '../../utils/dataParser'; 
import { TrashIcon, PlusCircleIcon } from '../../components/icons/Icons'; 

const ImportDataPage: React.FC = () => {
  const { guests, addGuestsBatch, deleteGuest, clearGuests } = useGuestData();
  const [pastedData, setPastedData] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleProcessData = () => {
    setError(null);
    setFeedback(null);
    if (!pastedData.trim()) {
      setError("Por favor, pega datos de huéspedes en el área de texto.");
      return;
    }
    try {
      const parsedGuests = parseGuestData(pastedData);
      if (parsedGuests.length > 0) {
        addGuestsBatch(parsedGuests);
        setFeedback(`${parsedGuests.length} huésped(es) añadido(s) correctamente.`);
        setPastedData(''); // Clear textarea on success
      } else {
        setError("No se pudieron analizar datos de huéspedes válidos. Por favor, comprueba el formato (Habitación, Nombre, Régimen). Cada huésped debe estar en una nueva línea.");
      }
    } catch (e) {
      console.error("Error parsing guest data:", e);
      let message = "Ocurrió un error inesperado al analizar los datos. Por favor, revisa la consola para más detalles.";
      if (e instanceof Error) {
        message = e.message;
      }
      setError(message);
    }
  };
  
  const handleClearAll = () => {
     if (window.confirm("¿Estás seguro de que quieres eliminar todos los huéspedes? Esta acción no se puede deshacer.")) {
        clearGuests();
        setFeedback("Todos los huéspedes han sido eliminados.");
      }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Importar Datos de Huéspedes</h1>
        <p className="mt-2 text-sm text-gray-600">
          Pega los datos de los huéspedes desde un archivo de texto o una hoja de cálculo. Cada línea debe contener: Número de Habitación, Nombre del Huésped y Régimen (ej: TI, MP, HD, BB, RO).
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <label htmlFor="pasted-data" className="block text-sm font-medium text-gray-700 mb-2">
          Pega los Datos Aquí:
        </label>
        <textarea
          id="pasted-data"
          rows={10}
          className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-gray-200 dark:placeholder-gray-400 dark:border-slate-600"
          value={pastedData}
          onChange={(e) => setPastedData(e.target.value)}
          placeholder={"101 Juan Pérez TI\n102 Ana García MP\n..."}
          aria-label="Pega los datos de los huéspedes aquí"
        />
        <button
          onClick={handleProcessData}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <PlusCircleIcon className="w-5 h-5" />
          <span>Procesar y Añadir Huéspedes</span>
        </button>

        {error && <p className="mt-3 text-sm text-red-600 bg-red-100 p-3 rounded-md" role="alert">{error}</p>}
        {feedback && <p className="mt-3 text-sm text-green-600 bg-green-100 p-3 rounded-md" role="status">{feedback}</p>}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Lista de Huéspedes ({guests.length})</h2>
          {guests.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center space-x-2 text-sm"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Borrar Todo</span>
            </button>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {guests.length === 0 ? (
            <p className="text-center text-gray-500 p-8">Aún no se han importado huéspedes.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hab. #</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Huésped</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Régimen</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Eliminar</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {guests.map((guest) => (
                    <tr key={guest.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{guest.roomNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guest.guestName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guest.mealPlanRegime}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => deleteGuest(guest.id)}
                          className="text-red-600 hover:text-red-900"
                          title={`Eliminar huésped ${guest.guestName}`}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportDataPage;