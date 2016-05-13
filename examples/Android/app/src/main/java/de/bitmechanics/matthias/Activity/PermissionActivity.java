package de.bitmechanics.matthias.Activity;

import de.bitmechanics.peakandroid.utils.RequestPermissionActivity;

public class PermissionActivity extends RequestPermissionActivity {

    @Override
    protected Class getStartActivity() {
        return MainActivity.class;
    }

    @Override
    protected String[] getLocalPermissions() {
        return new String[]{};
    }
}
