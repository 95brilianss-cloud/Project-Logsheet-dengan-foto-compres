// js/logsheet-ct.js
// Modul utama untuk flow input Logsheet Cooling Tower (CT)

import { AREAS_CT, GAS_URL, DRAFT_KEYS_CT, PHOTO_DRAFT_KEYS } from './constants.js';
import {
    lastDataCT,
    currentInputCT,
    activeAreaCT,
    activeIdxCT,
    totalParamsCT,
    currentInputTypeCT,
    ctParamPhotos,
    currentCTParamPhoto
} from './state.js';

import { showCustomAlert, navigateTo, showUploadProgress } from './ui-utils.js';
import { requireAuth } from './auth.js';
import { compressImage } from './compression.js';

// ============================================
// 1. Fetch Data Terakhir CT dari Server
// ============================================
export function fetchLastDataCT() {
    updateStatusIndicator(false); // optional: tampilkan indikator loading

    const timeout = setTimeout(() => renderCTMenu(), 8000);

    const callbackName = `jsonp_ct_${Date.now()}`;

    window[callbackName] = (data) => {
        clearTimeout(timeout);
        Object.assign(lastDataCT, data);
        updateStatusIndicator(true);
        cleanupJSONP(callbackName);
        renderCTMenu();
    };

    const script = document.createElement('script');
    script.src = `${GAS_URL}?action=getLastCT&callback=${callbackName}`;
    script.onerror = () => {
        clearTimeout(timeout);
        cleanupJSONP(callbackName);
        renderCTMenu(); // tetap render meski gagal
    };
    document.body.appendChild(script);
}

function cleanupJSONP(name) {
    if (window[name]) delete window[name];
}

// ============================================
// 2. Render Daftar Area CT di ctAreaListScreen
// ============================================
export function renderCTMenu() {
    const list = document.getElementById('ctAreaList');
    if (!list) return;

    let completedAreas = 0;
    let html = '';

    Object.entries(AREAS_CT).forEach(([areaName, params]) => {
        const areaData = currentInputCT[areaName] || {};
        const filled = Object.keys(areaData).length;
        const total = params.length;
        const percent = Math.round((filled / total) * 100);
        const isCompleted = filled === total && total > 0;

        const hasAbnormal = params.some(p => {
            const val = areaData[p] || '';
            const first = val.split('\n')[0];
            return ['ERROR', 'MAINTENANCE', 'NOT_INSTALLED'].includes(first);
        });

        if (isCompleted) completedAreas++;

        const circumference = 2 * Math.PI * 18;
        const offset = circumference - (percent / 100) * circumference;

        html += `
            <div class="area-item ${isCompleted ? 'completed' : ''} ${hasAbnormal ? 'has-warning' : ''}" 
                 onclick="openCTArea('${areaName}')">
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

    const hasData = Object.keys(currentInputCT).length > 0;
    const submitBtn = document.getElementById('ctSubmitBtn');
    if (submitBtn) submitBtn.style.display = hasData ? 'flex' : 'none';

    updateCTOverallProgress(completedAreas, Object.keys(AREAS_CT).length);
}

// ============================================
// 3. Update Progress Keseluruhan CT
// ============================================
function updateCTOverallProgress(completed, total) {
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const text = document.getElementById('ctProgressText');
    const bar = document.getElementById('ctOverallProgressBar');
    const percentEl = document.getElementById('ctOverallPercent');

    if (text) text.textContent = `${percent}% Complete`;
    if (bar) bar.style.width = `${percent}%`;
    if (percentEl) percentEl.textContent = `${percent}%`;
}

// ============================================
// 4. Buka Area CT & Mulai Input Step-by-Step
// ============================================
export function openCTArea(areaName) {
    if (!requireAuth()) return;

    activeAreaCT = areaName;
    activeIdxCT = 0;

    loadCTParamPhotosFromDraft();

    navigateTo('ctParamScreen');
    document.getElementById('ctCurrentAreaName').textContent = areaName;

    renderCTProgressDots();
    showCTStep();
}

// ============================================
// 5. Render Progress Dots untuk CT
// ============================================
function renderCTProgressDots() {
    const container = document.getElementById('ctProgressDots');
    if (!container) return;

    const params = AREAS_CT[activeAreaCT] || [];
    let html = '';

    params.forEach((label, i) => {
        const saved = currentInputCT[activeAreaCT]?.[label] || '';
        const first = saved.split('\n')[0];

        let className = '';
        if (i === activeIdxCT) className = 'active';
        else if (['ERROR','MAINTENANCE','NOT_INSTALLED'].includes(first)) className = 'has-issue';
        else if (saved.trim()) className = 'filled';

        html += `<div class="progress-dot ${className}" onclick="jumpToCTStep(${i})" title="${first || ''}"></div>`;
    });

    container.innerHTML = html;
}

export function jumpToCTStep(index) {
    saveCTCurrentStep();
    activeIdxCT = index;
    showCTStep();
    renderCTProgressDots();
}

// ============================================
// 6. Tampilkan Step Parameter CT Saat Ini
// ============================================
export function showCTStep() {
    const params = AREAS_CT[activeAreaCT];
    if (!params || activeIdxCT >= params.length) return;

    const fullLabel = params[activeIdxCT];
    const inputType = detectCTInputType(fullLabel);
    currentInputTypeCT = inputType.type;

    // Update UI
    document.getElementById('ctStepInfo').textContent = `Step ${activeIdxCT + 1}/${params.length}`;
    document.getElementById('ctAreaProgress').textContent = `${activeIdxCT + 1}/${params.length}`;
    document.getElementById('ctLabelInput').textContent = getCTParamName(fullLabel);
    document.getElementById('ctLastTimeLabel').textContent = lastDataCT._lastTime || '--:--';

    let prev = lastDataCT[fullLabel] || '--';
    if (prev !== '--') {
        const lines = prev.toString().split('\n');
        if (['ERROR','MAINTENANCE','NOT_INSTALLED'].includes(lines[0])) {
            prev = lines[0] + (lines[1] ? ' - ' + lines[1] : '');
        }
    }
    document.getElementById('ctPrevValDisplay').textContent = prev;

    // Render input sesuai tipe
    const container = document.getElementById('ctInputFieldContainer');
    if (container) {
        if (inputType.type === 'select') {
            let curr = currentInputCT[activeAreaCT]?.[fullLabel]?.split('\n')[0] || '';
            let opts = inputType.options.map(o => 
                `<option value="${o}" ${curr === o ? 'selected' : ''}>${o}</option>`
            ).join('');

            container.innerHTML = `
                <div class="select-wrapper">
                    <select id="ctValInput" class="status-select">
                        <option value="" disabled ${!curr ? 'selected' : ''}>Pilih Status...</option>
                        ${opts}
                    </select>
                    <div class="select-arrow">▼</div>
                </div>
            `;
            document.getElementById('ctUnitDisplay').style.display = 'none';
        } else {
            const curr = currentInputCT[activeAreaCT]?.[fullLabel]?.split('\n')[0] || '';
            container.innerHTML = `
                <input type="text" id="ctValInput" inputmode="decimal" placeholder="0.00" 
                       value="${curr}" autocomplete="off">
            `;
            document.getElementById('ctUnitDisplay').textContent = getCTUnit(fullLabel) || '--';
            document.getElementById('ctUnitDisplay').style.display = 'flex';
        }
    }

    loadCTAbnormalStatus(fullLabel);
    loadCTParamPhotoForCurrentStep();

    setTimeout(() => {
        const input = document.getElementById('ctValInput');
        if (input && inputType.type === 'text' && !input.disabled) {
            input.focus();
            input.select();
        }
    }, 100);
}

// ============================================
// 7. Deteksi Tipe Input CT (lebih banyak status A/M, A/B)
// ============================================
function detectCTInputType(label) {
    if (label.includes('(A/M)')) {
        return { type: 'select', options: ['Auto', 'Manual'] };
    }
    if (label.includes('(A/B)')) {
        return { type: 'select', options: ['A', 'B', 'AB'] };
    }
    if (label.includes('STATUS') || label.includes('Running') || label.includes('ON/OFF')) {
        return { type: 'select', options: ['Running', 'Stop', 'Standby'] };
    }
    return { type: 'text' };
}

function getCTUnit(label) {
    const match = label.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
}

function getCTParamName(label) {
    return label.split(' (')[0];
}

// ============================================
// 8. Load & Handle Status Abnormal CT
// ============================================
function loadCTAbnormalStatus(fullLabel) {
    document.querySelectorAll('input[name="ctParamStatus"]').forEach(cb => {
        cb.checked = false;
        cb.closest('.status-chip').classList.remove('active');
    });

    const noteCont = document.getElementById('ctStatusNoteContainer');
    const noteIn = document.getElementById('ctStatusNote');
    const valIn = document.getElementById('ctValInput');

    if (noteCont) noteCont.style.display = 'none';
    if (noteIn) noteIn.value = '';
    if (valIn) {
        valIn.disabled = false;
        valIn.style.opacity = '1';
        valIn.style.background = '';
    }

    const saved = currentInputCT[activeAreaCT]?.[fullLabel];
    if (!saved) return;

    const lines = saved.split('\n');
    const first = lines[0];

    if (['ERROR','MAINTENANCE','NOT_INSTALLED'].includes(first)) {
        const cb = document.querySelector(`input[value="${first}"]`);
        if (cb) {
            cb.checked = true;
            cb.closest('.status-chip').classList.add('active');
            if (noteCont) noteCont.style.display = 'block';
            if (noteIn) noteIn.value = lines[1] || '';

            if (first === 'NOT_INSTALLED' && valIn) {
                valIn.value = '-';
                valIn.disabled = true;
                valIn.style.opacity = '0.5';
            }
        }
    } else if (valIn) {
        valIn.value = first;
    }
}

// ============================================
// 9. Simpan Step CT Saat Ini
// ============================================
function saveCTCurrentStep() {
    const valInput = document.getElementById('ctValInput');
    const checked = document.querySelector('input[name="ctParamStatus"]:checked');
    const note = document.getElementById('ctStatusNote')?.value?.trim() || '';

    if (!currentInputCT[activeAreaCT]) currentInputCT[activeAreaCT] = {};

    let value = valInput?.value?.trim() || '';

    if (checked) {
        value = checked.value;
        if (note) value += '\n' + note;
    }

    const fullLabel = AREAS_CT[activeAreaCT][activeIdxCT];

    if (value) {
        currentInputCT[activeAreaCT][fullLabel] = value;
    } else {
        delete currentInputCT[activeAreaCT][fullLabel];
    }

    localStorage.setItem(DRAFT_KEYS_CT.LOGSHEET, JSON.stringify(currentInputCT));
    renderCTProgressDots();
}

// ============================================
// 10. Navigasi Step CT
// ============================================
export function saveCTStep() {
    saveCTCurrentStep();

    const params = AREAS_CT[activeAreaCT];
    if (activeIdxCT < params.length - 1) {
        activeIdxCT++;
        showCTStep();
    } else {
        showCustomAlert(`Area ${activeAreaCT} selesai diisi!`, 'success');
        setTimeout(() => navigateTo('ctAreaListScreen'), 1200);
    }
}

export function goBackCT() {
    saveCTCurrentStep();

    if (activeIdxCT > 0) {
        activeIdxCT--;
        showCTStep();
    } else {
        navigateTo('ctAreaListScreen');
    }
}

// ============================================
// 11. Foto Validasi Parameter CT
// ============================================
export async function handleCTParamPhoto(e) {
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

            currentCTParamPhoto = compressed.dataUrl;

            if (!ctParamPhotos[activeAreaCT]) ctParamPhotos[activeAreaCT] = {};
            const fullLabel = AREAS_CT[activeAreaCT][activeIdxCT];
            ctParamPhotos[activeAreaCT][fullLabel] = compressed.dataUrl;

            localStorage.setItem(PHOTO_DRAFT_KEYS.CT, JSON.stringify(ctParamPhotos));

            const preview = document.getElementById('ctParamPhotoPreview');
            if (preview) {
                preview.src = compressed.dataUrl;
                preview.style.display = 'block';
            }

            showCustomAlert(`Foto CT berhasil dikompres (${compressed.reduction}%)`, 'success');
        } catch (err) {
            showCustomAlert('Gagal memproses foto CT', 'error');
        }
    };
    reader.readAsDataURL(file);
}

function loadCTParamPhotosFromDraft() {
    try {
        const saved = localStorage.getItem(PHOTO_DRAFT_KEYS.CT);
        if (saved) Object.assign(ctParamPhotos, JSON.parse(saved));
    } catch (e) {
        console.error('Gagal load foto draft CT');
    }
}

function loadCTParamPhotoForCurrentStep() {
    const fullLabel = AREAS_CT[activeAreaCT]?.[activeIdxCT];
    if (!fullLabel) return;

    const photo = ctParamPhotos[activeAreaCT]?.[fullLabel];
    const preview = document.getElementById('ctParamPhotoPreview');
    if (preview) {
        preview.src = photo || '';
        preview.style.display = photo ? 'block' : 'none';
    }
}

// ============================================
// 12. Kirim Seluruh Logsheet CT ke Server
// ============================================
export async function sendCTToSheet() {
    if (!requireAuth()) return;

    const progress = showUploadProgress('Mengirim Logsheet CT & Foto...');

    let allParams = {};
    Object.entries(currentInputCT).forEach(([area, params]) => {
        Object.assign(allParams, params);
    });

    const photoCount = Object.values(ctParamPhotos).reduce((sum, area) => sum + Object.keys(area).length, 0);

    const payload = {
        type: 'LOGSHEET_CT',
        Operator: currentUser?.name || 'Unknown',
        OperatorId: currentUser?.username || 'Unknown',
        photoCount,
        ...allParams
    };

    try {
        // Kirim foto satu per satu
        for (const [area, photos] of Object.entries(ctParamPhotos)) {
            for (const [param, base64] of Object.entries(photos)) {
                const photoPayload = {
                    type: 'LOGSHEET_PHOTO',
                    parentType: 'LOGSHEET_CT',
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
                await new Promise(r => setTimeout(r, 250));
            }
        }

        // Kirim data utama
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });

        progress.complete();
        showCustomAlert('✓ Logsheet CT & foto berhasil dikirim!', 'success');

        // Bersihkan draft
        currentInputCT = {};
        ctParamPhotos = {};
        currentCTParamPhoto = null;
        localStorage.removeItem(DRAFT_KEYS_CT.LOGSHEET);
        localStorage.removeItem(PHOTO_DRAFT_KEYS.CT);

        setTimeout(() => navigateTo('homeScreen'), 1500);

    } catch (err) {
        progress.error();
        showCustomAlert('Gagal mengirim CT. Data disimpan lokal.', 'error');

        let offline = JSON.parse(localStorage.getItem(DRAFT_KEYS_CT.OFFLINE) || '[]');
        offline.push({ ...payload, photos: ctParamPhotos });
        localStorage.setItem(DRAFT_KEYS_CT.OFFLINE, JSON.stringify(offline));
    }
}

// ============================================
// Inisialisasi modul CT (dipanggil dari main.js)
// ============================================
export function initCTLogsheet() {
    const submitBtn = document.getElementById('ctSubmitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', sendCTToSheet);
    }

    const camera = document.getElementById('ctParamCamera');
    if (camera) {
        camera.addEventListener('change', handleCTParamPhoto);
    }
}
