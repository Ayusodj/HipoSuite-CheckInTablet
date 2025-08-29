import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import TabletCheckInPage from './Tablet/CheckInPage';
const LazySettingsPage = React.lazy(() => import('./Tablet/SettingsPage'));
// No auth/provider needed for tablet-only app

const RoutedApp: React.FC = () => {
  // Detect if running inside Capacitor on Android. If so, boot into a
  // lightweight Android-only flow: first-run shows `SettingsPage`, afterwards
  // shows the tablet check-in page. For the web/desktop case load the tablet page.
  const isAndroidNative = (() => {
    try {
      const cap = (window as any).Capacitor;
      if (!cap) return false;
      if (typeof cap.getPlatform === 'function') return cap.getPlatform() === 'android';
      return /Android/.test(navigator.userAgent || '');
    } catch (e) { return false; }
  })();

  if (isAndroidNative) {
    const AndroidBootstrap: React.FC = () => {
      const [configured, setConfigured] = React.useState<boolean>(() => {
        try {
          const u = localStorage.getItem('excel_server_url');
          const p = localStorage.getItem('excel_server_path');
          // consider configured when both URL and path exist
          return !!(u && u.trim() && p && p.trim());
        } catch (e) { return false; }
      });

      return (
        <>
          {configured ? (
            <ReactRouterDOM.Routes>
              <ReactRouterDOM.Route path="/*" element={<TabletCheckInPage />} />
            </ReactRouterDOM.Routes>
          ) : (
            <React.Suspense fallback={<div />}>
              <LazySettingsPage onClose={() => setConfigured(true)} />
            </React.Suspense>
          )}
        </>
      );
    };

    return <AndroidBootstrap />;
  }

  return (
    <>
      <ReactRouterDOM.Routes>
        <ReactRouterDOM.Route path="/*" element={<TabletCheckInPage />} />
      </ReactRouterDOM.Routes>
    </>
  );
};

export default RoutedApp;