import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDiario } from '../contexts/DiarioContext';
import { 
    ChevronLeftIcon, ChevronRightIcon, FilterIcon, EyeIcon, EyeSlashIcon, 
    StarIcon, PlusCircleIcon, TrashIcon, 
    BoldIcon, ItalicIcon, UnderlineIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, ChevronDownIcon
} from '../components/icons/Icons';


// Helper to get contrast color for text against a hex background
const getContrastColor = (hexcolor: string): string => {
    if (!hexcolor) return '#000000';
    if (hexcolor.startsWith('#')) {
        hexcolor = hexcolor.slice(1);
    }
    if (hexcolor.length === 3) {
        hexcolor = hexcolor.split('').map(char => char + char).join('');
    }
    if (hexcolor.length !== 6) {
        return '#000000';
    }
    const r = parseInt(hexcolor.substring(0, 2), 16);
    const g = parseInt(hexcolor.substring(2, 4), 16);
    const b = parseInt(hexcolor.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
};

// Helper to convert rgb(r, g, b) or rgba string to #RRGGBB hex format or 'transparent'
const rgbToHex = (rgb: string): string => {
    if (!rgb || typeof rgb !== 'string') return '#000000';
    if (rgb.startsWith('#')) return rgb;

    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if (!match) return '#000000';

    if (match[4] && parseFloat(match[4]) === 0) {
        return 'transparent';
    }
    
    const toHex = (c: string) => ('0' + parseInt(c, 10).toString(16)).slice(-2);
    return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
};


// --- FONT SIZE SELECTOR (CUSTOM DROPDOWN) ---
const FontSizeSelector = () => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const fontSizes = [
        { label: '10px', value: '2' }, { label: '12px', value: '3' }, { label: '14px', value: '4' },
        { label: '18px', value: '5' }, { label: '24px', value: '6' }, { label: '32px', value: '7' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (value: string) => {
        document.execCommand('fontSize', false, value);
        setIsOpen(false);
    };
    
    // Get current font size to display on button
    const [currentSizeLabel, setCurrentSizeLabel] = useState('12');
    useEffect(() => {
        const updateCurrentSize = () => {
             let selection = window.getSelection();
             if (!selection || selection.rangeCount === 0) return;
             let parentNode = selection.getRangeAt(0).commonAncestorContainer;
             if (parentNode.nodeType !== Node.ELEMENT_NODE) {
                 parentNode = parentNode.parentNode!;
             }
             if ((parentNode as HTMLElement)?.closest('[contenteditable="true"]')) {
                const sizeValue = document.queryCommandValue('fontSize');
                const matchingSize = fontSizes.find(fs => fs.value === sizeValue);
                setCurrentSizeLabel(matchingSize ? matchingSize.label.replace('px', '') : '12');
             }
        };

        document.addEventListener('selectionchange', updateCurrentSize);
        document.addEventListener('click', updateCurrentSize);
        return () => {
            document.removeEventListener('selectionchange', updateCurrentSize);
            document.removeEventListener('click', updateCurrentSize);
        };
    }, []);

    return (
        <div ref={wrapperRef} className="relative">
            <button
                onMouseDown={e => {
                    e.preventDefault();
                    setIsOpen(prev => !prev);
                }}
                className="w-14 p-2 flex items-center justify-between border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 no-theme-button"
                title="Tamaño de letra"
            >
                <span>{currentSizeLabel}</span>
                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-1 w-24 bg-white border rounded-md shadow-lg z-20">
                    {fontSizes.map(size => (
                        <button
                            key={size.value}
                            onMouseDown={(e) => { e.preventDefault(); handleSelect(size.value); }}
                            className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 no-theme-button"
                        >
                            {size.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- COLOR PICKER DROPDOWN ---
const NoColorSwatch = () => (
    <div className="w-6 h-6 border border-gray-300 rounded-sm bg-white relative" title="Sin color">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="2" y1="22" x2="22" y2="2" stroke="#EF4444" strokeWidth="1.5"/>
        </svg>
    </div>
);

const COLOR_PALETTE = [
  '#000000', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6', '#FFFFFF',
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E',
];

const ColorPickerDropdown: React.FC<{
    command: 'foreColor' | 'backColor';
    activeColor: string;
    onColorChange: (color: string) => void;
    title: string;
    children: React.ReactNode;
}> = ({ command, activeColor, onColorChange, title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const colorInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (color: string) => {
        document.execCommand(command, false, color);
        onColorChange(color);
        setIsOpen(false);
    };

    const handleTransparent = () => {
        document.execCommand('styleWithCSS', false, 'true');
        document.execCommand(command, false, 'transparent');
        onColorChange('#ffffff'); // Represent transparent as white for UI state
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <button
                onMouseDown={e => { e.preventDefault(); setIsOpen(p => !p); }}
                className="relative w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md cursor-pointer no-theme-button"
                title={title}
                style={{ backgroundColor: activeColor }}
            >
                {children}
            </button>
            {isOpen && (
                <div className="absolute top-full mt-1 bg-white border rounded-md shadow-lg z-20 p-2 w-52">
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {command === 'backColor' && (
                             <button onMouseDown={e => { e.preventDefault(); handleTransparent(); }} className="no-theme-button"><NoColorSwatch /></button>
                        )}
                        {COLOR_PALETTE.map(color => (
                            <button
                                key={color}
                                onMouseDown={e => { e.preventDefault(); handleSelect(color); }}
                                className="w-6 h-6 rounded-sm border no-theme-button"
                                style={{ backgroundColor: color }}
                                aria-label={`Select color ${color}`}
                            />
                        ))}
                    </div>
                    <button
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => colorInputRef.current?.click()}
                        className="w-full text-center p-1 text-xs border rounded hover:bg-gray-100 no-theme-button"
                    >
                        Más colores...
                    </button>
                    <input
                        ref={colorInputRef}
                        type="color"
                        value={activeColor}
                        onChange={(e) => handleSelect(e.target.value)}
                        className="absolute w-0 h-0 opacity-0"
                    />
                </div>
            )}
        </div>
    );
};


// --- UNIVERSAL TOOLBAR ---
const UniversalToolbar = () => {
    const [activeForeColor, setActiveForeColor] = useState('#000000');
    const [activeBackColor, setActiveBackColor] = useState('#ffffff');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [textAlign, setTextAlign] = useState('left');

     useEffect(() => {
        const updateToolbarState = () => {
            let selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;
            
            let parentNode = selection.getRangeAt(0).commonAncestorContainer;
            if (parentNode.nodeType !== Node.ELEMENT_NODE) {
                parentNode = parentNode.parentNode!;
             }
             if ((parentNode as HTMLElement)?.closest('[contenteditable="true"]')) {
                const foreColor = document.queryCommandValue('foreColor');
                const backColor = document.queryCommandValue('backColor');
                
                setActiveForeColor(rgbToHex(foreColor) || '#000000');

                const backColorHex = rgbToHex(backColor);
                setActiveBackColor(backColorHex === 'transparent' ? '#ffffff' : (backColorHex || '#ffffff'));

                setIsBold(document.queryCommandState('bold'));
                setIsItalic(document.queryCommandState('italic'));
                setIsUnderline(document.queryCommandState('underline'));
                
                if (document.queryCommandState('justifyCenter')) {
                    setTextAlign('center');
                } else if (document.queryCommandState('justifyRight')) {
                    setTextAlign('right');
                } else {
                    setTextAlign('left');
                }
            }
        };

        document.addEventListener('selectionchange', updateToolbarState);
        document.addEventListener('click', updateToolbarState);
        document.addEventListener('keyup', updateToolbarState);
        
        return () => {
            document.removeEventListener('selectionchange', updateToolbarState);
            document.removeEventListener('click', updateToolbarState);
            document.removeEventListener('keyup', updateToolbarState);
        };
    }, []);


    const handleCommand = (e: React.MouseEvent, command: string, value?: string) => {
        e.preventDefault();
        document.execCommand(command, false, value);
    };

    return (
        <div className="bg-white shadow rounded-md p-2 mb-2 flex items-center justify-center text-black flex-wrap gap-x-2 gap-y-2 sticky top-0 z-10">
            <FontSizeSelector />

            {/* Text Color */}
            <label
                onMouseDown={e => e.preventDefault()}
                className="relative w-8 h-8 block border border-gray-300 rounded-md cursor-pointer"
                title="Color de Texto"
                style={{ backgroundColor: activeForeColor }}
            >
                 <input
                    type="color"
                    value={activeForeColor}
                    onChange={(e) => {
                        document.execCommand('foreColor', false, e.target.value)
                        setActiveForeColor(e.target.value);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
            </label>

            {/* Background Color */}
            <ColorPickerDropdown
                command="backColor"
                activeColor={activeBackColor}
                onColorChange={setActiveBackColor}
                title="Color de Fondo de Texto"
            >
                <span
                    className="font-bold select-none"
                    style={{ color: getContrastColor(activeBackColor) }}
                >
                    a
                </span>
            </ColorPickerDropdown>

            <div className="w-px h-6 bg-gray-200 mx-1"></div>

            <div className="flex items-center gap-1">
                <button onMouseDown={e => handleCommand(e, 'bold')} className={`p-2 hover:bg-gray-200 rounded no-theme-button ${isBold ? 'bg-gray-200' : ''}`} title="Negrita"><BoldIcon className="w-4 h-4"/></button>
                <button onMouseDown={e => handleCommand(e, 'italic')} className={`p-2 hover:bg-gray-200 rounded no-theme-button ${isItalic ? 'bg-gray-200' : ''}`} title="Cursiva"><ItalicIcon className="w-4 h-4"/></button>
                <button onMouseDown={e => handleCommand(e, 'underline')} className={`p-2 hover:bg-gray-200 rounded no-theme-button ${isUnderline ? 'bg-gray-200' : ''}`} title="Subrayado"><UnderlineIcon className="w-4 h-4"/></button>
            </div>
            <div className="flex items-center gap-1">
                <button onMouseDown={e => handleCommand(e, 'justifyLeft')} className={`p-2 hover:bg-gray-200 rounded no-theme-button ${textAlign === 'left' ? 'bg-gray-200' : ''}`} title="Alinear Izquierda"><AlignLeftIcon className="w-4 h-4"/></button>
                <button onMouseDown={e => handleCommand(e, 'justifyCenter')} className={`p-2 hover:bg-gray-200 rounded no-theme-button ${textAlign === 'center' ? 'bg-gray-200' : ''}`} title="Centrar"><AlignCenterIcon className="w-4 h-4"/></button>
                <button onMouseDown={e => handleCommand(e, 'justifyRight')} className={`p-2 hover:bg-gray-200 rounded no-theme-button ${textAlign === 'right' ? 'bg-gray-200' : ''}`} title="Alinear Derecha"><AlignRightIcon className="w-4 h-4"/></button>
            </div>
        </div>
    );
};


// --- STABLE EDITABLE CELL ---
const EditableCell = React.memo(({ initialHtml, onSave, className, colSpan }: { initialHtml: string, onSave: (val: string) => void, className?: string, colSpan?: number }) => {
    const cellRef = useRef<HTMLTableCellElement>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const cell = cellRef.current;
        if (cell && !isEditing && initialHtml !== cell.innerHTML) {
            cell.innerHTML = initialHtml;
        }
    }, [initialHtml, isEditing]);

    const handleFocus = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        const cell = cellRef.current;
        if (cell) {
            let newHtml = cell.innerHTML;

            // Check if the cell is effectively empty
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newHtml;
            const textContent = (tempDiv.textContent || tempDiv.innerText || "").trim();
            const hasImages = tempDiv.querySelector('img') !== null;

            if (textContent === '' && !hasImages) {
                newHtml = ''; // Save as empty string if no real content
            }

            if (initialHtml !== newHtml) {
                onSave(newHtml);
            }
        }
    };

    return (
        <td
            ref={cellRef}
            contentEditable
            onFocus={handleFocus}
            onBlur={handleBlur}
            dangerouslySetInnerHTML={{ __html: initialHtml }}
            suppressContentEditableWarning
            className={`p-1 border border-black h-8 text-black tabular-nums ${className || ''}`}
            colSpan={colSpan}
        />
    );
});


// --- OTHER COMPONENTS ---
interface StatusCellProps { status: "Pendiente" | "OK"; onSave: (newStatus: "Pendiente" | "OK") => void; }
const StatusCell: React.FC<StatusCellProps> = ({ status, onSave }) => (
    <td className={`p-1 border border-black h-8 text-black text-center font-semibold text-xs transition-colors ${ status === 'OK' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800' }`}>
    <select value={status} onChange={e => onSave(e.target.value as "Pendiente" | "OK")} className="bg-transparent border-none outline-none w-full h-full cursor-pointer text-center styled-select-global">
            <option value="Pendiente">Pendiente</option>
            <option value="OK">OK</option>
        </select>
    </td>
);
interface PriorityCellProps { priority: number; onSave: (newPriority: number) => void; }
const PriorityCell: React.FC<PriorityCellProps> = ({ priority, onSave }) => (
    <td className="p-1 border border-black h-8">
        <div className="flex items-center justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => onSave(star)} className="p-0.5 no-theme-button" aria-label={`Set priority to ${star}`}>
                    <StarIcon
                        className={`w-4 h-4 transition-colors ${priority >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill={priority >= star ? 'currentColor' : 'none'}
                        style={{ filter: 'drop-shadow(0 0 0.6px rgba(0,0,0,0.95))' }}
                    />
                </button>
            ))}
        </div>
    </td>
);

const ImageUploader: React.FC<{ date: string; images: { id: string; src: string }[]; onAddImage: (date: string, src: string) => void; onDeleteImage: (date: string, id: string) => void; }> = ({ date, images, onAddImage, onDeleteImage }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleFile = (file: File) => { if (file?.type.startsWith('image/')) { const reader = new FileReader(); reader.onload = (e) => onAddImage(date, e.target?.result as string); reader.readAsDataURL(file); } };
    return (
        <div className="w-4/5 mx-auto">
             <div className="flex flex-col items-center gap-4 mb-4">
                {images.map(img => (
                    <div key={img.id} className="relative group max-w-full">
                        <img src={img.src} alt="Contenido del diario" className="w-full h-auto rounded-md shadow object-contain"/>
                        <button onClick={() => onDeleteImage(date, img.id)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Eliminar imagen"><TrashIcon className="w-3 h-3"/></button>
                    </div>
                ))}
            </div>
            <div onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }} onDragOver={(e) => e.preventDefault()} className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer border-gray-300 bg-gray-50 hover:border-gray-400">
                <p className="text-sm text-gray-500 mb-2">Arrastra y suelta o haz click en el + para añadir una imagen</p>
                <button onClick={() => fileInputRef.current?.click()} className="mx-auto bg-indigo-500 text-white rounded-full p-2 hover:bg-indigo-600"><PlusCircleIcon className="w-6 h-6"/></button>
                <input type="file" ref={fileInputRef} onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ''; }} accept="image/*" className="hidden" />
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
const DiarioPage: React.FC = () => {
    const { getTodaysData, updateCell, updateStatsCell, isLoading, sectionVisibility, toggleSectionVisibility, addImage, deleteImage } = useDiario();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const filterMenuRef = useRef<HTMLDivElement>(null);

    const dateString = currentDate.toISOString().split('T')[0];
    const todaysData = getTodaysData(dateString);

    const handleDateChange = (offset: number) => { setCurrentDate(prev => { const newDate = new Date(prev); newDate.setDate(newDate.getDate() + offset); return newDate; }); };
    const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.value) { const [year, month, day] = e.target.value.split('-').map(Number); setCurrentDate(new Date(year, month - 1, day)); } };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) setIsFilterMenuOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const previousDays = Array.from({ length: 10 }, (_, i) => { const d = new Date(currentDate); d.setDate(d.getDate() - (10 - i)); return d; });
    const nextDays = Array.from({ length: 10 }, (_, i) => { const d = new Date(currentDate); d.setDate(d.getDate() + i + 1); return d; });

    const sectionNames: Record<keyof typeof sectionVisibility, string> = { stats: "Estadísticas", events: "Eventos", birthdays: "Cumpleaños", roomChanges: "Cambios Habitación", dailyInfo: "Info Diaria", tasks: "Tareas", images: "Imágenes" };
    const tableStyle = { fontSize: '12px' };
    
    if (isLoading) return <div className="p-6 text-center">Cargando diario...</div>;

    return (
        <div className="flex flex-col h-full bg-gray-100 p-2">
            {/* Header */}
            <div className="bg-white shadow rounded-md p-2 mb-2 flex flex-col gap-2 flex-shrink-0">
                <div className="flex items-center justify-between text-black flex-wrap gap-2">
                    <div className="flex items-center justify-center gap-1 flex-wrap flex-grow">
                        <button onClick={() => handleDateChange(-1)} className="p-2 rounded-full hover:bg-gray-200" aria-label="Día anterior"><ChevronLeftIcon className="w-5 h-5"/></button>
                        {previousDays.map(date => (
                            <button
                                key={date.toISOString()}
                                onClick={() => setCurrentDate(date)}
                                className="w-8 h-8 rounded-full text-xs font-semibold transition-colors bg-gray-200 text-black hover:bg-gray-300"
                                aria-label={`Ir al día ${date.getDate()}`}
                            >
                                {date.getDate()}
                            </button>
                        ))}
                        <input type="date" value={dateString} onChange={handleDateInputChange} className="p-1 border rounded bg-white font-semibold text-sm mx-1"/>
                        {nextDays.map(date => (
                            <button
                                key={date.toISOString()}
                                onClick={() => setCurrentDate(date)}
                                className="w-8 h-8 rounded-full text-xs font-semibold transition-colors bg-gray-200 text-black hover:bg-gray-300"
                                aria-label={`Ir al día ${date.getDate()}`}
                            >
                                {date.getDate()}
                            </button>
                        ))}
                        <button onClick={() => handleDateChange(1)} className="p-2 rounded-full hover:bg-gray-200" aria-label="Día siguiente"><ChevronRightIcon className="w-5 h-5"/></button>
                    </div>

                    <div className="relative" ref={filterMenuRef}>
                        <button onClick={() => setIsFilterMenuOpen(p => !p)} className="p-2 rounded-md flex items-center gap-1 hover:bg-gray-200"><FilterIcon className="w-4 h-4"/> <span className="text-xs">Filtros</span></button>
                        {isFilterMenuOpen && ( <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 border">
                            <ul className="py-1">
                                {(Object.keys(sectionVisibility) as Array<keyof typeof sectionVisibility>).map(key => (<li key={key}>
                                    <button onClick={() => toggleSectionVisibility(key)} className="w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-100">
                                        <span>{sectionNames[key]}</span> {sectionVisibility[key] ? <EyeIcon className="w-5 h-5 text-gray-500"/> : <EyeSlashIcon className="w-5 h-5 text-gray-400"/>}
                                    </button>
                                </li>))}
                            </ul>
                        </div> )}
                    </div>
                </div>
            </div>
            
            <UniversalToolbar />
            
            {/* Content */}
            <div className="flex-grow overflow-auto space-y-2 p-1">
                {sectionVisibility.stats && <div className="bg-white shadow rounded-md p-2">
                    <table className="w-full border-collapse text-xs text-black" style={tableStyle}>
                        <thead><tr className="bg-blue-200 text-black font-bold"><th className="border border-black p-1">% Ocup</th><th className="border border-black p-1">Ocup Pax</th><th className="border border-black p-1">Ocup. Habs.</th><th className="border border-black p-1">Entradas</th><th className="border border-black p-1">Salidas</th></tr></thead>
                        <tbody><tr>
                            <EditableCell initialHtml={todaysData.stats.ocupPct} onSave={(val) => updateStatsCell(dateString, 'ocupPct', val)} />
                            <EditableCell initialHtml={todaysData.stats.ocupPax} onSave={(val) => updateStatsCell(dateString, 'ocupPax', val)} />
                            <EditableCell initialHtml={todaysData.stats.ocupHabs} onSave={(val) => updateStatsCell(dateString, 'ocupHabs', val)} />
                            <EditableCell initialHtml={todaysData.stats.entradas} onSave={(val) => updateStatsCell(dateString, 'entradas', val)} />
                            <EditableCell initialHtml={todaysData.stats.salidas} onSave={(val) => updateStatsCell(dateString, 'salidas', val)} />
                        </tr></tbody>
                    </table>
                </div>}

                {sectionVisibility.events && <div className="bg-white shadow rounded-md p-2">
                    <table className="w-full border-collapse text-xs text-black" style={tableStyle}>
                        <thead><tr className="bg-orange-300 text-black font-bold"><th colSpan={4} className="border border-black p-1">Grupos / Eventos / Banquetes</th></tr><tr className="bg-orange-200 text-black font-semibold"><th className="border border-black p-1 w-[20%]">Evento / Grupo</th><th className="border border-black p-1 w-[15%]">Cuándo</th><th className="border border-black p-1 w-[20%]">Dónde</th><th className="border border-black p-1 w-[45%]">Qué</th></tr></thead>
                        <tbody>{todaysData.events.map((item, index) => <tr key={item.id}>
                            <EditableCell initialHtml={item.group} onSave={val => updateCell(dateString, 'events', index, 'group', val)} />
                            <EditableCell initialHtml={item.when} onSave={val => updateCell(dateString, 'events', index, 'when', val)} />
                            <EditableCell initialHtml={item.where} onSave={val => updateCell(dateString, 'events', index, 'where', val)} />
                            <EditableCell initialHtml={item.what} onSave={val => updateCell(dateString, 'events', index, 'what', val)} />
                        </tr>)}</tbody>
                    </table>
                </div>}

                {sectionVisibility.birthdays && <div className="bg-white shadow rounded-md p-2">
                    <table className="w-full border-collapse text-xs text-black" style={tableStyle}>
                        <thead>
                            <tr className="bg-yellow-400 text-black font-bold">
                                <th colSpan={4} className="border border-black p-1">Cumpleaños del día</th>
                            </tr>
                            <tr className="text-black font-semibold">
                                <th className="border border-black p-1 w-[25%] bg-white"></th>
                                <th className="border border-black p-1 w-[30%] bg-yellow-300">Nombre</th>
                                <th className="border border-black p-1 w-[20%] bg-yellow-300">Hab.</th>
                                <th className="border border-black p-1 w-[25%] bg-white"></th>
                            </tr>
                        </thead>
                        <tbody>{todaysData.birthdays.map((item, index) => <tr key={item.id}>
                            <EditableCell initialHtml={item.extra1} onSave={val => updateCell(dateString, 'birthdays', index, 'extra1', val)} />
                            <EditableCell initialHtml={item.name} onSave={val => updateCell(dateString, 'birthdays', index, 'name', val)} />
                            <EditableCell initialHtml={item.room} onSave={val => updateCell(dateString, 'birthdays', index, 'room', val)} />
                            <EditableCell initialHtml={item.extra2} onSave={val => updateCell(dateString, 'birthdays', index, 'extra2', val)} />
                        </tr>)}</tbody>
                    </table>
                </div>}

                {sectionVisibility.roomChanges && <div className="bg-white shadow rounded-md p-2">
                    <table className="w-full border-collapse text-xs text-black" style={tableStyle}>
                         <thead><tr className="bg-green-300 text-black font-bold"><th colSpan={5} className="border border-black p-1">Cambios de habitación</th></tr><tr className="bg-green-200 text-black font-semibold"><th className="border border-black p-1 w-[20%]">Nombre</th><th className="border border-black p-1 w-[10%]">Desde</th><th className="border border-black p-1 w-[10%]">Hacia</th><th className="border border-black p-1 w-[50%]">Motivo</th><th className="border border-black p-1 w-[10%]">Estado</th></tr></thead>
                        <tbody>{todaysData.roomChanges.map((item, index) => <tr key={item.id}>
                            <EditableCell initialHtml={item.name} onSave={val => updateCell(dateString, 'roomChanges', index, 'name', val)} />
                            <EditableCell initialHtml={item.from} onSave={val => updateCell(dateString, 'roomChanges', index, 'from', val)} />
                            <EditableCell initialHtml={item.to} onSave={val => updateCell(dateString, 'roomChanges', index, 'to', val)} />
                            <EditableCell initialHtml={item.reason} onSave={val => updateCell(dateString, 'roomChanges', index, 'reason', val)} />
                            <StatusCell status={item.status} onSave={val => updateCell(dateString, 'roomChanges', index, 'status', val)} />
                        </tr>)}</tbody>
                    </table>
                </div>}

                {sectionVisibility.dailyInfo && <div className="bg-white shadow rounded-md p-2">
                    <table className="w-full border-collapse text-xs text-black" style={tableStyle}>
                        <thead><tr className="bg-gray-400 text-black font-bold"><th className="border border-black p-1">Info Diaria</th></tr></thead>
                        <tbody>
                            {todaysData.dailyInfo.map((item, index) => (
                                <tr key={item.id}>
                                    <EditableCell 
                                        initialHtml={item.content} 
                                        onSave={val => updateCell(dateString, 'dailyInfo', index, 'content', val)} 
                                        className="min-h-[28px] align-top"
                                    />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>}

                {sectionVisibility.tasks && <div className="bg-white shadow rounded-md p-2">
                     <table className="w-full border-collapse text-xs text-black" style={tableStyle}>
                        <thead><tr className="bg-blue-300 text-black font-bold"><th colSpan={4} className="border border-black p-1">Lista de Tareas</th></tr><tr className="bg-blue-200 text-black font-semibold"><th className="border border-black p-1 w-[15%]">Prioridad</th><th className="border border-black p-1 w-[60%]">Tarea</th><th className="border border-black p-1 w-[15%]">Notificador</th><th className="border border-black p-1 w-[10%]">Estado</th></tr></thead>
                        <tbody>{todaysData.tasks.map((item, index) => <tr key={item.id}>
                            <PriorityCell priority={item.priority} onSave={val => updateCell(dateString, 'tasks', index, 'priority', val)} />
                            <EditableCell initialHtml={item.task} onSave={val => updateCell(dateString, 'tasks', index, 'task', val)} />
                            <EditableCell initialHtml={item.notifier} onSave={val => updateCell(dateString, 'tasks', index, 'notifier', val)} />
                            <StatusCell status={item.status} onSave={val => updateCell(dateString, 'tasks', index, 'status', val)} />
                        </tr>)}</tbody>
                    </table>
                </div>}
                
                {sectionVisibility.images && <div className="bg-white shadow rounded-md p-2">
                    <h3 className="text-center font-bold text-black mb-2">Imágenes</h3>
                    <ImageUploader date={dateString} images={todaysData.images} onAddImage={addImage} onDeleteImage={deleteImage} />
                </div>}
            </div>
        </div>
    );
};

export default DiarioPage;
