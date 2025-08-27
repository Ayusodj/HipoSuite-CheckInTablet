

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVisas } from '../contexts/VisasContext'; // Corrected path
import { EditIcon, PrinterIcon, FileDownloadIcon } from '../components/icons/Icons'; // Corrected path
import { jsPDF } from 'jspdf';

// Updated formatNumber: returns "" for null/undefined, "0,00" only for 0.
const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) {
    return ''; // Display empty for null or undefined
  }
  if (isNaN(num)) {
    return ''; // Display empty for NaN
  }
  // Ensure 0 is displayed as "0,00"
  if (num === 0) {
    return '0,00';
  }
  return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseInputNumber = (value: string): number | null => {
  if (value === null || value === undefined || typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  const cleanedStr = value.replace(/[€\s]/g, ''); // Remove currency symbol and whitespace

  const numberOfCommas = (cleanedStr.match(/,/g) || []).length;
  const numberOfPeriods = (cleanedStr.match(/\./g) || []).length;

  let parsableString: string;

  if (numberOfCommas === 1 && numberOfPeriods === 0) { // e.g., "123,45"
    parsableString = cleanedStr.replace(',', '.');
  } else if (numberOfCommas === 0 && numberOfPeriods === 1) { // e.g., "123.45" (numpad case)
    parsableString = cleanedStr; // Already "123.45"
  } else if (numberOfCommas === 1 && numberOfPeriods > 0) { // e.g., "1.234,56"
    parsableString = cleanedStr.replace(/\./g, '').replace(',', '.');
  } else if (numberOfCommas === 0 && numberOfPeriods === 0) { // e.g., "1234" (integer)
    parsableString = cleanedStr;
  } else if (numberOfCommas === 0 && numberOfPeriods > 1) { // e.g., "1.234.567" (treat as integer by removing all periods)
    parsableString = cleanedStr.replace(/\./g, '');
  } else { // Invalid format (e.g., multiple commas "1,2,3", or mixed invalid "1.2.3,4")
    return null;
  }

  const num = parseFloat(parsableString);
  return isNaN(num) ? null : num;
};

const InputCell: React.FC<{
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
  ariaLabel: string;
  textAlign?: 'left' | 'center' | 'right';
  wrapperClassName?: string;
}> = ({ value, onChange, placeholder = "", className = "", ariaLabel, textAlign = 'right', wrapperClassName = "" }) => {
  const [displayValue, setDisplayValue] = React.useState(formatNumber(value));

  React.useEffect(() => {
    setDisplayValue(formatNumber(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue); // Show user's exact input while typing

    if (inputValue === "") {
      if (value !== null) { 
        onChange(null);
      }
    }
  };
  
  const handleBlur = () => {
    const parsed = parseInputNumber(displayValue);
    if (parsed !== value) { 
        onChange(parsed);
    }
    setDisplayValue(formatNumber(parsed));
  };

  const textAlignClass = `text-${textAlign}`;

  return (
    <div className={`print-hide ${wrapperClassName}`}>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={`w-full py-2 pl-1 pr-3 border border-gray-300 rounded-md ${textAlignClass} text-blue-600 font-mono bg-white focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
        />
    </div>
  );
};


const VisasPage: React.FC = () => {
  const navigate = useNavigate();
  const { config, data, updateDate, updateTpvValue, updateVisas, updateAmex, isLoading } = useVisas();

  const sumTpvSection = (tpvIds: string[]): number => {
    return tpvIds.reduce((sum, tpvId) => sum + (data.tpvValues[tpvId] || 0), 0);
  };

  const baresTpvIds = config.baresTpvs.map(tpv => tpv.id);
  const recepcionTpvIds = config.recepcionTpvs.map(tpv => tpv.id);

  const totalBares = sumTpvSection(baresTpvIds);
  const totalRecepcion = sumTpvSection(recepcionTpvIds);
  const totalBrTpv = totalBares + totalRecepcion;

  const totalCardPayments = (data.visas || 0) + (data.amex || 0);
  const diferencia = totalBrTpv - totalCardPayments;

  const handlePrint = () => {
    window.print();
  };

  const RightColumnContent = () => {
    const recepcionNumbers = config.recepcionTpvs.map(tpv => tpv.label.replace(/[^0-9]/g, '')).join('+');
    const restTpv = config.baresTpvs.find(t => t.label.includes('Rest.'));
    const salonTpv = config.baresTpvs.find(t => t.label.includes('B.Sa'));
    const piscinaTpv = config.baresTpvs.find(t => t.label.includes('B. Pi') || t.label.includes('B.Pi'));
    
    // This structure with specific class names allows for precise print styling
    return (
        <div className="print-right-column-grid-container">
            <div className="print-right-column-col">
                <p>TPV RECEPCION "{recepcionNumbers}"</p>
            </div>
            <div className="print-right-column-col">
                {restTpv && <p>TPV RESTAURANTE "{restTpv.label.replace(/[^0-9]/g, '')}"</p>}
            </div>
            <div className="print-right-column-col">
                {salonTpv && <p>TPV BAR SALÓN "{salonTpv.label.replace(/[^0-9]/g, '')}"</p>}
                {piscinaTpv && <p>{`TPV BAR PISCINA "${piscinaTpv.label.replace(/[^0-9]/g, '')}"`}</p>}
            </div>
        </div>
    );
  };


  const handleExportPdf = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 8;
    const rightPadding = 5;
    const pdfCellSidePadding = 4;
    const contentWidth = pageWidth - 2 * margin;
    const leftSectionWidth = contentWidth * 0.35; // Increased width to 35%
    
    let yPos = margin + 10;
    
    // --- LEFT SECTION (The Table) ---
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('CUADRE DE VISAS NOCTURNA', margin + leftSectionWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(data.date, margin + leftSectionWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    const headerCellHeight = 8;
    const dataCellHeight = 7;
    const lineHeight = 7;
    const headerFontSize = 10;
    const regularFontSize = 9;
    const veryLightGray = [243, 244, 246];

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);

    const tpvSectionYStart = yPos;
    const colWidth = leftSectionWidth / 2;

    doc.setFontSize(headerFontSize);
    doc.setFont(undefined, 'bold');
    doc.rect(margin, yPos, colWidth, headerCellHeight, 'S');
    doc.text('TPV BARES', margin + colWidth / 2, yPos + headerCellHeight / 1.5, { align: 'center' });
    doc.rect(margin + colWidth, yPos, colWidth, headerCellHeight, 'S');
    doc.text('TPV RECEPCIÓN', margin + colWidth + colWidth / 2, yPos + headerCellHeight / 1.5, { align: 'center' });
    doc.setFont(undefined, 'normal');
    yPos += headerCellHeight;

    doc.setFontSize(regularFontSize);
    const maxRows = Math.max(config.baresTpvs.length, config.recepcionTpvs.length);
    for (let i = 0; i < maxRows; i++) {
      const yCurrentRowContent = yPos + dataCellHeight / 1.5;
      doc.rect(margin, yPos, colWidth, dataCellHeight, 'S');
      doc.rect(margin + colWidth, yPos, colWidth, dataCellHeight, 'S');
      if (config.baresTpvs[i]) {
        doc.text(formatNumber(data.tpvValues[config.baresTpvs[i].id]), margin + 5 + pdfCellSidePadding, yCurrentRowContent);
        doc.text(config.baresTpvs[i].label, margin + 25 + pdfCellSidePadding, yCurrentRowContent, { maxWidth: colWidth - 30 - pdfCellSidePadding });
      }
      if (config.recepcionTpvs[i]) {
        doc.text(config.recepcionTpvs[i].label, margin + colWidth + 10, yCurrentRowContent, { maxWidth: colWidth - 30 - pdfCellSidePadding });
        doc.text(formatNumber(data.tpvValues[config.recepcionTpvs[i].id]), margin + 2 * colWidth - rightPadding - pdfCellSidePadding, yCurrentRowContent, { align: 'right' });
      }
      yPos += dataCellHeight;
    }
    
    // B+R TPV Row - Updated
    doc.rect(margin, yPos, leftSectionWidth, dataCellHeight, 'S');
    doc.setFontSize(headerFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('B+R TPV', margin + (leftSectionWidth * 0.8 / 2) , yPos + dataCellHeight / 1.5, { align: 'center' }); // Centered over first ~80%
    doc.setFont(undefined, 'normal');
    doc.setFontSize(regularFontSize);
    doc.text(formatNumber(totalBrTpv), margin + leftSectionWidth - rightPadding, yPos + dataCellHeight / 1.5, { align: 'right' });
    yPos += dataCellHeight + 4; // Add gap

    const threeColWidth = leftSectionWidth / 3;
    doc.setFontSize(headerFontSize);
    doc.setFont(undefined, 'bold');
    doc.rect(margin, yPos, threeColWidth, headerCellHeight, 'S');
    doc.text('AVALON', margin + threeColWidth / 2, yPos + headerCellHeight / 1.5, { align: 'center' });
    doc.rect(margin + threeColWidth, yPos, threeColWidth, headerCellHeight, 'S');
    doc.text('VISAS', margin + threeColWidth + threeColWidth / 2, yPos + headerCellHeight / 1.5, { align: 'center' });
    doc.rect(margin + 2 * threeColWidth, yPos, threeColWidth, headerCellHeight, 'S');
    doc.text('AMEX', margin + 2 * threeColWidth + threeColWidth / 2, yPos + headerCellHeight / 1.5, { align: 'center' });
    doc.setFont(undefined, 'normal');
    yPos += headerCellHeight;

    doc.setFontSize(regularFontSize);
    doc.rect(margin, yPos, threeColWidth, dataCellHeight, 'S');
    doc.rect(margin + threeColWidth, yPos, threeColWidth, dataCellHeight, 'S');
    doc.text(formatNumber(data.visas), margin + threeColWidth + (threeColWidth / 2), yPos + dataCellHeight / 1.5, { align: 'center' });
    doc.rect(margin + 2 * threeColWidth, yPos, threeColWidth, dataCellHeight, 'S');
    doc.text(formatNumber(data.amex), margin + 2 * threeColWidth + (threeColWidth / 2), yPos + dataCellHeight / 1.5, { align: 'center' });
    yPos += dataCellHeight;

    // TOTAL Row - Updated
    doc.rect(margin, yPos, leftSectionWidth, dataCellHeight, 'S'); // Single rect, no divider
    doc.setFontSize(headerFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL', margin + threeColWidth, yPos + dataCellHeight / 1.5, { align: 'center' });
    doc.setFont(undefined, 'normal');
    doc.setFontSize(regularFontSize);
    doc.setTextColor(255, 0, 0);
    doc.text(formatNumber(totalCardPayments), margin + leftSectionWidth - rightPadding, yPos + dataCellHeight / 1.5, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    yPos += dataCellHeight + 6; // Add gap

    doc.setFontSize(headerFontSize);
    doc.setFont(undefined, 'bold');
    doc.setFillColor(veryLightGray[0], veryLightGray[1], veryLightGray[2]);
    doc.rect(margin, yPos, leftSectionWidth, headerCellHeight, 'DF');
    doc.text('DIFERENCIA B+R-A', margin + colWidth, yPos + headerCellHeight / 1.5, { align: 'right' });
    doc.setFont(undefined, 'normal');
    doc.setFontSize(regularFontSize);
    if (diferencia !== 0) doc.setTextColor(255, 0, 0);
    else doc.setTextColor(0, 128, 0);
    doc.text(formatNumber(diferencia), margin + leftSectionWidth - rightPadding, yPos + headerCellHeight / 1.5, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    // --- RIGHT SECTION (The Text Phrases) ---
    const rightSideContentWidth = contentWidth * 0.65;
    const phraseColWidth = rightSideContentWidth / 3;
    const col1X = margin + leftSectionWidth + 2;
    const col2X = col1X + phraseColWidth;
    const col3X = col2X + phraseColWidth;
    let rightYPos = margin + 18;
    doc.setFontSize(10);
    
    const recepcionNumbers = config.recepcionTpvs.map(tpv => tpv.label.replace(/[^0-9]/g, '')).join('+');
    const restTpv = config.baresTpvs.find(t => t.label.includes('Rest.'));
    const salonTpv = config.baresTpvs.find(t => t.label.includes('B.Sa'));
    const piscinaTpv = config.baresTpvs.find(t => t.label.includes('B. Pi') || t.label.includes('B.Pi'));
    
    doc.text(`TPV RECEPCION "${recepcionNumbers}"`, col1X, rightYPos);
    
    if (restTpv) {
      doc.text(`TPV RESTAURANTE "${restTpv.label.replace(/[^0-9]/g, '')}"`, col2X, rightYPos);
    }
    
    if (salonTpv) {
      doc.text(`TPV BAR SALÓN "${salonTpv.label.replace(/[^0-9]/g, '')}"`, col3X, rightYPos);
    }
    if (piscinaTpv) {
      doc.text(`TPV BAR PISCINA "${piscinaTpv.label.replace(/[^0-9]/g, '')}"`, col3X, rightYPos + lineHeight);
    }
    
    doc.save(`cuadre-visas-${data.date || 'current'}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-3 text-gray-700">Cargando datos de Visas...</p>
      </div>
    );
  }
  
  const maxRows = Math.max(config.baresTpvs.length, config.recepcionTpvs.length);
  const rowsArray = Array.from({ length: maxRows });

  const visasPrintStyles = `
    .print-hide { display: block; }
    .print-show { display: none; }
    
    @media print {
      @page {
        size: A4 landscape;
        margin: 0mm;
      }
      html, body {
        background: transparent !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        font-size: 10pt;
      }
      .visas-page-print-wrapper {
        background-color: transparent !important;
        padding: 5mm !important;
        margin: 0 !important;
      }
      .sidebar-container, 
      .visas-page-controls {
        display: none !important;
      }
      #print-content-wrapper {
        display: flex !important;
        flex-direction: row !important;
        justify-content: flex-start;
        align-items: flex-start;
        width: 100%;
        gap: 10mm;
      }
      .print-left-column { 
        width: 35% !important; 
        flex-shrink: 0;
      }
      .print-right-column {
        display: block !important;
        width: 60% !important;
        padding-top: 40px !important;
        font-size: 11pt;
      }
      .print-right-column-grid-container {
        display: flex !important;
        flex-direction: row !important;
        justify-content: space-between !important;
        align-items: flex-start !important;
        gap: 10px;
        width: 100%;
      }
      .print-right-column-col {
        flex: 1;
        padding: 0 5px;
      }
      .print-right-column-col p {
        margin-bottom: 8px;
      }
      #visas-form-content {
         box-shadow: none !important;
         border: none !important;
         padding: 0 !important;
         background: transparent !important;
      }
      #visas-form-content * {
        background: transparent !important;
        color: #000 !important;
        text-shadow: none !important;
        box-shadow: none !important;
        border-color: #000 !important;
      }
      .print-hide {
        display: none !important;
      }
      .print-show {
        display: block !important;
      }
      .print-text-red { font-weight: bold; }
      .print-text-green { font-weight: bold; }
      .bg-gray-100 { background-color: #f3f4f6 !important; }
    }
  `;


  return (
    <>
    <style>{visasPrintStyles}</style>
    <div className="visas-page-print-wrapper p-4 md:p-6 bg-white min-h-full">
      <div className="visas-page-controls flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Cuadre de Visas</h1>
          <button
            onClick={() => navigate('/visas/configure')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-2 no-theme-button"
          >
          <EditIcon className="w-5 h-5" />
          <span>Modificar TPVs</span>
        </button>
      </div>
      
      <div id="print-content-wrapper">
        <div className="print-left-column">
          <div className="bg-white shadow-xl rounded-lg p-4 md:p-6" id="visas-form-content">
            <div className="flex flex-col items-center mb-4 pb-2 border-b-2 border-black">
              <h2 className="text-xl font-bold text-gray-700 print-bold">CUADRE DE VISAS NOCTURNA</h2>
              <div className="flex items-center space-x-2 mt-2">
                <label htmlFor="visas-date" className="text-sm font-medium text-gray-700">DIA:</label>
                <input
                  type="date"
                  id="visas-date"
                  value={data.date}
                  onChange={(e) => updateDate(e.target.value)}
                  className="p-1 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-0 border-2 border-black">
              <div className="print-header-bg-no-fill col-span-1 py-2 px-1 text-center font-bold text-gray-700 border-b-2 border-black border-r-2 print-bold">TPV BARES</div>
              <div className="print-header-bg-no-fill col-span-1 py-2 px-1 text-center font-bold text-gray-700 border-b-2 border-black print-bold">TPV RECEPCIÓN</div>

              {rowsArray.map((_, rowIndex) => (
                <React.Fragment key={`tpv-row-${rowIndex}`}>
                  <div className={`py-2 pl-4 pr-1 border-b border-black border-r-2 flex items-center space-x-2`}>
                    {config.baresTpvs[rowIndex] ? (
                      <>
                        <div className="w-2/5">
                            <InputCell value={data.tpvValues[config.baresTpvs[rowIndex].id] || null} onChange={(val) => updateTpvValue(config.baresTpvs[rowIndex].id, val)} ariaLabel={`Importe ${config.baresTpvs[rowIndex].label}`} />
                            <span className="print-show text-left pl-2 font-mono">{formatNumber(data.tpvValues[config.baresTpvs[rowIndex].id] || null)}</span>
                        </div>
                        <span className="w-3/5 text-sm text-gray-700 truncate" title={config.baresTpvs[rowIndex].label}>{config.baresTpvs[rowIndex].label}</span>
                      </>
                    ) : <div className="h-10"></div>}
                  </div>
                  <div className={`py-2 pr-4 pl-4 border-b border-black flex items-center space-x-2`}>
                    {config.recepcionTpvs[rowIndex] ? (
                      <>
                         <span className="w-3/5 text-sm text-gray-700 truncate" title={config.recepcionTpvs[rowIndex].label}>{config.recepcionTpvs[rowIndex].label}</span>
                         <div className="w-2/5">
                            <InputCell value={data.tpvValues[config.recepcionTpvs[rowIndex].id] || null} onChange={(val) => updateTpvValue(config.recepcionTpvs[rowIndex].id, val)} ariaLabel={`Importe ${config.recepcionTpvs[rowIndex].label}`} />
                            <span className="print-show text-right pr-2 font-mono">{formatNumber(data.tpvValues[config.recepcionTpvs[rowIndex].id] || null)}</span>
                        </div>
                      </>
                    ) : <div className="h-10"></div>}
                  </div>
                </React.Fragment>
              ))}
              
              <div className="col-span-2 flex items-center py-2 px-1 border-t-2 border-black">
                <div className="w-4/5 flex justify-center items-center font-bold text-gray-700 print-bold">B+R TPV</div>
                <div className="w-1/5 text-right font-bold text-blue-600 print-text-blue print-bold pr-2">{formatNumber(totalBrTpv) || '0,00'}</div>
              </div>

            </div>

            <div className="mt-4 grid grid-cols-12 gap-x-0 border-2 border-black">
                <div className="col-span-4 py-2 px-1 font-bold text-center text-gray-700 border-b-2 border-black border-r-2 print-bold">AVALON</div>
                <div className="col-span-4 py-2 px-1 font-bold text-center text-gray-700 border-b-2 border-black border-r-2 print-bold">VISAS</div>
                <div className="col-span-4 py-2 px-1 font-bold text-center text-gray-700 border-b-2 border-black print-bold">AMEX</div>

                <div className="col-span-4 py-2 px-1 border-r-2 border-black h-[50px] flex items-center justify-center"></div>
                <div className="col-span-4 py-2 px-1 border-r-2 border-black h-[50px] flex items-center justify-center">
                    <InputCell wrapperClassName="w-1/2" value={data.visas} onChange={updateVisas} ariaLabel="Importe Visas" textAlign="center"/>
                    <span className="print-show text-center font-mono">{formatNumber(data.visas)}</span>
                </div>
                <div className="col-span-4 py-2 px-1 h-[50px] flex items-center justify-center">
                    <InputCell wrapperClassName="w-1/2" value={data.amex} onChange={updateAmex} ariaLabel="Importe AMEX" textAlign="center"/>
                    <span className="print-show text-center font-mono">{formatNumber(data.amex)}</span>
                </div>
                
                <div className="col-span-8 py-2 px-1 text-center font-bold text-gray-700 border-t-2 border-black print-bold flex justify-center items-center">TOTAL</div>
                <div className="col-span-4 py-2 px-1 text-right font-bold text-red-600 print-text-red print-bold border-t-2 border-black pr-2">
                    {formatNumber(totalCardPayments) || '0,00'}
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-0">
                <div className="print-header-bg py-2 px-1 text-right font-bold text-gray-700 bg-gray-100 print-bold">DIFERENCIA B+R-A</div>
                <div className={`print-header-bg py-2 px-1 text-right font-bold bg-gray-100 print-bold ${diferencia !== 0 ? 'text-red-600 print-text-red' : 'text-green-600 print-text-green'}`}>
                    {formatNumber(diferencia) || '0,00'}
                </div>
            </div>
          </div>
        </div>
        <div className="hidden print:block print-right-column">
            <RightColumnContent />
        </div>
      </div>


      <div className="visas-page-controls mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors flex items-center justify-center space-x-2 no-theme-button"
          >
            <PrinterIcon className="w-5 h-5" />
            <span>Imprimir</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors flex items-center justify-center space-x-2 no-theme-button"
          >
            <FileDownloadIcon className="w-5 h-5" />
            <span>Exportar PDF</span>
          </button>
        </div>

    </div>
    </>
  );
};

export default VisasPage;