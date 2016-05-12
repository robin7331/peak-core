package de.bitmechanics.peakandroid.utils;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

public abstract class RequestPermissionActivity extends Activity {

    private static final String LOG_TAG = RequestPermissionActivity.class
            .getCanonicalName();

    private final String[] peakPerms = {
            "android.permission.INTERNET",
            "android.permission.WAKE_LOCK",
            "android.permission.ACCESS_NETWORK_STATE",
            "android.permission.ACCESS_WIFI_STATE",
            "android.permission.WRITE_EXTERNAL_STORAGE"};

    private String[] allPerms;
    private boolean mCanWeFly = true;

    private String[] mergeStringArray(String[] first, String[] second) {
        if (second != null) {
            if (second.length > 0) {
                String[] merged = new String[first.length + second.length];
                for (int i = 0; i < first.length; i++) {
                    merged[i] = first[i];
                }
                for (int i = 0; i < second.length; i++) {
                    merged[i + first.length] = second[i];
                }
                return merged;
            }
        }
        return first;
    }

    private boolean canMakeSmores() {
        return (Build.VERSION.SDK_INT > Build.VERSION_CODES.LOLLIPOP_MR1);
    }

    @SuppressLint("NewApi")
    private boolean hasPermission(String permission) {
        if (canMakeSmores()) {
            boolean granted = checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED;
            Log.d(LOG_TAG, "Permission: " + permission + " - " + granted);
            return granted;
        }
        return true;
    }

    @SuppressLint("NewApi")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        /**
         * Check permissions for marshmallow
         */
        if (canMakeSmores()) {
            allPerms = mergeStringArray(peakPerms,getLocalPermissions());
            for (int i = 0; i < allPerms.length; i++) {
                if (!hasPermission(allPerms[i])) {
                    mCanWeFly = false;
                    Log.d(LOG_TAG, "Ask for it...");
                    requestPermissions(allPerms, 200);
                }
            }
        }
        Log.d(LOG_TAG, "Smores: " + canMakeSmores() + "!!");
        if (mCanWeFly) {
            startApp();
        } else {
            Log.d(LOG_TAG, "We cannot fly.....");
        }
    }

    @Override
    public void onRequestPermissionsResult(int permsRequestCode,
                                           String[] permissions, int[] grantResults) {
        Log.d(LOG_TAG, "Permission result: " + permsRequestCode);
        for (int i = 0; i < allPerms.length; i++) {
            if (!hasPermission(allPerms[i])) {
                finish();
            }
        }
        switch (permsRequestCode) {
            case 200:
                startApp();
                break;
            default:
                System.exit(0);
                break;
        }
    }

    protected void startApp() {
        Log.d(LOG_TAG, "Ready. Starting App");
        Intent intent = new Intent(this, getStartActivity());
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP
                | Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
        finish();
    }


    protected abstract Class getStartActivity();

    protected abstract String[] getLocalPermissions();

}
