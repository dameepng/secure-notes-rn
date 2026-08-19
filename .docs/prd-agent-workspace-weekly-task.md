# PRD: Agent Workspace — Task Mingguan (Agent Status, Call Simulator, Native Bridge)

**Repo:** `secure-notes-rn` (lanjutan dari project yang sama, BUKAN project baru)
**Dokumen ini terpisah** dari `prd-securenotes-rn-newarch.md` supaya konteksnya fokus — kalau lo/agent lagi kerjain task ini, gak perlu baca ulang detail fitur notes/encryption yang gak relevan.

**Konteks buat AI agent:** Project ini udah punya struktur folder (`src/api`, `src/screens`, `src/components`, `src/navigation`, `src/storage`, `src/native`, `src/utils`, `src/types`), navigation udah pake React Navigation, dan udah ada 1 flow existing (SecureNotes). Task ini **nambah screen baru**, bukan bikin ulang dari nol — reuse konvensi folder & pattern yang udah ada.

---

## 1. Overview

Minggu ini fokus ke 4 screen baru yang mensimulasikan use case "agent" (kayak customer service app): status availability, simulasi panggilan, dan akses native device (info device, kamera, audio routing).

## 2. Fitur & Screen

1. **Home** — menu navigasi ke 3 screen lainnya
2. **Agent Status** — ubah & persist status agent (`Available` / `Busy` / `On Call`)
3. **Call Simulator** — simulasi state panggilan dengan auto-transition + kontrol manual
4. **Native Bridge / Device Info** — tampilin data device + akses kamera + switch audio output

## 3. Tech Stack Tambahan

| Kebutuhan | Tools |
|---|---|
| Info device (brand, model, app version) | `react-native-device-info` |
| Battery level | `react-native-device-info` (cepat) ATAU custom TurboModule (buat latihan native) |
| Kamera | Native Intent Android (simpel) atau `react-native-vision-camera` (lebih advanced) |
| Audio playback + routing | `react-native-sound` atau native `MediaPlayer` + `AudioManager` (custom native module) |

---

## 4. Breakdown Per Fase

Urutan fase ini **udah disusun dari yang termudah ke tersulit** — kerjain berurutan, jangan lompat ke Fase 7 (audio) sebelum lancar di fase-fase native yang lebih ringan duluan (Fase 5, 6).

**Penamaan branch:** pake prefix `agent-phase-` (bukan `phase-` polos) biar gak ketuker sama branch PRD SecureNotes yang lama, contoh: `agent-phase-1-home-menu`.

---

### **Fase 1 — Setup Bottom Tab Navigator**
**Tujuan:** Ganti pendekatan awal (bukan bikin `HomeScreen` baru — itu udah ada) jadi setup Bottom Tab Navigator yang menaungi `HomeScreen` existing + 3 screen baru sebagai tab sejajar.

**Konteks penting buat agent:** `LoginScreen.tsx` dan `HomeScreen.tsx` **udah ada** dari PRD SecureNotes sebelumnya. `HomeScreen.tsx` **JANGAN diubah isinya** (dia tetep nampilin notes list) — cukup diikutin ke dalam tab navigator sebagai salah satu tab, bukan dibuat ulang.

**Tugas:**
1. `npm install @react-navigation/bottom-tabs` (kalau belum ada)
2. Bikin `src/navigation/MainTabNavigator.tsx` — Bottom Tab dengan 4 tab: `Home` (pake `HomeScreen` existing), `Agent Status`, `Call Simulator`, `Device Info` (3 screen terakhir buat sekarang boleh masih placeholder kosong, diisi fase berikutnya)
3. Update root navigator (`src/navigation/`) — alur jadi: `LoginScreen` → (login sukses) → render `MainTabNavigator` (bukan langsung `HomeScreen` kayak sebelumnya)
4. Kasih icon simpel tiap tab (boleh pake `lucide-react-native` atau emoji dulu kalau mau cepet)

**Konsep dipelajari:** Bedanya Stack vs Tab Navigator, cara nge-nest 1 screen existing ke dalam navigator baru tanpa ubah isi screen-nya, restructure root navigation flow.

**Deliverable:** Setelah login, muncul Bottom Tab dengan 4 tab, tab "Home" nampilin notes list yang sama kayak sebelumnya (behavior gak berubah), 3 tab lain masih placeholder.

**Acceptance Criteria:** Login → langsung liat Bottom Tab. Tap-tap antar tab jalan mulus, data notes di tab Home tetep persist/muncul normal kayak sebelum ada perubahan ini (regression check — jangan sampe fitur SecureNotes yang lama malah rusak).

---

### **Fase 2 — Device Info Dasar (Brand, Model, App Version)**
**Tujuan:** Latihan pertama manggil data native, pake library dulu (belum custom module) biar dapet "kemenangan cepat" sebelum masuk yang lebih susah.

**Tugas:**
1. `npm install react-native-device-info`
2. Bikin `DeviceInfoScreen.tsx`, tampilin: `getBrand()`, `getModel()`, `getVersion()` (app version)
3. Styling sederhana, list/card buat tiap info

**Konsep dipelajari:** Cara library native (bukan bikinan sendiri) di-bridge ke JS — bandingin API-nya sama TurboModule custom yang bakal lo bikin di fase berikutnya, biar kerasa bedanya "pake buatan orang" vs "bikin sendiri".

**Deliverable:** Screen nampilin brand, model, app version device asli.

**Acceptance Criteria:** Data yang muncul match sama device fisik yang dipake testing.

---

### **Fase 3 — Agent Status (Persisted State)**
**Tujuan:** Latihan persist state yang bener — status harus tetep sama walau app di-kill total.

**Tugas:**
1. Bikin `AgentStatusScreen.tsx`
2. 3 tombol/toggle: `Available`, `Busy`, `On Call` — tap salah satu jadi status aktif
3. Simpen status terpilih ke `AsyncStorage` tiap kali berubah
4. Pas screen di-mount, baca dari `AsyncStorage` dulu buat restore status terakhir — **tampilin loading state** dulu selagi baca, jangan langsung nampilin default value

**Konsep dipelajari:** Pattern "read-before-render" buat data persisted, kenapa loading state penting di sini (biar gak keliatan "flash" ke status default sebelum data asli ke-load).

**Deliverable:** Status agent tersimpan dan ke-restore dengan benar setelah kill app.

**Acceptance Criteria:** Ubah status → kill app total (bukan cuma minimize) → buka lagi → status masih sama kayak terakhir dipilih.

---

### **Fase 4 — Call Simulator (State Machine + Timer)**
**Tujuan:** Latihan ngatur banyak state transisi + async timer dengan bener — ini fase JS paling menantang minggu ini.

**Tugas:**
1. **Gambar dulu state diagram-nya** sebelum ngoding (di kertas/Figma/Excalidraw), tentuin transisi valid, contoh:
   - `idle` → (tap Start Call) → `connecting` → (auto, 2 detik) → `ringing` → (auto, 2 detik) → `connected`
   - `connected` → (tap End Call) → `ended` → (auto, 1 detik) → balik ke `idle`
   - Dari state manapun kecuali `idle`/`ended` → (tap Simulate Failure) → `failed`
   - `failed` → (tap Retry) → balik ke `connecting`
2. Bikin `CallSimulatorScreen.tsx`, implement state machine di atas pake `useState` + `useEffect`
3. Auto-transition antar state pake `setTimeout`/`setInterval` — **WAJIB `clearTimeout`/`clearInterval` di cleanup function** `useEffect`, biar gak ada timer nyangkut kalau user pindah screen di tengah simulasi
4. 4 tombol: `Start Call`, `End Call`, `Simulate Failure`, `Retry` — disable tombol yang gak valid buat state saat itu (misal `Start Call` disable kalau lagi `connected`)
5. Tampilin state saat ini secara visual jelas (badge warna beda tiap state)

**Konsep dipelajari:** State machine pattern di React, cleanup function `useEffect` yang bener, kenapa tombol harus di-disable sesuai state (defensive UI).

**Deliverable:** Simulasi call jalan penuh dari `idle` sampe `ended`/`failed`, tombol responsif sesuai state.

**Acceptance Criteria:** Pindah screen di tengah simulasi (misal pas `connecting`) lalu balik lagi ke Call Simulator — gak ada timer "hantu" yang masih jalan dari state sebelumnya (state harus balik ke `idle` atau state yang predictable, bukan nyangkut).

---

### **Fase 5 — Battery Level (Native Module Kedua)**
**Tujuan:** Naik level dari Fase 2 — kalau di Fase 2 masih pake library orang, di sini coba bikin TurboModule sendiri buat data yang "hidup" (real-time).

**Tugas:**
1. Bikin spec `src/native/NativeBatteryInfo.ts`:
```ts
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getBatteryLevel(): Promise<number>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('BatteryInfoModule');
```
2. Implement native side Android (Kotlin) — ambil dari `BatteryManager`
3. Tampilin battery level di `DeviceInfoScreen.tsx` (nambahin ke screen Fase 2, bukan screen baru)
4. **Kalau waktu mepet**, boleh fallback pake `react-native-device-info` punya `getBatteryLevel()` — tapi coba custom dulu, ini latihan penting buat Fase 7 nanti.

**Konsep dipelajari:** Full cycle bikin TurboModule (yang udah dibahas teorinya di awal), tapi sekarang beneran dipraktekin ke data yang berubah-ubah, bukan data statis kayak brand/model.

**Deliverable:** Battery level device asli muncul di UI, update kalau di-refresh.

**Acceptance Criteria:** Angka battery level berubah sesuai kondisi device asli (coba cabut/colok charger, refresh, angkanya harus berubah).

---

### **Fase 6 — Buka Kamera**
**Tujuan:** Latihan permission handling Android yang bener — ini seringnya yang bikin junior stuck, bukan native code-nya.

**Tugas:**
1. Request runtime permission `CAMERA` pake `PermissionsAndroid` dari React Native
2. Handle 3 kondisi: granted, denied (bisa nanya lagi), denied permanently (harus arahin ke Settings app)
3. Kalau granted, buka kamera — cara paling simpel: trigger native Intent `MediaStore.ACTION_IMAGE_CAPTURE` (buka app kamera bawaan device, gak perlu bikin UI kamera sendiri)
4. Tombol "Buka Kamera" di `DeviceInfoScreen.tsx`

**Konsep dipelajari:** Runtime permission flow Android di React Native, native Intent sebagai cara "pinjam" fitur OS tanpa build UI sendiri.

**Deliverable:** Tap tombol → app kamera bawaan device kebuka.

**Acceptance Criteria:** Kondisi permission ditolak nampilin pesan yang jelas (bukan silent fail/crash), kondisi granted beneran buka kamera.

---

### **Fase 7 — Switch Audio Output (Native Module Tersulit)**
**Tujuan:** Fase paling berat — gabungan native audio routing + playback. Kerjain PALING TERAKHIR.

**Tugas:**
1. Siapin file audio simulasi (`.mp3`/`.ogg`) pendek (misal nada dering/ringtone dummy), taro di `android/app/src/main/res/raw/`
2. Install `react-native-sound` buat playback dasar
3. Bikin spec TurboModule buat audio routing (bagian yang gak di-cover library manapun):
```ts
export interface Spec extends TurboModule {
  setAudioOutput(mode: 'earpiece' | 'speaker' | 'headset'): void;
}
```
4. Implement native Android — pake `AudioManager`:
   - `earpiece` → `audioManager.mode = MODE_IN_COMMUNICATION`, `isSpeakerphoneOn = false`
   - `speaker` → `isSpeakerphoneOn = true`
   - `headset` → cek device audio output tersedia (`isWiredHeadsetOn` atau Bluetooth SCO), route ke situ
5. UI di `DeviceInfoScreen.tsx`: 3 tombol pilihan output, tombol play audio simulasi
6. Test: play audio, ganti output, dengerin bedanya (headphone dicolok vs dicabut)

**Konsep dipelajari:** Native AudioManager API Android, kombinasi TurboModule (kontrol) + library JS (playback) bekerja bareng dalam 1 fitur.

**Deliverable:** Audio simulasi bisa diputar dan output-nya beneran pindah sesuai pilihan user (kerasa bedanya kalau device di-test langsung).

**Acceptance Criteria:** Colok headphone kabel ke device → pilih "speaker" → suara harus keluar dari speaker device (override headphone) → pilih "headset" → balik ke headphone. Behavior ini harus konsisten, bukan cuma keliatan berubah di UI doang.

---

## 5. Cara Kerja

Sama kayak PRD SecureNotes — kerjain berurutan Fase 1 → 7, tiap fase 1 branch (prefix `agent-phase-`), PR ke `main`, direview sebelum lanjut fase berikutnya. Pake prompt `/work-phase` yang sama, tinggal arahin ke file PRD ini pas manggil agent-nya (biar gak ke-mix konteks sama PRD SecureNotes yang lama).
