import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminStoragePage() {
  const { getAuthHeader, currentUser } = useAuth();
  const [config, setConfig] = useState<any>(null);
  const [rootPath, setRootPath] = useState('');
  const [rulesText, setRulesText] = useState('');
  const [rules, setRules] = useState<Array<any>>([]);
  const [msg, setMsg] = useState('');
  const [browserOpen, setBrowserOpen] = useState(false);
  const [browserPath, setBrowserPath] = useState('/');
  const [browserDirs, setBrowserDirs] = useState<Array<any>>([]);
  const [dynBuckets, setDynBuckets] = useState<Array<string>>([]);

  async function loadConfig() {
    try {
      const res = await fetch('/api/admin/storage_config/', { headers: getAuthHeader() });
      if (res.status === 401) {
        setMsg('Unauthorized');
        return;
      }
      const j = await res.json();
      setConfig(j.config);
      if (j.config) {
        setRootPath(j.config.root_path || '');
        const r = j.config.rules || [];
        setRules(r);
        setRulesText(JSON.stringify(r, null, 2));
      }
    } catch (e) {
      setMsg('Error loading config');
    }
  }

  useEffect(() => { loadConfig(); }, [getAuthHeader]);

  useEffect(() => { loadDynamicBuckets(); }, [getAuthHeader]);

  async function loadDynamicBuckets() {
    try {
      const res = await fetch('/api/buckets/?dynamic_only=1', { headers: getAuthHeader() });
      if (!res.ok) return;
      const j = await res.json();
      setDynBuckets(j.buckets || []);
    } catch (e) {
      // ignore
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
  // use rules state
  const parsedRules = rules;
    try {
      const res = await fetch('/api/admin/storage_config/set/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ root_path: rootPath, rules: parsedRules }),
      });
      const j = await res.json();
      if (res.ok) {
        setConfig(j.config);
        setMsg('Saved');
      } else {
        if (j.details) setMsg(String(j.details.join('; ')));
        else setMsg(j.error || 'Error');
      }
    } catch (err) {
      setMsg('Network error');
    }
  }

  async function validateOnly(e: React.FormEvent) {
    e.preventDefault();
    const parsedRules = rules;
    try {
      const res = await fetch('/api/admin/storage_config/set/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ root_path: rootPath, rules: parsedRules, validate_only: true }),
      });
      const j = await res.json();
      if (res.ok) {
        setMsg('Validation OK');
      } else {
        if (j.details) setMsg(String(j.details.join('; ')));
        else setMsg(j.error || 'Error');
      }
    } catch (err) {
      setMsg('Network error');
    }
  }

  async function openAdmin() {
    try {
      const res = await fetch('/api/admin/create_session/', {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        // navigate in same tab so admin stays in backend UI
        window.location.href = '/admin/';
      } else {
        const j = await res.json().catch(()=>({}));
        setMsg('No se pudo abrir admin: ' + (j.error || res.status));
      }
    } catch (err) {
      setMsg('Network error');
    }
  }

  async function registerBucket() {
    // legacy left in place but no-op; modal is used instead
    return;
  }

  // --- register modal state & handlers ---
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerError, setRegisterError] = useState('');

  function openRegisterModal() {
    if (!rootPath) { setMsg('El path está vacío'); return; }
    const defaultName = rootPath.replace(/\/$/, '').split('/').pop() || 'bucket';
    setRegisterName(defaultName);
    setRegisterError('');
    setRegisterOpen(true);
  }

  async function registerConfirm() {
    if (!registerName) { setRegisterError('El nombre no puede estar vacío'); return; }
    try {
      const res = await fetch('/api/storage/register_bucket/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        credentials: 'include',
        body: JSON.stringify({ name: registerName, path: rootPath }),
      });
      const j = await res.json().catch(()=>({}));
      if (res.ok) {
        setMsg('Bucket registrado: ' + registerName);
        setRegisterOpen(false);
        await loadConfig();
      } else {
        setRegisterError(j.error || (j.details ? String(j.details) : String(res.status)));
      }
    } catch (err) {
      setRegisterError('Network error');
    }
  }

  async function openBrowser(startPath?: string) {
    setBrowserOpen(true);
    const p = startPath || rootPath || '/';
    setBrowserPath(p);
    await loadBrowser(p);
  }

  async function loadBrowser(pathToLoad: string) {
    try {
      const res = await fetch(`/api/admin/list_dirs/?path=${encodeURIComponent(pathToLoad)}`, { headers: getAuthHeader() });
      if (!res.ok) {
        const j = await res.json();
        setMsg(j.error || 'Error listing dirs');
        return;
      }
      const j = await res.json();
      setBrowserDirs(j.dirs || []);
      setBrowserPath(j.path || pathToLoad);
    } catch (err) {
      setMsg('Network error');
    }
  }

  function chooseDir(p: string) {
    setRootPath(p);
    setBrowserOpen(false);
    setMsg(`Selected: ${p}`);
  }

  function updateRule(index: number, field: string, value: string) {
    setRules(prev => {
      const copy = [...prev];
      const r = { ...(copy[index] || { subpath: '', allowed_roles: [], allowed_departments: [] }) };
      if (field === 'subpath') r.subpath = value;
      else if (field === 'allowed_roles') r.allowed_roles = value.split(',').map(s=>s.trim()).filter(Boolean);
      else if (field === 'allowed_departments') r.allowed_departments = value.split(',').map(s=>s.trim()).filter(Boolean);
      copy[index] = r;
      setRulesText(JSON.stringify(copy, null, 2));
      return copy;
    });
  }

  function addRule() {
    setRules(prev => { const n = [...prev, { subpath: '', allowed_roles: [], allowed_departments: [] }]; setRulesText(JSON.stringify(n,null,2)); return n; });
  }

  function removeRule(i: number) {
    setRules(prev => { const n = prev.filter((_,idx)=>idx!==i); setRulesText(JSON.stringify(n,null,2)); return n; });
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return <div>No autorizado</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Administrar almacenamiento</h2>
      {msg && <div className="mt-2 text-sm text-red-600">{msg}</div>}
      <form onSubmit={save} className="mt-4">
        <label className="block">Root path</label>
        <div className="flex">
          <input value={rootPath} onChange={e => setRootPath(e.target.value)} className="border p-2 w-full" />
          <button type="button" onClick={() => openBrowser()} className="ml-2 bg-gray-500 text-white px-3">Seleccionar carpeta</button>
          <button type="button" onClick={openRegisterModal} className="ml-2 bg-emerald-600 text-white px-3" title="Registrar la carpeta seleccionada como bucket">Implementar como bucket</button>
          <button type="button" onClick={openAdmin} className="ml-2 bg-indigo-600 text-white px-3" title="Se creará una sesión admin y se abrirá /admin/ en esta pestaña">Abrir panel admin</button>
          <span className="ml-2 text-xs text-gray-500 self-center">Al hacer clic se creará una sesión admin y se abrirá /admin/ en la misma pestaña</span>
        </div>
        <label className="block mt-2">Rules (por subcarpeta)</label>
        <div className="mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Subpath</th>
                <th className="text-left">Allowed roles (coma)</th>
                <th className="text-left">Allowed departments (coma)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r, idx) => (
                <tr key={idx} className="align-top">
                  <td className="p-1"><input value={r.subpath || ''} onChange={e => updateRule(idx,'subpath', e.target.value)} className="border p-1 w-full" /></td>
                  <td className="p-1"><input value={(r.allowed_roles||[]).join(',')} onChange={e => updateRule(idx,'allowed_roles', e.target.value)} className="border p-1 w-full" /></td>
                  <td className="p-1"><input value={(r.allowed_departments||[]).join(',')} onChange={e => updateRule(idx,'allowed_departments', e.target.value)} className="border p-1 w-full" /></td>
                  <td className="p-1"><button type="button" onClick={() => removeRule(idx)} className="text-red-600">Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2">
            <button type="button" onClick={addRule} className="bg-green-600 text-white px-3 py-1">Añadir regla</button>
          </div>
        </div>
        <button className="mt-2 bg-blue-600 text-white px-4 py-2">Guardar</button>
  <button onClick={validateOnly} className="mt-2 ml-2 bg-gray-600 text-white px-4 py-2">Validar</button>
      </form>
      <div className="mt-4">
        <h3 className="font-semibold">Current config</h3>
        <pre className="bg-gray-100 p-2">{config ? JSON.stringify(config,null,2) : 'No configurado'}</pre>
        <h3 className="font-semibold mt-4">Buckets añadidos desde la app</h3>
        <ul className="mt-2">
          {dynBuckets.map((b) => (
            <li key={b} className="p-1 bg-emerald-400 text-white w-1/2 mb-1">{b}</li>
          ))}
        </ul>
      </div>
      {browserOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 w-3/4 max-h-3/4 overflow-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Explorar: {browserPath}</h3>
              <button onClick={() => setBrowserOpen(false)} className="text-red-600">Cerrar</button>
            </div>
            <div className="mt-2">
              <button onClick={() => loadBrowser('/')}>/</button>
              <button onClick={() => loadBrowser(browserPath + '/..')} className="ml-2">Subir</button>
            </div>
            <ul className="mt-2">
              {browserDirs.map((d,i)=> (
                <li key={i} className="flex justify-between items-center p-1 border-b">
                  <span>{d.name}</span>
                  <div>
                    <button onClick={() => loadBrowser(d.path)} className="mr-2 text-blue-600">Abrir</button>
                    <button onClick={() => chooseDir(d.path)} className="text-green-600">Seleccionar</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {registerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 w-1/3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Registrar bucket</h3>
              <button onClick={() => setRegisterOpen(false)} className="text-red-600">Cerrar</button>
            </div>
            <div className="mt-4">
              <label className="block text-sm">Ruta</label>
              <div className="text-xs text-gray-600 p-2 bg-gray-100">{rootPath}</div>
              <label className="block text-sm mt-2">Identificador (nombre)</label>
              <input value={registerName} onChange={e => setRegisterName(e.target.value)} className="border p-2 w-full" />
              {registerError && <div className="text-sm text-red-600 mt-2">{registerError}</div>}
              <div className="flex justify-end mt-4">
                <button onClick={() => setRegisterOpen(false)} className="mr-2 px-3 py-1 border">Cancelar</button>
                <button onClick={registerConfirm} className="px-3 py-1 bg-emerald-600 text-white">Registrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
