
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useTemplates } from '../../contexts/TemplateContext'; 
import { CardTemplate } from '../../types'; 
import RenderedCard from '../../components/RenderedCard'; 
import { PlusCircleIcon, EditIcon, TrashIcon, FileDownloadIcon } from '../../components/icons/Icons'; 

const DesignPage: React.FC = () => {
  const { templates, deleteTemplate, duplicateTemplate } = useTemplates();
  const navigate = ReactRouterDOM.useNavigate();

  const handleCreateNewTemplate = () => {
    navigate('create-template'); 
  };

  const handleEditTemplate = (templateId: string) => {
    navigate(`edit-template/${templateId}`); 
  };

  const handleDuplicateTemplate = (templateId: string) => {
    const newDupTemplate = duplicateTemplate(templateId);
    if (newDupTemplate) {
      navigate(`edit-template/${newDupTemplate.id}`); 
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Plantillas de Tarjetas</h1>
        <button
          onClick={handleCreateNewTemplate}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <PlusCircleIcon className="w-5 h-5" />
          <span>Crear Nueva Plantilla</span>
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay plantillas</h3>
          <p className="mt-1 text-sm text-gray-500">Empieza creando una nueva plantilla.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl">
              <div className="p-2 bg-gray-50 flex justify-center items-center aspect-[148/105]">
                 <RenderedCard
                    template={template}
                    cardScale={0.55} 
                    hideDecorativeElements={false} 
                  />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">{template.name}</h3>
                {template.notes && <p className="text-sm text-gray-500 mt-1 truncate">{template.notes}</p>}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  onClick={() => handleDuplicateTemplate(template.id)}
                  title="Duplicar Plantilla"
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors no-theme-button"
                >
                  <FileDownloadIcon className="w-5 h-5 transform rotate-180" />
                </button>
                 <button
                  onClick={() => handleEditTemplate(template.id)}
                  title="Editar Plantilla"
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
                >
                  <EditIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`¿Estás seguro de que quieres eliminar la plantilla "${template.name}"?`)) {
                      deleteTemplate(template.id);
                    }
                  }}
                  title="Eliminar Plantilla"
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { DesignPage };