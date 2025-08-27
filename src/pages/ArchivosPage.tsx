import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CloudIcon, FolderIcon, DocumentIcon, UploadIcon, FolderPlusIcon, SearchIcon, ChevronRightIcon, ChevronDownIcon, XMarkIcon, PencilIcon, TrashIcon, DownloadIcon, ArrowsRightLeftIcon } from '../components/icons/Icons';

type DirEntry = {
  name: string;
  path: string;
  is_dir: boolean;
  size?: number | null;
  mtime?: string | null;
};

// =================================================================================================
// Sub-components
// =================================================================================================

const TreeNode: React.FC<{ node: DirEntry; onSelect: (path: string) => void; onDropFolder: (e: React.DragEvent, path: string) => void; onDragOver: (e: React.DragEvent) => void; selectedPath: string; selectedBucket: string | null }> = ({ node, onSelect, onDropFolder, onDragOver, selectedPath, selectedBucket }) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [children, setChildren] = useState<DirEntry[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const auth = useAuth();

  const isSelected = selectedPath === node.path || selectedPath.startsWith(node.path + '/');

  const fetchChildren = useCallback(async () => {
    if (!selectedBucket) return;
    try {
      const h = auth.getAuthHeader ? auth.getAuthHeader() : {};
      const res = await fetch(`/api/admin/list_dirs/?bucket=${encodeURIComponent(selectedBucket)}&path=${encodeURIComponent(node.path)}`, { headers: h });
      if (res.ok) {
        const j: { dirs?: DirEntry[] } = await res.json();
        setChildren(j.dirs || []);
      }
    } catch (e) {
      console.error("Failed to fetch children", e);
    }
  }, [auth, node.path, selectedBucket]);

  const handleToggle = () => {
    if (!expanded) {
      fetchChildren();
    }
    setExpanded(!expanded);
  };

  const handleDragOverLocal = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    if (onDragOver) onDragOver(e);
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeaveLocal = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDropLocal = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (onDropFolder) onDropFolder(e, node.path);
  };

  return (
    <div className="ml-4">
      <div
        className={`flex items-center p-1 rounded-md cursor-pointer ${isDragOver ? 'bg-blue-100' : ''} ${isSelected ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        onDragOver={handleDragOverLocal}
        onDragLeave={handleDragLeaveLocal}
        onDrop={handleDropLocal}
        onClick={() => onSelect(node.path)}
      >
        <div onClick={handleToggle} className="flex items-center flex-grow">
          {expanded ? <ChevronDownIcon className="w-4 h-4 mr-1" /> : <ChevronRightIcon className="w-4 h-4 mr-1" />}
          <FolderIcon className="w-5 h-5 text-yellow-500 mr-2" />
          <span className="text-sm font-medium truncate">{node.name === '/' ? 'Raíz' : node.name}</span>
        </div>
      </div>
      {expanded && (
        <div className="border-l-2 border-gray-200 ml-3">
          {children.map(child => (
            <TreeNode key={child.path} node={child} onSelect={onSelect} onDropFolder={onDropFolder} onDragOver={onDragOver} selectedPath={selectedPath} selectedBucket={selectedBucket} />
          ))}
        </div>
      )}
    </div>
  );
}

// =================================================================================================
// Main Page Component
// =================================================================================================

const ArchivosPage: React.FC = () => {
  const auth = useAuth();
  const [buckets, setBuckets] = useState<string[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [entries, setEntries] = useState<DirEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DirEntry | null>(null);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  
  const [rightPanel, setRightPanel] = useState<'properties' | 'filters' | null>(null);
  
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const [filterExt, setFilterExt] = useState('');
  const [filterMinSize, setFilterMinSize] = useState<string>('');
  const [filterMaxSize, setFilterMaxSize] = useState<string>('');
  const [filterMtimeAfter, setFilterMtimeAfter] = useState<string>('');
  const [filterMtimeBefore, setFilterMtimeBefore] = useState<string>('');
  
  const [page, setPage] = useState(1);
  const [perPage] = useState(50);
  const [total, setTotal] = useState(0);
  
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Data Fetching
  useEffect(() => {
    fetch('/api/buckets/')
      .then(r => r.json())
      .then(j => setBuckets(j.buckets || []))
      .catch(() => setBuckets([]));
  }, []);

  const loadDir = useCallback(async (path: string, pageNum = 1) => {
    if (!selectedBucket) return;
    setMessage(null);
    setCurrentPath(path);
    try {
      const headers = auth.getAuthHeader ? auth.getAuthHeader() : {};
      const res = await fetch(`/api/admin/dir_contents/?bucket=${encodeURIComponent(selectedBucket)}&path=${encodeURIComponent(path)}&page=${pageNum}&per_page=${perPage}`, { headers });
      if (!res.ok) { 
        setEntries([]); 
        setMessage('Error al listar el directorio.'); 
        return; 
      }
      const j = await res.json();
      const combined: DirEntry[] = [
        ...(j.dirs || []).map((d: any) => ({ ...d, is_dir: true })),
        ...(j.files || []).map((f: any) => ({ ...f, is_dir: false })),
      ];
      setEntries(combined);
      setTotal(j.total || combined.length);
    } catch (e) { 
      setEntries([]); 
      setMessage('Error de red al cargar el directorio.'); 
    }
  }, [auth, selectedBucket, perPage]);

  useEffect(() => {
    if (selectedBucket) {
      loadDir('/');
    } else {
      setEntries([]);
      setCurrentPath('/');
    }
  }, [selectedBucket, loadDir]);

  // Actions
  const handleSelectEntry = (entry: DirEntry) => {
    setSelectedEntry(entry);
    setRightPanel('properties');
    setIsRenaming(false);
    setRenameValue(entry.name);
  };

  const handleBucketSelect = (b: string) => {
    setSelectedBucket(b);
    setCurrentPath('/');
    setSelectedEntry(null);
    setRightPanel(null);
  };

  const upload = async (file: File, destRelPath?: string) => {
    if (!selectedBucket) { setMessage('Seleccione un bucket'); return; }
      const form = new FormData();
      form.append('bucket', selectedBucket);
    const dest = destRelPath ? destRelPath.replace(/^\//, '') : (currentPath ? currentPath.replace(/^\//, '') : '');
    if (dest) form.append('path', dest);
      form.append('file', file);
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/storage/upload/');
        const headers = auth.getAuthHeader ? auth.getAuthHeader() : {};
        Object.entries(headers).forEach(([k,v])=> xhr.setRequestHeader(k, v as string));
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(prev => ({ ...prev, [file.name]: pct }));
        }};
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            try {
              const j = JSON.parse(xhr.responseText || '{}');
              if (xhr.status >= 200 && xhr.status < 300) {
                setMessage('Subido: ' + j.path);
                setUploadProgress(prev => { const p = { ...prev }; delete p[file.name]; return p; });
                loadDir(currentPath || '/');
              } else { setMessage(j.error || 'Error al subir'); }
            } catch (e) { setMessage('Error al subir'); }
          }
        };
        xhr.send(form);
      } catch (e) { setMessage('Network error'); }
    };

  const handleDragStart = (e: React.DragEvent, en: DirEntry) => {
    e.dataTransfer.setData('application/x-entry-path', en.path);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnFolder = async (e: React.DragEvent, targetFolderPath?: string) => {
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const items = e.dataTransfer.items;
      if (items && items.length && (items as any)[0].webkitGetAsEntry) {
        const collect = async () => {
          const results: Array<{ file: File; relPath: string }> = [];
          const traverse = (entry: any, pathPrefix = ''): Promise<void> => new Promise((resolve) => {
            if (!entry) return resolve();
            if (entry.isFile) {
              entry.file((file: File) => { results.push({ file, relPath: (pathPrefix + file.name).replace(/^\/+/, '') }); resolve(); });
            } else if (entry.isDirectory) {
              const dirReader = entry.createReader();
              dirReader.readEntries(async (entries: any[]) => {
                for (const e2 of entries) {
                  await traverse(e2, pathPrefix + entry.name + '/');
                }
                resolve();
              });
            } else {
              resolve();
            }
          });

          const promises: Promise<void>[] = [];
          for (let i = 0; i < items.length; i++) {
            const it = (items as any)[i];
            const entry = it.webkitGetAsEntry ? it.webkitGetAsEntry() : null;
            if (entry) promises.push(traverse(entry, ''));
          }
          await Promise.all(promises);
          return results;
        };

        try {
          const filesWithPaths = await collect();
          for (const fwp of filesWithPaths) {
            const targetBase = (targetFolderPath || currentPath || '/').replace(/^\//, '');
            const dest = (targetBase ? targetBase + '/' : '') + fwp.relPath;
            await upload(fwp.file, dest);
          }
        } catch (err) { setMessage('Error al subir desde arrastre'); }
      } else {
        const files = e.dataTransfer.files;
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          try { await upload(f, (targetFolderPath || currentPath || '/')); } catch (err) { setMessage('Error al subir desde arrastre'); }
        }
      }
      loadDir(currentPath || '/');
      return;
    }

    const src = e.dataTransfer.getData('application/x-entry-path');
    if (src) {
      const destRel = targetFolderPath || currentPath || '/';
      try {
        const headers = Object.assign({'Content-Type':'application/json'}, auth.getAuthHeader ? auth.getAuthHeader() : {});
        const res = await fetch('/api/storage/rename/', { method: 'POST', headers, body: JSON.stringify({ bucket: selectedBucket, path: src, dest_path: destRel.replace(/^\//, ''), create_dirs: true }) });
        const j = await res.json().catch(()=>({}));
        if (!res.ok) { setMessage(j.error || 'Error al mover'); return; }
        setMessage('Movido'); loadDir(currentPath);
      } catch (e) { setMessage('Network error'); }
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; };

  const doSearch = async () => {
    try {
      const headers = auth.getAuthHeader ? auth.getAuthHeader() : {};
      const url = `/api/storage/search/?q=${encodeURIComponent(query)}${selectedBucket?`&bucket=${encodeURIComponent(selectedBucket)}`:''}`;
      const res = await fetch(url, { headers });
      const j = await res.json();
      if (!res.ok) { setMessage(j.error||'Error en búsqueda'); return; }
      setEntries((j.results||[]).map((r:any)=>({ name: r.name, path: r.path, is_dir: false })));
      setMessage(`${(j.results||[]).length} resultados`);
    } catch (e) { setMessage('Network error'); }
  };

  const applyFilters = async () => {
    try {
      const headers = auth.getAuthHeader ? auth.getAuthHeader() : {};
      const params = new URLSearchParams();
      if (selectedBucket) params.set('bucket', selectedBucket);
      if (filterExt) params.set('ext', filterExt.replace(/\s+/g, ''));
      if (filterMinSize) params.set('min_size', filterMinSize);
      if (filterMaxSize) params.set('max_size', filterMaxSize);
      if (filterMtimeAfter) params.set('mtime_after', String(new Date(filterMtimeAfter).getTime()/1000));
      if (filterMtimeBefore) params.set('mtime_before', String(new Date(filterMtimeBefore).getTime()/1000));
      const url = `/api/storage/filters/?${params.toString()}`;
      const res = await fetch(url, { headers });
      const j = await res.json();
      if (!res.ok) { setMessage(j.error || 'Error al aplicar filtros'); return; }
      setEntries((j.results||[]).map((r:any)=>({ name: r.name, path: r.path, is_dir: false, size: r.size, mtime: r.mtime })));
      setMessage(`${(j.results||[]).length} resultados (filtros)`);
    } catch (e) { setMessage('Network error'); }
  };

  const createFolder = async () => {
    if (!currentPath) { setMessage('Seleccione una carpeta padre'); return; }
    try {
      const headers = Object.assign({'Content-Type':'application/json'}, auth.getAuthHeader ? auth.getAuthHeader() : {});
      const res = await fetch('/api/admin/create_folder/', { method: 'POST', headers, body: JSON.stringify({ bucket: selectedBucket, parent_path: currentPath, name: newFolderName }) });
      const j = await res.json().catch(()=> ({}));
      if (!res.ok) { setMessage(j.error || 'Error al crear carpeta'); return; }
      setMessage('Carpeta creada'); setShowCreateFolder(false); setNewFolderName(''); loadDir(currentPath);
    } catch (e) { setMessage('Network error'); }
  };

  const downloadFile = async (path: string) => {
    try {
      const headers = auth.getAuthHeader ? auth.getAuthHeader() : {};
      const url = `/api/storage/download/?bucket=${encodeURIComponent(selectedBucket||'')}&path=${encodeURIComponent(path)}`;
      const res = await fetch(url, { headers });
      if (!res.ok) { const j = await res.json().catch(()=> ({})); setMessage(j.error || 'Error al descargar'); return; }
      const blob = await res.blob(); const a = document.createElement('a'); const href = URL.createObjectURL(blob); a.href = href; a.download = path.split('/').pop() || 'file'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(href);
    } catch (e) { setMessage('Network error'); }
  };

  const deleteFile = async (path: string) => {
    const ok = window.confirm(`¿Borrar ${path}? Esta acción no se puede deshacer.`); if (!ok) return;
    try {
      const headers = Object.assign({'Content-Type':'application/json'}, (auth.getAuthHeader ? auth.getAuthHeader() : {}));
      const res = await fetch('/api/storage/delete/', { method: 'POST', headers, body: JSON.stringify({ bucket: selectedBucket, path }) });
      const j = await res.json().catch(()=> ({})); if (!res.ok) { setMessage(j.error || 'Error al borrar'); return; }
      setMessage('Borrado'); loadDir(currentPath || '/');
      if (selectedEntry && selectedEntry.path === path) {
        setSelectedEntry(null); setRightPanel(null);
      }
    } catch (e) { setMessage('Network error'); }
  };

  const handleRename = async () => {
    if (!selectedBucket || !selectedEntry) { setMessage('Seleccione un bucket y un elemento'); setIsRenaming(false); return; }
    if (!renameValue || renameValue === selectedEntry.name) { setIsRenaming(false); return; }
    try {
      const headers = Object.assign({'Content-Type':'application/json'}, auth.getAuthHeader ? auth.getAuthHeader() : {});
      const res = await fetch('/api/storage/rename/', { method: 'POST', headers, body: JSON.stringify({ bucket: selectedBucket, path: selectedEntry.path, new_name: renameValue }) });
      const j = await res.json().catch(()=>({}));
      if (!res.ok) { setMessage(j.error || 'Error al renombrar'); return; }
      setMessage('Renombrado'); setIsRenaming(false); loadDir(currentPath);
    } catch (e) { setMessage('Network error'); }
  };

  const handleMove = async () => {
    if (!selectedEntry) return;
    const dest = window.prompt('Ruta destino (relativa al bucket), ejemplo: carpeta/subcarpeta');
    if (!dest) return;
    try {
      const headers = Object.assign({'Content-Type':'application/json'}, auth.getAuthHeader ? auth.getAuthHeader() : {});
      const res = await fetch('/api/storage/rename/', { method: 'POST', headers, body: JSON.stringify({ bucket: selectedBucket, path: selectedEntry.path, dest_path: dest.replace(/^\//,''), create_dirs: true }) });
      const j = await res.json().catch(()=>({}));
      if (!res.ok) { setMessage(j.error || 'Error al mover'); return; }
      setMessage('Movido'); loadDir(currentPath);
    } catch (e) { setMessage('Network error'); }
  };

  const formatBytes = (bytes: number | null | undefined, decimals = 2) => {
    if (bytes === null || typeof bytes === 'undefined') return '--';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '--';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  }

  // Render
  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CloudIcon className="w-6 h-6 text-gray-600" />
            <h1 className="text-lg font-semibold text-gray-800">Explorador de Archivos</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCreateFolder(true)} className="p-2 rounded-md hover:bg-gray-100" title="Nueva Carpeta"><FolderPlusIcon className="w-5 h-5 text-gray-600" /></button>
            <input id="file-upload-input" type="file" multiple className="hidden" onChange={e => { if (e.target.files) Array.from(e.target.files).forEach(f => upload(f as File)); }} />
            <button onClick={() => document.getElementById('file-upload-input')?.click()} className="p-2 rounded-md hover:bg-gray-100" title="Subir Archivos"><UploadIcon className="w-5 h-5 text-gray-600" /></button>
          </div>
        </div>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar en el bucket actual..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              className="w-full pl-10 pr-4 py-2 text-sm border rounded-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
            <div className="flex items-center gap-2">
            <button onClick={() => setRightPanel(rightPanel === 'properties' ? null : 'properties')} className={`px-4 py-2 text-sm rounded-md ${rightPanel === 'properties' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>Propiedades</button>
          <button onClick={() => setRightPanel(rightPanel === 'filters' ? null : 'filters')} className={`px-4 py-2 text-sm rounded-md ${rightPanel === 'filters' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>Filtros</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Buckets & Tree */}
        <aside className="w-64 bg-white border-r p-4 flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Buckets</h3>
            <ul className="space-y-1">
              {buckets.map(b => (
                <li key={b}>
                  <button
                    onClick={() => handleBucketSelect(b)}
                    className={`w-full text-left flex items-center p-2 rounded-md text-sm font-medium ${selectedBucket === b ? 'bg-emerald-500 text-white' : 'hover:bg-gray-100'}`}
                  >
                    <FolderIcon className="w-5 h-5 mr-2" />
                    <span className="truncate">{b}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Árbol</h3>
            {selectedBucket ? (
              <TreeNode node={{ name: selectedBucket, path: '/', is_dir: true }} onSelect={loadDir} onDropFolder={handleDropOnFolder} onDragOver={handleDragOver} selectedPath={currentPath} selectedBucket={selectedBucket} />
            ) : (
              <div className="text-sm text-gray-400 mt-2">Seleccione un bucket.</div>
            )}
          </div>
        </aside>

        {/* Center Panel: File List */}
        <main className="flex-1 p-4 overflow-y-auto" onDragOver={handleDragOver} onDrop={(e) => handleDropOnFolder(e, currentPath)}>
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-black">
              Ruta: <span className="font-medium text-black">{currentPath}</span>
            </div>
            <div className="text-sm text-black">
              Mostrando {(page - 1) * perPage + 1} - {Math.min(page * perPage, total)} de {total}
            </div>
          </div>
          
          {message && <div className="mb-2 text-sm text-green-700 p-2 bg-green-50 rounded-md">{message}</div>}
          
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mb-2 p-2 border rounded-md">
              {Object.keys(uploadProgress).map(name => (
                <div key={name} className="text-sm">Subiendo {name}: {uploadProgress[name]}%</div>
              ))}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left font-semibold text-black w-1/2">Nombre</th>
                  <th className="p-3 text-left font-semibold text-black">Modificado</th>
                  <th className="p-3 text-left font-semibold text-black">Tamaño</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(en => (
                  <tr
                    key={en.path}
                    draggable
                    onDragStart={(e) => handleDragStart(e, en)}
                    onClick={() => handleSelectEntry(en)}
                    onDoubleClick={() => en.is_dir && loadDir(en.path)}
                    className={`border-t cursor-pointer ${selectedEntry?.path === en.path ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="p-3 flex items-center gap-3">
                      {en.is_dir ? <FolderIcon className="w-5 h-5 text-yellow-500" /> : <DocumentIcon className="w-5 h-5 text-gray-500" />}
                      <span className="font-medium truncate text-black">{en.name}</span>
                    </td>
                    <td className="p-3 text-black">{formatDate(en.mtime)}</td>
                    <td className="p-3 text-black">{en.is_dir ? '--' : formatBytes(en.size)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {entries.length === 0 && (
              <div className="text-center p-8 text-black">
                Esta carpeta está vacía.
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
             <div className="flex gap-2">
                <button onClick={()=>{ if (page>1) { setPage(p=>p-1); loadDir(currentPath, page-1); } }} className="px-3 py-1 text-sm bg-white border rounded-md hover:bg-gray-50">Anterior</button>
                <button onClick={()=>{ if (page*perPage < total) { setPage(p=>p+1); loadDir(currentPath, page+1); } }} className="px-3 py-1 text-sm bg-white border rounded-md hover:bg-gray-50">Siguiente</button>
              </div>
          </div>
        </main>

        {/* Right Panel: Properties & Filters */}
        {rightPanel && (
          <aside className="w-80 bg-white border-l p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{rightPanel === 'properties' ? 'Propiedades' : 'Filtros'}</h3>
              <button onClick={() => setRightPanel(null)} className="p-1 rounded-full hover:bg-gray-200"><XMarkIcon className="w-5 h-5" /></button>
            </div>

            {rightPanel === 'properties' && (
              <div>
                {selectedEntry ? (
                  <div>
                    <div className="flex justify-center mb-4">
                      {selectedEntry.is_dir ? <FolderIcon className="w-24 h-24 text-yellow-400" /> : <DocumentIcon className="w-24 h-24 text-gray-400" />}
                    </div>
                    
                    {isRenaming ? (
                      <div className="mb-4">
                        <input value={renameValue} onChange={e=>setRenameValue(e.target.value)} className="w-full p-2 border rounded-md text-sm" onKeyDown={e => e.key === 'Enter' && handleRename()} />
                        <div className="flex justify-end gap-2 mt-2">
                          <button onClick={()=>setIsRenaming(false)} className="px-3 py-1 text-sm">Cancelar</button>
                          <button onClick={handleRename} className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm">Guardar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-4">
                        <h4 className="text-md font-semibold truncate">{selectedEntry.name}</h4>
                        <button onClick={() => setIsRenaming(true)} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                      </div>
                    )}

                    <div className="space-y-2 text-sm text-gray-700 border-t pt-4">
                      <div className="flex justify-between"><span className="text-gray-500">Tipo:</span><span>{selectedEntry.is_dir ? 'Carpeta' : 'Archivo'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Tamaño:</span><span>{selectedEntry.is_dir ? '--' : formatBytes(selectedEntry.size)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Modificado:</span><span>{formatDate(selectedEntry.mtime)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Ruta:</span><span className="truncate ml-2">{selectedEntry.path}</span></div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4 border-t pt-4">
                      {!selectedEntry.is_dir && <button onClick={() => downloadFile(selectedEntry.path)} className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"><DownloadIcon className="w-4 h-4" />Descargar</button>}
                      <button onClick={handleMove} className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"><ArrowsRightLeftIcon className="w-4 h-4" />Mover</button>
                      <button onClick={() => deleteFile(selectedEntry.path)} className="flex items-center gap-2 px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"><TrashIcon className="w-4 h-4" />Borrar</button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 text-center mt-10">Seleccione un archivo o carpeta para ver sus propiedades.</div>
                )}
              </div>
            )}

            {rightPanel === 'filters' && (
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Extensiones (csv)</label>
                  <input value={filterExt} onChange={e=>setFilterExt(e.target.value)} placeholder="jpg,png,pdf" className="w-full p-2 border rounded-md text-sm" />
                </div>
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Tamaño (bytes)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={filterMinSize} onChange={e=>setFilterMinSize(e.target.value)} placeholder="Mínimo" className="p-2 border rounded-md text-sm" />
                    <input value={filterMaxSize} onChange={e=>setFilterMaxSize(e.target.value)} placeholder="Máximo" className="p-2 border rounded-md text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Fecha de modificación</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={filterMtimeAfter} onChange={e=>setFilterMtimeAfter(e.target.value)} className="p-2 border rounded-md text-sm" />
                    <input type="date" value={filterMtimeBefore} onChange={e=>setFilterMtimeBefore(e.target.value)} className="p-2 border rounded-md text-sm" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 border-t pt-4">
                  <button onClick={()=>{ setFilterExt(''); setFilterMinSize(''); setFilterMaxSize(''); setFilterMtimeAfter(''); setFilterMtimeBefore(''); }} className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300">Limpiar</button>
                  <button onClick={applyFilters} className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">Aplicar</button>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-medium mb-2">Crear nueva carpeta</h3>
            <div className="mb-4 text-sm text-gray-600">En: <span className="font-medium">{currentPath}</span></div>
            <input 
              className="w-full p-2 border rounded-md mb-4" 
              placeholder="Nombre de la carpeta" 
              value={newFolderName} 
              onChange={e=>setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createFolder()}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 text-sm" onClick={()=>setShowCreateFolder(false)}>Cancelar</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm" onClick={createFolder}>Crear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivosPage;
