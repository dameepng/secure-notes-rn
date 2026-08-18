# PRD: SecureNotes — Project Belajar React Native New Architecture

**Tipe project:** Dummy / learning project (bukan produk real, fitur bebas ditentuin buat nutupin konsep-konsep New Arch)
**Tujuan utama:** Belajar RN 0.81.1 + React 19.1.0 dengan New Architecture secara hands-on, per fase, biar ngerti flow bikin app React Native yang best practice — bukan cuma copy-paste tutorial.

---

## 1. Overview

**SecureNotes** adalah aplikasi catatan pribadi sederhana dengan enkripsi lokal. User "login" (dummy auth), bikin catatan, catatannya **dienkripsi pake AES (crypto-js)** sebelum disimpen di device, dan ada 1 fitur native module custom buat latihan TurboModules + Codegen.

Kenapa app ini yang dipilih (bukan to-do list biasa)? Karena flow-nya kebetulan nyentuh semua stack yang lagi lo pelajarin:
- `axios` → dummy API call (login, sync)
- `crypto-js` + polyfill → enkripsi data sensitif
- New Arch (Fabric) → render list catatan
- TurboModules/Codegen → 1 native module custom

## 2. Tujuan Belajar (Learning Goals)

Di akhir project, lo harus bisa jawab pertanyaan ini dengan pede:
- Gimana struktur folder project RN yang scalable?
- Gimana cara setup networking layer yang bener (bukan asal `fetch` di komponen)?
- Gimana cara aman nyimpen data sensitif di device?
- Gimana ngerasain bedanya render New Arch (Fabric) vs komponen biasa?
- Gimana cara bikin native module sendiri dari nol, dan liat Codegen kerja beneran?

## 3. Fitur (Scope)

| Fitur | Fase |
|---|---|
| Setup project + verifikasi New Arch | 0 |
| Struktur folder & konvensi project | 1 |
| Login dummy (axios + mock API) | 2 |
| Navigasi (auth flow: Login → Home) | 3 |
| CRUD catatan (create, read, delete) | 4 |
| Enkripsi catatan (crypto-js + polyfill) | 5 |
| List catatan performa tinggi (FlatList + Fabric) | 6 |
| Native Module custom (TurboModule + Codegen) | 7 |
| Error handling & loading state yang proper | 8 |
| (Opsional) Build APK release | 9 |

**Out of scope:** backend beneran (pake mock/dummy), autentikasi real (pake dummy check), publish ke Play Store.

---

## 4. Tech Stack

| Layer | Tools |
|---|---|
| Core | React Native 0.81.1, React 19.1.0 |
| HTTP | axios 1.12.2 |
| Enkripsi | crypto-js 4.2.0 + react-native-get-random-values |
| Storage | @react-native-async-storage/async-storage |
| Navigasi | @react-navigation/native + native-stack |
| Native Module | TurboModule custom (device info sederhana) |

---

## 5. Breakdown Per Fase

Setiap fase punya: **Tujuan, Tugas konkret, Konsep yang dipelajari, Deliverable, Acceptance Criteria.** Kerjain berurutan — jangan lompat, karena tiap fase ngebangun di atas fase sebelumnya.

---

### **Fase 0 — Setup & Verifikasi New Architecture**
**Tujuan:** Mastiin environment lo bener dan New Arch beneran aktif sebelum ngoding fitur apapun.

**Tugas:**
1. `npx @react-native-community/cli init SecureNotes --version 0.81.1`
2. Cek `android/gradle.properties` → pastiin `newArchEnabled=true`
3. Cek `ios/Podfile` → pastiin `ENV['RCT_NEW_ARCH_ENABLED'] = '1'` (kalau lo dev di Mac/punya akses iOS)
4. Run app, liat log startup — cari keyword `Fabric` atau `TurboModule` di log buat konfirmasi aktif
5. Install React 19.1.0 (biasanya udah default sesuai versi RN, tapi double check di `package.json`)

**Konsep dipelajari:** Cara New Arch dikonfigurasi, bedanya sama Old Arch dari sisi config file.

**Deliverable:** Project kosong yang jalan di emulator/device, New Arch confirmed aktif.

**Acceptance Criteria:** App nge-build tanpa error, log startup nunjukin Fabric/TurboModule aktif.

---

### **Fase 1 — Struktur Folder & Konvensi Project**
**Tujuan:** Biar project lo gak jadi "spaghetti folder" kayak banyak tutorial pemula.

**Tugas:**
1. Bikin struktur folder best practice:
```
src/
  api/          → axios instance & endpoint functions
  screens/      → tiap screen (LoginScreen, HomeScreen, dst)
  components/   → komponen reusable
  navigation/   → setup React Navigation
  storage/      → helper AsyncStorage + enkripsi
  native/       → TypeScript spec buat TurboModule
  utils/        → helper functions
  types/        → TypeScript types/interfaces
```
2. Setup absolute import (`baseUrl` di `tsconfig.json`) biar gak `../../../../`
3. Setup ESLint + Prettier basic (best practice standar RN)

**Konsep dipelajari:** Kenapa separation of concern penting di RN (bedain logic network, storage, UI biar gampang di-maintain & di-test).

**Deliverable:** Struktur folder kosong tapi siap diisi, linting jalan.

**Acceptance Criteria:** `npm run lint` gak error, struktur folder sesuai di atas.

---

### **Fase 2 — Networking Layer (axios)**
**Tujuan:** Belajar setup axios yang proper, bukan asal import terus dipake langsung di komponen.

**Tugas:**
1. Bikin `src/api/client.ts` — 1 axios instance dengan `baseURL`, `timeout`, default headers
2. Bikin interceptor buat:
   - Nambahin token ke header (dummy dulu, hardcode)
   - Handle error global (misal network error, timeout)
3. Bikin `src/api/auth.ts` — fungsi `loginRequest(email, password)` yang manggil **mock API** (pake [mockapi.io](https://mockapi.io) atau [jsonplaceholder](https://jsonplaceholder.typicode.com) buat simulasi, atau bikin delay palsu pake `setTimeout` kalau males setup mock server)
4. Test call dari komponen sederhana, log hasilnya

**Konsep dipelajari:** Kenapa axios instance terpisah dari komponen, cara kerja interceptor, cara handle error network dengan rapi.

**Deliverable:** Fungsi `loginRequest()` yang bisa dipanggil dan return data (dummy).

**Acceptance Criteria:** Call API (dummy) berhasil, error case (misal network mati) ke-handle tanpa crash app.

---

### **Fase 3 — Navigasi & Auth Flow**
**Tujuan:** Bikin flow Login → Home, latihan React Navigation dengan React 19.

**Tugas:**
1. Install `@react-navigation/native` + `native-stack`
2. Bikin `LoginScreen` (form email/password sederhana) dan `HomeScreen` (kosong dulu)
3. Setup conditional navigation: kalau belum login → `LoginScreen`, kalau udah → `HomeScreen`
4. Simpen status login sederhana pake `AsyncStorage` (belum dienkripsi dulu — enkripsi baru masuk di Fase 5)

**Konsep dipelajari:** Pattern auth flow standar di RN, state management sederhana buat auth status.

**Deliverable:** Bisa login (dummy) dan lanjut ke Home, bisa logout balik ke Login.

**Acceptance Criteria:** Restart app pas udah login → tetep di Home (persist), bukan balik ke Login.

---

### **Fase 4 — CRUD Catatan (Belum Terenkripsi)**
**Tujuan:** Bikin fitur utama app-nya dulu secara fungsional, encryption nyusul.

**Tugas:**
1. Bikin form tambah catatan (judul + isi)
2. Simpen catatan ke `AsyncStorage` dalam bentuk array of object (plain text dulu)
3. Tampilin list catatan di `HomeScreen`
4. Fitur hapus catatan

**Konsep dipelajari:** CRUD sederhana pake local storage, state management list data.

**Deliverable:** Bisa tambah, liat, hapus catatan — data masih plain text.

**Acceptance Criteria:** Data catatan persist setelah restart app.

---

### **Fase 5 — Enkripsi Catatan (crypto-js)**
**Tujuan:** Ini bagian intinya — bikin catatan lo beneran aman, praktekin apa yang udah dibahas soal crypto-js.

**Tugas:**
1. `npm install crypto-js react-native-get-random-values`
2. Import `react-native-get-random-values` **paling atas** di `index.js`
3. Bikin `src/storage/encryption.ts`:
   - `encrypt(text: string, key: string): string`
   - `decrypt(cipher: string, key: string): string`
4. Modif fungsi save catatan (Fase 4) biar isi catatan **dienkripsi dulu** sebelum masuk `AsyncStorage`
5. Modif fungsi load catatan biar **didekripsi** pas ditampilin
6. Verifikasi: buka `AsyncStorage` langsung (via debugger/Flipper) → pastiin isinya **ciphertext**, bukan plain text

**Konsep dipelajari:** Kenapa polyfill wajib, cara kerja encrypt/decrypt di real use case, verifikasi security beneran jalan (bukan cuma "kayaknya udah aman").

**Deliverable:** Catatan tersimpan dalam bentuk terenkripsi, aplikasi tetep bisa nampilin plain text ke user.

**Acceptance Criteria:** Data mentah di storage **gak terbaca** sebagai plain text; app tetep decrypt dengan benar pas ditampilin.

---

### **Fase 6 — List Performa Tinggi (FlatList + Fabric)**
**Tujuan:** Ngerasain langsung manfaat Fabric buat rendering list yang smooth.

**Tugas:**
1. Generate dummy 100+ catatan (script sederhana buat seed data)
2. Render pake `FlatList` (bukan `ScrollView` + `.map()`)
3. Optimasi: `keyExtractor`, `getItemLayout` (kalau height item fixed), `removeClippedSubviews`
4. Coba scroll cepet, compare "kerasa" nya sama kalau lo render pake `ScrollView` biasa (buat perbandingan langsung)

**Konsep dipelajari:** Kenapa FlatList > ScrollView buat list panjang, gimana Fabric bikin scroll/render lebih smooth dibanding Old Arch.

**Deliverable:** List 100+ item scroll mulus tanpa lag/jank.

**Acceptance Criteria:** Scroll list gak nge-drop frame secara kasat mata (bisa dicek pake Performance Monitor bawaan RN — shake device/emulator → "Show Perf Monitor").

---

### **Fase 7 — Native Module Custom (TurboModule + Codegen)**
**Tujuan:** Ini fase paling penting buat ngerti New Arch secara langsung — bikin native module dari nol.

**Tugas:**
1. Bikin spec TypeScript di `src/native/NativeDeviceInfo.ts`:
```ts
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getBatteryLevel(): Promise<number>;
  getDeviceModel(): string;
}

export default TurboModuleRegistry.getEnforcing<Spec>('DeviceInfoModule');
```
2. Run codegen (biasanya otomatis pas build, atau manual `npx react-native codegen`)
3. Implement native side di Android (Kotlin) — return battery level device & model name
4. (Opsional) Implement iOS side juga kalau lo punya akses Mac
5. Panggil module ini dari `HomeScreen`, tampilin battery level & device model di UI

**Konsep dipelajari:** Full siklus TurboModule dari spec → codegen → native implementation → dipake di JS. Ini yang bakal ngebuktiin langsung semua teori dari dokumen sebelumnya.

**Deliverable:** UI nampilin battery level & device model asli, diambil dari native code lewat TurboModule buatan sendiri.

**Acceptance Criteria:** Data yang ditampilin match sama kondisi device asli (battery level berubah kalau device di-charge/dicabut).

---

### **Fase 8 — Error Handling & Loading State**
**Tujuan:** Naikin app dari "prototype" ke "layak disebut app beneran".

**Tugas:**
1. Loading indicator pas fetch/save data
2. Error state yang jelas (misal toast/alert kalau gagal decrypt, gagal network)
3. Empty state (misal "Belum ada catatan" kalau list kosong)
4. Try-catch di semua operasi async (encrypt/decrypt, storage, network)

**Konsep dipelajari:** UX dasar yang sering diabaikan pemula tapi krusial di app production.

**Deliverable:** App yang gak nge-blank/crash diem-diem kalau ada error.

**Acceptance Criteria:** Coba matiin network / kasih data corrupt ke storage → app tetep nampilin pesan error yang masuk akal, gak crash.

---

### **Fase 9 — (Opsional) Build Release**
**Tujuan:** Ngerasain proses build APK/AAB beneran.

**Tugas:**
1. Generate keystore
2. Setup `android/app/build.gradle` buat release build
3. `./gradlew assembleRelease`
4. Install APK hasil build ke device fisik, test end-to-end

**Konsep dipelajari:** Bedanya debug build vs release build, terutama soal performa (New Arch biasanya lebih kerasa manfaatnya di release build, bukan debug).

**Deliverable:** APK yang bisa diinstall standalone tanpa Metro bundler.

**Acceptance Criteria:** App jalan normal di device tanpa perlu `npx react-native start` nyala.

---

## 6. Urutan Kerja & Cara Pake PRD Ini

Kerjain fase **berurutan 0 → 9**. Tiap fase itu unit belajar sendiri — jangan lanjut ke fase berikutnya kalau Acceptance Criteria fase sekarang belum kecapai. Kalau lo stuck di satu fase, itu sinyal bagus buat kita bedah bareng sebelum lanjut, bukan di-skip.

Pas lo siap mulai, bilang aja mau mulai dari fase berapa (biasanya Fase 0), nanti kita jalan step-by-step dari situ.
