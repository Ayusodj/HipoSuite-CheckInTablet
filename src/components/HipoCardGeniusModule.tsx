

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
// Removed detailed HipoCardGenius sub-pages; module kept as a stub after cleanup
import { SquaresPlusIcon, UploadIcon, PrinterIcon } from './icons/Icons';

const NAV_ITEMS_HCG = [
  { path: '', label: 'Diseñar Tarjetas', icon: SquaresPlusIcon }, 
  { path: 'import', label: 'Importar Datos', icon: UploadIcon },
  { path: 'print', label: 'Imprimir Tarjetas', icon: PrinterIcon },
];

// HipoCardGeniusModuleProps removed as isDarkMode is no longer passed

const SubNavBarHCG: React.FC = () => {
  const location = ReactRouterDOM.useLocation();
  
  const getHCGSubPathSegments = (fullPath: string): string[] => {
    const parts = fullPath.split('/'); 
    return parts.slice(2); 
  };
  
  const currentSubPathSegments = getHCGSubPathSegments(location.pathname);
  const primarySubPath = currentSubPathSegments[0] || ''; 

  const isNavLinkActive = (itemPathSuffix: string) => {
    if (itemPathSuffix === '') { 
      return primarySubPath === '' || primarySubPath === 'create-template' || primarySubPath === 'edit-template';
    }
    return primarySubPath === itemPathSuffix;
  };

  return (
    <nav className="hcg-sub-navbar bg-white shadow-sm sticky top-0 z-30 mb-6 print:hidden">
      <div className="container mx-auto px-6 py-3 flex items-center space-x-1 md:space-x-2">
        {NAV_ITEMS_HCG.map(item => (
          <ReactRouterDOM.NavLink
            key={item.path}
            to={item.path} 
            end={item.path === ''} 
            className={
              `rounded-md text-sm font-medium transition-colors flex items-center justify-center 
              p-2 md:px-4 md:py-2
              ${isNavLinkActive(item.path)
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`
            }
            title={item.label} 
            aria-label={item.label}
          >
            <item.icon className="h-5 w-5 md:mr-2" aria-hidden="true" />
            <span className="hidden md:inline">{item.label}</span>
          </ReactRouterDOM.NavLink>
        ))}
      </div>
    </nav>
  );
};


const HipoCardGeniusModule: React.FC = () => {
  return (
    <div className="flex flex-col flex-1 h-full">
      <SubNavBarHCG />
      <main className="flex-grow overflow-y-auto bg-white p-6">
        <div className="text-center text-gray-600">HipoCardGenius pages were removed. This module is a stub.</div>
      </main>
    </div>
  );
};

export default HipoCardGeniusModule;