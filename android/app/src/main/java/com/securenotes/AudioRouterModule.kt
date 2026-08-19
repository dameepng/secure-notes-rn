package com.securenotes

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext

class AudioRouterModule(reactContext: ReactApplicationContext) :
    NativeAudioRouterSpec(reactContext) {

    companion object {
        const val NAME = "NativeAudioRouter"
    }

    private var currentMode: String = "speaker"
    private var mediaPlayer: MediaPlayer? = null
    private val audioManager: AudioManager? by lazy {
        reactApplicationContext.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
    }

    override fun getName(): String = NAME

    /**
     * Mengatur routing output audio (speaker, earpiece, atau headset).
     */
    override fun setAudioOutput(mode: String) {
        val am = audioManager ?: return
        currentMode = mode

        try {
            // Selalu aktifkan MODE_IN_COMMUNICATION agar OS mengizinkan override routing hardware (speaker vs earpiece vs headset)
            am.mode = AudioManager.MODE_IN_COMMUNICATION

            when (mode.lowercase()) {
                "earpiece" -> {
                    am.isSpeakerphoneOn = false
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        val devices = am.availableCommunicationDevices
                        val earpiece = devices.firstOrNull {
                            it.type == AudioDeviceInfo.TYPE_BUILTIN_EARPIECE
                        }
                        if (earpiece != null) {
                            am.setCommunicationDevice(earpiece)
                        }
                    }
                }
                "speaker" -> {
                    // Paksa output keluar dari Loudspeaker utama HP (override earphone/headset kabel/bluetooth)
                    am.isSpeakerphoneOn = true
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        val devices = am.availableCommunicationDevices
                        val speaker = devices.firstOrNull {
                            it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER
                        }
                        if (speaker != null) {
                            am.setCommunicationDevice(speaker)
                        }
                    }
                }
                "headset" -> {
                    am.isSpeakerphoneOn = false
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        val devices = am.availableCommunicationDevices
                        val headset = devices.firstOrNull {
                            it.type == AudioDeviceInfo.TYPE_WIRED_HEADSET ||
                            it.type == AudioDeviceInfo.TYPE_WIRED_HEADPHONES ||
                            it.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO ||
                            it.type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP ||
                            it.type == AudioDeviceInfo.TYPE_USB_HEADSET
                        }
                        if (headset != null) {
                            am.setCommunicationDevice(headset)
                        } else {
                            am.clearCommunicationDevice()
                        }
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun getAudioOutput(): String {
        return currentMode
    }

    override fun playSimulationSound(promise: Promise) {
        try {
            stopSimulationSound()

            // Terapkan routing aktif sebelum memutar suara
            setAudioOutput(currentMode)

            val resId = reactApplicationContext.resources.getIdentifier(
                "simulation_ringtone",
                "raw",
                reactApplicationContext.packageName
            )

            if (resId != 0) {
                mediaPlayer = MediaPlayer().apply {
                    val afd = reactApplicationContext.resources.openRawResourceFd(resId)
                    if (afd != null) {
                        setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
                        afd.close()

                        // Set AudioAttributes ke USAGE_VOICE_COMMUNICATION agar patuh pada routing AudioManager
                        val attributes = AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                            .build()
                        setAudioAttributes(attributes)

                        setOnCompletionListener {
                            it.release()
                            mediaPlayer = null
                        }
                        prepare()
                        start()
                        promise.resolve(true)
                    } else {
                        promise.resolve(false)
                    }
                }
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.reject("E_PLAY_SOUND", "Gagal memutar audio simulasi: ${e.message}", e)
        }
    }

    override fun stopSimulationSound() {
        try {
            mediaPlayer?.let {
                if (it.isPlaying) {
                    it.stop()
                }
                it.release()
            }
            mediaPlayer = null
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun isAudioPlaying(promise: Promise) {
        promise.resolve(mediaPlayer?.isPlaying ?: false)
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        stopSimulationSound()
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                audioManager?.clearCommunicationDevice()
            }
            audioManager?.mode = AudioManager.MODE_NORMAL
            audioManager?.isSpeakerphoneOn = false
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
