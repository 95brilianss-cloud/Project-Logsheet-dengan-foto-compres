// balancing.js
// Module untuk layar Balancing Power & Steam Turbine Logsheet Pro

import { 
  showCustomAlert, 
  showUploadProgress 
} from './ui-utils.js';

import { 
  currentUser, 
  requireAuth 
} from './auth.js';

import { 
  GAS_URL, 
  BALANCING_FIELDS 
} from './constants.js';

import { 
  saveBalancingDraft, 
  clearBalancingDraft, 
  getBalancingDraft,
  saveBalancingHistory,
  saveBalancingOffline 
} from './state.js';

// ────────────────────────────────────────────────
// Inisialisasi layar Balancing
// ────────────────────────────────────────────────
export function initBalancingScreen() {
  if (!requireAuth()) return;

  // Load data awal (draft > server > default)
  loadLastBalancingData();

  // Pasang semua event listener khusus balancing
  setupBalancingEventListeners();

  // Auto-save draft setiap 15 detik jika ada perubahan
  startBalancingAutoSave();
}

// ────────────────────────────────────────────────
// Load data terakhir (prioritas: draft > server > default)
// ────────────────────────────────────────────────
function loadLastBalancingData() {
  const loader = document.getElementById('balancingLoader');
  if (loader) loader.style.display = 'flex';

  // 1. Coba dari draft lokal dulu (user sedang mengisi tapi belum submit)
  const draft = getBalancingDraft();
  if (draft && Object.keys(draft).length > 3) {  // minimal beberapa field terisi
    applyBalancingFormData(draft, 'draft');
    if (loader) loader.style.display = 'none';
    showCustomAlert('✓ Draft balancing sebelumnya dimuat kembali', 'info');
    return;
  }

  // 2. Coba ambil data terakhir dari server
  fetchLastBalancing()
    .then(data => {
      if (data && !data.error) {
        applyBalancingFormData(data, 'server');
      } else {
        setDefaultBalancingDateTime();
      }
    })
    .catch(err => {
      console.warn('Gagal load data balancing terakhir:', err);
      setDefaultBalancingDateTime();
      showCustomAlert('Tidak dapat memuat data terakhir dari server', 'warning');
    })
    .finally(() => {
      if (loader) loader.style.display = 'none';
    });
}

async function fetchLastBalancing() {
  return new Promise((resolve) => {
    const cbName = `balLast_${Date.now()}`;
    window[cbName] = (response) => {
      delete window[cbName];
      resolve(response);
    };

    const script = document.createElement('script');
    script.src = `${GAS_URL}?action=getLastBalancing&callback=${cbName}`;
    script.onerror = () => resolve({ error: 'network' });
    document.body.appendChild(script);
  });
}

function applyBalancingFormData(data, source = 'unknown') {
  const mapping = getBalancingFieldMapping(data);

  BALANCING_FIELDS.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (!element) return;

    const value = mapping[fieldId];
    if (value !== undefined && value !== null && value !== '') {
      if (element.tagName === 'SELECT') {
        element.value = value || element.options[0]?.value || '';
      } else {
        element.value = value;
      }
    }
  });

  // Trigger logic khusus setelah fill
  const eksporEl = document.getElementById('eksporMW');
  if (eksporEl?.value) {
    handleEksporImporChange(eksporEl);
  }

  calculateLPBalance();
  saveBalancingDraft();   // simpan ulang ke draft setelah load

  const msg = source === 'server' 
    ? 'Data balancing terakhir dari server dimuat'
    : 'Draft balancing lokal dimuat kembali';

  showCustomAlert(msg, 'success');
}

function setDefaultBalancingDateTime() {
  const now = new Date();
  document.getElementById('balancingDate')?.setAttribute('value', now.toISOString().split('T')[0]);
  document.getElementById('balancingTime')?.setAttribute('value', now.toTimeString().slice(0,5));
}

function getBalancingFieldMapping(data) {
  return {
    balancingDate: data?.Tanggal,
    balancingTime: data?.Jam,
    loadMW: data?.Load_MW,
    eksporMW: data?.Ekspor_Impor_MW,
    plnMW: data?.PLN_MW,
    ubbMW: data?.UBB_MW,
    pieMW: data?.PIE_MW,
    tg65MW: data?.TG65_MW,
    tg66MW: data?.TG66_MW,
    gtgMW: data?.GTG_MW,
    ss6500MW: data?.SS6500_MW,
    ss2000Via: data?.SS2000_Via || 'TR-Main01',
    activePowerMW: data?.Active_Power_MW,
    reactivePowerMVAR: data?.Reactive_Power_MVAR,
    currentS: data?.Current_S_A,
    voltageV: data?.Voltage_V,
    hvs65l02MW: data?.HVS65_L02_MW,
    hvs65l02Current: data?.HVS65_L02_Current_A,
    total3BMW: data?.Total_3B_MW,
    fq1105: data?.['Produksi_Steam_SA_t/h'],
    stgSteam: data?.['STG_Steam_t/h'],
    pa2Steam: data?.['PA2_Steam_t/h'],
    puri2Steam: data?.['Puri2_Steam_t/h'],
    melterSA2: data?.['Melter_SA2_t/h'],
    ejectorSteam: data?.['Ejector_t/h'],
    glandSealSteam: data?.['Gland_Seal_t/h'],
    deaeratorSteam: data?.['Deaerator_t/h'],
    dumpCondenser: data?.['Dump_Condenser_t/h'],
    pcv6105: data?.['PCV6105_t/h'],
    pi6122: data?.['PI6122_kg/cm2'],
    ti6112: data?.['TI6112_C'],
    ti6146: data?.['TI6146_C'],
    ti6126: data?.['TI6126_C'],
    axialDisplacement: data?.['Axial_Displacement_mm'],
    vi6102: data?.['VI6102_μm'],
    te6134: data?.['TE6134_C'],
    ctSuFan: data?.['CT_SU_Fan'],
    ctSuPompa: data?.['CT_SU_Pompa'],
    ctSaFan: data?.['CT_SA_Fan'],
    ctSaPompa: data?.['CT_SA_Pompa'],
    kegiatanShift: data?.Kegiatan_Shift
  };
}

// ────────────────────────────────────────────────
// Event listeners khusus balancing
// ────────────────────────────────────────────────
function setupBalancingEventListeners() {
  // Ekspor/Impor → styling khusus + label berubah
  const ekspor = document.getElementById('eksporMW');
  if (ekspor) {
    ekspor.addEventListener('input', () => {
      handleEksporImporChange(ekspor);
      saveBalancingDraft();
    });
  }

  // Field yang memengaruhi LP balance
  const balanceWatchFields = [
    'fq1105','stgSteam','pa2Steam','puri2Steam','melterSA2',
    'ejectorSteam','glandSealSteam','deaeratorSteam','dumpCondenser','pcv6105'
  ];

  balanceWatchFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        calculateLPBalance();
        saveBalancingDraft();
      });
    }
  });

  // Toggle section detail SS2000
  const ss2000 = document.getElementById('ss2000Via');
  if (ss2000) {
    ss2000.addEventListener('change', toggleSS2000Detail);
    toggleSS2000Detail(); // panggil sekali di awal
  }

  // Tombol Reset
  document.getElementById('balancingResetBtn')?.addEventListener('click', resetBalancingForm);

  // Tombol Submit
  document.getElementById('balancingSubmitBtn')?.addEventListener('click', submitBalancingData);
}

function handleEksporImporChange(input) {
  const val = parseFloat(input.value) || 0;
  const label = document.getElementById('eksporLabel');
  const hint = document.getElementById('eksporHint');

  if (!label || !hint) return;

  input.classList.remove('status-ekspor', 'status-impor', 'status-netral');

  if (val < 0) {
    label.textContent = 'Ekspor (MW)';
    label.style.color = '#10b981';
    hint.innerHTML = '✓ <strong>Ekspor ke Grid</strong> (nilai negatif)';
    hint.style.color = '#10b981';
    input.classList.add('status-ekspor');
  } else if (val > 0) {
    label.textContent = 'Impor (MW)';
    label.style.color = '#f59e0b';
    hint.innerHTML = '✓ <strong>Impor dari Grid</strong> (nilai positif)';
    hint.style.color = '#f59e0b';
    input.classList.add('status-impor');
  } else {
    label.textContent = 'Ekspor/Impor (MW)';
    label.style.color = '#94a3b8';
    hint.innerHTML = 'Minus (-) = Ekspor • Plus (+) = Impor';
    hint.style.color = '#94a3b8';
    input.classList.add('status-netral');
  }
}

export function calculateLPBalance() {
  const produksi = Number(document.getElementById('fq1105')?.value) || 0;

  const konsumsiIds = [
    'stgSteam','pa2Steam','puri2Steam','deaeratorSteam',
    'dumpCondenser','pcv6105','melterSA2','ejectorSteam','glandSealSteam'
  ];

  let totalKonsumsi = 0;
  konsumsiIds.forEach(id => {
    totalKonsumsi += Number(document.getElementById(id)?.value) || 0;
  });

  const elTotal = document.getElementById('totalKonsumsiSteam');
  if (elTotal) elTotal.textContent = totalKonsumsi.toFixed(1) + ' t/h';

  const selisih = produksi - totalKonsumsi;
  const nilaiAbs = Math.abs(selisih);

  const label = document.getElementById('lpBalanceLabel');
  const statusEl = document.getElementById('lpBalanceStatus');
  const valueEl = document.getElementById('lpBalanceValue');

  if (valueEl) valueEl.value = nilaiAbs.toFixed(1);

  if (selisih < 0) {
    label.textContent = 'LPS Impor dari SU 3A (t/h)';
    if (statusEl) {
      statusEl.textContent = 'Posisi: Impor dari 3A';
      statusEl.style.color = '#f59e0b';
    }
  } else {
    label.textContent = 'LPS Ekspor ke SU 3A (t/h)';
    if (statusEl) {
      statusEl.textContent = 'Posisi: Ekspor ke 3A';
      statusEl.style.color = '#10b981';
    }
  }

  return selisih;
}

function toggleSS2000Detail() {
  const select = document.getElementById('ss2000Via');
  const container = document.getElementById('ss2000Detail');
  if (select && container) {
    container.style.display = select.value ? 'block' : 'none';
  }
}

function resetBalancingForm() {
  if (!confirm('Reset form balancing?\nSemua data akan dihapus dari form dan draft.')) return;

  clearBalancingDraft();

  BALANCING_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (el.tagName === 'SELECT') el.selectedIndex = 0;
      else el.value = '';
    }
  });

  setDefaultBalancingDateTime();
  calculateLPBalance();
  handleEksporImporChange(document.getElementById('eksporMW'));

  showCustomAlert('Form balancing telah direset', 'success');
}

// ────────────────────────────────────────────────
// Auto-save interval
// ────────────────────────────────────────────────
let balancingAutoSaveTimer = null;

function startBalancingAutoSave() {
  if (balancingAutoSaveTimer) clearInterval(balancingAutoSaveTimer);

  balancingAutoSaveTimer = setInterval(() => {
    if (isBalancingFormDirty()) {
      saveBalancingDraft();
      console.debug('[balancing] auto-saved');
    }
  }, 15000); // 15 detik
}

function stopBalancingAutoSave() {
  if (balancingAutoSaveTimer) {
    clearInterval(balancingAutoSaveTimer);
    balancingAutoSaveTimer = null;
  }
}

// Anda bisa panggil stopBalancingAutoSave() saat keluar dari screen balancing
// (bisa ditambahkan di navigateTo logic di main.js)

// ────────────────────────────────────────────────
// Submit data balancing ke server + WA
// ────────────────────────────────────────────────
export async function submitBalancingData() {
  if (!requireAuth()) return;

  // Validasi minimal wajib
  const wajib = ['balancingDate', 'balancingTime', 'loadMW', 'fq1105', 'stgSteam'];
  for (const id of wajib) {
    const el = document.getElementById(id);
    if (!el?.value?.trim()) {
      showCustomAlert(`Field ${getFieldLabel(id)} wajib diisi`, 'error');
      el?.focus();
      return;
    }
  }

  const progress = showUploadProgress('Mengirim data balancing...');

  const eksporVal = Number(document.getElementById('eksporMW')?.value) || 0;
  const lpDiff = calculateLPBalance();

  const payload = {
    type: 'BALANCING',
    Operator: currentUser?.name || currentUser?.username || 'Unknown',
    OperatorDept: currentUser?.department || 'Unit Utilitas 3B',
    Timestamp: new Date().toISOString(),
    Shift: currentUser?.shift || '3',

    Tanggal: document.getElementById('balancingDate')?.value || '',
    Jam: document.getElementById('balancingTime')?.value || '',

    Load_MW: Number(document.getElementById('loadMW')?.value) || 0,
    Ekspor_Impor_MW: eksporVal,
    Ekspor_Impor_Status: eksporVal < 0 ? 'Ekspor' : (eksporVal > 0 ? 'Impor' : 'Netral'),

    PLN_MW: Number(document.getElementById('plnMW')?.value) || 0,
    UBB_MW: Number(document.getElementById('ubbMW')?.value) || 0,
    PIE_MW: Number(document.getElementById('pieMW')?.value) || 0,
    TG65_MW: Number(document.getElementById('tg65MW')?.value) || 0,
    TG66_MW: Number(document.getElementById('tg66MW')?.value) || 0,
    GTG_MW: Number(document.getElementById('gtgMW')?.value) || 0,

    SS6500_MW: Number(document.getElementById('ss6500MW')?.value) || 0,
    SS2000_Via: document.getElementById('ss2000Via')?.value || 'TR-Main01',
    Active_Power_MW: Number(document.getElementById('activePowerMW')?.value) || 0,
    Reactive_Power_MVAR: Number(document.getElementById('reactivePowerMVAR')?.value) || 0,
    Current_S_A: Number(document.getElementById('currentS')?.value) || 0,
    Voltage_V: Number(document.getElementById('voltageV')?.value) || 0,
    HVS65_L02_MW: Number(document.getElementById('hvs65l02MW')?.value) || 0,
    HVS65_L02_Current_A: Number(document.getElementById('hvs65l02Current')?.value) || 0,
    Total_3B_MW: Number(document.getElementById('total3BMW')?.value) || 0,

    'Produksi_Steam_SA_t/h': Number(document.getElementById('fq1105')?.value) || 0,
    'STG_Steam_t/h': Number(document.getElementById('stgSteam')?.value) || 0,
    'PA2_Steam_t/h': Number(document.getElementById('pa2Steam')?.value) || 0,
    'Puri2_Steam_t/h': Number(document.getElementById('puri2Steam')?.value) || 0,
    'Melter_SA2_t/h': Number(document.getElementById('melterSA2')?.value) || 0,
    'Ejector_t/h': Number(document.getElementById('ejectorSteam')?.value) || 0,
    'Gland_Seal_t/h': Number(document.getElementById('glandSealSteam')?.value) || 0,
    'Deaerator_t/h': Number(document.getElementById('deaeratorSteam')?.value) || 0,
    'Dump_Condenser_t/h': Number(document.getElementById('dumpCondenser')?.value) || 0,
    'PCV6105_t/h': Number(document.getElementById('pcv6105')?.value) || 0,

    Total_Konsumsi_Steam_t_h: Number(document.getElementById('totalKonsumsiSteam')?.textContent?.replace(/[^0-9.]/g,'')) || 0,
    LPS_Balance_t_h: Math.abs(lpDiff),
    LPS_Balance_Status: lpDiff < 0 ? 'Impor dari 3A' : 'Ekspor ke 3A',

    'PI6122_kg/cm2': Number(document.getElementById('pi6122')?.value) || 0,
    'TI6112_C': Number(document.getElementById('ti6112')?.value) || 0,
    'TI6146_C': Number(document.getElementById('ti6146')?.value) || 0,
    'TI6126_C': Number(document.getElementById('ti6126')?.value) || 0,
    'Axial_Displacement_mm': Number(document.getElementById('axialDisplacement')?.value) || 0,
    'VI6102_μm': Number(document.getElementById('vi6102')?.value) || 0,
    'TE6134_C': Number(document.getElementById('te6134')?.value) || 0,

    'CT_SU_Fan': parseInt(document.getElementById('ctSuFan')?.value) || 0,
    'CT_SU_Pompa': parseInt(document.getElementById('ctSuPompa')?.value) || 0,
    'CT_SA_Fan': parseInt(document.getElementById('ctSaFan')?.value) || 0,
    'CT_SA_Pompa': parseInt(document.getElementById('ctSaPompa')?.value) || 0,

    Kegiatan_Shift: document.getElementById('kegiatanShift')?.value?.trim() || ''
  };

  try {
    progress?.updateText('Mengirim ke Google Sheet...');

    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    progress?.complete();
    showCustomAlert('✓ Data balancing berhasil dikirim!', 'success');

    // Simpan ke history lokal
    saveBalancingHistory({ ...payload, submittedAt: new Date().toISOString() });

    // Buka WhatsApp setelah 1 detik
    setTimeout(() => {
      const message = formatBalancingWhatsAppMessage(payload);
      const waNumber = '6281382160345'; // ganti sesuai kebutuhan
      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
      
      // Kembali ke home setelah kirim
      setTimeout(() => navigateTo('homeScreen'), 800);
    }, 1200);

  } catch (err) {
    console.error('Submit balancing gagal:', err);
    progress?.error();

    saveBalancingOffline(payload);
    showCustomAlert('Gagal mengirim. Data disimpan lokal untuk dikirim nanti.', 'warning');
  }
}

// ────────────────────────────────────────────────
// Format pesan WhatsApp (sesuai format lama Anda)
// ────────────────────────────────────────────────
function formatBalancingWhatsAppMessage(d) {
  const f2 = n => isNaN(n) ? '-' : Number(n).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const f1 = n => isNaN(n) ? '-' : Number(n).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const f0 = n => isNaN(n) ? '-' : Number(n).toLocaleString('id-ID');

  const [y, m, dd] = (d.Tanggal || '----').split('-');
  const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const tgl = `${dd} ${bulan[parseInt(m)-1] || ''} ${y}`;

  let msg = `*Update STG 17,5 MW*\n`;
  msg += `Tgl ${tgl}\n`;
  msg += `Jam ${d.Jam || '--:--'}\n\n`;

  msg += `*Output Power STG 17,5*\n`;
  msg += `⠂ Load = ${f2(d.Load_MW)} MW\n`;
  msg += `⠂ ${d.Ekspor_Impor_Status || 'Netral'} = ${f2(Math.abs(d.Ekspor_Impor_MW))} MW\n\n`;

  msg += `*Balance Power SCADA*\n`;
  msg += `⠂ PLN = ${f2(d.PLN_MW)}MW\n`;
  msg += `⠂ UBB = ${f2(d.UBB_MW)}MW\n`;
  msg += `⠂ PIE = ${f2(d.PIE_MW)} MW\n`;
  msg += `⠂ TG-65 = ${f2(d.TG65_MW)} MW\n`;
  msg += `⠂ TG-66 = ${f2(d.TG66_MW)} MW\n`;
  msg += `⠂ GTG = ${f2(d.GTG_MW)} MW\n\n`;

  msg += `*Konsumsi Power 3B*\n`;
  msg += `● SS-6500 (TR-Main 01) = ${f2(d.SS6500_MW)} MW\n`;
  msg += `● SS-2000 *Via ${d.SS2000_Via || 'TR-Main01'}*\n`;
  msg += `  ⠂ Active power = ${f2(d.Active_Power_MW)} MW\n`;
  msg += `  ⠂ Reactive power = ${f2(d.Reactive_Power_MVAR)} MVAR\n`;
  msg += `  ⠂ Current S = ${f1(d.Current_S_A)} A\n`;
  msg += `  ⠂ Voltage = ${f0(d.Voltage_V)} V\n`;
  msg += `  ⠂ (HVS65 L02) = ${f2(d.HVS65_L02_MW)} MW (${f0(d.HVS65_L02_Current_A)} A)\n`;
  msg += `● Total 3B = ${f2(d.Total_3B_MW)}MW\n\n`;

  msg += `*Produksi Steam SA*\n`;
  msg += `⠂ FQ-1105 = ${f1(d['Produksi_Steam_SA_t/h'])} t/h\n\n`;

  msg += `*Konsumsi Steam 3B*\n`;
  msg += `⠂ STG 17,5 = ${f1(d['STG_Steam_t/h'])} t/h\n`;
  msg += `⠂ PA2 = ${f1(d['PA2_Steam_t/h'])} t/h\n`;
  msg += `⠂ Puri2 = ${f1(d['Puri2_Steam_t/h'])} t/h\n`;
  msg += `⠂ Melter SA2 = ${f1(d['Melter_SA2_t/h'])} t/h\n`;
  msg += `⠂ Ejector = ${f1(d['Ejector_t/h'])} t/h\n`;
  msg += `⠂ Gland Seal = ${f1(d['Gland_Seal_t/h'])} t/h\n`;
  msg += `⠂ Deaerator = ${f1(d['Deaerator_t/h'])} t/h\n`;
  msg += `⠂ Dump Condenser = ${f1(d['Dump_Condenser_t/h'])} t/h\n`;
  msg += `⠂ PCV-6105 = ${f1(d['PCV6105_t/h'])} t/h\n`;
  msg += `*⠂ Total Konsumsi* = ${f1(d.Total_Konsumsi_Steam_t_h)} t/h\n\n`;

  msg += `*${d.LPS_Balance_Status || 'Balance LPS'}* = ${f1(d.LPS_Balance_t_h)} t/h\n\n`;

  msg += `*Monitoring*\n`;
  msg += `⠂ Steam Extraction PI-6122 = ${f2(d['PI6122_kg/cm2'])} kg/cm² & TI-6112 = ${f1(d['TI6112_C'])} °C\n`;
  msg += `⠂ Temp. Cooling Air Inlet (TI-6146) = ${f2(d['TI6146_C'])} °C\n`;
  msg += `⠂ Temp. Lube Oil (TI-6126) = ${f2(d['TI6126_C'])} °C\n`;
  msg += `⠂ Axial Displacement = ${f2(d['Axial_Displacement_mm'])} mm (High : 0,6 mm)\n`;
  msg += `⠂ Vibrasi VI-6102 = ${f2(d['VI6102_μm'])} μm (High : 85 μm)\n`;
  msg += `⠂ Temp. Journal Bearing TE-6134 = ${f1(d['TE6134_C'])} °C (High : 115 °C)\n`;
  msg += `⠂ CT SU = Fan : ${f0(d['CT_SU_Fan'])} & Pompa : ${f0(d['CT_SU_Pompa'])}\n`;
  msg += `⠂ CT SA = Fan : ${f0(d['CT_SA_Fan'])} & Pompa : ${f0(d['CT_SA_Pompa'])}\n\n`;

  msg += `*Kegiatan Shift ${d.Shift || '?'}*\n`;
  msg += (d.Kegiatan_Shift || '-').trim();

  return msg;
}

// Helper sederhana untuk label validasi
function getFieldLabel(id) {
  const labels = {
    loadMW: 'Load MW',
    fq1105: 'FQ-1105 (Produksi Steam)',
    stgSteam: 'STG Steam t/h'
  };
  return labels[id] || id;
}

// Export fungsi utama yang dibutuhkan main.js atau file lain
export {
  initBalancingScreen,
  submitBalancingData,
  calculateLPBalance,
  resetBalancingForm
};
