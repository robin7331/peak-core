package de.bitmechanics.androidsamples;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebView;

import de.bitmechanics.peakcoreandroid.core.PeakCore;
import de.bitmechanics.peakcoreandroid.module.CoreModule;
import de.bitmechanics.peakcoreandroid.utils.WebViewUtils;

public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        WebView wv = (WebView) findViewById(R.id.webView);
        //Peak
        PeakCore peak = new PeakCore(wv, new CoreModule() {

            @Override
            protected void onWindowLoad() {
                if (PEAK_CONTEXT.DEBUG)
                    Log.d(TAG, "onWindowLoad() called!");
            }

            @Override
            protected void onVueReady() {
                if (PEAK_CONTEXT.DEBUG)
                    Log.d(TAG, "onVueReady() called!");
            }
        });

        peak.useModule(new MyUserlandModule());
        peak.getCoreModule().enableDebug(true);

        WebViewUtils.loadWebApp(wv,"webapp",getCacheDir(),true);
    }
}
