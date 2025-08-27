import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useBalinesas } from '../contexts/BalinesasContext';
import { PrinterIcon, FileDownloadIcon, ChevronLeftIcon, ChevronRightIcon, ArrowUturnLeftIcon } from '../components/icons/Icons';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const BalinesasPage: React.FC = () => {
  const { reservations, setMultipleReservations, clearMultipleReservations, isLoading, undo, canUndo } = useBalinesas();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Filter state
  const [activeView, setActiveView] = useState<'mes' | 'hoy'>('mes');
  const [showEmptyOnly, setShowEmptyOnly] = useState(false);
  
  // Selection state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ dayIndex: number; baliIndex: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ dayIndex: number; baliIndex: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [selectionBox, setSelectionBox] = useState<{ top: number; left: number; width: number; height: number; price: number } | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cellsToUpdate, setCellsToUpdate] = useState<{day: number, month: number, year: number, bali: number}[]>([]);
  const [modalInputValue, setModalInputValue] = useState('');

  const calculatePrice = (count: number): number => {
    if (count <= 0) return 0;
    if (count === 1) return 18;
    if (count === 2) return 36;
    if (count === 3) return 40;
    if (count === 4) return 53.33;
    if (count === 5) return 55;
    if (count === 6) return 66;
    if (count === 7) return 70;
    if (count >= 8) {
      return 80 + (count - 8) * 10;
    }
    return 0; // Fallback
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const balis = useMemo(() => Array.from({ length: 18 }, (_, i) => i + 1), []);

  const getReservationKey = useCallback((dayObj: { day: number, month: number, year: number }, bali: number) => {
    const date = new Date(dayObj.year, dayObj.month, dayObj.day);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}_bali-${bali}`;
  }, []);

  const visibleDays = useMemo(() => {
    let baseDays: { day: number, month: number, year: number }[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (activeView === 'mes') {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            baseDays.push({ day, month, year });
        }
    } else { // 'hoy'
        const today = new Date();
        today.setHours(0,0,0,0);
        
        let startDate = new Date(year, month, 1);
        if(new Date(year, month, today.getDate()) > startDate) {
            startDate = today;
        }

        const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
        for (let day = startDate.getDate(); day <= daysInCurrentMonth; day++) {
            const d = new Date(year, month, day);
            d.setHours(0,0,0,0);
            if (d >= today) {
                baseDays.push({ day, month, year });
            }
        }
        
        const nextMonthDate = new Date(year, month + 1, 1);
        const daysInNextMonth = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth() + 1, 0).getDate();
        for (let day = 1; day <= daysInNextMonth; day++) {
            baseDays.push({ day, month: nextMonthDate.getMonth(), year: nextMonthDate.getFullYear() });
        }
    }
    
    if (showEmptyOnly) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const firstAvailableIndex = baseDays.findIndex(dayObj => {
            const dayDate = new Date(dayObj.year, dayObj.month, dayObj.day);
            if (dayDate < today && activeView === 'mes') return false;
            return balis.some(bali => !reservations[getReservationKey(dayObj, bali)]);
        });

        if (firstAvailableIndex === -1) {
            return [];
        }

        return baseDays.slice(firstAvailableIndex).filter(dayObj => 
            balis.some(bali => !reservations[getReservationKey(dayObj, bali)])
        );
    }
    
    return baseDays;
  }, [currentDate, activeView, showEmptyOnly, reservations, balis, getReservationKey]);


  const getDayOfWeek = (dayObj: { day: number, month: number, year: number }) => {
    return new Date(dayObj.year, dayObj.month, dayObj.day).getDay();
  };
  
  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset, 1);
      return newDate;
    });
  };
  
  const getSelectedCells = useCallback(() => {
    if (!selectionStart || !selectionEnd) return [];
    const cells = [];
    const minDayIndex = Math.min(selectionStart.dayIndex, selectionEnd.dayIndex);
    const maxDayIndex = Math.max(selectionStart.dayIndex, selectionEnd.dayIndex);
    const minBaliIndex = Math.min(selectionStart.baliIndex, selectionEnd.baliIndex);
    const maxBaliIndex = Math.max(selectionStart.baliIndex, selectionEnd.baliIndex);
    
    for (let d_idx = minDayIndex; d_idx <= maxDayIndex; d_idx++) {
      for (let b_idx = minBaliIndex; b_idx <= maxBaliIndex; b_idx++) {
        const dayObj = visibleDays[d_idx];
        const bali = balis[b_idx];
        if (dayObj && bali !== undefined) {
          cells.push({ ...dayObj, bali });
        }
      }
    }
    return cells;
  }, [selectionStart, selectionEnd, visibleDays, balis]);

  const handleMouseDown = (dayIndex: number, baliIndex: number) => {
    setIsSelecting(true);
    setSelectionStart({ dayIndex, baliIndex });
    setSelectionEnd({ dayIndex, baliIndex });
  };
  
  const handleMouseOver = (dayIndex: number, baliIndex: number) => {
    if (isSelecting) {
      setSelectionEnd({ dayIndex, baliIndex });
    }
  };

  const handleMouseUp = useCallback(() => {
    if (!isSelecting) return;

    const selectedCells = getSelectedCells();
    setIsSelecting(false);
    setSelectionBox(null);
    
    if (selectedCells.length > 0) {
      setCellsToUpdate(selectedCells);
      const firstCellKey = getReservationKey(selectedCells[0], selectedCells[0].bali);
      setModalInputValue(reservations[firstCellKey]?.roomNumber || '');
      setIsModalOpen(true);
    }
    
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [isSelecting, getSelectedCells, reservations, getReservationKey]);

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const roomNumber = modalInputValue.trim();

    if (roomNumber) {
        // When booking, only update empty cells to prevent overwriting existing reservations.
        const keysToBook = cellsToUpdate
            .filter(cell => !reservations[getReservationKey(cell, cell.bali)])
            .map(cell => getReservationKey(cell, cell.bali));
        
        if (keysToBook.length > 0) {
            setMultipleReservations(keysToBook, roomNumber);
        }
    } else {
        // When clearing a reservation, apply to all selected cells.
        const keysToClear = cellsToUpdate.map(cell => getReservationKey(cell, cell.bali));
        if (keysToClear.length > 0) {
            clearMultipleReservations(keysToClear);
        }
    }

    setIsModalOpen(false);
    setCellsToUpdate([]);
    setModalInputValue('');
  };

  useEffect(() => {
    if (isSelecting && selectionStart && selectionEnd && tableRef.current) {
        const minDayIndex = Math.min(selectionStart.dayIndex, selectionEnd.dayIndex);
        const maxDayIndex = Math.max(selectionStart.dayIndex, selectionEnd.dayIndex);
        const minBaliIndex = Math.min(selectionStart.baliIndex, selectionEnd.baliIndex);
        const maxBaliIndex = Math.max(selectionStart.baliIndex, selectionEnd.baliIndex);

      const startCell = tableRef.current.querySelector(`[data-day-index="${minDayIndex}"][data-bali-index="${minBaliIndex}"]`);
      const endCell = tableRef.current.querySelector(`[data-day-index="${maxDayIndex}"][data-bali-index="${maxBaliIndex}"]`);
      
      if (startCell && endCell) {
        const tableRect = tableRef.current.getBoundingClientRect();
        const startRect = startCell.getBoundingClientRect();
        const endRect = endCell.getBoundingClientRect();
        
        const top = startRect.top - tableRect.top + tableRef.current.scrollTop;
        const left = startRect.left - tableRect.left + tableRef.current.scrollLeft;
        const width = endRect.right - startRect.left;
        const height = endRect.bottom - startRect.top;
        const price = calculatePrice(getSelectedCells().length);
        
        setSelectionBox({ top, left, width, height, price });
      }
    } else {
      setSelectionBox(null);
    }
  }, [isSelecting, selectionStart, selectionEnd, getSelectedCells]);
  
  useEffect(() => {
    const handleGlobalMouseUp = () => {
        if (isSelecting) {
            handleMouseUp();
        }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isSelecting, handleMouseUp]);

  const handlePrint = () => window.print();

  const handleExportPdf = () => {
    const doc = new (jsPDF as any)({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    doc.text(`Alquiler Balinesas - ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`, 40, 40);

    const head = [['Días', ...balis.map(b => `Bali ${b}`)]];
    const body: (string|number)[][] = [];

    visibleDays.forEach(dayObj => {
        const row: (string | number)[] = [dayObj.day];
        balis.forEach(bali => {
            const key = getReservationKey(dayObj, bali);
            row.push(reservations[key]?.roomNumber || '');
        });
        body.push(row);
    });
    
    doc.autoTable({
      head: head,
      body: body,
      startY: 50,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2, halign: 'center', valign: 'middle' },
      headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' },
      },
      didParseCell: (data: any) => {
        if (data.column.index > 0) { // Not the 'Días' column
            const dayObj = visibleDays[data.row.index];
            if (!dayObj) return;

            const bali = balis[data.column.index - 1];
            const dayOfWeek = getDayOfWeek(dayObj);
            const isTobogan = dayOfWeek === 2 && bali >= 7 && bali <= 11;
            
            if (isTobogan) {
                data.cell.styles.fillColor = [254, 240, 138];
            }
        }
      }
    });

    doc.save(`balinesas_${currentDate.getFullYear()}_${monthNames[currentDate.getMonth()]}.pdf`);
  };

  if (isLoading) {
    return <div className="p-6 text-center">Cargando...</div>;
  }
  
  const balinesasPrintStyles = `
    @media print {
        @page {
            size: A4 landscape;
            margin: 1cm;
        }
        .balinesas-page-controls, .sidebar-container {
            display: none !important;
        }
        body {
            background-color: white !important;
        }
        .balinesas-table-container {
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
            height: auto !important;
        }
        table {
            font-size: 8pt;
        }
    }
  `;

  let lastMonth: number | null = null;

  return (
    <>
      <style>{balinesasPrintStyles}</style>
      <div className="p-4 md:p-6 bg-gray-50 flex flex-col h-full">
        {/* Header */}
        <div className="balinesas-page-controls flex flex-wrap justify-between items-center mb-4 gap-4 flex-shrink-0">
            <h1 className="text-sm font-semibold text-gray-600">Alquiler Balinesas Cala Millor Park</h1>
            <div className="flex items-center gap-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-black"><ChevronLeftIcon className="w-5 h-5" /></button>
                <span className="text-xl font-bold text-gray-800 w-40 text-center">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-black"><ChevronRightIcon className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => setActiveView('mes')} className={`px-3 py-1 text-sm rounded-md ${activeView === 'mes' ? 'app-selected-bg app-button-text-color' : 'bg-white text-gray-700 border'}`}>Mes</button>
                    <button onClick={() => setActiveView('hoy')} className={`px-3 py-1 text-sm rounded-md ${activeView === 'hoy' ? 'app-selected-bg app-button-text-color' : 'bg-white text-gray-700 border'}`}>Hoy</button>
                    <button onClick={() => setShowEmptyOnly(prev => !prev)} className={`px-3 py-1 text-sm rounded-md ${showEmptyOnly ? 'app-selected-bg app-button-text-color' : 'bg-white text-gray-700 border'}`}>Vacías</button>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-300 border border-gray-400"></div>
                    <span className="text-sm font-medium text-black">Toboganes</span>
                </div>
            </div>
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onMouseDown={(e) => e.stopPropagation()}>
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                    <h3 className="text-lg font-bold mb-2">
                        {cellsToUpdate.length > 1 ? `Editar ${cellsToUpdate.length} celdas` : 'Editar celda'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Total a pagar: <span className="font-bold">{calculatePrice(cellsToUpdate.length).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                    </p>
                    <form onSubmit={handleModalSubmit}>
                        <label htmlFor="room-number-input" className="block text-sm font-medium text-gray-700">
                            Número de habitación
                        </label>
                        <input
                            id="room-number-input"
                            type="text"
                            value={modalInputValue}
                            onChange={(e) => setModalInputValue(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                            placeholder="Dejar en blanco para borrar"
                            autoFocus
                        />
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setCellsToUpdate([]);
                                    setModalInputValue('');
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Grid */}
        <div className="balinesas-table-container bg-white shadow-lg rounded-lg overflow-auto flex-grow relative" onMouseLeave={handleMouseUp}>
            <table ref={tableRef} className="min-w-full text-sm text-center border-collapse select-none">
                <thead className="sticky top-0 z-20">
                    <tr className="bg-gray-200">
                        <th className="p-2 border border-gray-300 sticky left-0 bg-gray-200 z-30 font-semibold text-black">Días</th>
                        {balis.map(bali => <th key={bali} className="p-2 border border-gray-300 min-w-[60px] bg-blue-500 text-black font-semibold">{`Bali ${bali}`}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {visibleDays.map((dayObj, dayIndex) => {
                        const dayOfWeek = getDayOfWeek(dayObj);
                        
                        const separator = lastMonth !== null && dayObj.month !== lastMonth;
                        lastMonth = dayObj.month;

                        return (
                          <React.Fragment key={`${dayObj.year}-${dayObj.month}-${dayObj.day}`}>
                            {separator && (
                              <tr><td colSpan={19} className="p-0 h-1 bg-red-500 border-none"></td></tr>
                            )}
                            <tr>
                                <td className="p-2 border border-gray-300 font-semibold sticky left-0 bg-white z-10 text-black">{dayObj.day}</td>
                                {balis.map((bali, baliIndex) => {
                                    const key = getReservationKey(dayObj, bali);
                                    const reservation = reservations[key];
                                    const isTobogan = dayOfWeek === 2 && bali >= 7 && bali <= 11;
                                    
                                    let cellClass = 'p-2 border border-gray-300 cursor-pointer h-10 transition-colors duration-100';
                                    if(showEmptyOnly && reservation){
                                        cellClass += ' bg-black';
                                    } else if (isTobogan) {
                                        cellClass += ' bg-yellow-300';
                                    } else {
                                        cellClass += ' bg-white hover:bg-blue-100';
                                    }

                                    if(reservation) {
                                      cellClass += ' font-semibold text-black';
                                    }

                                    return (
                                        <td
                                            key={bali}
                                            data-day-index={dayIndex}
                                            data-bali-index={baliIndex}
                                            onMouseDown={() => handleMouseDown(dayIndex, baliIndex)}
                                            onMouseOver={() => handleMouseOver(dayIndex, baliIndex)}
                                            className={cellClass}
                                        >
                                            {!(showEmptyOnly && reservation) && reservation?.roomNumber}
                                        </td>
                                    )
                                })}
                            </tr>
                          </React.Fragment>
                        )
                    })}
                </tbody>
            </table>
            {selectionBox && (
                <div className="absolute pointer-events-none bg-blue-500 bg-opacity-30 border-2 border-blue-600 flex items-center justify-center z-40" style={{ top: selectionBox.top, left: selectionBox.left, width: selectionBox.width, height: selectionBox.height }}>
                   <span className="bg-white text-black text-lg font-bold px-2 py-1 rounded shadow-lg">{selectionBox.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                </div>
            )}
        </div>
        
        {/* Footer */}
        <div className="balinesas-page-controls mt-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 flex-shrink-0">
            <button onClick={handlePrint} className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors flex items-center justify-center space-x-2 no-theme-button">
                <PrinterIcon className="w-5 h-5" />
                <span>Imprimir</span>
            </button>
            <button
                onClick={undo}
                disabled={!canUndo}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                <ArrowUturnLeftIcon className="w-5 h-5" />
                <span>Deshacer</span>
            </button>
            <button onClick={handleExportPdf} className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors flex items-center justify-center space-x-2 no-theme-button">
                <FileDownloadIcon className="w-5 h-5" />
                <span>Exportar PDF</span>
            </button>
        </div>
      </div>
    </>
  );
};

export default BalinesasPage;