import React, { useState, useEffect } from 'react';
// GuestDataContext and AuthContext removed — use local no-op handlers instead
import { enqueueCheckin, processQueue, appendAccessLog } from '../utils/offlineQueue';
import { sendToSmb } from '../services/smb';

interface Labels {
  nombre: string;
  telefono: string;
  email: string;
  cp: string;
  localidad: string;
  calleNumero: string;
  motivo: string;
  enviar: string;
  reset: string;
}

interface FormState {
  nombre: string;
  telefono: string;
  email: string;
  cp: string;
  localidad: string;
  calleNumero: string;
  motivo?: string;
}

const initialState: FormState = {
  nombre: '',
  telefono: '',
  email: '',
  cp: '',
  localidad: '',
  calleNumero: ''
};

const defaultLabels: Labels = {
  nombre: 'Nombre',
  telefono: 'Tel',
  email: '@',
  cp: 'C.P',
  localidad: 'Localidad',
  calleNumero: 'Calle nº',
  motivo: 'Motivo',
  enviar: 'Enviar',
  reset: 'Reset'
};

const CheckInForm: React.FC<{ labels?: Partial<Labels> }> = ({ labels }) => {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const addGuest = (g: any) => { /* no-op: guest shadowing disabled in minimal tablet mode */ };
  const firstInputRef = React.useRef<HTMLInputElement | null>(null);

  const L: Labels = { ...defaultLabels, ...(labels || {}) };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // auth removed

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      nombre: form.nombre,
      telefono: form.telefono,
      email: form.email,
      cp: form.cp,
      localidad: form.localidad,
      calleNumero: form.calleNumero,
      motivo: form.motivo || '',
      created_at: new Date().toISOString()
    };
    // If an excel server is configured (on the network), send there only.
    const excelServerUrl = (() => { try { return localStorage.getItem('excel_server_url'); } catch { return null; } })();
    const excelServerPath = (() => { try { return localStorage.getItem('excel_server_path'); } catch { return null; } })();
    const excelServerKey = (() => { try { return localStorage.getItem('excel_server_key'); } catch { return null; } })();
  let saved = false;
    if (excelServerUrl) {
      try {
        const url = excelServerUrl.replace(/\/$/, '') + '/append';
        const body = { filePath: excelServerPath || '', row: payload };
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (excelServerKey) headers['x-api-key'] = excelServerKey;
        const res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });
        if (res.ok) {
          const j = await res.json().catch(() => ({}));
          console.debug('saved to excel server', j);
          saved = true;
        } else {
          console.warn('excel server returned non-ok', res.status);
        }
      } catch (err) {
        console.error('Failed to send to excel server', err);
      }
    } else {
      const msg = navigator.language.startsWith('es') ? 'No hay servidor Excel configurado. Configura la URL en la pantalla de tablet.' : 'No excel server configured. Set the URL in tablet settings.';
      try { alert(msg); } catch (e) { console.warn('notify failed', e); }
    }

    // If not saved, enqueue for later delivery
  if (!saved) {
      try {
        const rec = payload;
        const enqOk = enqueueCheckin(rec as any);
        if (enqOk) {
      try { appendAccessLog({ ts: new Date().toISOString(), nombre: rec.nombre, motivo: rec.motivo }); } catch(e){}
          try { alert(navigator.language.startsWith('es') ? 'Guardado en cola local. Se reintentará cuando haya red.' : 'Saved to local queue. Will retry when online.'); } catch(e){}
          // Keep local shadow copy
          addGuest({ roomNumber: form.calleNumero || 'N/A', guestName: form.nombre || 'N/A', mealPlanRegime: 'BB' as any });
          setForm(initialState);
          setTimeout(() => firstInputRef.current?.focus(), 50);
        }
      } catch (err) {
        console.error('enqueue failed', err);
      }
    }
    else {
      try { appendAccessLog({ ts: new Date().toISOString(), nombre: payload.nombre, motivo: payload.motivo }); } catch(e){}
    }

    try {
  if (saved) {
        // keep local shadow copy for UX
        addGuest({
          roomNumber: form.calleNumero || 'N/A',
          guestName: form.nombre || 'N/A',
          mealPlanRegime: 'BB' as any
        });

        await new Promise(res => setTimeout(res, 300));

        setForm(initialState);
        // devolver foco al primer campo para el siguiente cliente
        setTimeout(() => firstInputRef.current?.focus(), 50);
      } else {
        // Do not clear the form if saving failed. Notify the operator.
        const msg = navigator.language.startsWith('es') ? 'No se ha podido guardar el check-in. Revisa la conexión o la configuración del servidor.' : 'Failed to save check-in. Check connection or server settings.';
        try { alert(msg); } catch (e) { console.warn('notify failed', e); }
      }
    } catch (err) {
      console.error('Failed to handle post-submit flow', err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    // Attempt to flush queue on mount and when coming online
    let mounted = true;
    async function tryFlush() {
      try {
        const sent = await processQueue(sendToSmb as any);
        if (sent > 0) console.debug('flushed', sent);
      } catch (err) {
        console.debug('flush failed', err);
      }
    }
    tryFlush();
    const onOnline = () => { if (mounted) tryFlush(); };
    window.addEventListener('online', onOnline);
  const interval = setInterval(() => { if (mounted) tryFlush(); }, 30_000);
  return () => { mounted = false; window.removeEventListener('online', onOnline); clearInterval(interval); };
  }, []);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
  <label htmlFor="nombre" className="block text-sm md:text-base font-medium mb-1">{L.nombre}:</label>
  <input id="nombre" name="nombre" ref={firstInputRef} autoFocus value={form.nombre} onChange={onChange} aria-label={L.nombre} placeholder={L.nombre + ' completo'} className="w-full border rounded px-4 py-3 text-base md:text-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label htmlFor="telefono" className="block text-sm md:text-base font-medium mb-1">{L.telefono}:</label>
          <input id="telefono" name="telefono" value={form.telefono} onChange={onChange} aria-label={L.telefono} placeholder="Ej. 600123456" className="w-full border rounded px-4 py-3 text-base md:text-lg" />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm md:text-base font-medium mb-1">{L.email}:</label>
          <input id="email" name="email" value={form.email} onChange={onChange} aria-label={L.email} placeholder="ejemplo@dominio.com" className="w-full border rounded px-4 py-3 text-base md:text-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor="cp" className="block text-sm md:text-base font-medium mb-1">{L.cp}:</label>
          <input id="cp" name="cp" value={form.cp} onChange={onChange} aria-label={L.cp} placeholder="08001" className="w-full border rounded px-4 py-3 text-base md:text-lg" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="localidad" className="block text-sm md:text-base font-medium mb-1">{L.localidad}:</label>
          <input id="localidad" name="localidad" value={form.localidad} onChange={onChange} aria-label={L.localidad} placeholder="Barcelona" className="w-full border rounded px-4 py-3 text-base md:text-lg" />
        </div>
      </div>

      <div>
        <label htmlFor="motivo" className="block text-sm md:text-base font-medium mb-1">{L.motivo}:</label>
        <input id="motivo" name="motivo" value={form.motivo || ''} onChange={onChange} aria-label={L.motivo} placeholder="Motivo de la visita" className="w-full border rounded px-4 py-3 text-base md:text-lg" />
      </div>

      <div>
  <label htmlFor="calleNumero" className="block text-sm md:text-base font-medium mb-1">{L.calleNumero}:</label>
  <input id="calleNumero" name="calleNumero" value={form.calleNumero} onChange={onChange} aria-label={L.calleNumero} placeholder="Calle Falsa 123" className="w-full border rounded px-4 py-3 text-base md:text-lg" />
      </div>

      <div className="flex items-center space-x-3">
        <button type="submit" disabled={submitting} className="bg-hipo-blue text-white px-5 py-3 rounded text-base md:text-lg disabled:opacity-60">
          {submitting ? (navigator.language.startsWith('es') ? 'Enviando...' : 'Sending...') : L.enviar}
        </button>
        <button type="button" onClick={() => { setForm(initialState); setTimeout(() => firstInputRef.current?.focus(), 50); }} className="border px-4 py-3 rounded text-base">{L.reset}</button>
      </div>
    </form>
  );
};

export default CheckInForm;
