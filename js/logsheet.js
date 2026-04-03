/* ============================================
   TURBINE LOGSHEET PRO - DYNAMIC LOGSHEET MODULE
   ============================================ */

/**
 * File ini menangani seluruh logika pengisian Logsheet secara dinamis.
 * Mulai dari merender menu area, input parameter, status abnormal, 
 * kompresi foto, hingga pengiriman data ke Google Sheets.
 */

// ============================================
// 1. INISIALISASI & FETCH DATA
// ============================================

function openDynamicLogsheet(type) {
    if (typeof requireAuth === 'function' && !requireAuth()) return;
    
    activeLogsheetType = type;
    const config = LOGSHEET_CONFIG[type];
    
    if (!config) {
        showCustomAlert('Konfigurasi logsheet tidak ditemukan!', 'error');
        return;
    }

    // Muat data draft lokal
    try {
        const savedInput = localStorage.getItem(config.draftKey);
        currentInputData = savedInput ? JSON.parse(savedInput) : {};
    } catch (e) {
        currentInputData = {};
    }

    // Set Tema UI
    const titleEl = document.getElementById('dynamicListTitle');
    const progressFill = document.getElementById('dynamicOverallProgressBar');
    const submitBtn = document.getElementById('dynamicSubmitBtn');
    
    if (titleEl) titleEl.textContent = config.title;
    if (progressFill) progressFill.style.background = config.gradient;
    if (submitBtn) submitBtn.style.background = config.gradient;

    // Pindah ke layar List Area
    navigateTo('dynamicAreaListScreen');
    
    // Ambil data referensi terakhir dari server
    fetchLastDynamicData(type);
}

function fetchLastDynamicData(type) {
    if (typeof updateStatusIndicator === 'function') updateStatusIndicator(false);
    
    const timeout = setTimeout(() => renderDynamicMenu(), 8000);
    const callbackName = 'jsonp_dynamic_' + Date.now();
    
    // Menentukan parameter action untuk GAS
    let actionParam = '';
    if (type === 'CT') actionParam = '&action=getLastCT';
    else if (type === '1300') actionParam = '&action=getLast1300';
    else if (type === '1100') actionParam = '&action=getLast1100';
    // Turbin menggunakan default (tanpa action)

    window[callbackName] = (data) => {
        clearTimeout(timeout);
        lastData = data.success ? data.data : {}; 
        if (typeof updateStatusIndicator === 'function') updateStatusIndicator(true);
        if (typeof cleanupJSONP === 'function') cleanupJSONP(callbackName);
        renderDynamicMenu();
    };
    
    const script = document.createElement('script');
    script.src = `${GAS_URL}?callback=${callbackName}${actionParam}`;
    script.onerror = () => {
        clearTimeout(timeout);
        if (typeof cleanupJSONP === 'function') cleanupJSONP(callbackName);
        renderDynamicMenu();
    };
    document.body.appendChild(script);
}

// ============================================
// 2. RENDER MENU AREA
// ============================================

function renderDynamicMenu() {
    const config = LOGSHEET_CONFIG[activeLogsheetType];
    const list = document.getElementById('dynamicAreaList');
    if (!list) return;
    
    const totalAreas = Object.keys(config.areas).length;
    let completedAreas = 0;
    let html = '';
    
    Object.entries(config.areas).forEach(([areaName, params]) => {
        const areaData = currentInputData[areaName] || {};
        const filled = Object.keys(areaData).length;
        const total = params.length;
        const percent = Math.round((filled / total) * 100) || 0;
        const isCompleted = filled === total && total > 0;
        
        // Cek apakah ada parameter yang statusnya abnormal (selain normal value)
        const hasAbnormal = params.some(paramName => {
            const val = areaData[paramName] || '';
            const firstLine = val.split('\n')[0];
            return ['ERROR', 'MAINTENANCE', 'NOT_INSTALLED', 'UPPER', 'OFF'].includes(firstLine);
        });
        
        if (isCompleted) completedAreas++;
        
        const circumference = 2 * Math.PI * 18;
        const strokeDashoffset = circumference - (percent / 100) * circumference;
        
        html += `
            <div class="area-item ${isCompleted ? 'completed' : ''} ${hasAbnormal ? 'has-warning' : ''}" onclick="openDynamicArea('${areaName}')">
                <div class="area-progress-ring">
                    <svg width="40" height="40" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
                        <circle cx="20" cy="20" r="18" fill="none" stroke="${isCompleted ? '#10b981' : config.color}" 
                                stroke-width="3" stroke-linecap="round" stroke-dasharray="${circumference}" 
                                stroke-dashoffset="${strokeDashoffset}" transform="rotate(-90 20 20)"/>
                        <text x="20" y="24" text-anchor="middle" font-size="10" font-weight="bold" fill="${isCompleted ? '#10b981' : '#f8fafc'}">${filled}</text>
                    </svg>
                </div>
                <div class="area-info">
                    <div class="area-name">${areaName}</div>
                    <div class="area-meta ${hasAbnormal ? 'warning' : ''}">
                        ${hasAbnormal ? '⚠️ Ada abnormal • ' : ''}${filled} dari ${total} parameter
                    </div>
                </div>
                <div class="area-status">
                    ${hasAbnormal ? '<span style="color: #ef4444; margin-right: 4px;">!</span>' : ''}
                    ${isCompleted ? '✓' : '❯'}
                </div>
            </div>
        `;
    });
    
    list.innerHTML = html;
    
    // Tampilkan tombol submit jika minimal ada 1 data terisi
    const hasData = Object.keys(currentInputData).length > 0;
    const submitBtn = document.getElementById('dynamicSubmitBtn');
    if (submitBtn) submitBtn.style.display = hasData ? 'flex' : 'none';
    
    updateDynamicOverallProgressUI(completedAreas, totalAreas);
}

function updateDynamicOverallProgressUI(completedAreas, totalAreas) {
    const percent = totalAreas > 0 ? Math.round((completedAreas / totalAreas) * 100) : 0;
    const progressText = document.getElementById('dynamicProgressText');
    const overallProgressBar = document.getElementById('dynamicOverallProgressBar');
    
    if (progressText) progressText.textContent = `${percent}% Selesai`;
    if (overallProgressBar) overallProgressBar.style.width = `${percent}%`;
}

// ============================================
// 3. NAVIGASI AREA & PARAMETER
// ============================================

function openDynamicArea(areaName) {
    activeArea = areaName;
    activeIdx = 0;
    
    loadDynamicParamPhotosFromDraft();
    navigateTo('dynamicParamScreen');
    
    const titleEl = document.getElementById('dynamicAreaTitle');
    if (titleEl) titleEl.textContent = areaName;
    
    showDynamicStep();
}

function detectDynamicInputType(label) {
    // Pola pengecekan parameter khusus yang butuh dropdown
    if (label.includes('(A/M)')) return { type: 'select', options: ['Auto', 'Manual'] };
    if (label.includes('(A/B)')) return { type: 'select', options: ['A', 'B', 'AB'] };
    if (label.includes('(A/B/C/D/E)')) return { type: 'select', options: ['A', 'B', 'C', 'D', 'E'] };
    if (label.includes('(ON/OFF)') || label.includes('(On/Off)')) return { type: 'select', options: ['ON', 'OFF'] };
    if (label.includes('(Running/Stop)')) return { type: 'select', options: ['Running', 'Stop'] };
    if (label.includes('(Remote/Running/Stop)')) return { type: 'select', options: ['Remote', 'Running', 'Stop'] };
    if (label.includes('STATUS')) return { type: 'select', options: ['Running', 'Stop', 'Standby'] };
    
    return { type: 'text', options: null };
}

function getParamUnit(label) {
    const match = label.match(/\(([^)]+)\)/);
    return match ? match[1] : "";
}

function showDynamicStep() {
    const config = LOGSHEET_CONFIG[activeLogsheetType];
    const fullLabel = config.areas[activeArea][activeIdx];
    const totalParams = config.areas[activeArea].length;
    const inputType = detectDynamicInputType(fullLabel);
    
    // Update Header Info
    document.getElementById('dynamicStepInfo').textContent = `Param ${activeIdx + 1} dari ${totalParams}`;
    document.getElementById('dynamicLabelInput').textContent = fullLabel.split(' (')[0];
    
    // Update Nilai Terakhir
    const lastValBadge = document.getElementById('dynamicLastValueBadge');
    const lastValText = document.getElementById('dynamicLastValueText');
    let prevVal = lastData[fullLabel] || '--';
    
    if (prevVal !== '--') {
        const lines = prevVal.toString().split('\n');
        if (['ERROR', 'MAINTENANCE', 'NOT_INSTALLED', 'UPPER', 'OFF'].includes(lines[0])) {
            prevVal = lines[0] + (lines[1] ? ' - ' + lines[1] : '');
        }
        lastValBadge.style.display = 'inline-block';
        lastValText.textContent = prevVal;
    } else {
        lastValBadge.style.display = 'none';
    }

    // Persiapkan DOM Element
    const inputWrapper = document.getElementById('dynamicInputWrapper');
    const valInput = document.getElementById('dynamicValInput');
    const unitDisplay = document.getElementById('dynamicUnitDisplay');
    const selectWrapper = document.getElementById('dynamicSelectWrapper');
    const selectInput = document.getElementById('dynamicSelectInput');

    // Ambil nilai yang sudah diisi sebelumnya (dari Draft)
    let savedValue = (currentInputData[activeArea] && currentInputData[activeArea][fullLabel]) || '';
    let isAbnormal = false;
    let abnormalType = '';
    let abnormalNote = '';

    if (savedValue) {
        const lines = savedValue.split('\n');
        if (['ERROR', 'MAINTENANCE', 'NOT_INSTALLED', 'UPPER', 'OFF'].includes(lines[0])) {
            isAbnormal = true;
            abnormalType = lines[0];
            abnormalNote = lines[1] || '';
            savedValue = ''; // Kosongkan input normal
        } else {
            savedValue = lines[0]; // Ambil baris pertama sebagai nilai normal
        }
    }

    // Render Input berdasarkan Tipe (Text vs Select)
    if (inputType.type === 'select') {
        inputWrapper.style.display = 'none';
        selectWrapper.style.display = 'block';
        
        let optionsHtml = `<option value="" disabled ${!savedValue ? 'selected' : ''}>Pilih Status...</option>`;
        inputType.options.forEach(opt => {
            optionsHtml += `<option value="${opt}" ${savedValue === opt ? 'selected' : ''}>${opt}</option>`;
        });
        selectInput.innerHTML = optionsHtml;
        selectInput.disabled = isAbnormal;
    } else {
        inputWrapper.style.display = 'flex';
        selectWrapper.style.display = 'none';
        
        valInput.value = savedValue;
        valInput.disabled = isAbnormal;
        
        const unit = getParamUnit(fullLabel);
        if (unit) {
            unitDisplay.style.display = 'flex';
            unitDisplay.textContent = unit;
        } else {
            unitDisplay.style.display = 'none';
        }
    }

    // Render Status Abnormal
    loadDynamicAbnormalStatus(abnormalType, abnormalNote);
    
    // Render Foto
    loadDynamicParamPhotoForCurrentStep();

    // Auto Focus
    setTimeout(() => {
        if (!isAbnormal && inputType.type === 'text') {
            valInput.focus();
            valInput.select();
        }
    }, 100);
}

// ============================================
// 4. HANDLING STATUS ABNORMAL
// ============================================

function loadDynamicAbnormalStatus(activeType, note) {
    const chips = document.querySelectorAll('#dynamicStatusChips .chip');
    const noteInput = document.getElementById('dynamicStatusNote');
    
    chips.forEach(chip => {
        chip.classList.remove('active');
        if (activeType && chip.textContent.includes(activeType)) {
            chip.classList.add('active');
        }
    });

    if (activeType && activeType !== 'NORMAL') {
        noteInput.style.display = 'block';
        noteInput.value = note;
    } else {
        noteInput.style.display = 'none';
        noteInput.value = '';
    }
}

function setDynamicStatus(statusType) {
    const noteInput = document.getElementById('dynamicStatusNote');
    const valInput = document.getElementById('dynamicValInput');
    const selectInput = document.getElementById('dynamicSelectInput');

    if (statusType === 'NORMAL') {
        loadDynamicAbnormalStatus(null, '');
        valInput.disabled = false;
        selectInput.disabled = false;
        valInput.style.opacity = '1';
        valInput.focus();
    } else {
        loadDynamicAbnormalStatus(statusType, noteInput.value);
        noteInput.style.display = 'block';
        noteInput.focus();
        
        valInput.disabled = true;
        selectInput.disabled = true;
        valInput.style.opacity = '0.5';
        
        if (statusType === 'NOT_INSTALLED') {
            valInput.value = '-';
        }
    }
    saveCurrentDynamicStep();
}

// ============================================
// 5. PENYIMPANAN DATA SEMENTARA (DRAFT)
// ============================================

function saveCurrentDynamicStep() {
    const config = LOGSHEET_CONFIG[activeLogsheetType];
    const fullLabel = config.areas[activeArea][activeIdx];
    
    const valInput = document.getElementById('dynamicValInput');
    const selectInput = document.getElementById('dynamicSelectInput');
    const noteInput = document.getElementById('dynamicStatusNote');
    
    // Cari status abnormal yang aktif
    const activeChip = document.querySelector('#dynamicStatusChips .chip.active');
    let abnormalStatus = null;
    if (activeChip) {
        if (activeChip.textContent.includes('ERROR')) abnormalStatus = 'ERROR';
        else if (activeChip.textContent.includes('MAINTENANCE')) abnormalStatus = 'MAINTENANCE';
        else if (activeChip.textContent.includes('BELUM PASANG')) abnormalStatus = 'NOT_INSTALLED';
    }

    let valueToSave = '';

    if (abnormalStatus) {
        valueToSave = abnormalStatus;
        if (noteInput.value.trim()) {
            valueToSave += `\n${noteInput.value.trim()}`;
        }
    } else {
        const isSelect = valInput.parentElement.style.display === 'none';
        const rawValue = isSelect ? selectInput.value : valInput.value.trim();
        if (rawValue && rawValue !== 'Pilih Status...') {
            valueToSave = rawValue;
        }
    }

    if (!currentInputData[activeArea]) {
        currentInputData[activeArea] = {};
    }

    if (valueToSave) {
        currentInputData[activeArea][fullLabel] = valueToSave;
    } else {
        delete currentInputData[activeArea][fullLabel];
    }

    localStorage.setItem(config.draftKey, JSON.stringify(currentInputData));
}

function saveDynamicStep() {
    saveCurrentDynamicStep();
    
    const config = LOGSHEET_CONFIG[activeLogsheetType];
    const totalParams = config.areas[activeArea].length;

    if (activeIdx < totalParams - 1) {
        activeIdx++;
        showDynamicStep();
    } else {
        if (typeof showCustomAlert === 'function') {
            showCustomAlert(`Area ${activeArea} selesai!`, 'success');
        }
        setTimeout(() => {
            navigateTo('dynamicAreaListScreen');
            renderDynamicMenu();
        }, 800);
    }
}

function goBackDynamic() {
    saveCurrentDynamicStep();
    
    if (activeIdx > 0) {
        activeIdx--;
        showDynamicStep();
    } else {
        navigateTo('dynamicAreaListScreen');
        renderDynamicMenu();
    }
}

// ============================================
// 6. MANAJEMEN FOTO PARAMETER
// ============================================

async function handleDynamicPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
        showCustomAlert('Ukuran file terlalu besar (>10MB).', 'error');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        const originalDataUrl = e.target.result;
        showCustomAlert('🔄 Memproses foto...', 'info');
        
        try {
            // Compress Image (harus ada di utils.js)
            const result = await compressImage(originalDataUrl, {
                maxWidth: 1600,
                maxHeight: 1600,
                quality: 0.75,
                type: 'image/jpeg'
            });
            
            currentParamPhoto = result.dataUrl;
            saveCurrentPhotoToState();
            updateDynamicPhotoPreview();
            
            showCustomAlert(`✓ Foto siap (${result.compressedSize}KB)`, 'success');
        } catch (error) {
            console.error('Kompresi gagal:', error);
            currentParamPhoto = originalDataUrl; // Fallback ke asli
            saveCurrentPhotoToState();
            updateDynamicPhotoPreview();
        }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
}

function saveCurrentPhotoToState() {
    const config = LOGSHEET_CONFIG[activeLogsheetType];
    const fullLabel = config.areas[activeArea][activeIdx];
    
    if (!currentPhotosData[activeArea]) currentPhotosData[activeArea] = {};
    
    if (currentParamPhoto) {
        currentPhotosData[activeArea][fullLabel] = currentParamPhoto;
    } else {
        delete currentPhotosData[activeArea][fullLabel];
    }
    saveDynamicParamPhotosToDraft();
}

function updateDynamicPhotoPreview() {
    const container = document.getElementById('dynamicPhotoPreviewContainer');
    const img = document.getElementById('dynamicPhotoPreview');
    
    if (currentParamPhoto) {
        img.src = currentParamPhoto;
        container.classList.remove('hidden');
    } else {
        img.src = '';
        container.classList.add('hidden');
    }
}

function removeDynamicPhoto() {
    currentParamPhoto = null;
    saveCurrentPhotoToState();
    updateDynamicPhotoPreview();
}

function loadDynamicParamPhotoForCurrentStep() {
    const config = LOGSHEET_CONFIG[activeLogsheetType];
    const fullLabel = config.areas[activeArea][activeIdx];
    
    currentParamPhoto = currentPhotosData[activeArea]?.[fullLabel] || null;
    updateDynamicPhotoPreview();
}

function saveDynamicParamPhotosToDraft() {
    const config = LOGSHEET_CONFIG[activeLogsheetType];
    try {
        localStorage.setItem(config.photoDraftKey, JSON.stringify(currentPhotosData));
    } catch (e) {
        console.error('Error saving photos:', e);
    }
}

function loadDynamicParamPhotosFromDraft() {
    const config = LOGSHEET_CONFIG[activeLogsheetType];
    try {
        const saved = localStorage.getItem(config.photoDraftKey);
        currentPhotosData = saved ? JSON.parse(saved) : {};
    } catch (e) {
        currentPhotosData = {};
    }
}

// ============================================
// 7. PENGIRIMAN DATA KE GOOGLE SHEETS
// ============================================

async function submitDynamicLogsheet() {
    if (typeof requireAuth === 'function' && !requireAuth()) return;
    
    const config = LOGSHEET_CONFIG[activeLogsheetType];
    const progress = showUploadProgress(`Mengirim ${config.title}...`);
    progress.updateText('Menyiapkan paket data...');
    
    if (typeof currentUploadController !== 'undefined') {
        currentUploadController = new AbortController();
    }
    
    // 1. Ekstrak Parameter
    let allParameters = {};
    Object.entries(currentInputData).forEach(([areaName, params]) => {
        Object.entries(params).forEach(([paramName, value]) => {
            allParameters[paramName] = value;
        });
    });
    
    // 2. Ekstrak Foto
    let allPhotos = {};
    Object.entries(currentPhotosData).forEach(([areaName, areaPhotos]) => {
        Object.entries(areaPhotos).forEach(([paramName, photoData]) => {
            if (photoData) {
                allPhotos[`${areaName}__${paramName}`] = photoData;
            }
        });
    });
    
    const finalData = {
        type: config.postType, // e.g. LOGSHEET_CT, LOGSHEET_1300
        Operator: currentUser ? currentUser.name : 'Unknown',
        OperatorId: currentUser ? currentUser.username : 'Unknown',
        photoCount: Object.keys(allPhotos).length,
        ...allParameters
    };
    
    // 3. Kirim Foto secara berurutan
    if (Object.keys(allPhotos).length > 0) {
        progress.updateText(`Mengirim ${Object.keys(allPhotos).length} foto lampiran...`);
        
        for (const [key, photoData] of Object.entries(allPhotos)) {
            try {
                const photoPayload = {
                    type: 'LOGSHEET_PHOTO',
                    parentType: config.postType,
                    Operator: finalData.Operator,
                    photoKey: key,
                    photo: photoData,
                    timestamp: new Date().toISOString()
                };
                
                await fetch(GAS_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(photoPayload),
                    signal: currentUploadController ? currentUploadController.signal : undefined
                });
                
                // Jeda kecil agar server tidak kewalahan
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
                console.warn('Gagal mengirim sebagian foto:', key, error);
            }
        }
    }
    
    // 4. Kirim Data Parameter Utama
    progress.updateText('Mengirim data parameter utama...');
    try {
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalData),
            signal: currentUploadController ? currentUploadController.signal : undefined
        });
        
        progress.complete();
        showCustomAlert('✓ Data berhasil dikirim dan disinkronisasi!', 'success');
        
        // Bersihkan state dan draft lokal
        currentInputData = {};
        currentPhotosData = {};
        currentParamPhoto = null;
        localStorage.removeItem(config.draftKey);
        localStorage.removeItem(config.photoDraftKey);
        
        // Kembali ke menu utama
        setTimeout(() => navigateTo('mainMenuScreen'), 1500);
        
    } catch (error) {
        console.error('Pengiriman gagal:', error);
        progress.error();
        
        // Simpan ke antrean offline jika jaringan putus
        let offlineData = JSON.parse(localStorage.getItem(config.offlineKey) || '[]');
        offlineData.push({...finalData, photos: allPhotos});
        localStorage.setItem(config.offlineKey, JSON.stringify(offlineData));
        
        setTimeout(() => {
            showCustomAlert('Koneksi terputus. Data disimpan otomatis di mode Offline.', 'error');
        }, 800);
    }
}