import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserManagementPanel from '../components/admin/UserManagementPanel';
import { LogoutIcon, UserGroupIcon } from '../components/icons/Icons';

const AdminPage: React.FC = () => {
  const { logout, currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <UserGroupIcon className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              Panel de Administración
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-sm text-gray-600">
                Sesión iniciada como: <strong className="font-medium text-gray-800">{currentUser?.username}</strong>
             </span>
            <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2 text-sm"
                >
                <LogoutIcon className="w-5 h-5" />
                <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <UserManagementPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;