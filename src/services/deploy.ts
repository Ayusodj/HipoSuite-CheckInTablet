import { CheckInRecord } from '../utils/offlineQueue';
import { sendToSmbNative } from './smb';

export async function deployBundledFileToSmb(bundledPath: string, destPath: string): Promise<boolean> {
  try {
    // fetch bundled file from app assets
    const res = await fetch(bundledPath);
    if (!res.ok) return false;
    const text = await res.text();
    // attempt to write via native plugin SmbWriter
    try {
      const cap = (window as any).Capacitor;
      const Plugins = (window as any).Plugins || (cap?.Plugins || {});
      if (Plugins && Plugins.SmbWriter && typeof Plugins.SmbWriter.writeLine === 'function') {
        // write as a single file content (we use writeLine repeatedly for simplicity)
        // Better: implement a writeFile method in native plugin; fallback to append-only write here
  const retries = parseInt(localStorage.getItem('excel_smb_retries') || '3', 10) || 3;
  const retryDelayMs = parseInt(localStorage.getItem('excel_smb_retry_delay_ms') || '1000', 10) || 1000;
  const atomic = (localStorage.getItem('excel_smb_atomic') || 'true') === 'true';
  const encrypt = (localStorage.getItem('excel_smb_encrypt') || 'false') === 'true';
  const keyAlias = localStorage.getItem('excel_smb_key_alias') || 'hipo_smb_key';
  const passphrase = localStorage.getItem('excel_smb_passphrase') || '';
  await Plugins.SmbWriter.writeLine({ url: destPath, user: localStorage.getItem('excel_smb_user') || '', pass: localStorage.getItem('excel_smb_pass') || '', line: text, retries, retryDelayMs, atomic, encrypt, keyAlias });
        return true;
      }
    } catch (err) {
      console.debug('native deploy failed', err);
    }

    // fallback: if excel_server_url is set and accepts file write, POST to it
    const excelServerUrl = localStorage.getItem('excel_server_url');
    if (excelServerUrl) {
  const url = excelServerUrl.replace(/\/$/, '') + '/upload-file';
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: destPath, content: text }) });
      return r.ok;
    }
    return false;
  } catch (err) {
    console.error('deploy failed', err);
    return false;
  }
}
