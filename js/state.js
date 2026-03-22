// js/state.js
// Manajemen state global aplikasi Turbine Logsheet Pro
// Semua variabel state didefinisikan di sini + beberapa helper sederhana

// ============================================
// State untuk Turbine Logsheet
// ============================================
export let lastData = {};                    // data terakhir dari server (turbine)
export let currentInput = {};                // data yang sedang diisi user (turbine)
export let activeArea = "";                  // area turbine yang sedang aktif
export let activeIdx = 0;                    // index parameter saat ini di area turbine
export let totalParams = 0;                  // total parameter turbine (dihitung saat init)
export let currentInputType = 'text';        // tipe input saat ini (text/select)

// ============================================
// State untuk CT (Cooling Tower) Logsheet
// ============================================
export let lastDataCT = {};                  // data terakhir dari server (CT)
export let currentInputCT = {};              // data yang sedang diisi user (CT)
export let activeAreaCT = "";                // area CT yang sedang aktif
export let activeIdxCT = 0;                  // index parameter saat ini di area CT
export let totalParamsCT = 0;                // total parameter CT
export let currentInputTypeCT = 'text';      // tipe input saat ini untuk CT

// ============================================
// State Autentikasi & User
// ============================================
export let currentUser = null;               // objek user yang sedang login
export let isAuthenticated = false;          // status login

// ============================================
// State Foto Validasi Parameter
// ============================================
export let currentParamPhoto = null;         // foto sementara untuk parameter turbine saat ini
export let paramPhotos = {};                 // { areaName: { paramName: base64String } }
export let currentCTParamPhoto = null;       // foto sementara untuk parameter CT
export let ctParamPhotos = {};               // { areaName: { paramName: base64String } }

// ============================================
// State Lain-lain (UI & Flow)
// ============================================
export let autoCloseTimer = null;            // timer untuk auto-close alert
export let activeTPMArea = '';               // area TPM yang aktif (jika ada modul TPM)
export let currentTPMPhoto = null;           // foto TPM sementara
export let currentTPMStatus = '';            // status TPM sementara
export let currentShift = 3;                 // shift aktif (default 3, bisa diganti)
export let balancingAutoSaveInterval = null; // interval auto-save balancing
export let uploadProgressInterval = null;    // interval progress upload
export let currentUploadController = null;   // AbortController untuk fetch upload
export let deferredPrompt = null;            // untuk PWA install prompt
export let installBannerShown = false;       // flag apakah banner install sudah ditampilkan

// ============================================
// Fungsi Helper untuk Reset / Inisialisasi State
// ============================================

/**
 * Reset semua state terkait Turbine Logsheet
 */
export function resetTurbineState() {
    lastData = {};
    currentInput = {};
    activeArea = "";
    activeIdx = 0;
    currentInputType = 'text';
    currentParamPhoto = null;
    paramPhotos = {};
    localStorage.removeItem('draft_turbine');
    localStorage.removeItem('draft_turbine_photos');
    localStorage.removeItem('offline_logsheets');
}

/**
 * Reset semua state terkait CT Logsheet
 */
export function resetCTState() {
    lastDataCT = {};
    currentInputCT = {};
    activeAreaCT = "";
    activeIdxCT = 0;
    currentInputTypeCT = 'text';
    currentCTParamPhoto = null;
    ctParamPhotos = {};
    localStorage.removeItem('draft_ct_logsheet');
    localStorage.removeItem('draft_ct_photos');
    localStorage.removeItem('offline_ct_logsheets');
}

/**
 * Reset state autentikasi (logout)
 */
export function resetAuthState() {
    currentUser = null;
    isAuthenticated = false;
}

/**
 * Reset hampir semua state aplikasi (digunakan saat logout atau reset total)
 */
export function resetAppState() {
    resetTurbineState();
    resetCTState();
    resetAuthState();
    
    autoCloseTimer = null;
    activeTPMArea = '';
    currentTPMPhoto = null;
    currentTPMStatus = '';
    currentShift = 3;
    balancingAutoSaveInterval = null;
    uploadProgressInterval = null;
    currentUploadController = null;
    deferredPrompt = null;
    installBannerShown = false;
}

/**
 * Hitung total parameter turbine dari AREAS
 * @param {Object} AREAS - dari constants.js
 */
export function calculateTotalParams(AREAS) {
    totalParams = Object.values(AREAS).reduce((acc, arr) => acc + arr.length, 0);
    return totalParams;
}

/**
 * Hitung total parameter CT dari AREAS_CT
 * @param {Object} AREAS_CT - dari constants.js
 */
export function calculateTotalParamsCT(AREAS_CT) {
    totalParamsCT = Object.values(AREAS_CT).reduce((acc, arr) => acc + arr.length, 0);
    return totalParamsCT;
}

// ============================================
// Getter sederhana (opsional, bisa langsung akses variabelnya)
// ============================================

export function getCurrentUser() {
    return currentUser;
}

export function isUserAdmin() {
    return currentUser?.role === 'admin';
}

export function getActiveShift() {
    return currentShift;
}

// ============================================
// Inisialisasi state awal (dipanggil di main.js)
// ============================================
export function initState() {
    // Bisa ditambahkan logika load dari localStorage jika diperlukan
    // Saat ini hanya menghitung total parameter (akan dipanggil setelah AREAS diimport)
    console.log('[state.js] State global initialized');
}
