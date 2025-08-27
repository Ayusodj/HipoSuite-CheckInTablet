import React, { useState } from 'react';
import { SidebarSettings, NavItemConfigData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { FolderIcon, EyeIcon, EyeSlashIcon, FolderPlusIcon } from '../components/icons/Icons';
import { useAppearance } from '../contexts/AppearanceContext';
import { NavItem } from '../App';

interface AjustesPageProps {
  navItems: NavItem[];
  setNavItems: React.Dispatch<React.SetStateAction<NavItem[]>>;
  sidebarSettings: SidebarSettings;
  setSidebarSettings: React.Dispatch<React.SetStateAction<SidebarSettings>>;
}

const AjustesPage: React.FC<AjustesPageProps> = ({ navItems, setNavItems, sidebarSettings, setSidebarSettings }) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const handleSettingChange = (setting: keyof SidebarSettings, value: any) => {
    setSidebarSettings(prev => ({ ...prev, [setting]: value }));
  };

  const findItemAndContainingArray = (items: NavItem[], itemId: string): { item: NavItem; container: NavItem[]; index: number } | null => {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.id === itemId) {
            return { item, container: items, index: i };
        }
        if (item.type === 'folder' && item.children) {
            const found = findItemAndContainingArray(item.children, itemId);
            if (found) {
                return found;
            }
        }
    }
    return null;
};

  const deepCopyNavItems = (items: NavItem[]): NavItem[] => {
    return items.map(item => ({
        ...item,
        ...(item.children && { children: deepCopyNavItems(item.children) })
    }));
  };

  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ targetId: string; position: 'before' | 'after' | 'inside' } | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLElement>, item: NavItem) => {
    setDraggedItemId(item.id);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };

    const handleDragOver = (e: React.DragEvent<HTMLElement>, item: NavItem) => {
        e.preventDefault();
        if (!draggedItemId || draggedItemId === item.id) {
            setDropIndicator(null);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const draggedItemNodeResult = findItemAndContainingArray(navItems, draggedItemId);
        const draggedItemNode = draggedItemNodeResult?.item;

        if (draggedItemNode?.type === 'folder') {
            const isDescendant = (parent: NavItem, childId: string): boolean => {
                return parent.children?.some(child => child.id === childId || (child.type === 'folder' && isDescendant(child, childId))) || false;
            };
            if (draggedItemNode.id === item.id || isDescendant(draggedItemNode, item.id)) {
                setDropIndicator(null);
                return;
            }
        }

        const dropPoint = e.clientY - rect.top;
        const dimension = rect.height;
        const dropThreshold = dimension * 0.25;

        if (item.type === 'folder' && dropPoint > dropThreshold && dropPoint < dimension - dropThreshold) {
            setDropIndicator({ targetId: item.id, position: 'inside' });
        } else {
            if (dropPoint < dimension / 2) {
                setDropIndicator({ targetId: item.id, position: 'before' });
            } else {
                setDropIndicator({ targetId: item.id, position: 'after' });
            }
        }
    };

  const handleDragLeave = () => {
    setDropIndicator(null);
  };

    const handleDrop = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        if (!draggedItemId || !dropIndicator) {
            setDraggedItemId(null);
            setDropIndicator(null);
            return;
        }

        const { targetId, position } = dropIndicator;
        if (targetId === draggedItemId) return;

        setNavItems(currentItems => {
            const newItems = deepCopyNavItems(currentItems);
            
            const draggedResult = findItemAndContainingArray(newItems, draggedItemId);
            if (!draggedResult) return currentItems;
            
            const { item: draggedItem, container: sourceContainer, index: draggedIndex } = draggedResult;
            sourceContainer.splice(draggedIndex, 1);

            const targetResult = findItemAndContainingArray(newItems, targetId);
            if (!targetResult) {
                 sourceContainer.splice(draggedIndex, 0, draggedItem);
                 return newItems;
            }
            const { item: targetItem, container: targetContainer, index: targetIndex } = targetResult;

            if (position === 'inside') {
                if (targetItem.type === 'folder') {
                    targetItem.children = targetItem.children || [];
                    targetItem.children.push(draggedItem);
                } else {
                    sourceContainer.splice(draggedIndex, 0, draggedItem);
                }
            } else {
                const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
                targetContainer.splice(insertIndex, 0, draggedItem);
            }
            
            return newItems;
        });

        setDraggedItemId(null);
        setDropIndicator(null);
    };

  const toggleVisibility = (itemId: string) => {
    const toggleRecursively = (items: NavItem[]): NavItem[] => {
        return items.map(item => {
            if (item.id === itemId) {
                return { ...item, visible: !item.visible };
            }
            if (item.children) {
                return { ...item, children: toggleRecursively(item.children) };
            }
            return item;
        });
    };
    setNavItems(currentItems => toggleRecursively(currentItems));
  };
  
  const handleAddFolder = () => {
    const folderName = prompt("Introduce el nombre de la nueva carpeta:");
    if (folderName && folderName.trim() !== '') {
        const newFolder: NavItem = {
          id: uuidv4(),
          type: 'folder',
          label: folderName.trim(),
          path: '', 
          icon: FolderIcon,
          visible: true,
          children: [],
          isOpen: true,
          component: <></>
        };
        setNavItems(currentItems => [...currentItems, newFolder]);
    }
  };

  const renderNavItemForEdit = (item: NavItem): React.ReactNode => {
    const itemContent = (
      <>
        <item.icon className="h-5 w-5 flex-shrink-0" />
        <span className="ml-3 truncate">{item.label}</span>
      </>
    );

    const dragDropContainerClasses = `relative ${dropIndicator?.targetId === item.id ? 'opacity-50' : ''}`;
    const dropIndicatorBefore = dropIndicator?.targetId === item.id && dropIndicator.position === 'before' && <div className="absolute -top-1 left-0 right-0 h-1 bg-blue-500 rounded-full z-10"></div>;
    const dropIndicatorAfter = dropIndicator?.targetId === item.id && dropIndicator.position === 'after' && <div className="absolute -bottom-1 left-0 right-0 h-1 bg-blue-500 rounded-full z-10"></div>;
    const dropIndicatorInside = dropIndicator?.targetId === item.id && dropIndicator.position === 'inside' && <div className="absolute inset-0 border-2 border-dashed border-blue-500 rounded-md z-10"></div>;

    return (
        <div key={item.id} className={dragDropContainerClasses}>
            {dropIndicatorBefore}
            <div
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onDragOver={(e) => handleDragOver(e, item)}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex items-center group p-2 rounded-md my-1 bg-gray-200 dark:bg-slate-600 cursor-move ${!item.visible ? 'opacity-40' : ''}`}
            >
                {itemContent}
                <div className="ml-auto flex items-center">
                    <button onClick={() => toggleVisibility(item.id)} className="p-1 opacity-50 hover:opacity-100" title={item.visible ? 'Ocultar' : 'Mostrar'}>
                        {item.visible ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            {dropIndicatorInside}
            {item.type === 'folder' && item.children && (
                <div className="pl-4 border-l-2 border-gray-300 dark:border-slate-500">
                    {item.children.map(child => renderNavItemForEdit(child))}
                </div>
            )}
            {dropIndicatorAfter}
        </div>
    );
  };

  const saveSettings = () => {
    const mapToConfig = (items: NavItem[]): NavItemConfigData[] => {
        return items.map(item => ({
            id: item.id,
            type: item.type,
            label: item.type === 'folder' ? item.label : undefined,
            visible: item.visible,
            children: item.children ? mapToConfig(item.children) : undefined,
            isOpen: item.isOpen
        }));
    };

    try {
        const navConfig = mapToConfig(navItems);
        localStorage.setItem(`navItemsConfig_default_user`, JSON.stringify(navConfig));
        localStorage.setItem(`sidebarSettings_default_user`, JSON.stringify(sidebarSettings));
        alert('Ajustes guardados con éxito!');
        setIsEditMode(false);
    } catch (error) {
        console.error("Error saving settings:", error);
        alert('Hubo un error al guardar los ajustes.');
    }
  };

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl h-full text-gray-800 dark:text-gray-200 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6">Ajustes</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna de Ajustes de Interfaz */}
        <div className="lg:col-span-1 space-y-6">
          <AppearanceControls />
          <section>
            <h2 className="text-xl font-semibold border-b border-gray-300 dark:border-slate-600 pb-2 mb-4">Personalización de la Interfaz</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="sidebar-pos" className="block text-sm font-medium">Posición de la Barra Lateral</label>
                <div className="styled-select-container mt-1">
                  <select id="sidebar-pos" value={sidebarSettings.position} onChange={e => handleSettingChange('position', e.target.value)} className="block w-full p-2 border border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 styled-select-global">
                    <option value="left">Izquierda</option>
                    <option value="right">Derecha</option>
                    <option value="top">Superior</option>
                    <option value="bottom">Inferior</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="sidebar-display" className="block text-sm font-medium">Modo de Visualización</label>
                <div className="styled-select-container mt-1">
                  <select id="sidebar-display" value={sidebarSettings.displayMode} onChange={e => handleSettingChange('displayMode', e.target.value)} className="block w-full p-2 border border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 styled-select-global">
                    <option value="icons-and-text">Iconos y Texto</option>
                    <option value="icons-only">Solo Iconos</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="sidebar-icons" className="block text-sm font-medium">Tamaño de Iconos</label>
                <div className="styled-select-container mt-1">
                  <select id="sidebar-icons" value={sidebarSettings.iconSize} onChange={e => handleSettingChange('iconSize', e.target.value)} className="block w-full p-2 border border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 styled-select-global">
                    <option value="small">Pequeño</option>
                    <option value="medium">Mediano</option>
                    <option value="large">Grande</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold border-b border-gray-300 dark:border-slate-600 pb-2 mb-4">Conexiones de Cuenta</h2>
            <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Calendario de Google</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sincroniza tus eventos de Google Calendar.</p>
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center">
                  Conectar
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Columna de Edición de Menú */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold border-b border-gray-300 dark:border-slate-600 pb-2 mb-4">Editar Menú de Navegación</h2>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isEditMode ? "Arrastra y suelta para reordenar. Usa los iconos para mostrar/ocultar." : "Activa el modo edición para modificar el menú."}
            </p>
            <button onClick={() => setIsEditMode(!isEditMode)} className={`px-4 py-2 rounded-md text-white transition-colors ${isEditMode ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              {isEditMode ? 'Salir del Modo Edición' : 'Activar Modo Edición'}
            </button>
          </div>

          {isEditMode && (
            <div className="p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50">
              <div className="mb-4">
                  <button onClick={handleAddFolder} className="w-full flex items-center justify-center p-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                      <FolderPlusIcon className="w-5 h-5 mr-2" />
                      Añadir Nueva Carpeta
                  </button>
              </div>
              <div className="max-h-[50vh] overflow-y-auto pr-2">
                {navItems.map(item => renderNavItemForEdit(item))}
              </div>
              <button onClick={saveSettings} className="mt-6 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-bold">
                Guardar Cambios del Menú
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AppearanceControls: React.FC = () => {
  const { appearance, setAppearance } = useAppearance();

  const palette = ['#004A4A', '#0B6B6B', '#00B1A9', '#053F3F', '#F3F4F6', '#FFFFFF', '#1F2937', '#6B7280', '#2F2F2F', '#000000'];
  const [target, setTarget] = useState<'pageBg'|'sidebarBg'|'selectedBg'|'hoverBg'|'textColor'|'buttonBg'|'selectedButtonBg'>('pageBg');
  const colorInputRef = React.useRef<HTMLInputElement | null>(null);

  const styledSelectClass = 'mt-1 block w-full p-2 rounded-md';
  const styledSelectStyle: React.CSSProperties = { background: '#2F2F2F', color: '#FFFFFF', border: '1px solid #3B3B3B' };

  const openColorPicker = () => {
    colorInputRef.current?.click();
  };

  const handleCustomColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAppearance({ [target]: value } as any);
  };

  return (
    <section>
      <h2 className="text-xl font-semibold border-b border-gray-300 dark:border-slate-600 pb-2 mb-4">Apariencia</h2>
      <div className="space-y-3">
        {/* Reemplazamos los inputs tipo color por desplegables que usan la paleta */}
  {/* Se eliminaron los desplegables individuales de color; solo se mantiene el tamaño de letra y el selector objetivo de la paleta */}

        <div>
          <label className="block text-sm font-medium">Tamaño de letra</label>
          <div className="mt-2 flex items-center space-x-2">
            <div className="styled-select-container">
              <select value={appearance.textSize} onChange={e => setAppearance({ textSize: e.target.value })} className="p-2 border rounded-md styled-select-global">
                {['14px','16px','18px','20px'].map((size, idx) => (
                  <option key={size} value={size} style={{ background: palette[idx] ?? '#2F2F2F', color: '#FFFFFF' }}>
                    {size === '14px' ? 'Pequeño' : size === '16px' ? 'Normal' : size === '18px' ? 'Grande' : 'Muy grande'}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm ml-2">{appearance.textSize}</div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Paleta rápida</label>
          <div className="mt-2 flex items-center space-x-2">
            <div className="styled-select-container">
              <select value={target} onChange={e => setTarget(e.target.value as any)} className={`styled-select-global ${styledSelectClass}`} style={styledSelectStyle}>
                <option value="pageBg">Fondo web</option>
                <option value="sidebarBg">Fondo barra</option>
                <option value="selectedBg">Fondo seleccionado</option>
                <option value="selectedButtonBg">Botones seleccionados</option>
                <option value="hoverBg">Hover</option>
                <option value="textColor">Color texto</option>
                <option value="buttonBg">Botones</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">Aplica el color seleccionado a:</div>
          </div>
            <div className="mt-2 flex flex-wrap gap-2">
            {palette.map(c => (
              <button key={c} onClick={() => {
                if (target === 'buttonBg') {
                  const luminance = (parseInt(c.slice(1,3),16)*0.2126 + parseInt(c.slice(3,5),16)*0.7152 + parseInt(c.slice(5,7),16)*0.0722)/255;
                  const textColor = luminance > 0.6 ? '#000000' : '#FFFFFF';
                  setAppearance({ buttonBg: c, buttonTextColor: textColor } as any);
                } else if (target === 'selectedButtonBg') {
                  const luminance = (parseInt(c.slice(1,3),16)*0.2126 + parseInt(c.slice(3,5),16)*0.7152 + parseInt(c.slice(5,7),16)*0.0722)/255;
                  const textColor = luminance > 0.6 ? '#000000' : '#FFFFFF';
                  setAppearance({ selectedButtonBg: c, buttonTextColor: textColor } as any);
                } else {
                  setAppearance({ [target]: c } as any);
                }
              }} title={`Apply ${c} to ${target}`} className="w-8 h-8 rounded-md border no-theme-button" style={{ background: c }} />
            ))}
          </div>
          {/* Manual button text color override when targeting buttons */}
          {target === 'buttonBg' && (
            <div className="mt-3">
              <label className="block text-sm font-medium">Color texto Botones (manual)</label>
              <div className="mt-2 flex items-center space-x-3">
                <input
                  type="color"
                  value={appearance.buttonTextColor || '#FFFFFF'}
                  onChange={e => setAppearance({ buttonTextColor: e.target.value } as any)}
                  className="w-10 h-10 p-0 border rounded-md no-theme-button"
                />
                <div className="text-sm text-gray-600">Sobreescribe el color de texto que calcula la paleta automáticamente.</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-2 items-center">
          {/* Render a visible color input so the native picker opens anchored to this control (same behavior as template editor) */}
          <input
            ref={colorInputRef}
            type="color"
            onChange={handleCustomColor}
            value={appearance[target as keyof typeof appearance] as string || '#000000'}
            className="w-8 h-7 rounded border-gray-300 p-0.5 bg-white cursor-pointer no-theme-button"
            aria-label="Elegir color personalizado"
          />
          <div className="text-sm text-gray-500">Abre el selector para aplicar un color personalizado al objetivo seleccionado.</div>
        </div>
      </div>
    </section>
  );
};

export default AjustesPage;
