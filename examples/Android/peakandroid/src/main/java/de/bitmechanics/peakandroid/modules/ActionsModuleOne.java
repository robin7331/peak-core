package de.bitmechanics.peakandroid.modules;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;
import android.webkit.JavascriptInterface;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import de.bitmechanics.peakandroid.core.PeakCore;

/**
 * Created by Matthias on 5/10/2016.
 */
public abstract class ActionsModuleOne extends CacheModuleTwo {

    protected final String PEAK_ACTIONS_MODULE = "PeakNativeCacheModule";

    private final String TAG = ActionsModuleOne.class.getCanonicalName();


    @Override
    protected void initializePeakCore(PeakCore peakCore, Context ctx){
        super.initializePeakCore(peakCore, ctx);
        if(isPluginRequested(PEAK_ACTIONS_MODULE)) {
            Log.d(TAG, PEAK_ACTIONS_MODULE + " loaded.");
        }
    }


    @JavascriptInterface
    protected void openMail(String payload) {
        peakCore.logPayload("openMail", payload, null);
        JSONObject obj = peakCore.makeJSON(payload);
        try {
            JSONArray mailto = obj.getJSONArray("mailto");
            String[] addresses = new String[mailto.length()];
            for (int i = 0; i < addresses.length; i++) {
                addresses[i] = (String) mailto.get(i);
            }
            String subject = obj.getString("subject");
            String body = obj.getString("body");
            Intent intent = new Intent(Intent.ACTION_SENDTO);
            intent.setData(Uri.parse("mailto:")); // only email apps should handle this
            intent.putExtra(Intent.EXTRA_EMAIL, addresses);
            intent.putExtra(Intent.EXTRA_SUBJECT, subject);
            intent.putExtra(Intent.EXTRA_HTML_TEXT, body);
            ctx.startActivity(intent);
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
        }
    }

    @JavascriptInterface
    protected void openURL(String payload){
        peakCore.logPayload("openURL", payload, null);
        String url = payload;
        Intent i = new Intent(Intent.ACTION_VIEW);
        i.setData(Uri.parse(url));
        ctx.startActivity(i);
    }



}
