/**
 * ===========================================================
 * HS Studio Graduation Management System (HSGMS)
 * File      : database-service.js
 * Sprint    : 2B
 *
 * Purpose:
 * Dedicated Firebase Realtime Database Service for persisting
 * new client booking records.
 * Strictly adheres to the Single Responsibility Principle.
 *
 * Responsibilities (ONLY):
 *  - Construct a complete booking object per DATABASE_SCHEMA.md
 *  - Generate a Firebase Push ID via push()
 *  - Persist the booking object to /bookings/{pushId}
 *  - Return the generated bookingId (Push ID) to the caller
 *
 * This module MUST NOT:
 *  - Upload files to Firebase Storage
 *  - Read or interact with any HTML form element
 *  - Perform UI-layer validation
 *  - Redirect pages or navigate the browser
 *  - Generate QR Codes
 *  - Manipulate the DOM
 *  - Display alerts, toasts, or any visual feedback
 *
 * Architecture:
 * Vanilla JavaScript (ES Modules) + Firebase Modular SDK v12
 * Deployed via Netlify.
 *
 * Consumed by:
 * booking.js (form submission orchestrator)
 * ===========================================================
 */

// ===========================================================
// Initialization — Import Firebase Database instance & SDK methods
// DO NOT re-initialize Firebase; use the centralized instance.
// ===========================================================
import { database } from "./firebase-config.js";
import {
    ref,
    push,
    set
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";


// ===========================================================
// Constants — Database configuration
// ===========================================================

/**
 * Root node path in Firebase Realtime Database where all
 * booking records are stored.
 * @constant {string}
 */
const BOOKINGS_NODE = "bookings";

/**
 * Initial booking status assigned at the moment of creation.
 * Per DATABASE_SCHEMA.md §4 FSM: booking.html only ever
 * sets this value; all subsequent transitions are admin-only.
 * @constant {string}
 */
const INITIAL_STATUS = "pending";


// ===========================================================
// Helper — Build a complete booking object
// ===========================================================

/**
 * Constructs a full, schema-compliant booking object from the
 * caller-supplied payload.
 *
 * Every sub-node and every field defined in DATABASE_SCHEMA.md
 * is explicitly represented — including fields whose values are
 * not yet available at booking-creation time.  Uninitialised
 * fields are set to `null` rather than being omitted, so that:
 *  - Firebase Realtime Database receives a consistent tree shape
 *  - Admin modules can rely on field existence without guards
 *  - Future partial `.update()` calls only overwrite what they
 *    intend to, never inadvertently creating missing nodes.
 *
 * @param {Object} bookingData - Payload supplied by the caller.
 * @param {Object} bookingData.identity   - Client academic profile fields.
 * @param {Object} bookingData.payment    - Payment-related fields available at booking time.
 * @returns {Object} A fully-structured booking object ready for `.set()`.
 */
const buildBookingObject = (bookingData) => {
    const now = Date.now();

    return {
        // ---------------------------------------------------------
        // identity — Static client academic & personal profile.
        // Populated entirely by the client at booking time.
        // Never mutated by admin modules after creation.
        // ---------------------------------------------------------
        identity: {
            fullName:        bookingData.identity?.fullName        ?? "",
            phoneNumber:     bookingData.identity?.phoneNumber     ?? "",
            universityName:  bookingData.identity?.universityName  ?? "",
            facultyName:     bookingData.identity?.facultyName     ?? "",
            studyProgram:    bookingData.identity?.studyProgram    ?? "",
            graduationDate:  bookingData.identity?.graduationDate  ?? "",
            notes:           bookingData.identity?.notes           ?? ""
        },

        // ---------------------------------------------------------
        // payment — Financial ledger for the DP transaction.
        // dpAmount, paymentMethod, and transferProofUrl are seeded
        // at booking time; the remaining fields are filled by admin
        // during the dp_verified transition.
        // ---------------------------------------------------------
        payment: {
            dpAmount:         bookingData.payment?.dpAmount         ?? 0,
            dpPaidAt:         null,
            dpVerifiedBy:     null,
            paymentMethod:    bookingData.payment?.paymentMethod    ?? "",
            transferProofUrl: bookingData.payment?.transferProofUrl ?? null,
            remainingBalance: bookingData.payment?.remainingBalance ?? 0
        },

        // ---------------------------------------------------------
        // qr — Cryptographic identity tracking data.
        // All fields are null at creation; populated by admin
        // during qr_generated and checked_in transitions.
        // ---------------------------------------------------------
        qr: {
            qrCode:        null,
            qrGeneratedAt: null,
            qrGeneratedBy: null,
            qrScannedAt:   null,
            qrScannedBy:   null
        },

        // ---------------------------------------------------------
        // studio — On-site studio allocation data.
        // All fields are null at creation; populated by D-Day
        // officer during the in_queue transition.
        // ---------------------------------------------------------
        studio: {
            studioId:         null,
            studioName:       null,
            studioAssignedAt: null,
            studioAssignedBy: null
        },

        // ---------------------------------------------------------
        // queue — Real-time session execution metrics.
        // All fields are null at creation; populated progressively
        // as the client moves through the on-site queue pipeline.
        // ---------------------------------------------------------
        queue: {
            queueNumber:      null,
            queueEnteredAt:   null,
            photoStartedAt:   null,
            photoCompletedAt: null
        },

        // ---------------------------------------------------------
        // Root-level booking metadata
        // ---------------------------------------------------------
        status:    INITIAL_STATUS,
        createdAt: now,
        updatedAt: now
    };
};


// ===========================================================
// Main Database Function
// ===========================================================

/**
 * Persists a new booking record to Firebase Realtime Database
 * and returns the auto-generated Firebase Push ID (bookingId).
 *
 * Execution steps:
 *  1. Generate a new Push ID reference under /bookings
 *  2. Build the complete schema-compliant booking object
 *  3. Write the object atomically via set()
 *  4. Return the bookingId string to the caller
 *
 * The caller (booking.js) is responsible for supplying a valid
 * bookingData payload and for handling any thrown errors in the
 * UI layer (e.g., displaying a Toast notification).
 *
 * @param {Object} bookingData - Booking payload from the caller.
 * @param {Object} bookingData.identity
 *   @param {string} bookingData.identity.fullName
 *   @param {string} bookingData.identity.phoneNumber
 *   @param {string} bookingData.identity.universityName
 *   @param {string} bookingData.identity.facultyName
 *   @param {string} bookingData.identity.studyProgram
 *   @param {string} bookingData.identity.graduationDate
 *   @param {string} [bookingData.identity.notes]
 * @param {Object} bookingData.payment
 *   @param {number} bookingData.payment.dpAmount
 *   @param {string} bookingData.payment.paymentMethod
 *   @param {string|null} [bookingData.payment.transferProofUrl]
 *   @param {number} bookingData.payment.remainingBalance
 *
 * @returns {Promise<string>} Resolves with the Firebase Push ID
 *   string (bookingId) on success.
 * @throws {Error} Throws a descriptive Error if the write
 *   operation fails. Never calls alert() or touches the DOM.
 *
 * @example
 * // Usage in booking.js:
 * import { createBooking } from "./database-service.js";
 *
 * try {
 *   const bookingId = await createBooking({
 *     identity: { fullName, phoneNumber, universityName, ... },
 *     payment:  { dpAmount, paymentMethod, transferProofUrl, remainingBalance }
 *   });
 *   // bookingId is the Firebase Push ID, e.g. "-O_xK2mLpQrAbCdEfGhI"
 *   // Pass it to the UI layer or state engine as needed.
 * } catch (error) {
 *   // Handle error in the UI layer (e.g., show Toast)
 *   console.error(error.message);
 * }
 */
export const createBooking = async (bookingData) => {
    // --- Step 1: Basic payload guard ---
    // Defensive check; deep validation is the caller's responsibility.
    if (!bookingData || typeof bookingData !== "object") {
        throw new Error(
            "HSGMS Database: bookingData tidak valid. " +
            "Pastikan payload dikirim dalam bentuk object."
        );
    }

    try {
        // --- Step 2: Generate a new Push ID reference ---
        // push() generates a globally-unique, time-ordered Push ID
        // without writing any data — consistent with Golden Rule §13.
        const bookingsRef  = ref(database, BOOKINGS_NODE);
        const bookingRef   = push(bookingsRef);
        const bookingId    = bookingRef.key;

        // --- Step 3: Build the full schema-compliant booking object ---
        const bookingObject = buildBookingObject(bookingData);

        // --- Step 4: Atomically write the booking object to the database ---
        await set(bookingRef, bookingObject);

        // --- Step 5: Return the Push ID to the caller ---
        return bookingId;

    } catch (error) {
        // Re-throw with HSGMS-prefixed context message.
        // The calling layer is responsible for all user-facing feedback.
        throw new Error(
            `HSGMS Database: Gagal menyimpan data booking. ${error.message}`
        );
    }
};


// ===========================================================
// Export
// ===========================================================
// createBooking is exported as a named export above.
// No default export is used; consistent with the ES Module
// pattern adopted across all HSGMS js/ modules.