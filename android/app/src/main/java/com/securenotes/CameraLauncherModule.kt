package com.securenotes

import android.content.Intent
import android.provider.MediaStore
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext

class CameraLauncherModule(reactContext: ReactApplicationContext) :
    NativeCameraLauncherSpec(reactContext) {

    companion object {
        const val NAME = "NativeCameraLauncher"
    }

    override fun getName(): String = NAME

    /**
     * Membuka aplikasi kamera bawaan perangkat via Intent MediaStore.ACTION_IMAGE_CAPTURE.
     */
    override fun openCamera(promise: Promise) {
        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject("E_NO_ACTIVITY", "Activity Android saat ini tidak tersedia")
            return
        }

        try {
            val cameraIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
            cameraIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            currentActivity.startActivity(cameraIntent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject(
                "E_CAMERA_LAUNCH_FAILED",
                "Gagal membuka aplikasi kamera bawaan: ${e.message}",
                e
            )
        }
    }
}
