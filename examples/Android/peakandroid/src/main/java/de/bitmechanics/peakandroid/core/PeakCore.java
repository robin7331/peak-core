package de.bitmechanics.peakandroid.core;


import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;

import de.bitmechanics.peakandroid.modules.ActionsModuleOne;

/**
 * Created by Matthias on 4/30/2016.
 */
public abstract class PeakCore extends ActionsModuleOne {



    public static interface NativeInterfaceCallback {
        public void call(String payload);
    }

    //    public final String ANDROID_GLOBAL = "PeakCore";
    public final String ANDROID_GLOBAL = "AndroidNative";
    private final String TAG = PeakCore.class.getCanonicalName();
    private final String VUE_PLUGIN_CALLBACK = "Vue.NativeInterface.callCallback";
    private final String VUE_PLUGIN_CALLJS = "Vue.NativeInterface.callJS";
    //    private final String VUE_PLUGIN_CALLBACK = "window.peak.callCallback";
//    private final String VUE_PLUGIN_CALLJS = "window.peak.callJS";
    private final HashMap<String, NativeInterfaceCallback> CALLBACKS = new HashMap<String, NativeInterfaceCallback>();
    private final MyHandler handler;
    private final WebView webView;

    public boolean DEBUG = true;

    public PeakCore(WebView webView) {
        super.initializePeakCore(this,webView.getContext());
        this.webView = webView;
        this.handler = new MyHandler(Looper.getMainLooper());

        //Configuration
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient());
        webView.addJavascriptInterface(this, ANDROID_GLOBAL);

//        WebView webView = new WebView( context );
//        webView.getSettings().setAppCacheMaxSize( 5 * 1024 * 1024 ); // 5MB
//        webView.getSettings().setAppCachePath( getApplicationContext().getCacheDir().getAbsolutePath() );
//        webView.getSettings().setAllowFileAccess( true );
//        webView.getSettings().setAppCacheEnabled( true );
//        webView.getSettings().setJavaScriptEnabled( true );
//        webView.getSettings().setCacheMode( WebSettings.LOAD_DEFAULT ); // load online by default
//
//        if ( !isNetworkAvailable() ) { // loading offline
//            webView.getSettings().setCacheMode( WebSettings.LOAD_CACHE_ELSE_NETWORK );
//        }
//
//        webView.loadUrl( "http://www.google.com" );
    }

    //    private boolean isNetworkAvailable() {
//        ConnectivityManager connectivityManager = (ConnectivityManager) getSystemService( CONNECTIVITY_SERVICE );
//        NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
//        return activeNetworkInfo != null && activeNetworkInfo.isConnected();
//    }


    @JavascriptInterface
    protected void log(String message) {
        Log.i(TAG, message);
    }

    @JavascriptInterface
    protected void logError(String message) {
        Log.e(TAG, message);
    }


    @JavascriptInterface
    protected void onWindowLoad() {
        if (DEBUG)
            Log.d(TAG, "onWindowLoad() called!");
    }

    @JavascriptInterface
    protected void onVueReady() {
        if (DEBUG)
            Log.d(TAG, "onVueReady() called!");
    }

    @JavascriptInterface
    protected void androidNativeCallback(String payload, String callbackKey) {
        logPayload("androidNativeCallback", payload, callbackKey);
        this.CALLBACKS.get(callbackKey).call(payload);
        this.CALLBACKS.remove(callbackKey);
    }


    public void enableDebug(boolean state) {
        this.DEBUG = state;
        callJS("enableDebug", state);
    }

    public void toggleDebug() {
        this.DEBUG = !this.DEBUG;
        callJS("enableDebug", this.DEBUG);
    }


    public void callJSCallback(String funcName, JSONObject payload) {
        String script = "javascript:" + VUE_PLUGIN_CALLBACK + "('" + funcName + "'," + payload.toString() + ")";
        if (DEBUG)
            Log.d(TAG, "Javascript String: " + script);
        Message JSMessage = handler.obtainMessage(MyHandler.INJECT_JAVASCRIPT, script);
        JSMessage.sendToTarget();
    }

    public void callJSCallback(String funcName, String payload) {
        String script = "javascript:" + VUE_PLUGIN_CALLBACK + "('" + funcName + "','" + payload + "')";
        if (DEBUG)
            Log.d(TAG, "Javascript String: " + script);
        Message JSMessage = handler.obtainMessage(MyHandler.INJECT_JAVASCRIPT, script);
        JSMessage.sendToTarget();
    }

    // String payload
    private void callTheJS(String funcName, String payload, NativeInterfaceCallback nativeCallback) {
        String script;
        if (nativeCallback != null) {
            String callbackKey = generateId();
            this.CALLBACKS.put(callbackKey, nativeCallback);
            if (payload != null && (!"".equals(payload) || !"''".equals(payload))) {
                script = "javascript:" + VUE_PLUGIN_CALLJS + "('" + funcName + "'," + payload + ",'" + callbackKey + "')";
            } else {
                script = "javascript:" + VUE_PLUGIN_CALLJS + "('" + funcName + "'," + "null" + ",'" + callbackKey + "')";
            }
        } else {
            if (payload != null && (!"".equals(payload) || !"''".equals(payload))) {
                script = "javascript:" + VUE_PLUGIN_CALLJS + "('" + funcName + "'," + payload + ")";
            } else {
                script = "javascript:" + VUE_PLUGIN_CALLJS + "('" + funcName + "')";
            }
        }
        if (DEBUG)
            Log.d(TAG, "Javascript String: " + script);
        Message JSMessage = handler.obtainMessage(MyHandler.INJECT_JAVASCRIPT, script);
        JSMessage.sendToTarget();
    }

    // JSON payload
    public void callJS(String funcName, JSONObject jsonObj, NativeInterfaceCallback nativeCallback) {
        callTheJS(funcName, jsonObj.toString(), nativeCallback);
    }

    // JSON Array payload
    public void callJS(String funcName, JSONArray jsonArr, NativeInterfaceCallback nativeCallback) {
        callTheJS(funcName, jsonArr.toString(), nativeCallback);
    }

    // String payload
    public void callJS(String funcName, String string, NativeInterfaceCallback nativeCallback) {
        callTheJS(funcName, "'" + string + "'", nativeCallback);
    }

    // Integer payload
    public void callJS(String funcName, Integer integer, NativeInterfaceCallback nativeCallback) {
        callTheJS(funcName, integer.toString(), nativeCallback);
    }


    // String[] payload
    public void callJS(String funcName, String[] string, NativeInterfaceCallback nativeCallback) {
        String parameter = null;
        if (string != null) {
            if (string.length == 0) {
                return;
            }
            StringBuilder builder = new StringBuilder("[");
            builder.append("'" + string[0] + "'");
            for (int i = 1; i < string.length; i++) {
                builder.append(",'" + string[i] + "'");
            }
            parameter = builder.toString();
        }
        callTheJS(funcName, parameter, nativeCallback);
    }

    // Integer[] payload
    public void callJS(String funcName, Integer[] integer, NativeInterfaceCallback nativeCallback) {
        String parameter = null;
        if (integer != null) {
            if (integer.length == 0) {
                return;
            }
            StringBuilder builder = new StringBuilder("[");
            builder.append("'" + integer[0] + "'");
            for (int i = 1; i < integer.length; i++) {
                builder.append(",'" + integer[i] + "'");
            }
            parameter = builder.toString();
        }
        callTheJS(funcName, parameter, nativeCallback);
    }


    // Double[] payload
    public void callJS(String funcName, Double[] doubl, NativeInterfaceCallback nativeCallback) {
        String parameter = null;
        if (doubl != null) {
            if (doubl.length == 0) {
                return;
            }
            StringBuilder builder = new StringBuilder("[");
            builder.append("'" + doubl[0] + "'");
            for (int i = 1; i < doubl.length; i++) {
                builder.append(",'" + doubl[i] + "'");
            }
            parameter = builder.toString();
        }
        callTheJS(funcName, parameter, nativeCallback);
    }

    // No payload
    public void callJS(String funcName) {
        callTheJS(funcName, null, null);
    }

    // JSON payload and No Callback
    public void callJS(String funcName, JSONObject jsonObj) {
        callTheJS(funcName, jsonObj.toString(), null);
    }

    // JSON Array payload and No Callback
    public void callJS(String funcName, JSONArray jsonArr) {
        callTheJS(funcName, jsonArr.toString(), null);
    }

    // String payload and No Callback
    public void callJS(String funcName, String string) {
        callTheJS(funcName, "'" + string + "'", null);
    }

    // Integer payload and No Callback
    public void callJS(String funcName, Integer integer) {
        callTheJS(funcName, integer.toString(), null);
    }

    // Integer payload and No Callback
    public void callJS(String funcName, Boolean bool) {
        callTheJS(funcName, bool.toString(), null);
    }


    // String[] payload and No Callback
    public void callJS(String funcName, String[] string) {
        callJS(funcName, string, null);
    }

    // Integer[] payload and No Callback
    public void callJS(String funcName, Integer[] integer) {
        callJS(funcName, integer, null);
    }


    // Double[] payload and No Callback
    public void callJS(String funcName, Double[] doubl) {
        callJS(funcName, doubl, null);
    }


    class MyHandler extends Handler {

        public static final int INJECT_JAVASCRIPT = 0;

        public MyHandler(Looper looper) {
            super(looper);
        }


        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case INJECT_JAVASCRIPT:
                    webView.loadUrl((String) msg.obj);
            }
        }
    }

    private String generateId() {
        String corpus = "ABCDEFGHIJKLMNOBQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            builder.append(corpus.charAt((int) Math.floor(Math.random() * corpus.length())));
        }
        return builder.toString();
    }


    // Helpers
    //
    public JSONObject makeJSON(String json) {
        try {
            return new JSONObject(json);
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
        }
        //Return empty JSON
        return new JSONObject();
    }

    public void logPayload(String methodName, String payload, String callBackKey) {
        if (DEBUG)
            Log.d(TAG, "Native Method called: " + methodName + " Payload: " + payload + " CallbackKey: " + callBackKey);
    }


}
