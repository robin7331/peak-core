package de.bitmechanics.peakandroid.modules;

import android.content.Context;
import android.preference.PreferenceManager;
import android.util.Log;
import android.webkit.JavascriptInterface;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import de.bitmechanics.peakandroid.core.PeakCore;

/**
 * Created by Matthias on 5/2/2016.
 */
public abstract class ChainedCacheModule extends BaseModule {

    protected final String PEAK_CACHE_MODULE = "PeakNativeCacheModule";

    private final String TAG = ChainedCacheModule.class.getCanonicalName();
    private final long A_DAY = 3600 * 24 * 1000; //In milliseconds
    private final long A_WEEK = 7 * A_DAY; //In milliseconds
    private final long CACHE_LIFE_TIME = 10 * A_DAY; //10 days
    private final String CHARSET = "UTF-8";
    private File CACHE_DIR; // The Cache Directory
    private ExecutorService pool;


    @Override
    protected void initializePeakCore(PeakCore peakCore, Context ctx) {
        super.initializePeakCore(peakCore, ctx);
        if (isPluginRequested(PEAK_CACHE_MODULE)) {
            Log.d(TAG, PEAK_CACHE_MODULE + " loaded.");
            CACHE_DIR = new File(ctx.getCacheDir(), "PeakNativeCache");
            pool = Executors.newFixedThreadPool(8); ////Spawn 8 Workers
            cleanup();
        }
    }


    private void cleanup() {
        if (CACHE_DIR.exists() == false) {
            CACHE_DIR.mkdirs();
        }
        long lastCleanUp = PreferenceManager.getDefaultSharedPreferences(ctx).getLong("LastCleanUp", 0);
        //Clean up unused files once a week
        if ((lastCleanUp + A_WEEK) < System.currentTimeMillis()) {
            pool.execute(new Runnable() {

                public void run() {
                    long startTime = System.currentTimeMillis();
                    Log.d(TAG, "Recursive cleanup started..");
                    Log.d(TAG, "Base Cache directory: " + CACHE_DIR);
                    recursiveCleanup(CACHE_DIR);
                    Log.d(TAG, "Recursive cleanup finished: Took: " + (System.currentTimeMillis() - startTime) + "ms");
                }

                ;
            });
            PreferenceManager.getDefaultSharedPreferences(ctx).edit().putLong("LastCleanUp", System.currentTimeMillis()).commit();
        }
    }

    private void recursiveCleanup(File dir) {
        File[] dirs = dir.listFiles(new FileFilter() {
            @Override
            public boolean accept(File f) {
                return f.isDirectory();
            }
        });

        for (int i = 0; i < dirs.length; i++) {
            recursiveCleanup(dirs[i]);
        }
        File[] files = dir.listFiles(new FileFilter() {
            @Override
            public boolean accept(File f) {
                return f.isFile();
            }
        });
        for (int i = 0; i < files.length; i++) {
            long modifiedTime = files[i].lastModified();
            if (modifiedTime + CACHE_LIFE_TIME < System.currentTimeMillis()) {
                Log.d(TAG, files[i].getAbsolutePath() + " deleted.");
                files[i].delete();

            }
        }
    }


    @JavascriptInterface
    protected void getCachedObj(String remoteURL, String callbackKey) {
        localGetCached(remoteURL, callbackKey, true);
    }


    @JavascriptInterface
    protected void getCached(String remoteURL, String callbackKey) {
        localGetCached(remoteURL, callbackKey, false);
    }

    private void localGetCached(final String remoteURL, final String callbackKey, final boolean asText) {
        pool.execute(new Runnable() {
            @Override
            public void run() {
                String[] urlComponents = prepareURL(remoteURL);
                String dir = urlComponents[0];
                String file = urlComponents[1];

                File fimg = new File(CACHE_DIR + dir + file);

                if (fimg.exists()) {
                    String retVal = "null";
                    if (!asText) {
                        retVal = "file://" + fimg.getAbsolutePath();
                        peakCore.callJSCallback(callbackKey, retVal);
                        return;
                    }
                    //Read the file
                    ByteArrayOutputStream bos = new ByteArrayOutputStream();
                    try {
                        FileInputStream in = new FileInputStream(fimg);
                        int bytesRead = -1;
                        byte[] buffer = new byte[4096];
                        while ((bytesRead = in.read(buffer)) != -1) {
                            bos.write(buffer, 0, bytesRead);
                        }
                        in.close();
                        retVal = bos.toString(CHARSET);
                        if (isJSON(file)) {
                            JSONObject json = new JSONObject(retVal);
                            peakCore.callJSCallback(callbackKey, json);
                            return;
                        }
                    } catch (FileNotFoundException e) {
                        Log.e(TAG, "File not found (should never happen): Path:" + fimg.getAbsolutePath() + " URL: " + remoteURL, e);
                    } catch (IOException e) {
                        Log.e(TAG, "IO-Error : Path:" + fimg.getAbsolutePath() + " URL: " + remoteURL, e);
                    } catch (JSONException e) {
                        Log.e("Wrong JSON Object", e.getMessage());
                    } finally {
                        peakCore.callJSCallback(callbackKey, retVal);
                    }
                } else {
                    Log.w(TAG, "Cache Mismatch: Path:" + fimg.getAbsolutePath() + " URL: " + remoteURL);
                    if (asText) {
                        localUpdateCache(remoteURL, callbackKey, true);
                    } else {
                        localUpdateCache(remoteURL, callbackKey, false);
                    }
                }
            }
        });
    }

    @JavascriptInterface
    private void updateCache(String remoteURL, String callbackKey) {
        localUpdateCache(remoteURL, callbackKey, false);
    }

    @JavascriptInterface
    private void updateCacheObj(String remoteURL, String callbackKey) {
        localUpdateCache(remoteURL, callbackKey, true);
    }

    private void localUpdateCache(final String remoteURL, final String callbackKey, final boolean asText) {

        pool.execute(new Runnable() {
            @Override
            public void run() {
                String[] urlComponents = prepareURL(remoteURL);
                String dir = urlComponents[0];
                String file = urlComponents[1];
                String retVal = "null";
                try {
                    // Establish connection
                    URL url = url = new URL(remoteURL);
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
                            fileName = file;
                        }

                        Log.d(TAG, "Content-Type = " + contentType);
                        Log.d(TAG, "Content-Disposition = " + disposition);
                        Log.d(TAG, "Content-Length = " + contentLength);
                        Log.d(TAG, "fileName = " + fileName);
                        Log.d(TAG, "Content-Encoding = " + contentEncoding);

                        // opens input stream from the HTTP connection
                        InputStream inputStream = httpConn.getInputStream();

                        //Initialize directory
                        File fdir = new File(CACHE_DIR + dir);
                        fdir.mkdirs();

                        //Write file
                        File fimg = new File(CACHE_DIR + dir + file);
                        if (fimg.exists()) {
                            fimg.delete();
                        }

                        // opens an output stream to save into file
                        FileOutputStream outputStream = new FileOutputStream(fimg);
                        ByteArrayOutputStream bos = new ByteArrayOutputStream();

                        int bytesRead = -1;
                        byte[] buffer = new byte[4096];
                        while ((bytesRead = inputStream.read(buffer)) != -1) {
                            outputStream.write(buffer, 0, bytesRead);
                            bos.write(buffer, 0, bytesRead);
                        }

                        outputStream.close();
                        inputStream.close();
                        httpConn.disconnect();
                        if (!asText) {
                            retVal = "file://" + fimg.getAbsolutePath();
                            peakCore.callJSCallback(callbackKey, retVal);
                            return;
                        }

                        //Read the file
                        retVal = bos.toString(contentEncoding);
                        if (isJSON(file)) {
                            JSONObject json = new JSONObject(retVal);
                            peakCore.callJSCallback(callbackKey, json);
                            return;
                        }
                        Log.d(TAG, "File downloaded");
                    } else {
                        Log.e(TAG, "No file to download. Server replied HTTP code: " + responseCode);
                    }
                } catch (MalformedURLException e) {
                    Log.e(TAG, "URL error: " + e.getMessage());
                    if (asText == false) retVal = remoteURL;
                } catch (IOException e) {
                    Log.e(TAG, "No Server response: " + e.getMessage());
                    if (asText == false) retVal = remoteURL;
                } catch (JSONException e) {
                    Log.e(TAG, "Wrong JSON: " + e.getMessage());
                } finally {
                    peakCore.callJSCallback(callbackKey, retVal);
                }
            }
        });
    }


    private String[] prepareURL(String remoteURL) {
        // URL: /slider/rw4Yqd0POkqMUqg.jpg
        if (remoteURL.startsWith("http"))
            remoteURL = remoteURL.replace("http://", "/");
        if (remoteURL.startsWith("https"))
            remoteURL = remoteURL.replace("https://", "/");
        if (!remoteURL.startsWith("/"))
            remoteURL = "/" + remoteURL;
        String[] urlComponents = {"/", "dummy.jpg"};
        Pattern pattern = Pattern.compile("\\/\\w*\\.(jpg|jpeg|png|bmp|gif|html|json|js|css)");
        Matcher matcher = pattern.matcher(remoteURL);
        if (matcher.find()) {
            String match = matcher.group(0);

            //DIR Add trailing "/""
            urlComponents[0] = remoteURL.replace(match, "/");

            //File Remove beginning "/""
            urlComponents[1] = match.substring(1);
        }
        Log.d(TAG, "URLComponents [0]:" + urlComponents[0] + " [1]:" + urlComponents[1]);
        return urlComponents;
    }

    private boolean isJSON(String file) {
        if (file.endsWith(".json")) {
            return true;
        } else {
            return false;
        }
    }


//    private boolean isTextFormat(String filename) {
//        Pattern pattern = Pattern.compile("\\.(html|json|js|css)");
//        Matcher matcher = pattern.matcher(filename);
//        if (matcher.find()) {
//            return true;
//        } else {
//            return false;
//        }
//
//    }

}
