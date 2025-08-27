

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArqueo } from '../contexts/ArqueoContext';
import { COIN_DENOMINATIONS, BILLETE_DENOMINATIONS, CoinDenomination, BilleteDenomination, ArqueoCajaNocheData, ValeItemConfig } from '../types';
import { EditIcon, PrinterIcon, FileDownloadIcon, TrashIcon } from '../components/icons/Icons';
import { jsPDF } from 'jspdf';

const formatCurrency = (num: number | null | undefined, addSymbol = true): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return addSymbol ? '0,00 €' : '0,00';
  }
  const options: Intl.NumberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  if (addSymbol) {
    options.style = 'currency';
    options.currency = 'EUR';
  }
  return num.toLocaleString('es-ES', options);
};

const parseInputNumber = (value: string): number | null => {
  if (value === null || value === undefined || typeof value !== 'string' || value.trim() === '') {
      return null;
  }
  const cleanedValue = value.replace(/[€\s.]/g, '').replace(',', '.');
  const number = parseFloat(cleanedValue);
  return isNaN(number) ? null : number;
};


interface InputCellProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
  ariaLabel: string;
  isQuantity?: boolean; // To format as integer if quantity
}

const InputCell: React.FC<InputCellProps> = ({ value, onChange, placeholder = "0,00", className = "", ariaLabel, isQuantity = false }) => {
  const [displayValue, setDisplayValue] = React.useState(
    value !== null ? (isQuantity ? String(value) : value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : ''
  );

  React.useEffect(() => {
    setDisplayValue(value !== null ? (isQuantity ? String(value) : value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : '');
  }, [value, isQuantity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
  };
  
  const handleBlur = () => {
    const parsed = isQuantity ? parseInt(displayValue, 10) : parseInputNumber(displayValue);
    const finalValue = isNaN(parsed as number) ? null : parsed;
    if (finalValue !== value) { 
        onChange(finalValue);
    }
    setDisplayValue(finalValue !== null ? (isQuantity ? String(finalValue) : (finalValue as number).toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})) : '');
  };

  const alignmentClass = isQuantity ? 'text-center' : 'text-right';
  const widthClass = 'w-full'; // Always full width to respect parent container.

  return (
    <input
      type={isQuantity ? "number" : "text"}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={isQuantity ? "0" : placeholder}
      aria-label={ariaLabel}
      className={`p-1.5 border border-gray-300 rounded-md ${alignmentClass} font-mono bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 text-sm ${widthClass} ${className}`}
    />
  );
};

type ArqueoTab = 'cajaDiaria' | 'cajaNoche';

const ArqueoPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    valesConfig, cajaDiariaData, cajaNocheData,
    updateMonedaQuantityBarra, updateBilleteQuantityBarra, 
    updateMonedaQuantityCajaFuerte, updateBilleteQuantityCajaFuerte,
    updateDivisaAmount, updateDivisaDiaAmount,
    updateValeAmount,
    updateTarjetasAmount, updateEntregadoDiariaAmount,
    updateMonedaQuantityNoche, updateBilleteQuantityNoche, // New updaters for Caja Noche
    isLoading, resetCajaDiaria, resetCajaNoche
  } = useArqueo();

  const [activeTab, setActiveTab] = useState<ArqueoTab>('cajaDiaria');

  // --- Caja Diaria Calculations ---
  const totalMonedasBarra = useMemo(() => {
    return COIN_DENOMINATIONS.reduce((sum, denom) => {
      const quantity = cajaDiariaData.monedasQuantitiesBarra[denom] || 0;
      return sum + (parseFloat(denom) * quantity);
    }, 0);
  }, [cajaDiariaData.monedasQuantitiesBarra]);

  const totalBilletesBarra = useMemo(() => {
    return BILLETE_DENOMINATIONS.reduce((sum, denom) => {
      const quantity = cajaDiariaData.billetesQuantitiesBarra[denom] || 0;
      return sum + (parseInt(denom, 10) * quantity);
    }, 0);
  }, [cajaDiariaData.billetesQuantitiesBarra]);

  const totalEfectivoBarra = totalMonedasBarra + totalBilletesBarra;

  const totalMonedasCajaFuerte = useMemo(() => {
    return COIN_DENOMINATIONS.reduce((sum, denom) => {
      const quantity = cajaDiariaData.monedasQuantitiesCajaFuerte[denom] || 0;
      return sum + (parseFloat(denom) * quantity);
    }, 0);
  }, [cajaDiariaData.monedasQuantitiesCajaFuerte]);

  const totalBilletesCajaFuerte = useMemo(() => {
    return BILLETE_DENOMINATIONS.reduce((sum, denom) => {
      const quantity = cajaDiariaData.billetesQuantitiesCajaFuerte[denom] || 0;
      return sum + (parseInt(denom, 10) * quantity);
    }, 0);
  }, [cajaDiariaData.billetesQuantitiesCajaFuerte]);
  
  const totalEfectivoCajaFuerte = totalMonedasCajaFuerte + totalBilletesCajaFuerte;

  const totalDivisas = useMemo(() => {
    return (cajaDiariaData.divisaAmount || 0) + (cajaDiariaData.divisaDiaAmount || 0);
  }, [cajaDiariaData.divisaAmount, cajaDiariaData.divisaDiaAmount]);

  const granTotalEfectivo = totalEfectivoBarra + totalEfectivoCajaFuerte + totalDivisas;

  const totalVales = useMemo(() => {
    return valesConfig.reduce((sum, vale) => {
      return sum + (cajaDiariaData.valesAmounts[vale.id] || 0);
    }, 0);
  }, [cajaDiariaData.valesAmounts, valesConfig]);

  const totalCajaDiaria = granTotalEfectivo + totalVales + (cajaDiariaData.tarjetasAmount || 0);
  const descuadreDiaria = totalCajaDiaria - (cajaDiariaData.entregadoAmount || 0);

  // --- Caja Noche Calculations (New) ---
  const totalMonedasNoche = useMemo(() => {
    return COIN_DENOMINATIONS.reduce((sum, denom) => {
      const quantity = cajaNocheData.monedasQuantitiesNoche[denom] || 0;
      return sum + (parseFloat(denom) * quantity);
    }, 0);
  }, [cajaNocheData.monedasQuantitiesNoche]);

  const totalBilletesNoche = useMemo(() => {
    return BILLETE_DENOMINATIONS.reduce((sum, denom) => {
      const quantity = cajaNocheData.billetesQuantitiesNoche[denom] || 0;
      return sum + (parseInt(denom, 10) * quantity);
    }, 0);
  }, [cajaNocheData.billetesQuantitiesNoche]);

  const totalEfectivoNoche = totalMonedasNoche + totalBilletesNoche;


  const handlePrint = () => window.print();
  
  const handleExportPdf = () => {
    const doc = new jsPDF({ 
        orientation: activeTab === 'cajaDiaria' ? 'landscape' : 'portrait', 
        unit: 'mm', 
        format: 'a4' 
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;
    let yPos = 5; // Start title at 5mm from top edge
    
    doc.setFontSize(14);
    doc.text(activeTab === 'cajaDiaria' ? 'ARQUEO CAJA DIARIA' : 'ARQUEO CAJA NOCHE', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8; // Reduce space after title
    
    if (activeTab === 'cajaDiaria') {
        const leftColWidth = contentWidth * 0.58; 
        const rightColWidth = contentWidth * 0.40;
        const gap = contentWidth * 0.02;
        const rightColX = margin + leftColWidth + gap;
        let yPosLeft = yPos;
        let yPosRight = yPos;

        const drawCashSectionPDF = (
            sectionTitle: string,
            coinQtys: Partial<Record<CoinDenomination, number | null>>,
            billeteQtys: Partial<Record<BilleteDenomination, number | null>>,
            totalMonedas: number,
            totalBilletes: number,
            totalEfectivo: number,
            startX: number,
            width: number,
            startY: number
        ) => {
            const initialY = startY; // For border drawing
            let currentY = startY;
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(sectionTitle, startX + width / 2, currentY, { align: 'center' });
            currentY += 7;

            const colWidth = (width - 5) / 2;
            let colX = startX;

            // This function now takes a Y coordinate
            const addCashRow = (label: string, value: number, y: number, isBold = false) => {
                doc.setFontSize(9);
                if (isBold) doc.setFont(undefined, 'bold');
                doc.text(label, colX + 2, y, { maxWidth: colWidth - 10 }); // Padding and max width
                doc.text(formatCurrency(value, false), colX + colWidth - 2, y, { align: 'right' }); // Padding
                if (isBold) doc.setFont(undefined, 'normal');
            };

            let yMonedas = currentY;
            let yBilletes = currentY;

            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text("MONEDAS", colX, yMonedas);
            yMonedas += 5;

            COIN_DENOMINATIONS.forEach(denom => {
                const quantity = coinQtys[denom] || 0;
                addCashRow(`${formatCurrency(parseFloat(denom))} (${quantity})`, parseFloat(denom) * quantity, yMonedas);
                yMonedas += 5;
            });

            colX = startX + colWidth + 5;
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text("BILLETES", colX, yBilletes);
            yBilletes += 5;

            BILLETE_DENOMINATIONS.forEach(denom => {
                const quantity = billeteQtys[denom] || 0;
                addCashRow(`${formatCurrency(parseInt(denom, 10))} (${quantity})`, parseInt(denom, 10) * quantity, yBilletes);
                yBilletes += 5;
            });

            currentY = Math.max(yMonedas, yBilletes);
            doc.line(startX, currentY, startX + width, currentY);
            currentY += 5;

            colX = startX;
            // Pass currentY to addCashRow for totals
            addCashRow("Total Monedas", totalMonedas, currentY, true);
            colX = startX + colWidth + 5;
            addCashRow("Total Billetes", totalBilletes, currentY, true);
            currentY += 6;

            doc.line(startX, currentY, startX + width, currentY);
            currentY += 5;

            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(`TOTAL ${sectionTitle.replace(/efectivo en /i, '').toUpperCase()}`, startX + 5, currentY);
            doc.text(formatCurrency(totalEfectivo), startX + width, currentY, { align: 'right' });
            doc.setFont(undefined, 'normal');
            currentY += 7;
            
            // Draw the outer border for the section
            const sectionHeight = currentY - initialY;
            doc.setDrawColor(0, 0, 0); // Black
            doc.rect(startX, initialY - 7, width, sectionHeight + 1, 'S');

            return currentY;
        };
        
        yPosLeft = drawCashSectionPDF('EFECTIVO EN BARRA', cajaDiariaData.monedasQuantitiesBarra, cajaDiariaData.billetesQuantitiesBarra, totalMonedasBarra, totalBilletesBarra, totalEfectivoBarra, margin, leftColWidth, yPosLeft);
        yPosLeft += 5;
        yPosLeft = drawCashSectionPDF('EFECTIVO EN CAJA FUERTE', cajaDiariaData.monedasQuantitiesCajaFuerte, cajaDiariaData.billetesQuantitiesCajaFuerte, totalMonedasCajaFuerte, totalBilletesCajaFuerte, totalEfectivoCajaFuerte, margin, leftColWidth, yPosLeft);

        // Adjust right column start position to align with content
        yPosRight += 9.5; // Approx height of "EFECTIVO EN BARRA" title (36px ~ 9.5mm)

        const addRightRow = (label: string, value: number, isBold = false, isSubtotal = false, highlight = false) => {
            if (isBold) doc.setFont(undefined, 'bold');
            if (highlight) doc.setTextColor(200, 0, 0);
            doc.text(label, rightColX, yPosRight);
            doc.text(formatCurrency(value, false), rightColX + rightColWidth, yPosRight, { align: 'right' });
            if (isBold) doc.setFont(undefined, 'normal');
            if (highlight) doc.setTextColor(0, 0, 0);
            yPosRight += isSubtotal ? 7 : 5.5;
            if (isSubtotal) doc.line(rightColX, yPosRight - 3, rightColX + rightColWidth, yPosRight - 3);
        };

        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('DIVISAS', rightColX, yPosRight);
        yPosRight += 6;
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        addRightRow('Divisa', cajaDiariaData.divisaAmount || 0);
        addRightRow('Divisa Día', cajaDiariaData.divisaDiaAmount || 0);
        addRightRow('TOTAL DIVISAS', totalDivisas, true, true);
        yPosRight += 2;
        doc.setFontSize(10);
        addRightRow('GRAN TOTAL EFECTIVO', granTotalEfectivo, true, true);
        yPosRight += 4;
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('OTROS CONCEPTOS', rightColX, yPosRight);
        yPosRight += 6;
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setFont(undefined, 'bold');
        doc.text('VALES', rightColX, yPosRight);
        doc.setFont(undefined, 'normal');
        yPosRight += 5.5;
        valesConfig.forEach(vale => addRightRow(`  ${vale.label}`, cajaDiariaData.valesAmounts[vale.id] || 0));
        addRightRow('Total Vales', totalVales, true, true);
        yPosRight += 2;
        addRightRow('TARJETAS', cajaDiariaData.tarjetasAmount || 0, false, true);
        yPosRight += 2;
        doc.setFontSize(10);
        addRightRow('TOTAL CAJA', totalCajaDiaria, true, true);
        yPosRight += 2;
        addRightRow('ENTREGADO', cajaDiariaData.entregadoAmount || 0, false, true);
        yPosRight += 2;
        addRightRow('DESCUADRE', descuadreDiaria, true, true, descuadreDiaria !== 0);

    } else { // Caja Noche PDF (Portrait)
        const nocheContentWidth = contentWidth * 0.7;
        const nocheMargin = margin + (contentWidth - nocheContentWidth) / 2;
        doc.setFontSize(9);
        const addRowNoche = (label: string, value: string | number | null, qty?: number | null, isBold?: boolean, isSubtotal?: boolean) => {
            const valWidth = nocheContentWidth * 0.35; 
            const qtyWidth = nocheContentWidth * 0.25; 
            const labelWidth = nocheContentWidth - valWidth - qtyWidth - 5; 
            if (isBold) doc.setFont(undefined, 'bold');
            doc.text(label, nocheMargin, yPos, {maxWidth: labelWidth});
            if (qty !== undefined && qty !== null) doc.text(String(qty), nocheMargin + labelWidth + qtyWidth -2 , yPos, {align: 'right', maxWidth: qtyWidth -2});
            if (value !== null) {
                doc.text(formatCurrency(typeof value === 'string' ? parseFloat(value) : value, false), nocheMargin + labelWidth + qtyWidth + valWidth - 2, yPos, {align: 'right', maxWidth: valWidth -2});
            }
            if (isBold) doc.setFont(undefined, 'normal');
            yPos += isSubtotal ? 7 : 5.5;
            if (isSubtotal) doc.line(nocheMargin, yPos - 3, nocheMargin + nocheContentWidth, yPos - 3);
        };
        yPos += 5;
        addRowNoche('MONEDAS', null, undefined, true, false);
        COIN_DENOMINATIONS.forEach(denom => addRowNoche(`  ${formatCurrency(parseFloat(denom))}`, parseFloat(denom) * (cajaNocheData.monedasQuantitiesNoche[denom]||0), cajaNocheData.monedasQuantitiesNoche[denom]));
        addRowNoche('Total Monedas', totalMonedasNoche, undefined, true, true);
        yPos += 3;
        addRowNoche('BILLETES', null, undefined, true, false);
        BILLETE_DENOMINATIONS.forEach(denom => addRowNoche(`  ${formatCurrency(parseInt(denom,10))}`, parseInt(denom,10) * (cajaNocheData.billetesQuantitiesNoche[denom]||0), cajaNocheData.billetesQuantitiesNoche[denom]));
        addRowNoche('Total Billetes', totalBilletesNoche, undefined, true, true);
        yPos += 4; 
        addRowNoche('TOTAL EFECTIVO CAJA NOCHE', totalEfectivoNoche, undefined, true, true);
    }
    doc.save(`arqueo-${activeTab}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (isLoading) return <div className="p-6 text-center">Cargando Arqueo...</div>;

  const arqueoPrintStyles = `
    .print-hide { display: block; }
    .print-show { display: none; }

    @media print {
      @page {
        size: A4 ${activeTab === 'cajaDiaria' ? 'landscape' : 'portrait'};
        margin: 5mm 10mm;
      }
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .print-hide, .sidebar-container, .arqueo-page-controls, .arqueo-tabs {
        display: none !important;
      }
      .print-show {
        display: block !important;
      }
      
      .arqueo-page-print-wrapper, .arqueo-page-print-wrapper * {
        background: transparent !important;
        color: #000 !important;
        box-shadow: none !important;
        border-color: #000 !important;
        font-size: 9pt;
      }
      
      .print-header {
        display: block !important;
        text-align: center;
        margin-top: -5mm;
        margin-bottom: 3mm;
      }
      .print-header-title {
        font-size: 14pt;
        font-weight: bold;
      }

      /* CAJA DIARIA LAYOUT */
      .print-caja-diaria-container {
        display: flex !important;
        flex-direction: row !important;
        gap: 15px;
        width: 100%;
        align-items: flex-start;
      }
      .print-caja-diaria-left {
        width: 58%;
        flex-shrink: 0;
      }
      .print-caja-diaria-right {
        width: 40%;
        margin-right: 2%;
        flex-shrink: 0;
      }
      .print-divisas-spacer {
        padding-top: 5.5mm !important; /* Align with top of Monedas/Billetes boxes */
      }
      
      /* Reset grid for screen on print */
      .lg\\:grid-cols-2 {
        grid-template-columns: 1fr !important;
      }

      h3.text-xl { /* Section titles */
        font-size: 11pt !important;
        text-align: center;
        border-bottom: none !important;
        padding-bottom: 0 !important;
        margin-top: -2mm !important;
        margin-bottom: 0.5rem !important;
      }

      h4.text-lg { /* Sub-section titles */
        font-size: 10pt !important;
        border-bottom: 1px solid #666;
        margin-bottom: 0.5rem !important;
      }
      
      /* Rows within cash sections */
      .grid.grid-cols-3.gap-x-2 {
        display: flex !important;
        justify-content: space-between;
        padding: 0px 0;
        font-size: 9pt;
      }
      .grid.grid-cols-3.gap-x-2 > div:nth-child(1) { width: 33%; }
      .grid.grid-cols-3.gap-x-2 > div:nth-child(2) { width: 33%; text-align: center; }
      .grid.grid-cols-3.gap-x-2 > div:nth-child(3) { width: 33%; text-align: right; }

      /* Total Sections Styling */
      .print-total-section {
        margin-top: 0rem !important;
        padding: 0.1rem 0.5rem !important;
        border: 2px solid #000 !important;
        border-radius: 8px; /* Reduced border radius */
        height: 25px; /* Reduced height */
        display: flex;
        align-items: center;
      }
      .print-total-section h4 {
        margin-bottom: 0 !important;
        border-bottom: none !important;
        width: 100%;
      }
      
      /* General Total rows */
      .flex.justify-between.border-t, 
      .grid.grid-cols-2.gap-x-4.items-center,
      .grid.grid-cols-2.gap-2.items-center {
        display: flex !important;
        justify-content: space-between !important;
        width: 100%;
        padding: 2px 0 !important;
        margin-top: 2px !important;
        border-top: 1px solid #999 !important;
        font-size: 10pt;
      }
      .text-lg.font-bold {
        font-size: 11pt !important;
      }
      .font-bold { font-weight: bold !important; }

      .text-red-600, .text-green-600 {
          color: #000 !important;
      }
    }
  `;
  
  const renderCashSection = (
    title: string,
    coinData: Partial<Record<CoinDenomination, number | null>>,
    billeteData: Partial<Record<BilleteDenomination, number | null>>,
    coinUpdater: (denom: CoinDenomination, val: number | null) => void,
    billeteUpdater: (denom: BilleteDenomination, val: number | null) => void,
    totalMonedasCalc: number,
    totalBilletesCalc: number,
    totalEfectivoCalc: number,
    isCajaFuerte: boolean = false
  ) => (
    <div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="p-4 border rounded-md bg-white flex flex-col">
          <h4 className="text-lg font-semibold mb-3 text-gray-700">MONEDAS</h4>
          <div className="flex-grow">
            {COIN_DENOMINATIONS.map(denom => {
                const quantity = coinData[denom] || 0;
                const total = parseFloat(denom) * quantity;
                return (
                  <div key={`monedas-${isCajaFuerte ? 'cf-' : 'barra-'}${denom}`} className="grid grid-cols-3 gap-x-2 items-center mb-1.5">
                    <div className="text-left">
                      <span className="text-sm text-gray-600">{formatCurrency(parseFloat(denom))}</span>
                    </div>
                    <div className="text-center">
                      <div className="print-hide">
                          <InputCell isQuantity value={quantity || null} onChange={val => coinUpdater(denom, val)} ariaLabel={`Cantidad monedas ${denom} ${isCajaFuerte ? 'Caja Fuerte' : 'Barra'}`} placeholder="0" />
                      </div>
                      <span className="hidden print-show font-mono">{quantity || 0}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-700 font-mono">{formatCurrency(total, false)} €</span>
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="mt-2 pt-2 border-t flex justify-between">
            <span className="text-sm font-bold text-gray-700">Total Monedas</span>
            <span className="text-sm font-bold text-right text-gray-700">{formatCurrency(totalMonedasCalc)}</span>
          </div>
        </section>

        <section className="p-4 border rounded-md bg-white flex flex-col">
          <h4 className="text-lg font-semibold mb-3 text-gray-700">BILLETES</h4>
          <div className="flex-grow">
            {BILLETE_DENOMINATIONS.map(denom => {
                const quantity = billeteData[denom] || 0;
                const total = parseInt(denom, 10) * quantity;
                return (
                  <div key={`billetes-${isCajaFuerte ? 'cf-' : 'barra-'}${denom}`} className="grid grid-cols-3 gap-x-2 items-center mb-1.5">
                    <div className="text-left">
                      <span className="text-sm text-gray-600">{formatCurrency(parseInt(denom, 10))}</span>
                    </div>
                    <div className="text-center">
                      <div className="print-hide">
                          <InputCell isQuantity value={quantity || null} onChange={val => billeteUpdater(denom, val)} ariaLabel={`Cantidad billetes ${denom} ${isCajaFuerte ? 'Caja Fuerte' : 'Barra'}`} placeholder="0" />
                      </div>
                      <span className="hidden print-show font-mono">{quantity || 0}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-sm text-gray-700 font-mono">{formatCurrency(total, false)} €</span>
                    </div>
                  </div>
                );
              })}
            </div>
          <div className="mt-2 pt-2 border-t flex justify-between">
            <span className="text-sm font-bold text-gray-700">Total Billetes</span>
            <span className="text-sm font-bold text-right text-gray-700">{formatCurrency(totalBilletesCalc)}</span>
          </div>
        </section>
      </div>
      <div className="mt-2 p-2 border-2 border-black rounded-xl bg-white print-total-section">
        <h4 className="text-lg font-semibold text-gray-700 flex justify-between items-center w-full">
            <span>TOTAL {title.replace(/efectivo en /i, '').toUpperCase()}</span>
            <span className="text-blue-600 font-mono">{formatCurrency(totalEfectivoCalc)}</span>
        </h4>
      </div>
    </div>
  );

  const renderCajaDiaria = () => (
    <div className="space-y-6">
        <div className="hidden print-header">
            <h1 className="print-header-title">ARQUEO DE CAJA DIARIA</h1>
        </div>
        <div className="print-caja-diaria-container grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="print-caja-diaria-left space-y-6">
                {renderCashSection(
                  "EFECTIVO EN BARRA",
                  cajaDiariaData.monedasQuantitiesBarra,
                  cajaDiariaData.billetesQuantitiesBarra,
                  updateMonedaQuantityBarra,
                  updateBilleteQuantityBarra,
                  totalMonedasBarra,
                  totalBilletesBarra,
                  totalEfectivoBarra
                )}
                {renderCashSection(
                  "EFECTIVO EN CAJA FUERTE",
                  cajaDiariaData.monedasQuantitiesCajaFuerte,
                  cajaDiariaData.billetesQuantitiesCajaFuerte,
                  updateMonedaQuantityCajaFuerte,
                  updateBilleteQuantityCajaFuerte,
                  totalMonedasCajaFuerte,
                  totalBilletesCajaFuerte,
                  totalEfectivoCajaFuerte,
                  true // isCajaFuerte
                )}
            </div>
            <div className="print-caja-diaria-right space-y-6">
                <div className="lg:pt-9 print-divisas-spacer">
                    <section className="p-4 border rounded-md bg-white">
                        <h3 className="text-lg font-semibold mb-3 text-gray-700">DIVISAS</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <label htmlFor="divisaAmount" className="text-sm text-gray-600 self-center">Divisa:</label>
                            <div>
                                <div className="print-hide">
                                    <InputCell value={cajaDiariaData.divisaAmount} onChange={updateDivisaAmount} ariaLabel="Importe Divisa" />
                                </div>
                                <span className="hidden print-show font-mono text-right w-full">{formatCurrency(cajaDiariaData.divisaAmount)}</span>
                            </div>
                            <label htmlFor="divisaDiaAmount" className="text-sm text-gray-600 self-center">Divisa Día:</label>
                            <div>
                                <div className="print-hide">
                                    <InputCell value={cajaDiariaData.divisaDiaAmount} onChange={updateDivisaDiaAmount} ariaLabel="Importe Divisa Día" />
                                </div>
                                 <span className="hidden print-show font-mono text-right w-full">{formatCurrency(cajaDiariaData.divisaDiaAmount)}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 items-center text-sm font-bold mt-2 pt-2 border-t text-gray-700">
                            <span>Total Divisas:</span>
                            <span className="text-right">{formatCurrency(totalDivisas)}</span>
                        </div>
                    </section>
                </div>

                <div className="p-4 border-2 border-blue-500 rounded-md bg-blue-50">
                    <h3 className="text-xl font-bold text-gray-800 flex justify-between items-center">
                        <span>GRAN TOTAL EFECTIVO:</span>
                        <span className="text-blue-700">{formatCurrency(granTotalEfectivo)}</span>
                    </h3>
                </div>
                
                <section className="p-4 border rounded-md bg-white">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-700">VALES</h3>
                        <div className="print-hide">
                            <button onClick={() => navigate('/arqueo/configure')} className="text-sm text-indigo-600 hover:underline flex items-center">
                                <EditIcon className="w-4 h-4 mr-1"/> Modificar Vales
                            </button>
                        </div>
                    </div>
                    {valesConfig.map(vale => (
                    <div key={vale.id} className="grid grid-cols-2 gap-2 items-center mb-1.5">
                        <span className="text-sm text-gray-600">{vale.label}</span>
                         <div>
                            <div className="print-hide">
                                <InputCell value={cajaDiariaData.valesAmounts[vale.id] || null} onChange={val => updateValeAmount(vale.id, val)} ariaLabel={`Importe ${vale.label}`} />
                            </div>
                            <span className="hidden print-show font-mono text-right w-full">{formatCurrency(cajaDiariaData.valesAmounts[vale.id] || null)}</span>
                        </div>
                    </div>
                    ))}
                    {valesConfig.length === 0 && <p className="text-sm text-gray-500">No hay tipos de vales configurados.</p>}
                    <div className="grid grid-cols-2 gap-2 items-center text-sm font-bold mt-2 pt-2 border-t text-gray-700">
                        <span>Total Vales:</span>
                        <span className="text-right">{formatCurrency(totalVales)}</span>
                    </div>
                </section>

                <section className="p-4 border rounded-md bg-white space-y-3">
                    <div className="grid grid-cols-2 gap-2 items-center">
                        <label htmlFor="tarjetasAmount" className="text-sm font-semibold text-gray-700">TARJETAS:</label>
                        <div>
                            <div className="print-hide">
                                <InputCell value={cajaDiariaData.tarjetasAmount} onChange={updateTarjetasAmount} ariaLabel="Importe tarjetas" />
                            </div>
                            <span className="hidden print-show font-mono text-right w-full">{formatCurrency(cajaDiariaData.tarjetasAmount)}</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 items-center pt-2 border-t">
                        <span className="text-lg font-bold text-gray-700">TOTAL CAJA:</span>
                        <span className="text-lg font-bold text-blue-600 text-right">{formatCurrency(totalCajaDiaria)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 items-center pt-2 border-t">
                        <label htmlFor="entregadoDiariaAmount" className="text-sm font-semibold text-gray-700">ENTREGADO:</label>
                        <div>
                            <div className="print-hide">
                                <InputCell value={cajaDiariaData.entregadoAmount} onChange={updateEntregadoDiariaAmount} ariaLabel="Importe entregado" />
                            </div>
                             <span className="hidden print-show font-mono text-right w-full">{formatCurrency(cajaDiariaData.entregadoAmount)}</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 items-center pt-2 border-t">
                        <span className={`text-lg font-bold ${descuadreDiaria === 0 ? 'text-green-600' : 'text-red-600'}`}>DESCUADRE:</span>
                        <span className={`text-lg font-bold text-right ${descuadreDiaria === 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(descuadreDiaria)}</span>
                    </div>
                </section>
            </div>
        </div>
        <div className="print-hide">
            <button onClick={resetCajaDiaria} className="arqueo-page-controls mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center space-x-2 text-sm">
                <TrashIcon className="w-4 h-4" />
                <span>Resetear Caja Diaria</span>
            </button>
        </div>
    </div>
  );

  const renderCajaNoche = () => (
    <div className="space-y-6">
        <div className="hidden print-header">
            <h1 className="print-header-title">Arqueo de Caja Noche</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="p-4 border rounded-md bg-white">
                <h4 className="text-lg font-semibold mb-3 text-gray-700">MONEDAS</h4>
                {COIN_DENOMINATIONS.map(denom => (
                    <div key={`monedas-noche-${denom}`} className="grid grid-cols-3 gap-2 items-center mb-1.5">
                        <span className="text-sm text-gray-600">{formatCurrency(parseFloat(denom))}</span>
                        <div>
                            <div className="print-hide">
                                <InputCell isQuantity value={cajaNocheData.monedasQuantitiesNoche[denom] || null} onChange={val => updateMonedaQuantityNoche(denom, val)} ariaLabel={`Cantidad monedas ${denom} Caja Noche`} placeholder="0" />
                            </div>
                            <span className="hidden print-show font-mono">{cajaNocheData.monedasQuantitiesNoche[denom] || 0}</span>
                        </div>
                        <span className="text-sm text-right text-gray-700">{formatCurrency(parseFloat(denom) * (cajaNocheData.monedasQuantitiesNoche[denom] || 0))}</span>
                    </div>
                ))}
                <div className="grid grid-cols-3 gap-2 items-center mt-2 pt-2 border-t">
                    <span className="text-sm font-bold col-span-2 text-gray-700">Total Monedas</span>
                    <span className="text-sm font-bold text-right text-gray-700">{formatCurrency(totalMonedasNoche)}</span>
                </div>
            </section>

            <section className="p-4 border rounded-md bg-white">
                <h4 className="text-lg font-semibold mb-3 text-gray-700">BILLETES</h4>
                {BILLETE_DENOMINATIONS.map(denom => (
                    <div key={`billetes-noche-${denom}`} className="grid grid-cols-3 gap-2 items-center mb-1.5">
                        <span className="text-sm text-gray-600">{formatCurrency(parseInt(denom, 10))}</span>
                        <div>
                           <div className="print-hide">
                                <InputCell isQuantity value={cajaNocheData.billetesQuantitiesNoche[denom] || null} onChange={val => updateBilleteQuantityNoche(denom, val)} ariaLabel={`Cantidad billetes ${denom} Caja Noche`} placeholder="0" />
                            </div>
                            <span className="hidden print-show font-mono">{cajaNocheData.billetesQuantitiesNoche[denom] || 0}</span>
                        </div>
                        <span className="text-sm text-right text-gray-700">{formatCurrency(parseInt(denom, 10) * (cajaNocheData.billetesQuantitiesNoche[denom] || 0))}</span>
                    </div>
                ))}
                <div className="grid grid-cols-3 gap-2 items-center mt-2 pt-2 border-t">
                    <span className="text-sm font-bold col-span-2 text-gray-700">Total Billetes</span>
                    <span className="text-sm font-bold text-right text-gray-700">{formatCurrency(totalBilletesNoche)}</span>
                </div>
            </section>
        </div>
        <div className="mt-4 p-4 border-2 border-blue-500 rounded-md bg-blue-50">
            <h4 className="text-xl font-bold text-gray-800 flex justify-between items-center">
              <span>TOTAL EFECTIVO CAJA NOCHE:</span>
              <span className="text-blue-700">{formatCurrency(totalEfectivoNoche)}</span>
            </h4>
        </div>
        <div className="print-hide">
            <button onClick={resetCajaNoche} className="arqueo-page-controls mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center space-x-2 text-sm">
                <TrashIcon className="w-4 h-4" />
                <span>Resetear Caja Noche</span>
            </button>
        </div>
    </div>
  );


  return (
    <>
      <style>{arqueoPrintStyles}</style>
      <div className="arqueo-page-print-wrapper p-4 md:p-6 bg-gray-100 min-h-full">
        <div className="arqueo-page-controls flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Arqueo de Caja</h1>
        </div>

        <div className="arqueo-tabs mb-6 border-b border-gray-300 print-hide">
          <button
            onClick={() => setActiveTab('cajaDiaria')}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-md
              ${activeTab === 'cajaDiaria' 
                ? 'bg-indigo-100 text-indigo-700 border-indigo-500 border-b-2' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            Caja Diaria
          </button>
          <button
            onClick={() => setActiveTab('cajaNoche')}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-md
              ${activeTab === 'cajaNoche' 
                ? 'bg-indigo-100 text-indigo-700 border-indigo-500 border-b-2' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            Caja Noche
          </button>
        </div>

        <div className="arqueo-content-area">
          {activeTab === 'cajaDiaria' && renderCajaDiaria()}
          {activeTab === 'cajaNoche' && renderCajaNoche()}
        </div>

        <div className="arqueo-page-controls mt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors flex items-center justify-center space-x-2 no-theme-button"
          >
            <PrinterIcon className="w-5 h-5" />
            <span>Imprimir {activeTab === 'cajaDiaria' ? 'Caja Diaria' : 'Caja Noche'}</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors flex items-center justify-center space-x-2 no-theme-button"
          >
            <FileDownloadIcon className="w-5 h-5" />
            <span>Exportar PDF {activeTab === 'cajaDiaria' ? 'Caja Diaria' : 'Caja Noche'}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ArqueoPage;