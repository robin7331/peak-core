package de.bitmechanics.peakandroid.utils;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

/**
 * Created by Matthias on 5/10/2016.
 */
public class FileSystemHelpers {

    static public void rdelete(File f) throws IOException {
        if (f.isDirectory()) {
            for (File c : f.listFiles())
                rdelete(c);
        }
        if (!f.delete())
            throw new FileNotFoundException("Failed to delete file: " + f);
    }


}
