import React from 'react';
import HipoCardGeniusModule from '../../components/HipoCardGeniusModule';

const HipoCardGeniusPage: React.FC = () => {
  // This CSS is applied globally but scoped to printing.
  const printStyles = `
    @media print {
      @page {
        size: A6 landscape;
        margin: 0 !important; /* Critical: removes browser default margins */
      }
      
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100%;
        height: 100%;
        background: none !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* Hide the main application UI */
      body > #root {
        display: none !important;
      }
      
      /* Show only the print root */
      body > #print-root {
        display: block !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* Each page container forces a page break and defines the A6 dimensions */
      .print-page-container {
        page-break-after: always;
        width: 148mm;  /* A6 landscape width */
        height: 105mm; /* A6 landscape height */
        overflow: hidden; /* Clip any overflow */
      }
      
      /* Force the card component to fill its container exactly */
      .print-page-container .rendered-card-wrapper {
        width: 100% !important;
        height: 100% !important;
        box-shadow: none !important;
        border: none !important;
      }
    }
  `;

  return (
    <>
      <style>{printStyles}</style>
      <HipoCardGeniusModule />
    </>
  );
};

export default HipoCardGeniusPage;
