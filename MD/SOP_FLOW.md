# SOP_FLOW.md

## HS Studio Graduation Management System (HSGMS)
### Standard Operating Procedure — Alur Operasional Bisnis

> **Scope:** Dokumen ini menjelaskan alur operasional bisnis layanan foto wisuda HS Studio secara menyeluruh.
> Bukan wedding. Bukan family photography. Bukan studio management umum.
>
> **Audience:** Tim operasional, admin studio, analis sistem, dan onboarding staf baru.
>
> **Versi:** 1.0.0 — 2025-06-29

---

## Table of Contents

1. [Business Flow Diagram](#1-business-flow-diagram)
2. [Customer Journey](#2-customer-journey)
3. [Admin Journey](#3-admin-journey)
4. [Status Transition](#4-status-transition)
5. [Penjelasan Setiap Tahap](#5-penjelasan-setiap-tahap)
6. [Trigger Perubahan Status](#6-trigger-perubahan-status)
7. [Error Handling](#7-error-handling)
8. [Exception Flow](#8-exception-flow)
9. [Future Improvement](#9-future-improvement)
10. [Best Practice](#10-best-practice)
11. [Changelog](#11-changelog)

---

## 1. Business Flow Diagram

### 1.1 Main Business Flow

```
╔══════════════════════════════════════════════════════════════════════╗
║               HS STUDIO — ALUR BISNIS FOTO WISUDA                    ║
╚══════════════════════════════════════════════════════════════════════╝

  ┌─────────────┐
  │    CLIENT   │
  └──────┬──────┘
         │
         ▼
  ┌──────────────────────────────────────────────┐
  │  FASE 1 — BOOKING ONLINE                      │
  │                                               │
  │  Client mengisi form booking di booking.html  │
  │  → Upload bukti transfer DP                   │
  └──────────────────────┬───────────────────────┘
                         │
                         ▼
  ┌──────────────────────────────────────────────┐
  │  FASE 2 — VERIFIKASI ADMIN                    │
  │                                               │
  │  Admin memeriksa bukti transfer               │
  │  → Konfirmasi DP secara manual                │
  │  → Generate QR Code untuk client             │
  └──────────────────────┬───────────────────────┘
                         │
                         ▼
  ┌──────────────────────────────────────────────┐
  │  FASE 3 — HARI H (ON-SITE)                    │
  │                                               │
  │  Client datang ke studio membawa QR Code      │
  │  → Admin scan QR                              │
  │  → Admin pilih studio                         │
  │  → Data dikirim ke sistem antrian             │
  └──────────────────────┬───────────────────────┘
                         │
                         ▼
  ┌──────────────────────────────────────────────┐
  │  FASE 4 — SESI FOTO                           │
  │                                               │
  │  Client menunggu giliran antrian              │
  │  → Dipanggil masuk studio                     │
  │  → Sesi foto berlangsung                      │
  │  → Selesai                                    │
  └──────────────────────────────────────────────┘
```

### 1.2 Flow dengan Decision Point

```
  [START]
     │
     ▼
  [Client Buka booking.html]
     │
     ▼
  [Isi Form Booking]
     │
     ▼
  [Upload Bukti Transfer DP]
     │
     ▼
  [Submit → Status: PENDING]
     │
     ▼
  [Admin Terima Notifikasi Booking Baru]
     │
     ▼
  [Admin Periksa Bukti Transfer]
     │
     ├──── [Bukti VALID?] ──── TIDAK ───► [Admin Tandai Invalid]
     │                                          │
     │                                          ▼
     │                                    [Hubungi Client]
     │                                          │
     │                                          ▼
     │                                    [Client Upload Ulang]
     │                                          │
     │                                    [Kembali ke Periksa]
     │
     ▼ YA
  [Admin Konfirmasi DP → Status: DP_VERIFIED]
     │
     ▼
  [Admin Generate QR Code → Status: QR_GENERATED]
     │
     ▼
  [QR Dikirim ke Client (WhatsApp/Email)]
     │
     ▼
  [Hari H — Client Datang ke Studio]
     │
     ▼
  [Admin Scan QR Client]
     │
     ├──── [QR Valid?] ──── TIDAK ───► [Lihat Exception Flow §8.2]
     │
     ▼ YA
  [Status: CHECKED_IN]
     │
     ▼
  [Admin Pilih Studio untuk Client]
     │
     ▼
  [Data Masuk Sistem Antrian → Status: IN_QUEUE]
     │
     ▼
  [Client Menunggu Giliran]
     │
     ▼
  [Client Dipanggil → Status: IN_PROGRESS]
     │
     ▼
  [Sesi Foto Berlangsung]
     │
     ▼
  [Foto Selesai → Status: COMPLETED]
     │
     ▼
  [END]
```

---

## 2. Customer Journey

### 2.1 Peta Perjalanan Client

```
╔═══════════════════════════════════════════════════════════════════════════════════╗
║  CUSTOMER JOURNEY — CLIENT FOTO WISUDA HS STUDIO                                  ║
╠══════════════╦════════════════╦══════════════════╦══════════════╦════════════════╣
║   FASE       ║  TINDAKAN      ║   TOUCHPOINT     ║  PERASAAN    ║  KEBUTUHAN     ║
╠══════════════╬════════════════╬══════════════════╬══════════════╬════════════════╣
║ Awareness    ║ Tahu HS Studio ║ Media sosial,    ║ 😊 Antusias  ║ Info harga,    ║
║              ║ dari teman /   ║ rekomendasi      ║              ║ paket foto     ║
║              ║ kampus         ║ teman            ║              ║                ║
╠══════════════╬════════════════╬══════════════════╬══════════════╬════════════════╣
║ Booking      ║ Buka           ║ booking.html     ║ 🤔 Penasaran ║ Form yang      ║
║              ║ booking.html   ║                  ║              ║ mudah diisi    ║
║              ║ Isi form data  ║                  ║              ║                ║
╠══════════════╬════════════════╬══════════════════╬══════════════╬════════════════╣
║ Pembayaran   ║ Transfer DP    ║ Rekening bank    ║ 😰 Khawatir  ║ Konfirmasi     ║
║ DP           ║ Upload bukti   ║ booking.html     ║ belum        ║ penerimaan     ║
║              ║ transfer       ║                  ║ dikonfirmasi ║ booking        ║
╠══════════════╬════════════════╬══════════════════╬══════════════╬════════════════╣
║ Menunggu     ║ Tunggu         ║ WhatsApp /       ║ 😐 Menunggu  ║ Kepastian      ║
║ Konfirmasi   ║ konfirmasi     ║ notifikasi       ║              ║ jadwal         ║
║              ║ dari admin     ║                  ║              ║                ║
╠══════════════╬════════════════╬══════════════════╬══════════════╬════════════════╣
║ Terima QR    ║ Terima QR      ║ WhatsApp /       ║ 😄 Lega      ║ QR tersimpan   ║
║              ║ Code dari      ║ Email            ║ booking      ║ di HP          ║
║              ║ admin          ║                  ║ terkonfirmasi║                ║
╠══════════════╬════════════════╬══════════════════╬══════════════╬════════════════╣
║ Hari H       ║ Datang ke      ║ Lokasi studio    ║ 😊 Semangat  ║ Proses cepat,  ║
║ Check-in     ║ studio         ║ fisik            ║              ║ tidak ribet    ║
║              ║ Tunjukkan QR   ║                  ║              ║                ║
╠══════════════╬════════════════╬══════════════════╬══════════════╬════════════════╣
║ Menunggu     ║ Duduk tunggu   ║ Ruang tunggu     ║ 😐 Sabar     ║ Estimasi       ║
║ Antrian      ║ giliran        ║ studio           ║              ║ waktu tunggu   ║
╠══════════════╬════════════════╬══════════════════╬══════════════╬════════════════╣
║ Sesi Foto    ║ Masuk studio   ║ Studio foto      ║ 🤩 Excited   ║ Arahan yang    ║
║              ║ Foto wisuda    ║                  ║              ║ jelas dari     ║
║              ║                ║                  ║              ║ fotografer     ║
╠══════════════╬════════════════╬══════════════════╬══════════════╬════════════════╣
║ Selesai      ║ Sesi foto      ║ Studio foto      ║ 😁 Puas      ║ Info kapan     ║
║              ║ selesai        ║                  ║              ║ foto jadi      ║
║              ║ Info ambil     ║                  ║              ║                ║
║              ║ hasil foto     ║                  ║              ║                ║
╚══════════════╩════════════════╩══════════════════╩══════════════╩════════════════╝
```

### 2.2 Langkah-langkah Client secara Detail

**Langkah C-1: Akses Halaman Booking**
- Client membuka `booking.html` di browser atau dari link yang dibagikan HS Studio
- Tidak diperlukan login atau akun

**Langkah C-2: Mengisi Form Booking**
- Mengisi nama lengkap (sesuai ijazah)
- Mengisi nomor WhatsApp aktif
- Mengisi nama perguruan tinggi, fakultas, dan program studi
- Mengisi tanggal wisuda
- Menambahkan catatan khusus (opsional)

**Langkah C-3: Transfer DP dan Upload Bukti**
- Melakukan transfer DP ke rekening HS Studio
- Mengupload foto/screenshot bukti transfer di form booking
- Menekan tombol Submit

**Langkah C-4: Menunggu Konfirmasi Admin**
- Admin akan memverifikasi bukti transfer secara manual
- Client menunggu dihubungi oleh admin via WhatsApp

**Langkah C-5: Menerima QR Code**
- Setelah DP diverifikasi, admin mengirimkan QR Code kepada client
- Client menyimpan QR Code di HP (screenshot atau file gambar)

**Langkah C-6: Datang ke Studio Hari H**
- Client datang ke lokasi HS Studio pada hari wisuda
- Menunjukkan QR Code kepada petugas di meja check-in

**Langkah C-7: Menunggu Giliran Antrian**
- Setelah check-in, client mendapatkan nomor antrian
- Menunggu di ruang tunggu hingga dipanggil

**Langkah C-8: Sesi Foto**
- Masuk ke studio yang telah ditentukan
- Menjalani sesi foto wisuda

---

## 3. Admin Journey

### 3.1 Pembagian Tugas Admin

```
┌─────────────────────────────────────────────────────────────────┐
│                    PEMBAGIAN PERAN ADMIN                         │
├────────────────────┬────────────────────┬───────────────────────┤
│  ADMIN VERIFIKASI  │  ADMIN OPERASIONAL │  PETUGAS HARI H       │
│                    │                    │                        │
│  Tugas:            │  Tugas:            │  Tugas:               │
│  - Cek bukti DP    │  - Generate QR     │  - Scan QR client     │
│  - Konfirmasi DP   │  - Kirim QR ke     │  - Pilih studio       │
│  - Tandai invalid  │    client          │  - Input ke antrian   │
│                    │  - Pantau database │  - Panggil antrian    │
│  Halaman:          │                    │                        │
│  admin.html        │  Halaman:          │  Halaman:             │
│                    │  admin.html        │  admin.html           │
└────────────────────┴────────────────────┴───────────────────────┘

Catatan: Satu orang admin dapat merangkap semua peran
         tergantung kapasitas tim HS Studio.
```

### 3.2 Admin Journey — Pra-Hari H

```
[Admin Buka admin.html]
        │
        ▼
[Lihat Daftar Booking PENDING]
        │
        ▼
[Pilih Satu Booking untuk Diverifikasi]
        │
        ▼
[Buka Detail Booking]
        │
        ├── Lihat data diri client
        ├── Lihat nominal DP
        └── Lihat bukti transfer yang diupload
        │
        ▼
[Periksa Kesesuaian Bukti Transfer]
        │
        ├── [SESUAI] ──────────────────────────────┐
        │                                           │
        └── [TIDAK SESUAI] ──► [Tandai & Hubungi] │
                                      │             │
                                      ▼             │
                              [Client Upload Ulang] │
                                      │             │
                                      └─────────────┘
                                                    │
                                                    ▼
                                    [Klik Konfirmasi DP]
                                    [Status → DP_VERIFIED]
                                                    │
                                                    ▼
                                    [Klik Generate QR Code]
                                    [Status → QR_GENERATED]
                                                    │
                                                    ▼
                                    [Kirim QR ke Client]
                                    [via WhatsApp / Email]
```

### 3.3 Admin Journey — Hari H

```
[Petugas Standby di Meja Check-in]
        │
        ▼
[Client Datang & Tunjukkan QR]
        │
        ▼
[Buka admin.html → Fitur Scan QR]
        │
        ▼
[Scan QR Code Client]
        │
        ├── [QR Valid & Status QR_GENERATED?] ──────────────┐
        │                                                    │
        └── [QR Tidak Valid / Sudah Dipakai] ──► [§8.2]   │
                                                            │
                                                            ▼
                                            [Status → CHECKED_IN]
                                                            │
                                                            ▼
                                            [Pilih Studio yang Tersedia]
                                            [Studio A / Studio B / dst]
                                                            │
                                                            ▼
                                            [Klik Assign ke Antrian]
                                            [Status → IN_QUEUE]
                                                            │
                                                            ▼
                                            [Beritahu Client Nomor Antrian]
                                                            │
                                                            ▼
                                    ┌──── [Panggil Antrian Berikutnya] ◄───┐
                                    │                                       │
                                    ▼                                       │
                             [Client Masuk Studio]                         │
                             [Status → IN_PROGRESS]                        │
                                    │                                       │
                                    ▼                                       │
                             [Sesi Foto Berlangsung]                       │
                                    │                                       │
                                    ▼                                       │
                             [Sesi Selesai]                                │
                             [Status → COMPLETED]                          │
                                    │                                       │
                                    └───────────────────────────────────────┘
                                         (lanjut ke client berikutnya)
```

### 3.4 Admin Journey — Pemantauan via database.html

```
[Admin Buka database.html]
        │
        ▼
[Lihat Semua Booking]
        │
        ├── Filter by Status
        │       ├── PENDING (belum diverifikasi)
        │       ├── DP_VERIFIED
        │       ├── QR_GENERATED
        │       ├── CHECKED_IN
        │       ├── IN_QUEUE
        │       ├── IN_PROGRESS
        │       └── COMPLETED
        │
        ├── Filter by Tanggal Wisuda
        │
        ├── Cari by Nama Client
        │
        └── Cari by Nomor Booking
```

---

## 4. Status Transition

### 4.1 Diagram Transisi Status

```
╔═══════════════════════════════════════════════════════════════╗
║              DIAGRAM TRANSISI STATUS BOOKING                   ║
╚═══════════════════════════════════════════════════════════════╝

                         ┌───────────────┐
                    ┌───►│   CANCELLED   │◄──────────────────┐
                    │    └───────────────┘                    │
                    │                                         │
                 [Admin batalkan]                     [Admin batalkan]
                    │                                         │
                    │                                         │
  [Client Submit]   │    [Admin Konfirmasi]  [Admin Generate]│
     ────────►  PENDING ──────────────► DP_VERIFIED ────────► QR_GENERATED
                                                                    │
                                                          [Admin Scan QR]
                                                                    │
                                                                    ▼
                                                              CHECKED_IN
                                                                    │
                                                          [Admin Pilih Studio]
                                                                    │
                                                                    ▼
                                                               IN_QUEUE
                                                                    │
                                                          [Antrian Dipanggil]
                                                                    │
                                                                    ▼
                                                             IN_PROGRESS
                                                                    │
                                                          [Sesi Foto Selesai]
                                                                    │
                                                                    ▼
                                                              COMPLETED
```

### 4.2 Tabel Transisi Status

| Status Asal | Status Tujuan | Aktor | Kondisi |
|---|---|---|---|
| — | `PENDING` | Client | Submit form booking berhasil |
| `PENDING` | `DP_VERIFIED` | Admin | Bukti transfer valid & nominal sesuai |
| `PENDING` | `CANCELLED` | Admin | Bukti transfer tidak valid / client tidak responsif |
| `DP_VERIFIED` | `QR_GENERATED` | Admin | Admin generate QR code |
| `DP_VERIFIED` | `CANCELLED` | Admin | Kebijakan pembatalan khusus |
| `QR_GENERATED` | `CHECKED_IN` | Admin | QR berhasil di-scan hari H |
| `QR_GENERATED` | `CANCELLED` | Admin | Client tidak hadir / pembatalan hari H |
| `CHECKED_IN` | `IN_QUEUE` | Admin | Admin assign client ke studio |
| `IN_QUEUE` | `IN_PROGRESS` | Admin | Client dipanggil masuk studio |
| `IN_PROGRESS` | `COMPLETED` | Admin | Sesi foto selesai |

### 4.3 Status yang Tidak Dapat Diubah (Final States)

```
  COMPLETED  ──── tidak dapat berubah ke status lain
  CANCELLED  ──── tidak dapat berubah ke status lain
```

> Status `COMPLETED` dan `CANCELLED` adalah **terminal state**. Jika ada koreksi yang diperlukan setelah status final, admin harus membuat booking baru atau mendokumentasikan secara manual.

### 4.4 Aturan Transisi

- Transisi status harus **urut dan linear** — tidak bisa melompat (misal: dari `PENDING` langsung ke `CHECKED_IN`)
- Setiap transisi harus **dicatat** dengan `updatedAt` timestamp
- Admin yang melakukan transisi harus **teridentifikasi** (nama/ID admin dicatat)
- Status tidak dapat **mundur** ke status sebelumnya (misal: dari `DP_VERIFIED` kembali ke `PENDING`)

---

## 5. Penjelasan Setiap Tahap

### Tahap 1: Booking Online

**Deskripsi:**
Client mengakses halaman booking online HS Studio dan mengisi formulir pendaftaran foto wisuda.

**Input yang diperlukan:**
- Nama lengkap (sesuai ijazah)
- Nomor WhatsApp aktif
- Nama perguruan tinggi
- Nama fakultas
- Program studi / jurusan
- Tanggal wisuda
- Bukti transfer DP
- Catatan tambahan (opsional)

**Output:**
- Data booking tersimpan di sistem dengan status `PENDING`
- Sistem menyimpan waktu pembuatan booking (`createdAt`)

**Durasi Estimasi:** 5–10 menit

**Batasan:**
- Satu booking mewakili satu orang client (individual, bukan grup)
- Tidak ada pemilihan jam atau slot waktu
- Tidak ada pembayaran via payment gateway — hanya transfer manual

---

### Tahap 2: Upload Bukti Transfer DP

**Deskripsi:**
Setelah mengisi formulir, client melakukan transfer DP ke rekening HS Studio dan mengupload screenshot atau foto bukti transfer.

**Ketentuan DP:**
- Nominal DP ditentukan oleh kebijakan HS Studio (bukan oleh sistem)
- Sisa pembayaran dilunasi secara terpisah (tidak diatur oleh sistem ini)

**Format Bukti Transfer yang Diterima:**
- Screenshot aplikasi m-banking
- Foto struk ATM
- Screenshot konfirmasi transfer

**Batasan:**
- Upload dilakukan langsung di halaman booking pada saat yang sama dengan pengisian form
- Setelah submit, client tidak dapat mengedit data sendiri

---

### Tahap 3: Admin Verifikasi DP

**Deskripsi:**
Admin membuka `admin.html`, melihat daftar booking berstatus `PENDING`, dan memverifikasi kesesuaian bukti transfer yang diupload client.

**Yang diperiksa admin:**
- Nama pengirim transfer (harus sesuai atau dapat dijelaskan)
- Nominal transfer (harus sesuai dengan ketentuan DP)
- Tanggal dan jam transfer (masuk akal / tidak kadaluarsa)
- Bank tujuan (harus ke rekening HS Studio yang benar)

**Hasil Verifikasi:**

| Hasil | Tindakan Admin | Status Berubah ke |
|---|---|---|
| Valid | Klik Konfirmasi DP | `DP_VERIFIED` |
| Tidak Valid | Tandai & hubungi client via WhatsApp | Tetap `PENDING` |
| Client Tidak Responsif | Batalkan booking | `CANCELLED` |

**SLA (Service Level Agreement):**
- Verifikasi dilakukan maksimal **1×24 jam** setelah booking masuk
- Di luar jam kerja, verifikasi dilakukan di hari kerja berikutnya

---

### Tahap 4: Generate QR Code

**Deskripsi:**
Setelah DP dikonfirmasi, admin men-generate QR Code unik yang akan digunakan client untuk check-in di hari wisuda.

**Properti QR Code:**
- Berisi `bookingId` unik yang tersimpan di database
- Satu booking = satu QR Code
- QR Code hanya berlaku untuk satu kali scan

**Distribusi QR Code:**
- Admin mengirimkan QR Code kepada client melalui WhatsApp atau Email
- Client diminta untuk menyimpan QR Code di HP (screenshot)
- QR Code dikirim minimal **H-3** sebelum hari wisuda

---

### Tahap 5: Client Datang ke Studio (Hari H)

**Deskripsi:**
Pada hari wisuda, client datang ke lokasi HS Studio dengan membawa QR Code yang telah diterima.

**Yang perlu dibawa client:**
- QR Code (di HP atau dicetak)
- Pakaian wisuda (toga, dll.)
- Bukti pembayaran DP (opsional, untuk antisipasi)

**Tidak diperlukan:**
- Booking ulang online
- Check-in online sebelum datang
- Konfirmasi kehadiran via WhatsApp khusus

---

### Tahap 6: Admin Scan QR

**Deskripsi:**
Petugas di meja check-in HS Studio memindai QR Code milik client menggunakan fitur scan di `admin.html`.

**Proses:**
1. Petugas membuka `admin.html` di perangkat yang dilengkapi kamera
2. Client menampilkan QR Code di layar HP
3. Petugas melakukan scan
4. Sistem memvalidasi QR Code:
   - Cek apakah `bookingId` ada di database
   - Cek apakah status booking adalah `QR_GENERATED`
   - Cek apakah QR belum pernah di-scan sebelumnya
5. Jika valid → status berubah ke `CHECKED_IN`

**Durasi Estimasi:** 10–30 detik per client

---

### Tahap 7: Admin Memilih Studio

**Deskripsi:**
Setelah check-in berhasil, petugas memilih studio mana yang akan digunakan oleh client.

**Pertimbangan Pemilihan Studio:**
- Ketersediaan studio (tidak sedang dipakai)
- Panjang antrian di masing-masing studio
- Preferensi atau permintaan khusus client (jika ada)

**Output:**
- Studio terassign ke booking client
- Nomor antrian di studio tersebut di-generate
- Status berubah ke `IN_QUEUE`
- Petugas memberitahu client nomor antrian dan studio tujuan

---

### Tahap 8: Sistem Antrian HS Studio

**Deskripsi:**
Data client masuk ke sistem antrian HS Studio. Client menunggu di ruang tunggu hingga nomor antrian mereka dipanggil.

**Mekanisme Antrian:**
- Antrian bersifat per-studio (bukan antrian global)
- Nomor antrian dibuat secara berurutan sesuai waktu check-in
- Pemanggilan dilakukan oleh petugas studio secara manual atau dengan papan display

**Estimasi Waktu Tunggu:**
- Bergantung pada jumlah client yang sedang dalam antrian
- Bergantung pada durasi sesi foto setiap client

---

### Tahap 9: Sesi Foto

**Deskripsi:**
Client masuk ke studio yang ditentukan dan menjalani sesi foto wisuda.

**Status saat masuk studio:** `IN_PROGRESS`

**Yang terjadi dalam sesi foto:**
- Fotografer HS Studio memimpin sesi
- Client diarahkan untuk pose dan ekspresi
- Pengambilan foto sesuai paket yang dipilih

---

### Tahap 10: Selesai

**Deskripsi:**
Sesi foto selesai. Petugas atau fotografer mengubah status booking menjadi `COMPLETED`.

**Status:** `COMPLETED`

**Tindak lanjut setelah selesai (di luar scope sistem):**
- Informasi kapan dan cara mengambil hasil foto
- Pelunasan sisa pembayaran (jika ada)
- Ulasan atau testimoni client

---

## 6. Trigger Perubahan Status

Setiap perubahan status dipicu oleh **tindakan spesifik** dari aktor tertentu. Tidak ada perubahan status otomatis oleh sistem.

```
┌────────────────────┬───────────────────────────┬─────────────┬───────────────┐
│  DARI STATUS       │  KE STATUS                │  AKTOR      │  TRIGGER      │
├────────────────────┼───────────────────────────┼─────────────┼───────────────┤
│  (baru)            │  PENDING                  │  Client     │  Klik Submit  │
│                    │                           │             │  form booking │
├────────────────────┼───────────────────────────┼─────────────┼───────────────┤
│  PENDING           │  DP_VERIFIED              │  Admin      │  Klik tombol  │
│                    │                           │             │  "Konfirmasi  │
│                    │                           │             │  DP"          │
├────────────────────┼───────────────────────────┼─────────────┼───────────────┤
│  DP_VERIFIED       │  QR_GENERATED             │  Admin      │  Klik tombol  │
│                    │                           │             │  "Generate QR"│
├────────────────────┼───────────────────────────┼─────────────┼───────────────┤
│  QR_GENERATED      │  CHECKED_IN               │  Admin /    │  Scan QR Code │
│                    │                           │  Petugas    │  berhasil     │
│                    │                           │  Hari H     │  divalidasi   │
├────────────────────┼───────────────────────────┼─────────────┼───────────────┤
│  CHECKED_IN        │  IN_QUEUE                 │  Admin /    │  Klik tombol  │
│                    │                           │  Petugas    │  "Assign      │
│                    │                           │  Hari H     │  Studio"      │
├────────────────────┼───────────────────────────┼─────────────┼───────────────┤
│  IN_QUEUE          │  IN_PROGRESS              │  Petugas    │  Klik tombol  │
│                    │                           │  Studio     │  "Panggil     │
│                    │                           │             │  Antrian"     │
├────────────────────┼───────────────────────────┼─────────────┼───────────────┤
│  IN_PROGRESS       │  COMPLETED                │  Petugas    │  Klik tombol  │
│                    │                           │  Studio /   │  "Selesai"    │
│                    │                           │  Admin      │               │
├────────────────────┼───────────────────────────┼─────────────┼───────────────┤
│  PENDING /         │  CANCELLED                │  Admin      │  Klik tombol  │
│  DP_VERIFIED /     │                           │             │  "Batalkan    │
│  QR_GENERATED      │                           │             │  Booking"     │
└────────────────────┴───────────────────────────┴─────────────┴───────────────┘
```

---

## 7. Error Handling

### 7.1 Error pada Fase Booking Online

| Kode Error | Kondisi | Penanganan |
|---|---|---|
| `ERR-B01` | Form disubmit tanpa field wajib | Tampilkan pesan error per field; tidak dapat submit |
| `ERR-B02` | Upload bukti transfer gagal (file terlalu besar) | Tampilkan info batas ukuran file; minta upload ulang |
| `ERR-B03` | Upload bukti transfer gagal (format tidak didukung) | Tampilkan format yang diterima (JPG, PNG, PDF) |
| `ERR-B04` | Koneksi internet terputus saat submit | Tampilkan pesan "Coba lagi"; data form tidak hilang |
| `ERR-B05` | Tanggal wisuda di masa lalu | Validasi client-side; tampilkan peringatan |

### 7.2 Error pada Fase Verifikasi Admin

| Kode Error | Kondisi | Penanganan |
|---|---|---|
| `ERR-A01` | Bukti transfer tidak terbaca / buram | Admin hubungi client untuk upload ulang |
| `ERR-A02` | Nominal DP tidak sesuai (kurang) | Admin hubungi client untuk konfirmasi kekurangan |
| `ERR-A03` | Nama pengirim berbeda dengan data booking | Admin verifikasi manual via WhatsApp client |
| `ERR-A04` | Bukti transfer duplikat (sama dengan booking lain) | Eskalasi ke supervisor; jangan konfirmasi dulu |

### 7.3 Error pada Fase QR — Hari H

| Kode Error | Kondisi | Penanganan |
|---|---|---|
| `ERR-Q01` | QR Code tidak dapat terbaca (buram/rusak) | Admin cari booking manual by nama di admin.html |
| `ERR-Q02` | QR Code valid tapi status bukan `QR_GENERATED` | Lihat Exception Flow §8.2 |
| `ERR-Q03` | QR Code tidak ditemukan di database | Verifikasi identitas manual; lihat §8.3 |
| `ERR-Q04` | Kamera/perangkat scan tidak berfungsi | Gunakan perangkat cadangan; atau proses manual |

### 7.4 Error pada Fase Antrian

| Kode Error | Kondisi | Penanganan |
|---|---|---|
| `ERR-Q10` | Semua studio penuh / sedang dipakai | Minta client tunggu; estimasikan waktu tersedia |
| `ERR-Q11` | Nomor antrian duplikat (race condition) | Admin perbarui nomor antrian secara manual |

---

## 8. Exception Flow

### 8.1 Pembatalan Booking oleh Client

```
[Client Ingin Batalkan Booking]
        │
        ▼
[Client Hubungi Admin via WhatsApp]
        │
        ▼
[Admin Buka admin.html → Cari Booking]
        │
        ▼
[Cek Status Booking]
        │
        ├── [PENDING / DP_VERIFIED] ──► [Pembatalan dapat diproses]
        │           │
        │           ▼
        │   [Kebijakan Refund DP berlaku]
        │   [Sesuai ketentuan HS Studio]
        │           │
        │           ▼
        │   [Admin Update Status → CANCELLED]
        │
        └── [QR_GENERATED / CHECKED_IN / dst]
                    │
                    ▼
            [Eskalasi ke pimpinan]
            [Keputusan di luar sistem]
```

> **Catatan:** Kebijakan refund DP ditentukan oleh manajemen HS Studio dan berada di luar scope sistem ini.

### 8.2 QR Code Sudah Pernah Di-scan (Duplikat)

```
[Admin Scan QR]
        │
        ▼
[Sistem Validasi QR]
        │
        ▼
[Status booking bukan QR_GENERATED]
(sudah CHECKED_IN atau lebih lanjut)
        │
        ▼
[Sistem Tampilkan Peringatan]
"QR Code ini sudah digunakan.
 Booking: {namaClient} — Status: {statusSaatIni}"
        │
        ├── [Client memang sudah check-in tadi?]
        │           │
        │           ▼
        │   [Abaikan, lanjutkan normal]
        │
        └── [Suspect fraud / QR dibagikan ke orang lain?]
                    │
                    ▼
            [Eskalasi ke supervisor]
            [Verifikasi identitas client secara manual]
            [Dokumentasikan insiden]
```

### 8.3 Client Tidak Membawa / Kehilangan QR Code

```
[Client Tidak Punya QR Code]
        │
        ▼
[Petugas Buka admin.html]
        │
        ▼
[Cari Booking by Nama / Nomor HP]
        │
        ▼
[Verifikasi Identitas Client Secara Manual]
  - Tanya nama lengkap
  - Tanya nama universitas
  - Tanya nomor HP yang didaftarkan
        │
        ▼
[Booking Ditemukan & Identitas Cocok?]
        │
        ├── [YA] ──► [Admin proses check-in manual]
        │            [Ubah status ke CHECKED_IN secara manual]
        │            [Lanjut ke assign studio]
        │
        └── [TIDAK] ──► [Tidak dapat diproses]
                         [Minta client hubungi manajemen HS Studio]
```

### 8.4 Client Terlambat Datang (QR Sudah Tidak Relevan)

```
[Client Datang Sangat Terlambat]
(misal: wisuda sudah selesai / hari sudah lewat)
        │
        ▼
[QR masih valid secara teknis di sistem]
        │
        ▼
[Keputusan ada di tangan admin / manajemen]
        │
        ├── [Izinkan foto di hari lain] ──► [Update graduationDate]
        │                                   [QR tetap berlaku]
        │
        └── [Tidak dapat diproses] ──► [Status → CANCELLED]
                                       [Dokumentasikan alasan]
```

### 8.5 Gangguan Sistem / Internet Mati Hari H

```
[Internet / Sistem Down saat Hari H]
        │
        ▼
[Prosedur Darurat (Manual)]
        │
        ├── Petugas catat check-in manual di kertas
        ├── Nomor antrian diberikan manual
        ├── Foto tetap berlangsung
        └── Update status di sistem setelah internet kembali
```

> **Penting:** HS Studio harus menyiapkan prosedur manual (formulir kertas cadangan) sebagai backup jika sistem tidak dapat diakses.

---

## 9. Future Improvement

### 9.1 Notifikasi Otomatis (Prioritas Tinggi)

**Kondisi saat ini:** Admin menghubungi client secara manual via WhatsApp.

**Perbaikan yang diusulkan:**
- Integrasi WhatsApp Business API untuk kirim notifikasi otomatis saat:
  - Booking berhasil dibuat (konfirmasi penerimaan)
  - DP berhasil dikonfirmasi
  - QR Code dikirim otomatis ke client
  - Pengingat H-1 sebelum hari wisuda

**Dampak:** Mengurangi beban admin, meningkatkan pengalaman client.

---

### 9.2 Display Antrian Real-time (Prioritas Tinggi)

**Kondisi saat ini:** Petugas memanggil antrian secara manual.

**Perbaikan yang diusulkan:**
- Layar display di ruang tunggu yang menampilkan nomor antrian yang sedang dipanggil
- Notifikasi WhatsApp otomatis saat antrian client sudah mendekati giliran

**Dampak:** Client tidak perlu terus memperhatikan petugas; pengalaman menunggu lebih nyaman.

---

### 9.3 Self Check-in via QR (Prioritas Menengah)

**Kondisi saat ini:** Check-in dilakukan oleh admin/petugas.

**Perbaikan yang diusulkan:**
- Sediakan kiosk atau tablet di pintu masuk
- Client scan QR sendiri
- Sistem otomatis memproses check-in dan mengarahkan ke studio

**Dampak:** Mengurangi kepadatan di meja check-in saat rush hour wisuda.

---

### 9.4 Laporan & Analitik (Prioritas Menengah)

**Kondisi saat ini:** Tidak ada laporan teragregasi.

**Perbaikan yang diusulkan:**
- Dashboard admin dengan statistik:
  - Total booking per bulan
  - Revenue dari DP (rekap manual)
  - Durasi rata-rata sesi foto
  - Studio paling sering digunakan
  - Tingkat pembatalan

**Dampak:** Membantu manajemen HS Studio dalam pengambilan keputusan bisnis.

---

### 9.5 Multi-Hari Wisuda (Prioritas Menengah)

**Kondisi saat ini:** Filter tanggal ada, namun tidak ada manajemen kapasitas per hari.

**Perbaikan yang diusulkan:**
- Sistem dapat menampilkan total booking per tanggal wisuda
- Admin dapat melihat beban kerja per hari dan mengatur kapasitas

---

### 9.6 Autentikasi Admin (Prioritas Rendah — tapi Penting)

**Kondisi saat ini:** Tidak ada login untuk admin.

**Perbaikan yang diusulkan:**
- Implementasi Firebase Authentication untuk admin
- Role-based access: admin verifikasi vs petugas hari H vs supervisor

**Dampak:** Keamanan data client lebih terjaga.

---

### 9.7 Pelunasan Pembayaran Online (Prioritas Rendah)

**Kondisi saat ini:** Pelunasan dilakukan secara manual di luar sistem.

**Perbaikan yang diusulkan:**
- Pencatatan pelunasan di `hasilpembayaran.html`
- Struk digital yang dapat dicetak/dikirim ke client

---

## 10. Best Practice

### 10.1 Konsistensi Proses

> Seluruh tim admin harus mengikuti alur yang sama tanpa pengecualian informal. Jangan skip tahap verifikasi meski sudah kenal dengan client secara personal.

- Verifikasi DP selalu dilakukan secara sistem (klik tombol Konfirmasi), bukan hanya via WhatsApp
- QR selalu di-generate melalui sistem agar `bookingId` tercatat dengan benar
- Status selalu diperbarui di sistem secara real-time, bukan retroaktif

---

### 10.2 Keamanan Data Client

- Jangan membagikan QR Code client kepada pihak lain
- Data nama, nomor HP, dan universitas client bersifat rahasia internal
- Akses ke `admin.html` dan `database.html` hanya untuk staf terotorisasi

---

### 10.3 Backup Prosedur Manual

- Selalu sediakan formulir check-in manual (kertas) sebagai cadangan
- Petugas harus tahu cara mencari booking by nama jika QR tidak dapat di-scan
- Pastikan semua data manual di-input ulang ke sistem setelah gangguan teratasi

---

### 10.4 Komunikasi dengan Client

- Balas pertanyaan client tentang status booking dalam **1×24 jam**
- Kirim QR Code ke client minimal **H-3** sebelum hari wisuda
- Jika ada perubahan kebijakan (misalnya harga DP berubah), informasikan sebelum client submit booking

---

### 10.5 Pengelolaan Antrian Hari H

- Pastikan tidak ada studio yang idle sementara antrian menumpuk di studio lain
- Distribusikan client secara merata ke semua studio yang tersedia
- Catat `photoStartedAt` dan `photoCompletedAt` secara konsisten untuk analisis durasi

---

### 10.6 Pelatihan Staf Baru

- Semua staf baru wajib membaca dokumen ini sebelum bertugas
- Lakukan simulasi alur lengkap (dari booking hingga selesai) sebelum hari H pertama
- Tunjuk satu orang penanggung jawab sistem per shift hari H

---

### 10.7 Audit Berkala

- Setiap bulan, admin mereview booking dengan status `PENDING` yang sudah lebih dari 7 hari
- Booking `PENDING` yang tidak ada responsnya selama >7 hari dapat ditandai `CANCELLED`
- Data `COMPLETED` diarsipkan secara berkala untuk menjaga performa database

---

## 11. Changelog

| Versi | Tanggal | Perubahan | Penulis |
|---|---|---|---|
| `1.0.0` | 2025-06-29 | Initial SOP — alur operasional bisnis HSGMS | System Analyst |

---

*Dokumen ini adalah Standard Operating Procedure resmi untuk layanan foto wisuda HS Studio.*
*Setiap perubahan alur bisnis harus diperbarui di dokumen ini sebelum diimplementasikan.*

*HS Studio Graduation Management System — Internal Document*
*Dilarang disebarluaskan tanpa izin manajemen HS Studio.*
