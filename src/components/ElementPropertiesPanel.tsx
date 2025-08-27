
import React from 'react';
import { TextElement, ImageElement, Alignment, FONT_FAMILY_OPTIONS, PREDEFINED_COLORS, TextStyle } from '../types';
import { XCircleIcon } from './icons/Icons';

interface ElementPropertiesPanelProps {
  element: TextElement | ImageElement;
  onUpdateElement: (updatedElement: TextElement | ImageElement) => void;
  onClose: () => void;
}

const ConfigInput: React.FC<{ label: string; id: string; children: React.ReactNode}> = ({label, id, children}) => (
  <div className="mb-3">
    <label htmlFor={id} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);

const ElementPropertiesPanel: React.FC<ElementPropertiesPanelProps> = ({ element, onUpdateElement, onClose }) => {
  
  const handleStyleChange = (newStyle: Partial<TextStyle>) => {
    if (element.type === 'text') {
      onUpdateElement({ ...element, style: { ...element.style, ...newStyle } });
    }
  };

  if (!element) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 text-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-semibold text-gray-700">Editar Elemento de {element.type === 'text' ? 'Texto' : 'Imagen'}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <XCircleIcon className="w-5 h-5" />
        </button>
      </div>

      {element.type === 'text' && (
        <>
          <ConfigInput label="Contenido" id="el-text">
            <textarea
              id="el-text"
              value={element.text}
              onChange={(e) => onUpdateElement({ ...element, text: e.target.value })}
              rows={2}
              className="w-full p-1.5 border border-gray-300 rounded-md text-xs bg-white text-gray-900"
            />
          </ConfigInput>
          <ConfigInput label="Fuente" id="el-fontFamily">
              <div className="styled-select-container">
                <select
                  id="el-fontFamily"
                  value={element.style.fontFamily}
                  onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
                  className="styled-select-global w-full p-1.5 border border-gray-300 rounded-md text-xs bg-white text-gray-900"
                >
                  {FONT_FAMILY_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}
                </select>
              </div>
          </ConfigInput>
          <ConfigInput label="Tamaño de Fuente (px)" id="el-fontSize">
            <input
              id="el-fontSize"
              type="number"
              value={element.style.fontSize}
              onChange={(e) => handleStyleChange({ fontSize: parseInt(e.target.value, 10) || 10 })}
              className="w-full p-1.5 border border-gray-300 rounded-md text-xs bg-white text-gray-900"
            />
            <div className="styled-select-container">
              <select
                id="el-fontSize"
                value={element.style.fontSize}
                onChange={(e) => handleStyleChange({ fontSize: parseInt(e.target.value, 10) })}
                className="styled-select-global w-full p-1.5 border border-gray-300 rounded-md text-xs bg-white text-gray-900"
              >
                {[10,12,14,16,18,20,24,28,32].map(s => <option key={s} value={s}>{s}px</option>)}
              </select>
            </div>
          </ConfigInput>
           <ConfigInput label="Grosor de Fuente" id="el-fontWeight">
            <select
              id="el-fontWeight"
              value={element.style.fontWeight}
              onChange={(e) => handleStyleChange({ fontWeight: e.target.value as 'normal' | 'bold' })}
              className="styled-select-global w-full p-1.5 border border-gray-300 rounded-md text-xs bg-white text-gray-900"
            >
              <option value="normal">Normal</option>
              <option value="bold">Negrita</option>
            </select>
          </ConfigInput>
          <ConfigInput label="Color de Texto" id="el-color">
            <div className="flex space-x-1 items-center">
                {PREDEFINED_COLORS.map(color => (
                    <button key={color.value} title={color.name} onClick={() => handleStyleChange({color: color.value})}
                        className={`w-5 h-5 rounded-full border ${element.style.color === color.value ? 'ring-2 ring-offset-1 ring-offset-white ring-indigo-500' : 'border-gray-200'}`}
                        style={{ backgroundColor: color.value }}
                        aria-label={`Seleccionar color ${color.name}`}
                    />
                ))}
                <input type="color" id="el-color-picker" value={element.style.color} onChange={e => handleStyleChange({color: e.target.value})} className="w-7 h-6 rounded border-gray-300 p-0.5 bg-white"/>
            </div>
          </ConfigInput>
          <ConfigInput label="Alineación de Texto" id="el-textAlign">
            <select
              id="el-textAlign"
              value={element.style.textAlign}
              onChange={(e) => handleStyleChange({ textAlign: e.target.value as Alignment })}
              className="styled-select-global w-full p-1.5 border border-gray-300 rounded-md text-xs bg-white text-gray-900"
            >
              {Object.values(Alignment).map(align => <option key={align} value={align}>{align.charAt(0).toUpperCase() + align.slice(1)}</option>)}
            </select>
          </ConfigInput>
        </>
      )}

      {element.type === 'image' && (
        <>
          <ConfigInput label="Archivo de Imagen" id="el-imgFile">
            <input
              type="file"
              id="el-imgFile"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    if (element.type === 'image') { 
                      onUpdateElement({ ...element, src: reader.result as string });
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </ConfigInput>
          <ConfigInput label="URL de Imagen (o pegar Base64)" id="el-imgSrc">
            <input
              id="el-imgSrc"
              type="text"
              value={element.src}
              onChange={(e) => onUpdateElement({ ...element, src: e.target.value })}
              className="w-full p-1.5 border border-gray-300 rounded-md text-xs bg-white text-gray-900 placeholder-gray-400"
              placeholder="https://example.com/image.png or data:image/..."
            />
          </ConfigInput>
          <ConfigInput label="Texto Alternativo" id="el-altText">
            <input
              id="el-altText"
              type="text"
              value={element.altText || ''}
              onChange={(e) => onUpdateElement({ ...element, altText: e.target.value })}
              className="w-full p-1.5 border border-gray-300 rounded-md text-xs bg-white text-gray-900"
            />
          </ConfigInput>
          <div className="grid grid-cols-2 gap-2">
            <ConfigInput label="Ancho (%)" id="el-imgWidth">
                <input
                id="el-imgWidth"
                type="number"
                value={element.size.width}
                min="5" max="100" step="1"
                onChange={(e) => {
                    const newWidth = parseInt(e.target.value,10) || 5; 
                    if (element.type === 'image') { 
                      onUpdateElement({ ...element, size: { ...element.size, width: newWidth } });
                    }
                }}
                className="w-full p-1.5 border border-gray-300 rounded-md text-xs bg-white text-gray-900"
                />
            </ConfigInput>
            <ConfigInput label="Alto (%) o 'auto'" id="el-imgHeight">
                <input
                id="el-imgHeight"
                type="text" 
                value={element.size.height}
                onChange={(e) => {
                    const val = e.target.value;
                    const parsedNum = parseInt(val, 10);
                    let newHeight: number | 'auto';
                    if (val.toLowerCase() === 'auto') {
                        newHeight = 'auto';
                    } else if (!isNaN(parsedNum)) {
                        newHeight = Math.max(5, parsedNum); 
                    } else {
                        newHeight = typeof element.size.height === 'number' ? element.size.height : 'auto'; 
                    }

                    if (element.type === 'image') { 
                       onUpdateElement({ ...element, size: { ...element.size, height: newHeight } })
                    }
                }}
                className="w-full p-1.5 border border-gray-300 rounded-md text-xs bg-white text-gray-900"
                />
                 <button onClick={() => {if (element.type === 'image') onUpdateElement({ ...element, size: { ...element.size, height: 'auto' } })}}
                    className="mt-1 text-xs text-indigo-600 hover:underline">Alto Automático</button>
            </ConfigInput>
          </div>
        </>
      )}
    </div>
  );
};

export default ElementPropertiesPanel;
