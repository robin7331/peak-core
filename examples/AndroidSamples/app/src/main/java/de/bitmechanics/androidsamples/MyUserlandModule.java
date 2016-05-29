package de.bitmechanics.androidsamples;

import android.content.Context;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import de.bitmechanics.peakcoreandroid.types.BaseCallable;
import de.bitmechanics.peakcoreandroid.types.BaseCallback;
import de.bitmechanics.peakcoreandroid.types.ISimpleCallback;
import de.bitmechanics.peakuserlandandroid.UserlandModule;


/**
 * Created by Matthias on 5/1/2016.
 */
public class MyUserlandModule extends UserlandModule {

    private final String TAG = MyUserlandModule.class.getCanonicalName();

    public MyUserlandModule() {
        super();

        MODULE_METHODS.put("itemClicked", new BaseCallable<String, Void>() {

            @Override
            public Void call() throws Exception {
                itemClicked(parameter);
                return null;
            }

        });

        MODULE_METHODS.put("setTitle", new BaseCallable<String, Void>() {

            @Override
            public Void call() throws Exception {
                setTitle(parameter);
                return null;
            }

        });

        MODULE_METHODS.put("getPosition", new BaseCallable<Double,JSONObject>() {

            @Override
            public Void call() throws Exception {
                getPosition(parameter, callback);
                return null;
            }

        });

        MODULE_METHODS.put("getPositionString", new BaseCallable<Double,String>() {

            @Override
            public Void call() throws Exception {
                getPositionString(parameter,callback);
                return null;
            }

        });
    }

    public void itemClicked(String payload) {
        Log.e(TAG, makeJSONObj(payload).toString());
    }

    public void setTitle(String payload) {
        Log.e(TAG, payload);
    }


    public void getPosition(double payload, final BaseCallback<JSONObject> callback) throws Exception {
        JSONObject retval = new JSONObject();
        try {
            retval.put("longitude", 13.3);
            retval.put("latitude", 14.3);
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
        }
        callback.setPayload(retval);
        callback.call();
    }

    public void getPositionString(double payload, final BaseCallback<String> callback) throws Exception {
        callback.setPayload("My Position");
        callback.call();
    }

    public void getUser(String userName){

        callJS("getUser", userName, new ISimpleCallback() {
            @Override
            public void call(String payload) {
                PEAK_CONTEXT.logPayload(TAG,"getUserCallback",payload,null);
                makeJSONObj(payload);
            }
        });
    }

    public void addItem(){
        callJS("addItem");
    }


}
