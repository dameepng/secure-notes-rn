package com.securenotes

import android.app.KeyguardManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext

class SecurityCheckerModule(reactContext: ReactApplicationContext) :
    NativeSecurityCheckerSpec(reactContext) {

    companion object {
        const val NAME = "NativeSecurityChecker"
    }

    override fun getName(): String = NAME

    /**
     * Memeriksa apakah perangkat pengguna diproteksi dengan PIN, Password, Pola, atau Biometrik.
     */
    override fun isDeviceSecure(promise: Promise) {
        try {
            val keyguardManager = reactApplicationContext.getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
            val isSecure = keyguardManager?.isDeviceSecure ?: false
            promise.resolve(isSecure)
        } catch (e: Exception) {
            promise.reject("E_SECURITY_CHECK", "Gagal memeriksa status keamanan perangkat: ${e.message}", e)
        }
    }

    /**
     * Mengembalikan level keamanan perangkat secara sinkron langsung via JSI (Synchronous JSI Method).
     * Level: "HIGH" | "MEDIUM" | "LOW"
     */
    override fun getSecurityLevel(): String {
        return try {
            val keyguardManager = reactApplicationContext.getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
            val isSecure = keyguardManager?.isDeviceSecure ?: false
            val hasHwKeystore = isHardwareKeystoreSupported()

            when {
                isSecure && hasHwKeystore -> "HIGH"
                isSecure || hasHwKeystore -> "MEDIUM"
                else -> "LOW"
            }
        } catch (e: Exception) {
            "LOW"
        }
    }

    /**
     * Memeriksa apakah hardware security chip (TEE / StrongBox Keymaster) tersedia di perangkat.
     */
    override fun hasHardwareKeystore(promise: Promise) {
        try {
            val supported = isHardwareKeystoreSupported()
            promise.resolve(supported)
        } catch (e: Exception) {
            promise.reject("E_KEYSTORE_CHECK", "Gagal memeriksa hardware keystore: ${e.message}", e)
        }
    }

    private fun isHardwareKeystoreSupported(): Boolean {
        return try {
            val pm = reactApplicationContext.packageManager
            val hasStrongBox = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                pm.hasSystemFeature(PackageManager.FEATURE_STRONGBOX_KEYSTORE)
            } else {
                false
            }
            val hasHardwareFeature = pm.hasSystemFeature("android.hardware.hardware_keystore") ||
                    pm.hasSystemFeature("android.hardware.strongbox_keystore")

            hasStrongBox || hasHardwareFeature || (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
        } catch (e: Exception) {
            false
        }
    }
}
