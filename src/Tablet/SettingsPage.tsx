import React, { useState, useEffect } from 'react';
import { deployBundledFileToSmb } from '../services/deploy';

const SettingsPage: React.FC<{ onClose: ()=>void }> = ({ onClose }) => {
  const [url, setUrl] = useState(() => { try { return localStorage.getItem('excel_server_url') || ''; } catch { return ''; } });
  const [path, setPath] = useState(() => { try { return localStorage.getItem('excel_server_path') || ''; } catch { return ''; } });
  const [key, setKey] = useState(() => { try { return localStorage.getItem('excel_server_key') || ''; } catch { return ''; } });
  const [smbUser, setSmbUser] = useState(() => { try { return localStorage.getItem('excel_smb_user') || ''; } catch { return ''; } });
  const [smbPass, setSmbPass] = useState(() => { try { return localStorage.getItem('excel_smb_pass') || ''; } catch { return ''; } });
  const [hideLangs, setHideLangs] = useState(() => { try { return localStorage.getItem('checkin_hide_langs') === '1'; } catch { return false; } });
  const [bg, setBg] = useState<string>(() => { try { return localStorage.getItem('checkin_bg') || ''; } catch { return ''; } });

  useEffect(() => { try { localStorage.setItem('checkin_hide_langs', hideLangs ? '1' : '0'); } catch {} }, [hideLangs]);
  useEffect(() => { try { localStorage.setItem('checkin_bg', bg); } catch {} }, [bg]);

  const save = () => {
    try { localStorage.setItem('excel_server_url', url || ''); localStorage.setItem('excel_server_path', path || ''); localStorage.setItem('excel_server_key', key || ''); } catch(e){}
  try { localStorage.setItem('excel_smb_user', smbUser || ''); localStorage.setItem('excel_smb_pass', smbPass || ''); } catch(e){}
    onClose();
  };

  const onDeployExcelServer = async () => {
    try {
      const destBase = (url || '').replace(/\/$/, '') + (path ? '/' + path.replace(/^\//, '') : '');
      const dest = destBase.replace(/([^:])\/\/+/, '$1/');
      const ok = await deployBundledFileToSmb('/bundled/excel-server.js', dest + (dest.endsWith('/') ? '' : '/') + 'excel-server.js');
      if (ok) alert('Excel Server desplegado correctamente');
      else alert('Fallo al desplegar Excel Server');
    } catch (err) {
      console.error(err);
      alert('Fallo al desplegar Excel Server');
    }
  };

  const onDeploySmbPlugin = async () => {
    try {
      const destBase = (url || '').replace(/\/$/, '') + (path ? '/' + path.replace(/^\//, '') : '');
      const dest = destBase.replace(/([^:])\/\/+/, '$1/');
      const ok = await deployBundledFileToSmb('/bundled/smb-plugin-source.txt', dest + (dest.endsWith('/') ? '' : '/') + 'SmbWriter.java');
      if (ok) alert('Plugin SMB desplegado correctamente');
      else alert('Fallo al desplegar Plugin SMB');
    } catch (err) {
      console.error(err);
      alert('Fallo al desplegar Plugin SMB');
    }
  };

  return (
    <div className="fixed inset-0 z-60 p-6 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Ajustes tablet</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">URL del servicio (http://IP:PUERTO)</label>
            <input className="w-full border rounded px-3 py-2" value={url} onChange={e=>setUrl(e.target.value)} placeholder="http://192.168.1.42:3000" />
          </div>
          <div>
            <label className="block text-sm font-medium">Ruta/archivo en el servidor</label>
            <input className="w-full border rounded px-3 py-2" value={path} onChange={e=>setPath(e.target.value)} placeholder="/shared/checkins.xlsx" />
          </div>
          <div>
            <label className="block text-sm font-medium">Clave API (opcional)</label>
            <input className="w-full border rounded px-3 py-2" value={key} onChange={e=>setKey(e.target.value)} placeholder="token opcional" />
          </div>
          <div className="flex items-center space-x-3">
            <input id="hidelangs" type="checkbox" checked={hideLangs} onChange={e=>setHideLangs(e.target.checked)} />
            <label htmlFor="hidelangs">Ocultar selección de idiomas</label>
          </div>
          <div>
            <label className="block text-sm font-medium">Usuario SMB (opcional)</label>
            <input className="w-full border rounded px-3 py-2" value={smbUser} onChange={e=>setSmbUser(e.target.value)} placeholder="usuario" />
          </div>
          <div>
            <label className="block text-sm font-medium">Contraseña SMB (opcional)</label>
            <input className="w-full border rounded px-3 py-2" value={smbPass} onChange={e=>setSmbPass(e.target.value)} placeholder="contraseña" type="password" />
          </div>
          <div>
            <label className="block text-sm font-medium">Imagen de fondo (elegir foto de la tablet)</label>
            <div className="flex items-center gap-2">
              <input id="bgfile" type="file" accept="image/*" onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const reader = new FileReader();
                  reader.onload = () => { try { setBg(String(reader.result || '')); } catch(e){} };
                  reader.readAsDataURL(f);
                } catch (err) { console.error('read bg failed', err); }
              }} />
              <button type="button" onClick={() => { setBg(''); try { localStorage.removeItem('checkin_bg'); } catch{} }} className="px-3 py-2 border rounded">Eliminar</button>
            </div>
            {bg && <div className="mt-2"><img src={bg} alt="preview" className="h-32 rounded object-cover" /></div>}
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="space-x-2">
            <button onClick={() => { try { const csv = require('../utils/offlineQueue').exportAccessLogCSV(); const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'access_log.csv'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); } catch(e){console.error(e);} }} className="px-3 py-2 border rounded">Exportar log CSV</button>
            <button onClick={() => { try { localStorage.removeItem('hiposuite_offline_queue_v1'); alert('Cola eliminada'); } catch(e){console.error(e);} }} className="px-3 py-2 border rounded">Vaciar cola</button>
            <button onClick={onDeployExcelServer} className="px-3 py-2 border rounded">Desplegar Excel Server</button>
            <button onClick={onDeploySmbPlugin} className="px-3 py-2 border rounded">Desplegar Plugin SMB</button>
          </div>
          <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
            <button onClick={save} className="px-4 py-2 bg-hipo-blue text-white rounded">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
