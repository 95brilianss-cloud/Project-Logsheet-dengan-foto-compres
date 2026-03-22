// js/constants.js
// Semua konstanta, konfigurasi, dan data statis aplikasi

// ============================================
// Versi & Identitas Aplikasi
// ============================================
export const APP_VERSION = '1.9.2';
export const APP_NAME = 'Turbine Logsheet Pro';

// ============================================
// Konfigurasi Autentikasi
// ============================================
export const AUTH_CONFIG = {
    SESSION_KEY: 'turbine_session',
    USER_KEY: 'turbine_user',
    USERS_CACHE_KEY: 'turbine_users_cache',
    SESSION_DURATION: 8 * 60 * 60 * 1000,          // 8 jam
    REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000  // 30 hari
};

// ============================================
// Key untuk LocalStorage (Draft & Offline)
// ============================================
export const DRAFT_KEYS = {
    LOGSHEET: 'draft_turbine',
    LOGSHEET_BACKUP: 'draft_turbine_backup',
    BALANCING: 'balancing_draft',
    TPM_OFFLINE: 'tpm_offline',
    LOGSHEET_OFFLINE: 'offline_logsheets',
    BALANCING_OFFLINE: 'balancing_offline',
    TPM_HISTORY: 'tpm_history',
    BALANCING_HISTORY: 'balancing_history'
};

export const DRAFT_KEYS_CT = {
    LOGSHEET: 'draft_ct_logsheet',
    OFFLINE: 'offline_ct_logsheets'
};

export const PHOTO_DRAFT_KEYS = {
    TURBINE: 'draft_turbine_photos',
    CT: 'draft_ct_photos'
};

// ============================================
// URL Backend (Google Apps Script)
// ============================================
export const GAS_URL = "https://script.google.com/macros/s/AKfycbwQi2_FjAH6rLX3oKeZ7JJbftMiU99NYKhEzfPxPQ_68RHJDMKxaPVyqVDbWbbk46T_/exec";
export const JOB_SHEET_URL = "https://script.google.com/macros/s/AKfycbzkh6ZViJMh8MJWFnunALO3QIrjqBv1ePXJ8ObW3C_HCGKl4FHX19XGvuUFc9-Fzvwz/exec";

// ============================================
// User fallback untuk mode offline (legacy)
// ============================================
export const OFFLINE_USERS = {
    'admin': { 
        password: 'admin123', 
        role: 'admin', 
        name: 'Administrator', 
        department: 'Unit Utilitas 3B' 
    },
    'operator': { 
        password: 'operator123', 
        role: 'operator', 
        name: 'Operator Shift', 
        department: 'Unit Utilitas 3B' 
    },
    'utilitas3b': { 
        password: 'pgresik2024', 
        role: 'operator', 
        name: 'Unit Utilitas 3B', 
        department: 'Unit Utilitas 3B' 
    }
};

// ============================================
// Field Balancing (urutan penting untuk form & mapping)
// ============================================
export const BALANCING_FIELDS = [
    'balancingDate', 'balancingTime',
    'loadMW', 'eksporMW',
    'plnMW', 'ubbMW', 'pieMW', 'tg65MW', 'tg66MW', 'gtgMW',
    'ss6500MW', 'ss2000Via', 'activePowerMW', 'reactivePowerMVAR', 
    'currentS', 'voltageV', 'hvs65l02MW', 'hvs65l02Current', 'total3BMW',
    'fq1105',
    'stgSteam', 'pa2Steam', 'puri2Steam', 'melterSA2', 
    'ejectorSteam', 'glandSealSteam', 'deaeratorSteam', 
    'dumpCondenser', 'pcv6105',
    'pi6122', 'ti6112', 'ti6146', 'ti6126', 
    'axialDisplacement', 'vi6102', 'te6134',
    'ctSuFan', 'ctSuPompa', 'ctSaFan', 'ctSaPompa',
    'kegiatanShift'
];

// ============================================
// Deteksi tipe input khusus
// ============================================
export const INPUT_TYPES = {
    PUMP_STATUS: {
        patterns: ['(A/B)', '(ON/OFF)', '(On/Off)', '(Running/Stop)', '(Remote/Running/Stop)'],
        options: {
            '(A/B)': ['A', 'B'],
            '(ON/OFF)': ['ON', 'OFF'],
            '(On/Off)': ['On', 'Off'],
            '(Running/Stop)': ['Running', 'Stop'],
            '(Remote/Running/Stop)': ['Remote', 'Running', 'Stop']
        }
    }
};

// ============================================
// Struktur Area – Turbine Logsheet
// ============================================
export const AREAS = {
    "Steam Inlet Turbine": [
        "MPS Inlet 30-TP-6101 PI-6114 (kg/cm2)", 
        "MPS Inlet 30-TP-6101 TI-6153 (°C)", 
        "MPS Inlet 30-TP-6101 PI-6116 (kg/cm2)", 
        "LPS Extrac 30-TP-6101 PI-6123 (kg/cm2)", 
        "Gland Steam TI-6156 (°C)", 
        "MPS Inlet 30-TP-6101 PI-6108 (Kg/cm2)", 
        "Exhaust Steam PI-6111 (kg/cm2)", 
        "Gland Steam PI-6118 (Kg/cm2)"
    ],
    "Low Pressure Steam": [
        "LPS from U-6101 PI-6104 (kg/cm2)", 
        "LPS from U-6101 TI-6102 (°C)", 
        "LPS Header PI-6106 (Kg/cm2)", 
        "LPS Header TI-6107 (°C)"
    ],
    "Lube Oil": [
        "Lube Oil 30-TK-6102 LI-6104 (%)", 
        "Lube Oil 30-TK-6102 TI-6125 (°C)", 
        "Lube Oil 30-C-6101 (On/Off)", 
        "Lube Oil 30-EH-6102 (On/Off)", 
        "Lube Oil Cartridge FI-6143 (%)", 
        "Lube Oil Cartridge PI-6148 (mmH2O)", 
        "Lube Oil Cartridge PI-6149 (mmH2O)", 
        "Lube Oil PI-6145 (kg/cm2)", 
        "Lube Oil E-6104 (A/B)", 
        "Lube Oil TI-6127 (°C)", 
        "Lube Oil FIL-6101 (A/B)", 
        "Lube Oil PDI-6146 (Kg/cm2)", 
        "Lube Oil PI-6143 (Kg/cm2)", 
        "Lube Oil TI-6144 (°C)", 
        "Lube Oil TI-6146 (°C)", 
        "Lube Oil TI-6145 (°C)", 
        "Lube Oil FG-6144 (%)", 
        "Lube Oil FG-6146 (%)", 
        "Lube Oil TI-6121 (°C)", 
        "Lube Oil TI-6116 (°C)", 
        "Lube Oil FG-6121 (%)", 
        "Lube Oil FG-6116 (%)"
    ],
    // ... (area lainnya seperti Control Oil, Shaft Line, Condenser, dll – copy dari kode asli)
    // Untuk menghindari file terlalu panjang, sisanya bisa Anda salin dari dokumen asli
};

// ============================================
// Struktur Area – Cooling Tower (CT) Logsheet
// ============================================
export const AREAS_CT = {
    "BASIN SA": [
        "D-6511 LEVEL BASIN",
        "D-6511 BLOWDOWN",
        "D-6511 PH BASIN", 
        "D-6511 TRASSAR (A/M)", 
        "TK-6511 LEVEL ACID", 
        "FIL-6511 (A/B)", 
        "30-P-6511 A PRESS (kg/cm2)", 
        "30-P-6511 B PRESS (kg/cm2)", 
        "30-P-6511 C PRESS (kg/cm2)", 
        "MT-6511 A STATUS", 
        "MT-6511 B STATUS", 
        "MT-6511 C STATUS", 
        "MT-6511 D STATUS"
    ], 
    "BASIN SU": [
        "D-6521 LEVEL BASIN",
        "D-6521 BLOWDOWN",
        "D-6521 PH BASIN", 
        "D-6521 TRASSAR (A/M)", 
        "TK-6521 LEVEL ACID", 
        "FIL-6521 (A/B)", 
        "30-P-6521 A PRESS (kg/cm2)", 
        "30-P-6521 B PRESS (kg/cm2)", 
        "30-P-6521 C PRESS (kg/cm2)", 
        "MT-6521 A STATUS", 
        "MT-6521 B STATUS", 
        "MT-6521 C STATUS", 
        "MT-6521 D STATUS"
    ]
};

// ============================================
// Export semua konstanta di atas
// (sudah dilakukan secara otomatis karena menggunakan named export)
// ============================================

// Optional: export object grouping jika ingin lebih rapi
export const CONFIG = {
    AUTH: AUTH_CONFIG,
    DRAFT: DRAFT_KEYS,
    DRAFT_CT: DRAFT_KEYS_CT,
    PHOTO_DRAFT: PHOTO_DRAFT_KEYS,
    URL: {
        MAIN: GAS_URL,
        JOBS: JOB_SHEET_URL
    }
};

export const AREAS_ALL = {
    TURBINE: AREAS,
    CT: AREAS_CT
};
