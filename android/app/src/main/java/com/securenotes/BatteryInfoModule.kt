package com.securenotes

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext

class BatteryInfoModule(reactContext: ReactApplicationContext) :
    NativeBatteryInfoSpec(reactContext) {

    companion object {
        const val NAME = "NativeBatteryInfo"
    }

    override fun getName(): String = NAME

    /**
     * Mengambil persentase level baterai perangkat (0.0 - 100.0).
     */
    override fun getBatteryLevel(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                val batteryManager =
                    reactApplicationContext.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
                val capacity =
                    batteryManager?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) ?: -1
                if (capacity >= 0) {
                    promise.resolve(capacity.toDouble())
                    return
                }
            }

            // Fallback via Sticky Intent ACTION_BATTERY_CHANGED
            val intentFilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
            val batteryStatus = reactApplicationContext.registerReceiver(null, intentFilter)
            val level = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
            val scale = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1

            if (level >= 0 && scale > 0) {
                val percentage = (level.toFloat() / scale.toFloat()) * 100f
                promise.resolve(percentage.toDouble())
            } else {
                promise.resolve(-1.0)
            }
        } catch (e: Exception) {
            promise.reject(
                "E_BATTERY_ERROR",
                "Gagal mengambil informasi baterai: ${e.message}",
                e
            )
        }
    }

    /**
     * Mengecek apakah perangkat sedang diisi daya (charging / full).
     */
    override fun isCharging(promise: Promise) {
        try {
            val intentFilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
            val batteryStatus = reactApplicationContext.registerReceiver(null, intentFilter)
            val status = batteryStatus?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
            val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                    status == BatteryManager.BATTERY_STATUS_FULL
            promise.resolve(isCharging)
        } catch (e: Exception) {
            promise.reject(
                "E_BATTERY_CHARGING_ERROR",
                "Gagal memeriksa status pengisian daya: ${e.message}",
                e
            )
        }
    }
}
