package com.hipo.suite.smb;

import android.util.Log;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.EnumSet;
import java.util.Arrays;
import java.util.HashSet;
import java.security.KeyStore;
import java.security.SecureRandom;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

import com.hierynomus.msdtyp.AccessMask;
import com.hierynomus.mssmb2.SMB2ShareAccess;
import com.hierynomus.mssmb2.SMB2CreateDisposition;

// jcifs-ng imports
import com.hierynomus.smbj.SMBClient;
import com.hierynomus.smbj.auth.AuthenticationContext;
import com.hierynomus.smbj.connection.Connection;
import com.hierynomus.smbj.session.Session;
import com.hierynomus.smbj.share.DiskShare;
import com.hierynomus.smbj.share.File;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.apache.poi.poifs.crypt.EncryptionInfo;
import org.apache.poi.poifs.crypt.EncryptionMode;
import org.apache.poi.poifs.crypt.Encryptor;

@CapacitorPlugin(name = "SmbWriter")
public class SmbWriter extends Plugin {
    @Override
    public void load() {
        // no-op
    }

    // Helper: obtain or create an AES key in Android KeyStore with given alias
    private SecretKey getOrCreateKey(String alias) throws Exception {
        KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
        keyStore.load(null);
        if (keyStore.containsAlias(alias)) {
            KeyStore.Entry entry = keyStore.getEntry(alias, null);
            if (entry instanceof KeyStore.SecretKeyEntry) {
                return ((KeyStore.SecretKeyEntry) entry).getSecretKey();
            }
        }
        // generate AES key
        KeyGenerator keyGenerator = KeyGenerator.getInstance("AES", "AndroidKeyStore");
        final int keySize = 256;
        try {
            android.security.keystore.KeyGenParameterSpec spec = new android.security.keystore.KeyGenParameterSpec.Builder(
                    alias,
                    android.security.keystore.KeyProperties.PURPOSE_ENCRYPT | android.security.keystore.KeyProperties.PURPOSE_DECRYPT
            )
                    .setBlockModes(android.security.keystore.KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(android.security.keystore.KeyProperties.ENCRYPTION_PADDING_NONE)
                    .setKeySize(keySize)
                    .build();
            keyGenerator.init(spec);
            return keyGenerator.generateKey();
        } catch (Exception e) {
            Log.e("SmbWriter", "Key generation failed", e);
            throw e;
        }
    }

    // Encrypt input with AES-GCM using SecretKey from KeyStore. Returns: IV (12 bytes) + ciphertext + tag
    private byte[] encryptAesGcm(SecretKey key, byte[] plain) throws Exception {
        SecureRandom random = new SecureRandom();
        byte[] iv = new byte[12];
        random.nextBytes(iv);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec spec = new GCMParameterSpec(128, iv);
        cipher.init(Cipher.ENCRYPT_MODE, key, spec);
        byte[] cipherText = cipher.doFinal(plain);
        // build output: magic(8) + version(1) + iv(12) + cipherText
        byte[] magic = "HIPOSENC".getBytes(StandardCharsets.US_ASCII);
        byte version = 0x01;
        byte[] out = new byte[magic.length + 1 + iv.length + cipherText.length];
        int pos = 0;
        System.arraycopy(magic, 0, out, pos, magic.length); pos += magic.length;
        out[pos++] = version;
        System.arraycopy(iv, 0, out, pos, iv.length); pos += iv.length;
        System.arraycopy(cipherText, 0, out, pos, cipherText.length);
        return out;
    }

    // Derive AES key from passphrase using PBKDF2-HMAC-SHA256
    private SecretKey deriveKeyFromPassphrase(String passphrase, byte[] salt) throws Exception {
        javax.crypto.SecretKeyFactory skf = javax.crypto.SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        javax.crypto.spec.PBEKeySpec spec = new javax.crypto.spec.PBEKeySpec(passphrase.toCharArray(), salt, 100000, 256);
        byte[] keyBytes = skf.generateSecret(spec).getEncoded();
        javax.crypto.spec.SecretKeySpec sk = new javax.crypto.spec.SecretKeySpec(keyBytes, "AES");
        return sk;
    }

    // Encrypt with salt included in header: magic|ver|salt(16)|iv(12)|cipher
    private byte[] encryptAesGcmWithSalt(SecretKey key, byte[] plain, byte[] salt) throws Exception {
        SecureRandom random = new SecureRandom();
        byte[] iv = new byte[12];
        random.nextBytes(iv);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec spec = new GCMParameterSpec(128, iv);
        cipher.init(Cipher.ENCRYPT_MODE, key, spec);
        byte[] cipherText = cipher.doFinal(plain);
        byte[] magic = "HIPOSENC".getBytes(StandardCharsets.US_ASCII);
        byte version = 0x02; // version 2 includes salt
        byte[] out = new byte[magic.length + 1 + salt.length + iv.length + cipherText.length];
        int pos = 0;
        System.arraycopy(magic, 0, out, pos, magic.length); pos += magic.length;
        out[pos++] = version;
        System.arraycopy(salt, 0, out, pos, salt.length); pos += salt.length;
        System.arraycopy(iv, 0, out, pos, iv.length); pos += iv.length;
        System.arraycopy(cipherText, 0, out, pos, cipherText.length);
        return out;
    }

    @SuppressWarnings({"unused"})
    public void writeLine(PluginCall call) {
        final String url = call.getString("url"); // smb://host/share/path/file.csv
        final String user = call.getString("user", "");
        final String pass = call.getString("pass", "");
        final String line = call.getString("line", "");
    final int retries = call.getInt("retries", 3);
    final int retryDelayMs = call.getInt("retryDelayMs", 1000);
    final boolean atomic = call.getBoolean("atomic", true);
    final boolean encrypt = call.getBoolean("encrypt", false);
    final String keyAlias = call.getString("keyAlias", "hipo_smb_key");
    final String passphrase = call.getString("passphrase", null);
    final boolean protectExcel = call.getBoolean("protectExcel", false);
    final String excelPassword = call.getString("excelPassword", null);

        if (url == null || line == null) {
            call.reject("missing url or line");
            return;
        }

        new Thread(() -> {
            int attempt = 0;
            Exception lastEx = null;
            while (attempt < retries) {
                attempt++;
                try (SMBClient client = new SMBClient()) {
                    // parse smb url: smb://host/share/path/to/file.csv
                    String without = url.replaceFirst("^smb://", "");
                    String[] parts = without.split("/", 3);
                    String host = parts[0];
                    String share = parts.length>1?parts[1]:"";
                    String relPath = parts.length>2?parts[2]:"";

                    Log.i("SmbWriter", "attempt " + attempt + " connecting to " + host + " share=" + share + " path=" + relPath);

                    Connection connection = client.connect(host);
                    AuthenticationContext ac = new AuthenticationContext(user, pass.toCharArray(), "");
                    Session session = connection.authenticate(ac);
                    try (DiskShare disk = (DiskShare) session.connectShare(share)) {
                        // Ensure parent dirs exist
                        String parent = "";
                        int lastSlash = relPath.lastIndexOf('/');
                        if (lastSlash > 0) {
                            parent = relPath.substring(0, lastSlash);
                            String[] folders = parent.split("/");
                            String pathAcc = "";
                            for (String fldr : folders) {
                                pathAcc = pathAcc.isEmpty() ? fldr : pathAcc + "/" + fldr;
                                if (!disk.folderExists(pathAcc)) {
                                    disk.mkdir(pathAcc);
                                }
                            }
                        }

                        String target = relPath;
                        String tmpName = relPath + ".tmp" + System.currentTimeMillis();

                        // CSV header for initial file
                        String csvHeader = "created_at,nombre,telefono,email,cp,localidad,calleNumero,motivo";
                        boolean targetExists = disk.fileExists(target);

                        byte[] toWrite = null;

                        if (protectExcel) {
                            // Build or update an XLSX workbook in memory
                            XSSFWorkbook wb = null;
                            try {
                                if (targetExists) {
                                    // read existing file into workbook
                                    try (com.hierynomus.smbj.share.File fExisting = disk.openFile(target,
                                            EnumSet.of(AccessMask.FILE_READ_DATA), null, SMB2ShareAccess.ALL,
                                            SMB2CreateDisposition.FILE_OPEN, null)) {
                                        InputStream is = fExisting.getInputStream();
                                        wb = new XSSFWorkbook(is);
                                        is.close();
                                    } catch (Exception e) {
                                        // fallback to new workbook
                                        wb = new XSSFWorkbook();
                                    }
                                } else {
                                    wb = new XSSFWorkbook();
                                }

                                Sheet sheet = null;
                                if (wb.getNumberOfSheets() == 0) {
                                    sheet = wb.createSheet("checkins");
                                    Row header = sheet.createRow(0);
                                    String[] cols = new String[]{"created_at","nombre","telefono","email","cp","localidad","calleNumero","motivo"};
                                    for (int i=0;i<cols.length;i++) {
                                        Cell c = header.createCell(i);
                                        c.setCellValue(cols[i]);
                                    }
                                } else {
                                    sheet = wb.getSheetAt(0);
                                }

                                int lastRow = sheet.getLastRowNum();
                                int insertRow = targetExists && lastRow>0 ? lastRow+1 : (targetExists && lastRow==0 && sheet.getRow(0)!=null ? 1 : 1);
                                Row r = sheet.createRow(insertRow);
                                String[] csvParts = line.split(",", -1);
                                for (int i=0;i<csvParts.length;i++) {
                                    Cell c = r.createCell(i);
                                    c.setCellValue(csvParts[i]);
                                }

                                // write workbook to byte[]
                                ByteArrayOutputStream bos = new ByteArrayOutputStream();
                                if (excelPassword != null && !excelPassword.isEmpty()) {
                                    // Use POI encryptor to write a password-protected XLSX
                                    POIFSFileSystem fs = new POIFSFileSystem();
                                    EncryptionInfo info = new EncryptionInfo(EncryptionMode.standard);
                                    Encryptor enc = info.getEncryptor();
                                    enc.confirmPassword(excelPassword);
                                    try (OutputStream os = enc.getDataStream(fs)) {
                                        wb.write(os);
                                    }
                                    fs.writeFilesystem(bos);
                                } else {
                                    wb.write(bos);
                                }
                                toWrite = bos.toByteArray();
                                wb.close();
                            } catch (Exception e) {
                                Log.e("SmbWriter", "failed building XLSX", e);
                                throw e;
                            }
                        } else {
                            // CSV/plain or encrypted CSV
                            if (!targetExists) {
                                toWrite = (csvHeader + "\n" + line + "\n").getBytes(StandardCharsets.UTF_8);
                            } else {
                                toWrite = (line + "\n").getBytes(StandardCharsets.UTF_8);
                            }
                            // if encryption requested, either use passphrase-derived key or KeyStore key
                            if (encrypt) {
                                try {
                                    if (passphrase != null && !passphrase.isEmpty()) {
                                        // derive key via PBKDF2 and include salt in header
                                        SecureRandom rnd = new SecureRandom();
                                        byte[] salt = new byte[16];
                                        rnd.nextBytes(salt);
                                        SecretKey sk = deriveKeyFromPassphrase(passphrase, salt);
                                        toWrite = encryptAesGcmWithSalt(sk, toWrite, salt);
                                    } else {
                                        SecretKey sk = getOrCreateKey(keyAlias);
                                        toWrite = encryptAesGcm(sk, toWrite);
                                    }
                                } catch (Exception e) {
                                    Log.e("SmbWriter", "encryption failed", e);
                                    throw e;
                                }
                            }
                        }

                        // ensure audit log exists (plaintext CSV) next to target
                        try {
                            String auditName = "audit_access_log.csv";
                            String auditPath = (lastSlash > 0 ? parent + "/" : "") + auditName;
                            if (!disk.fileExists(auditPath)) {
                                byte[] logHeader = "timestamp,name,motivo\n".getBytes(StandardCharsets.UTF_8);
                                try (com.hierynomus.smbj.share.File lf = disk.openFile(auditPath,
                                        EnumSet.of(AccessMask.FILE_WRITE_DATA), null, SMB2ShareAccess.ALL,
                                        SMB2CreateDisposition.FILE_CREATE, null)) {
                                    OutputStream os2 = lf.getOutputStream();
                                    os2.write(logHeader);
                                    os2.flush();
                                    os2.close();
                                }
                            }
                        } catch (Exception e) {
                            Log.w("SmbWriter", "could not ensure audit log", e);
                        }

                        if (atomic) {
                            // write to temp file first, then rename
                            try (com.hierynomus.smbj.share.File f = disk.openFile(tmpName,
                                    EnumSet.of(AccessMask.FILE_WRITE_DATA), null, SMB2ShareAccess.ALL,
                                    SMB2CreateDisposition.FILE_CREATE, null)) {
                                OutputStream os = f.getOutputStream();
                                os.write(toWrite);
                                os.flush();
                                os.close();
                            }
                            // rename temp -> target (overwrite if exists)
                            // Move tmp -> target by copying bytes then removing the tmp file.
                            try {
                                if (disk.fileExists(target)) {
                                    disk.rm(target);
                                }
                                try (com.hierynomus.smbj.share.File ftmp = disk.openFile(tmpName,
                                        EnumSet.of(AccessMask.FILE_READ_DATA), null, SMB2ShareAccess.ALL,
                                        SMB2CreateDisposition.FILE_OPEN, null);
                                     com.hierynomus.smbj.share.File ftarget = disk.openFile(target,
                                        EnumSet.of(AccessMask.FILE_WRITE_DATA), null, SMB2ShareAccess.ALL,
                                        SMB2CreateDisposition.FILE_CREATE, null)) {
                                    InputStream isTmp = ftmp.getInputStream();
                                    OutputStream osTarget = ftarget.getOutputStream();
                                    byte[] buffer = new byte[8192];
                                    int r;
                                    while ((r = isTmp.read(buffer)) != -1) {
                                        osTarget.write(buffer, 0, r);
                                    }
                                    osTarget.flush();
                                    isTmp.close();
                                    osTarget.close();
                                }
                                // remove temporary file
                                disk.rm(tmpName);
                            } catch (Exception e) {
                                throw e;
                            }
                        } else {
                            // append directly
                            try (com.hierynomus.smbj.share.File f = disk.openFile(target,
                                    EnumSet.of(AccessMask.FILE_APPEND_DATA, AccessMask.FILE_WRITE_DATA), null, SMB2ShareAccess.ALL,
                                    SMB2CreateDisposition.FILE_OPEN_IF, null)) {
                                OutputStream os = f.getOutputStream();
                                os.write(toWrite);
                                os.flush();
                            }
                        }
                    }
                    // success
                    call.resolve();
                    return;
                } catch (Exception e) {
                    lastEx = e;
                    Log.e("SmbWriter", "attempt " + attempt + " failed", e);
                    try {
                        Thread.sleep(retryDelayMs);
                    } catch (InterruptedException ie) {
                        // ignore
                    }
                }
            }
            Log.e("SmbWriter", "all attempts failed");
            if (lastEx != null) {
                call.reject("write failed: " + lastEx.getMessage());
            } else {
                call.reject("write failed: unknown error");
            }
        }).start();
    }
}
