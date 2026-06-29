# UI_GUIDELINE.md

## HS Studio Graduation Management System (HSGMS)
### User Interface & Design System Guidelines

> **Scope:** Panduan desain menyeluruh untuk seluruh halaman HSGMS.
> Semua halaman — `booking.html`, `admin.html`, `database.html`, `hasilpembayaran.html` —
> harus tampil sebagai **satu software yang konsisten**, bukan empat website berbeda.
>
> **Audience:** Frontend developer, UI designer, dan contributor HSGMS.
>
> **Versi:** 1.0.0 — 2025-06-29

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Icon Guideline](#4-icon-guideline)
5. [Button Guideline](#5-button-guideline)
6. [Form Guideline](#6-form-guideline)
7. [Card Guideline](#7-card-guideline)
8. [Table Guideline](#8-table-guideline)
9. [Modal Guideline](#9-modal-guideline)
10. [Toast Notification](#10-toast-notification)
11. [Loading State](#11-loading-state)
12. [Empty State](#12-empty-state)
13. [Error State](#13-error-state)
14. [Success State](#14-success-state)
15. [Animation Guideline](#15-animation-guideline)
16. [Responsive Rule](#16-responsive-rule)
17. [Spacing System](#17-spacing-system)
18. [Border Radius](#18-border-radius)
19. [Shadow System](#19-shadow-system)
20. [UI Consistency Rule](#20-ui-consistency-rule)
21. [Changelog](#21-changelog)

---

## 1. Design Philosophy

### 1.1 Prinsip Utama

HSGMS dirancang di atas **empat pilar desain** yang tidak boleh dikompromikan:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│   │   CLARITY   │  │  EFFICIENCY │  │ CONSISTENCY │  │  TRUST   │ │
│   │             │  │             │  │             │  │          │ │
│   │  Setiap     │  │  Admin &    │  │  Semua      │  │  Visual  │ │
│   │  elemen     │  │  operator   │  │  halaman    │  │  yang    │ │
│   │  punya      │  │  harus bisa │  │  terasa     │  │  meyakini│ │
│   │  tujuan     │  │  kerja      │  │  seperti    │  │  klien   │ │
│   │  yang jelas │  │  cepat      │  │  satu app   │  │  percaya │ │
│   └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Design Language

**Modern Glassmorphism — Ringan & Profesional**

Gaya visual HSGMS menggunakan glassmorphism **secara selektif** — bukan berlebihan. Kaca/frosted effect hanya pada elemen yang perlu menonjol (card, modal, sidebar), sementara elemen fungsional (tabel, form field) tetap bersih dan solid.

```
  Prinsip Glassmorphism HSGMS:

  ✅ GUNAKAN pada:          ❌ HINDARI pada:
  ─────────────────────     ────────────────────
  • Card utama              • Form input field
  • Modal/Dialog            • Tabel data
  • Sidebar/Navbar          • Tombol aksi utama
  • Stats widget            • Text label
  • Header section          • Error message
```

### 1.3 Design Tone

| Dimensi | Nilai |
|---|---|
| **Mood** | Profesional, bersih, terpercaya |
| **Energy** | Tenang namun responsif |
| **Audience Feel** | "Software buatan studio yang serius" |
| **Referensi** | Linear, Notion, Vercel Dashboard |

### 1.4 Larangan Desain

```
  ❌ DILARANG KERAS:

  • Warna neon / terlalu terang yang menyiksa mata
  • Font serif pada UI komponen (hanya untuk judul dekoratif)
  • Animasi yang berlama-lama (> 400ms tanpa alasan)
  • Gradien yang terlalu ramai (lebih dari 3 warna)
  • Border yang terlalu tebal (> 2px pada komponen biasa)
  • Icon tanpa label pada aksi penting
  • Warna merah pada elemen selain error/hapus
  • Underline pada teks yang bukan hyperlink
```

---

## 2. Color Palette

### 2.1 Primary Palette

```
  ┌──────────────────────────────────────────────────────────────────┐
  │  PRIMARY — Biru Tinta (Brand HS Studio)                          │
  ├────────────┬──────────────┬────────────────────────────────────  │
  │  Swatch    │  Token       │  Nilai & Penggunaan                  │
  ├────────────┼──────────────┼────────────────────────────────────  │
  │  ████████  │  --p-900     │  #0F2A4A   Teks heading gelap        │
  │  ████████  │  --p-800     │  #1A3D6E   Sidebar aktif, strong UI  │
  │  ████████  │  --p-700     │  #1E4F8C   Button primary hover      │
  │  ████████  │  --p-600     │  #2563EB   Button primary default    │
  │  ████████  │  --p-500     │  #3B82F6   Link, icon aktif          │
  │  ████████  │  --p-400     │  #60A5FA   Border focus, highlight   │
  │  ████████  │  --p-200     │  #BFDBFE   Badge background          │
  │  ████████  │  --p-100     │  #DBEAFE   Surface ringan            │
  │  ████████  │  --p-50      │  #EFF6FF   Background tint           │
  └────────────┴──────────────┴────────────────────────────────────  ┘
```

### 2.2 Neutral Palette

```
  ┌──────────────────────────────────────────────────────────────────┐
  │  NEUTRAL — Abu Slate (Teks & Surface)                            │
  ├────────────┬──────────────┬────────────────────────────────────  │
  │  ████████  │  --n-950     │  #0C1524   Teks utama (body)         │
  │  ████████  │  --n-800     │  #1E293B   Heading sekunder          │
  │  ████████  │  --n-600     │  #475569   Teks placeholder          │
  │  ████████  │  --n-400     │  #94A3B8   Teks disabled, hint       │
  │  ████████  │  --n-200     │  #E2E8F0   Border default            │
  │  ████████  │  --n-100     │  #F1F5F9   Background field          │
  │  ████████  │  --n-50      │  #F8FAFC   Background halaman        │
  │  ████████  │  --n-0       │  #FFFFFF   Card, modal surface       │
  └────────────┴──────────────┴────────────────────────────────────  ┘
```

### 2.3 Semantic / Status Colors

```
  ┌──────────────────────────────────────────────────────────────────┐
  │  STATUS COLORS                                                    │
  ├────────────┬──────────────┬────────────────────────────────────  │
  │            │  SUCCESS     │                                       │
  │  ████████  │  --s-600     │  #16A34A   Teks sukses               │
  │  ████████  │  --s-500     │  #22C55E   Icon sukses               │
  │  ████████  │  --s-100     │  #DCFCE7   Background badge sukses   │
  │            │              │                                       │
  │            │  WARNING     │                                       │
  │  ████████  │  --w-600     │  #D97706   Teks peringatan           │
  │  ████████  │  --w-400     │  #FBBF24   Icon peringatan           │
  │  ████████  │  --w-100     │  #FEF3C7   Background badge warning  │
  │            │              │                                       │
  │            │  DANGER      │                                       │
  │  ████████  │  --d-700     │  #B91C1C   Teks error kuat           │
  │  ████████  │  --d-500     │  #EF4444   Icon error, tombol hapus  │
  │  ████████  │  --d-100     │  #FEE2E2   Background badge error    │
  │            │              │                                       │
  │            │  INFO        │                                       │
  │  ████████  │  --i-600     │  #0284C7   Teks info                 │
  │  ████████  │  --i-100     │  #E0F2FE   Background badge info     │
  └────────────┴──────────────┴────────────────────────────────────  ┘
```

### 2.4 Booking Status Colors

Setiap status booking memiliki warna badge yang konsisten di seluruh halaman:

```
  STATUS          BACKGROUND    TEXT COLOR    BORDER
  ──────────────────────────────────────────────────
  PENDING         #FEF3C7       #D97706       #FDE68A
  DP_VERIFIED     #EFF6FF       #2563EB       #BFDBFE
  QR_GENERATED    #F0FDF4       #16A34A       #BBF7D0
  CHECKED_IN      #F5F3FF       #7C3AED       #DDD6FE
  IN_QUEUE        #FFF7ED       #EA580C       #FED7AA
  IN_PROGRESS     #EFF6FF       #0284C7       #BAE6FD
  COMPLETED       #F0FDF4       #15803D       #86EFAC
  CANCELLED       #FEF2F2       #991B1B       #FECACA
```

### 2.5 Glassmorphism Surface

```
  GLASS CARD (Light Mode):
  ─────────────────────────────────────────────────
  background   : rgba(255, 255, 255, 0.72)
  backdrop     : blur(16px) saturate(180%)
  border       : 1px solid rgba(255, 255, 255, 0.45)
  shadow       : lihat Shadow System §19
```

---

## 3. Typography

### 3.1 Font Stack

```
  FONT UTAMA (UI):
  font-family: 'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;

  FONT MONOSPACE (ID / Kode / Timestamp):
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

> **Sumber font:** Google Fonts (Inter + Plus Jakarta Sans). Load hanya weight yang dibutuhkan untuk performa optimal.

### 3.2 Type Scale

```
  TOKEN         SIZE    LINE-H  WEIGHT   PENGGUNAAN
  ──────────────────────────────────────────────────────────────────
  --text-xs     11px    16px    400      Label terkecil, hint, meta
  --text-sm     13px    20px    400      Body kecil, tabel cell
  --text-base   15px    24px    400      Body utama, form label
  --text-md     16px    26px    500      Subtitle, nav item
  --text-lg     18px    28px    600      Card title, section header
  --text-xl     22px    32px    700      Page title sekunder
  --text-2xl    28px    36px    700      Page title utama
  --text-3xl    36px    44px    800      Hero / landing heading
```

### 3.3 Font Weight

```
  400  Regular   → Body teks, deskripsi, placeholder
  500  Medium    → Label form, nav item, tab aktif
  600  Semibold  → Card title, tombol, badge
  700  Bold      → Page heading, stat angka besar
  800  Extrabold → Hero title (jarang digunakan)
```

### 3.4 Contoh Hierarki Visual

```
  ┌──────────────────────────────────────────────────────────┐
  │                                                          │
  │  Manajemen Booking Wisuda              [28px / 700]      │
  │  ──────────────────────────────────────────────          │
  │  Kelola semua booking foto wisuda HS Studio  [15px/400]  │
  │                                                          │
  │  ┌────────────────────────────────────────────────┐      │
  │  │                                                │      │
  │  │  Budi Santoso                   [18px / 600]   │      │
  │  │  Universitas Airlangga          [15px / 400]   │      │
  │  │  Booking: -O_xK2mL...           [11px / 400]   │      │
  │  │  (monospace)                                   │      │
  │  │                                                │      │
  │  └────────────────────────────────────────────────┘      │
  │                                                          │
  └──────────────────────────────────────────────────────────┘
```

### 3.5 Aturan Tipografi

- **Jangan gunakan lebih dari 3 ukuran font** dalam satu card/komponen
- Teks body maksimum **65–75 karakter per baris** untuk keterbacaan optimal
- `color: --n-950` untuk body; `color: --n-600` untuk teks sekunder
- **Jangan italic** pada teks UI kecuali untuk caption/quote
- Teks tombol selalu **Semibold (600)**, tidak pernah Bold (700)

---

## 4. Icon Guideline

### 4.1 Library

```
  UTAMA   : Lucide Icons  (https://lucide.dev)
  UKURAN  : 16px, 20px, 24px  ← hanya tiga ukuran ini

  ✅ Lucide dipilih karena:
  • Konsisten secara visual (stroke 2px)
  • Tersedia sebagai SVG — tidak butuh CDN besar
  • Cocok dengan estetika modern/clean HSGMS
```

### 4.2 Ukuran Icon per Konteks

```
  16px  → Inline icon dalam teks, badge, label kecil
  20px  → Tombol, form field prefix, nav item
  24px  → Header section, card title icon, stat widget
```

### 4.3 Icon + Label Rule

```
  ✅ BENAR — selalu pasangkan icon dengan label pada aksi penting:

  ┌────────────────────┐    ┌──────────────────┐
  │  📄  Lihat Detail  │    │  ✓  Konfirmasi   │
  └────────────────────┘    └──────────────────┘

  ❌ SALAH — icon saja tanpa label pada tombol utama:

  ┌─────┐    ┌─────┐
  │  📄 │    │  ✓  │
  └─────┘    └─────┘
  (Boleh hanya di toolbar compact dengan tooltip)
```

### 4.4 Referensi Icon per Fungsi HSGMS

```
  FUNGSI                  ICON (Lucide)
  ──────────────────────────────────────────────
  Booking baru            ClipboardPlus
  Konfirmasi DP           BadgeCheck
  Generate QR             QrCode
  Scan QR                 ScanLine
  Pilih studio            Clapperboard
  Antrian                 ListOrdered
  Foto selesai            CheckCircle2
  Batalkan booking        XCircle
  Cari / filter           Search
  Export data             Download
  Detail booking          Eye
  Edit                    Pencil
  Hapus                   Trash2
  Notifikasi              Bell
  Client                  UserRound
  Admin                   ShieldCheck
  Tanggal wisuda          GraduationCap
  Pembayaran              Banknote
  Upload bukti            Upload
  WhatsApp kirim          MessageCircle
```

---

## 5. Button Guideline

### 5.1 Hierarki Tombol

```
  LEVEL 1 — PRIMARY (satu per halaman/section)
  ┌──────────────────────────────────────────┐
  │          Konfirmasi DP        [filled]    │
  │   bg: --p-600  |  text: white             │
  │   hover: --p-700  |  radius: 10px         │
  └──────────────────────────────────────────┘

  LEVEL 2 — SECONDARY (aksi penting kedua)
  ┌──────────────────────────────────────────┐
  │          Lihat Detail         [outlined]  │
  │   bg: white  |  border: --p-400           │
  │   text: --p-600  |  hover: --p-50         │
  └──────────────────────────────────────────┘

  LEVEL 3 — GHOST (aksi ringan, di dalam card)
  ┌──────────────────────────────────────────┐
  │          Lihat Riwayat        [ghost]     │
  │   bg: transparent  |  text: --n-600       │
  │   hover: --n-100                          │
  └──────────────────────────────────────────┘

  LEVEL 4 — DANGER (aksi destruktif)
  ┌──────────────────────────────────────────┐
  │          Batalkan Booking     [danger]    │
  │   bg: --d-500  |  text: white             │
  │   hover: --d-700                          │
  └──────────────────────────────────────────┘
```

### 5.2 Ukuran Tombol

```
  SIZE    HEIGHT   PADDING-X   FONT     ICON-SIZE
  ──────────────────────────────────────────────
  sm      32px     12px        13px     16px
  md      40px     16px        15px     20px       ← default
  lg      48px     24px        16px     20px
```

### 5.3 State Tombol

```
  DEFAULT  →  HOVER  →  ACTIVE (pressed)  →  FOCUS  →  DISABLED

  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
  │  Konfirmasi  │   │  Konfirmasi  │   │  Konfirmasi  │
  │  bg: #2563EB │   │  bg: #1E4F8C │   │  opacity:0.5 │
  │  shadow: md  │   │  shadow: lg  │   │  cursor:n-a  │
  └──────────────┘   └──────────────┘   └──────────────┘
   default             hover               disabled
```

### 5.4 Loading State pada Tombol

```
  ┌────────────────────────────────┐
  │   ◌  Menyimpan...              │
  │   (spinner 16px + teks)        │
  └────────────────────────────────┘
  • Tombol disabled saat loading
  • Lebar tombol tidak berubah (fixed width)
  • Spinner menggantikan icon kiri
```

### 5.5 Icon Button (Compact)

```
  Digunakan di dalam tabel atau toolbar:

  ┌──────┐  ┌──────┐  ┌──────┐
  │  👁  │  │  ✏  │  │  🗑  │
  └──────┘  └──────┘  └──────┘
   Lihat     Edit      Hapus
   (tooltip selalu muncul saat hover)
```

### 5.6 Aturan Tombol

- Primary button maksimal **satu per section/form**
- Urutan tombol: **Aksi utama di kanan**, aksi sekunder di kiri
- Tombol danger selalu didahului **konfirmasi modal** sebelum eksekusi
- Jangan gunakan warna selain yang terdefinisi di §2.3 untuk tombol

---

## 6. Form Guideline

### 6.1 Anatomi Form Field

```
  Label Teks *                    ← --text-sm, --n-800, weight 500
  ┌──────────────────────────────────────────────────────┐
  │  📝  Masukkan nama lengkap...                        │  ← height: 44px
  └──────────────────────────────────────────────────────┘
  Teks bantuan atau catatan kecil di sini               ← --text-xs, --n-400

  STATE:
  • Default  : border --n-200, bg --n-100
  • Focus    : border --p-400, bg white, shadow-focus (ring biru tipis)
  • Error    : border --d-500, bg --d-100 tint tipis
  • Disabled : bg --n-100, text --n-400, cursor not-allowed
  • Filled   : border --n-300, bg white
```

### 6.2 Variasi Input

```
  TEXT INPUT
  ┌────────────────────────────────────────────────┐
  │  Budi Santoso                                  │
  └────────────────────────────────────────────────┘

  INPUT WITH ICON PREFIX
  ┌──────────────────────────────────────────────────┐
  │  🔍  Cari nama client...                         │
  └──────────────────────────────────────────────────┘

  INPUT WITH SUFFIX (satuan/action)
  ┌──────────────────────────────────────────┬───────┐
  │  150000                                  │  Rp   │
  └──────────────────────────────────────────┴───────┘

  SELECT / DROPDOWN
  ┌──────────────────────────────────────────┬───────┐
  │  Transfer Bank                           │   ▾   │
  └──────────────────────────────────────────┴───────┘

  TEXTAREA
  ┌────────────────────────────────────────────────┐
  │  Catatan tambahan dari client...               │
  │                                                │
  │                                                │
  └────────────────────────────────────────────────┘
  (min-height: 96px, resize: vertical)

  FILE UPLOAD
  ┌────────────────────────────────────────────────┐
  │                                                │
  │       ↑   Klik atau seret file ke sini         │
  │           JPG, PNG, PDF  •  Maks 5MB           │
  │                                                │
  └────────────────────────────────────────────────┘
  (dashed border --n-200, hover: dashed --p-400)
```

### 6.3 Validasi & Error Inline

```
  Label Nama Lengkap *
  ┌────────────────────────────────────────────────┐
  │                                                │  ← border merah
  └────────────────────────────────────────────────┘
  ⚠  Nama lengkap wajib diisi                     ← --text-xs, --d-600

  • Error muncul setelah blur (bukan saat mengetik)
  • Satu pesan error per field, jelas dan spesifik
  • Jangan "Error" saja — tulis "Nama lengkap wajib diisi"
```

### 6.4 Layout Form

```
  SINGLE COLUMN (default — mobile & form sederhana):
  ┌─────────────────────────────────┐
  │  Nama Lengkap                   │
  │  ┌───────────────────────────┐  │
  │  │                           │  │
  │  └───────────────────────────┘  │
  │  Nomor WhatsApp                 │
  │  ┌───────────────────────────┐  │
  │  │                           │  │
  │  └───────────────────────────┘  │
  └─────────────────────────────────┘

  TWO COLUMN (desktop — form kompleks):
  ┌──────────────────┬──────────────────┐
  │  Nama Lengkap    │  Nomor WhatsApp  │
  │  ┌────────────┐  │  ┌────────────┐  │
  │  │            │  │  │            │  │
  │  └────────────┘  │  └────────────┘  │
  ├──────────────────┴──────────────────┤
  │  Nama Universitas (full width)      │
  │  ┌──────────────────────────────┐   │
  │  │                              │   │
  │  └──────────────────────────────┘   │
  └─────────────────────────────────────┘
```

### 6.5 Form Section Grouping

```
  ╔══════════════════════════════════════════════╗
  ║  Data Diri Client                      [§1]  ║
  ╠══════════════════════════════════════════════╣
  ║  Nama Lengkap *                              ║
  ║  ┌──────────────────────────────────────┐   ║
  ║  │                                      │   ║
  ║  └──────────────────────────────────────┘   ║
  ║                                             ║
  ║  Nomor WhatsApp *        Tanggal Wisuda *   ║
  ║  ┌──────────────┐        ┌──────────────┐  ║
  ║  │              │        │              │  ║
  ║  └──────────────┘        └──────────────┘  ║
  ╠══════════════════════════════════════════════╣
  ║  Informasi Akademik                    [§2]  ║
  ╠══════════════════════════════════════════════╣
  ║  ...                                        ║
  ╚══════════════════════════════════════════════╝
```

---

## 7. Card Guideline

### 7.1 Anatomi Card

```
  ┌─────────────────────────────────────────────────────┐  ← border-radius: 16px
  │                                                     │  ← shadow: md
  │  ┌─── HEADER ───────────────────────────────────┐  │
  │  │  🎓  Budi Santoso            [DP VERIFIED]   │  │
  │  │       Universitas Airlangga                  │  │
  │  └──────────────────────────────────────────────┘  │
  │                                                     │
  │  ┌─── BODY ─────────────────────────────────────┐  │
  │  │  Fakultas    : Ilmu Komputer                 │  │
  │  │  Prodi       : Sistem Informasi              │  │
  │  │  Hari Wisuda : 15 Juli 2025                  │  │
  │  │  DP          : Rp 150.000                    │  │
  │  └──────────────────────────────────────────────┘  │
  │                                                     │
  │  ┌─── FOOTER ───────────────────────────────────┐  │
  │  │  [Lihat Detail]              [Konfirmasi QR] │  │
  │  └──────────────────────────────────────────────┘  │
  │                                                     │
  └─────────────────────────────────────────────────────┘
```

### 7.2 Variasi Card

**Card Statistik (Stats Card)**
```
  ┌───────────────────────────────┐
  │  📋                           │
  │  Total Booking                │
  │                               │
  │  247                          │  ← --text-3xl / bold
  │  ↑ 12 dari bulan lalu         │  ← --text-sm / green
  └───────────────────────────────┘
  (glassmorphism ringan)
```

**Card Antrian (Queue Card)**
```
  ┌──────────────────────────────────────────┐
  │  ANTRIAN  #03           Studio A         │
  │  ──────────────────────────────────────  │
  │  Budi Santoso                            │
  │  Masuk: 09:45                            │
  │                          [IN PROGRESS]   │
  └──────────────────────────────────────────┘
```

**Card Kosong (Placeholder)**
```
  ┌──────────────────────────────────────────┐
  │                                          │
  │          📭                              │
  │     Belum ada booking hari ini           │
  │                                          │
  └──────────────────────────────────────────┘
  (lihat Empty State §12)
```

### 7.3 Aturan Card

```
  padding-internal   : 20px–24px
  gap antar card     : 16px (grid) atau 12px (list)
  hover state        : translateY(-2px) + shadow naik satu level
  active/selected    : border --p-400 2px, bg --p-50
  maksimum lebar     : 480px (standalone) / fluid (dalam grid)
```

---

## 8. Table Guideline

### 8.1 Anatomi Tabel

```
  ┌────────┬──────────────────┬──────────────┬────────────────┬──────────┐
  │   #    │  NAMA CLIENT     │  UNIVERSITAS │  TANGGAL       │  STATUS  │
  ├────────┼──────────────────┼──────────────┼────────────────┼──────────┤
  │  001   │  Budi Santoso    │  Unair       │  15 Jul 2025   │ ██████   │
  ├────────┼──────────────────┼──────────────┼────────────────┼──────────┤
  │  002   │  Siti Rahayu     │  ITS         │  15 Jul 2025   │ ██████   │
  ├────────┼──────────────────┼──────────────┼────────────────┼──────────┤
  │  003   │  Ahmad Fauzi     │  UB          │  22 Jul 2025   │ ██████   │
  └────────┴──────────────────┴──────────────┴────────────────┴──────────┘

  Header row : bg --n-50, text --n-600, --text-xs UPPERCASE, weight 600
  Body row   : bg white, text --n-950, --text-sm
  Row hover  : bg --p-50 (transisi 100ms)
  Stripe     : opsional — row genap bg --n-50/40
  Border     : hanya horizontal, warna --n-100
  Row height : 52px (comfortable), 40px (compact mode)
```

### 8.2 Kolom Aksi

```
  ┌────────────────────────────┬──────────────────────────┐
  │  Ahmad Fauzi               │  👁  ✏  🗑              │
  └────────────────────────────┴──────────────────────────┘
  • Kolom aksi selalu di kanan
  • Icon action muncul saat row di-hover (opacity transition)
  • Lebar kolom aksi: fixed 100–120px
```

### 8.3 Tabel dengan Filter & Pencarian

```
  ┌──────────────────────────────────────────────────────────────────┐
  │  [🔍 Cari nama atau universitas...]   [Status ▾] [Tgl Wisuda ▾] │
  ├──────────────────────────────────────────────────────────────────┤
  │  Menampilkan 24 dari 247 booking                                  │
  ├────────┬──────────────────┬──────────────┬────────────┬──────────┤
  │   #    │  NAMA CLIENT     │  UNIVERSITAS │  TANGGAL   │  STATUS  │
  ...
```

### 8.4 Tabel Responsif

```
  DESKTOP (> 1024px) : Semua kolom terlihat
  TABLET  (768–1024) : Sembunyikan kolom sekunder (fakultas, prodi)
  MOBILE  (< 768px)  : Ubah ke card list view (lihat §16)
```

### 8.5 Aturan Tabel

- Teks angka (nominal, ID) selalu **right-aligned**
- Teks nama/string selalu **left-aligned**
- Badge status tidak pernah full-width dalam cell — inline saja
- Selalu tampilkan **jumlah data** di atas tabel
- Tabel kosong tampilkan Empty State §12, bukan tabel dengan satu baris "Tidak ada data"

---

## 9. Modal Guideline

### 9.1 Anatomi Modal

```
  ╔══════════════════════════════════════════════════════╗
  ║  ╔════════════════════════════════════════════════╗  ║
  ║  ║                                                ║  ║ ← backdrop: blur(8px)
  ║  ║  Konfirmasi DP Booking                    [×]  ║  ║   rgba(0,0,0,0.4)
  ║  ║  ────────────────────────────────────────────  ║  ║
  ║  ║                                                ║  ║
  ║  ║  Anda akan mengkonfirmasi pembayaran DP        ║  ║
  ║  ║  untuk booking berikut:                        ║  ║
  ║  ║                                                ║  ║
  ║  ║  • Nama   : Budi Santoso                       ║  ║
  ║  ║  • DP     : Rp 150.000                         ║  ║
  ║  ║  • Metode : Transfer Bank                      ║  ║
  ║  ║                                                ║  ║
  ║  ║  ┌───────────────┐  ┌──────────────────────┐  ║  ║
  ║  ║  │    Batal      │  │  Ya, Konfirmasi DP   │  ║  ║
  ║  ║  └───────────────┘  └──────────────────────┘  ║  ║
  ║  ║                                                ║  ║
  ║  ╚════════════════════════════════════════════════╝  ║
  ╚══════════════════════════════════════════════════════╝
```

### 9.2 Ukuran Modal

```
  sm   : max-width 400px   → Konfirmasi singkat, peringatan
  md   : max-width 560px   → Form dalam modal, detail booking  ← default
  lg   : max-width 720px   → Preview QR, tabel dalam modal
  xl   : max-width 900px   → Jarang digunakan
  full : 100vw – 48px      → Mobile override
```

### 9.3 Variasi Modal

**Modal Konfirmasi (Danger)**
```
  ╔══════════════════════════════════════════════╗
  ║                                              ║
  ║   ⚠️   Batalkan Booking?                    ║
  ║                                              ║
  ║   Tindakan ini tidak dapat dibatalkan.       ║
  ║   Data booking akan ditandai CANCELLED.      ║
  ║                                              ║
  ║   ┌────────────┐   ┌──────────────────────┐ ║
  ║   │   Kembali  │   │  Ya, Batalkan        │ ║
  ║   │  (ghost)   │   │  (danger/red)        │ ║
  ║   └────────────┘   └──────────────────────┘ ║
  ╚══════════════════════════════════════════════╝
```

**Modal Detail Booking**
```
  ╔══════════════════════════════════════════════╗
  ║  Detail Booking                         [×]  ║
  ║  ──────────────────────────────────────────  ║
  ║  [Tab: Data Diri] [Tab: Pembayaran] [Tab:QR] ║
  ║  ──────────────────────────────────────────  ║
  ║  (konten tab)                                ║
  ║                                              ║
  ║                              [Tutup]         ║
  ╚══════════════════════════════════════════════╝
```

### 9.4 Aturan Modal

- Modal selalu dapat ditutup dengan **tombol ×**, **klik backdrop**, atau **Esc**
- Kecuali modal aksi kritis (konfirmasi destruktif) — nonaktifkan klik backdrop
- Tombol aksi utama selalu di **kanan bawah**
- Modal tidak pernah di-stack lebih dari satu lapis
- Scroll konten di dalam modal, bukan keseluruhan halaman

---

## 10. Toast Notification

### 10.1 Anatomi Toast

```
  POSISI DEFAULT: pojok kanan bawah layar
  ──────────────────────────────────────────────────────────────
  Atas kanan  : cocok untuk error kritis yang harus diperhatikan
  Kanan bawah : default — tidak mengganggu workflow

  ┌───────────────────────────────────────────────────┐
  │  ✅  DP berhasil dikonfirmasi untuk Budi Santoso  │  [×]
  └───────────────────────────────────────────────────┘
  auto-dismiss: 4000ms | width: 360px max | radius: 12px
```

### 10.2 Variasi Toast

```
  SUCCESS  ┌──────────────────────────────────────────────┐
           │  ✅  QR Code berhasil digenerate             │
           └──────────────────────────────────────────────┘
           bg: #F0FDF4  |  border-left: 4px solid #22C55E

  ERROR    ┌──────────────────────────────────────────────┐
           │  ❌  Gagal menyimpan data. Coba lagi.        │
           └──────────────────────────────────────────────┘
           bg: #FEF2F2  |  border-left: 4px solid #EF4444

  WARNING  ┌──────────────────────────────────────────────┐
           │  ⚠️  Koneksi lambat. Data mungkin belum      │
           │      tersimpan.                              │
           └──────────────────────────────────────────────┘
           bg: #FFFBEB  |  border-left: 4px solid #FBBF24

  INFO     ┌──────────────────────────────────────────────┐
           │  ℹ️  3 booking baru masuk hari ini           │
           └──────────────────────────────────────────────┘
           bg: #F0F9FF  |  border-left: 4px solid #38BDF8
```

### 10.3 Aturan Toast

- Maksimal **3 toast** tampil sekaligus; yang baru mendorong yang lama
- Toast sukses auto-dismiss **4 detik**
- Toast error **tidak auto-dismiss** — harus ditutup manual
- Pesan toast maksimal **dua baris** — ringkas dan spesifik
- Toast dapat di-klik untuk aksi lanjutan (opsional)

---

## 11. Loading State

### 11.1 Tipe Loading

**Skeleton Screen (untuk data list/tabel)**
```
  ┌─────────────────────────────────────────────────────┐
  │  ░░░░░░░░░░░░░░░░░░░░░░   ░░░░░░░░░   ░░░░░░░░░░░  │  ← shimmer
  ├─────────────────────────────────────────────────────┤
  │  ░░░░░░░░░░░░░░░░░░         ░░░░░░░   ░░░░░░░░░░░  │
  ├─────────────────────────────────────────────────────┤
  │  ░░░░░░░░░░░░░░░░░░░░░░░░░  ░░░░░░░   ░░░░░░░░░░░  │
  └─────────────────────────────────────────────────────┘
  animasi: shimmer kiri → kanan, 1.5s loop
  warna  : from --n-100 to --n-200
```

**Spinner (untuk aksi tombol atau komponen kecil)**
```
  ◌  Menyimpan...         ← inline dengan teks
  (spinner 16px, border 2px, primary color)
```

**Full Page Loading (saat halaman pertama load)**
```
  ┌──────────────────────────────────────────────┐
  │                                              │
  │                                              │
  │              ◌                               │
  │        Memuat data...                        │
  │                                              │
  │                                              │
  └──────────────────────────────────────────────┘
  (hanya untuk initial page load, bukan navigasi)
```

### 11.2 Aturan Loading State

- Selalu gunakan **skeleton** untuk list/tabel, bukan spinner global
- Durasi minimum skeleton: **300ms** (jangan kedip terlalu cepat)
- Loading state tidak boleh memblok seluruh halaman kecuali benar-benar diperlukan
- Setiap aksi tombol harus ada feedback loading (spinner atau disabled state)

---

## 12. Empty State

### 12.1 Anatomi Empty State

```
  ┌──────────────────────────────────────────────────────┐
  │                                                      │
  │                    📭                                │
  │                                                      │
  │           Belum Ada Booking                          │  ← --text-xl
  │                                                      │
  │      Booking yang masuk akan muncul di sini.         │  ← --text-sm, --n-400
  │      Bagikan link booking ke client wisuda.          │
  │                                                      │
  │           ┌────────────────────────────┐             │
  │           │  📋  Salin Link Booking    │             │  ← optional CTA
  │           └────────────────────────────┘             │
  │                                                      │
  └──────────────────────────────────────────────────────┘
```

### 12.2 Variasi Empty State HSGMS

```
  KONTEKS                    ILUSTRASI   PESAN
  ────────────────────────────────────────────────────────────
  Tidak ada booking          📭          "Belum ada booking masuk"
  Pencarian tidak ditemukan  🔍          "Tidak ada hasil untuk '[query]'"
  Filter kosong              🗂          "Tidak ada booking dengan filter ini"
  Antrian kosong             ✅          "Tidak ada client dalam antrian"
  Riwayat kosong             📜          "Belum ada riwayat pembayaran"
```

### 12.3 Aturan Empty State

- Selalu sertakan **ilustrasi/icon** yang relevan
- Pesan **dua baris**: judul + deskripsi/saran tindakan
- Sertakan **CTA** jika ada aksi yang dapat dilakukan user
- Jangan tampilkan empty state yang menggurui atau merendahkan

---

## 13. Error State

### 13.1 Error Halaman (Full Page Error)

```
  ┌──────────────────────────────────────────────────────┐
  │                                                      │
  │                    ⚠️                                │
  │                                                      │
  │           Gagal Memuat Data                          │
  │                                                      │
  │      Terjadi kesalahan saat menghubungi              │
  │      database. Periksa koneksi internet Anda.        │
  │                                                      │
  │           ┌───────────────────────┐                  │
  │           │  🔄  Coba Lagi        │                  │
  │           └───────────────────────┘                  │
  │                                                      │
  └──────────────────────────────────────────────────────┘
```

### 13.2 Error Inline (dalam Form atau Card)

```
  ┌──────────────────────────────────────────────────────┐
  │  ❌  Gagal menyimpan booking                         │
  │      Koneksi ke database terputus.                   │
  │      Data form Anda tidak hilang — silakan coba lagi.│
  └──────────────────────────────────────────────────────┘
  bg: --d-100 | border: 1px solid --d-300 | radius: 10px
```

### 13.3 Aturan Error State

- Pesan error harus **spesifik** — apa yang salah dan apa yang harus dilakukan
- Jangan tampilkan error teknis (stack trace, error code Firebase) kepada user
- Selalu sediakan **tombol retry** atau **panduan solusi**
- Error state tidak boleh menghilangkan data yang sudah diisi user

---

## 14. Success State

### 14.1 Success Inline

```
  ┌──────────────────────────────────────────────────────┐
  │  ✅  Booking berhasil dikirim!                       │
  │      Kami akan mengkonfirmasi DP Anda dalam          │
  │      1×24 jam. Pantau WhatsApp Anda.                 │
  └──────────────────────────────────────────────────────┘
  bg: --s-100 | border: 1px solid --s-300 | radius: 10px
```

### 14.2 Success Full Page (setelah submit booking)

```
  ┌──────────────────────────────────────────────────────┐
  │                                                      │
  │                    ✅                                │
  │                                                      │
  │         Booking Berhasil Dikirim!                    │
  │                                                      │
  │      Nomor Booking Anda:                             │
  │      ┌───────────────────────────────────┐           │
  │      │  -O_xK2mLpQrAbCdEfGhI            │           │  ← monospace
  │      └───────────────────────────────────┘           │
  │                                                      │
  │      Admin akan menghubungi Anda via WhatsApp        │
  │      setelah verifikasi DP selesai.                  │
  │                                                      │
  │         ┌──────────────────────────────┐             │
  │         │  Salin Nomor Booking         │             │
  │         └──────────────────────────────┘             │
  │                                                      │
  └──────────────────────────────────────────────────────┘
```

### 14.3 Aturan Success State

- Success state **tidak otomatis hilang** pada aksi penting (form submit)
- Nomor booking selalu ditampilkan dan dapat **disalin**
- Sertakan **langkah selanjutnya** yang harus dilakukan user
- Warna sukses (hijau) **tidak digunakan** untuk elemen lain agar tidak ambigu

---

## 15. Animation Guideline

### 15.1 Prinsip Animasi

```
  FAST    Aksi UI standar      : 100–150ms   ease-out
  NORMAL  Transisi komponen    : 200–250ms   ease-in-out   ← default
  SLOW    Muncul/masuk layar   : 300–350ms   ease-out
  ───────────────────────────────────────────────────────
  ❌ DILARANG: animasi > 400ms pada interaksi biasa
  ❌ DILARANG: animasi yang looping terus menerus (kecuali loading)
  ❌ DILARANG: animasi yang menggeser layout (layout shift)
```

### 15.2 Easing yang Digunakan

```
  ease-out      : cubic-bezier(0, 0, 0.2, 1)  → elemen masuk layar
  ease-in-out   : cubic-bezier(0.4, 0, 0.2, 1) → transisi state
  ease-spring   : cubic-bezier(0.34, 1.56, 0.64, 1) → tombol diklik (bounce tipis)
```

### 15.3 Daftar Animasi per Komponen

```
  KOMPONEN        ANIMASI                      DURASI
  ────────────────────────────────────────────────────────
  Modal masuk     fadeIn + scaleFrom(0.95)     250ms ease-out
  Modal keluar    fadeOut + scaleTo(0.95)      150ms ease-in
  Toast masuk     slideIn dari kanan           250ms ease-out
  Toast keluar    slideOut + fadeOut           200ms ease-in
  Card hover      translateY(-2px)             150ms ease-out
  Tombol diklik   scale(0.97) → scale(1)       100ms ease-spring
  Dropdown buka   scaleY(0→1) + fadeIn         150ms ease-out
  Skeleton        shimmer kiri → kanan         1500ms linear loop
  Row hover       bg color                     100ms ease
  Tab switch      underline slide              200ms ease-in-out
  Badge status    fadeIn saat update           300ms ease
```

### 15.4 Reduced Motion

```
  @media (prefers-reduced-motion: reduce) {
    Semua animasi dikurangi menjadi fade sederhana atau dihilangkan.
    Durasi maksimal: 100ms.
  }
```

---

## 16. Responsive Rule

### 16.1 Breakpoint System

```
  TOKEN       BREAKPOINT    RANGE           DEVICE
  ──────────────────────────────────────────────────────────────
  --bp-xs     < 480px       0–479px         HP layar kecil
  --bp-sm     480px         480–767px       HP layar normal
  --bp-md     768px         768–1023px      Tablet portrait
  --bp-lg     1024px        1024–1279px     Tablet landscape / laptop kecil
  --bp-xl     1280px        1280–1535px     Desktop           ← target utama
  --bp-2xl    1536px        1536px+         Desktop besar
```

### 16.2 Layout Grid

```
  BREAKPOINT    KOLOM   GUTTER   MARGIN
  ────────────────────────────────────────────
  < 768px       4       16px     16px
  768–1023px    8       20px     24px
  ≥ 1024px      12      24px     32px       ← default layout
  ≥ 1536px      12      32px     48px
```

### 16.3 Aturan Responsif per Halaman

**booking.html**
```
  Desktop  : Form 2 kolom, max-width 720px centered
  Tablet   : Form 2 kolom, full width dengan padding
  Mobile   : Form 1 kolom, full width
```

**admin.html**
```
  Desktop  : Sidebar 260px + konten utama fluid
  Tablet   : Sidebar collapse (hamburger menu)
  Mobile   : Sidebar overlay (drawer dari kiri)
```

**database.html**
```
  Desktop  : Tabel full, semua kolom terlihat
  Tablet   : Kolom sekunder tersembunyi
  Mobile   : Card list view (bukan tabel)
```

**hasilpembayaran.html**
```
  Desktop  : Card 2 kolom
  Mobile   : Card 1 kolom stack
```

### 16.4 Mobile — Card List View (pengganti tabel)

```
  ┌────────────────────────────────────────────┐
  │  Budi Santoso              [DP VERIFIED]   │
  │  Universitas Airlangga                     │
  │  15 Juli 2025              Rp 150.000      │
  │                      [Lihat Detail →]      │
  └────────────────────────────────────────────┘
  ┌────────────────────────────────────────────┐
  │  Siti Rahayu               [COMPLETED]     │
  │  Institut Teknologi Sepuluh Nopember       │
  │  15 Juli 2025              Rp 150.000      │
  │                      [Lihat Detail →]      │
  └────────────────────────────────────────────┘
```

---

## 17. Spacing System

### 17.1 Base Unit

```
  Base unit: 4px
  ──────────────────────────────────────────────────
  --space-0    0px      Tidak ada spacing
  --space-1    4px      Gap minimal (icon-teks)
  --space-2    8px      Gap komponen dalam (badge, tag)
  --space-3    12px     Gap ringan (antara label-input)
  --space-4    16px     Padding standar (card kecil, tombol md)
  --space-5    20px     Padding medium (card normal)
  --space-6    24px     Padding card besar, section gap
  --space-8    32px     Gap antar section besar
  --space-10   40px     Padding halaman (top content)
  --space-12   48px     Gap antar blok konten besar
  --space-16   64px     Section padding vertikal
```

### 17.2 Panduan Penggunaan Spacing

```
  KONTEKS                         TOKEN
  ────────────────────────────────────────────────────────
  Icon ↔ teks dalam tombol        --space-2  (8px)
  Label ↔ input field             --space-1  (4px) vertikal
  Antar field dalam form          --space-5  (20px)
  Padding dalam card              --space-5  (20px) default
  Padding card besar              --space-6  (24px)
  Gap antar card dalam grid       --space-4  (16px)
  Margin halaman (desktop)        --space-8  (32px)
  Heading ↔ konten pertama        --space-6  (24px)
  Antar section                   --space-10 (40px)
```

### 17.3 Contoh Visual Spacing

```
  ┌────────────────────────────────────────────────────┐
  │← 24px →                                            │
  │         Judul Section                              │↑ 24px
  │                                                    │↓
  │         Deskripsi teks di bawah judul              │
  │                                   ↑ 20px           │
  │         ┌──────────────────────┐  ↓                │
  │         │  Field Input         │                   │
  │         └──────────────────────┘                   │
  │                                   ↑ 20px           │
  │         ┌──────────────────────┐  ↓                │
  │         │  Field Input         │                   │
  │         └──────────────────────┘                   │
  │                                                    │↓ 24px
  └────────────────────────────────────────────────────┘
```

---

## 18. Border Radius

### 18.1 Radius Scale

```
  TOKEN         NILAI    PENGGUNAAN
  ──────────────────────────────────────────────────────────────
  --r-none      0px      Divider, progress bar
  --r-sm        6px      Badge, tag, chip kecil
  --r-md        8px      Input field, select, tombol sm
  --r-lg        10px     Tombol md/lg, dropdown, tooltip
  --r-xl        12px     Toast notification, alert inline
  --r-2xl       16px     Card standar                     ← paling sering
  --r-3xl       20px     Card besar, modal konten
  --r-full      9999px   Pill badge, avatar, tombol bulat
```

### 18.2 Visual Referensi Radius

```
  --r-sm (6px)                --r-2xl (16px)              --r-full
  ┌──────────┐                ╭──────────────╮            ╭──────────────╮
  │  Badge   │                │              │            │  Pill Badge  │
  └──────────┘                │    Card      │            ╰──────────────╯
                              │              │
                              ╰──────────────╯
```

### 18.3 Aturan Radius

- **Konsistensi per komponen** — satu jenis komponen pakai satu radius secara konsisten
- **Radius lebih besar = lebih friendly** — gunakan untuk elemen yang berinteraksi dengan client (booking.html)
- **Radius lebih kecil = lebih teknis** — gunakan untuk tabel dan form admin (admin.html, database.html)
- Modal selalu menggunakan `--r-3xl (20px)` pada kontainer utama

---

## 19. Shadow System

### 19.1 Shadow Scale

```
  TOKEN         NILAI CSS                                   PENGGUNAAN
  ────────────────────────────────────────────────────────────────────────────
  --sh-none     none                                        Elemen datar

  --sh-xs       0 1px 2px rgba(0,0,0,0.05)                 Badge, tag aktif

  --sh-sm       0 1px 3px rgba(0,0,0,0.07),
                0 1px 2px rgba(0,0,0,0.05)                 Input focus ring tipis

  --sh-md       0 4px 6px rgba(0,0,0,0.05),
                0 2px 4px rgba(0,0,0,0.04)                 Card default ← paling sering

  --sh-lg       0 10px 15px rgba(0,0,0,0.07),
                0 4px 6px rgba(0,0,0,0.04)                 Card hover, dropdown

  --sh-xl       0 20px 25px rgba(0,0,0,0.08),
                0 8px 10px rgba(0,0,0,0.04)                Modal

  --sh-2xl      0 25px 50px rgba(0,0,0,0.12)               Modal pada layar besar

  --sh-focus    0 0 0 3px rgba(37,99,235,0.25)             Focus ring input & tombol
                                                           (warna primary)

  --sh-focus-d  0 0 0 3px rgba(239,68,68,0.25)            Focus ring input error
```

### 19.2 Glassmorphism Shadow (khusus glass card)

```
  --sh-glass    0 8px 32px rgba(31,38,135,0.12),
                0 2px 8px rgba(31,38,135,0.06),
                inset 0 1px 0 rgba(255,255,255,0.5)
```

### 19.3 Aturan Shadow

- Shadow **tidak pernah berwarna-warni** (biru, hijau, dll.) kecuali focus ring
- Shadow hover **selalu satu level lebih tinggi** dari shadow default
- Elemen yang sudah punya border jelas → minimal shadow atau tanpa shadow
- Dark mode (jika diimplementasikan di masa depan): ganti shadow dengan border tipis

---

## 20. UI Consistency Rule

### 20.1 Identitas Visual Antar Halaman

Semua halaman HSGMS harus memiliki elemen identitas yang seragam:

```
  ┌──────────────────────────────────────────────────────────┐
  │  HS STUDIO                              Admin ▾  [🔔]   │  ← Navbar (semua halaman)
  │  Graduation Management System                            │
  ├──────────────────────────────────────────────────────────┤
  │                                                          │
  │  (konten per halaman)                                    │
  │                                                          │
  ├──────────────────────────────────────────────────────────┤
  │  © 2025 HS Studio  •  HSGMS v1.0                        │  ← Footer (opsional)
  └──────────────────────────────────────────────────────────┘
```

### 20.2 Elemen yang Harus Konsisten di Semua Halaman

```
  ELEMEN                    ATURAN
  ─────────────────────────────────────────────────────────────────────
  Font                      Selalu Inter / Plus Jakarta Sans
  Warna brand               Selalu --p-600 (#2563EB) sebagai aksen utama
  Background halaman        Selalu --n-50 (#F8FAFC)
  Card background           Selalu #FFFFFF dengan --sh-md
  Border radius card        Selalu --r-2xl (16px)
  Border radius tombol      Selalu --r-lg (10px)
  Border radius input       Selalu --r-md (8px)
  Status badge warna        Selalu mengacu §2.4 (tidak boleh improvisasi)
  Tombol primary            Selalu --p-600, putih, --r-lg
  Tombol danger             Selalu --d-500, putih, --r-lg
  Spacing antar card        Selalu --space-4 (16px)
  Toast position            Selalu pojok kanan bawah
```

### 20.3 Nama Komponen yang Konsisten

Gunakan istilah yang sama di semua halaman untuk komponen yang sama:

```
  KOMPONEN              ISTILAH YANG DIGUNAKAN
  ────────────────────────────────────────────────────────
  Tombol konfirmasi     "Konfirmasi"  (bukan "OK", "Submit", "Simpan")
  Tombol batal          "Batal"       (bukan "Cancel", "Tidak", "Kembali")
  Tombol hapus          "Batalkan Booking" (lengkap, bukan "Hapus" saja)
  Tombol lihat detail   "Lihat Detail" (bukan "Detail", "View", "Open")
  Field nama client     "Nama Lengkap" (bukan "Nama", "Full Name")
  Field tanggal wisuda  "Tanggal Wisuda" (konsisten di semua halaman)
  Status badge          Selalu kapital semua: "DP VERIFIED" (bukan "Dp Verified")
```

### 20.4 Aturan Warna yang Tidak Boleh Dilanggar

```
  ❌ DILARANG:
  • Menggunakan warna merah (#d00, #f00) selain untuk error/danger
  • Menggunakan warna hijau selain untuk success/completed
  • Menggunakan warna kuning selain untuk warning/pending
  • Membuat warna baru di luar color palette §2
  • Menggunakan opacity sebagai satu-satunya pembeda status
  • Teks warna putih di atas background terang
  • Teks gelap di atas background gelap
```

### 20.5 Checklist Konsistensi (untuk Review)

Sebelum halaman baru atau komponen baru di-deploy, periksa:

```
  [ ] Font menggunakan Inter / Plus Jakarta Sans
  [ ] Warna sesuai color palette §2
  [ ] Border radius sesuai scale §18
  [ ] Shadow sesuai scale §19
  [ ] Spacing menggunakan token §17
  [ ] Status badge menggunakan warna §2.4
  [ ] Tombol mengikuti hierarki §5
  [ ] Form mengikuti guideline §6
  [ ] Toast menggunakan variasi §10
  [ ] Loading state menggunakan skeleton atau spinner standar
  [ ] Empty state memiliki ilustrasi + pesan + CTA
  [ ] Error message spesifik dan solutif
  [ ] Animasi tidak melebihi 400ms
  [ ] Responsif dicek di 3 breakpoint (mobile, tablet, desktop)
  [ ] Tidak ada inline style yang mengoverride token
```

### 20.6 Prinsip "Satu Software"

```
  HS Studio memiliki 4 halaman:

  booking.html         → Wajah HS Studio kepada CLIENT
  admin.html           → Tools kerja ADMIN sehari-hari
  database.html        → Tools pencarian & monitoring
  hasilpembayaran.html → Rekap keuangan & pembayaran

  Keempatnya adalah SATU SOFTWARE.
  Bukan empat website yang kebetulan punya URL yang sama.

  Client yang membuka booking.html harus merasa:
  "Ini studio yang profesional."

  Admin yang membuka admin.html harus merasa:
  "Tools ini efisien dan tidak membingungkan."

  Keduanya harus merasakan identitas visual yang SAMA.
```

---

## 21. Changelog

| Versi | Tanggal | Perubahan | Penulis |
|---|---|---|---|
| `1.0.0` | 2025-06-29 | Initial UI Guideline — Design System HSGMS | UI/UX Architect |

---

*Dokumen ini adalah panduan desain resmi untuk seluruh antarmuka HSGMS.*
*Setiap keputusan desain baru harus merujuk dan konsisten dengan dokumen ini.*
*Perubahan pada guideline ini harus didiskusikan dan disetujui sebelum diimplementasikan.*

*HS Studio Graduation Management System — Internal Design Document*
*Dilarang disebarluaskan tanpa izin manajemen HS Studio.*
