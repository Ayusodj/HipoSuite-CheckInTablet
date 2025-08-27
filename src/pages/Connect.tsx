import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ConnectPage: React.FC = () => {
  const { getAuthHeader, currentUser } = useAuth();

  const openAdmin = async () => {
    try {
      // use backend origin explicitly so navigation and cookies target the backend host
      const backendApi = 'http://127.0.0.1:8000/api/admin/create_session/';
      const backendAdmin = 'http://127.0.0.1:8000/admin/';
      const res = await fetch(backendApi, { method: 'POST', credentials: 'include', headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } });
      if (res.ok) {
        // navigate in the same tab to the backend admin (so no new window and cookies are used)
        window.location.assign(backendAdmin);
      } else {
        const j = await res.json().catch(() => ({}));
        alert('No se pudo abrir admin: ' + (j.error || res.status));
      }
    } catch (e) {
      alert('Network error');
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow">No autorizado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg bg-white rounded shadow p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Conexión Backend</h1>
        <p className="mb-6 text-gray-600">Solo usuarios con rol <strong>admin</strong> pueden acceder al panel de administración. Usa el botón abajo para abrir el backend en la misma pestaña o acceder a la gestión de almacenamiento desde la app.</p>
        <div className="flex justify-center space-x-3">
          <button onClick={openAdmin} className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-500">Abrir panel backend</button>
          <a href="/admin/storage" className="px-6 py-3 bg-emerald-600 text-white rounded hover:bg-emerald-500">Administrar almacenamiento</a>
        </div>
      </div>
    </div>
  );
};

export default ConnectPage;
