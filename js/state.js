/* ============================================
   TURBINE LOGSHEET PRO - GLOBAL STATE
   ============================================ */

/**
 * File ini menyimpan semua variabel global yang dibutuhkan oleh aplikasi.
 * Dengan arsitektur Dynamic Template, kita tidak perlu lagi membuat variabel
 * terpisah untuk setiap area (Turbin, CT, 1300, 1100).
 */

// ============================================
// 1. SYSTEM & PWA STATE
// ============================================
let deferredPrompt = null;              // Menyimpan event untuk instalasi PWA
let currentUploadController = null;     // Untuk membatalkan proses upload (AbortController)

// ============================================
// 2. AUTHENTICATION STATE
// ============================================
let currentUser = null;                 // Menyimpan data user yang sedang login { username, role, name, department }

// ============================================
// 3. DYNAMIC LOGSHEET STATE
// ============================================
// Variabel ini akan berubah-ubah nilainya tergantung logsheet apa yang sedang dibuka
let activeLogsheetType = null;          // Tipe logsheet aktif: "TURBIN", "CT", "1300", atau "1100"
let activeArea = null;                  // Area aktif yang sedang diisi: misal "BASIN SA", "DRYING AIR"
let activeIdx = 0;                      // Index parameter yang sedang diisi di dalam area aktif

let currentInputData = {};              // Menyimpan nilai parameter yang sedang diketik user (Draft)
let currentPhotosData = {};             // Menyimpan foto base64 untuk parameter terkait
let currentParamPhoto = null;           // Foto yang sedang aktif/diambil di layar parameter saat ini
let currentInputType = 'text';          // Tipe input parameter saat ini (bisa 'text' atau 'select')

let lastData = {};                      // Menyimpan data referensi terakhir yang ditarik dari server (GAS)

// ============================================
// 4. TPM (TOTAL PRODUCTIVE MAINTENANCE) STATE
// ============================================
// (Dibiarkan tetap ada untuk mendukung fitur TPM)
let activeTPMArea = null;               // Area TPM yang sedang dipilih
let currentTPMPhoto = null;             // Foto TPM saat ini

// ============================================
// 5. BALANCING POWER & STEAM STATE
// ============================================
// (Dibiarkan tetap ada untuk mendukung fitur Balancing)
let currentBalancingData = {};          // Menyimpan data draft balancing

// ============================================
// 6. HELPER / METADATA
// ============================================
let totalParams = 0;                    // (Opsional) Total parameter untuk keperluan kalkulasi progress keseluruhan