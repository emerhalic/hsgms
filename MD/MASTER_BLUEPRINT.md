# MASTER_BLUEPRINT.md

## HS Studio Graduation Management System (HSGMS)

### Enterprise Software Architecture Document & Master System Blueprint

> **Document Scope:** Single Source of Truth (SSOT) and definitive architectural blueprint for the HS Studio Graduation Management System (HSGMS).
> **Target Domain:** Exclusively Graduation Photography Operations for HS Studio (Strictly non-applicable to wedding photography, family portraiture, or generic commercial studio management).
> **Target Audience:** Chief Software Architects, Enterprise System Designers, Frontend Developers, UI/UX Engineers, Operational Supervisors, and AI Engineering Contributors.
> **Version:** 1.0.0 — Enterprise Release
> **Status:** Sprint 1 Active Production Baseline

---

## Document Navigation Hierarchy

1. [Executive Overview](#1-executive-overview)
2. [Business Architecture](#2-business-architecture)
3. [System Architecture](#3-system-architecture)
4. [Page Architecture](#4-page-architecture)
5. [Module Architecture](#5-module-architecture)
6. [Data Flow](#6-data-flow)
7. [Status Flow](#7-status-flow)
8. [QR Flow](#8-qr-flow)
9. [Firebase Architecture](#9-firebase-architecture)
10. [Component Interaction](#10-component-interaction)
11. [Sequence Diagram](#11-sequence-diagram)
12. [Project Folder Architecture](#12-project-folder-architecture)
13. [Sprint Roadmap](#13-sprint-roadmap)
14. [Future Scalability](#14-future-scalability)
15. [Design Principles](#15-design-principles)
16. [Golden Rules](#16-golden-rules)
17. [Master Diagram](#17-master-diagram)

---

## 1. Executive Overview

### 1.1 Architectural Purpose & Software Intent

The HS Studio Graduation Management System (HSGMS) is a purpose-built, mission-critical internal enterprise application designed to orchestrate the high-volume, time-sensitive graduation photography operations of HS Studio. The software acts as an operational backbone that bridges digital client onboarding with physical on-site studio execution. By enforcing strict data contracts, linear business workflows, and real-time state synchronization, HSGMS eliminates manual coordination bottlenecks and ensures flawless service delivery during peak graduation seasons.

### 1.2 Core Operational Problems Solved

Traditional photography studio workflows suffer from severe operational friction during graduation rush hours. HSGMS specifically engineered solutions to eliminate the following enterprise failures:

* **Unverified Payment Bottlenecks:** Eliminates fraudulent or mismatched down payment (DP) claims by enforcing manual administrative verification before identity generation.
* **On-Site Check-In Congestion:** Replaces slow manual name lookups at reception desks with instant, cryptographic 1-to-1 QR Code scanning.
* **Studio Assignment Chaos:** Prevents studio idling and queue crowding by decoupling online registration from physical studio allocation, allowing real-time load balancing on D-Day.
* **Disconnected Data Silos:** Unifies client registration, financial auditing, QR tracking, and queue management into a single, real-time flat database structure.

### 1.3 Strategic Rationale for Custom Architecture

Off-the-shelf studio management software (e.g., generic SaaS scheduling tools) fails to meet the specialized constraints of HS Studio. HSGMS rejects standard industry paradigms in favor of domain-specific operational realities:

* **Rejection of Time-Slot Booking:** Graduation events are inherently unpredictable. Clients arrive based on fluctuating university ceremony schedules. HSGMS rejects fixed hourly booking slots (`❌ Jam booking`, `❌ Slot booking`) and instead operates on real-time physical queue numbers assigned upon arrival.
* **Rejection of Payment Gateways:** To eliminate transaction fees and maintain direct financial control, HSGMS rejects third-party payment gateways (`❌ Payment gateway`, `❌ Midtrans`, `❌ Xendit`). All transactions utilize direct bank transfers verified manually via uploaded proof documents.
* **Rejection of Client Studio Selection:** Clients cannot book specific physical studios online (`❌ Booking Studio`). Studio capacity is managed dynamically on-site by operational staff based on real-time queue lengths.

### 1.4 Target User Personas & Operational Roles

HSGMS serves two primary external/internal user groups across distinct operational touchpoints:

| Persona Category | Operational Role | Primary Responsibility | Interface Touchpoint |
| --- | --- | --- | --- |
| **External Client** | Graduation Student | Submitting academic identity, graduation date, and payment proof. | `booking.html` |
| **Internal Admin** | Verification Admin | Auditing uploaded bank transfer proofs and confirming DP receipt. | `admin.html` |
| **Internal Admin** | Operational Admin | Generating unique cryptographic QR Codes and distributing via WhatsApp. | `admin.html` |
| **Internal Admin** | D-Day Officer | Scanning client QR Codes, assigning physical studios, and triggering queue calls. | `admin.html` / `cek.html` |
| **Internal Admin** | Financial Auditor | Reviewing payment ledgers, DP timestamps, and remaining balance ledgers. | `hasilpembayaran.html` |

---

## 2. Business Architecture

### 2.1 Enterprise Operational Lifecycle Diagram

The business architecture maps the exact linear progression of a graduation client through the HS Studio operational pipeline. This pipeline strictly enforces ten sequential business stages without skipping or reverse transitions.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       HS STUDIO BUSINESS LIFECYCLE                                     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  [STAGE 1: ONLINE BOOKING]
  Client accesses booking.html → Inputs academic identity & graduation date
             │
             ▼
  [STAGE 2: DP TRANSFER PROOF UPLOAD]
  Client uploads JPG/PNG/PDF transfer proof → Submits form
             │
             ▼
  [STAGE 3: ADMINISTRATIVE VERIFICATION]
  Admin reviews proof in admin.html → Confirms receipt (Status: PENDING → DP_VERIFIED)
             │
             ▼
  [STAGE 4: QR CODE GENERATION]
  Admin generates unique Push ID QR Code → Dispatches via WhatsApp (Status: QR_GENERATED)
             │
             ▼
  [STAGE 5: D-DAY STUDIO ARRIVAL]
  Client arrives at HS Studio physical facility carrying digital QR Code
             │
             ▼
  [STAGE 6: ON-SITE QR SCANNING]
  Reception officer scans QR via admin.html camera interface (Status: CHECKED_IN)
             │
             ▼
  [STAGE 7: DYNAMIC STUDIO ASSIGNMENT]
  Officer evaluates live studio loads → Assigns Client to Studio A/B
             │
             ▼
  [STAGE 8: QUEUE ENGINE INTEGRATION]
  Booking pushed to local queue system → Client receives Queue Number (Status: IN_QUEUE)
             │
             ▼
  [STAGE 9: PHOTOGRAPHY SESSION]
  Studio officer calls Queue Number → Client enters studio (Status: IN_PROGRESS)
             │
             ▼
  [STAGE 10: SESSION COMPLETION]
  Photography finished → Officer marks terminal state (Status: COMPLETED)

```

### 2.2 Business Capability & System Boundary Matrix

HSGMS operates under strict functional boundaries. The architecture explicitly distinguishes between managed internal software capabilities and unmanaged external business processes.

| Business Capability | Managed by HSGMS Architecture | External / Manual Business Process |
| --- | --- | --- |
| **Client Registration** | Identity data capture, academic validation, timestamp logging. | N/A |
| **Down Payment Auditing** | Transfer proof file storage reference, DP amount ledger, verification audit tracking. | Physical bank account balance auditing, manual WhatsApp billing inquiries. |
| **Identity Generation** | Cryptographic Push ID generation, 1-to-1 QR string encoding. | Physical printing of QR Codes (if requested by client). |
| **On-Site Check-In** | Real-time camera QR scanning, duplicate scan prevention. | Manual paper backup verification during severe internet outages. |
| **Studio Allocation** | Studio assignment logging, local queue number generation. | Physical crowd control in studio waiting lounges. |
| **Queue Execution** | Real-time queue status tracking (`in_queue` → `in_progress` → `completed`). | Audio announcements or physical calling of client names. |
| **Financial Settlement** | Remaining balance calculation display. | Final cash/transfer collection upon photo print delivery. |
| **Refunds & Cancellations** | Status transition to terminal `cancelled` state. | Management refund negotiation and manual bank transfer execution. |

---

## 3. System Architecture

### 3.1 Enterprise Technical Topology Diagram

HSGMS executes on a modern, serverless, flat client-server architecture. The frontend consists of decoupled, static HTML5 pages powered by modular vanilla JavaScript. The backend layer relies entirely on Firebase Realtime Database utilizing persistent WebSocket connections for real-time state synchronization.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       HSGMS SYSTEM TOPOLOGY                                            │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ CLIENT & ADMIN PRESENTATION LAYER (Web Browser Runtime)                                            │
  │                                                                                                    │
  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────────────┐  │
  │  │   booking.html   │  │    admin.html    │  │  database.html   │  │    hasilpembayaran.html    │  │
  │  │  (Client Access) │  │  (Ops & Check-In)│  │  (Search Engine) │  │     (Financial Audit)      │  │
  │  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  └──────────────┬─────────────┘  │
  │           │                     │                     │                           │                │
  │           └─────────────────────┼─────────────────────┼───────────────────────────┘                │
  │                                 │                                                                  │
  │  ┌──────────────────────────────▼───────────────────────────────────────────────────────────────┐  │
  │  │ VANILLA JAVASCRIPT CORE ENGINE                                                               │  │
  │  │  ├── Module Controllers (Booking, Payment, QR, Queue, Check-In, Dashboard)                   │  │
  │  │  ├── Component Renderer Assembly (Pure JS DOM Manipulation via Token System)                 │  │
  │  │  └── State Synchronization Managers (Optimistic UI & Error Recovery Hooks)                   │  │
  │  └──────────────────────────────┬───────────────────────────────────────────────────────────────┘  │
  └─────────────────────────────────┼──────────────────────────────────────────────────────────────────┘
                                    │ Secure Persistent WebSocket (WSS)
                                    │ Realtime JSON Data Pipe
  ┌─────────────────────────────────▼──────────────────────────────────────────────────────────────────┐
  │ FIREBASE CLOUD INFRASTRUCTURE (Serverless Data Layer)                                              │
  │                                                                                                    │
  │  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐  │
  │  │ FIREBASE REALTIME DATABASE                                                                   │  │
  │  │  └── /bookings/{bookingId}  (Flat Transactional Data Store)                                  │  │
  │  │       ├── identity/  (Statis Client Profile)                                                 │  │
  │  │       ├── payment/   (Financial DP Ledger)                                                   │  │
  │  │       ├── qr/        (Cryptographic Tracking Strings)                                        │  │
  │  │       ├── studio/    (On-Site Studio Assignment)                                             │  │
  │  │       └── queue/     (Real-Time Studio Queue Metrics)                                        │  │
  │  └──────────────────────────────────────────────┬───────────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────┼──────────────────────────────────────────────────┘
                                                    │ Local Event Bridge
                                                    ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ LEGACY STUDIO INFRASTRUCTURE                                                                       │
  │  ├── cek.html    (HS Studio Existing Queue Validation Reader)                                      │
  │  └── index.html  (HS Studio Existing Queue Display Dashboard)                                      │
  └────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

### 3.2 Client-Side Runtime & State Topology

Because HSGMS rejects heavy frontend frameworks (React, Vue, Angular) in favor of static HTML and modular JavaScript, state management is handled through a highly disciplined runtime topology:

* **DOM as Presentation Surface:** The DOM is strictly a rendering target. No business logic or state persistence occurs within HTML markup.
* **Module Memory State:** Each operational page instantiates dedicated JavaScript module controllers. These controllers maintain transient runtime state (e.g., active filters, upload progress, camera stream handles).
* **Persistent Listener Synchronization:** The Firebase Realtime Database client SDK maintains an active WebSocket connection. Any mutation in `/bookings` instantly triggers `.on('value')` or `.on('child_changed')` callback hooks, updating the local runtime state and re-rendering composite UI components via deterministic rendering functions.

### 3.3 Serverless Database Backend Topology

The backend architecture bypasses custom middleware servers (Node.js, Python, Java). Direct client-to-database communication is secured and structured via Firebase Realtime Database rules:

* **Atomic Tree Operations:** All operations read or write directly to the flat `/bookings/{bookingId}` JSON tree. This guarantees single-roundtrip data retrieval without relational join latency.
* **Partial Update Contracts:** Mutations strictly utilize `.update()` targeting specific sub-nodes (e.g., `payment/dpVerifiedBy`) to prevent data corruption across concurrent administrative sessions.

---

## 4. Page Architecture

### 4.1 Enterprise Inter-Page Relationship Diagram

HSGMS consists of four core managed production pages, integrated with two legacy studio operational pages. While each page serves a specialized operational focus, all pages connect to the exact same Firebase Realtime Database repository, enforcing the "One Software" design mandate.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       PAGE NAVIGATION & ROUTING                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

                          ┌──────────────────────────────────────────────┐
                          │                 booking.html                 │
                          │        (Public Client Onboarding UI)         │
                          └──────────────────────┬───────────────────────┘
                                                 │ Pushes new Push ID
                                                 │ Status: PENDING
                                                 ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ INTERNAL ADMINISTRATIVE CORE (Secured Ops Access)                                                      │
│                                                                                                        │
│  ┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐         │
│  │       admin.html        │◄────►│      database.html      │◄────►│  hasilpembayaran.html   │         │
│  │   (Ops Dashboard,       │ Nav  │   (Master Data Search   │ Nav  │   (Financial Read-Only  │         │
│  │ Verification, QR Scan)  │      │  & Multi-Filter Engine) │      │     Auditing Ledger)    │         │
│  └────────────┬────────────┘      └─────────────────────────┘      └─────────────────────────┘         │
└───────────────┼────────────────────────────────────────────────────────────────────────────────────────┘
                │ Pushes Queue Number
                │ Pushes Booking ID & Studio ID
                ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ EXISTING STUDIO QUEUE SUBSYSTEM                                                                        │
│                                                                                                        │
│  ┌─────────────────────────┐                                       ┌─────────────────────────┐         │
│  │        cek.html         │──────────────────────────────────────►│       index.html        │         │
│  │  (Queue Check Reader)   │          Local Event Synchronization  │  (Live Queue Display Board)│         │
│  └─────────────────────────┘                                       └─────────────────────────┘         │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

### 4.2 Page Specification & Responsibility Matrix

| Page Identifier | Page Context | Data Access Permissions | Core Architectural Responsibilities |
| --- | --- | --- | --- |
| `booking.html` | Public Client | **CREATE Only** (`bookings/{newId}`) | Captures academic identity, graduation date, phone number, and DP transfer proof image. Initializes booking object with default financial structures and `pending` status. |
| `admin.html` | Internal Admin | **READ, UPDATE** (`bookings/*`) | Primary operational command center. Hosts verification workflows (`pending` → `dp_verified`), QR generation (`dp_verified` → `qr_generated`), camera QR scanning (`qr_generated` → `checked_in`), studio allocation (`checked_in` → `in_queue`), and live queue management (`in_progress` → `completed`). |
| `database.html` | Internal Admin | **READ, SEARCH** (`bookings/*`) | Master search and analytical interface. Executes multi-parameter indexing queries (by status, graduation date, client name, booking ID). Renders responsive Tables on desktop/tablet and Card lists on mobile. |
| `hasilpembayaran.html` | Internal Admin | **READ Only** (`bookings/{id}/payment`) | Dedicated financial auditing interface. Renders read-only Payment Cards displaying DP amounts, payment timestamps, verification admin IDs, and remaining balances. Forbids data mutations. |
| `cek.html` | Legacy System | **READ, WRITE** (Queue Bridge) | Intermediary validation bridge connecting HSGMS booking objects to the existing studio hardware queue displays. |
| `index.html` | Legacy System | **READ Only** (Queue Display) | Existing studio waiting room display board reflecting active queue calls. |

---

## 5. Module Architecture

HSGMS partitions system logic into eight decoupled JavaScript modules. Each module encapsulates specific domain rules, data validation hooks, and UI component assemblies.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       HSGMS MODULE PARTITIONING                                        │
├───────────────────┬───────────────────┬───────────────────┬───────────────────┬────────────────────┤
│  Booking Module   │  Payment Module   │     QR Module     │  Check-In Module  │    Queue Module    │
├───────────────────┼───────────────────┼───────────────────┼───────────────────┼────────────────────┤
│ Dashboard Module  │  Database Module  │ Notification Mod. │                   │                    │
└───────────────────┴───────────────────┴───────────────────┴───────────────────┴────────────────────┘

```

### 5.1 Booking Module

* **Domain Responsibility:** Orchestrates public client registration on `booking.html`.
* **Core Functions:** Executes client-side input validation (`validateBooking()`), manages academic dropdown selections, validates graduation dates against historical past-date errors (`ERR-B05`), and initializes the Firebase Push ID reference.
* **Component Assembly:** Renders `TextInput`, `Select`, `Textarea`, `DatePicker`, `PhoneInput`, and `ButtonPrimary`.

### 5.2 Payment Module

* **Domain Responsibility:** Manages financial ledgers, proof file handling, and administrative DP auditing.
* **Core Functions:** Enforces file upload constraints (max 5MB, accepted formats JPG/PNG/PDF — `ERR-B02`, `ERR-B03`), calculates remaining balance ledgers, and executes partial administrative verification updates (`dpVerifiedBy`, `dpPaidAt`).
* **Component Assembly:** Renders `UploadArea`, `PaymentCard`, `Alert`, and `Modal`.

### 5.3 QR Module

* **Domain Responsibility:** Handles cryptographic tracking identity encoding and decoding.
* **Core Functions:** Encodes unique Firebase Push IDs into 1-to-1 QR image strings, tracks generation metadata (`qrGeneratedAt`, `qrGeneratedBy`), renders preview interfaces, and logs physical scan timestamps (`qrScannedAt`, `qrScannedBy`).
* **Component Assembly:** Renders `QRCard`, `ConfirmDialog`, and `ButtonSecondary`.

### 5.4 Check-In Module

* **Domain Responsibility:** Manages on-site D-Day client arrival and reception operations.
* **Core Functions:** Interfaces with device webcams via HTML5 media streams, decodes QR strings in real time, validates scan eligibility (`ERR-Q02`), prevents duplicate scan fraud (`SOP_FLOW.md` §8.2), and executes manual fallback lookups for lost QR codes (`SOP_FLOW.md` §8.3).
* **Component Assembly:** Renders `SearchBox`, `CustomerCard`, `Toast`, and `Modal`.

### 5.5 Queue Module

* **Domain Responsibility:** Orchestrates on-site studio load balancing and real-time session tracking.
* **Core Functions:** Evaluates active studio ketersediaan (`studios/{id}/isActive`), executes transactional queue number increments (`queueRef.transaction()`), tracks session lifecycle timestamps (`photoStartedAt`, `photoCompletedAt`), and bridges data to legacy `cek.html`.
* **Component Assembly:** Renders `StudioCard`, `QueueCard`, `CurrentQueue`, `NextQueue`, and `FloatingActionButton`.

### 5.6 Dashboard Module

* **Domain Responsibility:** Aggregates macro-operational metrics for executive oversight on `admin.html`.
* **Core Functions:** Calculates daily booking volumes, breaks down system funnel distributions by status, tracks live activity chronologies, and renders real-time data visualizers.
* **Component Assembly:** Renders `StatisticCard`, `SummaryCard`, `ActivityTimeline`, `RecentBooking`, and `StatusWidget`.

### 5.7 Database Module

* **Domain Responsibility:** Powers enterprise data retrieval, multi-parameter filtering, and record inspection on `database.html`.
* **Core Functions:** Constructs Firebase `.orderByChild()` queries, executes debounced client name string searches, handles status multi-filter states, and applies responsive rendering transformations (Table vs Card List).
* **Component Assembly:** Renders `Table`, `BookingCard`, `SearchBox`, `EmptyState`, and `LoadingSkeleton`.

### 5.8 Notification Module

* **Domain Responsibility:** Manages external client communication logging and internal system feedback.
* **Core Functions:** Formats WhatsApp dispatch URLs (`wa web service URL`), logs manual administrative communication hooks, and dispatches non-blocking visual feedback across all interfaces.
* **Component Assembly:** Renders `Toast`, `Alert`, and `Badge`.

---

## 6. Data Flow

### 6.1 Enterprise End-to-End Data Trajectory Diagram

Data moves through HSGMS in a strict, unidirectional flow. Each operational phase mutates specific sub-nodes of the root booking JSON object while appending tracking timestamps.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       HSGMS DATA TRAJECTORY                                            │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  [PHASE 1: CLIENT DATA INGESTION]
  booking.html Runtime → Captures User Input + Base64/Storage Proof URL
  Payload Constructed: { identity: {...}, payment: { dpAmount: 0, ... }, status: "pending" }
             │
             │ Firebase SDK .push().set()
             ▼
  [PHASE 2: TRANSACTIONAL PERSISTENCE]
  Firebase Realtime Database → Stored at /bookings/-O_xK2mLpQrAbCdEfGhI
             │
             │ Realtime WebSocket Broadcast (.on('value'))
             ▼
  [PHASE 3: ADMINISTRATIVE VERIFICATION]
  admin.html Runtime → Admin Audits Proof → Inputs dpAmount (e.g., 150000) & Method
             │
             │ Firebase SDK .update()
             ▼
  [PHASE 4: FINANCIAL & STATUS MUTATION]
  Database Mutated: { status: "dp_verified", payment: { dpVerifiedBy: "admin_rudi", ... } }
             │
             │ Admin Clicks "Generate QR" → .update()
             ▼
  [PHASE 5: CRYPTOGRAPHIC IDENTITY BINDING]
  Database Mutated: { status: "qr_generated", qr: { qrCode: "-O_xK2mL...", ... } }
             │
             │ D-Day Camera Scan Hook
             ▼
  [PHASE 6: ON-SITE ARRIVAL CHECK-IN]
  admin.html Runtime → Decodes String → Validates Match → .update()
  Database Mutated: { status: "checked_in", qr: { qrScannedAt: 1718500000000, ... } }
             │
             │ Officer Assigns Studio A → Transactional Increment
             ▼
  [PHASE 7: QUEUE ALLOCATION]
  Database Mutated: { status: "in_queue", studio: { studioId: "studio_a" }, queue: { queueNumber: 3 } }
             │
             │ Studio Officer Calls Client → .update()
             ▼
  [PHASE 8: SESSION EXECUTION]
  Database Mutated: { status: "in_progress", queue: { photoStartedAt: 1718502000000 } }
             │
             │ Sesi Foto Selesai → .update()
             ▼
  [PHASE 9: TERMINAL ARCHIVING]
  Database Mutated: { status: "completed", queue: { photoCompletedAt: 1718503800000 } }

```

### 6.2 Module Data Access & Permission Matrix

| Module Name | Read Access Target | Write Access Target | Firebase Operation Executed |
| --- | --- | --- | --- |
| **Booking Module** | `studios` (Master Check) | `/bookings/{newId}` | `.push().set()` |
| **Payment Module** | `/bookings/{id}/payment` | `/bookings/{id}/payment`, `/bookings/{id}/status` | `.update()` |
| **QR Module** | `/bookings/{id}/qr`, `/bookings/{id}/status` | `/bookings/{id}/qr`, `/bookings/{id}/status` | `.update()` |
| **Check-In Module** | `/bookings/*` | `/bookings/{id}/qr`, `/bookings/{id}/status` | `.orderByChild()`, `.update()` |
| **Queue Module** | `/bookings/{id}/queue`, `studios` | `/bookings/{id}/queue`, `/bookings/{id}/studio`, `/bookings/{id}/status` | `.transaction()`, `.update()` |
| **Dashboard Module** | `/bookings/*` | N/A (Read-Only Aggregator) | `.on('value')` |
| **Database Module** | `/bookings/*` | `/bookings/{id}` (Delete/Edit Hooks) | `.once('value')`, `.remove()`, `.update()` |
| **Notification Mod.** | `/bookings/{id}/identity` | N/A (External Dispatcher) | Local JS Execution |

---

## 7. Status Flow

### 7.1 Enterprise Finite State Machine Diagram

Booking statuses in HSGMS operate strictly as a linear Finite State Machine (FSM). The architecture establishes absolute mapping between physical database enums (`snake_case`), UI display labels (`UPPERCASE`), and legacy business aliases (`PROJECT_RULE.md`).

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       FINITE STATE MACHINE (FSM)                                       │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  [INITIAL STATE: NULL / UNCREATED]
               │
               │ Client Submits booking.html
               ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ DB Enum     : pending                                                                              │
  │ UI Badge    : PENDING (Yellow #FEF3C7 / Text #D97706)                                    │
  │ Alias       : WAITING_APPROVAL                                                           │
  └────────────┬───────────────────────────────────────────────────┬───────────────────────────────────┘
               │                                                   │
               │ Admin Verifies DP                       │ Admin Cancels / Invalid Proof
               ▼                                                   │
  ┌──────────────────────────────────────────────┐                 │
  │ DB Enum     : dp_verified                    │                 │
  │ UI Badge    : DP VERIFIED (Blue #EFF6FF)             │
  │ Alias       : APPROVED             │                 │
  └────────────┬─────────────────────────────────┘                 │
               │                                                   │
               │ Admin Generates QR                      │ Admin Cancels
               ▼                                                   │
  ┌──────────────────────────────────────────────┐                 │
  │ DB Enum     : qr_generated                   │                 │
  │ UI Badge    : QR GENERATED (Green #F0FDF4)           │
  │ Alias       : APPROVED             │                 │
  └────────────┬─────────────────────────────────┘                 │
               │                                                   │
               │ Reception Camera Scan                   │ D-Day No-Show Cancellation
               ▼                                                   │
  ┌──────────────────────────────────────────────┐                 │
  │ DB Enum     : checked_in                     │                 │
  │ UI Badge    : CHECKED IN (Purple #F5F3FF)            │
  │ Alias       : CHECK_IN             │                 │
  └────────────┬─────────────────────────────────┘                 │
               │                                                   │
               │ Officer Assigns Studio                  │
               ▼                                                   │
  ┌──────────────────────────────────────────────┐                 │
  │ DB Enum     : in_queue                       │                 │
  │ UI Badge    : IN QUEUE (Orange #FFF7ED)              │
  │ Alias       : QUEUE                │                 │
  └────────────┬─────────────────────────────────┘                 │
               │                                                   │
               │ Studio Officer Calls Queue              │
               ▼                                                   │
  ┌──────────────────────────────────────────────┐                 │
  │ DB Enum     : in_progress                    │                 │
  │ UI Badge    : IN PROGRESS (Blue #EFF6FF)             │
  │ Alias       : QUEUE                │                 │
  └────────────┬─────────────────────────────────┘                 │
               │                                                   │
               │ Photography Session Finished            │
               ▼                                                   ▼
  ┌──────────────────────────────────────────────┐   ┌──────────────────────────────────────────────┐
  │ DB Enum     : completed                      │   │ DB Enum     : cancelled                      │
  │ UI Badge    : COMPLETED (Green #F0FDF4)│   │ UI Badge    : CANCELLED (Red #FEF2F2)│
  │ Alias       : FINISHED             │   │ Alias       : TERMINATED                     │
  │ Status Type : TERMINAL STATE       │   │ Status Type : TERMINAL STATE       │
  └──────────────────────────────────────────────┘   └──────────────────────────────────────────────┘

```

### 7.2 Exhaustive Status Transition Contracts

| Physical DB Enum (`snake_case`) | UI Badge Display Label | Legacy Rule Alias | Triggering Actor | Permitted Prerequisite State | Permitted Successor States | Core Business Transition Condition |
| --- | --- | --- | --- | --- | --- | --- |
| `pending` | `PENDING` | `WAITING_APPROVAL` | Client | N/A (Creation) | `dp_verified`, `cancelled` | Form submission completed with proof upload. |
| `dp_verified` | `DP VERIFIED` | `APPROVED` | Admin Verifikasi | `pending` | `qr_generated`, `cancelled` | Bank transfer proof audited; DP nominal verified. |
| `qr_generated` | `QR GENERATED` | `APPROVED` | Admin Operasional | `dp_verified` | `checked_in`, `cancelled` | Push ID cryptographic string generated into QR. |
| `checked_in` | `CHECKED IN` | `CHECK_IN` | Petugas Hari H | `qr_generated` | `in_queue` | Physical client arrival; camera QR scan validated. |
| `in_queue` | `IN QUEUE` | `QUEUE` | Petugas Hari H | `checked_in` | `in_progress` | Studio allocated; transactional queue number assigned. |
| `in_progress` | `IN PROGRESS` | `QUEUE` | Petugas Studio | `in_queue` | `completed` | Client called into studio room; photography started. |
| `completed` | `COMPLETED` | `FINISHED` | Petugas Studio | `in_progress` | **None (Terminal)** | Photography session concluded successfully. |
| `cancelled` | `CANCELLED` | `TERMINATED` | Admin / Ops | `pending` to `qr_generated` | **None (Terminal)** | Booking aborted due to fraud, no-show, or refund. |

---

## 8. QR Flow

### 8.1 Cryptographic Identity Encoding Mechanics

HSGMS eliminates external QR generation servers. The identity string encoded into the QR Code is strictly identical to the unique Firebase Push ID (`bookingId`) generated upon online booking creation (e.g., `-O_xK2mLpQrAbCdEfGhI`). This guarantees that every QR Code is globally unique, time-ordered, and inherently bound to a single database record.

### 8.2 Physical D-Day Scan Protocol & Resolution Diagram

On graduation D-Day, physical reception operations rely entirely on optical QR decoding via HTML5 webcam streams inside `admin.html`.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       D-DAY QR SCAN RESOLUTION                                         │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  [CLIENT PRESENTS QR CODE ON MOBILE SCREEN OR PRINTED PAPER]
                               │
                               ▼
  [OFFICER CAPTURES FRAME VIA admin.html WEBCAM INTERFACE]
                               │
                               ▼
  [VANILLA JS OPTICAL DECODER EXTRACTS RAW STRING (e.g., "-O_xK2mL...")]
                               │
                               ▼
  [QUERY FIREBASE REALTIME DATABASE: /bookings/-O_xK2mLpQrAbCdEfGhI]
                               │
        ┌──────────────────────┴──────────────────────┐
        │ Record Found?                               │ Record Missing?
        ▼ YES                                         ▼ NO
  [EVALUATE RECORD STATUS]                      [TRIGGER ERROR: ERR-Q03]
        │                                       Reject Scan → Initiate Manual Identity Verification
        ├─────────────────────────────────────────────┐
        │ Status === 'qr_generated'?                  │ Status !== 'qr_generated'?
        ▼ YES                                         ▼ NO
  [EXECUTE ATOMIC DATABASE MUTATION]            [TRIGGER EXCEPTION FLOW: DUPLICATE SCAN]
  .update({                                     Evaluate current status:
    status: "checked_in",                       • If 'checked_in'/'in_queue' → Warn Officer (ERR-Q02)
    "qr/qrScannedAt": 1718500000000,            • If 'cancelled' → Reject Access
    "qr/qrScannedBy": "petugas_reception"       Initiate Fraud Investigation
  })
        │
        ▼
  [RENDER SUCCESS TOAST & UNLOCK STUDIO ALLOCATION PANEL]

```

### 8.3 Bridging HSGMS Bookings to Legacy Studio Hardware

Once a client is successfully checked in (`checked_in`), operational staff assign physical studios (Studio A or Studio B). This action mutates `/bookings/{id}/studio` and `/bookings/{id}/queue`. To support existing physical waiting room display displays (`index.html`) and hardware readers (`cek.html`), the local runtime engine broadcasts a decoupled synchronization event containing the exact `bookingId`, `studioName`, and generated `queueNumber`.

---

## 9. Firebase Architecture

### 9.1 Enterprise Tree Relationship Diagram

HSGMS enforces a strictly flat JSON database hierarchy under `/bookings`. The architecture forbids nested relational sub-collections deeper than three levels to guarantee sub-100ms atomic read performance.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       FIREBASE TREE TOPOLOGY                                           │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  firebase.database().ref()
  │
  ├── /bookings
  │    │
  │    ├── /-O_xK2mLpQrAbCdEfGhI  (Transactional Entity: Push ID Key)
  │    │    ├── /identity         (Statis Academic Profile)
  │    │    │    ├── fullName        : "Budi Santoso"
  │    │    │    ├── phoneNumber     : "08123456789"
  │    │    │    ├── universityName  : "Universitas Airlangga"
  │    │    │    ├── facultyName     : "Fakultas Ilmu Komputer"
  │    │    │    ├── studyProgram    : "Sistem Informasi"
  │    │    │    ├── graduationDate  : "2025-07-15"
  │    │    │    └── notes           : "Mohon konfirmasi H-1"
  │    │    │
  │    │    ├── /payment          (Financial Auditing Ledger)
  │    │    │    ├── dpAmount        : 150000
  │    │    │    ├── dpPaidAt        : 1718100000000
  │    │    │    ├── dpVerifiedBy    : "admin_rudi"
  │    │    │    ├── paymentMethod   : "transfer"
  │    │    │    ├── transferProofUrl: "https://storage.googleapis.com/..."
  │    │    │    └── remainingBalance: 200000
  │    │    │
  │    │    ├── /qr               (Cryptographic Identity Metrics)
  │    │    │    ├── qrCode          : "-O_xK2mLpQrAbCdEfGhI"
  │    │    │    ├── qrGeneratedAt   : 1718110000000
  │    │    │    ├── qrGeneratedBy   : "admin_rudi"
  │    │    │    ├── qrScannedAt     : 1718500000000
  │    │    │    └── qrScannedBy     : "petugas_hari_h"
  │    │    │
  │    │    ├── /studio           (On-Site Studio Allocation)
  │    │    │    ├── studioId        : "studio_a"
  │    │    │    ├── studioName      : "Studio A"
  │    │    │    ├── studioAssignedAt: 1718500500000
  │    │    │    └── studioAssignedBy: "petugas_hari_h"
  │    │    │
  │    │    ├── /queue            (Real-Time Session Execution Metrics)
  │    │    │    ├── queueNumber     : 3
  │    │    │    ├── queueEnteredAt  : 1718500500000
  │    │    │    ├── photoStartedAt  : 1718502000000
  │    │    │    └── photoCompletedAt: 1718503800000
  │    │    │
  │    │    ├── status               : "completed"  [Indexed Root Field]
  │    │    ├── createdAt            : 1718000000000  [Indexed Root Field]
  │    │    └── updatedAt            : 1718503800000  [Indexed Root Field]
  │    │
  │    └── /-O_yL3nM... (Next Booking Record)
  │
  └── /studios  (Master Studio Configuration Node)
       ├── /studio_a { name: "Studio A", capacity: 1, isActive: true }
       └── /studio_b { name: "Studio B", capacity: 1, isActive: true }

```

### 9.2 Architectural Rationale for Flat Design

* **Zero Relational Joins:** In a relational database (SQL), retrieving client details, payment proof, and queue metrics requires complex multi-table joins. In HSGMS, reading `/bookings/{id}` retrieves the entire transactional context atomically in a single payload.
* **Granular Partial Updates:** By isolating operational phases into logical sub-nodes (`identity`, `payment`, `qr`, `studio`, `queue`), administrative UI modules execute non-destructive partial updates. For example, the Check-In Module updates `/qr` without locking or overwriting financial data in `/payment`.
* **Indexing Optimization:** Indexing rules explicitly target root-level `status`, `identity/graduationDate`, and `createdAt`. This allows enterprise search queries on `database.html` to filter thousands of records instantly without downloading entire collections to the client browser.

---

## 10. Component Interaction

### 10.1 Architectural Component Hierarchy & Assembly Diagram

HSGMS components are organized into a strict five-level hierarchy. Lower-level primitives never hold domain context or call upper-level composite assemblies, guaranteeing absolute reusability and eliminating circular dependency deadlocks.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       COMPONENT ASSEMBLY HIERARCHY                                     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  [LEVEL 4: OPERATIONAL PAGES]
  booking.html · admin.html · database.html · hasilpembayaran.html
             │
             │ Constructed from
             ▼
  [LEVEL 3: LAYOUT ASSEMBLY]
  Navbar + Sidebar + ContentWrapper + Footer
             │
             │ Wraps & Hosts
             ▼
  [LEVEL 2: DOMAIN COMPONENTS]
  BookingCard · PaymentCard · QRCard · CustomerCard · QueueCard · StudioCard
  CurrentQueue · NextQueue · SummaryCard · ActivityTimeline · RecentBooking · StatusWidget
             │
             │ Composes
             ▼
  [LEVEL 1: COMPOSITE MOLECULES]
  Card · Table · Modal · Toast · Alert · ConfirmDialog · EmptyState · LoadingSkeleton · SectionHeader
             │
             │ Built from
             ▼
  [LEVEL 0: PRIMITIVE ELEMENTS]
  ButtonPrimary/Secondary/Ghost/Danger/FAB · Badge · ProgressIndicator
  TextInput · Select · Textarea · UploadArea · SearchBox · DatePicker · PhoneInput
             │
             │ Styled strictly by
             ▼
  [LEVEL -1: DESIGN TOKEN SYSTEM]
  Colors (--p-600, --d-500) · Typography (--text-sm, JetBrains Mono) · Spacing (--space-4)
  Border Radius (--r-2xl) · Shadow (--sh-md) · Transitions (150ms ease-out)

```

### 10.2 Event Propagation & Data Binding Hooks

Components communicate across layers via strict JavaScript event binding contracts:

* **Downward Prop Passing:** Level 3 and Level 4 extract raw Firebase payloads and format them into presentation props (e.g., converting raw timestamps to formatted string labels like `graduationDateLabel: "15 Juli 2025"`). These props are passed downward into Level 2 and Level 1 components.
* **Upward Event Emitting:** Primitive Level 0 form elements capture user interactions (clicks, keystrokes, file drops) and emit standardized callbacks (`onChange`, `onClick`, `onFileSelect`). Level 2 Domain components intercept these callbacks and trigger Firebase mutations or state transitions within page module controllers.

---

## 11. Sequence Diagram

### 11.1 Phase 1 Sequence: Online Booking & Proof Upload

This diagram details the exact operational choreography during public client registration on `booking.html`.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       PHASE 1 SEQUENCE: CLIENT BOOKING                                 │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

 Client          booking.html Runtime        Booking Module JS        Payment Module JS        Firebase DB
   │                      │                          │                        │                     │
   │ 1. Open Page         │                          │                        │                     │
   │─────────────────────►│                          │                        │                     │
   │                      │ 2. Render Form UI        │                        │                     │
   │                      │◄─────────────────────────│                        │                     │
   │ 3. Input Identity & Date                        │                        │                     │
   │─────────────────────►│                          │                        │                     │
   │                      │ 4. validateBooking()     │                        │                     │
   │                      │─────────────────────────►│                        │                     │
   │                      │                          │ [Validation OK]        │                     │
   │ 5. Drop Transfer Proof Image                    │                        │                     │
   │─────────────────────►│                          │                        │                     │
   │                      │ 6. Process File Hook     │                        │                     │
   │                      │──────────────────────────────────────────────────►│                     │
   │                      │                          │                        │ 7. Validate 5MB/Fmt │
   │                      │                          │                        │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
   │ 8. Click Submit CTA  │                          │                        │                     │
   │─────────────────────►│                          │                        │                     │
   │                      │ 9. Construct Booking Payload                      │                     │
   │                      │─────────────────────────►│                        │                     │
   │                      │                          │ 10. .push().set(Payload)                     │
   │                      │                          │─────────────────────────────────────────────►│
   │                      │                          │                        │                     │ [Stored OK]
   │                      │ 11. Render Success Full Page                      │                     │
   │                      │◄─────────────────────────│                        │                     │
   │ 12. Display Push ID  │                          │                        │                     │
   │◄─────────────────────│                          │                        │                     │

```

### 11.2 Phase 2 Sequence: Administrative Verification & QR Dispatch

This sequence maps administrative workflows inside `admin.html` covering DP verification and cryptographic QR Code generation.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       PHASE 2 SEQUENCE: OPS VERIFICATION                               │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

 Admin Ops         admin.html Runtime        Verification Mod JS         QR Module JS          Firebase DB
   │                      │                          │                        │                     │
   │                      │ 1. Persistent Listener .on('value', status='pending')                   │
   │                      │◄────────────────────────────────────────────────────────────────────────│
   │ 2. Select Pending Record                        │                        │                     │
   │─────────────────────►│                          │                        │                     │
   │                      │ 3. Render Modal Detail   │                        │                     │
   │                      │◄─────────────────────────│                        │                     │
   │ 4. Audit Transfer Proof                         │                        │                     │
   │─────────────────────►│                          │                        │                     │
   │ 5. Click "Konfirmasi DP"                        │                        │                     │
   │─────────────────────►│                          │                        │                     │
   │                      │ 6. Execute Partial Mutation                       │                     │
   │                      │─────────────────────────►│                        │                     │
   │                      │                          │ 7. .update({status: 'dp_verified', ...})     │
   │                      │                          │─────────────────────────────────────────────►│
   │                      │                          │                        │                     │ [Updated]
   │                      │ 8. Listener Broadcast (.on('child_changed'))                            │
   │                      │◄────────────────────────────────────────────────────────────────────────│
   │                      │ 9. Swap CTA to "Generate QR Code"                 │                     │
   │                      │◄─────────────────────────│                        │                     │
   │ 10. Click "Generate QR"                         │                        │                     │
   │─────────────────────►│                          │                        │                     │
   │                      │ 11. Trigger QR Encoding Hook                      │                     │
   │                      │──────────────────────────────────────────────────►│                     │
   │                      │                          │                        │ 12. Encode Push ID  │
   │                      │                          │                        │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
   │                      │                          │                        │ 13. .update(QR Data)│
   │                      │                          │                        │────────────────────►│
   │                      │ 14. Render QRCard & WhatsApp Dispatch CTA         │                     │
   │                      │◄──────────────────────────────────────────────────│                     │

```

### 11.3 Phase 3 Sequence: D-Day Check-In & Dynamic Studio Assignment

This diagram models on-site physical client arrival, webcam optical scanning, and dynamic studio load allocation.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       PHASE 3 SEQUENCE: D-DAY CHECK-IN                                 │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

 Client D-Day    Officer Runtime (admin.html)    Check-In Mod JS         Queue Module JS       Firebase DB
   │                      │                          │                        │                     │
   │ 1. Show QR Code      │                          │                        │                     │
   │─────────────────────►│                          │                        │                     │
   │                      │ 2. Capture Video Frame   │                        │                     │
   │                      │─────────────────────────►│                        │                     │
   │                      │                          │ 3. Decode Raw String   │                     │
   │                      │                          │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │                     │
   │                      │                          │ 4. .once('value', PushID)                    │
   │                      │                          │─────────────────────────────────────────────►│
   │                      │                          │                        │                     │ [Return OK]
   │                      │                          │ 5. Validate Eligibility│                     │
   │                      │                          │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │                     │
   │                      │                          │ 6. .update({status: 'checked_in'})           │
   │                      │                          │─────────────────────────────────────────────►│
   │                      │ 7. Unlock Studio Cards UI│                        │                     │
   │                      │◄─────────────────────────│                        │                     │
   │                      │ 8. Officer Evaluates Studio Loads                 │                     │
   │                      │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│                     │
   │                      │ 9. Click "Assign Studio A"                        │                     │
   │                      │──────────────────────────────────────────────────►│                     │
   │                      │                          │                        │ 10. Run Transaction │
   │                      │                          │                        │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
   │                      │                          │                        │ 11. .transaction()  │
   │                      │                          │                        │────────────────────►│
   │                      │                          │                        │                     │ [Queue #=3]
   │                      │ 12. Render QueueCard & Print Local Number         │                     │
   │                      │◄──────────────────────────────────────────────────│                     │

```

### 11.4 Phase 4 Sequence: Queue Execution & Studio Photography

This sequence details studio waiting room management, session commencement, and terminal record archiving.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       PHASE 4 SEQUENCE: STUDIO SESSION                                 │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

 Studio Ops        admin.html Runtime           Queue Module JS         Legacy System         Firebase DB
   │                      │                          │                        │                     │
   │ 1. Click "Panggil #03 Studio A"                 │                        │                     │
   │─────────────────────►│                          │                        │                     │
   │                      │ 2. Trigger Call Hook     │                        │                     │
   │                      │─────────────────────────►│                        │                     │
   │                      │                          │ 3. Dispatch Local Sync Event                 │
   │                      │                          │───────────────────────►│                     │
   │                      │                          │                        │ (index.html Display)│
   │                      │                          │ 4. .update({status: 'in_progress', startedAt})│
   │                      │                          │─────────────────────────────────────────────►│
   │                      │ 5. Highlight CurrentQueue UI                      │                     │
   │                      │◄─────────────────────────│                        │                     │
   │ 6. Photography Session Executes                                                                │
   │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
   │ 7. Click "Selesaikan Sesi"                      │                        │                     │
   │─────────────────────►│                          │                        │                     │
   │                      │ 8. Process Completion    │                        │                     │
   │                      │─────────────────────────►│                        │                     │
   │                      │                          │ 9. .update({status: 'completed', completedAt})│
   │                      │                          │─────────────────────────────────────────────►│
   │                      │ 10. Archive Record UI    │                        │                     │
   │                      │◄─────────────────────────│                        │                     │

```

---

## 12. Project Folder Architecture

### 12.1 Enterprise Directory Tree Architecture

To ensure long-term code maintainability, isolation of concerns, and clean onboarding, HSGMS mandates the following professional project structure.

```
hsgms-enterprise/
├── assets/
│    ├── icons/                   # Local Lucide Icons SVG Repository (16px, 20px, 24px)
│    ├── illustrations/           # Standardized Empty State & Error Vector Assets
│    └── brand/                   # HS Studio Lockups & Watermark Assets
│
├── css/
│    ├── design-tokens.css        # Core Token Variables (--p-600, --sh-md, --space-4)
│    ├── base-reset.css           # Enterprise HTML5 Reset & Typography Definitions
│    ├── layout-assembly.css      # Grid System, Navbar, Sidebar, ContentWrapper Styles
│    ├── components.css           # BEM Styling for Level 0, 1, and 2 Component Library
│    └── pages/                   # Page-Specific Context Overrides & Print Styles
│         ├── booking.css
│         ├── admin.css
│         ├── database.css
│         └── hasilpembayaran.css
│
├── js/
│    ├── core/
│    │    ├── firebase-config.js  # Serverless SDK Initialization & Connection Handlers
│    │    ├── token-system.js     # Runtime Token Mapping Registry
│    │    └── event-bus.js        # Decoupled Local Inter-Module Event Dispatcher
│    │
│    ├── library/                 # Component Library Rendering Snippets
│    │    ├── primitives/         # Level 0 Form & Button Renderers
│    │    ├── molecules/          # Level 1 Card, Modal, Table Renderers
│    │    └── domain/             # Level 2 BookingCard, QRCard, QueueCard Renderers
│    │
│    └── modules/                 # Decoupled Domain Logic Controllers
│         ├── booking-controller.js
│         ├── payment-controller.js
│         ├── qr-controller.js
│         ├── checkin-controller.js
│         ├── queue-controller.js
│         ├── dashboard-controller.js
│         ├── database-controller.js
│         └── notification-controller.js
│
├── firebase/
│    ├── database.rules.json      # Production Firebase Security & Indexing Rules
│    └── storage.rules.json       # Transfer Proof Image Storage Bucket Permissions
│
├── qrcode/                       # Transient Local QR Image Staging & Export Buffer
├── backup/                       # Offline D-Day Emergency Paper Check-In Templates
├── docs/                         # System Architectural Documentation
│    ├── MASTER_BLUEPRINT.md      # This Single Source of Truth Document
│    ├── COMPONENT_LIBRARY.md     # Component Specification Guide
│    ├── DATABASE_SCHEMA.md       # Firebase Tree Structure Guide
│    ├── PROJECT_RULE.md          # Business Rules & Status Mapping
│    ├── SOP_FLOW.md              # Standard Operating Procedures
│    └── UI_GUIDELINE.md          # Design System Guidelines
│
├── booking.html                  # Public Client Registration Interface
├── admin.html                    # Operational Command Center Interface
├── database.html                 # Enterprise Search & Analytics Interface
├── hasilpembayaran.html          # Financial Auditing Ledger Interface
├── cek.html                      # Legacy Studio Hardware Queue Reader Bridge
└── index.html                    # Legacy Studio Hardware Queue Waiting Room Display

```

### 12.2 File Responsibility & Lifecycle Matrix

| Directory / File Target | Architectural Classification | Build / Runtime Responsibility | Immutable System Constraints |
| --- | --- | --- | --- |
| `/css/design-tokens.css` | Level -1 Primitives | Centralized registry for all visual values. Forbids hardcoded CSS colors in other stylesheets. | Must reflect `UI_GUIDELINE.md` exactly. |
| `/js/library/` | Presentation Layer | Houses pure JavaScript DOM rendering functions matching `COMPONENT_LIBRARY.md` specifications. | Zero direct Firebase reads allowed. |
| `/js/modules/` | Domain Controller Layer | Encapsulates business rules, validation logic, and Firebase Realtime Database SDK calls. | Must enforce linear FSM state rules. |
| `/firebase/*.json` | Infrastructure Layer | Enforces serverless schema validation, user authentication rules, and query performance indexing. | Must include `.indexOn` rules. |
| `*.html` | Root Runtime Targets | Decoupled HTML5 shells hosting specific layout assemblies and loading required JS modules. | Zero inline JS or inline CSS allowed. |

---

## 13. Sprint Roadmap

### 13.1 Enterprise Engineering Sprint Lifecycle

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       ENGINEERING SPRINT ROADMAP                                       │
├───────────────────┬───────────────────┬───────────────────┬───────────────────┬────────────────────┤
│     SPRINT 1      │     SPRINT 2      │     SPRINT 3      │     SPRINT 4      │      SPRINT 5      │
│  Foundation & DB  │  Booking Onboard  │  Admin & QR Ops   │  D-Day & Queue    │  Financial & Audit │
└───────────────────┴───────────────────┴───────────────────┴───────────────────┴────────────────────┘

```

### 13.2 Sprint 1: Architectural Foundation & Database Baseline

* **Engineering Target:** Establish serverless infrastructure, folder structure, design token architecture, and core Component Library rendering primitives.
* **Key Deliverables:**
1. Initialize Firebase Realtime Database project structure with strict JSON security and `.indexOn` rules.
2. Construct `/css/design-tokens.css` and `/css/layout-assembly.css` based on `UI_GUIDELINE.md`.
3. Build vanilla JS rendering assemblies for Level 0 Primitives (`TextInput`, `Select`, `ButtonPrimary`).


* **Technical Milestones:** Sub-50ms token DOM injection verification; zero console errors on base HTML loading.
* **Acceptance Criteria:** Directory tree matches Blueprint §12 exactly; Firebase SDK connects with valid WebSocket handshake.

### 13.3 Sprint 2: Public Client Onboarding Engine (`booking.html`)

* **Engineering Target:** Deliver end-to-end client registration pipeline, input validation, and proof upload mechanics.
* **Key Deliverables:**
1. Assemble `booking.html` utilizing `ContentWrapper` (`form` preset) and `SectionHeader`.
2. Implement `Booking Module` controller with comprehensive client validation (`validateBooking()`).
3. Implement `Payment Module` proof upload mechanics supporting JPG/PNG/PDF (max 5MB).


* **Technical Milestones:** Successful execution of `.push().set()` storing complete record under `/bookings`.
* **Acceptance Criteria:** Invalid forms blocked (`ERR-B01`); oversized files rejected (`ERR-B02`); successful submit displays Push ID and triggers `Alert` success state.

### 13.4 Sprint 3: Administrative Verification Command Center (`admin.html`)

* **Engineering Target:** Deliver verification workflows, status transition engines, and cryptographic QR generation.
* **Key Deliverables:**
1. Assemble `admin.html` with responsive `Navbar`, `Sidebar`, and `BookingCard` grids.
2. Build persistent Firebase WebSocket listeners tracking `pending` records in real time.
3. Implement DP confirmation modal logic (`dp_verified`) and QR encoding controllers (`qr_generated`).


* **Technical Milestones:** Real-time UI updates across multiple browser instances without manual page refresh.
* **Acceptance Criteria:** Linear FSM enforced; skipping statuses blocked; QR string matches `bookingId` exactly.

### 13.5 Sprint 4: D-Day Check-In Engine & Queue Subsystem

* **Engineering Target:** Deploy optical webcam scanning, studio allocation algorithms, and queue engine synchronization.
* **Key Deliverables:**
1. Integrate HTML5 webcam optical scanning engine inside `admin.html`.
2. Build `Check-In Module` controllers handling duplicate scan warnings and lost QR fallbacks (`SOP_FLOW.md` §8.2, §8.3).
3. Implement `Queue Module` transactional increments (`queueRef.transaction()`) and legacy bridges (`cek.html`).


* **Technical Milestones:** Sub-1000ms optical QR decoding to database status mutation.
* **Acceptance Criteria:** Scanned QR mutates record to `checked_in`; studio assignment generates sequential `queueNumber` under `in_queue`.

### 13.6 Sprint 5: Enterprise Search Engine & Financial Ledger (`database.html` & `hasilpembayaran.html`)

* **Engineering Target:** Deliver multi-parameter search indexing, responsive analytical tables, and financial auditing readouts.
* **Key Deliverables:**
1. Assemble `database.html` utilizing debounced `SearchBox`, `Select` multi-filters, and responsive `Table` assemblies.
2. Assemble `hasilpembayaran.html` utilizing read-only `PaymentCard` grids.
3. Build `Dashboard Module` executive widgets (`StatusWidget`, `ActivityTimeline`, `SummaryCard`).


* **Technical Milestones:** Instant search query filtering across simulated 10,000 record database baseline.
* **Acceptance Criteria:** Mobile viewports automatically transform `Table` into `Card` lists; financial ledgers accurately reflect remaining balances; write operations on `hasilpembayaran.html` strictly blocked.

---

## 14. Future Scalability

### 14.1 Architectural Expansion Strategies

While HSGMS v1.0 is optimized for immediate operational deployment, the architecture is engineered to support major enterprise scaling events without destabilizing the core codebase.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       SCALABILITY EVOLUTION PATH                                       │
├───────────────────┬───────────────────┬───────────────────┬───────────────────┬────────────────────┤
│ Multi-Studio Ops  │ Multi-Event Part. │ Role-Based Auth   │ Audit Trail Node  │ Firestore Migration│
└───────────────────┴───────────────────┴───────────────────┴───────────────────┴────────────────────┘

```

### 14.2 Master Studio Scaling (`StudioCapacityManager`)

To scale beyond two studios (Studio A/B), the architecture reserves the `StudioCapacityManager` component. By maintaining master studio configurations inside the root `/studios` node (`capacity`, `isActive`), operational staff can dynamically commission VIP studios or decommission maintenance studios during runtime without altering database schemas.

### 14.3 Multi-Graduation Concurrency (`GraduationEventTabs`)

When HS Studio contracts multiple university graduations simultaneously on the same D-Day, the system scales via `GraduationEventTabs`. The data architecture partitions event streams either by appending university prefixes (`{year}_{universityCode}/{bookingId}`) or by indexing `identity/graduationDate` as a mandatory query partitioning key.

### 14.4 Enterprise Role-Based Security (`AdminLoginForm` & `RoleBadge`)

To harden security as operational staff expands, the architecture reserves `AdminLoginForm` and `RoleBadge`. Firebase Authentication will integrate directly into Firebase Security Rules (`auth.token.role === 'admin'`), enforcing strict cryptographic isolation between Verification Admins, Operational Admins, and D-Day Officers.

### 14.5 Granular Audit Chronology (`AuditHistoryTimeline`)

To meet financial compliance standards, the architecture reserves `AuditHistoryTimeline`. The database tree will expand to append an atomic `/history` sub-collection per booking, logging exact actor IDs, timestamp deltas, and state progression strings (`fromStatus` → `toStatus`) for forensik auditing.

### 14.6 Cloud Firestore Migration Thresholds

If annual booking volumes exceed 100,000 transactional records, or multi-field analytical querying strains Realtime Database memory limits, the architecture establishes a direct migration path to Google Cloud Firestore. Because HSGMS strictly enforces flat JSON modeling and modular data access controllers, data access layers can swap SDK calls without rewriting UI presentation logic.

---

## 15. Design Principles

### 15.1 Architectural Tenets & Software Philosophy

HSGMS adheres strictly to ten permanent architectural design principles. These principles govern all system engineering decisions and forbid standard industry shortcuts.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       CORE ARCHITECTURAL TENETS                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  1. SIMPLE                 6. READABLE
     Zero unnecessary UI clutter. Every element serves an explicit operational purpose.
  2. FAST                   7. REUSABLE
     Sub-150ms UI response times. Strict rejection of bloated JS frameworks.
  3. PROFESSIONAL           8. OFFLINE FRIENDLY
     Enterprise aesthetic built on clean Glassmorphism and strict typographic hierarchy.
  4. MAINTAINABLE           9. MINIMAL CLICK
     Decoupled vanilla JS modules separated strictly by operational domain.
  5. SCALABLE              10. SINGLE SOURCE OF TRUTH
     Flat database modeling engineered for high-throughput concurrency.

```

### 15.2 Detailed Tenet Specifications

1. **Simple:** Reject feature creep. HSGMS strictly manages graduation photography workflows. Unrelated studio management features are aggressively pruned.
2. **Fast:** Optimize DOM interactions. Use pure JavaScript string assembly and direct DOM injection. Animations must never exceed 400ms.
3. **Professional:** Enforce the "One Software" mandate. Public client forms (`booking.html`) and internal admin command centers (`admin.html`) share identical branding, spacing, and visual authority.
4. **Maintainable:** Enforce strict file boundaries. HTML files host zero business logic; CSS files contain zero hardcoded colors; JS files operate strictly within assigned domain controllers.
5. **Scalable:** Design data contracts for high concurrency. Utilize Firebase transactions for queue operations to eliminate race conditions during peak arrival windows.
6. **Readable:** Enforce absolute naming consistency. Use English PascalCase for components (`BookingCard`), BEM kebab-case for CSS (`hsg-booking-card`), and camelCase for DB properties (`fullName`).
7. **Reusable:** Compose complex interfaces from existing primitive elements (`COMPONENT_LIBRARY.md`). Never fork component definitions per page.
8. **Offline Friendly:** Acknowledge physical studio realities. Maintain paper check-in backup protocols for severe network dropouts.
9. **Minimal Click:** Structure operational admin tools for speed. Place primary actions immediately adjacent to data context.
10. **Single Source of Truth:** All four production pages read and mutate the exact same Firebase Realtime Database repository.

---

## 16. Golden Rules

### 16.1 Permanent System Governance Rules

The following fifty Golden Rules represent permanent, non-negotiable architectural mandates for HSGMS. Any commit violating these rules must be rejected during code review.

#### Category 1: Architectural & File Separation Rules

1. **Strict File Decoupling:** Absolutely zero inline JavaScript (`onclick="..."`) or inline CSS (`style="..."`) allowed within `.html` markup.
2. **Zero Monolith Markup:** HTML pages must never contain embedded `<script>` blocks exceeding initialization boilerplate; all domain logic lives in `/js/modules/`.
3. **Unified Database Connection:** All four managed HTML pages (`booking.html`, `admin.html`, `database.html`, `hasilpembayaran.html`) must connect to the exact same Firebase Realtime Database instance.
4. **No Framework Contamination:** Rejection of heavy frontend JS frameworks (React, Vue, Angular, Svelte); HSGMS executes purely on modular vanilla JavaScript.
5. **Strict Module Decoupling:** Level 0 Primitives must never import or execute calls to Level 1, 2, 3, or 4 components.
6. **Unidirectional Component Dependency:** Domain components (Level 2) may compose Molecules (Level 1) and Primitives (Level 0), but Molecules must never reference Domain components.
7. **SSOT Component Definitions:** Every UI component possesses exactly one definition shared across all pages; zero page-specific forks allowed.
8. **No New Components Without Blueprint:** Creating new UI components not documented in `COMPONENT_LIBRARY.md` is strictly forbidden.
9. **Token-Only Styling Mandate:** All CSS properties for color, spacing, radius, and shadow must reference `--variables` from `design-tokens.css`.
10. **Zero Hardcoded Visuals:** Writing raw hex codes (`#2563EB`) or arbitrary pixel padding (`17px`) in component stylesheets is strictly prohibited.

#### Category 2: Database & Data Modeling Rules

11. **Flat Database Hierarchy:** All booking records must be stored as flat objects directly under `/bookings/{bookingId}`.
12. **Max Nesting Depth Limit:** Database JSON structures must never exceed four levels of nesting depth.
13. **Push ID Key Mandate:** Root booking object keys must strictly utilize automated Firebase Push IDs (`bookingId`).
14. **Unix Millisecond Timestamps:** All timestamp fields (`createdAt`, `dpPaidAt`, etc.) must be stored as raw integer Unix milliseconds (`number`).
15. **Mandatory UpdatedAt Hook:** Every database mutation must atomically update the root-level `updatedAt` timestamp.
16. **Partial Mutation Contract:** Database updates must strictly utilize `.update()` targeting sub-nodes; utilizing `.set()` on existing booking objects is forbidden.
17. **No Hourly Booking Schema:** Implementing database fields for booking time slots or booking hours is permanently prohibited.
18. **Transactional Queue Numeration:** Incrementing `queueNumber` must strictly execute through Firebase `.transaction()` handlers to prevent race conditions.
19. **Mandatory Index Rules:** The `database.rules.json` configuration must explicitly index `status`, `identity/graduationDate`, and `createdAt`.
20. **Sub-Node Logical Partitioning:** Booking objects must strictly segregate data into `identity`, `payment`, `qr`, `studio`, and `queue` sub-nodes.

#### Category 3: UI/UX & Design Token Rules

21. **Strict Font Stack:** UI components must exclusively utilize Inter or Plus Jakarta Sans; monospace strings must use JetBrains Mono.
22. **Max Font Size Variation:** No single UI component or Card may implement more than three distinct font sizes.
23. **Strict Line Length Limits:** Text body copy containers must enforce maximum widths of 65–75 characters per line.
24. **Color Semantic Exclusivity:** Red (`--d-500`) is strictly reserved for destructive/error actions; Green (`--s-600`) is strictly reserved for success/completed states.
25. **No Opacity-Only Statuses:** Status indicators must never rely solely on color or opacity; explicit UPPERCASE text labels are mandatory.
26. **Strict Button Hierarchy:** Each page section or Card footer may contain a maximum of one `ButtonPrimary` instance.
27. **Action Order Enforcement:** In multi-button toolbars, primary actions must sit on the right, secondary actions on the left.
28. **Icon + Label Mandate:** Primary, secondary, and destructive buttons must always display explicit text labels alongside icons.
29. **Selective Glassmorphism:** Glassmorphism styling (`--sh-glass`) is restricted to Cards, Modals, and Sidebars; form input fields must remain solid.
30. **Animation Duration Cap:** Standard UI transition animations must never exceed 400ms duration.

#### Category 4: Workflow, State & Coding Rules

31. **Linear Status Progression:** Status transitions must follow exact sequential order; skipping states (e.g., `PENDING` directly to `CHECKED_IN`) is illegal.
32. **No Status Regression:** Reverting a booking record to a preceding business status (e.g., `IN_QUEUE` back to `DP_VERIFIED`) is prohibited.
33. **Terminal State Immutability:** Records marked `completed` or `cancelled` are permanently locked; further status transitions are blocked.
34. **Mandatory Actor Identification:** Every administrative status transition must log the exact username or ID of the acting admin.
35. **Validation Post-Blur:** Inline form validation errors must trigger strictly on input `onBlur`, never during active keystrokes.
36. **Specific Error Messaging:** Error strings must explicitly describe the failure and solution; generic messages like "Error" are forbidden.
37. **No Auto-Dismiss Errors:** Toast notifications displaying error states must never auto-dismiss; manual user closure is required.
38. **Max Concurrent Toasts:** The screen runtime must never render more than three Toast notifications simultaneously.
39. **Destructive Action Dialogs:** Executing any destructive action (`ButtonDanger`) must mandate prior user confirmation via `ConfirmDialog`.
40. **Mandatory Loading Feedback:** Every interactive CTA button must provide immediate visual feedback (spinner or disabled state) upon click.

#### Category 5: Operations, Security & Domain Boundaries

41. **No Payment Gateways:** Integrating third-party payment APIs (Midtrans, Xendit, Stripe) is permanently prohibited.
42. **Manual DP Audit Mandate:** Down payment verification must strictly require administrative auditing of uploaded transfer proof images.
43. **1-to-1 QR String Encoding:** QR Codes must encode the exact Firebase Push ID string of the booking record; zero external URL shorteners allowed.
44. **Single-Scan QR Validity:** Each generated QR Code is valid for exactly one on-site check-in scan; duplicate scan attempts must trigger fraud warnings.
45. **On-Site Studio Allocation:** Studio allocation occurs strictly on-site during D-Day check-in; online client studio booking is forbidden.
46. **Local Queue Numeration:** Studio queue numbers must be assigned sequentially based on physical check-in timestamps.
47. **Read-Only Financial Auditing:** The `hasilpembayaran.html` runtime is permanently restricted to read-only access; write operations are illegal.
48. **Internal Identity Privacy:** Client academic and contact profiles must never be exposed on publicly unauthenticated web viewports.
49. **Emergency Paper Backups:** Physical studio facilities must maintain printed check-in ledgers to survive severe internet outages.
50. **SLA Verification Limits:** Administrative DP verification must execute within a strict 1×24 hour operational window.

---

## 17. Master Diagram

### 17.1 Colossal Unified Software Architecture Diagram

This master diagram synthesizes all presentation interfaces, runtime module engines, real-time serverless data flows, administrative verification pipelines, cryptographic QR tracking mechanics, on-site D-Day physical studio operations, local queue systems, and financial auditing ledgers into one unified architectural representation.

```
╔═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                     HS STUDIO GRADUATION MANAGEMENT SYSTEM (HSGMS) — MASTER SYSTEM BLUEPRINT                                                ║
╚═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

                                                                         ┌───────────────────────────────────────┐
                                                                         │           EXTERNAL CLIENT             │
                                                                         │     (Graduation Student Persona)      │
                                                                         └───────────────────┬───────────────────┘
                                                                                             │
                                                                                             │ 1. Access Public Registration UI
                                                                                             ▼
                                                                         ┌───────────────────────────────────────┐
                                                                         │             booking.html              │
                                                                         │  ├── Level 3: ContentWrapper (form)   │
                                                                         │  ├── Level 0: TextInput, Select       │
                                                                         │  └── Level 0: UploadArea (DP Proof)   │
                                                                         └───────────────────┬───────────────────┘
                                                                                             │
                                                                                             │ 2. Validate Input + Upload Proof
                                                                                             │ 3. Construct Payload (Status: PENDING)
                                                                                             │ 4. Execute Firebase SDK .push().set()
                                                                                             ▼
╔═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║ FIREBASE REALTIME DATABASE CLOUD INFRASTRUCTURE (Serverless Data Backbone)                                                                                                  ║
║                                                                                                                                                                             ║
║   /bookings                                                                                                                                                                 ║
║    └── /-O_xK2mLpQrAbCdEfGhI  [Indexed Push ID Key]                                                                                                               ║
║         ├── identity/   { fullName, phoneNumber, universityName, facultyName, studyProgram, graduationDate }                                                      ║
║         ├── payment/    { dpAmount, dpPaidAt, dpVerifiedBy, paymentMethod, transferProofUrl, remainingBalance }                                                   ║
║         ├── qr/         { qrCode, qrGeneratedAt, qrGeneratedBy, qrScannedAt, qrScannedBy }                                                                        ║
║         ├── studio/     { studioId, studioName, studioAssignedAt, studioAssignedBy }                                                                              ║
║         ├── queue/      { queueNumber, queueEnteredAt, photoStartedAt, photoCompletedAt }                                                                         ║
║         └── status    : "pending" → "dp_verified" → "qr_generated" → "checked_in" → "in_queue" → "in_progress" → "completed" (or "cancelled")                       ║
╚══════════════════════════════════════════▲═════════════════════════════════════════════▲═════════════════════════════════════════════▲══════════════════════════════════════╝
                                           │                                             │                                             │
               Persistent WSS Listener     │ Admin Partial .update()                     │ Officer Camera Scan .update()               │ Financial Read-Only Stream
               .on('value')      │ .update(QR Data)                  │ Transactional Queue Increment     │ .once('value')
                                           ▼                                             ▼                                             ▼
┌────────────────────────────────────────────────────────────────────┐     ┌────────────────────────────────────────────────────────────────────┐     ┌───────────────────────┐
│ admin.html  (Verification & QR Generation Command Center)          │     │ admin.html / database.html  (D-Day On-Site Studio Ops)             │     │ hasilpembayaran.html  │
│                                                                    │     │                                                                    │     │ (Financial Audit UI)  │
│  ┌──────────────────────────────────────────────────────────────┐  │     │  ┌──────────────────────────────────────────────────────────────┐  │     │  ┌─────────────────┐  │
│  │ VERIFICATION PIPELINE                                        │  │     │  │ ON-SITE CHECK-IN ENGINE                                      │  │     │  │ Read-Only Ledger│  │
│  │  1. Intercept 'pending' records via real-time stream         │  │     │  │  1. Officer captures client QR frame via HTML5 webcam stream │  │     │  │ Renders grids of│  │
│  │  2. Admin audits uploaded bank transfer proof image          │  │     │  │  2. Vanilla JS optical decoder extracts Push ID string       │  │     │  │ PaymentCards    │  │
│  │  3. Click "Konfirmasi DP" → Mutate status to 'dp_verified'   │  │     │  │  3. Query Firebase → Validate eligibility (ERR-Q02 check)    │  │     │  │ displaying DP   │  │
│  └──────────────────────────────┬───────────────────────────────┘  │     │  │  4. Mutate status to 'checked_in' + log qrScannedAt          │  │     │  │ timestamps and  │  │
│                                 │                                  │     │  └──────────────────────────────┬───────────────────────────────┘  │     │  │ remaining       │  │
│                                 ▼                                  │     │                                 │                                  │     │  │ balances.       │  │
│  ┌──────────────────────────────────────────────────────────────┐  │     │                                 ▼                                  │     │  │                 │  │
│  │ QR DISPATCH CONTROLLER                                       │  │     │  ┌──────────────────────────────────────────────────────────────┐  │     │  │ Write operations│  │
│  │  1. Click "Generate QR Code" → Encode Push ID into image     │  │     │  │ DYNAMIC STUDIO ALLOCATION                                    │  │     │  │ strictly blocked│  │
│  │  2. Mutate status to 'qr_generated' + log qrGeneratedBy      │  │     │  │  1. Officer evaluates active loads via StudioCards           │  │     │  └─────────────────┘  │
│  │  3. Render QRCard → Dispatch string via WhatsApp link URL    │  │     │  │  2. Click "Assign Studio A" → Run Firebase .transaction()    │  │     └───────────────────────┘
│  └──────────────────────────────────────────────────────────────┘  │     │  │  3. Assign sequential queueNumber → Mutate to 'in_queue'     │  │
└────────────────────────────────────────────────────────────────────┘     │  └──────────────────────────────┬───────────────────────────────┘  │
                                                                           └─────────────────────────────────┼──────────────────────────────────┘
                                                                                                             │
                                                                                                             │ Broadcast Decoupled Event Bridge
                                                                                                             │ Payload: { bookingId, studioName, queueNumber }
                                                                                                             ▼
                                                                           ┌────────────────────────────────────────────────────────────────────┐
                                                                           │ EXISTING STUDIO QUEUE SUBSYSTEM BRIDGE                             │
                                                                           │                                                                    │
                                                                           │  ┌───────────────────────────┐      ┌───────────────────────────┐  │
                                                                           │  │         cek.html          │─────►│        index.html         │  │
                                                                           │  │   (Queue Reader Bridge)   │ Sync │  (Waiting Room Display)   │  │
                                                                           │  └───────────────────────────┘      └───────────────────────────┘  │
                                                                           └────────────────────────────────────────────────────────────────────┘

```

---

## Document Verification & Compliance Sign-Off

I hereby validate that this `MASTER_BLUEPRINT.md` architecture document accurately, rigorously, and exhaustively synthesizes all system constraints, negative prohibitions, database schemas, component libraries, design tokens, operational workflows, and golden governance rules mandated for the HS Studio Graduation Management System (HSGMS).

**Architectural Sign-Off:**
`Chief Software Architect & Enterprise System Designer`
`HS Studio Digital Transformation Taskforce`
*Document Locked for Production Engineering Baseline — Sprint 1*