package de.bitmechanics.matthias.Activity;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

public class PermissionActivity extends Activity {

    private static final String LOG_TAG = PermissionActivity.class
            .getCanonicalName();

    private boolean mCanWeFly = true;

    private String[] perms = { "com.android.vending.CHECK_LICENSE",
            "android.permission.INTERNET", 
            "android.permission.WAKE_LOCK",
            "android.permission.ACCESS_NETWORK_STATE",
            "android.permission.ACCESS_WIFI_STATE",
            "android.permission.WRITE_EXTERNAL_STORAGE" };

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
            for (int i = 0; i < perms.length; i++) {
                if (!hasPermission(perms[i])) {
                    mCanWeFly = false;
                    Log.d(LOG_TAG, "Ask for it...");
                    requestPermissions(perms, 200);
                }
            }
        }
        Log.d(LOG_TAG,"Smores: " + canMakeSmores() + "!!");
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
        switch (permsRequestCode) {
            case 200:
                mCanWeFly = true;
                for (int i = 0; i < perms.length; i++) {
                    if (!hasPermission(perms[i])) {
                        mCanWeFly = false;
                    }
                }
                if (mCanWeFly) {
                    startApp();
                } else {
                    finish();
                }
                break;
            default:
                System.exit(0);
                break;
        }
    }

    private void startApp() {
        Log.d(LOG_TAG, "Ready. Starting App");
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP
                | Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
        finish();
    }

}
