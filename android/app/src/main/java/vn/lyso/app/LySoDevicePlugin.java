package vn.lyso.app;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.media.AudioManager;
import android.os.SystemClock;
import android.view.Surface;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Thông tin máy cho app. Chế độ chuông: ringerMode (ARCHITECTURE.md mục 12.2).
 * La bàn: đọc TYPE_ROTATION_VECTOR, kèm độ tin cậy mà sự kiện web không có (ARCHITECTURE.md mục 11).
 * Máy không có con quay thì dùng TYPE_GEOMAGNETIC_ROTATION_VECTOR. Hướng là Bắc từ, không cần quyền Android nào.
 */
@CapacitorPlugin(name = "LySoDevice")
public class LySoDevicePlugin extends Plugin implements SensorEventListener {

    private static final long MIN_INTERVAL_MS = 66; // tối đa 15 lần/giây
    private static final double TILT_LIMIT_DEG = 60;

    private SensorManager sensors;
    private Sensor rotation;
    private Sensor magnetometer;
    private boolean listening = false;
    private int magAccuracy = Integer.MIN_VALUE;
    private long lastSent = 0;
    private final float[] matrix = new float[9];
    private final float[] remapped = new float[9];
    private final float[] angles = new float[3];

    @Override
    public void load() {
        sensors = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        rotation = sensors.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        if (rotation == null) rotation = sensors.getDefaultSensor(Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR);
        magnetometer = sensors.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
    }

    /** Bắt đầu đo. `available` = false khi máy không có cảm biến hướng. */
    @PluginMethod
    public void start(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("available", rotation != null);
        listening = rotation != null;
        register();
        call.resolve(ret);
    }

    /** WebView không đọc được chế độ im lặng; Web Audio lại phát trên kênh media nên không tự tắt theo. */
    @PluginMethod
    public void ringerMode(PluginCall call) {
        AudioManager audio = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
        int mode = audio.getRingerMode();
        JSObject ret = new JSObject();
        ret.put("mode", mode == AudioManager.RINGER_MODE_NORMAL ? "normal" : mode == AudioManager.RINGER_MODE_VIBRATE ? "vibrate" : "silent");
        call.resolve(ret);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        listening = false;
        sensors.unregisterListener(this);
        call.resolve();
    }

    private void register() {
        if (!listening) return;
        sensors.registerListener(this, rotation, SensorManager.SENSOR_DELAY_UI);
        if (magnetometer != null) sensors.registerListener(this, magnetometer, SensorManager.SENSOR_DELAY_UI);
    }

    @Override
    protected void handleOnPause() {
        sensors.unregisterListener(this);
    }

    @Override
    protected void handleOnResume() {
        register();
    }

    @Override
    protected void handleOnDestroy() {
        sensors.unregisterListener(this);
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor == magnetometer) {
            magAccuracy = event.accuracy;
            return;
        }
        long now = SystemClock.elapsedRealtime();
        if (now - lastSent < MIN_INTERVAL_MS) return;
        lastSent = now;

        SensorManager.getRotationMatrixFromVector(matrix, event.values);
        remapForDisplay();
        SensorManager.getOrientation(remapped, angles);

        JSObject ret = new JSObject();
        ret.put("heading", (Math.toDegrees(angles[0]) + 360) % 360);
        if (magAccuracy != Integer.MIN_VALUE) ret.put("accuracy", magAccuracy);
        if (event.values.length > 4 && event.values[4] >= 0) ret.put("headingErrorDeg", Math.toDegrees(event.values[4]));
        ret.put("tilted", Math.abs(Math.toDegrees(angles[1])) > TILT_LIMIT_DEG || Math.abs(Math.toDegrees(angles[2])) > TILT_LIMIT_DEG);
        notifyListeners("heading", ret);
    }

    /** App không khoá chiều màn hình nên phải đổi trục theo hướng hiển thị. */
    private void remapForDisplay() {
        int x = SensorManager.AXIS_X, y = SensorManager.AXIS_Y;
        switch (getActivity().getWindowManager().getDefaultDisplay().getRotation()) {
            case Surface.ROTATION_90:
                x = SensorManager.AXIS_Y;
                y = SensorManager.AXIS_MINUS_X;
                break;
            case Surface.ROTATION_180:
                x = SensorManager.AXIS_MINUS_X;
                y = SensorManager.AXIS_MINUS_Y;
                break;
            case Surface.ROTATION_270:
                x = SensorManager.AXIS_MINUS_Y;
                y = SensorManager.AXIS_X;
                break;
            default:
                break;
        }
        SensorManager.remapCoordinateSystem(matrix, x, y, remapped);
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        if (sensor == magnetometer) magAccuracy = accuracy;
    }
}
