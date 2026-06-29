# DATABASE_SCHEMA.md

## HS Studio Graduation Management System (HSGMS)

> **Project Scope:** Sistem manajemen booking foto wisuda khusus HS Studio.
> Bukan wedding, bukan family photography, bukan studio management umum.

---

## Table of Contents

1. [Overview Arsitektur](#1-overview-arsitektur)
2. [Struktur Firebase Realtime Database](#2-struktur-firebase-realtime-database)
3. [Node: `bookings`](#3-node-bookings)
4. [Penjelasan Setiap Field](#4-penjelasan-setiap-field)
5. [Contoh Object JSON Lengkap](#5-contoh-object-json-lengkap)
6. [Akses per Halaman](#6-akses-per-halaman)
7. [Alur Status Booking](#7-alur-status-booking)
8. [Mengapa Struktur Ini Dipilih](#8-mengapa-struktur-ini-dipilih)
9. [Firebase Best Practices](#9-firebase-best-practices)
10. [Firebase Security Rules](#10-firebase-security-rules)
11. [Future Scalability](#11-future-scalability)
12. [Changelog](#12-changelog)

---

## 1. Overview Arsitektur

```
Firebase Realtime Database
└── bookings/
    └── {bookingId}/        ← satu object per booking
        ├── identity/       ← data diri klien
        ├── payment/        ← informasi pembayaran DP
        ├── qr/             ← data QR code
        ├── studio/         ← studio yang dipilih hari H
        ├── queue/          ← posisi antrian hari H
        ├── status          ← status booking saat ini
        ├── createdAt       ← timestamp pembuatan
        └── updatedAt       ← timestamp terakhir diupdate
```

**Prinsip Utama:**
- Flat structure — satu booking = satu object di bawah `/bookings/{bookingId}`
- Tidak ada relasi antar node yang kompleks
- Semua halaman HTML membaca database yang sama
- Tidak menggunakan booking jam, slot, payment gateway, atau antrian global terpisah

---

## 2. Struktur Firebase Realtime Database

```
{
  "bookings": {
    "{bookingId}": {
      "identity": { ... },
      "payment": { ... },
      "qr": { ... },
      "studio": { ... },
      "queue": { ... },
      "status": "string",
      "createdAt": "number (timestamp)",
      "updatedAt": "number (timestamp)"
    }
  }
}
```

### Penjelasan Top-Level Node

| Node | Tipe | Deskripsi |
|---|---|---|
| `bookings` | Object | Root node untuk semua data booking |
| `{bookingId}` | Object | Satu object per booking (key = auto push ID Firebase) |

---

## 3. Node: `bookings`

### 3.1 Sub-node: `identity`

Berisi data diri klien yang diisi saat booking online.

| Field | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `fullName` | `string` | ✅ | Nama lengkap klien sesuai ijazah |
| `phoneNumber` | `string` | ✅ | Nomor WhatsApp aktif klien |
| `universityName` | `string` | ✅ | Nama perguruan tinggi |
| `facultyName` | `string` | ✅ | Nama fakultas |
| `studyProgram` | `string` | ✅ | Program studi / jurusan |
| `graduationDate` | `string` | ✅ | Tanggal wisuda (format: `YYYY-MM-DD`) |
| `notes` | `string` | ❌ | Catatan tambahan dari klien (opsional) |

### 3.2 Sub-node: `payment`

Berisi informasi pembayaran DP yang dikonfirmasi secara manual oleh admin.

| Field | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `dpAmount` | `number` | ✅ | Nominal DP yang dibayarkan (dalam Rupiah) |
| `dpPaidAt` | `number` | ✅ | Timestamp konfirmasi DP oleh admin (Unix ms) |
| `dpVerifiedBy` | `string` | ✅ | Nama atau ID admin yang memverifikasi |
| `paymentMethod` | `string` | ✅ | Metode pembayaran: `"transfer"`, `"cash"`, `"qris_manual"` |
| `transferProofUrl` | `string` | ❌ | URL bukti transfer (jika ada; bisa Firebase Storage URL) |
| `remainingBalance` | `number` | ✅ | Sisa pembayaran yang belum dilunasi (dalam Rupiah) |

### 3.3 Sub-node: `qr`

Berisi data QR code yang di-generate admin setelah DP terverifikasi.

| Field | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `qrCode` | `string` | ✅ | String unik yang di-encode ke dalam QR (biasanya = `bookingId`) |
| `qrGeneratedAt` | `number` | ✅ | Timestamp pembuatan QR (Unix ms) |
| `qrGeneratedBy` | `string` | ✅ | Nama atau ID admin yang generate QR |
| `qrScannedAt` | `number` | ❌ | Timestamp saat QR berhasil di-scan hari H (Unix ms) |
| `qrScannedBy` | `string` | ❌ | Petugas yang melakukan scan QR |

### 3.4 Sub-node: `studio`

Berisi data studio yang dipilih klien pada hari H setelah scan QR.

| Field | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `studioId` | `string` | ❌ | ID studio yang dipilih: `"studio_a"`, `"studio_b"`, dll. |
| `studioName` | `string` | ❌ | Nama display studio: `"Studio A"`, `"Studio B"`, dll. |
| `studioAssignedAt` | `number` | ❌ | Timestamp saat studio dipilih (Unix ms) |
| `studioAssignedBy` | `string` | ❌ | Petugas yang mengassign studio |

### 3.5 Sub-node: `queue`

Berisi data posisi antrian klien dalam sistem antrian HS Studio.

| Field | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `queueNumber` | `number` | ❌ | Nomor antrian klien di studio tersebut |
| `queueEnteredAt` | `number` | ❌ | Timestamp saat klien masuk antrian (Unix ms) |
| `photoStartedAt` | `number` | ❌ | Timestamp saat sesi foto dimulai (Unix ms) |
| `photoCompletedAt` | `number` | ❌ | Timestamp saat sesi foto selesai (Unix ms) |

### 3.6 Field Root-level Booking

| Field | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `status` | `string` | ✅ | Status booking saat ini (lihat daftar status di bawah) |
| `createdAt` | `number` | ✅ | Timestamp booking dibuat (Unix ms) |
| `updatedAt` | `number` | ✅ | Timestamp terakhir data diupdate (Unix ms) |

---

## 4. Penjelasan Setiap Field

### Enum: `status`

Status booking mengikuti alur bisnis secara linear. Hanya nilai berikut yang valid:

| Nilai | Deskripsi | Diset oleh |
|---|---|---|
| `"pending"` | Booking baru masuk, belum ada verifikasi DP | `booking.html` (CREATE) |
| `"dp_verified"` | DP sudah dikonfirmasi admin | `admin.html` (UPDATE) |
| `"qr_generated"` | QR code sudah di-generate admin | `admin.html` (UPDATE) |
| `"checked_in"` | QR sudah di-scan hari H | `admin.html` (UPDATE) |
| `"in_queue"` | Klien sudah memilih studio & masuk antrian | `admin.html` (UPDATE) |
| `"in_progress"` | Sesi foto sedang berlangsung | `admin.html` (UPDATE) |
| `"completed"` | Sesi foto selesai | `admin.html` (UPDATE) |
| `"cancelled"` | Booking dibatalkan | `admin.html` (UPDATE) |

### Tipe Data Ringkasan

| Tipe | Contoh Nilai | Keterangan |
|---|---|---|
| `string` | `"John Doe"` | Teks UTF-8 |
| `number` | `1718000000000` | Unix timestamp dalam milidetik (Date.now()) |
| `boolean` | `true` / `false` | Hanya untuk flag biner |

### Konvensi Timestamp

Semua timestamp menggunakan **Unix milliseconds** (`Date.now()` di JavaScript). Alasannya:
- Kompatibel langsung dengan `new Date(timestamp)` di JavaScript
- Firebase Realtime Database menyimpannya sebagai `number` secara native
- Mudah diurutkan (`.orderByChild("createdAt")`)

### Konvensi `bookingId`

`bookingId` adalah **Firebase Push ID** yang di-generate otomatis oleh `firebase.database().ref('bookings').push()`. Format contoh: `-O_xK2mLpQrAbCdEfGhI`.

Keunggulan Firebase Push ID:
- Berurutan berdasarkan waktu (sortable by time)
- Unik secara global
- Tidak perlu server untuk generate

---

## 5. Contoh Object JSON Lengkap

Berikut contoh object booking yang sudah melewati seluruh alur bisnis (status: `completed`):

```json
{
  "bookings": {
    "-O_xK2mLpQrAbCdEfGhI": {
      "identity": {
        "fullName": "Budi Santoso",
        "phoneNumber": "08123456789",
        "universityName": "Universitas Airlangga",
        "facultyName": "Fakultas Ilmu Komputer",
        "studyProgram": "Sistem Informasi",
        "graduationDate": "2025-07-15",
        "notes": "Mohon konfirmasi H-1 hari wisuda"
      },
      "payment": {
        "dpAmount": 150000,
        "dpPaidAt": 1718100000000,
        "dpVerifiedBy": "admin_rudi",
        "paymentMethod": "transfer",
        "transferProofUrl": "https://storage.googleapis.com/hs-studio/proofs/bukti_budi.jpg",
        "remainingBalance": 200000
      },
      "qr": {
        "qrCode": "-O_xK2mLpQrAbCdEfGhI",
        "qrGeneratedAt": 1718110000000,
        "qrGeneratedBy": "admin_rudi",
        "qrScannedAt": 1718500000000,
        "qrScannedBy": "petugas_hari_h"
      },
      "studio": {
        "studioId": "studio_a",
        "studioName": "Studio A",
        "studioAssignedAt": 1718500500000,
        "studioAssignedBy": "petugas_hari_h"
      },
      "queue": {
        "queueNumber": 3,
        "queueEnteredAt": 1718500500000,
        "photoStartedAt": 1718502000000,
        "photoCompletedAt": 1718503800000
      },
      "status": "completed",
      "createdAt": 1718000000000,
      "updatedAt": 1718503800000
    }
  }
}
```

---

## 6. Akses per Halaman

Setiap halaman HTML hanya memiliki izin operasi yang sesuai dengan fungsinya.

| Halaman | Operasi | Node yang Diakses | Keterangan |
|---|---|---|---|
| `booking.html` | CREATE | `bookings/{newId}` | Membuat booking baru dengan status `"pending"` |
| `admin.html` | READ, UPDATE | `bookings/*` | Verifikasi DP, generate QR, update status, assign studio |
| `database.html` | READ, SEARCH | `bookings/*` | Tampilkan semua booking, filter & cari data |
| `hasilpembayaran.html` | READ | `bookings/{id}/payment` | Lihat detail pembayaran per booking |

### Detail Operasi per Halaman

#### `booking.html` — CREATE only

```javascript
// Hanya melakukan push() untuk membuat booking baru
const newBookingRef = firebase.database().ref('bookings').push();
await newBookingRef.set({
  identity: { ... },
  payment: { dpAmount: 0, remainingBalance: 350000, ... },  // diisi default
  status: "pending",
  createdAt: Date.now(),
  updatedAt: Date.now()
});
```

#### `admin.html` — READ + UPDATE

```javascript
// READ semua booking
firebase.database().ref('bookings').on('value', snapshot => { ... });

// UPDATE status & data
firebase.database().ref(`bookings/${bookingId}`).update({
  status: "dp_verified",
  "payment/dpVerifiedBy": "admin_rudi",
  "payment/dpPaidAt": Date.now(),
  updatedAt: Date.now()
});
```

#### `database.html` — READ + SEARCH

```javascript
// READ dengan filter by status
firebase.database().ref('bookings')
  .orderByChild('status')
  .equalTo('pending')
  .once('value', snapshot => { ... });

// READ dengan filter by tanggal wisuda
firebase.database().ref('bookings')
  .orderByChild('identity/graduationDate')
  .equalTo('2025-07-15')
  .once('value', snapshot => { ... });
```

#### `hasilpembayaran.html` — READ only

```javascript
// READ satu booking berdasarkan bookingId
firebase.database().ref(`bookings/${bookingId}/payment`)
  .once('value', snapshot => { ... });
```

---

## 7. Alur Status Booking

```
[booking.html]        [admin.html]                          [hari H]
     |                     |                                    |
  CREATE              UPDATE status                        UPDATE status
     |                     |                                    |
     ▼                     ▼                                    ▼

 pending  →  dp_verified  →  qr_generated  →  checked_in  →  in_queue  →  in_progress  →  completed
                                                                                               |
                                                                               (kapan saja) cancelled
```

Setiap transisi status harus selalu disertai update `updatedAt`:

```javascript
{
  status: "dp_verified",
  updatedAt: Date.now()
}
```

---

## 8. Mengapa Struktur Ini Dipilih

### Flat One-Object-Per-Booking

Firebase Realtime Database **bukan relational database**. Menyimpan satu booking sebagai satu object adalah pendekatan yang tepat karena:

- **Tidak ada join** — semua data yang dibutuhkan ada dalam satu object
- **Atomic read** — membaca `/bookings/{id}` mengambil semua data sekaligus
- **Cocok untuk use case HSGMS** — tidak ada relasi kompleks antar booking

### Sub-node Logis (identity, payment, qr, studio, queue)

Data dikelompokkan ke dalam sub-node yang mencerminkan tahapan alur bisnis:

- `identity` — data statis, hanya diisi sekali saat booking
- `payment` — diisi admin saat verifikasi DP
- `qr` — diisi admin saat generate & saat scan hari H
- `studio` — diisi petugas hari H saat klien pilih studio
- `queue` — diisi sistem antrian hari H

Pengelompokan ini memudahkan partial read jika di masa depan dibutuhkan, misalnya `hasilpembayaran.html` hanya membaca sub-node `payment`.

### Tidak Menggunakan Slot / Booking Jam

Sistem ini sengaja **tidak** menggunakan slot waktu karena:
- Kapasitas hari H ditentukan oleh kapasitas studio, bukan by jam
- Antrian dikelola secara real-time di lokasi (queue number)
- Simplifikasi sistem booking untuk klien

### Timestamp sebagai Number

Menggunakan Unix milliseconds (`number`) bukan string tanggal untuk:
- Mendukung `.orderByChild("createdAt")` di Firebase query
- Konversi langsung ke JavaScript `Date` object
- Komputasi durasi antar event (misal: durasi sesi foto)

---

## 9. Firebase Best Practices

### 9.1 Hindari Nesting Terlalu Dalam

Firebase merekomendasikan struktur data yang **tidak lebih dari 3–4 level**. Struktur HSGMS mengikuti aturan ini:

```
bookings → {bookingId} → identity → fullName    ✅ (3 level)
bookings → {bookingId} → status                 ✅ (2 level)
```

### 9.2 Gunakan `.update()` bukan `.set()` untuk Update Parsial

```javascript
// ✅ BENAR — update parsial, tidak menimpa node lain
firebase.database().ref(`bookings/${bookingId}`).update({
  status: "dp_verified",
  "payment/dpVerifiedBy": "admin_001",
  updatedAt: Date.now()
});

// ❌ SALAH — menimpa seluruh object booking
firebase.database().ref(`bookings/${bookingId}`).set({ status: "dp_verified" });
```

### 9.3 Gunakan `.once('value')` untuk Data yang Tidak Perlu Real-time

```javascript
// Untuk hasilpembayaran.html yang hanya perlu baca sekali
firebase.database().ref(`bookings/${bookingId}`).once('value', snap => { ... });

// Untuk admin.html yang perlu listen perubahan real-time
firebase.database().ref('bookings').on('value', snap => { ... });
```

### 9.4 Selalu Update `updatedAt`

Setiap kali ada perubahan data, **wajib** update field `updatedAt` bersamaan:

```javascript
firebase.database().ref(`bookings/${bookingId}`).update({
  // ... field yang diubah
  updatedAt: Date.now()
});
```

### 9.5 Gunakan Transactions untuk Nomor Antrian

Nomor antrian (`queue/queueNumber`) rentan race condition jika banyak klien check-in bersamaan. Gunakan Firebase Transaction:

```javascript
const queueRef = firebase.database().ref(`bookings/${bookingId}/queue/queueNumber`);
queueRef.transaction(currentValue => {
  return (currentValue || 0) + 1;
});
```

### 9.6 Index untuk Query Performa

Tambahkan index di Firebase Rules untuk field yang sering di-query:

```json
{
  "rules": {
    "bookings": {
      ".indexOn": ["status", "identity/graduationDate", "createdAt"]
    }
  }
}
```

### 9.7 Validasi Data di Client Side

Sebelum `push()` atau `update()`, selalu validasi di sisi client:

```javascript
function validateBooking(data) {
  const required = ['fullName', 'phoneNumber', 'universityName', 'graduationDate'];
  return required.every(field => data.identity[field] && data.identity[field].trim() !== '');
}
```

---

## 10. Firebase Security Rules

Berikut Security Rules yang direkomendasikan sesuai akses per halaman:

```json
{
  "rules": {
    "bookings": {
      ".indexOn": ["status", "identity/graduationDate", "createdAt"],

      "$bookingId": {
        ".read": true,
        ".write": true,

        ".validate": "newData.hasChildren(['identity', 'status', 'createdAt', 'updatedAt'])",

        "identity": {
          ".validate": "newData.hasChildren(['fullName', 'phoneNumber', 'universityName', 'facultyName', 'studyProgram', 'graduationDate'])"
        },

        "status": {
          ".validate": "newData.val() === 'pending' || newData.val() === 'dp_verified' || newData.val() === 'qr_generated' || newData.val() === 'checked_in' || newData.val() === 'in_queue' || newData.val() === 'in_progress' || newData.val() === 'completed' || newData.val() === 'cancelled'"
        }
      }
    }
  }
}
```

> **Catatan:** Rules di atas bersifat permissive untuk kemudahan development internal. Jika sistem membesar, tambahkan autentikasi Firebase Auth untuk membedakan akses admin dan klien.

---

## 11. Future Scalability

### 11.1 Multiple Studios Support

Struktur `studio/studioId` sudah siap untuk multi-studio. Cukup tambahkan node `studios` jika perlu master data:

```json
{
  "studios": {
    "studio_a": { "name": "Studio A", "capacity": 1, "isActive": true },
    "studio_b": { "name": "Studio B", "capacity": 1, "isActive": true },
    "studio_vip": { "name": "Studio VIP", "capacity": 1, "isActive": false }
  }
}
```

### 11.2 Multiple Graduation Events (Multi-Angkatan)

Jika di masa depan perlu mengelola beberapa event wisuda secara bersamaan, struktur dapat diperluas:

```
bookings/
└── {year}_{universityCode}/     ← partisi per event
    └── {bookingId}/
        └── { ... }
```

Atau menggunakan field `identity/graduationDate` sebagai filter query tanpa perlu mengubah struktur.

### 11.3 Admin Authentication

Tambahkan Firebase Authentication untuk membedakan role:

```json
{
  "rules": {
    "bookings": {
      "$bookingId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.token.role === 'admin'"
      }
    }
  }
}
```

### 11.4 Audit Trail (Opsional)

Jika dibutuhkan riwayat perubahan status, tambahkan sub-node `history`:

```json
{
  "history": {
    "0": {
      "fromStatus": "pending",
      "toStatus": "dp_verified",
      "changedBy": "admin_rudi",
      "changedAt": 1718100000000
    },
    "1": {
      "fromStatus": "dp_verified",
      "toStatus": "qr_generated",
      "changedBy": "admin_rudi",
      "changedAt": 1718110000000
    }
  }
}
```

### 11.5 Firebase Cloud Functions (Opsional)

Untuk logika bisnis yang lebih kompleks di masa depan (notifikasi WhatsApp otomatis, generate PDF struk, dll.), siapkan Firebase Cloud Functions sebagai backend layer tanpa mengubah struktur database.

### 11.6 Migrasi ke Firestore

Jika data booking melebihi **100.000 records per tahun** atau query menjadi semakin kompleks (multi-field filter), pertimbangkan migrasi ke **Cloud Firestore**. Struktur field yang sudah didesain dengan baik akan memudahkan proses migrasi karena model data Firestore sangat mirip dengan Realtime Database.

---

## 12. Changelog

| Versi | Tanggal | Perubahan |
|---|---|---|
| `1.0.0` | 2025-06-29 | Initial schema — struktur dasar HSGMS |

---

*Dokumen ini dibuat untuk keperluan internal HS Studio. Dilarang disebarluaskan tanpa izin.*

*Generated by: Senior Software Architect — HSGMS Project*
*Last updated: 2025-06-29*
