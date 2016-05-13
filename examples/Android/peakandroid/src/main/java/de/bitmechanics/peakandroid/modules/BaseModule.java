package de.bitmechanics.peakandroid.modules;

import android.content.Context;

import de.bitmechanics.peakandroid.core.PeakCore;

/**
 * Created by Matthias on 5/10/2016.
 */
public abstract class BaseModule {

    protected PeakCore peakCore;
    protected Context ctx;


    protected void initializePeakCore(PeakCore peakCore, Context ctx) {
        this.peakCore = peakCore;
        this.ctx = ctx;
    }

    protected boolean isPluginRequested(String moduleName){
        String[] modules = getModules();
        for (int i = 0; i < modules.length; i++) {
            if(modules[i].equals(moduleName)){
                return true;
            }
        }
        return false;
    }

    abstract protected String[] getModules();

}
