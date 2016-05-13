package de.bitmechanics.peakandroid.utils;

import android.content.Context;
import android.content.res.AssetManager;
import android.util.Log;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Created by Matthias on 5/6/2016.
 */
public class AssetHelper {

    private final String TAG = AssetHelper.class.getCanonicalName();
    private final Context ctx;

    public AssetHelper(Context ctx){
        this.ctx = ctx;
    }


    public String readFile(String path, String enc){
        File file = new File(path);
        try {
            FileInputStream in = new FileInputStream(file);
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            int bytesRead = -1;
            byte[] buffer = new byte[4096];
            while ((bytesRead = in.read(buffer)) != -1) {
                bos.write(buffer, 0, bytesRead);
            }

            bos.close();
            in.close();

            return bos.toString(enc);

        } catch (FileNotFoundException e) {
            Log.e(TAG, e.getMessage());
        } catch (IOException e) {
            Log.e(TAG, e.getMessage());
        }
        return "<html>NULL</html>";
    }

    public void rcopy(String src, File dest) {
         copyFileOrDir(src, dest.getAbsolutePath());
    }

    private void copyFileOrDir(String path, String dest) {
            AssetManager assetManager = ctx.getAssets();
            String assets[] = null;
            try {
                assets = assetManager.list(path);
                if (assets.length == 0) {
                    copyFile(path, dest);
                } else {
                    String fullPath = dest + "/" + path;
                    File dir = new File(fullPath);
                    if (!dir.exists())
                        dir.mkdir();
                    for (int i = 0; i < assets.length; ++i) {
                        copyFileOrDir(path + "/" + assets[i], dest);
                    }
                }
            } catch (IOException ex) {
                Log.e(TAG, "I/O Exception", ex);
            }
        }


    private void copyFile(String filename, String dest) {
        AssetManager assetManager = ctx.getAssets();

        InputStream in = null;
        OutputStream out = null;
        try {
            in = assetManager.open(filename);
            String newFileName = dest + "/" + filename;
            out = new FileOutputStream(newFileName);

            byte[] buffer = new byte[1024];
            int read;
            while ((read = in.read(buffer)) != -1) {
                out.write(buffer, 0, read);
            }
            in.close();
            in = null;
            out.flush();
            out.close();
            out = null;
            Log.d(TAG,"File written: " + newFileName);
        } catch (Exception e) {
            Log.e(TAG, "", e);
        }

    }

}
