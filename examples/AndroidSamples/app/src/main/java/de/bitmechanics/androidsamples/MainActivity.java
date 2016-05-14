package de.bitmechanics.androidsamples;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;

public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        WebView wv = (WebView) findViewById(R.id.webView);
        final ExampleWebviewNativeInterface jsInterface = new ExampleWebviewNativeInterface(wv);
        WebViewUtils.loadWebApp(wv,"webapp",getCacheDir(),true);
    }
}
