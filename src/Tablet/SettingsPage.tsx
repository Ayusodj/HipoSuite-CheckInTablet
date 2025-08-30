import React, { useState, useEffect } from 'react';
import { deployBundledFileToSmb } from '../services/deploy';
import { exportAccessLogCSV } from '../utils/offlineQueue';

const SettingsPage: React.FC<{ onClose: ()=>void }> = ({ onClose }) => {
  const [url, setUrl] = useState(() => { try { return localStorage.getItem('excel_server_url') || ''; } catch { return ''; } });
  const [path, setPath] = useState(() => { try { return localStorage.getItem('excel_server_path') || ''; } catch { return ''; } });
  const [key, setKey] = useState(() => { try { return localStorage.getItem('excel_server_key') || ''; } catch { return ''; } });
  // SMB credentials removed — access the SMB file from a PC. When opening it
  // the share will prompt for user/pass (use admin:admin on test setups).
  const [hiddenLangs, setHiddenLangs] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('checkin_hidden_langs') || '[]'); } catch { return []; } });
  const [bg, setBg] = useState<string>(() => { try { return localStorage.getItem('checkin_bg') || ''; } catch { return ''; } });
  
  useEffect(() => { try { localStorage.setItem('checkin_hidden_langs', JSON.stringify(hiddenLangs || [])); } catch {} }, [hiddenLangs]);
  useEffect(() => { try { localStorage.setItem('checkin_bg', bg); } catch {} }, [bg]);

  const save = () => {
  try { localStorage.setItem('excel_server_url', url || ''); localStorage.setItem('excel_server_path', path || ''); localStorage.setItem('excel_server_key', key || ''); } catch(e){}
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
          <div className="flex gap-2 items-center">
            <button onClick={onDeployExcelServer} className="px-3 py-2 border rounded">Desplegar Excel Server</button>
            <div className="text-sm text-gray-600">Despliega un pequeño servicio JS en la ruta indicada para recibir check-ins desde la tablet.</div>
          </div>
          <div>
            <label className="block text-sm font-medium">Ruta/archivo en el servidor</label>
            <input className="w-full border rounded px-3 py-2" value={path} onChange={e=>setPath(e.target.value)} placeholder="/shared/checkins.xlsx" />
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={onDeploySmbPlugin} className="px-3 py-2 border rounded">Desplegar Plugin SMB</button>
            <div className="text-sm text-gray-600">Introduce la ruta o URL donde quieres que se guarde el fichero resultante en 'ruta/archivo en el servidor'. Atención: si indicas una ruta SMB, el acceso al fichero se realiza desde un PC que monte esa carpeta (al abrir pedirá usuario/contraseña). Para guardar automáticamente desde la app se recomienda usar un servicio HTTP (endpoint) en servidor que reciba los datos y escriba el Excel en la ruta indicada.</div>
          </div>
          <div>
            <label className="block text-sm font-medium">Clave API (opcional)</label>
            <input className="w-full border rounded px-3 py-2" value={key} onChange={e=>setKey(e.target.value)} placeholder="token opcional" />
          </div>
          <div>
            <label className="block text-sm font-medium">Ocultar idiomas (selecciona los que quieras ocultar en la pantalla)</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                ['es','🇪🇸'],['en','🇬🇧'],['fr','🇫🇷'],['de','🇩🇪'],['it','🇮🇹'],['pt','🇵🇹'],['ru','🇷🇺'],['nl','🇳🇱'],['be','🇧🇪'],['pl','🇵🇱'],['no','🇳🇴'],['sv','🇸🇪'],['fi','🇫🇮'],['cs','🇨🇿']
              ].map(([code,flag]) => {
                const c = code as string;
                const hidden = (hiddenLangs || []).includes(c);
                return (
                  <label key={c} className="flex items-center space-x-2">
                    <input type="checkbox" checked={hidden} onChange={(e)=>{
                      const next = new Set(hiddenLangs || []);
                      if (e.target.checked) next.add(c); else next.delete(c);
                      setHiddenLangs(Array.from(next));
                    }} />
                    <span className="text-lg">{flag}</span>
                    <span className="text-sm">{c}</span>
                  </label>
                );
              })}
            </div>
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
            <button onClick={() => {
              try {
                const csv = exportAccessLogCSV();
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'access_log.csv';
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              } catch (e) {
                console.error(e);
                alert('Error al exportar CSV');
              }
            }} className="px-3 py-2 border rounded">Exportar log CSV</button>
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
