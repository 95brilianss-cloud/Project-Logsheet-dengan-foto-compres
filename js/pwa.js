// js/pwa.js
// Modul untuk mengelola fitur Progressive Web App (PWA)
// Termasuk Service Worker, update detection, dan install prompt

import { APP_NAME, APP_VERSION } from './constants.js';
import { showCustomAlert } from './ui-utils.js';

// Variabel global dari state.js (diimport jika perlu)
import { deferredPrompt, installBannerShown } from './state.js';

// ============================================
// 1. Registrasi Service Worker
// ============================================
export function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.warn('Browser tidak mendukung Service Worker');
        return;
    }

    window.addEventListener('load', () => {
        const swPath = `./sw.js?v=${APP_VERSION}`;

        navigator.serviceWorker.register(swPath)
            .then(registration => {
                console.log(`Service Worker terdaftar dengan scope: ${registration.scope}`);

                // Deteksi jika ada update worker baru
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // Ada update baru yang sudah siap → beri tahu user
                                showUpdateAvailable();
                            }
                        });
                    }
                });
            })
            .catch(err => {
                console.error('Gagal mendaftarkan Service Worker:', err);
            });

        // Listener untuk pesan dari SW (misal versi check)
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data?.type === 'VERSION_CHECK' && event.data.version !== APP_VERSION) {
                showUpdateAvailable();
            }
        });
    });
}

// ============================================
// 2. Menampilkan notifikasi ada update
// ============================================
function showUpdateAvailable() {
    // Bisa pakai custom alert yang sudah ada
    showCustomAlert(
        'Versi baru aplikasi tersedia! Klik "Update" untuk memuat ulang.',
        'info'
    );

    // Atau tampilkan banner khusus update
    const updateAlert = document.getElementById('updateAlert');
    if (updateAlert) {
        updateAlert.classList.remove('hidden');
    }
}

// ============================================
// 3. Fungsi untuk menerapkan update (reload setelah SW aktif)
// ============================================
export function applyUpdate() {
    if (navigator.serviceWorker.controller) {
        // Kirim pesan ke SW untuk langsung aktifkan worker baru
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    // Reload halaman untuk menggunakan versi terbaru
    window.location.reload();
}

// ============================================
// 4. Penanganan Install Prompt (Add to Home Screen)
// ============================================

// Simpan deferred prompt (akan di-set dari event beforeinstallprompt)
export let deferredInstallPrompt = null;

// Event listener utama (dipasang di main.js atau di sini)
export function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Cegah browser menampilkan prompt default
        e.preventDefault();
        
        // Simpan prompt untuk digunakan nanti
        deferredInstallPrompt = e;
        
        // Tampilkan tombol install di UI (jika ada)
        const installBtn = document.getElementById('installPwaBtn');
        if (installBtn) {
            installBtn.classList.remove('hidden');
            installBtn.disabled = false;
        }

        // Jika belum pernah tampilkan banner custom, tampilkan setelah beberapa detik
        if (!installBannerShown) {
            setTimeout(() => {
                showCustomInstallBanner();
            }, 5000); // muncul setelah 5 detik (bisa disesuaikan)
        }
    });

    // Ketika aplikasi berhasil diinstall
    window.addEventListener('appinstalled', () => {
        console.log(`${APP_NAME} berhasil diinstall ke home screen`);
        hideCustomInstallBanner();
        deferredInstallPrompt = null;
        installBannerShown = true;

        // Sembunyikan tombol install
        const installBtn = document.getElementById('installPwaBtn');
        if (installBtn) installBtn.classList.add('hidden');

        showCustomAlert(`${APP_NAME} berhasil ditambahkan ke layar utama!`, 'success');
    });
}

// ============================================
// 5. Fungsi untuk memicu instalasi secara manual
// ============================================
export async function installPWA() {
    if (!deferredInstallPrompt) {
        showCustomAlert('Aplikasi sudah terpasang atau browser tidak mendukung instalasi PWA', 'info');
        return;
    }

    // Tampilkan prompt instalasi native
    deferredInstallPrompt.prompt();

    // Tunggu user memilih (accept / dismiss)
    const { outcome } = await deferredInstallPrompt.userChoice;

    if (outcome === 'accepted') {
        console.log('User menerima instalasi PWA');
        hideCustomInstallBanner();
        showCustomAlert('Terima kasih! Aplikasi sedang diinstall...', 'success');
    } else {
        console.log('User menolak instalasi PWA');
    }

    // Reset prompt setelah digunakan
    deferredInstallPrompt = null;
}

// ============================================
// 6. Banner custom instalasi (opsional)
// ============================================
function showCustomInstallBanner() {
    const banner = document.getElementById('pwaInstallPopup');
    if (banner) {
        banner.classList.remove('hidden');
        installBannerShown = true;
    }
}

export function hideCustomInstallBanner() {
    const banner = document.getElementById('pwaInstallPopup');
    if (banner) {
        banner.classList.add('hidden');
    }
}

// ============================================
// 7. Deteksi apakah aplikasi sudah berjalan sebagai PWA (standalone)
// ============================================
export function isAppInstalled() {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://')
    );
}

// ============================================
// Inisialisasi PWA (dipanggil dari main.js)
// ============================================
export function initPWA() {
    registerServiceWorker();
    setupInstallPrompt();

    // Cek apakah sudah terinstall → bisa sembunyikan tombol install
    if (isAppInstalled()) {
        const installBtn = document.getElementById('installPwaBtn');
        if (installBtn) installBtn.classList.add('hidden');
    }

    console.log('[PWA] Inisialisasi selesai');
}
