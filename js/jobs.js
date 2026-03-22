// js/jobs.js
// Modul untuk menampilkan daftar job/tugas hari ini di home screen
// Mengambil data dari Google Apps Script → Spreadsheet

import { JOB_SHEET_URL } from './constants.js';
import { showCustomAlert } from './ui-utils.js';

// ============================================
// 1. Load & Tampilkan Job List di Home Screen
// ============================================
export function loadTodayJobs() {
    const dateEl = document.getElementById('jobDate');
    const container = document.getElementById('jobListContainer');

    if (!container) return;

    // Tampilkan tanggal hari ini
    if (dateEl) {
        const today = new Date();
        dateEl.textContent = today.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Loading state
    container.innerHTML = `
        <div class="job-loading">
            <div class="spinner"></div>
            <span>Memuat daftar tugas...</span>
        </div>
    `;

    // Mulai fetch data
    fetchJobsFromSheet()
        .then(jobs => {
            if (jobs && jobs.length > 0) {
                renderJobList(jobs);
            } else {
                renderEmptyJobList();
            }
        })
        .catch(err => {
            console.error('Gagal memuat job list:', err);
            renderSampleJobs(); // fallback
            showCustomAlert('Gagal memuat daftar tugas. Menampilkan contoh.', 'warning');
        });
}

// ============================================
// 2. Fetch data dari Google Apps Script
// ============================================
async function fetchJobsFromSheet() {
    try {
        const url = `${JOB_SHEET_URL}?action=getJobs&date=today`;

        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.jobs)) {
            return data.jobs;
        } else {
            throw new Error(data.error || 'Format data tidak valid');
        }
    } catch (err) {
        console.error('Fetch jobs error:', err);
        throw err;
    }
}

// ============================================
// 3. Render daftar job yang diterima dari server
// ============================================
function renderJobList(jobs) {
    const container = document.getElementById('jobListContainer');
    if (!container) return;

    let html = '';

    jobs.forEach(job => {
        const statusClass = job.status === 'completed' ? 'completed' : 'pending';
        const statusText  = job.status === 'completed' ? 'Selesai' : 'Belum';

        html += `
            <div class="job-item ${statusClass}">
                <div class="job-item-status ${statusClass}"></div>
                <div class="job-item-content">
                    <span class="job-item-text">${job.description || job.name || 'Tugas tanpa deskripsi'}</span>
                    ${job.time ? `<span class="job-item-time">${job.time}</span>` : ''}
                </div>
                <span class="job-status-label">${statusText}</span>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================
// 4. Tampilkan pesan "Tidak ada tugas hari ini"
// ============================================
function renderEmptyJobList() {
    const container = document.getElementById('jobListContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="job-empty">
            <div class="job-empty-icon">📋</div>
            <p>Tidak ada tugas terjadwal untuk hari ini</p>
            <small>Silakan cek kembali nanti atau hubungi admin</small>
        </div>
    `;
}

// ============================================
// 5. Fallback: Tampilkan contoh job statis (saat offline/gagal fetch)
// ============================================
function renderSampleJobs() {
    const container = document.getElementById('jobListContainer');
    if (!container) return;

    const sampleJobs = [
        {
            name: 'Input Logsheet Shift 3',
            description: 'Lengkapi parameter turbine & CT shift malam',
            status: 'pending',
            time: '07:00 - 15:00'
        },
        {
            name: 'TPM Area Turbin',
            description: 'Lakukan pengecekan visual & foto area kritis',
            status: 'completed',
            time: '09:00'
        },
        {
            name: 'Update Balancing Power',
            description: 'Catat data balancing & kirim ke WA group',
            status: 'pending',
            time: '14:00'
        }
    ];

    let html = '';

    sampleJobs.forEach(job => {
        const statusClass = job.status === 'completed' ? 'completed' : 'pending';
        html += `
            <div class="job-item ${statusClass}">
                <div class="job-item-status ${statusClass}"></div>
                <div class="job-item-content">
                    <span class="job-item-text">${job.description}</span>
                    <span class="job-item-time">${job.time || ''}</span>
                </div>
                <span class="job-status-label">${job.status === 'completed' ? 'Selesai' : 'Pending'}</span>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================
// Inisialisasi (dipanggil dari main.js atau navigateTo home)
// ============================================
export function initJobs() {
    // Bisa ditambahkan listener refresh manual jika ada tombol "Refresh Jobs"
    const refreshBtn = document.getElementById('refreshJobsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadTodayJobs();
        });
    }

    // Load otomatis saat pertama kali masuk home
    loadTodayJobs();
}
