/**
 * ===========================================================
 * HS Studio Graduation Management System (HSGMS)
 * File      : booking.js
 * Sprint    : 1B (Revision) → 2C (Orchestrator) → 3C (Revision)
 *
 * Purpose:
 * Core Booking State Engine. Manages the transient state of
 * a booking operation using a reactive Publish-Subscribe pattern.
 * As of Sprint 2C, also acts as the submission orchestrator,
 * coordinating upload-storage.js and database-service.js.
 *
 * Architecture:
 * Pure Vanilla JavaScript (ES Modules).
 * Strictly isolated from DOM manipulation, validation, and Firebase.
 * ===========================================================
 */

// ===========================================================
// Service Imports
// booking.js hanya mengorkestrasikan; pekerjaan berat
// dilakukan oleh service yang sudah dibuat.
// ===========================================================
import { uploadTransferProof } from "./upload-storage.js";
import { createBooking }       from "./database-service.js";

/**
 * @typedef {Object} BookingInfo
 * @property {string} bookingNumber
 * @property {string} bookingToken
 * @property {string} bookingId
 */

/**
 * @typedef {Object} CustomerData
 * @property {string} fullName
 * @property {string} phoneNumber
 * @property {string} universityName
 * @property {string} facultyName
 * @property {string} studyProgram
 * @property {string} graduationDate
 * @property {string} notes
 */

/**
 * @typedef {Object} PackageData
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {number} dp
 */

/**
 * @typedef {Object} PaymentData
 * @property {number} dpAmount
 * @property {string} paymentMethod
 * @property {string} transferProofUrl
 */

/**
 * @typedef {Object} TimestampData
 * @property {number|null} createdAt
 * @property {number|null} updatedAt
 */

/**
 * @typedef {Object} BookingState
 * @property {BookingInfo} booking
 * @property {CustomerData} customer
 * @property {PackageData} selectedPackage
 * @property {PaymentData} payment
 * @property {string} status
 * @property {TimestampData} timestamp
 */

/**
 * Immutable initial state blueprint to ensure clean resets.
 * @constant {BookingState}
 */
const INITIAL_STATE = Object.freeze({
    booking: {
        bookingNumber: "",
        bookingToken:  "",
        bookingId:     ""       // Stores Firebase Push ID after submission
    },
    customer: {
        fullName:       "",
        phoneNumber:    "",
        universityName: "",
        facultyName:    "",
        studyProgram:   "",
        graduationDate: "",
        notes:          ""
    },
    selectedPackage: {
        id:    "",
        name:  "",
        price: 0,
        dp:    50000
    },
    payment: {
        dpAmount:         0,
        paymentMethod:    "",
        transferProofUrl: ""
    },
    status: "WAITING_APPROVAL",
    timestamp: {
        createdAt: null,
        updatedAt: null
    }
});

// Internal mutable state
let state = structuredClone(INITIAL_STATE);

// Set to hold subscriber callback functions
const subscribers = new Set();

/**
 * Notifies all active subscribers with a deep copy of the current state.
 * @private
 */
const _notifySubscribers = () => {
    const stateCopy = getState();
    subscribers.forEach(callback => {
        try {
            callback(stateCopy);
        } catch (error) {
            console.error("HSGMS State Engine: Subscriber callback error", error);
        }
    });
};

/**
 * Retrieves a deep copy of the current booking state to prevent accidental mutations.
 * @returns {BookingState} The current state object.
 */
export const getState = () => {
    return structuredClone(state);
};

/**
 * Updates the booking state with a partial payload and triggers subscribers.
 * Performs a shallow merge for top-level keys and nested objects.
 * @param {Partial<BookingState>} updates - The partial state data to merge.
 */
export const updateState = (updates) => {
    if (!updates || typeof updates !== "object") return;

    for (const key in updates) {
        if (Object.hasOwn(updates, key)) {
            // Merge nested objects (booking, customer, selectedPackage, payment, timestamp)
            if (
                typeof updates[key] === "object" &&
                updates[key] !== null &&
                !Array.isArray(updates[key])
            ) {
                state[key] = { ...state[key], ...updates[key] };
            } else {
                // Assign primitive values directly (status, etc.)
                state[key] = updates[key];
            }
        }
    }

    _notifySubscribers();
};

/**
 * Reverts the state completely to its initial blueprint and triggers subscribers.
 */
export const resetState = () => {
    state = structuredClone(INITIAL_STATE);
    _notifySubscribers();
};

/**
 * Registers a callback function to listen for state changes.
 * @param {Function} callback - The function to execute when state updates.
 * @returns {Function} An unsubscribe function for convenience.
 */
export const subscribe = (callback) => {
    if (typeof callback !== "function") {
        throw new Error("HSGMS State Engine: Subscriber must be a function.");
    }

    subscribers.add(callback);

    // Return unsubscribe wrapper
    return () => unsubscribe(callback);
};

/**
 * Removes a previously registered callback from the subscriber list.
 * @param {Function} callback - The function to remove.
 * @returns {boolean} True if the subscriber was found and removed, false otherwise.
 */
export const unsubscribe = (callback) => {
    return subscribers.delete(callback);
};

// ===========================================================
// Booking Submission Orchestrator
// ===========================================================

/**
 * Orchestrates the full booking submission pipeline.
 *
 * Steps:
 * 1. Read current booking state
 * 2. Upload transfer proof file via upload-storage.js
 * 3. Update payment.transferProofUrl in state with the returned URL
 * 4. Build booking payload mapped to DATABASE_SCHEMA.md structure
 * 5. Persist booking via database-service.js
 * 6. Update booking.bookingId in state
 * 7. Return bookingId to the calling UI layer
 *
 * This function MUST NOT:
 * - Read or query the DOM
 * - Display alerts, toasts, or any UI feedback
 * - Redirect the browser
 *
 * Error handling is delegated entirely to the caller.
 *
 * @param {File} transferProofFile - The File object for the DP
 * transfer proof, supplied by the UI layer.
 * @returns {Promise<string>} Resolves with the Firebase Push ID
 * (bookingId) on success.
 * @throws {Error} Re-throws any error from the service layer.
 */
export const submitBooking = async (transferProofFile) => {
    try {
        // --- Step 1: Upload the transfer proof file ---
        // Delegates entirely to upload-storage.js.
        // uploadResult is an object containing { provider, fileId, fileName, url }
        const uploadResult = await uploadTransferProof(transferProofFile);

        // --- Step 2: Persist the Download URL into state ---
        updateState({
            payment: { transferProofUrl: uploadResult.url }
        });

        // --- Step 3: Build the database payload from state ---
        // Re-read state after updateState() to include the URL above.
        // Maps state shape → DATABASE_SCHEMA.md structure.
        const updatedState = getState();

        const bookingPayload = {
            identity: {
                fullName:       updatedState.customer.fullName,
                phoneNumber:    updatedState.customer.phoneNumber,
                universityName: updatedState.customer.universityName,
                facultyName:    updatedState.customer.facultyName,
                studyProgram:   updatedState.customer.studyProgram,
                graduationDate: updatedState.customer.graduationDate,
                notes:          updatedState.customer.notes
            },
            payment: {
                dpAmount:         updatedState.selectedPackage.dp,
                paymentMethod:    updatedState.payment.paymentMethod,
                transferProofUrl: updatedState.payment.transferProofUrl,
                remainingBalance: updatedState.selectedPackage.price - updatedState.selectedPackage.dp
            }
        };

        // --- Step 4: Persist the booking to Firebase Realtime Database ---
        // Delegates entirely to database-service.js.
        const bookingId = await createBooking(bookingPayload);

        // --- Step 5: Store the Push ID into state ---
        updateState({
            booking: { bookingId }
        });

        // --- Step 6: Return bookingId to the calling UI layer ---
        return bookingId;

    } catch (error) {
        // Re-throw with HSGMS prefix; UI layer handles user feedback.
        throw new Error(
            `HSGMS Booking Orchestrator: Proses submit booking gagal. ${error.message}`
        );
    }
};