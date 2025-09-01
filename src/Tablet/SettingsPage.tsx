import React, { useState, useEffect } from 'react';
import { deployBundledFileToSmb } from '../services/deploy';
import { exportAccessLogCSV } from '../utils/offlineQueue';

const SettingsPage: React.FC<{ onClose: ()=>void }> = ({ onClose }) => {
  const [url, setUrl] = useState(() => { try { return localStorage.getItem('excel_server_url') || ''; } catch { return ''; } });
  const [path, setPath] = useState(() => { try { return localStorage.getItem('excel_server_path') || ''; } catch { return ''; } });
  const [key, setKey] = useState(() => { try { return localStorage.getItem('excel_server_key') || ''; } catch { return ''; } });
  // SMB credentials (optional) — the app can store them to let a native plugin write to SMB
  const [smbUser, setSmbUser] = useState(() => { try { return localStorage.getItem('excel_smb_user') || ''; } catch { return ''; } });
  const [smbPass, setSmbPass] = useState(() => { try { return localStorage.getItem('excel_smb_pass') || ''; } catch { return ''; } });
  const [encryptEnabled, setEncryptEnabled] = useState(() => { try { return (localStorage.getItem('excel_smb_encrypt') || 'false') === 'true'; } catch { return false; } });
  const [keyAlias, setKeyAlias] = useState(() => { try { return localStorage.getItem('excel_smb_key_alias') || 'hipo_smb_key'; } catch { return 'hipo_smb_key'; } });
  const [passphrase, setPassphrase] = useState(() => { try { return localStorage.getItem('excel_smb_passphrase') || ''; } catch { return ''; } });
  const [protectExcel, setProtectExcel] = useState(() => { try { return (localStorage.getItem('excel_protect_xlsx') || 'false') === 'true'; } catch { return false; } });
  const [excelPassword, setExcelPassword] = useState(() => { try { return localStorage.getItem('excel_password') || ''; } catch { return ''; } });
  const [pathValid, setPathValid] = useState<boolean | null>(null);
  const [hiddenLangs, setHiddenLangs] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('checkin_hidden_langs') || '[]'); } catch { return []; } });
  const [bg, setBg] = useState<string>(() => { try { return localStorage.getItem('checkin_bg') || ''; } catch { return ''; } });
  
  useEffect(() => { try { localStorage.setItem('checkin_hidden_langs', JSON.stringify(hiddenLangs || [])); } catch {} }, [hiddenLangs]);
  useEffect(() => { try { localStorage.setItem('checkin_bg', bg); } catch {} }, [bg]);

  const save = () => {
  try {
    localStorage.setItem('excel_server_url', url || '');
    localStorage.setItem('excel_server_path', path || '');
    localStorage.setItem('excel_server_key', key || '');
    localStorage.setItem('excel_smb_user', smbUser || '');
    localStorage.setItem('excel_smb_pass', smbPass || '');
  localStorage.setItem('excel_smb_encrypt', encryptEnabled ? 'true' : 'false');
  localStorage.setItem('excel_smb_key_alias', keyAlias || 'hipo_smb_key');
  localStorage.setItem('excel_smb_passphrase', passphrase || '');
  localStorage.setItem('excel_protect_xlsx', protectExcel ? 'true' : 'false');
  localStorage.setItem('excel_password', excelPassword || '');
  } catch(e){}
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
            <input className="w-full border rounded px-3 py-2" value={path} onChange={e=>{ const v = e.target.value; setPath(v); try { // basic validation: UNC, smb://, absolute unix or windows path
                  const isUNC = v.startsWith('\\\\') || v.startsWith('\\') || v.startsWith('smb://') || v.startsWith('/') || /^[A-Za-z]:\\/.test(v);
                  setPathValid(!!v ? isUNC : null);
                } catch { setPathValid(null); } }} placeholder="\\HIPOTELS.PRI\cmp\Recepcion\checkins.xlsx or /srv/shared/checkins.xlsx" />
            {pathValid === false && <div className="text-sm text-red-600 mt-1">La ruta no parece ser UNC (\\server\share...) ni una ruta local absoluta. Revisa el formato.</div>}
            {pathValid === null && <div className="text-sm text-gray-500 mt-1">Introduce una ruta UNC (\\server\share\file) o una ruta absoluta del servidor (/path/to/file o C:\\path\\to\\file).</div>}
          </div>
          <div>
            <label className="block text-sm font-medium">Credenciales SMB (opcional)</label>
            <div className="flex gap-2">
              <input className="w-1/2 border rounded px-3 py-2" value={smbUser} onChange={e=>setSmbUser(e.target.value)} placeholder="usuario SMB (opcional)" />
              <input type="password" className="w-1/2 border rounded px-3 py-2" value={smbPass} onChange={e=>setSmbPass(e.target.value)} placeholder="contraseña SMB (opcional)" />
            </div>
            <div className="text-sm text-gray-600 mt-1">Si usas un plugin nativo para SMB la app intentará usar estas credenciales para escribir en la ruta indicada; en pruebas puedes dejarlo vacío y abrir el fichero desde el PC.</div>
          </div>
          <div>
            <label className="block text-sm font-medium">Cifrado antes de escribir (Android KeyStore)</label>
            <div className="flex items-center gap-3 mt-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={encryptEnabled} onChange={e=>setEncryptEnabled(e.target.checked)} />
                <span className="text-sm">Activar cifrado AES-GCM usando Android KeyStore</span>
              </label>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium">Alias de clave (KeyStore)</label>
              <input className="w-full border rounded px-3 py-2" value={keyAlias} onChange={e=>setKeyAlias(e.target.value)} placeholder="hipo_smb_key" />
              <div className="text-sm text-gray-600 mt-1">La clave se creará/almacenará en Android KeyStore bajo este alias. Recomendado: dejar 'hipo_smb_key'.</div>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium">Frase compartida (usuario+contraseña)</label>
              <input type="password" className="w-full border rounded px-3 py-2" value={passphrase} onChange={e=>setPassphrase(e.target.value)} placeholder="usuario+contraseña" />
              <div className="text-sm text-gray-600 mt-1">Si indicas una frase, la app derivará una clave de ella y el PC podrá descifrar los archivos con la misma frase.</div>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium">Proteger XLSX para Excel</label>
              <div className="flex items-center gap-3 mt-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={protectExcel} onChange={e=>setProtectExcel(e.target.checked)} />
                  <span className="text-sm">Generar/actualizar un .xlsx protegido con contraseña</span>
                </label>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium">Contraseña XLSX</label>
                <input type="password" className="w-full border rounded px-3 py-2" value={excelPassword} onChange={e=>setExcelPassword(e.target.value)} placeholder="Contraseña para abrir en Excel (p.ej. admin:admin)" />
                <div className="text-sm text-gray-600 mt-1">Si la opción está activada, la app generará un archivo .xlsx que pedirá esta contraseña al abrir en Excel.</div>
              </div>
            </div>
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
