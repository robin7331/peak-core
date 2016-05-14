package de.bitmechanics.androidsamples;

import de.bitmechanics.peakandroid.utils.RequestPermissionsActivity;

public class PermissionActivity extends RequestPermissionsActivity {

    @Override
    protected Class getStartActivity() {
        return MainActivity.class;
    }

    @Override
    protected String[] getLocalPermissions() {
        return new String[]{};
    }
}