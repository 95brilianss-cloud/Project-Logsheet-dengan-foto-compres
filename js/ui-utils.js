// js/ui-utils.js
// Kumpulan fungsi utilitas UI yang bersifat umum dan reusable

import { APP_NAME } from './constants.js';
import { requireAuth, isAdmin } from './auth.js';
import { navigateTo as stateNavigateTo } from './state.js'; // jika ada state untuk active screen

// ============================================
// 1. Custom Alert / Notification
// ============================================
let autoCloseTimer = null;

export function showCustomAlert(message, type = 'success') {
    const alert = document.getElementById('customAlert');
    if (!alert) {
        console.warn('Elemen #customAlert tidak ditemukan');
        alert(message);
        return;
    }

    const titleEl = document.getElementById('alertTitle');
    const msgEl   = document.getElementById('alertMessage');
    const iconWrap = document.getElementById('alertIconWrapper');
    const content = document.getElementById('alertContent');

    if (!titleEl || !msgEl || !iconWrap || !content) return;

    // Reset timer
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
    }

    const titles = {
        success: 'Berhasil',
        error:   'Error',
        warning: 'Peringatan',
        info:    'Informasi'
    };

    titleEl.textContent = titles[type] || 'Informasi';
    msgEl.textContent = message;

    // Kelas warna
    content.className = 'alert-content ' + (type || 'info');

    // Ikon berdasarkan tipe
    const icons = {
        success: `<svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="25"/><path d="M14 27l7 7 16-16"/></svg>`,
        error:   `<svg viewBox="0 0 52 52" stroke="#ef4444"><circle cx="26" cy="26" r="25"/><path d="M16 16L36 36M36 16L16 36"/></svg>`,
        warning: `<svg viewBox="0 0 52 52" stroke="#f59e0b"><circle cx="26" cy="26" r="25"/><path d="M26 10v20M26 34v4"/></svg>`,
        info:    `<svg viewBox="0 0 52 52" stroke="#3b82f6"><circle cx="26" cy="26" r="25"/><path d="M26 10v20M26 34v4"/></svg>`
    };

    iconWrap.innerHTML = icons[type] || icons.info;

    alert.classList.remove('hidden');

    // Auto close untuk success & info
    if (type === 'success' || type === 'info') {
        autoCloseTimer = setTimeout(closeAlert, 3200);
    }
}

export function closeAlert() {
    const alert = document.getElementById('customAlert');
    if (alert) alert.classList.add('hidden');
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
    }
}

// ============================================
// 2. Navigasi antar Screen
// ============================================
export function navigateTo(screenId) {
    const protectedScreens = [
        'homeScreen',
        'areaListScreen',
        'paramScreen',
        'balancingScreen',
        'tpmScreen',
        'ctAreaListScreen',
        'ctParamScreen'
        // tambah screen lain jika ada
    ];

    if (protectedScreens.includes(screenId) && !requireAuth()) {
        return; // akan redirect ke login oleh requireAuth
    }

    // Sembunyikan semua screen
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);

        // Inisialisasi khusus per screen
        switch (screenId) {
            case 'homeScreen':
                loadUserStats();
                loadTodayJobs(); // dari jobs.js
                setTimeout(addAdminButtonIfNeeded, 100);
                break;

            case 'areaListScreen':
                fetchLastData(); // dari logsheet-turbine.js
                updateOverallProgress();
                break;

            case 'balancingScreen':
                initBalancingScreen(); // dari balancing.js
                break;

            case 'ctAreaListScreen':
                fetchLastDataCT();
                updateCTOverallProgress();
                break;

            // tambah case lain jika perlu
        }
    } else {
        console.warn(`Screen ${screenId} tidak ditemukan`);
    }
}

// ============================================
// 3. Loading / Progress Indicator
// ============================================
export function simulateLoading(duration = 1200) {
    const loader = document.getElementById('loader');
    const progress = document.getElementById('loaderProgress');

    if (!loader || !progress) return;

    let val = 0;
    const interval = setInterval(() => {
        val += Math.random() * 35;
        if (val > 100) {
            val = 100;
            clearInterval(interval);
            setTimeout(() => {
                loader.style.display = 'none';
            }, 400);
        }
        progress.style.width = val + '%';
    }, 180);
}

export function showUploadProgress(message = 'Mengirim data...') {
    const progressModal = document.getElementById('uploadProgressModal');
    const textEl = document.getElementById('uploadProgressText');
    const bar = document.getElementById('uploadProgressBar');

    if (!progressModal) return { updateText: () => {}, complete: () => {}, error: () => {} };

    progressModal.classList.remove('hidden');
    if (textEl) textEl.textContent = message;
    if (bar) bar.style.width = '0%';

    return {
        updateText: (newMsg) => {
            if (textEl) textEl.textContent = newMsg;
        },
        updatePercent: (percent) => {
            if (bar) bar.style.width = percent + '%';
        },
        complete: () => {
            if (textEl) textEl.textContent = 'Selesai!';
            if (bar) bar.style.width = '100%';
            setTimeout(() => progressModal.classList.add('hidden'), 1200);
        },
        error: () => {
            if (textEl) textEl.textContent = 'Gagal mengirim';
            if (bar) bar.style.background = '#ef4444';
            setTimeout(() => progressModal.classList.add('hidden'), 2000);
        }
    };
}

// ============================================
// 4. Update Progress Ring / Bar Umum
// ============================================
export function updateProgressRing(elementId, percent, color = '#3b82f6') {
    const el = document.getElementById(elementId);
    if (!el) return;

    const circle = el.querySelector('circle[stroke-dasharray]');
    if (!circle) return;

    const circumference = 2 * Math.PI * 18; // r=18 seperti di kode asli
    const offset = circumference - (percent / 100) * circumference;

    circle.setAttribute('stroke-dashoffset', offset);
    circle.setAttribute('stroke', color);

    const text = el.querySelector('text');
    if (text) text.textContent = Math.round(percent);
}

// Contoh penggunaan di area list / CT
export function updateOverallProgress() {
    // hitung dari currentInput & AREAS (implementasi ada di logsheet-turbine.js)
    // lalu panggil updateProgressRing('overallProgressRing', percent);
}

// ============================================
// 5. Helper DOM & UI kecil
// ============================================
export function togglePasswordVisibility(inputId = 'operatorPassword', iconId = 'eyeIcon') {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    } else {
        input.type = 'password';
        if (icon) icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    }
}

export function showToast(message, type = 'info', duration = 2800) {
    // Implementasi sederhana toast (bisa pakai library atau custom div)
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

// ============================================
// 6. Admin Button / Badge (dipanggil setelah login)
// ============================================
export function addAdminButtonIfNeeded() {
    if (!isAdmin()) return;

    // Contoh: tambah badge admin di header
    const userInfo = document.querySelector('.home-header .user-info');
    if (userInfo && !userInfo.querySelector('.admin-badge')) {
        const badge = document.createElement('span');
        badge.className = 'admin-badge';
        badge.textContent = 'Admin';
        userInfo.appendChild(badge);
    }
}

// ============================================
// Export semua fungsi di atas
// ============================================

// Jika ingin satu object export (opsional)
export const UI = {
    showCustomAlert,
    closeAlert,
    navigateTo,
    simulateLoading,
    showUploadProgress,
    updateProgressRing,
    togglePasswordVisibility,
    showToast,
    addAdminButtonIfNeeded
};
