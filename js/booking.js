/**
 * ===========================================================
 * HS Studio Graduation Management System (HSGMS)
 * File : booking.js
 * Sprint : 1B (Revision)
 * * Purpose:
 * Core Booking State Engine. Manages the transient state of 
 * a booking operation using a reactive Publish-Subscribe pattern.
 * * Architecture:
 * Pure Vanilla JavaScript (ES Modules).
 * Strictly isolated from DOM manipulation, validation, and Firebase.
 * ===========================================================
 */

/**
 * @typedef {Object} BookingInfo
 * @property {string} bookingNumber
 * @property {string} bookingToken
 */

/**
 * @typedef {Object} CustomerData
 * @property {string} fullName
 * @property {string} phoneNumber
 * @property {string} universityName
 * @property {number|string} familyCount
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

/** * Immutable initial state blueprint to ensure clean resets
 * @constant {BookingState}
 */
const INITIAL_STATE = Object.freeze({
    booking: {
        bookingNumber: "",
        bookingToken: ""
    },
    customer: {
        fullName: "",
        phoneNumber: "",
        universityName: "",
        familyCount: "",
        notes: ""
    },
    selectedPackage: {
        id: "",
        name: "",
        price: 0,
        dp: 50000
    },
    payment: {
        dpAmount: 0,
        paymentMethod: "",
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