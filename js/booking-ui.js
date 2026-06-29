/**
 * ===========================================================
 * HS Studio Graduation Management System (HSGMS)
 * File      : booking-ui.js
 * Sprint    : 1C-A (Revision)
 * Location  : /js/modules/booking-ui.js
 *
 * Purpose:
 * Presentation Layer for the client booking interface (booking.html).
 * Manages UI interactions, stepper navigation states, DOM event listeners,
 * and handles bidirectional data binding with the core State Engine.
 *
 * Architecture:
 * Vanilla JavaScript (ES Modules) + Netlify.
 * Strictly decoupled from Firebase operational database mutations and 
 * business logic validation.
 * ===========================================================
 */

// Import core State Engine capabilities
import { getState, updateState, subscribe } from "./booking.js";

/**
 * Transient UI Stepper State
 * @private
 */
let currentStep = 1;
const TOTAL_STEPS = 4;

/**
 * Cache Object for DOM Elements to optimize selection performance
 * @private
 */
const DOM = {
    form: null,
    sections: [],
    navSteps: [],
    btnPrev: null,
    btnNext: null,
    btnSubmit: null,
    inputs: {
        packageRadios: null,
        fullName: null,
        phoneNumber: null,
        universityName: null,
        familyCount: null,
        notes: null
    },
    summary: {
        package: null,
        name: null,
        phone: null,
        univ: null,
        family: null,
        notes: null
    }
};

/**
 * Initializes DOM elements and caches references
 * @private
 */
const _initDOMElements = () => {
    DOM.form = document.getElementById("bookingForm");
    
    // Cache stepper sections and step indicators
    DOM.sections = [
        document.getElementById("step-1"),
        document.getElementById("step-2"),
        document.getElementById("step-3"),
        document.getElementById("step-4")
    ];
    
    DOM.navSteps = [
        document.getElementById("nav-step-1"),
        document.getElementById("nav-step-2"),
        document.getElementById("nav-step-3"),
        document.getElementById("nav-step-4")
    ];

    // Cache navigational action elements
    DOM.btnPrev = document.getElementById("btnPrev");
    DOM.btnNext = document.getElementById("btnNext");
    DOM.btnSubmit = document.getElementById("btnSubmit");

    // Cache form inputs
    DOM.inputs.packageRadios = document.querySelectorAll('input[name="packageId"]');
    DOM.inputs.fullName = document.getElementById("fullName");
    DOM.inputs.phoneNumber = document.getElementById("phoneNumber");
    DOM.inputs.universityName = document.getElementById("universityName");
    DOM.inputs.familyCount = document.getElementById("familyCount");
    DOM.inputs.notes = document.getElementById("notes");

    // Cache confirmation summary surfaces
    DOM.summary.package = document.getElementById("summaryPackage");
    DOM.summary.name = document.getElementById("summaryName");
    DOM.summary.phone = document.getElementById("summaryPhone");
    DOM.summary.univ = document.getElementById("summaryUniv");
    DOM.summary.family = document.getElementById("summaryFamily");
    DOM.summary.notes = document.getElementById("summaryNotes");
};

/**
 * Populates the confirmation step summary with data retrieved from the State Engine
 * @public
 */
export const populateSummary = () => {
    const currentState = getState();
    
    if (DOM.summary.package) DOM.summary.package.textContent = currentState.selectedPackage.name || "-";
    if (DOM.summary.name) DOM.summary.name.textContent = currentState.customer.fullName || "-";
    if (DOM.summary.phone) DOM.summary.phone.textContent = currentState.customer.phoneNumber ? `+62 ${currentState.customer.phoneNumber}` : "-";
    if (DOM.summary.univ) DOM.summary.univ.textContent = currentState.customer.universityName || "-";
    if (DOM.summary.family) DOM.summary.family.textContent = currentState.customer.familyCount || "-";
    if (DOM.summary.notes) DOM.summary.notes.textContent = currentState.customer.notes || "-";
};

/**
 * Coordinates visual transformations based on the active structural step iteration
 * @public
 */
export const updateStepperUI = () => {
    // Synchronize section visibility masks
    DOM.sections.forEach((section, index) => {
        if (section) {
            section.style.display = (index + 1 === currentStep) ? "block" : "none";
        }
    });

    // Synchronize stepper status badges
    DOM.navSteps.forEach((step, index) => {
        if (step) {
            if (index + 1 === currentStep) {
                step.classList.add("is-active");
            } else {
                step.classList.remove("is-active");
            }
        }
    });

    // Handle button modifiers and state constraints
    if (DOM.btnPrev) {
        DOM.btnPrev.disabled = (currentStep === 1);
    }

    if (currentStep === TOTAL_STEPS) {
        if (DOM.btnNext) DOM.btnNext.style.display = "none";
        if (DOM.btnSubmit) DOM.btnSubmit.style.display = "block";
        populateSummary();
    } else {
        if (DOM.btnNext) DOM.btnNext.style.display = "block";
        if (DOM.btnSubmit) DOM.btnSubmit.style.display = "none";
    }
};

/**
 * Binds DOM change and input listeners to achieve unidirectional data mapping to state
 * @private
 */
const _bindDataTracking = () => {
    // Package mapping data binding framework
    DOM.inputs.packageRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            const pkgValue = e.target.value;
            let pkgName = "";

            switch (pkgValue) {
                case "pkg_1":
                    pkgName = "Paket 1 - Basic";
                    break;
                case "pkg_2":
                    pkgName = "Paket 2 - Premium";
                    break;
                case "pkg_3":
                    pkgName = "Paket 3 - VIP";
                    break;
                default:
                    pkgName = "Unknown Package";
            }

            updateState({
                selectedPackage: {
                    id: pkgValue,
                    name: pkgName
                }
            });
        });
    });

    // Customer academic and personal data tracking mechanics
    if (DOM.inputs.fullName) {
        DOM.inputs.fullName.addEventListener("input", (e) => {
            updateState({ customer: { fullName: e.target.value } });
        });
    }

    if (DOM.inputs.phoneNumber) {
        DOM.inputs.phoneNumber.addEventListener("input", (e) => {
            updateState({ customer: { phoneNumber: e.target.value } });
        });
    }

    if (DOM.inputs.universityName) {
        DOM.inputs.universityName.addEventListener("input", (e) => {
            updateState({ customer: { universityName: e.target.value } });
        });
    }

    if (DOM.inputs.familyCount) {
        DOM.inputs.familyCount.addEventListener("input", (e) => {
            updateState({ customer: { familyCount: e.target.value } });
        });
    }

    if (DOM.inputs.notes) {
        DOM.inputs.notes.addEventListener("input", (e) => {
            updateState({ customer: { notes: e.target.value } });
        });
    }
};

/**
 * Attaches navigational action interaction event listeners
 * @private
 */
const _bindNavigationControls = () => {
    if (DOM.btnNext) {
        DOM.btnNext.addEventListener("click", () => {
            if (currentStep < TOTAL_STEPS) {
                currentStep++;
                updateStepperUI();
            }
        });
    }

    if (DOM.btnPrev) {
        DOM.btnPrev.addEventListener("click", () => {
            if (currentStep > 1) {
                currentStep--;
                updateStepperUI();
            }
        });
    }
};

/**
 * Central initialization orchestrator for the presentation layer context
 * Runs automatically upon script context attachment inside web browser environments.
 */
const initBookingUI = () => {
    _initDOMElements();
    _bindDataTracking();
    _bindNavigationControls();

    // Execute initial presentation state synchronization baseline
    updateStepperUI();
};

// Orchestrate structural runtime parsing compatibility checks before initializing execution
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBookingUI);
} else {
    initBookingUI();
}