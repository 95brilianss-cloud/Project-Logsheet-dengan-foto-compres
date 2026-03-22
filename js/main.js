// js/main.js
// Entry point utama aplikasi Turbine Logsheet Pro
// Mengimpor dan menginisialisasi semua modul

import { APP_NAME, APP_VERSION } from './constants.js';
import { initState, resetTurbineState, resetCTState } from './state.js';
import { initAuth, requireAuth, logoutOperator } from './auth.js';
import { registerServiceWorker, installPWA } from './pwa.js';
import { showCustomAlert, navigateTo, simulateLoading } from './ui-utils.js';
import { loadTodayJobs } from './jobs.js';
import { fetchLastData, renderAreaList, openArea, saveStep, goBack } from './logsheet-turbine.js';
import { fetchLastDataCT, renderCTMenu, openCTArea, saveCTStep, goBackCT } from './logsheet-ct.js';
import { initBalancingScreen, submitBalancingData } from './balancing.js';
import { compressImage } from './compression.js';  // jika akan digunakan secara global

// -----------------------------------------------------
// 1. Inisialisasi saat DOM siap
// -----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    console.log(`%c${APP_NAME} v${APP_VERSION} starting...`, 'color: #10b981; font-weight: bold;');

    // 1. Load state dari localStorage (draft, foto, dll)
    initState();

    // 2. Inisialisasi autentikasi (cek session, tampilkan login jika perlu)
    initAuth();

    // 3. Register Service Worker untuk PWA & update handling
    if ('serviceWorker' in navigator) {
        registerServiceWorker();
    }

    // 4. Simulasi loading awal (splash screen / loader)
    simulateLoading();

    // 5. Setup semua event listener global
    setupGlobalEventListeners();

    // 6. Jika sudah login → load data awal home screen
    if (requireAuth()) {
        navigateTo('homeScreen');
        loadTodayJobs();           // job list dari spreadsheet
        // fetchLastData();        // optional: preload data turbine terakhir
        // fetchLastDataCT();      // optional: preload data CT terakhir
    }

    console.log(`%c${APP_NAME} v${APP_VERSION} initialized successfully`, 'color: #10b981;');
});

// -----------------------------------------------------
// 2. Semua Event Listener Global / Keyboard Shortcuts
// -----------------------------------------------------
function setupGlobalEventListeners() {
    // Keyboard shortcuts untuk navigasi form
    document.addEventListener('keydown', (e) => {
        const turbineActive = document.getElementById('paramScreen')?.classList.contains('active');
        const ctActive = document.getElementById('ctParamScreen')?.classList.contains('active');

        if (turbineActive) {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveStep();
            } else if (e.key === 'Escape' || e.key === 'Backspace') {
                goBack();
            }
        }

        if (ctActive) {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveCTStep();
            } else if (e.key === 'Escape' || e.key === 'Backspace') {
                goBackCT();
            }
        }

        // Logout cepat (misal Ctrl + L)
        if (e.ctrlKey && e.key.toLowerCase() === 'l') {
            e.preventDefault();
            if (confirm('Logout sekarang?')) {
                logoutOperator();
            }
        }
    });

    // Handle tombol install PWA (jika muncul)
    const installBtn = document.getElementById('installPwaBtn');
    if (installBtn) {
        installBtn.addEventListener('click', installPWA);
    }

    // Contoh: tombol logout di header (harus ada di HTML)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Yakin ingin keluar?')) {
                logoutOperator();
            }
        });
    }

    // Bisa ditambah listener lain yang bersifat global di sini
}

// -----------------------------------------------------
// 3. Optional: Handle visibility change (background sync simulation)
// -----------------------------------------------------
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('App kembali aktif → cek koneksi / sync jika perlu');
        // Bisa panggil fungsi sync offline data di sini nanti
    }
});

// -----------------------------------------------------
// 4. Export fungsi utama jika dibutuhkan oleh modul lain
// -----------------------------------------------------
export {
    navigateTo,
    requireAuth,
    showCustomAlert
    // tambahkan fungsi lain yang sering dipakai lintas modul
};
