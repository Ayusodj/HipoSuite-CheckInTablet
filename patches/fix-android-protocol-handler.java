// Patched AndroidProtocolHandler - defensive checks and safer resource handling
package com.getcapacitor;

import android.content.Context;
import android.content.res.AssetManager;
import android.content.res.Resources;
import android.net.Uri;
import android.util.TypedValue;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

public class AndroidProtocolHandler {

    private Context context;

    public AndroidProtocolHandler(Context context) {
        this.context = context;
    }

    public InputStream openAsset(String path) throws IOException {
        if (path == null) {
            throw new IOException("openAsset: path is null");
        }
        AssetManager am = (context != null) ? context.getAssets() : null;
        if (am == null) {
            throw new IOException("openAsset: AssetManager is null");
        }
        return am.open(path, AssetManager.ACCESS_STREAMING);
    }

    public InputStream openResource(Uri uri) {
        if (uri == null || uri.getPath() == null) {
            Logger.error("Invalid resource URI: " + uri);
            return null;
        }

        List<String> pathSegments = uri.getPathSegments();
        if (pathSegments == null || pathSegments.size() < 2) {
            Logger.error("Resource URI path has unexpected format: " + uri);
            return null;
        }

        String assetType = pathSegments.get(pathSegments.size() - 2);
        String assetName = pathSegments.get(pathSegments.size() - 1);

        // Remove extension safely
        int dot = assetName.lastIndexOf('.');
        if (dot > 0) {
            assetName = assetName.substring(0, dot);
        }

        try {
            Context appContext = (context != null && context.getApplicationContext() != null) ? context.getApplicationContext() : context;
            if (appContext == null) {
                Logger.error("openResource: context is null");
                return null;
            }

            int fieldId = getFieldId(appContext, assetType, assetName);
            int valueType = getValueType(appContext, fieldId);
            if (valueType == TypedValue.TYPE_STRING) {
                return appContext.getResources().openRawResource(fieldId);
            } else {
                Logger.error("Asset not of type string: " + uri);
            }
        } catch (ClassNotFoundException | IllegalAccessException | NoSuchFieldException e) {
            Logger.error("Unable to open resource URL: " + uri, e);
        } catch (Resources.NotFoundException e) {
            Logger.error("Resource id not found for URI: " + uri, e);
        } catch (Exception e) {
            Logger.error("Unexpected error opening resource: " + uri, e);
        }
        return null;
    }

    private static int getFieldId(Context context, String assetType, String assetName)
        throws ClassNotFoundException, NoSuchFieldException, IllegalAccessException {
        Class<?> d = context.getClassLoader().loadClass(context.getPackageName() + ".R$" + assetType);
        java.lang.reflect.Field field = d.getField(assetName);
        return field.getInt(null);
    }

    public InputStream openFile(String filePath) throws IOException {
        if (filePath == null) {
            throw new IOException("openFile: filePath is null");
        }
        String realPath = filePath;
        if (filePath.startsWith(Bridge.CAPACITOR_FILE_START)) {
            realPath = filePath.substring(Bridge.CAPACITOR_FILE_START.length());
        }
        File localFile = new File(realPath);
        if (!localFile.exists()) {
            throw new IOException("openFile: file not found: " + realPath);
        }
        return new FileInputStream(localFile);
    }

    public InputStream openContentUrl(Uri uri) throws IOException {
        if (uri == null) {
            Logger.error("openContentUrl: uri is null");
            return null;
        }
        String scheme = uri.getScheme();
        String host = uri.getHost();
        if (scheme == null || host == null) {
            Logger.error("openContentUrl: invalid uri components: " + uri);
            return null;
        }
        Integer port = uri.getPort();
        String baseUrl = scheme + "://" + host;
        if (port != -1 && port != null) {
            baseUrl += ":" + port;
        }
        String marker = baseUrl + Bridge.CAPACITOR_CONTENT_START;
        String realPath = uri.toString();
        if (realPath.startsWith(marker)) {
            realPath = "content:/" + realPath.substring(marker.length());
        } else {
            realPath = realPath.replace(marker, "content:/");
        }

        InputStream stream = null;
        try {
            stream = context.getContentResolver().openInputStream(Uri.parse(realPath));
        } catch (SecurityException e) {
            Logger.error("Unable to open content URL: " + uri, e);
        } catch (IllegalArgumentException e) {
            Logger.error("Invalid content URI after conversion: " + realPath, e);
        } catch (Exception e) {
            Logger.error("Unexpected error opening content URI: " + uri, e);
        }
        return stream;
    }

    private static int getValueType(Context context, int fieldId) {
        TypedValue value = new TypedValue();
        try {
            context.getResources().getValue(fieldId, value, true);
            return value.type;
        } catch (Resources.NotFoundException e) {
            Logger.error("getValueType: resource not found for id=" + fieldId, e);
            return -1;
        } catch (Exception e) {
            Logger.error("getValueType: unexpected error for id=" + fieldId, e);
            return -1;
        }
    }
}
