import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import HipoCardGeniusPage from './pages/hipo-card-genius/HipoCardGeniusPage';
import InfoAvalonPage from './pages/InfoAvalonPage';
import DiarioPage from './pages/DiarioPage';
import { DiarioProvider } from './contexts/DiarioContext';
import ArchivosPage from './pages/ArchivosPage';
import VisasPage from './pages/VisasPage';
import VisasConfigurationPage from './pages/visas/VisasConfigurationPage';
import { VisasProvider } from './contexts/VisasContext';
import EfectivosPage from './pages/EfectivosPage';
import EfectivosConfigurationPage from './pages/efectivos/EfectivosConfigurationPage';
import { EfectivosProvider } from './contexts/EfectivosContext';
import ArqueoPage from './pages/ArqueoPage';
import ArqueoConfigurationPage from './pages/arqueo/ArqueoConfigurationPage';
import { ArqueoProvider } from './contexts/ArqueoContext';
import BalinesasPage from './pages/BalinesasPage';
import ObsequiosPage from './pages/ObsequiosPage';
import { BalinesasProvider } from './contexts/BalinesasContext';
import IdiomasPage from './pages/IdiomasPage';
import OtrosPage from './pages/OtrosPage';
import DisenosPage from './pages/DisenosPage';
import { TemplateProvider } from './contexts/TemplateContext';
import { GuestDataProvider } from './contexts/GuestDataContext';
import { DesignsProvider } from './contexts/DesignsContext';
import { NavItemConfigData, SidebarSettings } from './types';
import AjustesPage from './pages/AjustesPage';
import {
  UserIcon, HelpCircleIcon, CalculatorIcon,
  PlusCircleIcon, ChevronLeftIcon, ChevronRightIcon, CreditCardIcon,
  BookOpenIcon, FolderIcon, CloudIcon, GearIcon,
  ChevronDownIcon, PresentationChartBarIcon,
  BedIcon, EuroIcon, IdCardIcon, SwatchIcon,
  GiftIcon,
  PaintPaletteIcon, CalculatorRealIcon, EuroGlyphIcon, LoungeChairIcon, CalendarRealIcon,
  ComputerRealIcon, BedRealIcon, AjustesIcon, HipoCardGeniusIcon, VisasFillIcon
} from './components/icons/Icons.tsx';
import { AppearanceProvider } from './contexts/AppearanceContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import RequireAuth from './components/RequireAuth';
import LoginPage from './pages/LoginPage';
import CalendarioPage from './pages/CalendarioPage';
import CheckInPage from './pages/CheckInPage';
import AdminStoragePage from './pages/AdminStoragePage';
import ConnectPage from './pages/Connect';

interface NavItemConfig {
  path: string;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  component?: React.ReactNode;
  href?: string;
}

export interface NavItem extends NavItemConfig {
    id: string;
    type: 'item' | 'folder';
    visible: boolean;
    children?: NavItem[];
    isOpen?: boolean;
}

const MAIN_NAV_ITEMS_CONFIG: NavItemConfig[] = [
  { path: '/diario', label: 'Diario', icon: ComputerRealIcon, component: <DiarioPage /> },
  { path: '/archivos', label: 'Archivos', icon: CloudIcon, component: <ArchivosPage /> },
  { path: '/info-avalon', label: 'Info Avalon', icon: HelpCircleIcon, component: <InfoAvalonPage /> },
  { path: '/disenos', label: 'Diseños', icon: PaintPaletteIcon, component: <DisenosPage /> },
  { path: '/hipocardgenius', label: 'HipoCardGenius', icon: HipoCardGeniusIcon, component: <HipoCardGeniusPage /> },
  { path: '/visas', label: 'Visas', icon: VisasFillIcon, component: <VisasPage /> },
  { path: '/check-in', label: 'Check-in', icon: IdCardIcon, component: <CheckInPage /> },
  { path: '/efectivos', label: 'Efectivos', icon: EuroGlyphIcon, component: <EfectivosPage /> },
  { path: '/arqueo', label: 'Arqueo', icon: CalculatorRealIcon, component: <ArqueoPage /> },
  { path: '/balinesas', label: 'Balinesas', icon: BedRealIcon, component: <BalinesasPage /> },
  { path: '/idiomas', label: 'Idiomas', icon: UserIcon, component: <IdiomasPage /> },
  { path: '/obsequios', label: 'Obsequios', icon: GiftIcon, component: <ObsequiosPage /> },
  { path: '/reviewpro', label: 'ReviewPro', icon: PresentationChartBarIcon, href: 'https://app.reviewpro.com/login' },
  { path: '/calendario', label: 'Calendario', icon: CalendarRealIcon, component: <CalendarioPage /> },
  { path: '/otros', label: 'Otros', icon: PlusCircleIcon, component: <OtrosPage /> },
];
const NAV_ITEMS_MAP = new Map(MAIN_NAV_ITEMS_CONFIG.map(item => [item.path, item]));

const SIDEBAR_EXPANDED_WIDTH = '240px';
const SIDEBAR_COLLAPSED_WIDTH = '80px';
const SIDEBAR_ICON_ONLY_WIDTH = '64px';

interface SidebarProps {
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  navItems: NavItem[];
  sidebarSettings: SidebarSettings;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarExpanded, setIsSidebarExpanded,
  navItems, sidebarSettings
}) => {
  const { getAuthHeader, currentUser } = useAuth();

  // si es admin, redirigimos a /connect para que solo vea esa página
  if (currentUser && currentUser.role === 'admin') {
    return <ReactRouterDOM.Navigate to="/connect" replace />;
  }

  const location = ReactRouterDOM.useLocation();
  const navigate = ReactRouterDOM.useNavigate();
  const isHorizontal = sidebarSettings.position === 'top' || sidebarSettings.position === 'bottom';

  const shouldShowText = (sidebarSettings.displayMode === 'icons-and-text' && (isSidebarExpanded || isHorizontal));

  const iconSizeClasses = {
    small: 'h-5 w-5',
    medium: 'h-6 w-6',
    large: 'h-8 w-8'
  };
  const currentIconSizeClass = iconSizeClasses[sidebarSettings.iconSize] || iconSizeClasses.medium;

  const renderNavItem = (item: NavItem, level: number = 0): React.ReactNode => {
    if (!item.visible) return null;

    const isActive = item.path && location.pathname.startsWith(item.path);
    const itemContent = (
      <>
        <item.icon className={`${currentIconSizeClass} flex-shrink-0`} />
        {shouldShowText && <span className="ml-3 truncate">{item.label}</span>}
        {item.type === 'folder' && shouldShowText && (
          <ChevronDownIcon className={`ml-auto h-4 w-4 transition-transform ${item.isOpen ? 'rotate-180' : ''}`} />
        )}
      </>
    );

    const commonClasses = `flex items-center p-2 rounded-md my-1 text-sm font-medium transition-colors ${
        isHorizontal ? 'justify-center' : ''
    }`;

    const navLinkClasses = `${commonClasses} w-full ${
      isActive
      ? 'app-selected-bg app-text-color'
      : 'app-hover-bg app-text-color'
    }`;

    return (
        <div key={item.id}>
            <div className="flex items-center group">
                {item.type === 'item' ? (
                     item.href ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className={navLinkClasses}>
                            {itemContent}
                        </a>
                    ) : (
                        <ReactRouterDOM.NavLink to={item.path} className={navLinkClasses}>
                            {itemContent}
                        </ReactRouterDOM.NavLink>
                    )
                ) : (
                    <button className={navLinkClasses}>
                        {itemContent}
                    </button>
                )}
            </div>

            {item.type === 'folder' && item.isOpen && item.children && (
                <div className="pl-4">
                    {item.children.map(child => renderNavItem(child, level + 1))}
                </div>
            )}
        </div>
    );
  };

  const sidebarWidth = isHorizontal
    ? '100%'
    : sidebarSettings.displayMode === 'icons-only'
    ? SIDEBAR_ICON_ONLY_WIDTH
    : isSidebarExpanded
    ? SIDEBAR_EXPANDED_WIDTH
    : SIDEBAR_COLLAPSED_WIDTH;

  const sidebarClasses = [
    'flex-shrink-0',
    'flex', 'transition-all', 'duration-300', 'bg-white', 'dark:bg-slate-800', 'text-gray-800', 'dark:text-gray-200', 'shadow-lg',
    isHorizontal
      ? 'flex-row w-full h-16 items-center'
      : 'flex-col h-full',
  ].filter(Boolean).join(' ');
  
  // theme classes applied by AppearanceContext via CSS variables
  const sidebarClassesWithTheme = `${sidebarClasses} app-sidebar-bg app-text-color`;

  return (
    <aside className={sidebarClassesWithTheme} style={{ width: !isHorizontal ? sidebarWidth : undefined }}>
      <div className={`p-4 flex items-center ${isHorizontal ? '' : 'border-b border-gray-200 dark:border-slate-700'}`}>
        <img src="/assets/hipoconserjesuitelogo.png" alt="Logo" className="h-10 w-10" />
        {shouldShowText && <span className="text-xl font-bold ml-2">HipoSuite</span>}
        {!isHorizontal && (
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="ml-auto p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700">
            {isSidebarExpanded ? <ChevronLeftIcon className="w-6 h-6" /> : <ChevronRightIcon className="w-6 h-6" />}
          </button>
        )}
      </div>

      <nav className={`flex-1 p-2 overflow-y-auto overflow-x-hidden ${isHorizontal ? 'flex flex-row items-center space-x-2' : ''}`}>
        {navItems.map(item => renderNavItem(item))}
      </nav>

      <div className={`relative flex-shrink-0 ${isHorizontal ? 'flex items-center space-x-2 mr-4' : 'p-2 border-t border-gray-200 dark:border-slate-700'}`}>
            <button onClick={() => navigate('/ajustes')} className={`w-full flex items-center p-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700`}>
              <AjustesIcon className="w-6 h-6" />
          {shouldShowText && <span className="ml-3">Ajustes</span>}
        </button>
      </div>
    </aside>
  );
};

const mapConfigToNavItems = (config: NavItemConfigData[]): NavItem[] => {
  return config.map((itemData): NavItem | null => {
    if (itemData.type === 'item') {
      const configItem = NAV_ITEMS_MAP.get(itemData.id);
      if (configItem) {
        return {
          ...configItem,
          id: itemData.id,
          type: 'item',
          visible: itemData.visible
        };
      }
    } else if (itemData.type === 'folder' && itemData.label) {
      return {
        id: itemData.id,
        type: 'folder',
        label: itemData.label,
        path: '',
        icon: FolderIcon,
        visible: itemData.visible,
        children: itemData.children ? mapConfigToNavItems(itemData.children) : [],
        isOpen: itemData.isOpen,
        component: <></>
      };
    }
    return null;
  }).filter((item): item is NavItem => item !== null);
};

const getDefaultNavItems = (): NavItem[] => {
  return MAIN_NAV_ITEMS_CONFIG.map(config => ({
    ...config,
    id: config.path,
    type: 'item',
    visible: true,
  }));
};

const AppRoutesInner: React.FC = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [navItems, setNavItems] = useState<NavItem[]>(getDefaultNavItems());
  const [sidebarSettings, setSidebarSettings] = useState<SidebarSettings>({
    position: 'left',
    displayMode: 'icons-and-text',
    iconSize: 'medium',
  });

  const LOCAL_USERNAME = 'default_user';

  useEffect(() => {
    const loadUserData = () => {
        try {
            const savedNavConfigStr = localStorage.getItem(`navItemsConfig_${LOCAL_USERNAME}`);
            if (savedNavConfigStr) {
                const savedNavConfig = JSON.parse(savedNavConfigStr);
                setNavItems(mapConfigToNavItems(savedNavConfig));
            } else {
                setNavItems(getDefaultNavItems());
            }

            const savedSidebarSettingsStr = localStorage.getItem(`sidebarSettings_${LOCAL_USERNAME}`);
            if (savedSidebarSettingsStr) {
                setSidebarSettings(JSON.parse(savedSidebarSettingsStr));
            }
        } catch (e) {
            console.error("Failed to load user data from localStorage", e);
            setNavItems(getDefaultNavItems());
        }
    };
    loadUserData();
  }, []);

  const flattenedNavItems = useMemo(() => {
    const flatList: NavItem[] = [];
    const flatten = (items: NavItem[]) => {
        items.forEach(item => {
            if (item.type === 'item') {
                flatList.push(item);
            } else if (item.type === 'folder' && item.children) {
                flatten(item.children);
            }
        });
    };
    flatten(navItems);
    return flatList;
  }, [navItems]);

  const layoutClasses = useMemo(() => {
    switch (sidebarSettings.position) {
        case 'right': return 'flex-row-reverse';
        case 'top': return 'flex-col';
        case 'bottom': return 'flex-col-reverse';
        case 'left':
        default: return 'flex-row';
    }
  }, [sidebarSettings.position]);

  const { getAuthHeader, currentUser } = useAuth();

  return (
    <AppearanceProvider userId={LOCAL_USERNAME}>
    <EfectivosProvider>
    <VisasProvider>
    <ArqueoProvider>
    <BalinesasProvider>
    <DiarioProvider>
    <TemplateProvider>
    <GuestDataProvider>
    <DesignsProvider>
      <div className={`flex h-screen bg-gray-100 dark:bg-slate-900 ${layoutClasses}`}>
          <Sidebar
              isSidebarExpanded={isSidebarExpanded}
              setIsSidebarExpanded={setIsSidebarExpanded}
              navItems={navItems}
              sidebarSettings={sidebarSettings}
          />
          {/* Admin access handled only via /connect page */}
      <main className="flex-1 overflow-y-auto app-page-bg app-text-color">
        <div className="p-4 md:p-6 h-full">
                  <ReactRouterDOM.Routes>
                      {flattenedNavItems.map(item =>
                          item.component && !item.href ? (
                            <React.Fragment key={item.path}>
                                <ReactRouterDOM.Route path={item.path} element={item.component} />
                            </React.Fragment>
                          ) : null
                      )}
                      <ReactRouterDOM.Route path="/visas/configure" element={<VisasConfigurationPage />} />
                      <ReactRouterDOM.Route path="/efectivos/configure" element={<EfectivosConfigurationPage />} />
                      <ReactRouterDOM.Route path="/arqueo/configure" element={<ArqueoConfigurationPage />} />
                      <ReactRouterDOM.Route path="/hipocardgenius/*" element={<HipoCardGeniusPage />} />
                      <ReactRouterDOM.Route path="/ajustes" element={
                        <AjustesPage
                          navItems={navItems}
                          setNavItems={setNavItems}
                          sidebarSettings={sidebarSettings}
                          setSidebarSettings={setSidebarSettings}
                        />
                      } />
                      <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/diario" replace />} />
                      <ReactRouterDOM.Route path="/obsequios" element={<ObsequiosPage />} />
                      <ReactRouterDOM.Route path="/login" element={<LoginPage />} />
                      <ReactRouterDOM.Route path="/connect" element={<RequireAuth><ConnectPage /></RequireAuth>} />
                      <ReactRouterDOM.Route path="/admin/storage" element={<AdminStoragePage />} />
                  </ReactRouterDOM.Routes>
              </div>
          </main>
      </div>
    </DesignsProvider>
    </GuestDataProvider>
    </TemplateProvider>
    </DiarioProvider>
    </BalinesasProvider>
    </ArqueoProvider>
    </VisasProvider>
    </EfectivosProvider>
    </AppearanceProvider>
  );
};

const RoutedApp: React.FC = () => {
  return (
    <AuthProvider>
      <ReactRouterDOM.Routes>
        <ReactRouterDOM.Route path="/login" element={<LoginPage />} />
        <ReactRouterDOM.Route path="/connect" element={<RequireAuth><ConnectPage /></RequireAuth>} />
        <ReactRouterDOM.Route path="/*" element={<RequireAuth><AppRoutesInner /></RequireAuth>} />
      </ReactRouterDOM.Routes>
    </AuthProvider>
  );
};

export default RoutedApp;