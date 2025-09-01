import { CheckInRecord } from '../utils/offlineQueue';

/**
 * sendToSmb - best-effort function that tries to persist a single checkin.
 * Current strategy: if an "excel_server_url" is configured, POST to it.
 * Future: can be extended to call a native SMB plugin.
 */
export async function sendToSmb(rec: CheckInRecord): Promise<boolean> {
  const excelServerUrl = (() => { try { return localStorage.getItem('excel_server_url'); } catch { return null; } })();
  const excelServerPath = (() => { try { return localStorage.getItem('excel_server_path'); } catch { return null; } })();
  const excelServerKey = (() => { try { return localStorage.getItem('excel_server_key'); } catch { return null; } })();
  // If the configured path looks like an SMB/UNC path, prefer the native SMB writer.
  const looksLikeSmb = (p?: string | null) => !!p && (/^\\\\|^\\\/?|^smb:\/\//i.test(p) || p.includes('\\'));
  if (looksLikeSmb(excelServerPath)) {
    // attempt native write
    return await sendToSmbNative(rec);
  }
  if (!excelServerUrl) return false;
  try {
    const url = excelServerUrl.replace(/\/$/, '') + '/append';
    const body = { filePath: excelServerPath || '', row: rec };
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (excelServerKey) headers['x-api-key'] = excelServerKey;
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), cache: 'no-store' });
    return res.ok;
  } catch (err) {
    console.debug('sendToSmb failed', err);
    return false;
  }
}

// Placeholder for native SMB plugin call
export async function sendToSmbNative(rec: CheckInRecord): Promise<boolean> {
  try {
    // dynamic import to avoid bundling errors on web
    const cap = (window as any).Capacitor;
    if (!cap) return false;
    const Plugins = (window as any).Plugins || (cap.Plugins || {});
    if (Plugins && Plugins.SmbWriter && typeof Plugins.SmbWriter.writeLine === 'function') {
      const smbUrl = localStorage.getItem('excel_server_path') || '';
      const user = localStorage.getItem('excel_smb_user') || '';
      const pass = localStorage.getItem('excel_smb_pass') || '';
      const line = [rec.created_at, rec.nombre, rec.telefono, rec.email, rec.cp, rec.localidad, rec.calleNumero, rec.motivo || ''].join(',');
  const retries = parseInt(localStorage.getItem('excel_smb_retries') || '3', 10) || 3;
  const retryDelayMs = parseInt(localStorage.getItem('excel_smb_retry_delay_ms') || '1000', 10) || 1000;
  const atomic = (localStorage.getItem('excel_smb_atomic') || 'true') === 'true';
  const encrypt = (localStorage.getItem('excel_smb_encrypt') || 'false') === 'true';
  const keyAlias = localStorage.getItem('excel_smb_key_alias') || 'hipo_smb_key';
  const passphrase = localStorage.getItem('excel_smb_passphrase') || '';
    const protectExcel = (localStorage.getItem('excel_protect_xlsx') || 'false') === 'true';
    const excelPassword = localStorage.getItem('excel_password') || '';
    await Plugins.SmbWriter.writeLine({ url: smbUrl, user, pass, line, retries, retryDelayMs, atomic, encrypt, keyAlias, passphrase, protectExcel, excelPassword });
      return true;
    }
    return false;
  } catch (err) {
    console.debug('sendToSmbNative failed', err);
    return false;
  }
}
