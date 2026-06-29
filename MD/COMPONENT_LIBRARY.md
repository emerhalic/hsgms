# COMPONENT_LIBRARY.md

## HS Studio Graduation Management System (HSGMS)
### Dokumentasi Komponen — Component Specification & Reusability Guide

> **Scope:** Dokumen ini mendefinisikan seluruh komponen UI yang digunakan di seluruh halaman HSGMS — `booking.html`, `admin.html`, `database.html`, `hasilpembayaran.html` — agar dibangun dari **satu sumber komponen yang sama**.
> Dokumen ini **bukan** kode. Tidak ada HTML, CSS, atau JavaScript di sini — hanya spesifikasi: kapan komponen dipakai, props/parameter apa yang dimiliki, state apa yang mungkin terjadi, dan bagaimana komponen disusun.
>
> **Dokumen rujukan terkait:**
> - `PROJECT_RULE.md` — aturan proyek, halaman, status, dan batasan scope
> - `DATABASE_SCHEMA.md` — struktur data Firebase, field, dan enum status
> - `SOP_FLOW.md` — alur operasional bisnis dan trigger perubahan status
> - `UI_GUIDELINE.md` — design token (warna, tipografi, spacing, radius, shadow, animasi)
>
> **Audience:** Frontend developer, UI designer, dan contributor HSGMS.
>
> **Versi:** 1.0.0 — 2026-06-29
> **Status:** Sprint 1

---

## Table of Contents

1. [Layout Components](#1-layout-components)
2. [Form Components](#2-form-components)
3. [Data Components](#3-data-components)
4. [Action Components](#4-action-components)
5. [Feedback Components](#5-feedback-components)
6. [Queue Components](#6-queue-components)
7. [Booking Components](#7-booking-components)
8. [Dashboard Components](#8-dashboard-components)
9. [Component Naming Convention](#9-component-naming-convention)
10. [Reusable Rule](#10-reusable-rule)
11. [Accessibility Guideline](#11-accessibility-guideline)
12. [Component Hierarchy](#12-component-hierarchy)
13. [Component Tree](#13-component-tree)
14. [Future Components](#14-future-components)

---

## Cara Membaca Dokumen Ini

HSGMS tidak dibangun dengan framework komponen (React/Vue) — seluruh halaman adalah HTML statis dengan JavaScript. Maka istilah **"Props"** dan **"State"** di dokumen ini dipakai secara konseptual, bukan literal:

```
PROPS  →  Parameter yang menentukan ISI & TAMPILAN komponen saat di-render.
          Dalam implementasi nyata, ini bisa berupa:
          - argumen fungsi render (mis. renderBookingCard(data))
          - data-attribute di HTML (mis. data-status="dp_verified")

STATE  →  Kondisi yang bisa BERUBAH selama komponen hidup di halaman,
          biasanya akibat interaksi user atau perubahan data Firebase.
          Dalam implementasi nyata, ini bisa berupa:
          - CSS class yang di-toggle (mis. .is-loading, .is-error)
          - atribut (mis. disabled, aria-expanded)
```

Setiap komponen didokumentasikan dengan format yang konsisten:

```
Nama Komponen
├── Deskripsi singkat
├── Kapan Digunakan
├── Anatomi (diagram ASCII)
├── Props
├── State
├── Varian (jika ada)
└── Aturan Pemakaian
```

Semua nilai warna, spacing, radius, shadow, dan tipografi yang disebut di sini **merujuk langsung ke token di `UI_GUIDELINE.md`** — dokumen ini tidak mendefinisikan token baru.

---

## 1. Layout Components

Komponen layout membungkus seluruh halaman dan **wajib identik secara struktur** di keempat halaman HSGMS, agar terasa sebagai satu software (lihat `UI_GUIDELINE.md` §20.6 — Prinsip "Satu Software").

### 1.1 Navbar

**Deskripsi**
Bar horizontal di paling atas setiap halaman. Berisi identitas brand HS Studio dan akses ke notifikasi/menu user. Komponen ini adalah satu-satunya elemen yang **selalu identik secara visual di keempat halaman** — tidak boleh ada variasi warna atau layout per halaman.

**Kapan Digunakan**
- Selalu hadir di bagian paling atas setiap halaman (`booking.html`, `admin.html`, `database.html`, `hasilpembayaran.html`), tanpa kecuali.

**Anatomi**

```
┌──────────────────────────────────────────────────────────────────┐
│  🎓  HS STUDIO                              🔔³   Admin Rudi ▾  │
│      Graduation Management System                                │
└──────────────────────────────────────────────────────────────────┘
   ↑ brand lockup (icon + 2 baris teks)        ↑ notif bell    ↑ user menu
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `pageContext` | `"client"` \| `"admin"` | `"admin"` | ✅ | Menentukan apakah navbar tampil mode client (booking.html, tanpa user menu) atau mode admin (3 halaman lain, dengan user menu) |
| `userName` | `string` | `null` | ❌ | Nama admin yang sedang login; ditampilkan di kanan. Kosong jika `pageContext="client"` |
| `notificationCount` | `number` | `0` | ❌ | Jumlah notifikasi belum dibaca, ditampilkan sebagai badge angka di icon `Bell` |
| `onNotificationClick` | `function` | — | ❌ | Callback saat icon notifikasi diklik |
| `onUserMenuClick` | `function` | — | ❌ | Callback saat user menu diklik (dropdown: profil, logout) |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Kondisi normal | Background putih/glass, brand terlihat jelas |
| `scrolled` | User scroll ke bawah > 8px | Shadow `--sh-sm` muncul untuk memberi kedalaman terhadap konten |
| `notification-active` | `notificationCount > 0` | Badge merah kecil di pojok icon `Bell` menampilkan angka |
| `user-menu-open` | User klik avatar/nama | Dropdown muncul (fadeIn 150ms ease-out, lihat `UI_GUIDELINE.md` §15.3) |

**Aturan Pemakaian**
- Tinggi navbar konsisten di semua halaman (rekomendasi: 64px)
- Brand lockup ("HS STUDIO" + subtitle) tidak boleh diubah posisinya antar halaman
- Sticky di bagian atas viewport saat scroll
- Tidak menggunakan glassmorphism berat di sini — cukup background solid putih dengan shadow tipis, karena navbar adalah elemen fungsional yang harus selalu terbaca jelas

---

### 1.2 Sidebar

**Deskripsi**
Navigasi vertikal khusus untuk halaman operasional internal (`admin.html`, `database.html`, `hasilpembayaran.html`). Tidak digunakan di `booking.html` karena client tidak butuh navigasi multi-halaman.

**Kapan Digunakan**
- Tampil di `admin.html`, `database.html`, `hasilpembayaran.html`
- **Tidak** digunakan di `booking.html` (client hanya melihat satu halaman form, sesuai `PROJECT_RULE.md`)

**Anatomi**

```
Desktop (≥1024px)              Tablet (768–1023px)         Mobile (<768px)
┌────────────────┐             ┌──┐                        ┌──────────────┐
│  ☰  Menu        │             │☰ │ ← collapsed,          │░░░░ overlay ░░│
├────────────────┤             │  │   expand on tap        │┌────────────┐│
│ ▤ Booking       │ ← active   │▤ │                        ││ ▤ Booking  ││
│ 🗄 Database      │             │🗄│                        ││ 🗄 Database ││
│ 💰 Pembayaran    │             │💰│                        ││ 💰 Pembayar.││
│ 📋 Antrian       │             │📋│                        ││ 📋 Antrian ││
├────────────────┤             └──┘                        │└────────────┘│
│ ⚙ Pengaturan    │                                         └──────────────┘
└────────────────┘                                          (drawer dari kiri)
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `navItems` | `array<{icon, label, href, isActive}>` | — | ✅ | Daftar menu navigasi |
| `activeRoute` | `string` | — | ✅ | Halaman yang sedang dibuka, untuk highlight item aktif |
| `isCollapsed` | `boolean` | `false` | ❌ | Mode ringkas (hanya icon, tanpa label) untuk layar sempit |
| `isMobileOpen` | `boolean` | `false` | ❌ | Mengontrol drawer overlay tampil/tidak di mobile |
| `onNavigate` | `function` | — | ❌ | Callback saat item menu diklik |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Desktop ≥1024px | Lebar fixed 260px, selalu terlihat |
| `collapsed` | Tablet 768–1023px | Menyusut jadi icon-only, expand saat tap/hover |
| `drawer-open` | Mobile, user tap hamburger | Overlay slide-in dari kiri, backdrop gelap di belakangnya |
| `drawer-closed` | Mobile, default / setelah navigasi | Sidebar tersembunyi total |
| `item-active` | `navItems[i].isActive === true` | Background `--p-50`, teks & icon `--p-600`, border kiri 3px `--p-600` |
| `item-hover` | Hover pada item non-aktif | Background `--n-100` |

**Aturan Pemakaian**
- Item aktif ditentukan oleh halaman yang sedang dibuka, bukan diatur manual oleh user
- Icon selalu dari Lucide Icons ukuran 20px (sesuai `UI_GUIDELINE.md` §4.2)
- Urutan menu konsisten di semua halaman tempat sidebar muncul

---

### 1.3 Footer

**Deskripsi**
Baris penutup halaman berisi copyright dan versi sistem. Bersifat ringan dan tidak mengganggu fokus kerja admin.

**Kapan Digunakan**
- Opsional, tampil di bagian paling bawah setiap halaman setelah seluruh konten
- Paling relevan di `booking.html` (memberi kesan profesional ke client) dan `database.html`/`hasilpembayaran.html` (penanda akhir halaman panjang)

**Anatomi**

```
┌──────────────────────────────────────────────────────────┐
│  © 2026 HS Studio  •  HSGMS v1.0                          │
└──────────────────────────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `year` | `number` | tahun saat ini | ❌ | Tahun copyright, auto-update |
| `versionLabel` | `string` | `"HSGMS v1.0"` | ❌ | Label versi sistem, merujuk `PROJECT_RULE.md` |
| `showLinks` | `boolean` | `false` | ❌ | Jika `true`, tampilkan link tambahan (mis. kontak/bantuan) |

**State**

Footer tidak memiliki state interaktif — komponen statis, tidak berubah tampilan kecuali via props.

**Aturan Pemakaian**
- Teks selalu `--text-xs`, warna `--n-400`
- Tidak menggunakan glassmorphism atau shadow
- Tidak boleh sticky/fixed — footer mengikuti scroll halaman normal

---

### 1.4 Content Wrapper

**Deskripsi**
Container utama yang membungkus konten di bawah Navbar (dan di samping Sidebar jika ada). Mengatur max-width, padding responsif, dan background halaman secara konsisten.

**Kapan Digunakan**
- Selalu membungkus area konten utama di keempat halaman — tidak pernah konten diletakkan langsung di `<body>` tanpa Content Wrapper

**Anatomi**

```
┌─ Navbar ───────────────────────────────────────────────────┐
├──────────────────────────────────────────────────────────────┤
│ ┆← margin 32px (desktop)                      margin 32px →┆│
│ ┆                                                            ┆│
│ ┆            (konten halaman di sini)                       ┆│
│ ┆                                                            ┆│
│ ┆                                                            ┆│
└──────────────────────────────────────────────────────────────┘
  background: --n-50 (#F8FAFC) di seluruh area wrapper
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `maxWidth` | `string` | `"1280px"` | ❌ | Lebar maksimum konten; `"720px"` untuk form sentris seperti `booking.html` |
| `hasSidebar` | `boolean` | `false` | ❌ | Jika `true`, sediakan offset kiri 260px untuk Sidebar (desktop) |
| `paddingPreset` | `"page"` \| `"form"` | `"page"` | ❌ | `"page"` = padding standar §17.2; `"form"` = padding lebih besar untuk halaman form sentris |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` (desktop) | ≥1024px | Margin 32px, grid 12 kolom, gutter 24px (`UI_GUIDELINE.md` §16.2) |
| `tablet` | 768–1023px | Margin 24px, grid 8 kolom, gutter 20px |
| `mobile` | <768px | Margin 16px, grid 4 kolom, gutter 16px |

**Aturan Pemakaian**
- Background selalu `--n-50` — tidak pernah putih polos di level wrapper (putih hanya untuk Card di dalamnya)
- Tidak menambahkan padding ganda — komponen anak (Card, Table) mengatur padding internalnya sendiri

---

### 1.5 Section Header

**Deskripsi**
Header pembuka untuk setiap blok/section konten di dalam halaman (misalnya bagian atas tabel booking, bagian atas form). Memberi judul, deskripsi singkat, dan slot aksi di kanan.

**Kapan Digunakan**
- Di atas setiap blok konten utama yang butuh judul — daftar booking, halaman dashboard, area antrian, dsb.
- Tidak digunakan untuk sub-bagian kecil di dalam Card (gunakan judul Card biasa untuk itu)

**Anatomi**

```
┌────────────────────────────────────────────────────────────┐
│  Manajemen Booking Wisuda                [+ Booking Baru]  │ ← judul 28px/700 + CTA
│  Kelola semua booking foto wisuda HS Studio                │ ← deskripsi 15px/400
└────────────────────────────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `title` | `string` | — | ✅ | Judul section, `--text-2xl` (28px/700) |
| `description` | `string` | `null` | ❌ | Subtitle/deskripsi singkat, `--text-base` (15px/400), warna `--n-600` |
| `icon` | `IconName` | `null` | ❌ | Icon opsional 24px di samping judul |
| `actionSlot` | `node` | `null` | ❌ | Komponen aksi di kanan (biasanya `ButtonPrimary`) |
| `breadcrumb` | `array<string>` | `null` | ❌ | Jejak navigasi opsional di atas judul |

**State**

Section Header bersifat statis (tidak punya state interaktif sendiri); state hanya muncul dari komponen di dalam `actionSlot` (mis. tombol loading).

**Aturan Pemakaian**
- Hanya **satu** Section Header per blok konten — jangan bertumpuk
- `actionSlot` maksimal berisi satu Primary Button (sesuai hierarki tombol §5.1) ditambah opsional satu Secondary/Ghost
- Jarak antara Section Header dan konten pertama di bawahnya: `--space-6` (24px), sesuai `UI_GUIDELINE.md` §17.2

---

## 2. Form Components

Komponen form dipakai utamanya di `booking.html` (form client) dan di modal/form admin (verifikasi DP, edit data). Seluruh state (`default`, `focus`, `error`, `disabled`, `filled`) mengikuti `UI_GUIDELINE.md` §6.1 secara ketat — tidak ada pengecualian per halaman.

### 2.1 Text Input

**Deskripsi**
Field teks satu baris untuk input bebas seperti nama lengkap, nama universitas, fakultas, program studi, dan field admin lainnya.

**Kapan Digunakan**
- Field `fullName`, `universityName`, `facultyName`, `studyProgram` di `booking.html` (lihat `DATABASE_SCHEMA.md` §3.1)
- Field nama admin saat verifikasi (`dpVerifiedBy`)

**Anatomi**

```
Nama Lengkap *                              ← label, --text-sm, weight 500
┌──────────────────────────────────────────┐
│  Budi Santoso                            │  ← height 44px
└──────────────────────────────────────────┘
Sesuai dengan nama di ijazah                ← helper text, --text-xs, --n-400
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `label` | `string` | — | ✅ | Label di atas field |
| `placeholder` | `string` | `""` | ❌ | Teks placeholder |
| `value` | `string` | `""` | ✅ | Nilai input saat ini |
| `iconPrefix` | `IconName` | `null` | ❌ | Icon 20px di kiri input (mis. `UserRound` untuk nama) |
| `helperText` | `string` | `null` | ❌ | Teks bantuan di bawah field |
| `errorText` | `string` | `null` | ❌ | Pesan error spesifik, menggantikan `helperText` saat ada |
| `isRequired` | `boolean` | `false` | ❌ | Menampilkan tanda `*` merah di label |
| `isDisabled` | `boolean` | `false` | ❌ | Menonaktifkan input |
| `maxLength` | `number` | `null` | ❌ | Batas jumlah karakter |
| `onChange` | `function` | — | ✅ | Callback saat nilai berubah |
| `onBlur` | `function` | — | ❌ | Callback saat field kehilangan fokus (trigger validasi) |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Awal / kosong | Border `--n-200`, bg `--n-100` |
| `focus` | User klik/tab ke field | Border `--p-400`, bg putih, `--sh-focus` (ring biru tipis) |
| `filled` | `value` tidak kosong, tidak fokus | Border `--n-300`, bg putih |
| `error` | Validasi gagal setelah `onBlur` | Border `--d-500`, bg tint `--d-100` tipis, `errorText` tampil |
| `disabled` | `isDisabled === true` | Bg `--n-100`, teks `--n-400`, cursor not-allowed |

**Aturan Pemakaian**
- Error muncul **setelah blur**, bukan saat mengetik (sesuai `UI_GUIDELINE.md` §6.3)
- Satu pesan error per field, spesifik (mis. "Nama lengkap wajib diisi", bukan "Error")
- Height selalu 44px di semua halaman

---

### 2.2 Select

**Deskripsi**
Dropdown pilihan dari daftar tertutup. Digunakan untuk field dengan opsi terbatas seperti metode pembayaran atau filter status.

**Kapan Digunakan**
- `paymentMethod` saat admin mencatat verifikasi DP (`"transfer"`, `"cash"`, `"qris_manual"` — `DATABASE_SCHEMA.md` §3.2)
- Filter status booking di `database.html` (`PENDING`, `DP_VERIFIED`, dst.)
- Pemilihan studio saat check-in hari H (`studioId` — meski lihat juga **Studio Card** §6.2 untuk varian visual kartu)

**Anatomi**

```
Metode Pembayaran *
┌──────────────────────────────────────────────────┬───────┐
│  Transfer Bank                                   │   ▾   │
└──────────────────────────────────────────────────┴───────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `label` | `string` | — | ✅ | Label di atas select |
| `options` | `array<{value, label}>` | — | ✅ | Daftar opsi |
| `value` | `string` | `null` | ✅ | Opsi terpilih saat ini |
| `placeholder` | `string` | `"Pilih salah satu"` | ❌ | Teks saat belum ada pilihan |
| `isMultiple` | `boolean` | `false` | ❌ | Mengizinkan lebih dari satu pilihan (mis. filter status ganda) |
| `isDisabled` | `boolean` | `false` | ❌ | Menonaktifkan select |
| `errorText` | `string` | `null` | ❌ | Pesan error |
| `onChange` | `function` | — | ✅ | Callback saat opsi berubah |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Belum dipilih | Placeholder abu-abu, border `--n-200` |
| `open` | User klik field | Dropdown muncul (`scaleY(0→1)` + fadeIn, 150ms ease-out) |
| `selected` | Opsi sudah dipilih | Teks opsi tampil normal (`--n-950`) |
| `error` | Validasi gagal | Border `--d-500` |
| `disabled` | `isDisabled === true` | Bg `--n-100`, cursor not-allowed |

**Aturan Pemakaian**
- Dropdown tidak pernah terpotong oleh batas card/modal — gunakan auto-flip ke atas jika ruang bawah tidak cukup
- Opsi status filter selalu memakai warna badge yang sama dengan **Badge** (§3.3) untuk konsistensi visual

---

### 2.3 Textarea

**Deskripsi**
Field teks multi-baris untuk input panjang seperti catatan tambahan client.

**Kapan Digunakan**
- Field `notes` (catatan tambahan, opsional) di `booking.html` (`DATABASE_SCHEMA.md` §3.1)
- Field alasan pembatalan saat admin mengubah status ke `CANCELLED`

**Anatomi**

```
Catatan Tambahan (opsional)
┌──────────────────────────────────────────────────┐
│  Mohon konfirmasi H-1 hari wisuda                │
│                                                    │
│                                                    │
└──────────────────────────────────────────────────┘
  min-height: 96px, resize: vertical
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `label` | `string` | — | ✅ | Label field |
| `placeholder` | `string` | `""` | ❌ | Placeholder |
| `value` | `string` | `""` | ✅ | Nilai teks saat ini |
| `minHeight` | `string` | `"96px"` | ❌ | Tinggi minimum |
| `maxLength` | `number` | `null` | ❌ | Batas karakter, tampilkan counter jika diset |
| `isRequired` | `boolean` | `false` | ❌ | Tanda wajib |
| `onChange` | `function` | — | ✅ | Callback saat nilai berubah |

**State**

Mengikuti pola state yang sama dengan **Text Input** (§2.1): `default`, `focus`, `filled`, `error`, `disabled`.

**Aturan Pemakaian**
- Resize hanya vertikal — tidak horizontal (mengganggu layout grid)
- Jika `maxLength` diset, tampilkan counter karakter di pojok kanan bawah (`--text-xs`, `--n-400`)

---

### 2.4 Upload Area

**Deskripsi**
Zona drag-and-drop atau klik untuk mengupload file. Komponen kritis di `booking.html` karena seluruh proses pembayaran HSGMS bersifat manual (tidak ada payment gateway, sesuai `PROJECT_RULE.md`) — bukti transfer **harus** diupload sebagai gambar/PDF.

**Kapan Digunakan**
- Upload bukti transfer DP di `booking.html` → field `transferProofUrl` (`DATABASE_SCHEMA.md` §3.2)

**Anatomi**

```
┌────────────────────────────────────────────────┐
│                                                  │
│         ↑   Klik atau seret file ke sini       │
│             JPG, PNG, PDF  •  Maks 5MB          │
│                                                  │
└────────────────────────────────────────────────┘
  border: dashed --n-200  |  hover: dashed --p-400

Setelah file terpilih:
┌────────────────────────────────────────────────┐
│  🖼  bukti_transfer.jpg          2.1 MB    [×] │
│  ████████████████████░░░░░░  72%               │ ← progress upload
└────────────────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `acceptedFormats` | `array<string>` | `["jpg","png","pdf"]` | ❌ | Format file yang diterima (lihat `SOP_FLOW.md` §7.1 — `ERR-B03`) |
| `maxSizeMB` | `number` | `5` | ❌ | Batas ukuran file (`ERR-B02`) |
| `uploadedFile` | `{name, sizeKB, url}` | `null` | ❌ | File yang sudah terupload, untuk render preview |
| `uploadProgress` | `number` (0–100) | `0` | ❌ | Persentase progres upload |
| `errorText` | `string` | `null` | ❌ | Pesan error (file terlalu besar / format salah) |
| `onFileSelect` | `function` | — | ✅ | Callback saat file dipilih |
| `onRemove` | `function` | — | ❌ | Callback saat file dihapus sebelum submit |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `idle` | Belum ada file | Border dashed `--n-200`, ikon upload abu-abu |
| `drag-active` | File ditarik di atas zona | Border dashed `--p-400`, bg `--p-50` |
| `uploading` | File sedang dikirim | Progress bar tampil, persentase berjalan |
| `uploaded` | Upload selesai | Preview nama file + ukuran + tombol hapus |
| `error` | Format/ukuran tidak valid | Border `--d-500`, `errorText` tampil (`ERR-B02`/`ERR-B03`) |

**Aturan Pemakaian**
- Selalu tampilkan format dan batas ukuran yang diterima di dalam zona (bukan hanya di error)
- Setelah upload sukses, file dapat dihapus dan diganti sebelum submit final
- Tidak menggunakan glassmorphism (form field tetap solid sesuai §1.2 UI_GUIDELINE)

---

### 2.5 Search Box

**Deskripsi**
Field pencarian dengan icon prefix, digunakan untuk mencari data booking berdasarkan nama atau nomor booking.

**Kapan Digunakan**
- Pencarian booking by nama client atau nomor booking di `database.html` (`DATABASE_SCHEMA.md` §6 — operasi SEARCH)
- Pencarian booking manual saat client kehilangan QR (`SOP_FLOW.md` §8.3)

**Anatomi**

```
┌──────────────────────────────────────────────────┐
│  🔍  Cari nama atau nomor booking...        [×] │
└──────────────────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `placeholder` | `string` | `"Cari..."` | ❌ | Teks placeholder |
| `value` | `string` | `""` | ✅ | Query pencarian saat ini |
| `isClearable` | `boolean` | `true` | ❌ | Menampilkan tombol `×` untuk mengosongkan field |
| `debounceMs` | `number` | `300` | ❌ | Jeda sebelum `onSearch` dipanggil setelah user berhenti mengetik |
| `isLoading` | `boolean` | `false` | ❌ | Menampilkan spinner kecil di kanan saat pencarian berjalan |
| `onSearch` | `function` | — | ✅ | Callback dengan query setelah debounce |
| `onClear` | `function` | — | ❌ | Callback saat tombol clear diklik |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Kosong | Placeholder abu-abu |
| `typing` | User mengetik | Tombol clear `×` muncul |
| `searching` | Debounce selesai, request berjalan | Spinner kecil 16px di kanan |
| `no-result` | Hasil kosong | Memicu **Empty State** varian "Pencarian tidak ditemukan" (§3.5) |

**Aturan Pemakaian**
- Icon `Search` selalu di kiri, ukuran 20px (`UI_GUIDELINE.md` §4.2)
- Tidak melakukan pencarian per keystroke — selalu melalui debounce agar tidak membebani Firebase read

---

### 2.6 Date Picker

**Deskripsi**
Field pemilihan tanggal khusus untuk tanggal wisuda. **Bukan** pemilih jam/slot — HSGMS sengaja tidak menggunakan booking jam (`PROJECT_RULE.md` — "❌ Jam booking", "❌ Slot booking").

**Kapan Digunakan**
- Field `graduationDate` di `booking.html` (`DATABASE_SCHEMA.md` §3.1)
- Filter tanggal wisuda di `database.html`
- Update tanggal saat exception flow client terlambat datang (`SOP_FLOW.md` §8.4)

**Anatomi**

```
Tanggal Wisuda *
┌──────────────────────────────────────────┬───────┐
│  15 Juli 2025                            │  📅   │
└──────────────────────────────────────────┴───────┘

Kalender saat terbuka:
┌─────────────────────────────┐
│  ‹     Juli 2025      ›    │
│  S  S  R  K  J  S  M        │
│           1  2  3  4         │
│  5  6  7  8  9  10 11        │
│  12 13 14 [15] 16 17 18      │ ← tanggal terpilih
└─────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `label` | `string` | — | ✅ | Label field |
| `value` | `string` (`YYYY-MM-DD`) | `null` | ✅ | Tanggal terpilih, format sesuai `DATABASE_SCHEMA.md` §3.1 |
| `minDate` | `string` | hari ini | ❌ | Tanggal minimum yang bisa dipilih — mencegah `ERR-B05` (tanggal di masa lalu) |
| `maxDate` | `string` | `null` | ❌ | Tanggal maksimum (jika diperlukan kebijakan booking jangka panjang) |
| `displayFormat` | `string` | `"D MMMM YYYY"` | ❌ | Format tampilan, mis. "15 Juli 2025" |
| `errorText` | `string` | `null` | ❌ | Pesan error validasi |
| `onChange` | `function` | — | ✅ | Callback saat tanggal dipilih |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Belum dipilih | Placeholder "Pilih tanggal" |
| `open` | User klik field | Kalender muncul, fadeIn 150ms |
| `selected` | Tanggal dipilih | Tanggal tampil format Indonesia (bukan `YYYY-MM-DD` mentah) |
| `disabled-date` | Tanggal < `minDate` | Tanggal tampil abu-abu, tidak dapat diklik |
| `error` | Validasi gagal (mis. tanggal lampau) | Border `--d-500`, `errorText` tampil |

**Aturan Pemakaian**
- Tidak pernah menampilkan picker jam/waktu — hanya tanggal (sesuai larangan slot/jam booking)
- Nilai disimpan sebagai string `YYYY-MM-DD` ke Firebase, namun ditampilkan dalam format Indonesia yang mudah dibaca

---

### 2.7 Phone Input

**Deskripsi**
Field khusus nomor WhatsApp aktif client — field krusial karena seluruh komunikasi HSGMS (kirim QR, konfirmasi DP, reminder) terjadi via WhatsApp, bukan email atau notifikasi sistem (`SOP_FLOW.md` §9.1).

**Kapan Digunakan**
- Field `phoneNumber` di `booking.html` (`DATABASE_SCHEMA.md` §3.1)

**Anatomi**

```
Nomor WhatsApp Aktif *
┌──────┬───────────────────────────────────────────┐
│ 🇮🇩 +62 │  812-3456-789                            │
└──────┴───────────────────────────────────────────┘
Pastikan nomor ini aktif di WhatsApp untuk menerima QR Code
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `label` | `string` | `"Nomor WhatsApp Aktif"` | ❌ | Label field |
| `value` | `string` | `""` | ✅ | Nomor telepon (tanpa kode negara) |
| `countryCode` | `string` | `"+62"` | ❌ | Kode negara, fixed untuk konteks HS Studio Indonesia |
| `helperText` | `string` | `"Pastikan nomor ini aktif di WhatsApp..."` | ❌ | Teks bantuan, penting secara bisnis |
| `errorText` | `string` | `null` | ❌ | Pesan error format nomor tidak valid |
| `onChange` | `function` | — | ✅ | Callback saat nilai berubah |

**State**

Mengikuti pola state **Text Input** (§2.1): `default`, `focus`, `filled`, `error`, `disabled`. Tambahan:

| State | Trigger | Perilaku Visual |
|---|---|---|
| `invalid-format` | Nomor tidak sesuai pola (huruf, terlalu pendek) | Border `--d-500`, error "Format nomor WhatsApp tidak valid" |

**Aturan Pemakaian**
- Helper text selalu mengingatkan bahwa nomor ini digunakan untuk menerima QR Code — jangan dihapus demi konsistensi ekspektasi client
- Icon/label `MessageCircle` dapat dipakai sebagai prefix opsional untuk memperkuat konteks WhatsApp (`UI_GUIDELINE.md` §4.4)

---

## 3. Data Components

Komponen data menampilkan informasi booking dalam berbagai bentuk — dari satu baris tabel hingga satu kartu penuh. Ini adalah komponen yang paling sering dipakai ulang di `admin.html` dan `database.html`.

### 3.1 Table

**Deskripsi**
Tabel data utama untuk menampilkan daftar booking. Pada layar sempit, tabel **berubah bentuk** menjadi daftar Card (lihat §16.4 `UI_GUIDELINE.md`) — bukan di-scroll horizontal.

**Kapan Digunakan**
- Daftar seluruh booking di `database.html` (`DATABASE_SCHEMA.md` §6 — operasi READ + SEARCH)
- Daftar booking `PENDING` yang perlu diverifikasi di `admin.html`

**Anatomi**

```
┌──────────────────────────────────────────────────────────────────┐
│  Menampilkan 24 dari 247 booking                                  │
├────────┬──────────────────┬──────────────┬────────────┬──────────┤
│   #    │  NAMA CLIENT     │  UNIVERSITAS │  TANGGAL   │  STATUS  │ ← header: bg --n-50, UPPERCASE
├────────┼──────────────────┼──────────────┼────────────┼──────────┤
│  001   │  Budi Santoso    │  Unair       │ 15 Jul 2025│ [BADGE]  │ ← row: 52px, hover bg --p-50
├────────┼──────────────────┼──────────────┼────────────┼──────────┤
│  002   │  Siti Rahayu     │  ITS         │ 15 Jul 2025│ [BADGE]  │
└────────┴──────────────────┴──────────────┴────────────┴──────────┘
                                                       👁  ✏  🗑  ← muncul saat row hover
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `columns` | `array<{key, label, align, hideOnTablet}>` | — | ✅ | Definisi kolom. `hideOnTablet` untuk kolom sekunder seperti fakultas/prodi (§8.4 UI_GUIDELINE) |
| `data` | `array<Booking>` | `[]` | ✅ | Baris data, mengikuti struktur `identity` + `status` di `DATABASE_SCHEMA.md` §3 |
| `rowDensity` | `"comfortable"` \| `"compact"` | `"comfortable"` | ❌ | 52px vs 40px tinggi baris |
| `isSortable` | `boolean` | `true` | ❌ | Mengizinkan sort by kolom yang ter-index (`status`, `graduationDate`, `createdAt`) |
| `totalCount` | `number` | `0` | ❌ | Total data untuk teks "Menampilkan X dari Y booking" |
| `isLoading` | `boolean` | `false` | ❌ | Menampilkan **Loading Skeleton** (§3.6) sebagai pengganti baris |
| `actionsColumn` | `array<{icon, label, onClick}>` | `[]` | ❌ | Icon aksi per baris (Lihat=`Eye`, Edit=`Pencil`, Hapus=`Trash2` — `UI_GUIDELINE.md` §4.4) |
| `onRowClick` | `function` | — | ❌ | Callback saat baris diklik (buka detail) |
| `onSort` | `function` | — | ❌ | Callback saat header kolom diklik untuk sort |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `loading` | `isLoading === true` | Baris diganti **Loading Skeleton** (shimmer) |
| `loaded` | Data tersedia | Baris normal tampil |
| `empty` | `data.length === 0` setelah loading | Tabel diganti total oleh **Empty State** (§3.5) — bukan baris "Tidak ada data" |
| `row-hover` | Hover satu baris | Bg `--p-50`, icon aksi muncul (opacity transition) |
| `responsive-card` | Viewport < 768px | Tabel otomatis berubah jadi daftar Card (lihat §16.4 UI_GUIDELINE) |

**Aturan Pemakaian**
- Teks angka/nominal selalu rata kanan; teks nama/string rata kiri
- Kolom aksi selalu di paling kanan, lebar fixed 100–120px
- Jumlah data total selalu ditampilkan di atas tabel
- Border hanya horizontal, warna `--n-100`

---

### 3.2 Card

**Deskripsi**
Container generik dengan header/body/footer yang menjadi dasar dari hampir semua komponen kartu lain di HSGMS (**Booking Card**, **Queue Card**, dsb. mewarisi anatomi ini — lihat §12 Component Hierarchy).

**Kapan Digunakan**
- Sebagai dasar pembungkus konten terkelompok di semua halaman
- Tampilan daftar booking di mobile (pengganti Table, §16.4)

**Anatomi**

```
┌─────────────────────────────────────────────────────┐  ← radius 16px, shadow md
│  ┌─── HEADER (opsional) ─────────────────────────┐  │
│  │  🎓  Budi Santoso            [DP VERIFIED]   │  │
│  └──────────────────────────────────────────────┘  │
│  ┌─── BODY ─────────────────────────────────────┐  │
│  │  (konten bebas — teks, list, form, dll.)      │  │
│  └──────────────────────────────────────────────┘  │
│  ┌─── FOOTER (opsional) ───────────────────────┐  │
│  │  [Lihat Detail]              [Konfirmasi]    │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `header` | `node` | `null` | ❌ | Slot header (judul + badge, dsb.) |
| `body` | `node` | — | ✅ | Slot konten utama |
| `footer` | `node` | `null` | ❌ | Slot aksi/tombol |
| `isGlass` | `boolean` | `false` | ❌ | Menggunakan efek glassmorphism (hanya untuk card statistik/highlight, lihat §1.2 UI_GUIDELINE) |
| `isSelected` | `boolean` | `false` | ❌ | Menampilkan border aktif |
| `maxWidth` | `string` | `"480px"` (standalone) / fluid dalam grid | ❌ | Lebar maksimum |
| `onClick` | `function` | `null` | ❌ | Jika diisi, seluruh card menjadi clickable |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Normal | Bg putih, radius 16px, shadow `--sh-md` |
| `hover` | Hover (jika `onClick` ada) | `translateY(-2px)` + shadow naik satu level (150ms ease-out) |
| `selected` | `isSelected === true` | Border `--p-400` 2px, bg `--p-50` |
| `empty` | Tidak ada data untuk ditampilkan | Diganti **Empty State** (§3.5) |

**Aturan Pemakaian**
- Padding internal 20–24px (`--space-5`/`--space-6`)
- Gap antar card: 16px (grid) atau 12px (list)
- Glassmorphism **hanya** dipakai selektif (Stats Card, Sidebar, Modal) — tidak pada card data transaksional biasa (`UI_GUIDELINE.md` §1.2)

---

### 3.3 Badge

**Deskripsi**
Label kecil berbentuk pill untuk menandai status atau kategori. Komponen paling sering dipakai ulang di seluruh sistem karena status booking selalu terlihat di mana pun data ditampilkan.

**Kapan Digunakan**
- Menampilkan `status` booking (`DATABASE_SCHEMA.md` §4 — enum status) di Table, Card, Modal, dan Dashboard
- Menandai kategori lain (mis. metode pembayaran)

**Anatomi**

```
●  PENDING       ●  DP VERIFIED     ●  QR GENERATED    ●  CHECKED IN
●  IN QUEUE       ●  IN PROGRESS    ●  COMPLETED        ●  CANCELLED
(pill, radius full, padding-x 10px, text 11–13px semibold)
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `status` | enum status booking | — | ✅* | Nilai status mentah dari Firebase: `pending`, `dp_verified`, `qr_generated`, `checked_in`, `in_queue`, `in_progress`, `completed`, `cancelled` |
| `variant` | `"success"` \| `"warning"` \| `"danger"` \| `"info"` \| `"neutral"` | derived dari `status` | ❌ | Dipakai jika Badge bukan untuk status booking (mis. kategori umum) — `status` dan `variant` saling eksklusif |
| `label` | `string` | derived dari `status` | ❌ | Override teks tampilan jika diperlukan |
| `size` | `"sm"` \| `"md"` | `"md"` | ❌ | Ukuran badge |
| `withDot` | `boolean` | `true` | ❌ | Menampilkan indikator bulat kecil di kiri teks |

**Pemetaan Warna Status** (sumber: `UI_GUIDELINE.md` §2.4 — tidak boleh diimprovisasi)

| `status` (value) | Label Tampilan | Background | Teks | Border |
|---|---|---|---|---|
| `pending` | PENDING | `#FEF3C7` | `#D97706` | `#FDE68A` |
| `dp_verified` | DP VERIFIED | `#EFF6FF` | `#2563EB` | `#BFDBFE` |
| `qr_generated` | QR GENERATED | `#F0FDF4` | `#16A34A` | `#BBF7D0` |
| `checked_in` | CHECKED IN | `#F5F3FF` | `#7C3AED` | `#DDD6FE` |
| `in_queue` | IN QUEUE | `#FFF7ED` | `#EA580C` | `#FED7AA` |
| `in_progress` | IN PROGRESS | `#EFF6FF` | `#0284C7` | `#BAE6FD` |
| `completed` | COMPLETED | `#F0FDF4` | `#15803D` | `#86EFAC` |
| `cancelled` | CANCELLED | `#FEF2F2` | `#991B1B` | `#FECACA` |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Status statis | Warna sesuai tabel pemetaan di atas |
| `updated` | `status` berubah (real-time dari Firebase listener) | `fadeIn` 300ms saat label/warna berganti (`UI_GUIDELINE.md` §15.3) |

**Aturan Pemakaian**
- Label selalu **UPPERCASE dengan spasi** — "DP VERIFIED", bukan "Dp Verified" atau "DP_VERIFIED" (`UI_GUIDELINE.md` §20.3)
- Warna **tidak pernah** menjadi satu-satunya pembeda — teks status selalu ada (penting juga untuk aksesibilitas, lihat §11)
- Tidak pernah full-width di dalam cell tabel — selalu inline

---

### 3.4 Statistic Card

**Deskripsi**
Kartu ringkas untuk menampilkan satu metrik angka dengan tren, dipakai di dashboard admin.

**Kapan Digunakan**
- Ringkasan jumlah booking, total client hari ini, dsb. di halaman dashboard `admin.html`

**Anatomi**

```
┌───────────────────────────────┐
│  📋                           │
│  Total Booking                │ ← label, --text-sm
│                               │
│  247                          │ ← value, --text-3xl/bold
│  ↑ 12 dari bulan lalu          │ ← trend, --text-sm, hijau/merah
└───────────────────────────────┘
(glassmorphism ringan, sesuai §1.2 UI_GUIDELINE)
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `icon` | `IconName` | — | ✅ | Icon 24px representasi metrik |
| `label` | `string` | — | ✅ | Nama metrik, mis. "Total Booking" |
| `value` | `string \| number` | — | ✅ | Angka utama, `--text-3xl` bold |
| `trendValue` | `string` | `null` | ❌ | Teks tren, mis. "12 dari bulan lalu" |
| `trendDirection` | `"up"` \| `"down"` \| `"neutral"` | `"neutral"` | ❌ | Menentukan warna & icon arah tren |
| `isGlass` | `boolean` | `true` | ❌ | Menggunakan glassmorphism (default untuk komponen ini) |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Data tersedia | Tampil normal |
| `trend-up` | `trendDirection === "up"` | Teks tren `--s-600` (hijau) + icon panah naik |
| `trend-down` | `trendDirection === "down"` | Teks tren `--d-700` (merah) — **hindari** pemakaian ini untuk metrik yang secara bisnis netral (lihat §20.4 UI_GUIDELINE: warna merah hanya untuk error/danger, gunakan dengan hati-hati pada konteks tren) |
| `loading` | Data belum siap | **Loading Skeleton** varian card |

**Aturan Pemakaian**
- Maksimal 3 ukuran font dalam satu card (`UI_GUIDELINE.md` §3.5)
- Tidak menambahkan border tebal — glassmorphism sudah memberi kedalaman visual yang cukup

---

### 3.5 Empty State

**Deskripsi**
Tampilan pengganti saat tidak ada data untuk ditunjukkan — menggantikan Table/Card kosong dengan ilustrasi, pesan, dan CTA.

**Kapan Digunakan**
- Belum ada booking sama sekali
- Hasil pencarian/filter kosong
- Antrian hari H kosong
- Riwayat pembayaran kosong

**Anatomi**

```
┌──────────────────────────────────────────────────────┐
│                    📭                                │
│           Belum Ada Booking                          │ ← --text-xl
│      Booking yang masuk akan muncul di sini.         │ ← --text-sm, --n-400
│      Bagikan link booking ke client wisuda.          │
│           ┌────────────────────────────┐             │
│           │  📋  Salin Link Booking    │             │ ← CTA opsional
│           └────────────────────────────┘             │
└──────────────────────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `context` | enum | — | ✅ | `"no-booking"` \| `"no-search-result"` \| `"no-filter-result"` \| `"empty-queue"` \| `"no-payment-history"` — menentukan icon & pesan default (lihat tabel §12.2 `UI_GUIDELINE.md`) |
| `title` | `string` | derived dari `context` | ❌ | Override judul |
| `description` | `string` | derived dari `context` | ❌ | Override deskripsi |
| `ctaLabel` | `string` | `null` | ❌ | Teks tombol aksi, jika ada |
| `onCtaClick` | `function` | `null` | ❌ | Callback aksi CTA |

**Pemetaan Context Default**

| `context` | Icon/Ilustrasi | Pesan Default |
|---|---|---|
| `no-booking` | 📭 | "Belum ada booking masuk" |
| `no-search-result` | 🔍 | "Tidak ada hasil untuk '[query]'" |
| `no-filter-result` | 🗂 | "Tidak ada booking dengan filter ini" |
| `empty-queue` | ✅ | "Tidak ada client dalam antrian" |
| `no-payment-history` | 📜 | "Belum ada riwayat pembayaran" |

**State**

Empty State adalah komponen presentasional statis — tidak memiliki state internal selain ditentukan oleh `context` yang diberikan.

**Aturan Pemakaian**
- Selalu sertakan ilustrasi/icon yang relevan dan pesan dua baris (judul + saran tindakan)
- Tidak boleh terasa menggurui atau merendahkan user

---

### 3.6 Loading Skeleton

**Deskripsi**
Placeholder bayangan (shimmer) yang menunjukkan struktur konten sebelum data selesai dimuat dari Firebase.

**Kapan Digunakan**
- Menggantikan baris Table saat `isLoading === true`
- Menggantikan Card/Statistic Card saat data dashboard belum siap
- Tidak digunakan untuk loading aksi tombol — itu memakai **Progress Indicator** varian spinner (§5.5)

**Anatomi**

```
┌─────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░   ░░░░░░░░░   ░░░░░░░░░░░  │  ← shimmer kiri→kanan, 1.5s loop
├─────────────────────────────────────────────────────┤
│  ░░░░░░░░░░░░░░░░░░         ░░░░░░░   ░░░░░░░░░░░  │
└─────────────────────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `shape` | `"text-line"` \| `"table-row"` \| `"card"` \| `"avatar"` | `"text-line"` | ✅ | Bentuk skeleton menyesuaikan konten asli yang digantikan |
| `rows` | `number` | `3` | ❌ | Jumlah baris/blok skeleton yang ditampilkan |
| `minDurationMs` | `number` | `300` | ❌ | Durasi minimum tampil agar tidak "berkedip" jika data sangat cepat dimuat |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `shimmering` | Selalu, selama komponen tampil | Animasi shimmer dari `--n-100` ke `--n-200`, loop linear 1500ms |
| `unmounting` | Data selesai dimuat, `minDurationMs` terlampaui | Fade out, diganti konten asli |

**Aturan Pemakaian**
- Selalu gunakan skeleton untuk list/tabel — bukan spinner global di tengah halaman
- Bentuk skeleton harus mendekati bentuk asli konten (jumlah kolom, proporsi lebar) agar transisi tidak terasa melompat

---

## 4. Action Components

Komponen aksi mengikuti hierarki tombol yang ketat (`UI_GUIDELINE.md` §5.1) — setiap halaman/section hanya boleh memiliki **satu** Primary Button.

### 4.1 Primary Button

**Deskripsi**
Tombol aksi utama — level tertinggi dalam hierarki tombol. Hanya satu per halaman/section.

**Kapan Digunakan**
- "Submit Booking" di `booking.html`
- "Konfirmasi DP" di modal verifikasi admin
- "Generate QR Code" setelah DP terverifikasi

**Anatomi**

```
┌──────────────────────────────────────────┐
│          Konfirmasi DP                   │  ← filled, bg --p-600, text putih
└──────────────────────────────────────────┘
   hover: bg --p-700  |  radius: 10px (--r-lg)
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `label` | `string` | — | ✅ | Teks tombol, selalu Semibold (600), tidak pernah Bold |
| `icon` | `IconName` | `null` | ❌ | Icon opsional, selalu disertai label (`UI_GUIDELINE.md` §4.3) |
| `iconPosition` | `"left"` \| `"right"` | `"left"` | ❌ | Posisi icon relatif terhadap label |
| `size` | `"sm"` \| `"md"` \| `"lg"` | `"md"` | ❌ | 32px / 40px / 48px tinggi (`UI_GUIDELINE.md` §5.2) |
| `isLoading` | `boolean` | `false` | ❌ | Menampilkan spinner menggantikan icon kiri, lebar tombol tidak berubah |
| `isDisabled` | `boolean` | `false` | ❌ | Menonaktifkan tombol |
| `isFullWidth` | `boolean` | `false` | ❌ | Tombol melebar 100% container (umum di mobile) |
| `onClick` | `function` | — | ✅ | Callback klik |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Normal | Bg `#2563EB`, shadow `--sh-md` |
| `hover` | Mouse hover | Bg `#1E4F8C`, shadow `--sh-lg` |
| `active` | Sedang ditekan | `scale(0.97)→scale(1)`, 100ms ease-spring |
| `loading` | `isLoading === true` | Spinner 16px + teks "Menyimpan...", disabled, lebar fixed |
| `disabled` | `isDisabled === true` | Opacity 0.5, cursor not-allowed |

**Aturan Pemakaian**
- Maksimal satu Primary Button per section/form
- Posisi: aksi utama selalu di **kanan**

---

### 4.2 Secondary Button

**Deskripsi**
Tombol aksi penting kedua, bergaya outlined.

**Kapan Digunakan**
- "Lihat Detail" di samping aksi utama pada Booking Card
- "Batal" di sebelah tombol konfirmasi pada Modal non-destruktif

**Anatomi**

```
┌──────────────────────────────────────────┐
│          Lihat Detail                    │  ← outlined, bg putih, border --p-400
└──────────────────────────────────────────┘
   text: --p-600  |  hover: bg --p-50
```

**Props**

Sama dengan **Primary Button** (§4.1): `label`, `icon`, `iconPosition`, `size`, `isLoading`, `isDisabled`, `isFullWidth`, `onClick`.

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Normal | Bg putih, border `--p-400`, teks `--p-600` |
| `hover` | Mouse hover | Bg `--p-50` |
| `disabled` | `isDisabled === true` | Opacity 0.5 |

**Aturan Pemakaian**
- Diletakkan di **kiri** dari Primary Button bila berdampingan
- Tidak digunakan untuk lebih dari dua aksi penting dalam satu baris — jika butuh lebih, pertimbangkan Ghost Button untuk aksi tersier

---

### 4.3 Ghost Button

**Deskripsi**
Tombol aksi ringan, transparan, untuk aksi sekunder di dalam Card atau toolbar yang tidak boleh menarik perhatian berlebih.

**Kapan Digunakan**
- "Lihat Riwayat" di dalam Card pembayaran
- "Kembali" di Modal Konfirmasi (varian danger)

**Anatomi**

```
┌──────────────────────────────────────────┐
│          Lihat Riwayat                   │  ← transparent, text --n-600
└──────────────────────────────────────────┘
   hover: bg --n-100
```

**Props**

Sama dengan **Primary Button** (§4.1).

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Normal | Transparan, teks `--n-600` |
| `hover` | Mouse hover | Bg `--n-100` |
| `disabled` | `isDisabled === true` | Opacity 0.5 |

**Aturan Pemakaian**
- Tidak pernah dipakai untuk aksi yang mengubah data penting (gunakan Primary/Secondary untuk itu)

---

### 4.4 Danger Button

**Deskripsi**
Tombol aksi destruktif — selalu memicu **Confirm Dialog** (§5.4) sebelum eksekusi, tidak pernah langsung mengubah data.

**Kapan Digunakan**
- "Batalkan Booking" → mengubah status ke `cancelled`
- "Hapus" baris data di `database.html`

**Anatomi**

```
┌──────────────────────────────────────────┐
│          Batalkan Booking                │  ← filled, bg --d-500, text putih
└──────────────────────────────────────────┘
   hover: bg --d-700
```

**Props**

Sama dengan **Primary Button** (§4.1), ditambah:

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `requiresConfirmation` | `boolean` | `true` | ❌ | Jika `true` (selalu, kecuali kasus sangat khusus), klik memunculkan **Confirm Dialog** sebelum `onClick` benar-benar dijalankan |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Normal | Bg `--d-500`, teks putih |
| `hover` | Mouse hover | Bg `--d-700` |
| `disabled` | `isDisabled === true` | Opacity 0.5 |

**Aturan Pemakaian**
- Label selalu lengkap dan jelas — "Batalkan Booking", **bukan** hanya "Hapus" (`UI_GUIDELINE.md` §20.3)
- Warna merah **hanya** dipakai pada komponen ini dan elemen error — tidak pernah untuk aksi netral

---

### 4.5 Floating Action Button (FAB)

**Deskripsi**
Tombol bulat mengambang untuk aksi cepat yang harus selalu terjangkau tanpa scroll, terutama di layar mobile/tablet petugas hari H.

**Kapan Digunakan**
- "Panggil Antrian Berikutnya" di tampilan antrian hari H pada tablet petugas
- "+ Booking Manual" sebagai akses cepat di `admin.html` versi mobile

**Anatomi**

```
                                    ╭──────╮
                                    │  ➕  │  ← bulat 56px, bg --p-600
                                    ╰──────╯
                                       ↑ fixed bottom-right, margin 24px (--space-6)
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `icon` | `IconName` | — | ✅ | Icon 24px, tunggal (tanpa label terlihat) |
| `tooltipLabel` | `string` | — | ✅ | Label tersembunyi, wajib untuk aksesibilitas (lihat §11) |
| `position` | `"bottom-right"` | `"bottom-right"` | ❌ | Posisi fixed di viewport |
| `isExtended` | `boolean` | `false` | ❌ | Jika `true`, FAB melebar menampilkan label teks di sampingnya |
| `onClick` | `function` | — | ✅ | Callback klik |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Normal | Bg `--p-600`, shadow `--sh-lg`, bentuk bulat penuh (`--r-full`) |
| `hover` | Hover (desktop) | Shadow naik ke `--sh-xl`, tooltip muncul |
| `pressed` | Tap/klik | `scale(0.97)→scale(1)` |

**Aturan Pemakaian**
- Karena ini aksi icon-only, `tooltipLabel`/`aria-label` **wajib** diisi — tidak terkecuali (lihat §11 Accessibility)
- Tidak digunakan di desktop admin penuh (di sana aksi utama sudah terwadahi Section Header), murni untuk konteks mobile/tablet hari H

---

## 5. Feedback Components

Komponen feedback memberi tahu user hasil dari sebuah aksi — krusial di HSGMS karena banyak aksi bersifat ireversibel (generate QR, ubah status) dan harus jelas berhasil/gagal.

### 5.1 Toast

**Deskripsi**
Notifikasi sementara di pojok layar, untuk konfirmasi aksi yang tidak butuh perhatian penuh user.

**Kapan Digunakan**
- Setelah admin berhasil konfirmasi DP, generate QR, atau update status apa pun
- Setelah gagal menyimpan data (error non-blocking)

**Anatomi**

```
                              ┌───────────────────────────────────────┐
                              │  ✅  DP berhasil dikonfirmasi untuk   │ [×]
                              │      Budi Santoso                     │
                              └───────────────────────────────────────┘
                                          ↑ pojok kanan bawah, max-width 360px
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `variant` | `"success"` \| `"error"` \| `"warning"` \| `"info"` | — | ✅ | Menentukan warna & icon (lihat §10.2 UI_GUIDELINE) |
| `message` | `string` | — | ✅ | Pesan, maksimal dua baris |
| `autoDismissMs` | `number` | `4000` (success), `null` untuk error | ❌ | Error **tidak** auto-dismiss, harus ditutup manual |
| `isClosable` | `boolean` | `true` | ❌ | Menampilkan tombol `×` |
| `onClick` | `function` | `null` | ❌ | Aksi lanjutan opsional saat toast diklik |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `entering` | Toast baru muncul | `slideIn` dari kanan, 250ms ease-out |
| `visible` | Tampil normal | Statis sesuai `variant` |
| `exiting` | Auto-dismiss atau ditutup manual | `slideOut` + fadeOut, 200ms ease-in |
| `stacked` | >1 toast aktif | Toast baru mendorong toast lama ke atas; maksimal 3 toast tampil sekaligus |

**Aturan Pemakaian**
- Posisi default selalu pojok kanan bawah
- Toast error tidak pernah auto-dismiss
- Maksimal 3 toast tampil bersamaan

---

### 5.2 Alert

**Deskripsi**
Banner pesan inline yang menempel di dalam halaman/form (bukan mengambang seperti Toast) — untuk pesan yang harus tetap terlihat selama konteksnya relevan.

**Kapan Digunakan**
- Pesan sukses setelah submit booking ("Booking berhasil dikirim!") — lihat `UI_GUIDELINE.md` §14.1
- Pesan error inline saat gagal menyimpan, tanpa menghilangkan data form yang sudah diisi (§13.2)

**Anatomi**

```
┌──────────────────────────────────────────────────────┐
│  ✅  Booking berhasil dikirim!                       │
│      Kami akan mengkonfirmasi DP Anda dalam          │
│      1×24 jam. Pantau WhatsApp Anda.                 │
└──────────────────────────────────────────────────────┘
  bg: --s-100 | border: 1px solid --s-300 | radius: 10px
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `variant` | `"success"` \| `"error"` \| `"warning"` \| `"info"` | — | ✅ | Menentukan warna |
| `title` | `string` | — | ✅ | Judul singkat, baris pertama |
| `description` | `string` | `null` | ❌ | Detail tambahan/langkah selanjutnya |
| `isDismissible` | `boolean` | `false` (true untuk warning/info) | ❌ | Apakah alert bisa ditutup manual |
| `actionSlot` | `node` | `null` | ❌ | Tombol aksi terkait, mis. "Coba Lagi" |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `success` | Aksi penting berhasil | Bg `--s-100`, tidak otomatis hilang pada aksi penting (form submit) |
| `error` | Aksi gagal | Bg `--d-100`, tidak menghilangkan data form yang sudah diisi user |
| `warning` | Peringatan non-kritis | Bg `--w-100` |
| `info` | Informasi netral | Bg `--i-100` |

**Aturan Pemakaian**
- Pesan error harus spesifik (apa yang salah + apa yang harus dilakukan) — tidak menampilkan stack trace atau error code Firebase mentah
- Selalu sediakan tombol retry atau panduan solusi pada varian error

---

### 5.3 Modal

**Deskripsi**
Dialog overlay untuk aksi yang butuh fokus penuh user — form dalam modal, detail booking, atau preview QR.

**Kapan Digunakan**
- Form verifikasi DP dengan detail booking
- Detail booking lengkap (tab Data Diri / Pembayaran / QR)
- Preview QR Code

**Anatomi**

```
╔══════════════════════════════════════════════════════╗
║  ╔════════════════════════════════════════════════╗  ║ ← backdrop blur(8px),
║  ║  Konfirmasi DP Booking                    [×]  ║  ║   rgba(0,0,0,0.4)
║  ║  ────────────────────────────────────────────  ║  ║
║  ║  (konten modal)                                ║  ║
║  ║  ┌───────────────┐  ┌──────────────────────┐  ║  ║
║  ║  │    Batal      │  │  Ya, Konfirmasi DP   │  ║  ║
║  ║  └───────────────┘  └──────────────────────┘  ║  ║
║  ╚════════════════════════════════════════════════╝  ║
╚══════════════════════════════════════════════════════╝
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `title` | `string` | — | ✅ | Judul modal |
| `size` | `"sm"` \| `"md"` \| `"lg"` \| `"xl"` \| `"full"` | `"md"` | ❌ | 400px / 560px / 720px / 900px / full (`UI_GUIDELINE.md` §9.2) |
| `content` | `node` | — | ✅ | Slot konten utama (bisa berisi tab, form, dsb.) |
| `footerActions` | `node` | `null` | ❌ | Slot tombol aksi, selalu di kanan bawah |
| `isClosableByBackdrop` | `boolean` | `true` (`false` untuk aksi kritis) | ❌ | Menonaktifkan klik backdrop untuk modal konfirmasi destruktif |
| `onClose` | `function` | — | ✅ | Callback saat modal ditutup (×, backdrop, atau Esc) |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `entering` | Modal dibuka | `fadeIn` + `scaleFrom(0.95)`, 250ms ease-out |
| `open` | Tampil normal | Backdrop blur 8px, konten modal di tengah |
| `exiting` | Modal ditutup | `fadeOut` + `scaleTo(0.95)`, 150ms ease-in |
| `locked` | `isClosableByBackdrop === false` | Klik backdrop tidak menutup modal — hanya tombol aksi yang bisa |

**Aturan Pemakaian**
- Selalu dapat ditutup dengan tombol `×`, klik backdrop, atau tombol Esc — **kecuali** modal aksi kritis
- Tidak pernah di-stack lebih dari satu lapis
- Scroll terjadi di dalam konten modal, bukan di seluruh halaman

---

### 5.4 Confirm Dialog

**Deskripsi**
Varian khusus Modal berukuran kecil (`sm`), didedikasikan untuk konfirmasi sebelum aksi destruktif atau penting dieksekusi.

**Kapan Digunakan**
- Selalu dipicu sebelum **Danger Button** (§4.4) benar-benar mengeksekusi aksinya
- Konfirmasi sebelum generate QR Code (aksi yang tidak dapat diulang dengan mudah)

**Anatomi**

```
╔══════════════════════════════════════════════╗
║   ⚠️   Batalkan Booking?                    ║
║                                              ║
║   Tindakan ini tidak dapat dibatalkan.       ║
║   Data booking akan ditandai CANCELLED.      ║
║                                              ║
║   ┌────────────┐   ┌──────────────────────┐ ║
║   │   Kembali  │   │  Ya, Batalkan        │ ║
║   │  (ghost)   │   │  (danger)             │ ║
║   └────────────┘   └──────────────────────┘ ║
╚══════════════════════════════════════════════╝
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `variant` | `"default"` \| `"danger"` | `"default"` | ✅ | Menentukan warna icon dan tombol konfirmasi |
| `title` | `string` | — | ✅ | Judul singkat berupa pertanyaan, mis. "Batalkan Booking?" |
| `message` | `string` | — | ✅ | Penjelasan konsekuensi aksi |
| `confirmLabel` | `string` | `"Konfirmasi"` | ❌ | Label tombol konfirmasi — gunakan kalimat lengkap untuk aksi destruktif (mis. "Ya, Batalkan") |
| `cancelLabel` | `string` | `"Batal"` | ❌ | Label tombol batal |
| `onConfirm` | `function` | — | ✅ | Callback eksekusi aksi |
| `onCancel` | `function` | — | ✅ | Callback batal |

**State**

Mewarisi state **Modal** (§5.3): `entering`, `open`, `exiting`, `locked` (selalu `locked = true` untuk varian `danger`).

**Aturan Pemakaian**
- Tombol konfirmasi varian `danger` selalu memakai styling **Danger Button** (§4.4); varian `default` memakai **Primary Button** (§4.1)
- Tombol batal di kiri (ghost), tombol konfirmasi di kanan

---

### 5.5 Progress Indicator

**Deskripsi**
Indikator progres/loading generik — mencakup spinner inline dan loading full-page. (Untuk skeleton list/tabel, lihat **Loading Skeleton** §3.6.)

**Kapan Digunakan**
- Spinner di dalam tombol saat aksi berjalan (lihat state `loading` di §4.1)
- Loading full-page hanya saat halaman pertama kali dimuat (bukan saat navigasi antar tab)

**Anatomi**

```
Spinner inline:        ◌  Menyimpan...

Full Page Loading:
┌──────────────────────────────────────────────┐
│                                              │
│                    ◌                         │
│              Memuat data...                  │
│                                              │
└──────────────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `type` | `"spinner"` \| `"full-page"` | `"spinner"` | ✅ | Bentuk indikator |
| `label` | `string` | `null` | ❌ | Teks pendamping, mis. "Menyimpan...", "Memuat data..." |
| `size` | `number` (px) | `16` (spinner inline), `32` (full-page) | ❌ | Ukuran spinner |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `spinning` | Selalu, selama proses berjalan | Rotasi kontinu, warna primary, border 2px |
| `done` | Proses selesai | Komponen di-unmount, diganti hasil/konten asli |

**Aturan Pemakaian**
- Tidak memblok seluruh halaman kecuali benar-benar diperlukan (hanya initial load)
- Setiap aksi tombol harus punya feedback loading — tidak pernah tombol "diam" tanpa indikasi setelah diklik

---

## 6. Queue Components

Komponen antrian khusus dipakai pada **Fase 3 & 4 — Hari H** (`SOP_FLOW.md` §1.1). Antrian di HSGMS bersifat **per-studio**, bukan antrian global, dan dikelola secara real-time di lokasi (`DATABASE_SCHEMA.md` §8 — "Tidak Menggunakan Slot/Booking Jam").

### 6.1 Queue Card

**Deskripsi**
Kartu yang menampilkan satu client dalam antrian — nomor antrian, studio tujuan, dan status sesi.

**Kapan Digunakan**
- Daftar antrian per studio di tampilan petugas hari H (`admin.html` mode hari H)

**Anatomi**

```
┌──────────────────────────────────────────┐
│  ANTRIAN  #03           Studio A         │
│  ──────────────────────────────────────  │
│  Budi Santoso                            │
│  Masuk: 09:45                            │
│                          [IN PROGRESS]   │
└──────────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `queueNumber` | `number` | — | ✅ | Dari `queue/queueNumber` (`DATABASE_SCHEMA.md` §3.5) |
| `studioName` | `string` | — | ✅ | Dari `studio/studioName` |
| `customerName` | `string` | — | ✅ | Dari `identity/fullName` |
| `enteredAtLabel` | `string` | — | ✅ | Waktu masuk antrian, format jam, dari `queue/queueEnteredAt` |
| `status` | enum status | — | ✅ | `in_queue` \| `in_progress` \| `completed` — ditampilkan via **Badge** (§3.3) |
| `isHighlighted` | `boolean` | `false` | ❌ | Menonjolkan kartu (dipakai oleh **Current Queue**, §6.3) |
| `onCallNext` | `function` | `null` | ❌ | Callback tombol "Panggil" jika kartu ini adalah giliran berikutnya |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `waiting` | `status === "in_queue"` | Badge oranye `IN QUEUE`, kartu normal |
| `in-session` | `status === "in_progress"` | Badge biru `IN PROGRESS`, `isHighlighted` aktif secara default |
| `done` | `status === "completed"` | Badge hijau `COMPLETED`, kartu memudar (opacity turun) sebagai indikasi sudah selesai |

**Aturan Pemakaian**
- Nomor antrian selalu menggunakan font monospace agar deret angka mudah dipindai mata petugas (`UI_GUIDELINE.md` §3.1)
- Satu studio = satu kelompok Queue Card, tidak dicampur antar studio dalam satu list tanpa pengelompokan jelas

---

### 6.2 Studio Card

**Deskripsi**
Kartu pemilihan/representasi satu studio foto — menunjukkan apakah studio sedang kosong atau dipakai, dan siapa yang sedang difoto di dalamnya.

**Kapan Digunakan**
- Saat petugas memilih studio untuk client yang baru check-in (`SOP_FLOW.md` Tahap 7 — Admin Memilih Studio)
- Panel ringkasan ketersediaan studio di dashboard hari H

**Anatomi**

```
┌────────────────────────┐   ┌────────────────────────┐
│  🎬  Studio A           │   │  🎬  Studio B           │
│  ─────────────────────  │   │  ─────────────────────  │
│  Sedang memotret:       │   │                         │
│  Budi Santoso           │   │  ● Tersedia             │
│  ● Sedang Dipakai       │   │                         │
└────────────────────────┘   └────────────────────────┘
   (terpilih: border --p-400 2px, bg --p-50)
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `studioId` | `string` | — | ✅ | Mis. `"studio_a"` (`DATABASE_SCHEMA.md` §3.4 / §11.1) |
| `studioName` | `string` | — | ✅ | Mis. `"Studio A"` |
| `isAvailable` | `boolean` | `true` | ✅ | Status ketersediaan saat ini |
| `currentCustomerName` | `string` | `null` | ❌ | Nama client yang sedang difoto, jika `isAvailable === false` |
| `isSelected` | `boolean` | `false` | ❌ | Studio ini sedang dipilih oleh petugas untuk assignment |
| `isActive` | `boolean` | `true` | ❌ | Dari master data studio (`studios/{id}/isActive` — `DATABASE_SCHEMA.md` §11.1); jika `false`, studio tidak dapat dipilih |
| `onSelect` | `function` | — | ❌ | Callback saat petugas memilih studio ini |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `available` | `isAvailable === true` | Badge hijau "Tersedia", dapat diklik untuk dipilih |
| `occupied` | `isAvailable === false` | Menampilkan nama client yang sedang di dalam, badge "Sedang Dipakai" |
| `selected` | `isSelected === true` | Border `--p-400` 2px, bg `--p-50` |
| `inactive` | `isActive === false` | Kartu pudar (opacity 0.5), tidak dapat diklik — studio sedang tidak dioperasikan |

**Aturan Pemakaian**
- Distribusikan client secara merata — UI sebaiknya menonjolkan studio dengan antrian paling pendek (`SOP_FLOW.md` §10.5)
- Studio yang `isActive === false` tetap ditampilkan (agar petugas tahu studio itu ada) namun jelas tidak dapat dipilih

---

### 6.3 Current Queue

**Deskripsi**
Widget yang menonjolkan **satu** client yang sedang dipanggil/sedang berada dalam sesi foto saat ini, per studio.

**Kapan Digunakan**
- Panel utama tampilan layar antrian hari H — menjawab pertanyaan "siapa yang sedang difoto sekarang?"

**Anatomi**

```
┌──────────────────────────────────────────┐
│  SEDANG DIPANGGIL                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│        ANTRIAN #03 — Studio A            │
│           Budi Santoso                   │
└──────────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `queueNumber` | `number` | `null` | ❌ | Nomor antrian yang sedang aktif; `null` jika belum ada |
| `studioName` | `string` | `null` | ❌ | Studio terkait |
| `customerName` | `string` | `null` | ❌ | Nama client yang sedang dipanggil |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `active` | Ada client dengan `status === "in_progress"` | Tampil menonjol, ukuran teks besar (`--text-2xl`+) |
| `idle` | Tidak ada client `in_progress` di studio tersebut | Tampilkan placeholder "Belum ada yang dipanggil" (varian **Empty State**, §3.5) |

**Aturan Pemakaian**
- Komponen ini murni read-only/display — tidak memiliki aksi interaktif (aksi "Panggil Berikutnya" berada di **Queue Card** atau **FAB**, §4.5)
- Dirancang untuk dilihat dari jarak (Future Improvement — Display Antrian Real-time, `SOP_FLOW.md` §9.2): kontras tinggi, ukuran teks besar

---

### 6.4 Next Queue

**Deskripsi**
Widget daftar pendek yang menunjukkan client-client berikutnya yang akan dipanggil setelah **Current Queue**.

**Kapan Digunakan**
- Mendampingi **Current Queue** di layar/panel antrian hari H, agar client tahu estimasi gilirannya semakin dekat (`SOP_FLOW.md` §9.2 — Future Improvement terkait estimasi giliran)

**Anatomi**

```
┌──────────────────────────────────────────┐
│  BERIKUTNYA                              │
│  ──────────────────────────────────────  │
│  #04  Siti Rahayu          Studio A      │
│  #05  Ahmad Fauzi           Studio A      │
│  #06  Dewi Lestari          Studio A      │
└──────────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `studioName` | `string` | — | ✅ | Studio yang sedang ditampilkan antriannya |
| `upcomingList` | `array<{queueNumber, customerName}>` | `[]` | ✅ | Daftar client berikutnya, terurut berdasarkan `queueEnteredAt` |
| `maxVisible` | `number` | `3` | ❌ | Jumlah maksimum client yang ditampilkan sebelum "+N lainnya" |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `has-upcoming` | `upcomingList.length > 0` | Daftar tampil terurut |
| `empty` | `upcomingList.length === 0` | Tampilkan **Empty State** varian "Antrian kosong" (§3.5) |
| `overflow` | `upcomingList.length > maxVisible` | Baris terakhir menampilkan "+N lainnya" |

**Aturan Pemakaian**
- Daftar selalu terurut berdasarkan waktu check-in (`queueEnteredAt`), tidak dapat diubah urutannya secara manual oleh UI ini (mencegah antrian "menyerobot")

---

## 7. Booking Components

Komponen booking adalah representasi visual dari satu object booking di Firebase (`bookings/{bookingId}`) dalam berbagai sub-konteks — identitas, pembayaran, dan QR. Komponen-komponen ini **mengkomposisikan** Card, Badge, dan Button (lihat §12 Component Hierarchy) — tidak dibangun dari nol.

### 7.1 Booking Card

**Deskripsi**
Representasi penuh satu booking — komponen data paling sering dipakai ulang di `admin.html` dan `database.html` (mode mobile). Mengikuti anatomi **Card** (§3.2) dengan header, body, footer terisi data booking spesifik.

**Kapan Digunakan**
- Daftar booking dalam grid/list di `admin.html` (verifikasi DP, generate QR)
- Tampilan mobile pengganti Table di `database.html` (§16.4 UI_GUIDELINE)

**Anatomi**

```
┌─────────────────────────────────────────────────────┐
│  🎓  Budi Santoso            [DP VERIFIED]   ← header│
│       Universitas Airlangga                          │
│  ──────────────────────────────────────────────────  │
│  Fakultas    : Ilmu Komputer                  ← body │
│  Prodi       : Sistem Informasi                       │
│  Hari Wisuda : 15 Juli 2025                           │
│  DP          : Rp 150.000                             │
│  ──────────────────────────────────────────────────  │
│  [Lihat Detail]              [Konfirmasi QR] ← footer │
└─────────────────────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `bookingId` | `string` | — | ✅ | Firebase Push ID (`DATABASE_SCHEMA.md` §4 — Konvensi `bookingId`) |
| `fullName` | `string` | — | ✅ | Dari `identity/fullName` |
| `universityName` | `string` | — | ✅ | Dari `identity/universityName` |
| `facultyName` | `string` | — | ❌ | Dari `identity/facultyName` |
| `studyProgram` | `string` | — | ❌ | Dari `identity/studyProgram` |
| `graduationDateLabel` | `string` | — | ✅ | Dari `identity/graduationDate`, diformat ke Bahasa Indonesia |
| `dpAmountLabel` | `string` | — | ❌ | Dari `payment/dpAmount`, diformat Rupiah |
| `status` | enum status | — | ✅ | Ditampilkan via **Badge** (§3.3) di header |
| `primaryAction` | `{label, onClick}` | sesuai `status` | ❌ | Tombol aksi utama yang relevan dengan status saat ini (lihat tabel di bawah) |
| `onViewDetail` | `function` | — | ✅ | Callback tombol "Lihat Detail" |

**Aksi Utama per Status** (selaras dengan `SOP_FLOW.md` §6 — Trigger Perubahan Status)

| `status` | Aksi Utama yang Tampil |
|---|---|
| `pending` | "Konfirmasi DP" |
| `dp_verified` | "Generate QR Code" |
| `qr_generated` | (menunggu hari H — tidak ada aksi utama, hanya "Lihat Detail") |
| `checked_in` | "Pilih Studio" |
| `in_queue` | "Panggil ke Studio" |
| `in_progress` | "Selesaikan Sesi" |
| `completed` / `cancelled` | (status final — hanya "Lihat Detail", tidak ada aksi utama) |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Normal | Sesuai anatomi Card §3.2 |
| `final-state` | `status` adalah `completed` atau `cancelled` | Tombol aksi utama disembunyikan/diganti tombol netral, sesuai aturan status final (`SOP_FLOW.md` §4.3) |
| `hover` | Hover (jika card clickable) | `translateY(-2px)` |

**Aturan Pemakaian**
- Tombol aksi utama pada footer **selalu** mengikuti tabel "Aksi Utama per Status" di atas — tidak boleh menampilkan aksi yang melompati urutan status (`SOP_FLOW.md` §4.4: transisi harus linear)
- Aksi destruktif ("Batalkan Booking") tidak ditampilkan sebagai aksi utama di card ini — letakkan di dalam Modal Detail (§7.3 turunan **Modal**, §5.3) untuk mencegah klik tidak sengaja

---

### 7.2 Payment Card

**Deskripsi**
Kartu yang fokus menampilkan sub-node `payment` dari satu booking — dipakai khusus di `hasilpembayaran.html`, yang menurut `DATABASE_SCHEMA.md` §6 hanya memiliki akses **READ** ke `bookings/{id}/payment`.

**Kapan Digunakan**
- Halaman `hasilpembayaran.html` — melihat detail pembayaran per booking

**Anatomi**

```
┌─────────────────────────────────────────────────────┐
│  💰  Pembayaran — Budi Santoso                       │
│  ──────────────────────────────────────────────────  │
│  DP Dibayarkan     : Rp 150.000                      │
│  Dibayar Tanggal    : 12 Jun 2025, 14:00             │
│  Diverifikasi Oleh  : admin_rudi                     │
│  Metode             : Transfer Bank                  │
│  Sisa Pembayaran    : Rp 200.000                     │
│  ──────────────────────────────────────────────────  │
│  [Lihat Bukti Transfer]                              │
└─────────────────────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `dpAmountLabel` | `string` | — | ✅ | Dari `payment/dpAmount`, format Rupiah |
| `dpPaidAtLabel` | `string` | — | ✅ | Dari `payment/dpPaidAt`, format tanggal+jam |
| `dpVerifiedBy` | `string` | — | ✅ | Dari `payment/dpVerifiedBy` |
| `paymentMethodLabel` | `string` | — | ✅ | Dari `payment/paymentMethod`, label tampilan ("Transfer Bank", "Tunai", "QRIS Manual") |
| `transferProofUrl` | `string` | `null` | ❌ | Dari `payment/transferProofUrl`; jika ada, tampilkan tombol lihat bukti |
| `remainingBalanceLabel` | `string` | — | ✅ | Dari `payment/remainingBalance`, format Rupiah |
| `onViewProof` | `function` | `null` | ❌ | Callback membuka bukti transfer (biasanya dalam Modal) |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `verified` | `dpVerifiedBy` terisi | Tampil normal dengan info verifikator |
| `no-proof` | `transferProofUrl` kosong | Tombol "Lihat Bukti Transfer" disembunyikan, tampilkan catatan "Bukti tidak tersedia" |
| `fully-paid` | `remainingBalanceLabel === "Rp 0"` | Baris "Sisa Pembayaran" tampil dengan Badge `success` "LUNAS" |

**Aturan Pemakaian**
- Halaman ini bersifat **read-only** sesuai batas akses (`DATABASE_SCHEMA.md` §6) — Payment Card di `hasilpembayaran.html` tidak pernah menampilkan aksi edit/hapus
- Nominal selalu diformat Rupiah dengan pemisah ribuan, tidak pernah angka mentah

---

### 7.3 QR Card

**Deskripsi**
Kartu yang menampilkan QR Code unik milik satu booking, statusnya (sudah/belum di-scan), dan aksi terkait distribusi QR.

**Kapan Digunakan**
- Setelah admin generate QR di `admin.html` — preview sebelum dikirim ke client
- Tampilan sukses booking di `booking.html` (meski QR baru muncul setelah DP diverifikasi — lihat catatan di bawah)
- Modal detail booking, tab "QR" (`UI_GUIDELINE.md` §9.3)

**Anatomi**

```
┌─────────────────────────────────────────────────────┐
│  QR Code Booking                                     │
│  ──────────────────────────────────────────────────  │
│              ┌─────────────────┐                    │
│              │  ▓▓░░▓▓░░▓▓░░  │                    │
│              │  ░░▓▓░░▓▓░░▓▓  │                    │
│              │  ▓▓░░▓▓░░▓▓░░  │                    │
│              └─────────────────┘                    │
│        -O_xK2mLpQrAbCdEfGhI         ← monospace      │
│              [BELUM DI-SCAN]                         │
│  ──────────────────────────────────────────────────  │
│  [Kirim via WhatsApp]      [Download QR]             │
└─────────────────────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `qrCodeValue` | `string` | — | ✅ | Dari `qr/qrCode`, sama dengan `bookingId` (`DATABASE_SCHEMA.md` §3.3) |
| `qrGeneratedAtLabel` | `string` | — | ✅ | Dari `qr/qrGeneratedAt` |
| `qrGeneratedBy` | `string` | — | ❌ | Dari `qr/qrGeneratedBy` |
| `isScanned` | `boolean` | derived dari `qr/qrScannedAt` | ✅ | Menentukan badge status scan |
| `qrScannedAtLabel` | `string` | `null` | ❌ | Dari `qr/qrScannedAt`, tampil hanya jika `isScanned === true` |
| `onSendWhatsApp` | `function` | `null` | ❌ | Callback kirim QR via WhatsApp (`SOP_FLOW.md` Tahap 4 — distribusi QR) |
| `onDownload` | `function` | `null` | ❌ | Callback download gambar QR |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `not-scanned` | `isScanned === false` | Badge netral/info "BELUM DI-SCAN" |
| `scanned` | `isScanned === true` | Badge hijau "SUDAH DI-SCAN" + `qrScannedAtLabel` tampil |
| `not-generated` | QR belum dibuat (`status` masih `pending`/`dp_verified`) | Komponen ini tidak ditampilkan sama sekali — digantikan pesan "QR akan tersedia setelah DP diverifikasi" |

**Aturan Pemakaian**
- `bookingId` yang dijadikan nilai QR ditampilkan juga sebagai teks monospace di bawah QR image, untuk verifikasi manual jika scan gagal (`SOP_FLOW.md` §8.3 — Exception Flow client kehilangan QR)
- Satu booking = satu QR Code, hanya berlaku untuk satu kali scan (`SOP_FLOW.md` Tahap 4) — komponen ini tidak menyediakan aksi "Generate Ulang" pada level kartu (perlu eskalasi sesuai exception flow)

---

### 7.4 Customer Card

**Deskripsi**
Kartu identitas client murni — menampilkan sub-node `identity` tanpa elemen transaksional (pembayaran/QR/status). Dipakai saat konteksnya benar-benar hanya butuh "siapa client ini".

**Kapan Digunakan**
- Verifikasi identitas manual saat client kehilangan QR (`SOP_FLOW.md` §8.3 — cek nama, universitas, no. HP)
- Header/ringkasan di dalam Modal Detail Booking sebelum tab konten lain

**Anatomi**

```
┌─────────────────────────────────────────────────────┐
│  👤  Budi Santoso                                    │
│  ──────────────────────────────────────────────────  │
│  WhatsApp     : 0812-3456-789                        │
│  Universitas  : Universitas Airlangga                │
│  Fakultas     : Ilmu Komputer                        │
│  Prodi        : Sistem Informasi                     │
│  Tgl Wisuda   : 15 Juli 2025                         │
│  Catatan      : "Mohon konfirmasi H-1 hari wisuda"   │
└─────────────────────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `fullName` | `string` | — | ✅ | Dari `identity/fullName` |
| `phoneNumber` | `string` | — | ✅ | Dari `identity/phoneNumber` |
| `universityName` | `string` | — | ✅ | Dari `identity/universityName` |
| `facultyName` | `string` | — | ✅ | Dari `identity/facultyName` |
| `studyProgram` | `string` | — | ✅ | Dari `identity/studyProgram` |
| `graduationDateLabel` | `string` | — | ✅ | Dari `identity/graduationDate` |
| `notes` | `string` | `null` | ❌ | Dari `identity/notes`, tampil sebagai kutipan jika ada |
| `isCompact` | `boolean` | `false` | ❌ | Versi ringkas (hanya nama + 1 baris info) untuk dipakai sebagai header dalam Modal |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Tampilan lengkap | Semua field identitas tampil |
| `compact` | `isCompact === true` | Hanya nama besar + universitas, dipakai sebagai header ringkas |
| `no-notes` | `notes` kosong | Baris "Catatan" disembunyikan total, bukan ditampilkan kosong |

**Aturan Pemakaian**
- Komponen ini **tidak pernah** menampilkan data pembayaran — gunakan **Payment Card** (§7.2) untuk itu, agar pemisahan akses data tetap konsisten dengan prinsip sub-node logis di `DATABASE_SCHEMA.md` §8
- Data di komponen ini bersifat rahasia internal (`SOP_FLOW.md` §10.2) — tidak boleh dirender di halaman yang dapat diakses publik tanpa otentikasi

---

## 8. Dashboard Components

Komponen dashboard menyusun gambaran besar operasional HS Studio dalam satu layar — biasanya halaman pertama yang dilihat admin saat membuka `admin.html`.

### 8.1 Summary Card

**Deskripsi**
Kartu ringkasan yang mengelompokkan **beberapa** metrik terkait dalam satu kartu (berbeda dari **Statistic Card** §3.4 yang menampilkan satu metrik tunggal). Misalnya, ringkasan breakdown booking per status dalam satu kartu.

**Kapan Digunakan**
- Ringkasan "Booking Hari Ini" yang memecah jumlah per status sekaligus, di dashboard `admin.html`

**Anatomi**

```
┌───────────────────────────────────────┐
│  Ringkasan Booking Hari Ini           │
│  ────────────────────────────────────  │
│  PENDING            12                │
│  DP VERIFIED         8                │
│  IN QUEUE             3                │
│  COMPLETED           24                │
└───────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `title` | `string` | — | ✅ | Judul kartu |
| `segments` | `array<{status, count}>` | — | ✅ | Daftar metrik per status, warna mengikuti **Badge** (§3.3) |
| `period` | `"today"` \| `"week"` \| `"month"` | `"today"` | ❌ | Periode data yang ditampilkan |
| `onSegmentClick` | `function` | `null` | ❌ | Callback saat satu baris status diklik (navigasi ke `database.html` dengan filter status tersebut) |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Data tersedia | Daftar segmen tampil dengan warna status masing-masing |
| `loading` | Data belum siap | **Loading Skeleton** varian card |
| `zero-state` | Semua `count === 0` | Tetap tampil dengan angka 0 di setiap baris (bukan Empty State — ini ringkasan, bukan daftar) |

**Aturan Pemakaian**
- Urutan status dalam `segments` selalu mengikuti urutan alur bisnis (`SOP_FLOW.md` §4.1), bukan diurutkan berdasarkan jumlah terbanyak
- Warna angka mengikuti pemetaan warna Badge §3.3 — tidak boleh polos hitam semua

---

### 8.2 Activity Timeline

**Deskripsi**
Daftar kronologis aktivitas terbaru (perubahan status, aksi admin) dalam bentuk garis waktu vertikal.

**Kapan Digunakan**
- Panel "Aktivitas Terbaru" di dashboard `admin.html`, membantu admin/supervisor memantau apa yang baru terjadi tanpa membuka `database.html`

**Anatomi**

```
┌───────────────────────────────────────────────┐
│  Aktivitas Terbaru                            │
│  ──────────────────────────────────────────── │
│  ●  Admin Rudi mengkonfirmasi DP               │
│  │  Budi Santoso · 2 menit lalu                │
│  │                                             │
│  ●  QR Code digenerate                         │
│  │  Siti Rahayu · 14 menit lalu                │
│  │                                             │
│  ●  Booking baru masuk                         │
│     Ahmad Fauzi · 28 menit lalu                │
└───────────────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `events` | `array<{actorName, action, customerName, timestampLabel, status}>` | `[]` | ✅ | Daftar event terbaru, terurut dari yang paling baru |
| `maxItems` | `number` | `10` | ❌ | Jumlah maksimum event yang ditampilkan |
| `onItemClick` | `function` | `null` | ❌ | Callback membuka detail booking terkait event tersebut |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Ada event | Titik & garis vertikal menghubungkan setiap event, warna titik mengikuti status terkait |
| `empty` | `events.length === 0` | **Empty State** sederhana, "Belum ada aktivitas hari ini" |
| `live-update` | Event baru masuk (real-time listener) | Item baru muncul di atas dengan `fadeIn`, mendorong daftar ke bawah |

**Aturan Pemakaian**
- Setiap event harus mencatat aktor (siapa yang melakukan), bukan hanya "sistem" — selaras dengan aturan `SOP_FLOW.md` §4.4: admin yang melakukan transisi harus teridentifikasi
- Label waktu relatif ("2 menit lalu") untuk event terbaru, beralih ke format tanggal absolut setelah >24 jam

---

### 8.3 Recent Booking

**Deskripsi**
Widget daftar singkat (bukan tabel penuh) yang menampilkan beberapa booking paling baru masuk, dengan tautan ke daftar lengkap.

**Kapan Digunakan**
- Panel "Booking Terbaru" di dashboard `admin.html`, sebagai akses cepat tanpa membuka `database.html`

**Anatomi**

```
┌───────────────────────────────────────────────┐
│  Booking Terbaru                  [Lihat Semua]│
│  ──────────────────────────────────────────────│
│  Budi Santoso        Unair         [PENDING]   │
│  Siti Rahayu         ITS           [DP VERIF.] │
│  Ahmad Fauzi         UB            [PENDING]   │
└───────────────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `bookings` | `array<Booking>` | `[]` | ✅ | Subset booking terbaru, diurutkan berdasarkan `createdAt` menurun |
| `maxItems` | `number` | `5` | ❌ | Jumlah baris yang ditampilkan |
| `onViewAll` | `function` | — | ✅ | Callback tombol "Lihat Semua", navigasi ke `database.html` |
| `onItemClick` | `function` | `null` | ❌ | Callback membuka detail satu booking |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Ada data | Daftar ringkas tampil, masing-masing baris memakai **Badge** (§3.3) untuk status |
| `empty` | `bookings.length === 0` | **Empty State** varian "no-booking" (§3.5) |
| `loading` | Data belum siap | **Loading Skeleton** varian `text-line`, beberapa baris |

**Aturan Pemakaian**
- Widget ini hanya untuk **preview** — tidak menyediakan aksi ubah status di sini; klik item harus membuka detail penuh atau mengarah ke `database.html`

---

### 8.4 Status Widget

**Deskripsi**
Panel breakdown visual jumlah booking per status secara menyeluruh (bukan hanya hari ini seperti **Summary Card** §8.1) — representasi proporsi tiap tahap alur bisnis.

**Kapan Digunakan**
- Bagian atas dashboard `admin.html`, memberi gambaran cepat "di tahap mana mayoritas booking saat ini berada"

**Anatomi**

```
┌─────────────────────────────────────────────────────┐
│  Distribusi Status Booking                          │
│  ──────────────────────────────────────────────────  │
│  PENDING        ████░░░░░░░░░░░░░░░░░░  18%  (45)   │
│  DP VERIFIED    ███████░░░░░░░░░░░░░░░  28%  (70)   │
│  QR GENERATED   ███░░░░░░░░░░░░░░░░░░░  12%  (30)   │
│  IN QUEUE       █░░░░░░░░░░░░░░░░░░░░░   4%  (10)   │
│  IN PROGRESS    █░░░░░░░░░░░░░░░░░░░░░   2%   (5)   │
│  COMPLETED      ███████████░░░░░░░░░░░  34%  (85)   │
│  CANCELLED      ░░░░░░░░░░░░░░░░░░░░░░   2%   (5)   │
└─────────────────────────────────────────────────────┘
```

**Props**

| Prop | Tipe | Default | Wajib | Deskripsi |
|---|---|---|---|---|
| `distribution` | `array<{status, count, percentage}>` | — | ✅ | Breakdown lengkap seluruh status booking yang ada di sistem |
| `totalCount` | `number` | — | ✅ | Total seluruh booking, untuk konteks persentase |
| `onBarClick` | `function` | `null` | ❌ | Callback klik satu bar status, navigasi ke `database.html` dengan filter terkait |

**State**

| State | Trigger | Perilaku Visual |
|---|---|---|
| `default` | Data tersedia | Bar horizontal proporsional, warna mengikuti **Badge** (§3.3) |
| `loading` | Data belum siap | **Loading Skeleton** varian card |
| `single-status-dominant` | Satu status >70% dari total | Tidak ada perlakuan visual khusus — murni representasi data, tidak menyembunyikan proporsi kecil |

**Aturan Pemakaian**
- Urutan baris selalu mengikuti urutan alur status (`pending` → ... → `completed`, dengan `cancelled` di posisi terakhir) — bukan diurutkan dari jumlah terbesar, agar tetap mencerminkan funnel proses
- Komponen ini menjadi dasar utama kebutuhan **Laporan & Analitik** di masa depan (`SOP_FLOW.md` §9.4) — lihat juga §14 Future Components

---

## 9. Component Naming Convention

Konsistensi nama adalah dasar agar dokumen ini tetap berguna saat tim bertambah. Seluruh aturan di bawah **wajib** diikuti untuk komponen baru.

### 9.1 Nama Komponen (Dokumentasi & Kode)

```
ATURAN: PascalCase, kata benda deskriptif, urutan [Domain/Bentuk] + [Jenis]

✅ BENAR              ❌ SALAH               ALASAN
BookingCard           CardBooking            Bentuk (Card) di akhir, bukan di depan
QueueCard             AntrianCard            Nama komponen selalu Bahasa Inggris
StatisticCard         StatCard, StatsCard    Jangan singkat tidak konsisten
ButtonPrimary         PrimaryButton,         Pilih satu pola dan konsisten —
                      BtnPrimary             HSGMS memakai [Bentuk]+[Varian]
```

> **Catatan:** Deskripsi/prosa di dalam dokumen ini ditulis Bahasa Indonesia (selaras `SOP_FLOW.md`, `UI_GUIDELINE.md`, `DATABASE_SCHEMA.md`), namun **nama komponen, prop, dan state selalu Bahasa Inggris** agar konsisten dengan penamaan field Firebase (`fullName`, `dpAmount`, dst.).

### 9.2 Penamaan File Implementasi

```
Komponen           →  File (jika dipisah sebagai partial/snippet)
─────────────────────────────────────────────────────────
BookingCard         →  booking-card.html / booking-card.js
QueueCard           →  queue-card.html / queue-card.js
ButtonPrimary       →  button-primary.js

ATURAN: kebab-case, identik dengan nama komponen yang di-PascalCase-kan.
```

### 9.3 Penamaan CSS Class

HSGMS memakai konvensi terinspirasi **BEM** dengan prefix wajib `hsg-` untuk menghindari konflik dengan library eksternal:

```
.hsg-[block]                  → komponen itu sendiri
.hsg-[block]__[element]       → bagian di dalam komponen
.hsg-[block]--[modifier]      → varian struktural komponen (ditentukan saat render)
.is-[state]                   → state yang di-toggle oleh JavaScript saat runtime

CONTOH — Booking Card:
.hsg-booking-card                     → kartu itu sendiri
.hsg-booking-card__header             → bagian header
.hsg-booking-card__badge              → badge status di dalamnya
.hsg-booking-card--compact            → varian compact (modifier struktural)
.hsg-booking-card.is-loading          → state loading (class state, bukan modifier)
.hsg-booking-card.is-selected         → state terpilih
```

**Mengapa dipisah `--modifier` vs `.is-state`:** modifier (`--`) menentukan **varian** yang dipilih sejak komponen di-render (tidak berubah tanpa re-render), sedangkan `.is-` menentukan **kondisi sementara** yang ditoggle JavaScript tanpa re-render penuh (hover, loading, error, selected).

### 9.4 Penamaan Data Attribute (JS Hook)

```
data-component="booking-card"      → penanda jenis komponen untuk query JS
data-booking-id="{bookingId}"      → penanda data spesifik (bukan untuk styling)
data-status="dp_verified"          → mencerminkan nilai status mentah dari Firebase
```

### 9.5 Penamaan Props/Parameter

```
ATURAN UMUM     : camelCase, sama dengan konvensi field Firebase
                  (DATABASE_SCHEMA.md §4 — fullName, dpAmount, qrGeneratedAt)

BOOLEAN PROPS   : selalu prefix is/has
                  ✅ isLoading, isDisabled, hasError, isSelected
                  ❌ loading, disabled, error, selected (ambigu — bisa disangka noun)

EVENT/CALLBACK  : selalu prefix on + Verb
                  ✅ onConfirm, onCancel, onViewDetail, onSearch
                  ❌ confirmHandler, cancelFn, viewDetailClick

LABEL TURUNAN   : field yang sudah diformat untuk tampilan memakai suffix Label
                  ✅ dpAmountLabel ("Rp 150.000")  vs  dpAmount (150000, raw)
                  ✅ graduationDateLabel ("15 Juli 2025") vs graduationDate ("2025-07-15", raw)
```

### 9.6 Penamaan Status & Enum

```
NILAI INTERNAL (disimpan ke Firebase)   →  snake_case, lowercase
                                            pending, dp_verified, qr_generated,
                                            checked_in, in_queue, in_progress,
                                            completed, cancelled
                                            (sesuai DATABASE_SCHEMA.md §4)

LABEL TAMPILAN (dirender ke Badge)      →  UPPERCASE, dipisah spasi
                                            "PENDING", "DP VERIFIED", "QR GENERATED"
                                            (sesuai UI_GUIDELINE.md §20.3 — bukan underscore)
```

---

## 10. Reusable Rule

Aturan di bawah ini menentukan **bagaimana** komponen di dokumen ini boleh — dan tidak boleh — dipakai ulang di berbagai halaman.

### 10.1 Satu Sumber Kebenaran (Single Source of Truth)

```
SETIAP komponen punya SATU definisi yang dipakai oleh KEEMPAT halaman.

❌ SALAH:
  admin.html punya versi Badge sendiri dengan warna sedikit berbeda
  database.html punya versi Badge lain dengan ukuran sedikit berbeda

✅ BENAR:
  Satu definisi Badge, dipakai apa adanya di admin.html, database.html,
  hasilpembayaran.html, dan booking.html — tanpa fork, tanpa override
  warna/ukuran per halaman.
```

### 10.2 Komposisi, Bukan Duplikasi

Komponen kompleks **wajib** disusun dari komponen yang lebih kecil yang sudah ada di dokumen ini, bukan dibangun ulang dari nol:

```
BookingCard (§7.1)  =  Card (§3.2)
                        + Badge (§3.3)           ← status
                        + ButtonSecondary (§4.2)  ← "Lihat Detail"
                        + ButtonPrimary (§4.1)    ← aksi sesuai status

ConfirmDialog (§5.4) =  Modal (§5.3) varian size "sm"
                        + ButtonGhost (§4.3)      ← "Kembali"
                        + ButtonDanger (§4.4)     ← "Ya, Batalkan"
```

Jika sebuah halaman butuh tampilan yang "sedikit berbeda", solusinya adalah **menambah prop** pada komponen yang sudah ada — bukan membuat komponen baru yang 90% mirip.

### 10.3 Token-Only Styling

```
❌ DILARANG: nilai warna/spacing/radius/shadow ditulis manual di luar token
             (mis. "#2563EB" langsung, padding "17px" sembarang)

✅ WAJIB   : semua nilai visual merujuk token di UI_GUIDELINE.md
             (--p-600, --space-5, --r-2xl, --sh-md, dst.)
```

Dokumen ini sengaja **tidak** mendefinisikan ulang nilai token — setiap kali komponen menyebut warna/spacing, itu adalah referensi ke `UI_GUIDELINE.md`, bukan nilai baru.

### 10.4 Tidak Ada Varian Khusus Per Halaman

```
Jika admin.html butuh BookingCard versi ringkas → tambahkan prop "isCompact"
pada BookingCard yang sudah ada.

JANGAN membuat "BookingCardAdmin" atau "BookingCardCompactForDatabasePage".
```

### 10.5 Aturan Satu Primary Button Berlaku di Level Komponen

Aturan "maksimal satu Primary Button per section" (`UI_GUIDELINE.md` §5.6) bukan hanya panduan desain — ini adalah **kontrak komponen**. Setiap komponen komposit (Card, Modal, Section Header) yang memiliki `footerActions`/`actionSlot` hanya boleh menerima **satu** instance `ButtonPrimary` di dalamnya.

### 10.6 Perubahan Komponen = Perubahan Terdokumentasi

```
Jika sebuah prop komponen perlu diubah secara breaking (mis. mengubah tipe
data atau menghapus prop yang sudah dipakai):

1. Update definisi komponen di dokumen ini
2. Catat di Changelog (lihat bagian akhir dokumen)
3. Audit seluruh halaman yang memakai komponen tersebut sebelum deploy
```

---

## 11. Accessibility Guideline

HSGMS dipakai oleh dua audiens dengan kebutuhan berbeda — client (sekali pakai, sering dari HP, kadang gugup mengisi form) dan admin (dipakai berulang setiap hari, butuh efisiensi). Aksesibilitas yang baik membantu **keduanya**.

### 11.1 Kontras Warna

- Seluruh pasangan teks/background di komponen ini mengikuti palet `UI_GUIDELINE.md` §2 yang sudah dirancang memenuhi kontras minimum WCAG AA (4.5:1 untuk teks body)
- Tidak pernah menempatkan teks putih di atas background terang, atau teks gelap di atas background gelap (`UI_GUIDELINE.md` §20.4)

### 11.2 Tidak Bergantung pada Warna Saja

- **Badge** (§3.3) selalu menyertakan teks label, tidak pernah hanya warna/titik tanpa keterangan
- Status final (`completed`/`cancelled`) tidak hanya dibedakan lewat warna hijau/merah — label teksnya juga eksplisit berbeda

### 11.3 Icon dan Label

- Aksi penting (Primary/Secondary/Danger Button) **selalu** memiliki label teks, tidak pernah icon-only (`UI_GUIDELINE.md` §4.3)
- Komponen icon-only yang diizinkan (**Floating Action Button** §4.5, icon aksi di **Table** §3.1) **wajib** memiliki `aria-label`/`tooltipLabel` yang jelas
- Tooltip pada icon button selalu muncul saat hover **dan** saat fokus keyboard, tidak hanya hover mouse

### 11.4 Form Accessibility

- Setiap **Text Input**, **Select**, **Textarea**, dll. memiliki label yang terhubung secara programatik (`for`/`id` atau `aria-labelledby`) — label bukan sekadar teks visual yang berdiri sendiri
- `isRequired` pada field form harus tercermin sebagai `aria-required="true"`, tidak hanya tanda bintang visual
- `errorText` terhubung ke field terkait via `aria-describedby`, dan field error mendapat `aria-invalid="true"`
- Error muncul setelah blur (§2.1) agar tidak mengganggu screen reader saat user masih mengetik

### 11.5 Modal & Dialog

- **Modal** (§5.3) dan **Confirm Dialog** (§5.4) memakai `role="dialog"` dan `aria-modal="true"`, dengan `aria-labelledby` mengarah ke judul modal
- Fokus terkunci di dalam modal selama terbuka (focus trap) — Tab tidak boleh "lolos" ke konten di belakang backdrop
- Saat modal ditutup, fokus keyboard dikembalikan ke elemen yang membuka modal tersebut
- Esc selalu menutup modal, **kecuali** pada modal aksi kritis yang backdrop-nya terkunci (§5.3 state `locked`) — namun tombol close tetap harus dapat dijangkau via keyboard

### 11.6 Toast & Live Region

- **Toast** (§5.1) memakai `aria-live="polite"` untuk varian success/info, dan `aria-live="assertive"` untuk varian error — selaras dengan aturan toast error tidak auto-dismiss

### 11.7 Tabel

- **Table** (§3.1) memakai elemen header tabel yang benar (`<th scope="col">`), bukan sekadar `<div>` yang diberi gaya seperti header
- Kolom yang dapat di-sort memiliki indikator `aria-sort` yang berubah sesuai arah pengurutan saat ini

### 11.8 Target Sentuh & Keyboard

- Target sentuh minimum 40×40px untuk semua elemen interaktif (selaras tinggi tombol `md` di `UI_GUIDELINE.md` §5.2) — penting karena banyak interaksi admin terjadi di tablet saat hari H
- Seluruh komponen interaktif dapat dijangkau dan dioperasikan murni dengan keyboard, dalam urutan Tab yang logis (mengikuti urutan visual)
- **Select** (§2.2) dapat dioperasikan dengan tombol panah atas/bawah selain klik mouse

### 11.9 Gerak dan Animasi

- Seluruh animasi (§15 `UI_GUIDELINE.md`) menghormati `prefers-reduced-motion` — durasi dipotong ke maksimal 100ms atau dihilangkan sama sekali bagi user yang mengaktifkan preferensi ini di sistem operasinya

---

## 12. Component Hierarchy

Komponen di dokumen ini tersusun dalam 5 level — level lebih rendah tidak boleh bergantung pada level lebih tinggi (mencegah dependensi melingkar).

```
╔════════════════════════════════════════════════════════════════╗
║  LEVEL 4 — PAGES                                                ║
║  booking.html · admin.html · database.html · hasilpembayaran.html
╚════════════════════════════════════▲═════════════════════════════╝
                                       │ disusun dari
╔════════════════════════════════════╧═════════════════════════════╗
║  LEVEL 3 — LAYOUT ASSEMBLY                                       ║
║  Navbar + Sidebar + ContentWrapper + Footer                      ║
║  (kerangka tiap halaman, §1)                                     ║
╚════════════════════════════════════▲═════════════════════════════╝
                                       │ membungkus
╔════════════════════════════════════╧═════════════════════════════╗
║  LEVEL 2 — DOMAIN COMPONENTS                                      ║
║  BookingCard · PaymentCard · QRCard · CustomerCard (§7)           ║
║  QueueCard · StudioCard · CurrentQueue · NextQueue (§6)           ║
║  SummaryCard · ActivityTimeline · RecentBooking · StatusWidget (§8)║
╚════════════════════════════════════▲═════════════════════════════╝
                                       │ mengkomposisikan
╔════════════════════════════════════╧═════════════════════════════╗
║  LEVEL 1 — COMPOSITE COMPONENTS (MOLECULES)                       ║
║  Card · Table · Modal · Toast · Alert · ConfirmDialog             ║
║  EmptyState · LoadingSkeleton · SectionHeader (§3, §5)             ║
╚════════════════════════════════════▲═════════════════════════════╝
                                       │ dibangun dari
╔════════════════════════════════════╧═════════════════════════════╗
║  LEVEL 0 — PRIMITIVES                                             ║
║  ButtonPrimary/Secondary/Ghost/Danger/FAB (§4)                    ║
║  Badge · ProgressIndicator (§3, §5)                                ║
║  TextInput · Select · Textarea · UploadArea ·                    ║
║  SearchBox · DatePicker · PhoneInput (§2)                          ║
╚════════════════════════════════════▲═════════════════════════════╝
                                       │ diwarnai/diukur oleh
╔════════════════════════════════════╧═════════════════════════════╗
║  LEVEL -1 — DESIGN TOKENS  (UI_GUIDELINE.md — bukan komponen)     ║
║  Warna · Tipografi · Spacing · Radius · Shadow · Animasi           ║
╚════════════════════════════════════════════════════════════════╝
```

**Aturan Arah Dependensi**

- Level 0 **tidak boleh** mengetahui/memanggil Level 1, 2, 3, atau 4 (Primitif bersifat generik, tidak tahu konteks bisnis)
- Level 2 (Domain Components) **boleh** memanggil Level 1 dan Level 0, tapi Level 1 **tidak boleh** memanggil Level 2
- Hanya Level 3 (Layout Assembly) dan Level 4 (Pages) yang boleh tahu nama field Firebase spesifik secara langsung dari `DATABASE_SCHEMA.md` — Level 0 dan Level 1 hanya menerima data yang sudah diformat lewat props generik (`label`, `value`, dll.)

---

## 13. Component Tree

Pohon komponen berikut menunjukkan komposisi nyata di setiap halaman — diagram ini adalah "peta perakitan" saat developer mengimplementasikan halaman dari komponen-komponen di dokumen ini.

### 13.1 booking.html

```
booking.html
├── Navbar (pageContext="client")
├── ContentWrapper (maxWidth="720px", paddingPreset="form")
│   ├── SectionHeader ("Booking Foto Wisuda HS Studio")
│   ├── Card
│   │   ├── (Form Section — Data Diri Client)
│   │   │   ├── TextInput          → fullName
│   │   │   ├── PhoneInput          → phoneNumber
│   │   │   ├── TextInput          → universityName
│   │   │   ├── TextInput          → facultyName
│   │   │   ├── TextInput          → studyProgram
│   │   │   ├── DatePicker         → graduationDate
│   │   │   └── Textarea           → notes (opsional)
│   │   ├── (Form Section — Pembayaran DP)
│   │   │   └── UploadArea         → transferProofUrl
│   │   └── ButtonPrimary ("Submit Booking")
│   └── (setelah submit sukses) Alert (variant="success")
│        + QRCard tidak tampil di sini (QR baru ada setelah DP diverifikasi admin)
└── Footer
```

### 13.2 admin.html

```
admin.html
├── Navbar (pageContext="admin", notificationCount, userName)
├── Sidebar (activeRoute="admin")
├── ContentWrapper (hasSidebar=true)
│   ├── SectionHeader ("Dashboard Admin", actionSlot: ButtonPrimary "+ Booking Manual")
│   ├── (Dashboard Row)
│   │   ├── StatisticCard × N        (Total Booking, Hari Ini, dst.)
│   │   ├── StatusWidget
│   │   ├── SummaryCard
│   │   ├── RecentBooking
│   │   └── ActivityTimeline
│   ├── (Tab/Section — Verifikasi DP)
│   │   └── BookingCard × N  (status="pending")
│   │        ├── Badge
│   │        ├── ButtonSecondary ("Lihat Detail")
│   │        └── ButtonPrimary ("Konfirmasi DP")
│   ├── (Modal — dipanggil dari aksi di atas)
│   │   ├── Modal (size="md", title="Detail Booking")
│   │   │   ├── CustomerCard (isCompact=true)
│   │   │   ├── PaymentCard
│   │   │   ├── QRCard
│   │   │   └── ConfirmDialog (dipanggil dari ButtonDanger)
│   ├── (Panel — Hari H / Antrian)
│   │   ├── StudioCard × N
│   │   ├── CurrentQueue
│   │   ├── NextQueue
│   │   ├── QueueCard × N
│   │   └── FloatingActionButton ("Panggil Antrian Berikutnya", mobile only)
│   └── Toast (layer global, muncul di atas semua konten)
└── Footer (opsional)
```

### 13.3 database.html

```
database.html
├── Navbar (pageContext="admin")
├── Sidebar (activeRoute="database")
├── ContentWrapper (hasSidebar=true)
│   ├── SectionHeader ("Database Booking")
│   ├── (Filter Bar)
│   │   ├── SearchBox       → cari nama/nomor booking
│   │   ├── Select          → filter status
│   │   └── DatePicker      → filter tanggal wisuda
│   ├── Table (desktop/tablet)
│   │   ├── Badge            (kolom status)
│   │   └── (actionsColumn: Eye, Pencil, Trash2 icon buttons)
│   ├── BookingCard × N (mobile <768px, pengganti Table — §16.4 UI_GUIDELINE)
│   ├── EmptyState (context="no-search-result" / "no-filter-result")
│   └── LoadingSkeleton (shape="table-row", saat data dimuat)
└── Footer
```

### 13.4 hasilpembayaran.html

```
hasilpembayaran.html
├── Navbar (pageContext="admin")
├── Sidebar (activeRoute="hasilpembayaran")
├── ContentWrapper (hasSidebar=true)
│   ├── SectionHeader ("Rekap Pembayaran")
│   ├── SearchBox  → cari booking by nama/ID
│   ├── (Grid 2 kolom desktop / 1 kolom mobile — §16.3 UI_GUIDELINE)
│   │   ├── CustomerCard (isCompact=true)
│   │   └── PaymentCard
│   │        └── (onViewProof) → Modal preview bukti transfer
│   └── EmptyState (context="no-payment-history")
└── Footer
```

---

## 14. Future Components

Komponen berikut **belum diimplementasikan** — namanya direservasi terlebih dahulu di dokumen ini agar tidak terjadi konflik penamaan saat fitur terkait benar-benar dibangun. Setiap item di bawah mengacu langsung ke kebutuhan yang sudah tertulis di `SOP_FLOW.md` §9 (Future Improvement) dan `DATABASE_SCHEMA.md` §11 (Future Scalability).

| Komponen (Reserved) | Terkait Kebutuhan | Sumber |
|---|---|---|
| `NotificationLog` | Riwayat notifikasi WhatsApp otomatis (booking masuk, DP terkonfirmasi, reminder H-1) | `SOP_FLOW.md` §9.1 |
| `QueueDisplayBoard` | Layar besar ruang tunggu yang menampilkan nomor antrian sedang dipanggil, versi "jarak jauh" dari **Current Queue** (§6.3) | `SOP_FLOW.md` §9.2 |
| `SelfCheckinKiosk` | Tampilan kiosk/tablet untuk client scan QR sendiri tanpa dibantu admin | `SOP_FLOW.md` §9.3 |
| `AnalyticsChart` | Grafik laporan (revenue DP, durasi rata-rata sesi, studio paling sering dipakai, tingkat pembatalan) — melengkapi **Status Widget** (§8.4) yang sifatnya masih ringkasan, bukan tren historis | `SOP_FLOW.md` §9.4 |
| `GraduationEventTabs` | Navigasi multi-event wisuda/multi-angkatan berjalan bersamaan | `SOP_FLOW.md` §9.5, `DATABASE_SCHEMA.md` §11.2 |
| `AdminLoginForm` | Form otentikasi admin (saat ini sistem belum memakai login) | `SOP_FLOW.md` §9.6, `DATABASE_SCHEMA.md` §11.3 |
| `RoleBadge` | Penanda peran admin (Admin Verifikasi / Admin Operasional / Petugas Hari H — `SOP_FLOW.md` §3.1) setelah otentikasi berbasis role tersedia | `SOP_FLOW.md` §9.6 |
| `InvoiceReceiptCard` | Struk digital pelunasan sisa pembayaran, dapat dicetak/dikirim ke client | `SOP_FLOW.md` §9.7 |
| `AuditHistoryTimeline` | Riwayat lengkap perubahan status per booking (sub-node `history`), berbeda dari **Activity Timeline** (§8.2) yang bersifat global lintas booking — ini spesifik per satu booking | `DATABASE_SCHEMA.md` §11.4 |
| `StudioCapacityManager` | Panel kelola master data studio (tambah/nonaktifkan studio) — melengkapi **Studio Card** (§6.2) yang saat ini hanya menampilkan, bukan mengelola | `DATABASE_SCHEMA.md` §11.1 |

> **Catatan:** Komponen di atas sengaja **tidak** diberi spesifikasi props/state penuh — itu baru ditentukan saat fitur terkait resmi masuk roadmap sprint. Tujuan tabel ini murni mencegah dua orang developer membuat dua komponen berbeda dengan nama yang sama untuk kebutuhan yang sama di masa depan.

---

## Changelog

| Versi | Tanggal | Perubahan | Penulis |
|---|---|---|---|
| `1.0.0` | 2026-06-29 | Inisialisasi `COMPONENT_LIBRARY.md` — 40 komponen lintas 8 kategori, naming convention, reusable rule, accessibility guideline, component hierarchy & tree, future components | Senior Frontend System Architect |

---

*Dokumen ini adalah spesifikasi komponen resmi untuk seluruh antarmuka HSGMS.*
*Dokumen ini tidak berisi kode — implementasi HTML/CSS/JS merujuk ke spesifikasi ini dan token di `UI_GUIDELINE.md`.*
*Setiap komponen baru yang dibutuhkan suatu halaman harus didokumentasikan di sini terlebih dahulu sebelum diimplementasikan.*

*HS Studio Graduation Management System — Internal Document*
*Dilarang disebarluaskan tanpa izin manajemen HS Studio.*
