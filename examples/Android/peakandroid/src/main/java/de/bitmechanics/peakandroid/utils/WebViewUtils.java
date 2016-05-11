package de.bitmechanics.peakandroid.utils;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebView;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Created by Matthias on 5/7/2016.
 */
public class WebViewUtils {

    private static final String TAG = WebViewUtils.class.getCanonicalName();

    static public void loadWebApp(WebView wv, String path) {
        File location = wv.getContext().getCacheDir();
        loadWebApp(wv, path, location, false);
    }

    static public void loadWebApp(WebView wv, String path, File location, boolean force) {
        Context ctx = wv.getContext();

        if (path.indexOf("html") == -1) {
            path = path + "/index.html";
        }
        if (new File(location, path).exists() == false || force) {
            String root = path.substring(0, path.lastIndexOf("/"));
            installWebApp(root, location, ctx);
        }
        String url = "file://" + location + "/" + path;
        wv.loadUrl(url);
        //this.loadDataWithBaseURL("file:///" + cache.getAbsolutePath() + "/webapp/", html, "text/html", "utf-8", null);
    }


    static private void installWebApp(String assetName, File dest, Context context) {
        AssetHelper ah = new AssetHelper(context);
        ah.rcopy(assetName, dest);
    }


    static public void updateWebApp(String updateUrl, File destDir, Context context) {
        try {
            // Establish connection
            URL url = url = new URL(updateUrl);
            HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
            int responseCode = httpConn.getResponseCode();

            // always check HTTP response code first
            if (responseCode == HttpURLConnection.HTTP_OK) {
                String fileName = "";
                String disposition = httpConn.getHeaderField("Content-Disposition");
                String contentType = httpConn.getContentType();
                String contentEncoding = httpConn.getContentEncoding();
                int contentLength = httpConn.getContentLength();

                if (disposition != null) {
                    // extracts file name from header field
                    int index = disposition.indexOf("filename=");
                    if (index > 0) {
                        fileName = disposition.substring(index + 10,
                                disposition.length() - 1);
                    }
                } else {
                    // extracts file name from URL
                    fileName = updateUrl.substring(updateUrl.lastIndexOf("/") + 1,
                            updateUrl.length());
                }

                Log.d(TAG, "Content-Type = " + contentType);
                Log.d(TAG, "Content-Disposition = " + disposition);
                Log.d(TAG, "Content-Length = " + contentLength);
                Log.d(TAG, "fileName = " + fileName);
                Log.d(TAG, "Content-Encoding = " + contentEncoding);

                // opens input stream from the HTTP connection
                InputStream inputStream = httpConn.getInputStream();

                //Initialize directory

                //Write file
                File dl = new File(destDir,fileName);
                if (dl.exists()) {
                    dl.delete();
                }

                // opens an output stream to save into file
                FileOutputStream outputStream = new FileOutputStream(dl);

                int bytesRead = -1;
                byte[] buffer = new byte[4096];
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }

                outputStream.close();
                inputStream.close();
                httpConn.disconnect();
                Log.d(TAG, "File downloaded");
                unpackZip(dl,destDir);
            } else {
                Log.e(TAG, "No file to download. Server replied HTTP code: " + responseCode);
            }
        } catch (MalformedURLException e) {
            Log.e(TAG, "URL error: " + e.getMessage());
        } catch (IOException e) {
            Log.e(TAG, "No Server response: " + e.getMessage());
        }
    }


    private static boolean unpackZip(File zip, File dest) {
        InputStream is;
        ZipInputStream zis;
        try {
            String filename;
            is = new FileInputStream(zip);
            zis = new ZipInputStream(new BufferedInputStream(is));
            ZipEntry ze;
            byte[] buffer = new byte[24 * 1024];
            int count;

            while ((ze = zis.getNextEntry()) != null) {
                filename = ze.getName();
                File currentFile = new File(dest,filename);

                // Need to create directories if not exists, or
                if (ze.isDirectory()) {
                    if(currentFile.exists()) {
                        FileSystemHelpers.rdelete(currentFile);
                    }
                    currentFile.mkdirs();
                }else {
                    FileOutputStream fout = new FileOutputStream(currentFile);

                    while ((count = zis.read(buffer)) != -1) {
                        fout.write(buffer, 0, count);
                    }

                    fout.close();
                    zis.closeEntry();
                }
            }
            zis.close();
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        return true;
    }




    static public void saveState(WebView wv, Bundle out) {
        wv.saveState(out);
    }

    static public void restoreState(WebView wv, Bundle in) {
        wv.restoreState(in);
    }

}
