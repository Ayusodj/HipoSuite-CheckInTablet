

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEfectivos, EFECTIVOS_COLOR_THEMES } from '../contexts/EfectivosContext'; 
import { EfectivosDepartmentDataInput } from '../types'; 
import { EditIcon, PrinterIcon, FileDownloadIcon } from '../components/icons/Icons';
import { jsPDF } from 'jspdf';

const formatCurrency = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0,00 €';
  }
  return num.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatCurrencyForPdf = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0,00';
  }
  return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


const parseInputNumber = (value: string): number | null => {
  if (value === null || value === undefined || typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  const cleanedStr = value.replace(/[€\s]/g, ''); 

  const numberOfCommas = (cleanedStr.match(/,/g) || []).length;
  const numberOfPeriods = (cleanedStr.match(/\./g) || []).length;

  let parsableString: string;

  if (numberOfCommas === 1 && numberOfPeriods === 0) { 
    parsableString = cleanedStr.replace(',', '.');
  } else if (numberOfCommas === 0 && numberOfPeriods === 1) { 
    parsableString = cleanedStr; 
  } else if (numberOfCommas === 1 && numberOfPeriods > 0) { 
    parsableString = cleanedStr.replace(/\./g, '').replace(',', '.');
  } else if (numberOfCommas === 0 && numberOfPeriods === 0) { 
    parsableString = cleanedStr;
  } else if (numberOfCommas === 0 && numberOfPeriods > 1) { 
    parsableString = cleanedStr.replace(/\./g, '');
  } else { 
    return null;
  }

  const num = parseFloat(parsableString);
  return isNaN(num) ? null : num;
};

const InputCellEfectivos: React.FC<{
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
  ariaLabel: string;
}> = ({ value, onChange, placeholder = "0,00", className = "", ariaLabel }) => {
  const [displayValue, setDisplayValue] = React.useState(value !== null ? value.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '');

  React.useEffect(() => {
    setDisplayValue(value !== null ? value.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
  };
  
  const handleBlur = () => {
    const parsed = parseInputNumber(displayValue);
    if (parsed !== value) { 
        onChange(parsed);
    }
    setDisplayValue(parsed !== null ? parsed.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '');
  };

  return (
    <div className="print-hide">
        <input
            type="text"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            aria-label={ariaLabel}
            className={`w-full p-1.5 border border-gray-300 rounded-md text-right font-mono bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 text-sm ${className}`}
        />
    </div>
  );
};


const EfectivosPage: React.FC = () => { 
  const navigate = useNavigate();
  const { departmentsConfig, pageData, updateDepartmentValue, updateDate, isLoading } = useEfectivos(); 

  const calculateDepartmentTotals = (values: EfectivosDepartmentDataInput) => { 
    const arqueoFaltanteSum = (values.arqueo || 0) + (values.faltante || 0); 
    const recaudacionNet = (values.recaudacionPlus || 0) - (values.recaudacionMinus || 0);
    const diferencia = arqueoFaltanteSum - recaudacionNet;
    return { arqueoFaltanteSum, recaudacionNet, diferencia };
  };

  const grandTotals = departmentsConfig.reduce(
    (acc, dept) => {
      const values = pageData.departmentValues[dept.id] || { arqueo: null, faltante: null, recaudacionPlus: null, recaudacionMinus: null };
      const { arqueoFaltanteSum, recaudacionNet, diferencia } = calculateDepartmentTotals(values);
      acc.arqueoFaltante += arqueoFaltanteSum;
      acc.recaudacion += recaudacionNet;
      acc.diferencia += diferencia;
      if (dept.name.toUpperCase().includes('BAR') || dept.name.toUpperCase().includes('CAJA')) { 
        acc.cajaBares += arqueoFaltanteSum; 
      }
      return acc;
    },
    { arqueoFaltante: 0, recaudacion: 0, diferencia: 0, cajaBares: 0 } 
  );

  const handlePrint = () => window.print();

  const handleExportPdf = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 8;
    const contentWidth = pageWidth - 2 * margin;
    let yPos = margin + 5;
    const headerRowHeight = 7;
    const subHeaderRowHeight = 6;
    const dataRowHeight = 9;
    const footerRowHeight = 8;
    const headerFontSize = 9;
    const subHeaderFontSize = 7.5;
    const dataFontSize = 8;
    
    // --- Colors ---
    const headerBgColor = '#ffffff'; // white
    const footerBgColor = '#ffffff'; // white
    const borderColor = '#d1d5db'; // gray-300
    const fontColor = '#1f2937'; // gray-800

    // --- Title ---
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(fontColor);
    doc.text('Cuadre de Efectivo', pageWidth / 2, yPos, { align: 'center' });
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`DÍA: ${pageData.date || new Date().toLocaleDateString('fr-CA')}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // --- Table ---
    const colWidths = [
      contentWidth * 0.22, // Punto Efectivo
      contentWidth * 0.30, // Arqueo (combined)
      contentWidth * 0.30, // Avalon (combined)
      contentWidth * 0.18  // Ticar/Informar
    ];
    const subColWidths = {
      arqueo: colWidths[1] / 2,
      avalon: colWidths[2] / 2
    };

    let currentX = margin;
    doc.setDrawColor(borderColor);
    doc.setTextColor(fontColor);

    // --- Header Row 1 ---
    doc.setFontSize(headerFontSize);
    doc.setFont(undefined, 'bold');
    
    // Cell: Punto Efectivo
    doc.setFillColor(headerBgColor);
    doc.rect(currentX, yPos, colWidths[0], headerRowHeight + subHeaderRowHeight, 'FD');
    doc.text('Punto Efectivo', currentX + colWidths[0] / 2, yPos + (headerRowHeight + subHeaderRowHeight) / 2, { align: 'center', baseline: 'middle' });
    currentX += colWidths[0];
    
    // Cell: ARQUEO
    doc.setFillColor(headerBgColor);
    doc.rect(currentX, yPos, colWidths[1], headerRowHeight, 'FD');
    doc.text('ARQUEO', currentX + colWidths[1] / 2, yPos + headerRowHeight / 2, { align: 'center', baseline: 'middle' });
    currentX += colWidths[1];

    // Cell: AVALON
    doc.setFillColor(headerBgColor);
    doc.rect(currentX, yPos, colWidths[2], headerRowHeight, 'FD');
    doc.text('AVALON', currentX + colWidths[2] / 2, yPos + headerRowHeight / 2, { align: 'center', baseline: 'middle' });
    currentX += colWidths[2];

    // Cell: Ticar/Informar
    doc.setFillColor(headerBgColor);
    doc.rect(currentX, yPos, colWidths[3], headerRowHeight + subHeaderRowHeight, 'FD');
    doc.text(['(+) Ticar /', '(-) Informar'], currentX + colWidths[3] / 2, yPos + (headerRowHeight + subHeaderRowHeight) / 2, { align: 'center', baseline: 'middle' });
    
    yPos += headerRowHeight;

    // --- Header Row 2 (Subheaders) ---
    currentX = margin + colWidths[0];
    doc.setFontSize(subHeaderFontSize);
    doc.setFont(undefined, 'normal');

    // Cell: Arqueo
    doc.setFillColor(headerBgColor);
    doc.rect(currentX, yPos, subColWidths.arqueo, subHeaderRowHeight, 'FD');
    doc.text('Arqueo', currentX + subColWidths.arqueo / 2, yPos + subHeaderRowHeight / 2, { align: 'center', baseline: 'middle' });
    currentX += subColWidths.arqueo;
    
    // Cell: Faltante
    doc.setFillColor(headerBgColor);
    doc.rect(currentX, yPos, subColWidths.arqueo, subHeaderRowHeight, 'FD');
    doc.text('Faltante', currentX + subColWidths.arqueo / 2, yPos + subHeaderRowHeight / 2, { align: 'center', baseline: 'middle' });
    currentX += subColWidths.arqueo;
    
    // Cell: Recaudación (+)
    doc.setFillColor(headerBgColor);
    doc.rect(currentX, yPos, subColWidths.avalon, subHeaderRowHeight, 'FD');
    doc.text('Recaudación (+)', currentX + subColWidths.avalon / 2, yPos + subHeaderRowHeight / 2, { align: 'center', baseline: 'middle' });
    currentX += subColWidths.avalon;

    // Cell: Recaudación (-)
    doc.setFillColor(headerBgColor);
    doc.rect(currentX, yPos, subColWidths.avalon, subHeaderRowHeight, 'FD');
    doc.text('Recaudación (-)', currentX + subColWidths.avalon / 2, yPos + subHeaderRowHeight / 2, { align: 'center', baseline: 'middle' });
    
    yPos += subHeaderRowHeight;

    // --- Data Rows ---
    doc.setFontSize(dataFontSize);
    doc.setFont(undefined, 'normal');

    departmentsConfig.forEach(dept => {
      const values = pageData.departmentValues[dept.id] || { arqueo: null, faltante: null, recaudacionPlus: null, recaudacionMinus: null };
      const { diferencia } = calculateDepartmentTotals(values);
      const theme = EFECTIVOS_COLOR_THEMES.find(t => t.name === dept.colorThemeName) || EFECTIVOS_COLOR_THEMES.find(t => t.name === 'Gray')!;

      currentX = margin;
      const textY = yPos + dataRowHeight / 2;

      // Dept Name cell
      doc.setFillColor(theme.departmentCellHex);
      doc.rect(currentX, yPos, colWidths[0], dataRowHeight, 'FD');
      doc.text(dept.name, currentX + 2, textY, { maxWidth: colWidths[0] - 4, baseline: 'middle' });
      currentX += colWidths[0];
      
      // Data cells
      const dataValues = [values.arqueo, values.faltante, values.recaudacionPlus, values.recaudacionMinus];
      const dataColWidths = [subColWidths.arqueo, subColWidths.arqueo, subColWidths.avalon, subColWidths.avalon];

      dataValues.forEach((val, i) => {
        doc.setFillColor(theme.dataCellHex);
        doc.rect(currentX, yPos, dataColWidths[i], dataRowHeight, 'FD');
        doc.text(formatCurrencyForPdf(val), currentX + dataColWidths[i] - 2, textY, { align: 'right', baseline: 'middle' });
        currentX += dataColWidths[i];
      });

      // Diferencia cell
      doc.setFillColor(theme.dataCellHex);
      doc.rect(currentX, yPos, colWidths[3], dataRowHeight, 'FD');
      doc.text(formatCurrency(diferencia), currentX + colWidths[3] - 2, textY, { align: 'right', baseline: 'middle' });
      
      yPos += dataRowHeight;
    });

    // --- Footer Rows ---
    doc.setFontSize(headerFontSize);
    doc.setFont(undefined, 'bold');

    // Total row 1
    currentX = margin;

    // Cell: TOTAL
    doc.setFillColor(footerBgColor);
    doc.rect(currentX, yPos, colWidths[0], footerRowHeight, 'FD');
    doc.text('TOTAL', currentX + colWidths[0] / 2, yPos + footerRowHeight / 2, { align: 'center', baseline: 'middle' });
    currentX += colWidths[0];

    // Cell: Arqueo Total
    doc.setFillColor(footerBgColor);
    doc.rect(currentX, yPos, colWidths[1], footerRowHeight, 'FD');
    doc.text(formatCurrency(grandTotals.arqueoFaltante), currentX + colWidths[1] / 2, yPos + footerRowHeight / 2, { align: 'center', baseline: 'middle' });
    currentX += colWidths[1];

    // Cell: Recaudacion Total
    doc.setFillColor(footerBgColor);
    doc.rect(currentX, yPos, colWidths[2], footerRowHeight, 'FD');
    doc.text(formatCurrency(grandTotals.recaudacion), currentX + colWidths[2] / 2, yPos + footerRowHeight / 2, { align: 'center', baseline: 'middle' });
    currentX += colWidths[2];

    // Cell: Diferencia Total
    doc.setFillColor(footerBgColor);
    doc.rect(currentX, yPos, colWidths[3], footerRowHeight, 'FD');
    doc.text(formatCurrency(grandTotals.diferencia), currentX + colWidths[3] / 2, yPos + footerRowHeight / 2, { align: 'center', baseline: 'middle' });
    yPos += footerRowHeight;
    
    // Total row 2 (Caja Bares)
    currentX = margin;

    // Cell: Caja Bares Label
    doc.setFillColor(footerBgColor);
    doc.rect(currentX, yPos, colWidths[0], footerRowHeight, 'FD');
    doc.text('Caja Bares', currentX + 2, yPos + footerRowHeight / 2, { baseline: 'middle', align: 'left' });
    currentX += colWidths[0];

    // Cell: Caja Bares Total
    doc.setFillColor(footerBgColor);
    doc.rect(currentX, yPos, colWidths[1], footerRowHeight, 'FD');
    doc.text(formatCurrency(grandTotals.cajaBares), currentX + colWidths[1] / 2, yPos + footerRowHeight / 2, { align: 'center', baseline: 'middle' });
    currentX += colWidths[1];

    // Cell: Empty combined
    doc.setFillColor(footerBgColor);
    doc.rect(currentX, yPos, colWidths[2] + colWidths[3], footerRowHeight, 'FD');

    doc.save(`cuadre-efectivo-${pageData.date || 'current'}.pdf`);
  };

  if (isLoading) {
    return <div className="p-6 text-center">Cargando datos de Efectivo...</div>; 
  }

  const efectivosPrintStyles = `
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
        font-size: 9pt;
      }
      .efectivos-page-print-wrapper {
        background: transparent !important;
        padding: 5mm !important;
        margin: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }
      .efectivos-table-container {
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }
      .sidebar-container, .efectivos-page-controls, .efectivos-header-controls { 
        display: none !important; 
      }
      .print-title-container {
        display: block !important;
        text-align: center;
        margin-top: 0;
        margin-bottom: 8mm;
      }
      h1.print-title { font-size: 14pt; font-weight: bold; }
      p.print-date { font-size: 10pt; }

      table {
        border-collapse: collapse !important;
        width: 100% !important;
      }
      th, td { 
        border: 1px solid #000 !important;
        color: #000 !important;
        padding: 4px 6px !important;
        text-shadow: none !important;
        box-shadow: none !important;
      }
      th, tfoot td {
        background-color: transparent !important;
      }
      .department-name-cell { /* e.g. bg-green-200 */
        font-weight: bold;
      }
      tbody td:not(:first-child) {
        text-align: right !important;
      }
      tbody td:first-child {
        text-align: left !important;
      }
      .print-hide { 
        display: none !important; 
      }
      .print-show {
        display: block !important;
        font-family: monospace;
      }
      
      /* Column width adjustments to match PDF */
      table col:nth-of-type(1) { width: 22%; }
      table col:nth-of-type(2),
      table col:nth-of-type(3),
      table col:nth-of-type(4),
      table col:nth-of-type(5) { width: 15%; }
      table col:nth-of-type(6) { width: 18%; }
    }
  `;

  return (
    <>
      <style>{efectivosPrintStyles}</style>
      <div className="efectivos-page-print-wrapper p-4 md:p-6 bg-white min-h-full">
        <div className="print-title-container hidden">
          <h1 className="print-title">Cuadre de Efectivo</h1>
          <p className="print-date">DÍA: {pageData.date}</p>
        </div>
        <div className="efectivos-header-controls flex flex-col sm:flex-row justify-between items-center mb-6"> 
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Cuadre de Efectivo</h1>
            <div className="flex items-center">
                <label htmlFor="efectivos-date" className="text-sm font-medium text-gray-700 mr-2">DIA:</label>
                <input
                type="date"
                id="efectivos-date"
                value={pageData.date}
                onChange={(e) => updateDate(e.target.value)}
                className="p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
          </div>
          <button
            onClick={() => navigate('/efectivos/configure')} 
             className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-2 self-end sm:self-center no-theme-button"
          >
            <EditIcon className="w-5 h-5" />
            <span>Modificar Puntos</span> 
          </button>
        </div>

        <div className="efectivos-table-container bg-white shadow-xl rounded-lg overflow-x-auto"> 
          <table className="min-w-full divide-y divide-gray-300 border-collapse border border-gray-300">
            <colgroup>
              <col style={{width: '22%'}} />
              <col style={{width: '15%'}} />
              <col style={{width: '15%'}} />
              <col style={{width: '15%'}} />
              <col style={{width: '15%'}} />
              <col style={{width: '18%'}} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" rowSpan={2} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-300">Punto Efectivo</th>
                <th scope="colgroup" colSpan={2} className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-300">ARQUEO</th>
                <th scope="colgroup" colSpan={2} className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-300">AVALON</th>
                <th scope="col" rowSpan={2} className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-300">(+) Ticar /<br/>(-) Informar</th>
              </tr>
              <tr>
                <th scope="col" className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 border border-gray-300">Arqueo</th>
                <th scope="col" className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 border border-gray-300">Faltante</th>
                <th scope="col" className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 border border-gray-300">Recaudación (+)</th>
                <th scope="col" className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 border border-gray-300">Recaudación (-)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {departmentsConfig.map(dept => {
                const values = pageData.departmentValues[dept.id] || { arqueo: null, faltante: null, recaudacionPlus: null, recaudacionMinus: null };
                const { diferencia } = calculateDepartmentTotals(values);
                const theme = EFECTIVOS_COLOR_THEMES.find(t => t.name === dept.colorThemeName) || EFECTIVOS_COLOR_THEMES.find(t => t.name === 'Gray')!; 
                
                return (
                  <tr key={dept.id} className={theme.dataCellClass}>
                    <td className={`department-name-cell px-3 py-2 whitespace-nowrap text-sm font-medium border border-gray-300 ${theme.departmentCellClass}`}>{dept.name}</td>
                    <td className="px-2 py-1.5 border border-gray-300">
                        <InputCellEfectivos ariaLabel={`Arqueo ${dept.name}`} value={values.arqueo} onChange={val => updateDepartmentValue(dept.id, 'arqueo', val)} />
                        <span className="print-show">{formatCurrency(values.arqueo)}</span>
                    </td>
                    <td className="px-2 py-1.5 border border-gray-300">
                        <InputCellEfectivos ariaLabel={`Faltante ${dept.name}`} value={values.faltante} onChange={val => updateDepartmentValue(dept.id, 'faltante', val)} />
                        <span className="print-show">{formatCurrency(values.faltante)}</span>
                    </td>
                    <td className="px-2 py-1.5 border border-gray-300">
                        <InputCellEfectivos ariaLabel={`Recaudación Plus ${dept.name}`} value={values.recaudacionPlus} onChange={val => updateDepartmentValue(dept.id, 'recaudacionPlus', val)} />
                        <span className="print-show">{formatCurrency(values.recaudacionPlus)}</span>
                    </td>
                    <td className="px-2 py-1.5 border border-gray-300">
                        <InputCellEfectivos ariaLabel={`Recaudación Minus ${dept.name}`} value={values.recaudacionMinus} onChange={val => updateDepartmentValue(dept.id, 'recaudacionMinus', val)} />
                        <span className="print-show">{formatCurrency(values.recaudacionMinus)}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800 text-right border border-gray-300">{formatCurrency(diferencia)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="font-semibold text-gray-700">
              <tr>
                <td className="px-3 py-2 text-right border border-gray-300">TOTAL</td>
                <td colSpan={2} className="px-3 py-2 text-center border border-gray-300">{formatCurrency(grandTotals.arqueoFaltante)}</td>
                <td colSpan={2} className="px-3 py-2 text-center border border-gray-300">{formatCurrency(grandTotals.recaudacion)}</td>
                <td className="px-3 py-2 text-right border border-gray-300">{formatCurrency(grandTotals.diferencia)}</td>
              </tr>
              <tr>
                <td colSpan={2} className="px-3 py-2 text-left border border-gray-300">Caja Bares</td> 
                <td className="px-3 py-2 text-center border border-gray-300">{formatCurrency(grandTotals.cajaBares)}</td>
                <td colSpan={3} className="border border-gray-300"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="efectivos-page-controls mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3"> 
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

export default EfectivosPage;