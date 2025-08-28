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

@CapacitorPlugin(name = "SmbWriter")
public class SmbWriter extends Plugin {
    @Override
    public void load() {
        // no-op
    }

    @SuppressWarnings({"unused"})
    public void writeLine(PluginCall call) {
        final String url = call.getString("url"); // smb://host/share/path/file.csv
        final String user = call.getString("user", "");
        final String pass = call.getString("pass", "");
        final String line = call.getString("line", "");

        if (url == null || line == null) {
            call.reject("missing url or line");
            return;
        }

        new Thread(() -> {
            try (SMBClient client = new SMBClient()) {
                // parse smb url: smb://host/share/path/to/file.csv
                String without = url.replaceFirst("^smb://", "");
                String[] parts = without.split("/", 3);
                String host = parts[0];
                String share = parts.length>1?parts[1]:"";
                String relPath = parts.length>2?parts[2]:"";

                Connection connection = client.connect(host);
                AuthenticationContext ac = new AuthenticationContext(user, pass.toCharArray(), "");
                Session session = connection.authenticate(ac);
                try (DiskShare disk = (DiskShare) session.connectShare(share)) {
                    if (!disk.fileExists(relPath)) {
                        disk.openFile(relPath, EnumSet.of(AccessMask.FILE_WRITE_DATA, AccessMask.FILE_APPEND_DATA), null, SMB2ShareAccess.ALL, SMB2CreateDisposition.FILE_CREATE, null).close();
                    }
                    try (File f = disk.openFile(relPath, EnumSet.of(AccessMask.FILE_APPEND_DATA), null, SMB2ShareAccess.ALL, SMB2CreateDisposition.FILE_OPEN_IF, null)) {
                        OutputStream os = f.getOutputStream();
                        os.write((line + "\n").getBytes(StandardCharsets.UTF_8));
                        os.flush();
                    }
                }
                call.resolve();
            } catch (Exception e) {
                Log.e("SmbWriter", "write failed", e);
                call.reject("write failed: " + e.getMessage());
            }
        }).start();
    }
}
