package de.bitmechanics.matthias.Activity;

import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONException;
import org.json.JSONObject;

import de.bitmechanics.peakandroid.core.PeakCore;

/**
 * Created by Matthias on 5/1/2016.
 */
public class ExampleWebviewNativeInterface extends PeakCore {

    private final String TAG = ExampleWebviewNativeInterface.class.getCanonicalName();

    public ExampleWebviewNativeInterface(WebView webView) {
        super(webView);
    }

    @Override
    protected String[] getModules(){return new String[]{PEAK_ACTIONS_MODULE,PEAK_CACHE_MODULE};};

    @JavascriptInterface
    public void itemClicked(String payload, String callbackKey) {
        Log.e(TAG, makeJSON(payload).toString());
    }

    @JavascriptInterface
    public void setTitle(String payload, String callbackKey) {
        Log.e(TAG, payload);
    }

    @JavascriptInterface
    public void getPosition(float payload, String callbackKey) {
        logPayload("getPosition",payload+"",callbackKey);
        JSONObject retval = new JSONObject();
        try {
            retval.put("longitude", 13.3);
            retval.put("latitude", 14.3);
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
        }
        callJSCallback(callbackKey,retval);
    }

    @JavascriptInterface
    public void getPositionString(float payload, String callbackKey) {
        logPayload("getPositionString",payload+"",callbackKey);
        callJSCallback(callbackKey,"My Position");
    }

    public void getUser(String userName){

        callJS("getUser", userName, new PeakCore.NativeInterfaceCallback() {
            @Override
            public void call(String payload) {
                logPayload("getUserCallback",payload,null);
                JSONObject retval = makeJSON(payload);
            }
        });
    }

    public void addItem(){
        callJS("addItem");
    }


}
