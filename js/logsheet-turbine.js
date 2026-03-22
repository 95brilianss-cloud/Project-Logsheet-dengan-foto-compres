// js/logsheet-turbine.js
// Modul utama untuk flow input Logsheet Turbine (area → parameter → save)

import { AREAS, GAS_URL, DRAFT_KEYS, PHOTO_DRAFT_KEYS } from './constants.js';
import {
    lastData,
    currentInput,
    activeArea,
    activeIdx,
    totalParams,
    currentInputType,
    paramPhotos,
    currentParamPhoto
} from './state.js';

import { showCustomAlert, navigateTo, showUploadProgress } from './ui-utils.js';
import { requireAuth } from './auth.js';
import { compressImage } from './compression.js';

// ============================================
// 1. Inisialisasi & Load Data Terakhir
// ============================================
export function fetchLastData() {
    const timeout = setTimeout(() => renderAreaList(), 8000); // fallback render jika lama

    const callbackName = `jsonp_turbine_${Date.now()}`;

    window[callbackName] = (data) => {
        clearTimeout(timeout);
        Object.assign(lastData, data);
        cleanupJSONP(callbackName);
        renderAreaList();
    };

    const script = document.createElement('script');
    script.src = `${GAS_URL}?action=getLastTurbine&callback=${callbackName}`;
    script.onerror = () => {
        clearTimeout(timeout);
        cleanupJSONP(callbackName);
        renderAreaList(); // tetap render meski gagal fetch
    };
    document.body.appendChild(script);
}

function cleanupJSONP(name) {
    if (window[name]) delete window[name];
}

// ============================================
// 2. Render Daftar Area di areaListScreen
// ============================================
export function renderAreaList() {
    const list = document.getElementById('areaList');
    if (!list) return;

    let completedAreas = 0;
    let html = '';

    Object.entries(AREAS).forEach(([areaName, params]) => {
        const areaData = currentInput[areaName] || {};
        const filled = Object.keys(areaData).length;
        const total = params.length;
        const percent = Math.round((filled / total) * 100);
        const isCompleted = filled === total && total > 0;

        const hasAbnormal = params.some(p => {
            const val = areaData[p] || '';
            return val.startsWith('ERROR') || val.startsWith('MAINTENANCE') || val.startsWith('NOT_INSTALLED');
        });

        if (isCompleted) completedAreas++;

        const circumference = 2 * Math.PI * 18;
        const offset = circumference - (percent / 100) * circumference;

        html += `
            <div class="area-item ${isCompleted ? 'completed' : ''} ${hasAbnormal ? 'has-warning' : ''}" 
                 onclick="openArea('${areaName}')">
                <div class="area-progress-ring">
                    <svg width="40" height="40" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
                        <circle cx="20" cy="20" r="18" fill="none" stroke="${isCompleted ? '#10b981' : '#3b82f6'}" 
                                stroke-width="3" stroke-linecap="round" stroke-dasharray="${circumference}" 
                                stroke-dashoffset="${offset}" transform="rotate(-90 20 20)"/>
                        <text x="20" y="24" text-anchor="middle" font-size="10" fill="${isCompleted ? '#10b981' : '#f8fafc'}">${filled}</text>
                    </svg>
                </div>
                <div class="area-info">
                    <div class="area-name">${areaName}</div>
                    <div class="area-meta ${hasAbnormal ? 'warning' : ''}">
                        ${hasAbnormal ? '⚠️ Ada parameter bermasalah • ' : ''}${filled}/${total}
                    </div>
                </div>
                <div class="area-status">
                    ${hasAbnormal ? '<span style="color:#ef4444">!</span>' : ''}
                    ${isCompleted ? '✓' : '❯'}
                </div>
            </div>
        `;
    });

    list.innerHTML = html;

    updateOverallProgress(completedAreas, Object.keys(AREAS).length);
}

// ============================================
// 3. Buka Area & Mulai Input Step-by-Step
// ============================================
export function openArea(areaName) {
    if (!requireAuth()) return;

    activeArea = areaName;
    activeIdx = 0;

    // Load foto draft
    loadParamPhotosFromDraft();

    navigateTo('paramScreen');
    document.getElementById('currentAreaName').textContent = areaName;

    renderProgressDots();
    showStep();
}

// ============================================
// 4. Render Progress Dots (visual step indicator)
// ============================================
function renderProgressDots() {
    const container = document.getElementById('progressDots');
    if (!container) return;

    const params = AREAS[activeArea] || [];
    let html = '';

    params.forEach((label, i) => {
        const saved = currentInput[activeArea]?.[label] || '';
        const firstLine = saved.split('\n')[0];

        let className = '';
        if (i === activeIdx) className = 'active';
        else if (['ERROR','MAINTENANCE','NOT_INSTALLED'].includes(firstLine)) className = 'has-issue';
        else if (saved.trim()) className = 'filled';

        html += `<div class="progress-dot ${className}" onclick="jumpToStep(${i})" title="${firstLine || ''}"></div>`;
    });

    container.innerHTML = html;
}

export function jumpToStep(index) {
    saveCurrentStep(); // simpan step sebelumnya
    activeIdx = index;
    showStep();
    renderProgressDots();
}

// ============================================
// 5. Tampilkan Step Saat Ini (parameter ke-aktif)
// ============================================
export function showStep() {
    const params = AREAS[activeArea];
    if (!params || activeIdx >= params.length) return;

    const fullLabel = params[activeIdx];
    const inputType = detectInputType(fullLabel);
    currentInputType = inputType.type;

    // Update UI step
    document.getElementById('stepInfo').textContent = `Step ${activeIdx + 1}/${params.length}`;
    document.getElementById('areaProgress').textContent = `${activeIdx + 1}/${params.length}`;
    document.getElementById('labelInput').textContent = getParamName(fullLabel);
    document.getElementById('lastTimeLabel').textContent = lastData._lastTime || '--:--';
    document.getElementById('prevValDisplay').textContent = lastData[fullLabel] || '--';

    // Render input field sesuai tipe
    const container = document.getElementById('inputFieldContainer');
    if (container) {
        if (inputType.type === 'select') {
            let currentVal = currentInput[activeArea]?.[fullLabel]?.split('\n')[0] || '';
            let options = inputType.options.map(opt => 
                `<option value="${opt}" ${currentVal === opt ? 'selected' : ''}>${opt}</option>`
            ).join('');

            container.innerHTML = `
                <select id="valInput" class="status-select">
                    <option value="" disabled ${!currentVal ? 'selected' : ''}>Pilih...</option>
                    ${options}
                </select>
            `;
        } else {
            const currentVal = currentInput[activeArea]?.[fullLabel]?.split('\n')[0] || '';
            container.innerHTML = `
                <input type="text" id="valInput" inputmode="decimal" placeholder="0.00" 
                       value="${currentVal}" autocomplete="off">
            `;
            document.getElementById('unitDisplay').textContent = getUnit(fullLabel) || '--';
        }
    }

    loadAbnormalStatus(fullLabel);
    loadParamPhotoForCurrentStep();

    // Focus input
    setTimeout(() => {
        const input = document.getElementById('valInput');
        if (input && !input.disabled) {
            input.focus();
            input.select();
        }
    }, 100);
}

// ============================================
// 6. Deteksi Tipe Input Berdasarkan Label
// ============================================
function detectInputType(label) {
    if (label.includes('(A/B)') || label.includes('(ON/OFF)') || label.includes('(A/M)')) {
        return {
            type: 'select',
            options: label.includes('(A/B)') ? ['A','B'] :
                     label.includes('(ON/OFF)') ? ['ON','OFF'] :
                     ['Auto','Manual']
        };
    }
    return { type: 'text' };
}

function getUnit(label) {
    const match = label.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
}

function getParamName(label) {
    return label.split(' (')[0];
}

// ============================================
// 7. Load & Tampilkan Status Abnormal (ERROR, MAINTENANCE, dll)
// ============================================
function loadAbnormalStatus(fullLabel) {
    // Reset semua checkbox & note
    document.querySelectorAll('input[name="paramStatus"]').forEach(cb => {
        cb.checked = false;
        cb.closest('.status-chip').classList.remove('active');
    });

    const noteContainer = document.getElementById('statusNoteContainer');
    const noteInput = document.getElementById('statusNote');
    const valInput = document.getElementById('valInput');

    if (noteContainer) noteContainer.style.display = 'none';
    if (noteInput) noteInput.value = '';
    if (valInput) {
        valInput.disabled = false;
        valInput.style.opacity = '1';
    }

    const saved = currentInput[activeArea]?.[fullLabel];
    if (!saved) return;

    const lines = saved.split('\n');
    const first = lines[0];

    if (['ERROR','MAINTENANCE','NOT_INSTALLED'].includes(first)) {
        const cb = document.querySelector(`input[value="${first}"]`);
        if (cb) {
            cb.checked = true;
            cb.closest('.status-chip').classList.add('active');
            if (noteContainer) noteContainer.style.display = 'block';
            if (noteInput) noteInput.value = lines[1] || '';

            if (first === 'NOT_INSTALLED' && valInput) {
                valInput.value = '-';
                valInput.disabled = true;
                valInput.style.opacity = '0.5';
            }
        }
    } else if (valInput) {
        valInput.value = first;
    }
}

// ============================================
// 8. Simpan Step Saat Ini (dipanggil saat pindah step atau back)
// ============================================
export function saveCurrentStep() {
    const valInput = document.getElementById('valInput');
    const checked = document.querySelector('input[name="paramStatus"]:checked');
    const note = document.getElementById('statusNote')?.value?.trim() || '';

    if (!currentInput[activeArea]) currentInput[activeArea] = {};

    let value = valInput?.value?.trim() || '';

    if (checked) {
        value = checked.value;
        if (note) value += '\n' + note;
    }

    const fullLabel = AREAS[activeArea][activeIdx];

    if (value) {
        currentInput[activeArea][fullLabel] = value;
    } else {
        delete currentInput[activeArea][fullLabel];
    }

    localStorage.setItem(DRAFT_KEYS.LOGSHEET, JSON.stringify(currentInput));
    renderProgressDots();
}

// ============================================
// 9. Navigasi Step (Next / Back)
// ============================================
export function saveStep() {
    saveCurrentStep();

    const params = AREAS[activeArea];
    if (activeIdx < params.length - 1) {
        activeIdx++;
        showStep();
    } else {
        showCustomAlert(`Area ${activeArea} selesai!`, 'success');
        setTimeout(() => navigateTo('areaListScreen'), 1200);
    }
}

export function goBack() {
    saveCurrentStep();

    if (activeIdx > 0) {
        activeIdx--;
        showStep();
    } else {
        navigateTo('areaListScreen');
    }
}

// ============================================
// 10. Foto Validasi Parameter
// ============================================
export async function handleParamPhoto(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
        try {
            const compressed = await compressImage(reader.result, {
                maxWidth: 1280,
                maxHeight: 1280,
                quality: 0.78
            });

            currentParamPhoto = compressed.dataUrl;

            // Simpan ke state foto
            if (!paramPhotos[activeArea]) paramPhotos[activeArea] = {};
            const fullLabel = AREAS[activeArea][activeIdx];
            paramPhotos[activeArea][fullLabel] = compressed.dataUrl;

            localStorage.setItem(PHOTO_DRAFT_KEYS.TURBINE, JSON.stringify(paramPhotos));

            // Preview
            const preview = document.getElementById('paramPhotoPreview');
            if (preview) {
                preview.src = compressed.dataUrl;
                preview.style.display = 'block';
            }

            showCustomAlert(`Foto berhasil dikompres (${compressed.reduction}% lebih kecil)`, 'success');
        } catch (err) {
            showCustomAlert('Gagal memproses foto', 'error');
        }
    };
    reader.readAsDataURL(file);
}

function loadParamPhotosFromDraft() {
    try {
        const saved = localStorage.getItem(PHOTO_DRAFT_KEYS.TURBINE);
        if (saved) Object.assign(paramPhotos, JSON.parse(saved));
    } catch (e) {
        console.error('Gagal load foto draft turbine');
    }
}

function loadParamPhotoForCurrentStep() {
    const fullLabel = AREAS[activeArea]?.[activeIdx];
    if (!fullLabel) return;

    const photo = paramPhotos[activeArea]?.[fullLabel];
    const preview = document.getElementById('paramPhotoPreview');
    if (preview) {
        if (photo) {
            preview.src = photo;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    }
}

// ============================================
// 11. Kirim Seluruh Logsheet ke Server
// ============================================
export async function sendToSheet() {
    if (!requireAuth()) return;

    const progress = showUploadProgress('Mengirim Logsheet Turbine & Foto...');

    let allParams = {};
    Object.entries(currentInput).forEach(([area, params]) => {
        Object.assign(allParams, params);
    });

    const photoCount = Object.values(paramPhotos).reduce((sum, area) => sum + Object.keys(area).length, 0);

    const payload = {
        type: 'LOGSHEET_TURBINE',
        Operator: currentUser?.name || 'Unknown',
        OperatorId: currentUser?.username || 'Unknown',
        photoCount,
        ...allParams
    };

    try {
        // Kirim foto dulu (satu per satu agar tidak terlalu besar)
        for (const [area, photos] of Object.entries(paramPhotos)) {
            for (const [param, base64] of Object.entries(photos)) {
                const photoPayload = {
                    type: 'LOGSHEET_PHOTO',
                    parentType: 'LOGSHEET_TURBINE',
                    Operator: currentUser?.name || 'Unknown',
                    photoKey: `${area}__${param}`,
                    photo: base64,
                    timestamp: new Date().toISOString()
                };

                await fetch(GAS_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify(photoPayload)
                });
                await new Promise(r => setTimeout(r, 300)); // delay antar foto
            }
        }

        // Kirim data utama
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });

        progress.complete();
        showCustomAlert('✓ Logsheet Turbine & foto berhasil dikirim!', 'success');

        // Bersihkan draft
        currentInput = {};
        paramPhotos = {};
        currentParamPhoto = null;
        localStorage.removeItem(DRAFT_KEYS.LOGSHEET);
        localStorage.removeItem(PHOTO_DRAFT_KEYS.TURBINE);

        setTimeout(() => navigateTo('homeScreen'), 1500);

    } catch (err) {
        progress.error();
        showCustomAlert('Gagal mengirim. Data disimpan lokal.', 'error');

        // Simpan offline
        let offline = JSON.parse(localStorage.getItem(DRAFT_KEYS.LOGSHEET_OFFLINE) || '[]');
        offline.push({ ...payload, photos: paramPhotos });
        localStorage.setItem(DRAFT_KEYS.LOGSHEET_OFFLINE, JSON.stringify(offline));
    }
}

// ============================================
// 12. Update Progress Keseluruhan (dipanggil dari renderAreaList)
// ============================================
export function updateOverallProgress(completed, total) {
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const text = document.getElementById('progressText');
    const bar = document.getElementById('overallProgressBar');
    const percentEl = document.getElementById('overallPercent');

    if (text) text.textContent = `${percent}% Complete`;
    if (bar) bar.style.width = `${percent}%`;
    if (percentEl) percentEl.textContent = `${percent}%`;
}

// ============================================
// Inisialisasi modul (dipanggil dari main.js jika perlu)
// ============================================
export function initTurbineLogsheet() {
    // Bisa tambahkan listener tombol submit, camera, dll di sini
    const submitBtn = document.getElementById('turbineSubmitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', sendToSheet);
    }

    const cameraInput = document.getElementById('paramCamera');
    if (cameraInput) {
        cameraInput.addEventListener('change', handleParamPhoto);
    }
}
