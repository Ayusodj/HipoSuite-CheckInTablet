SMB native plugin (SmbWriter) - notes

This project includes a small Capacitor plugin implementation at:

  android/app/src/main/java/com/hipo/suite/smb/SmbWriter.java

What this plugin does
- Connects to an SMB share using SMBJ (com.hierynomus:smbj).
- Writes a single line to a target path. By default it writes atomically to a temporary file and renames it into place.
- Supports a configurable number of retries and a retry delay.

Including SMBJ
- The Gradle script in `android/app/build.gradle` prefers a local jar if present at `android/app/libs/smbj-0.14.0.jar`.
- For CI or reproducible builds, add the JAR to that folder. Alternatively rely on the remote artifact via Maven Central (build.gradle already includes it).

Android permissions and considerations
- The plugin runs over the network; ensure your AndroidManifest and network security configuration allow connecting to the target host (cleartext/HTTPS rules are not relevant for SMB which uses its own protocol).
- No special Android runtime permission is required for network sockets, but the app needs INTERNET permission (usually already present).

Signature & deployment
- When adding native dependencies / changing the plugin, you must rebuild and sign the APK consistently. Installing an APK with a different signature over an existing installation will fail with INSTALL_FAILED_UPDATE_INCOMPATIBLE.

Usage (from JavaScript)
```
const smb = Capacitor.Plugins.SmbWriter;
await smb.writeLine({ url: 'smb://host/share/path/file.csv', user: 'user', pass: 'pw', retries: 3, retryDelayMs: 1000, atomic: true, line: 'col1;col2' });
```

Notes
- For production, avoid storing plain credentials in localStorage. Use Android KeyStore / EncryptedSharedPreferences.
- This plugin implementation does not attempt advanced concurrency controls. If multiple devices may write the same file concurrently, prefer a server-side aggregator or use uniquely named files per device+timestamp.

Key management (Android KeyStore)
- The native plugin can now encrypt payloads using an AES key stored in Android KeyStore under the alias `hipo_smb_key` by default.
- The plugin will auto-create the key (if missing) using AndroidKeyStore and AES/GCM parameters. This requires device API level >= 23.
- To change alias, call the plugin with `{ encrypt: true, keyAlias: 'custom_alias' }`.
- To rotate or remove keys, use platform tools or implement a management flow that deletes the alias from the KeyStore and allows the plugin to recreate it.

Passphrase mode (PC decryption)
- The repo includes a small Node.js POC decrypter at `bundled/decrypt.js` which supports files generated in "passphrase mode" (version 2). When the app writes with a passphrase, the file header contains a salt so the PC can derive the same key with PBKDF2.
- Usage example on PC:

  node bundled/decrypt.js /path/to/file.enc /path/to/out.xlsx

  or

  node bundled/decrypt.js /path/to/file.enc /path/to/out.xlsx --passphrase "usuario+contraseña"

  The script will prompt for the passphrase if not provided. It uses PBKDF2-SHA256 with 100000 iterations and AES-256-GCM to decrypt.

Direct SMB (no server) - admin example files
- The `bundled/` folder now contains helper files for a no-server workflow where the app writes encrypted files directly to a UNC share and an operator on the PC decrypts them and logs access:
  - `bundled/checkins_template.csv` - CSV template with header.
  - `bundled/encrypt_admin.js` - Node script that generates an encrypted file using passphrase `admin:admin`. Usage example:

    node bundled/encrypt_admin.js bundled/checkins_template.csv bundled/checkins_admin.enc

  - `bundled/decrypt_and_log.ps1` - PowerShell script for Windows operators: asks for passphrase, decrypts using `decrypt.js`, prompts for user name and motivo, appends a line to `audit_access_log.csv` in the share, and opens the decrypted XLSX/CSV in Excel.

Notes: these are POC helpers for deployment/testing. In production, replace passphrase and secure its distribution.


