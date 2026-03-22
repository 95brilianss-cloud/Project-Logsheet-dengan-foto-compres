// js/auth.js
// Modul autentikasi lengkap untuk Turbine Logsheet Pro

import { 
    AUTH_CONFIG, 
    OFFLINE_USERS, 
    GAS_URL, 
    USERS_CACHE_KEY 
} from './constants.js';

import { 
    currentUser, 
    isAuthenticated, 
    resetAuthState 
} from './state.js';

import { showCustomAlert, navigateTo } from './ui-utils.js';

// ============================================
// Helper Functions
// ============================================

function isSessionValid(session) {
    if (!session || !session.expiresAt) return false;
    return Date.now() < session.expiresAt;
}

function saveSession(user, rememberMe = false) {
    const duration = rememberMe 
        ? AUTH_CONFIG.REMEMBER_ME_DURATION 
        : AUTH_CONFIG.SESSION_DURATION;
    
    const session = {
        user,
        loginTime: Date.now(),
        expiresAt: Date.now() + duration,
        rememberMe
    };

    try {
        localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
    } catch (err) {
        console.error('Gagal menyimpan session:', err);
    }
}

export function getSession() {
    try {
        const data = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        return null;
    }
}

export function clearSession() {
    localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    resetAuthState();
}

// ============================================
// User Cache untuk Offline Mode
// ============================================

export function loadUsersCache() {
    try {
        const cache = localStorage.getItem(AUTH_CONFIG.USERS_CACHE_KEY);
        return cache ? JSON.parse(cache) : null;
    } catch (err) {
        return null;
    }
}

function saveUsersCache(cache) {
    try {
        localStorage.setItem(AUTH_CONFIG.USERS_CACHE_KEY, JSON.stringify(cache));
    } catch (err) {
        console.error('Gagal menyimpan user cache:', err);
    }
}

function updateUserCache(username, password, userData) {
    let cache = loadUsersCache() || {};
    
    const key = String(username).toLowerCase().trim();
    
    cache[key] = {
        username: userData.username || username,
        password: password,
        role: userData.role || 'operator',
        name: userData.name || username,
        department: userData.department || 'Unit Utilitas 3B',
        status: 'ACTIVE',
        lastSync: new Date().toISOString()
    };

    saveUsersCache(cache);
    console.log(`User cached untuk offline: ${username}`);
}

// ============================================
// Validasi Login
// ============================================

async function validateUserOnline(username, password) {
    return new Promise((resolve, reject) => {
        const callbackName = `loginCallback_${Date.now()}`;
        const timeout = setTimeout(() => {
            cleanupJSONP(callbackName);
            reject(new Error('Timeout login online'));
        }, 10000);

        window[callbackName] = (response) => {
            clearTimeout(timeout);
            cleanupJSONP(callbackName);
            resolve(response);
        };

        const script = document.createElement('script');
        script.src = `${GAS_URL}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&callback=${callbackName}`;
        
        script.onerror = () => {
            clearTimeout(timeout);
            cleanupJSONP(callbackName);
            reject(new Error('Network error saat login online'));
        };

        document.body.appendChild(script);
    });
}

function validateUserOffline(username, password) {
    const inputUsername = String(username).toLowerCase().trim();
    const inputPassword = String(password).trim();

    // Cek cache dulu (user yang pernah login sukses online)
    const cachedUsers = loadUsersCache();
    if (cachedUsers && cachedUsers[inputUsername]) {
        const user = cachedUsers[inputUsername];
        if (user.password === inputPassword) {
            if (user.status === 'INACTIVE') {
                return { success: false, error: 'User tidak aktif' };
            }
            return {
                success: true,
                user: {
                    username: user.username,
                    name: user.name,
                    role: user.role,
                    department: user.department
                }
            };
        }
        return { success: false, error: 'Password salah (cache)' };
    }

    // Fallback ke user statis legacy
    const legacyUser = OFFLINE_USERS[inputUsername];
    if (!legacyUser) {
        return { success: false, error: 'User tidak ditemukan' };
    }

    if (legacyUser.password !== inputPassword) {
        return { success: false, error: 'Password salah' };
    }

    return {
        success: true,
        user: {
            username: inputUsername,
            name: legacyUser.name,
            role: legacyUser.role,
            department: legacyUser.department
        }
    };
}

function cleanupJSONP(callbackName) {
    if (window[callbackName]) {
        delete window[callbackName];
    }
}

// ============================================
// Fungsi Utama Login
// ============================================

export async function loginOperator() {
    const usernameInput = document.getElementById('operatorUsername');
    const passwordInput = document.getElementById('operatorPassword');
    const loginBtn = document.querySelector('#loginScreen .btn-primary');

    if (!usernameInput || !passwordInput) return;

    const username = String(usernameInput.value).trim().toLowerCase();
    const password = String(passwordInput.value).trim();

    if (!username || !password) {
        showCustomAlert('Username dan password wajib diisi!', 'error');
        return;
    }

    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span>⏳ Memverifikasi...</span>';
    }

    // 1. Coba login online terlebih dahulu
    if (navigator.onLine) {
        try {
            const result = await validateUserOnline(username, password);

            if (result.success === true) {
                // Sukses online → simpan cache & session
                updateUserCache(username, password, result.user);
                handleLoginSuccess(result.user, username, password, false);
                return;
            } else {
                // Server menolak (password salah / user inactive / dll)
                showCustomAlert(result.error || 'Username atau password salah', 'error');
                resetLoginButton(loginBtn);
                return;
            }
        } catch (err) {
            console.warn('Login online gagal:', err.message);
            // Lanjut ke offline jika network error
        }
    }

    // 2. Fallback ke offline
    const offlineResult = validateUserOffline(username, password);

    if (offlineResult.success) {
        handleLoginSuccess(offlineResult.user, username, password, true);
    } else {
        showCustomAlert(offlineResult.error || 'Login gagal. Periksa koneksi atau kredensial.', 'error');
        resetLoginButton(loginBtn);
    }
}

function handleLoginSuccess(user, username, password, isOffline = false) {
    currentUser = user;
    isAuthenticated = true;

    // Simpan session (8 jam default, tidak pakai remember me di sini)
    saveSession(user, false);

    // Update UI
    updateUIForAuthenticatedUser();

    // Pindah ke home
    navigateTo('homeScreen');

    // Pesan selamat datang
    if (isOffline) {
        showCustomAlert(`✓ Login offline berhasil! Selamat datang, ${user.name || username}`, 'warning');
    } else {
        showCustomAlert(`✓ Login berhasil! Selamat datang, ${user.name || username}`, 'success');
        
        // Jika admin → sync user list untuk offline
        if (user.role === 'admin') {
            syncUsersForOffline();
        }
    }

    resetLoginButton();
}

function resetLoginButton() {
    const loginBtn = document.querySelector('#loginScreen .btn-primary');
    if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span>🔓 Masuk</span>';
    }
    const passwordInput = document.getElementById('operatorPassword');
    if (passwordInput) passwordInput.value = '';
}

// ============================================
// Logout
// ============================================

export function logoutOperator() {
    if (!confirm('Apakah Anda yakin ingin keluar?')) return;

    clearSession();

    // Kosongkan field login
    const usernameInput = document.getElementById('operatorUsername');
    const passwordInput = document.getElementById('operatorPassword');
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';

    navigateTo('loginScreen');
    showCustomAlert('Anda telah keluar dari sistem.', 'success');
}

// ============================================
// Proteksi halaman
// ============================================

export function requireAuth() {
    const session = getSession();

    if (!isAuthenticated || !isSessionValid(session)) {
        clearSession();
        navigateTo('loginScreen');
        showCustomAlert('Sesi Anda telah berakhir. Silakan login kembali.', 'error');
        return false;
    }
    return true;
}

export function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

// ============================================
// Update UI setelah login
// ============================================

function updateUIForAuthenticatedUser() {
    if (!currentUser) return;

    const selectors = [
        'displayUserName', 'tpmHeaderUser', 'tpmInputUser',
        'areaListUser', 'paramUser', 'balancingUser',
        'ctAreaListUser', 'ctParamUser'
    ];

    selectors.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = currentUser.name || currentUser.username;
    });

    if (isAdmin()) {
        // Tambah badge admin di header (jika ada)
        const homeHeader = document.querySelector('.home-header .user-info');
        if (homeHeader && !homeHeader.querySelector('.admin-badge')) {
            const badge = document.createElement('span');
            badge.className = 'admin-badge';
            badge.textContent = 'Admin';
            homeHeader.appendChild(badge);
        }
    }
}

// ============================================
// Sync user list untuk admin (opsional - bisa dipanggil saat login admin)
// ============================================

export async function syncUsersForOffline() {
    // Implementasi fetch user list dari server dan simpan ke cache
    // Bisa menggunakan JSONP mirip validateUserOnline
    console.log('[auth] Admin login → mulai sync user untuk offline');
    // ... logika fetch & update cache
}

// ============================================
// Inisialisasi autentikasi saat app start
// ============================================

export function initAuth() {
    const session = getSession();

    if (session && isSessionValid(session)) {
        currentUser = session.user;
        isAuthenticated = true;
        updateUIForAuthenticatedUser();

        if (document.getElementById('loginScreen')?.classList.contains('active')) {
            navigateTo('homeScreen');
        }
    } else {
        clearSession();
        navigateTo('loginScreen');
    }

    // Load cache user (untuk offline)
    loadUsersCache();
}
