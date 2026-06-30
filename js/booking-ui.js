/**
 * ===========================================================
 * HS Studio Graduation Management System (HSGMS)
 * File      : booking-ui.js
 * Sprint    : 2E
 * Location  : /js/booking-ui.js
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

import { getState, updateState, submitBooking } from "./booking.js";

/**
 * Transient UI Stepper State
 * @private
 */
let currentStep = 1;
const TOTAL_STEPS = 4;

/**
 * Prevents duplicate submission while async pipeline is running
 * @private
 */
let isSubmitting = false;

/**
 * Package catalog mapped from booking.html display values
 * @private
 */
const PACKAGE_CATALOG = {
    pkg_1: { name: "Paket 1 - Basic", price: 300000, dp: 50000 },
    pkg_2: { name: "Paket 2 - Premium", price: 490000, dp: 50000 },
    pkg_3: { name: "Paket 3 - VIP", price: 999000, dp: 50000 }
};

/**
 * UI validation constraints
 * @private
 */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

/**
 * Cache Object for DOM Elements to optimize selection performance
 * @private
 */
const DOM = {
    form: null,
    formError: null,
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
        facultyName: null,
        studyProgram: null,
        graduationDate: null,
        notes: null,
        transferProof: null
    },
    summary: {
        package: null,
        name: null,
        phone: null,
        univ: null,
        faculty: null,
        studyProgram: null,
        graduationDate: null,
        notes: null
    }
};

/**
 * Initializes DOM elements and caches references
 * @private
 */
const _initDOMElements = () => {
    DOM.form = document.getElementById("bookingForm");

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

    DOM.btnPrev = document.getElementById("btnPrev");
    DOM.btnNext = document.getElementById("btnNext");
    DOM.btnSubmit = document.getElementById("btnSubmit");

    DOM.inputs.packageRadios = document.querySelectorAll('input[name="packageId"]');
    DOM.inputs.fullName = document.getElementById("fullName");
    DOM.inputs.phoneNumber = document.getElementById("phoneNumber");
    DOM.inputs.universityName = document.getElementById("universityName");
    DOM.inputs.facultyName = document.getElementById("facultyName");
    DOM.inputs.studyProgram = document.getElementById("studyProgram");
    DOM.inputs.graduationDate = document.getElementById("graduationDate");
    DOM.inputs.notes = document.getElementById("notes");
    DOM.inputs.transferProof = document.getElementById("transferProof");

    DOM.summary.package = document.getElementById("summaryPackage");
    DOM.summary.name = document.getElementById("summaryName");
    DOM.summary.phone = document.getElementById("summaryPhone");
    DOM.summary.univ = document.getElementById("summaryUniv");
    DOM.summary.faculty = document.getElementById("summaryFaculty");
    DOM.summary.studyProgram = document.getElementById("summaryStudyProgram");
    DOM.summary.graduationDate = document.getElementById("summaryGraduationDate");
    DOM.summary.notes = document.getElementById("summaryNotes");

    _initFormErrorSurface();
};

/**
 * Creates the inline form error surface once
 * @private
 */
const _initFormErrorSurface = () => {
    const cardFooter = DOM.btnSubmit?.closest(".hsg-card__footer");

    if (!cardFooter || document.getElementById("bookingFormError")) {
        DOM.formError = document.getElementById("bookingFormError");
        return;
    }

    DOM.formError = document.createElement("div");
    DOM.formError.id = "bookingFormError";
    DOM.formError.className = "hsg-alert";
    DOM.formError.setAttribute("role", "alert");
    DOM.formError.hidden = true;
    DOM.formError.style.backgroundColor = "var(--d-100, #FEF2F2)";
    DOM.formError.style.borderColor = "var(--d-200, #FECACA)";
    DOM.formError.style.borderLeft = "4px solid var(--d-500)";
    DOM.formError.style.color = "var(--n-950)";
    DOM.formError.style.marginBottom = "var(--space-4)";
    DOM.formError.style.width = "100%";

    cardFooter.parentElement.insertBefore(DOM.formError, cardFooter);
};

/**
 * Displays a form-level error message using the existing alert pattern
 * @param {string} message
 * @private
 */
const _showFormError = (message) => {
    if (!DOM.formError) return;

    DOM.formError.textContent = message;
    DOM.formError.hidden = false;
    DOM.formError.scrollIntoView({ behavior: "smooth", block: "nearest" });
};

/**
 * Clears the form-level error message
 * @private
 */
const _clearFormError = () => {
    if (!DOM.formError) return;

    DOM.formError.textContent = "";
    DOM.formError.hidden = true;
};

/**
 * Returns the currently selected package radio element
 * @returns {HTMLInputElement|null}
 * @private
 */
const _getSelectedPackageRadio = () => {
    return Array.from(DOM.inputs.packageRadios || []).find(radio => radio.checked) || null;
};

/**
 * Collects the latest form values from the DOM
 * @returns {{ selectedPackage: Object, customer: Object, transferProofFile: File|null }}
 * @private
 */
const _collectFormData = () => {
    const selectedRadio = _getSelectedPackageRadio();
    const packageId = selectedRadio?.value || "";
    const packageMeta = PACKAGE_CATALOG[packageId] || { name: "", price: 0, dp: 50000 };

    const transferProofFile = DOM.inputs.transferProof?.files?.[0] || null;

    return {
        selectedPackage: {
            id: packageId,
            name: packageMeta.name,
            price: packageMeta.price,
            dp: packageMeta.dp
        },
        customer: {
            fullName: DOM.inputs.fullName?.value.trim() || "",
            phoneNumber: DOM.inputs.phoneNumber?.value.trim() || "",
            universityName: DOM.inputs.universityName?.value.trim() || "",
            facultyName: DOM.inputs.facultyName?.value.trim() || "",
            studyProgram: DOM.inputs.studyProgram?.value.trim() || "",
            graduationDate: DOM.inputs.graduationDate?.value.trim() || "",
            notes: DOM.inputs.notes?.value.trim() || ""
        },
        payment: {
            paymentMethod: "transfer"
        },
        transferProofFile
    };
};

/**
 * Performs UI-layer validation before submission
 * @param {Object} formData
 * @returns {{ isValid: boolean, message: string }}
 * @private
 */
const _validateFormUI = (formData) => {
    if (!formData.selectedPackage.id) {
        return {
            isValid: false,
            message: "ERR-B01: Pilih paket wisuda terlebih dahulu sebelum mengirim booking."
        };
    }

    if (!formData.customer.fullName) {
        return {
            isValid: false,
            message: "ERR-B01: Nama lengkap wajib diisi sesuai ijazah."
        };
    }

    if (!formData.customer.phoneNumber) {
        return {
            isValid: false,
            message: "ERR-B01: Nomor WhatsApp aktif wajib diisi."
        };
    }

    if (!formData.customer.universityName) {
        return {
            isValid: false,
            message: "ERR-B01: Nama universitas wajib diisi."
        };
    }

    if (!formData.customer.facultyName) {
        return {
            isValid: false,
            message: "ERR-B01: Nama fakultas wajib diisi."
        };
    }

    if (!formData.customer.studyProgram) {
        return {
            isValid: false,
            message: "ERR-B01: Program studi wajib diisi."
        };
    }

    if (!formData.customer.graduationDate) {
        return {
            isValid: false,
            message: "ERR-B01: Tanggal wisuda wajib diisi."
        };
    }

    const graduationDate = new Date(`${formData.customer.graduationDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (graduationDate < today) {
        return {
            isValid: false,
            message: "ERR-B05: Tanggal wisuda tidak boleh di masa lalu."
        };
    }

    if (!formData.transferProofFile) {
        return {
            isValid: false,
            message: "ERR-B01: Upload bukti transfer DP wajib dilampirkan."
        };
    }

    if (!ACCEPTED_MIME_TYPES.includes(formData.transferProofFile.type)) {
        return {
            isValid: false,
            message: "ERR-B03: Format bukti transfer harus JPG, PNG, atau PDF."
        };
    }

    if (formData.transferProofFile.size > MAX_FILE_SIZE_BYTES) {
        return {
            isValid: false,
            message: "ERR-B02: Ukuran bukti transfer melebihi batas maksimum 5MB."
        };
    }

    return { isValid: true, message: "" };
};

/**
 * Synchronizes collected form values into the Booking State Engine
 * @param {Object} formData
 * @private
 */
const _syncStateFromForm = (formData) => {
    updateState({
        selectedPackage: formData.selectedPackage,
        customer: formData.customer,
        payment: formData.payment
    });
};

/**
 * Sets submit button loading feedback state
 * @param {boolean} loading
 * @private
 */
const _setSubmitLoadingState = (loading) => {
    if (!DOM.btnSubmit) return;

    DOM.btnSubmit.disabled = loading;
    DOM.btnSubmit.textContent = loading ? "Mengirim..." : "Kirim Booking";
};

/**
 * Handles the Kirim Booking submission flow
 * @private
 */
const _handleSubmit = async () => {
    if (isSubmitting) return;

    _clearFormError();

    const formData = _collectFormData();
    const validation = _validateFormUI(formData);

    if (!validation.isValid) {
        _showFormError(validation.message);
        return;
    }

    _syncStateFromForm(formData);

    isSubmitting = true;
    _setSubmitLoadingState(true);

    try {
        const bookingId = await submitBooking(formData.transferProofFile);
        window.location.href = `hasilpembayaran.html?id=${encodeURIComponent(bookingId)}`;
    } catch (error) {
        _showFormError(
            error?.message || "HSGMS Booking UI: Proses submit booking gagal. Silakan coba lagi."
        );
    } finally {
        isSubmitting = false;
        _setSubmitLoadingState(false);
    }
};

/**
 * Populates the confirmation step summary with data retrieved from the State Engine
 * @public
 */
export const populateSummary = () => {
    const currentState = getState();

    if (DOM.summary.package) DOM.summary.package.textContent = currentState.selectedPackage.name || "-";
    if (DOM.summary.name) DOM.summary.name.textContent = currentState.customer.fullName || "-";
    if (DOM.summary.phone) {
        DOM.summary.phone.textContent = currentState.customer.phoneNumber
            ? `+62 ${currentState.customer.phoneNumber}`
            : "-";
    }
    if (DOM.summary.univ) DOM.summary.univ.textContent = currentState.customer.universityName || "-";
    if (DOM.summary.faculty) DOM.summary.faculty.textContent = currentState.customer.facultyName || "-";
    if (DOM.summary.studyProgram) {
        DOM.summary.studyProgram.textContent = currentState.customer.studyProgram || "-";
    }
    if (DOM.summary.graduationDate) {
        DOM.summary.graduationDate.textContent = currentState.customer.graduationDate || "-";
    }
    if (DOM.summary.notes) DOM.summary.notes.textContent = currentState.customer.notes || "-";
};

/**
 * Coordinates visual transformations based on the active structural step iteration
 * @public
 */
export const updateStepperUI = () => {
    DOM.sections.forEach((section, index) => {
        if (section) {
            section.style.display = (index + 1 === currentStep) ? "block" : "none";
        }
    });

    DOM.navSteps.forEach((step, index) => {
        if (step) {
            if (index + 1 === currentStep) {
                step.classList.add("is-active");
            } else {
                step.classList.remove("is-active");
            }
        }
    });

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
    DOM.inputs.packageRadios.forEach(radio => {
        radio.addEventListener("change", (event) => {
            const packageId = event.target.value;
            const packageMeta = PACKAGE_CATALOG[packageId] || { name: "Unknown Package", price: 0, dp: 50000 };

            updateState({
                selectedPackage: {
                    id: packageId,
                    name: packageMeta.name,
                    price: packageMeta.price,
                    dp: packageMeta.dp
                }
            });
        });
    });

    if (DOM.inputs.fullName) {
        DOM.inputs.fullName.addEventListener("input", (event) => {
            updateState({ customer: { fullName: event.target.value } });
        });
    }

    if (DOM.inputs.phoneNumber) {
        DOM.inputs.phoneNumber.addEventListener("input", (event) => {
            updateState({ customer: { phoneNumber: event.target.value } });
        });
    }

    if (DOM.inputs.universityName) {
        DOM.inputs.universityName.addEventListener("input", (event) => {
            updateState({ customer: { universityName: event.target.value } });
        });
    }

    if (DOM.inputs.facultyName) {
        DOM.inputs.facultyName.addEventListener("input", (event) => {
            updateState({ customer: { facultyName: event.target.value } });
        });
    }

    if (DOM.inputs.studyProgram) {
        DOM.inputs.studyProgram.addEventListener("input", (event) => {
            updateState({ customer: { studyProgram: event.target.value } });
        });
    }

    if (DOM.inputs.graduationDate) {
        DOM.inputs.graduationDate.addEventListener("change", (event) => {
            updateState({ customer: { graduationDate: event.target.value } });
        });
    }

    if (DOM.inputs.notes) {
        DOM.inputs.notes.addEventListener("input", (event) => {
            updateState({ customer: { notes: event.target.value } });
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
 * Attaches the submit action listener for Kirim Booking
 * @private
 */
const _bindSubmitControl = () => {
    if (!DOM.btnSubmit) return;

    DOM.btnSubmit.addEventListener("click", () => {
        _handleSubmit();
    });
};

/**
 * Central initialization orchestrator for the presentation layer context
 * Runs automatically upon script context attachment inside web browser environments.
 */
const initBookingUI = () => {
    _initDOMElements();
    _bindDataTracking();
    _bindNavigationControls();
    _bindSubmitControl();
    updateStepperUI();
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBookingUI);
} else {
    initBookingUI();
}
