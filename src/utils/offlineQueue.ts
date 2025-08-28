export type CheckInRecord = {
  nombre: string;
  telefono: string;
  email: string;
  cp: string;
  localidad: string;
  calleNumero: string;
  created_at: string;
  motivo?: string;
};

const QUEUE_KEY = 'hiposuite_offline_queue_v1';
const ACCESS_LOG_KEY = 'hiposuite_access_log_v1';
const EXPIRY_MS = 72 * 60 * 60 * 1000; // 72 hours

export function enqueueCheckin(rec: CheckInRecord) {
  try {
    // purge expired before enqueueing
    const now = Date.now();
    const raw = localStorage.getItem(QUEUE_KEY) || '[]';
    const q: CheckInRecord[] = JSON.parse(raw).filter((r: CheckInRecord) => {
      const t = Date.parse(r.created_at || '');
      return Number.isFinite(t) ? (now - t) <= EXPIRY_MS : true;
    });
    q.push(rec);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    return true;
  } catch (err) {
    console.error('enqueue failed', err);
    return false;
  }
}

export function peekQueue(): CheckInRecord[] {
  try {
    // filter expired
    const now = Date.now();
    const arr: CheckInRecord[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    return arr.filter(r => {
      const t = Date.parse(r.created_at || '');
      return Number.isFinite(t) ? (now - t) <= EXPIRY_MS : true;
    });
  } catch (err) {
    console.error('peekQueue failed', err);
    return [];
  }
}

export function clearQueue() {
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch (err) {
    console.error('clearQueue failed', err);
  }
}

/**
 * Attempt to flush queue using supplied sender function.
 * sender should return true on success for a single record.
 */
export async function processQueue(sender: (r: CheckInRecord) => Promise<boolean>) {
  const q = peekQueue();
  if (!q.length) return 0;
  let success = 0;
  for (let i = 0; i < q.length; i++) {
    try {
      const ok = await sender(q[i]);
      if (ok) {
        success++;
      } else {
        // stop on first failure to avoid tight loops
        break;
      }
    } catch (err) {
      console.error('processQueue item failed', err);
      break;
    }
  }
  if (success > 0) {
    try {
      const remaining = q.slice(success).filter((r: CheckInRecord) => {
        const t = Date.parse(r.created_at || '');
        return Number.isFinite(t) ? (Date.now() - t) <= EXPIRY_MS : true;
      });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    } catch (err) {
      console.error('processQueue writeback failed', err);
    }
  }
  return success;
}

// Access log utilities - append-only log that does not expire here
export type AccessLogEntry = { ts: string; nombre?: string; motivo?: string; smbUser?: string };

export function appendAccessLog(entry: AccessLogEntry) {
  try {
    const raw = localStorage.getItem(ACCESS_LOG_KEY) || '[]';
    const arr: AccessLogEntry[] = JSON.parse(raw);
    arr.push(entry);
    localStorage.setItem(ACCESS_LOG_KEY, JSON.stringify(arr));
    return true;
  } catch (err) {
    console.error('appendAccessLog failed', err);
    return false;
  }
}

export function getAccessLog(): AccessLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(ACCESS_LOG_KEY) || '[]');
  } catch (err) {
    console.error('getAccessLog failed', err);
    return [];
  }
}

export function exportAccessLogCSV(): string {
  const rows = getAccessLog();
  const header = ['timestamp','nombre','motivo','smbUser'];
  const lines = [header.join(',')];
  for (const r of rows) {
    const cols = [r.ts, r.nombre || '', r.motivo || '', r.smbUser || ''];
    // escape double quotes and commas
    const esc = cols.map(c => '"' + String(c).replace(/"/g,'""') + '"');
    lines.push(esc.join(','));
  }
  return lines.join('\n');
}
