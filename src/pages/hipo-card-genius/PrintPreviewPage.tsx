import React, { useState, useEffect, useMemo } from 'react';
import * as ReactDOM from 'react-dom';
import { useTemplates } from '../../contexts/TemplateContext';
import { useGuestData } from '../../contexts/GuestDataContext';
import RenderedCard from '../../components/RenderedCard';
import { PrinterIcon, CheckIcon } from '../../components/icons/Icons';

const PrintPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const printRoot = document.getElementById('print-root');
  if (!printRoot) return null;
  return ReactDOM.createPortal(children, printRoot);
};

const PrintPreviewPage: React.FC = () => {
  const { templates } = useTemplates();
  const { guests } = useGuestData();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedGuestIds, setSelectedGuestIds] = useState<Set<string>>(new Set());
  const [isPrinting, setIsPrinting] = useState(false);

  const selectedTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedTemplateId);
  }, [templates, selectedTemplateId]);

  useEffect(() => {
    if (!selectedTemplateId && templates.length > 0) {
      setSelectedTemplateId(templates[0].id);
    }
    if (guests.length > 0) {
      setSelectedGuestIds(new Set(guests.map(g => g.id)));
    } else {
      setSelectedGuestIds(new Set());
    }
  }, [templates, guests, selectedTemplateId]);

  useEffect(() => {
    if (isPrinting) {
      window.print();
      setIsPrinting(false);
    }
  }, [isPrinting]);


  const handleToggleGuestSelection = (guestId: string) => {
    setSelectedGuestIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(guestId)) {
        newSet.delete(guestId);
      } else {
        newSet.add(guestId);
      }
      return newSet;
    });
  };

  const cardsToPrint = useMemo(() => {
    if (!selectedTemplate) return [];
    return guests.filter(g => selectedGuestIds.has(g.id));
  }, [guests, selectedGuestIds, selectedTemplate]);

  if (templates.length === 0) {
    return <div className="text-center py-10"><p className="text-xl text-gray-600">No hay plantillas disponibles. Por favor, crea primero una plantilla en la página 'Diseñar Tarjetas'.</p></div>;
  }
  if (guests.length === 0) {
    return <div className="text-center py-10"><p className="text-xl text-gray-600">No se encontraron datos de huéspedes. Por favor, importa los huéspedes en la página 'Importar Datos'.</p></div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-150px)]">
      {/* Left Panel: Guest Selection & Options */}
      <div className="lg:w-1/3 bg-white p-6 rounded-lg shadow-lg overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Selección y Opciones</h2>

        <div className="mb-6">
          <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Plantilla:</label>
          <div className="styled-select-container">
            <select
              id="template-select"
              value={selectedTemplateId || ''}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="styled-select-global w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
            >
              <option value="">Seleccione una plantilla</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
          {guests.map(guest => (
            <div
              key={guest.id}
              onClick={() => handleToggleGuestSelection(guest.id)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${selectedGuestIds.has(guest.id) ? 'bg-indigo-50' : ''}`}
            >
              <span className="text-sm text-gray-700">{guest.roomNumber} - {guest.guestName} - {guest.mealPlanRegime}</span>
              {selectedGuestIds.has(guest.id) && <CheckIcon className="w-5 h-5 text-indigo-600" />}
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => setIsPrinting(true)}
            disabled={cardsToPrint.length === 0}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md flex items-center justify-center space-x-2 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed no-theme-button"
          >
            <PrinterIcon className="w-5 h-5" />
            <span>Imprimir Tarjetas ({cardsToPrint.length})</span>
          </button>
        </div>
      </div>

      {/* Right Panel: Print Preview */}
      <div className="lg:w-2/3 bg-gray-200 p-6 rounded-lg shadow-inner overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Vista Previa de Impresión</h2>
        {!selectedTemplate ? (
          <p className="text-center text-gray-500">Selecciona una plantilla para ver la vista previa.</p>
        ) : cardsToPrint.length === 0 ? (
          <p className="text-center text-gray-500">Selecciona huéspedes para ver sus tarjetas.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {cardsToPrint.map((guest) => (
              <div key={`preview-${guest.id}`} className="aspect-[148/105] flex justify-center items-center">
                  <RenderedCard
                    template={selectedTemplate!}
                    guest={guest}
                    cardScale={0.55}
                    renderCardShell={true}
                    hideDecorativeElements={true}
                  />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden container for actual printing */}
      {isPrinting && (
        <PrintPortal>
          {cardsToPrint.map((guest) => (
            <div key={`print-${guest.id}`} className="print-page-container">
              {selectedTemplate && (
                <RenderedCard
                  template={selectedTemplate}
                  guest={guest}
                  cardScale={1}
                  renderCardShell={true}
                  hideDecorativeElements={true}
                />
              )}
            </div>
          ))}
        </PrintPortal>
      )}
    </div>
  );
};

export default PrintPreviewPage;