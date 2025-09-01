import React, { useState, useRef } from 'react';
import { useDesigns } from '../contexts/DesignsContext';
import { 
    ExternalLinkIcon, 
    PhotographIcon, 
    UploadIcon, 
    TrashIcon, 
    EyeIcon 
} from '../components/icons/Icons';

type ActiveTab = 'roboneo' | 'storage';

const RoboneoViewer: React.FC = () => (
    <div className="h-full w-full bg-gray-200">
        <iframe
            src="https://www.roboneo.com"
            title="Roboneo Designer"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
    </div>
);

const LocalDesignsViewer: React.FC = () => {
    const { designs, addDesign, deleteDesign, isLoading } = useDesigns();
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError(null);
        try {
            await addDesign(file);
        } catch (uploadError) {
            setError(`Error al subir la imagen: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`);
        } finally {
             if (event.target) event.target.value = '';
        }
    };

    const handleDelete = (designId: string, designName: string) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar "${designName}"?`)) return;
        deleteDesign(designId);
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Mis Diseños</h2>
                <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                    disabled={isLoading}
                >
                    <UploadIcon className="w-5 h-5" />
                    <span>Subir Imagen</span>
                </button>
            </div>
            
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

            {isLoading ? (
                <div className="flex-grow flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : designs.length === 0 ? (
                <div className="flex-grow flex justify-center items-center bg-gray-100 rounded-lg">
                    <p className="text-gray-500">No hay diseños. ¡Sube tu primera imagen!</p>
                </div>
            ) : (
                <div className="flex-grow overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {designs.map(design => (
                            <div key={design.id} className="group relative bg-white border rounded-lg shadow-sm overflow-hidden aspect-square">
                                <img src={design.dataUrl} alt={design.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex flex-col justify-between p-2">
                                    <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setPreviewUrl(design.dataUrl)} className="p-1.5 bg-white/80 rounded-full hover:bg-white text-gray-800"><EyeIcon className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(design.id, design.name)} className="p-1.5 bg-red-500/80 rounded-full hover:bg-red-500 text-white"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                    <p className="text-xs text-white font-semibold truncate bg-black/50 px-2 py-1 rounded">
                                        {design.name}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
                    <img src={previewUrl} alt="Vista previa del diseño" className="max-w-full max-h-full object-contain rounded-lg" onClick={e => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
};


const DisenosPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('roboneo');

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-2 border-b">
                        <button 
                            onClick={() => setActiveTab('roboneo')}
                            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'roboneo' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <ExternalLinkIcon className="w-5 h-5"/>
                            <span>Roboneo</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('storage')}
                            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'storage' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <PhotographIcon className="w-5 h-5"/>
                            <span>Mis Diseños</span>
                        </button>
                    </div>
                </div>
            </div>
            <main className="flex-grow overflow-hidden">
                {activeTab === 'roboneo' && <RoboneoViewer />}
                {activeTab === 'storage' && <LocalDesignsViewer />}
            </main>
        </div>
    );
};

export default DisenosPage;