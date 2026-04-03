/* ============================================
   TURBINE LOGSHEET PRO - CONFIGURATION
   ============================================ */

// ============================================
// 1. APP CONFIGURATION
// ============================================
const APP_VERSION = '2.3.8';
const APP_NAME = 'Turbine Logsheet Pro';

const AUTH_CONFIG = {
    SESSION_KEY: 'turbine_session',
    USER_KEY: 'turbine_user',
    USERS_CACHE_KEY: 'turbine_users_cache',
    SESSION_DURATION: 8 * 60 * 60 * 1000,           // 8 jam
    REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000  // 30 hari
};

const DRAFT_KEYS = {
    LOGSHEET: 'draft_turbine',
    LOGSHEET_BACKUP: 'draft_turbine_backup',
    BALANCING: 'balancing_draft',
    TPM_OFFLINE: 'tpm_offline',
    LOGSHEET_OFFLINE: 'offline_logsheets',
    BALANCING_OFFLINE: 'balancing_offline',
    TPM_HISTORY: 'tpm_history',
    BALANCING_HISTORY: 'balancing_history'
};

const DRAFT_KEYS_CT = {
    LOGSHEET: 'draft_ct_logsheet',
    OFFLINE: 'offline_ct_logsheets'
};

const DRAFT_KEYS_1300 = {
    LOGSHEET: 'draft_1300_logsheet',
    OFFLINE: 'offline_1300_logsheets'
};

const DRAFT_KEYS_1100 = {
    LOGSHEET: 'draft_logsheet_1100',
    OFFLINE: 'offline_logsheet_1100'
};

const PHOTO_DRAFT_KEYS = {
    TURBINE: 'draft_turbine_photos',
    CT: 'draft_ct_photos',
    AREA1300: 'draft_1300_photos',
    AREA1100: 'draft_photos_1100'
};

// URL Google Apps Script Backend
const GAS_URL = "https://script.google.com/macros/s/AKfycbwbdBOXOt059hCgLzubHFtSB6sai_f4fmd0qv5hJSlJJBPsE-2V1n_hruOaOOl5O-Mv/exec";

// Fallback users untuk mode offline (legacy support)
const OFFLINE_USERS = {
    'admin': { password: 'admin123', role: 'admin', name: 'Administrator', department: 'Unit Utilitas 3B' },
    'operator': { password: 'operator123', role: 'operator', name: 'Operator Shift', department: 'Unit Utilitas 3B' },
    'utilitas3b': { password: 'pgresik2024', role: 'operator', name: 'Unit Utilitas 3B', department: 'Unit Utilitas 3B' }
};

// Field configuration untuk Balancing
const BALANCING_FIELDS = [
    'balancingDate', 'balancingTime',
    'loadMW', 'eksporMW',
    'plnMW', 'ubbMW', 'pieMW', 'tg65MW', 'tg66MW', 'gtgMW',
    'ss6500MW', 'ss2000Via', 'activePowerMW', 'reactivePowerMVAR', 
    'currentS', 'voltageV', 'hvs65l02MW', 'hvs65l02Current', 'total3BMW',
    'fq1105',
    'stgSteam', 'pa2Steam', 'puri2Steam', 'melterSA2', 
    'ejectorSteam', 'glandSealSteam', 'deaeratorSteam', 
    'dumpCondenser', 'pcv6105',
    'pi6122', 'ti6112', 'ti6146', 'ti6126', 
    'axialDisplacement', 'vi6102', 'te6134',
    'ctSuFan', 'ctSuPompa', 'ctSaFan', 'ctSaPompa',
    'kegiatanShift'
];

// ============================================
// 2. DATA STRUKTUR AREA
// ============================================

// Struktur Area Turbine Logsheet
const AREAS = {
    "Steam Inlet Turbine": [
        "MPS Inlet 30-TP-6101 PI-6114 (kg/cm2)", 
        "MPS Inlet 30-TP-6101 TI-6153 (°C)", 
        "MPS Inlet 30-TP-6101 PI-6116 (kg/cm2)", 
        "LPS Extrac 30-TP-6101 PI-6123 (kg/cm2)", 
        "Gland Steam TI-6156 (°C)", 
        "MPS Inlet 30-TP-6101 PI-6108 (Kg/cm2)", 
        "Exhaust Steam PI-6111 (kg/cm2)", 
        "Gland Steam PI-6118 (Kg/cm2)"
    ],
    "Low Pressure Steam": [
        "LPS from U-6101 PI-6104 (kg/cm2)", 
        "LPS from U-6101 TI-6102 (°C)", 
        "LPS Header PI-6106 (Kg/cm2)", 
        "LPS Header TI-6107 (°C)"
    ],
    "Lube Oil": [
        "Lube Oil 30-TK-6102 LI-6104 (%)", 
        "Lube Oil 30-TK-6102 TI-6125 (°C)", 
        "Lube Oil 30-C-6101 (On/Off)", 
        "Lube Oil 30-EH-6102 (On/Off)", 
        "Lube Oil Cartridge FI-6143 (%)", 
        "Lube Oil Cartridge PI-6148 (mmH2O)", 
        "Lube Oil Cartridge PI-6149 (mmH2O)", 
        "Lube Oil PI-6145 (kg/cm2)", 
        "Lube Oil E-6104 (A/B)", 
        "Lube Oil TI-6127 (°C)", 
        "Lube Oil FIL-6101 (A/B)", 
        "Lube Oil PDI-6146 (Kg/cm2)", 
        "Lube Oil PI-6143 (Kg/cm2)", 
        "Lube Oil TI-6144 (°C)", 
        "Lube Oil TI-6146 (°C)", 
        "Lube Oil TI-6145 (°C)", 
        "Lube Oil FG-6144 (%)", 
        "Lube Oil FG-6146 (%)", 
        "Lube Oil TI-6121 (°C)", 
        "Lube Oil TI-6116 (°C)", 
        "Lube Oil FG-6121 (%)", 
        "Lube Oil FG-6116 (%)"
    ],
    "Control Oil": [
        "Control Oil 30-TK-6103 LI-6106 (%)", 
        "Control Oil 30-TK-6103 TI-6128 (°C)", 
        "Control Oil P-6106 (A/B)", 
        "Control Oil FIL-6103 (A/B)", 
        "Control Oil PI-6152 (Bar)"
    ],
    "Shaft Line": [
        "Jacking Oil 30-P-6105 PI-6158 (Bar)", 
        "Jacking Oil 30-P-6105 PI-6161 (Bar)", 
        "Electrical Turning Gear U-6103 (Remote/Running/Stop)", 
        "EH-6101 (ON/OFF)"
    ],
    "Condenser 30-E-6102": [
        "LG-6102 (%)", 
        "30-P-6101 (A/B)", 
        "30-P-6101 Suction (kg/cm2)", 
        "30-P-6101 Discharge (kg/cm2)", 
        "30-P-6101 Load (Ampere)"
    ],
    "Ejector": [
        "J-6101 PI-6126 A (Kg/cm2)", 
        "J-6101 PI-6127 B (Kg/cm2)", 
        "J-6102 PI-6128 A (Kg/cm2)", 
        "J-6102 PI-6129 B (Kg/cm2)", 
        "J-6104 PI-6131 (Kg/cm2)", 
        "J-6104 PI-6138 (Kg/cm2)", 
        "PI-6172 (kg/cm2)", 
        "LPS Extrac 30-TP-6101 TI-6155 (°C)", 
        "from U-6102 TI-6104 (°C)"
    ],
    "Generator Cooling Water": [
        "Air Cooler PI-6124 A (Kg/cm2)", 
        "Air Cooler PI-6124 B (Kg/cm2)", 
        "Air Cooler TI-6113 A (°C)", 
        "Air Cooler TI-6113 B (°C)", 
        "Air Cooler PI-6125 A (Kg/cm2)", 
        "Air Cooler PI-6125 B (Kg/cm2)", 
        "Air Cooler TI-6114 A (°C)", 
        "Air Cooler TI-6114 B (°C)"
    ],
    "Condenser Cooling Water": [
        "Condenser PI-6135 A (Kg/cm2)", 
        "Condenser PI-6135 B (Kg/cm2)", 
        "Condenser TI-6118 A (°C)", 
        "Condenser TI-6118 B (°C)", 
        "Condenser PI-6136 A (Kg/cm2)", 
        "Condenser PI-6136 B (Kg/cm2)", 
        "Condenser TI-6119 A (°C)", 
        "Condenser TI-6119 B (°C)"
    ],
    "BFW System": [
        "Condensate Tank TK-6201 (%)", 
        "Condensate Tank TI-6216 (°C)", 
        "P-6202 (A/B)", 
        "P-6202 Suction (kg/cm2)", 
        "P-6202 Discharge (kg/cm2)", 
        "P-6202 Load (Ampere)", 
        "Deaerator LI-6202 (%)", 
        "Deaerator TI-6201 (°C)", 
        "30-P-6201 (A/B)", 
        "30-P-6201 Suction (kg/cm2)", 
        "30-P-6201 Discharge (kg/cm2)", 
        "30-P-6201 Load (Ampere)", 
        "30-C-6202 A (ON/OFF)", 
        "30-C-6202 A (Ampere)", 
        "30-C-6202 B (ON/OFF)", 
        "30-C-6202 B (Ampere)", 
        "30-C-6202 PCV-6216 (%)", 
        "30-C-6202 PI-6107 (kg/cm2)", 
        "Condensate Drum 30-D-6201 LI-6209 (%)", 
        "Condensate Drum 30-D-6201 PI-6218 (kg/cm2)", 
        "Condensate Drum 30-D-6201 TI-6215 (°C)"
    ],
    "Chemical Dosing": [
        "30-TK-6205 LI-6204 (%)", 
        "30-TK-6205 30-P-6205 (A/B)", 
        "30-TK-6205 Disch (kg/cm2)", 
        "30-TK-6205 Stroke (%)", 
        "30-TK-6206 LI-6206 (%)", 
        "30-TK-6206 30-P-6206 (A/B)", 
        "30-TK-6206 Disch (kg/cm2)", 
        "30-TK-6206 Stroke (%)", 
        "30-TK-6207 LI-6208 (%)", 
        "30-TK-6207 30-P-6207 (A/B)", 
        "30-TK-6207 Disch (kg/cm2)", 
        "30-TK-6207 Stroke (%)"
    ]
};

// Struktur Area CT Logsheet
const AREAS_CT = {
    "BASIN SA": [
        "D-6511 LEVEL BASIN",
        "D-6511 BLOWDOWN",
        "D-6511 PH BASIN", 
        "D-6511 TRASSAR (A/M)", 
        "TK-6511 LEVEL ACID", 
        "FIL-6511 (A/B)", 
        "30-P-6511 A PRESS (kg/cm2)", 
        "30-P-6511 B PRESS (kg/cm2)", 
        "30-P-6511 C PRESS (kg/cm2)", 
        "MT-6511 A STATUS", 
        "MT-6511 B STATUS", 
        "MT-6511 C STATUS", 
        "MT-6511 D STATUS"
    ], 
    "BASIN SU": [
        "D-6521 LEVEL BASIN",
        "D-6521 BLOWDOWN",
        "D-6521 PH BASIN", 
        "D-6521 TRASSAR (A/M)", 
        "TK-6521 LEVEL ACID", 
        "FIL-6521 (A/B)", 
        "30-P-6521 A PRESS (kg/cm2)", 
        "30-P-6521 B PRESS (kg/cm2)", 
        "30-P-6521 C PRESS (kg/cm2)", 
        "MT-6521 A STATUS", 
        "MT-6521 B STATUS", 
        "MT-6521 C STATUS", 
        "MT-6521 D STATUS"
    ],
   "COMPRESSOR": [
                  "C-6701 A STATUS",
                  "C-6701 A PRESSURE",
                  "C-6701 A TEMP",
                  "C-6701 A FLOW",
                  "C-6701 B STATUS",
                  "C-6701 B PRESSURE",
                  "C-6701 B TEMP",
                  "C-6701 B FLOW",
                  "C-6702 A STATUS",
                  "C-6702 A PRESSURE",
                  "C-6702 A TEMP",
                  "C-6702 A FLOW",
                  "C-6702 B STATUS", 
                  "C-6702 B PRESSURE",
                  "C-6702 B TEMP",
                  "C-6702 B FLOW"
      ],
   "OLI GEARBOX SA": ["MT-6511 A",
                      "MT-6511 B", 
                      "MT-6511 C", 
                      "MT-6511 D"],
   "OLI GEARBOX SU": ["MT-6521 A",
                      "MT-6521 B",
                      "MT-6521 C",
                      "MT-6521 D"]
};
// Data Area 1300
const AREAS_1300 = {
  "DRYING AIR": [
    "AIR INLET PI-1007-1 (mmAq)",
    "AIR INLET FILTER PP-1008-1 (mmAq)",
    "AIR OUT FILTER PP-1008-2 (mmAq)",
    "CIRC PUMP LOAD (Amp)",
    "PUMP DISCHARGE PI-1004-1 (Kg/cm2)",
    "PUMP DISCHARGE TI-1302-1 (°C)",
    "ACID OUT PI-1004-9 (Kg/cm2)",
    "CW INLET PI-1005-2 (Kg/cm2)",
    "CW OUTLET PI-1008-7 (Kg/cm2)",
    "CW OUTLET TI-1301-2 (°C)"
  ],

  "1st SO3 ABSORBER": [
    "GAS IN FILTER PP-1008-19 (mmAq)",
    "GAS OUT FILTER PP-1008-20 (mmAq)",
    "CIRC PUMP LOAD 1st (Amp)",             // <-- DIPERBARUI
    "DISCHARGE ACID PI-1004-2 (Kg/cm2)",
    "DISCHARGE ACID TI-1302-2 (°C)",
    "ACID OUT PI-1004-4 (Kg/cm2)",
    "CW INLET PP-1008-11 (Kg/cm2)",
    "CW OUTLET PI-1006-8 (Kg/cm2)",
    "CW OUTLET TI-1301-3 (°C)"
  ],

  "2nd SO3 ABSORBER": [
    "GAS IN FILTER PP-1008-27 (mmAq)",
    "GAS OUT FILTER PP-1008-28 (mmAq)",
    "CIRC PUMP LOAD 2nd (Amp)",             // <-- DIPERBARUI
    "DISCHARGE PI-1004-5 (Kg/cm2)",
    "DISCHARGE TI-1302-3 (°C)",
    "ACID OUT PI-1006-5 (Kg/cm2)",
    "CW INLET PI-1006-9 (Kg/cm2)",
    "CW OUTLET PI-1006-4 (Kg/cm2)",
    "CW OUTLET TI-1304-4 (°C)"
  ],

  "PRODUCT COOLER": [
    "ACID OUT PI-1004-7 (Kg/cm2)",
    "ACID OUTLET TI-1001-9 (°C)",
    "CW INLET PI-1006-10 (Kg/cm2)",
    "CW OUTLET PI-1006-11 (Kg/cm2)",
    "CW OUTLET TI-1301-5 (°C)"
  ],

  "FLOW PRODUCT": [
    "FLOW FI-1304 (Ton/jam)",
    "TOTALIZER FIQ-1304 (Ton)"
  ],

  "CW HEADER": [
    "TEMP INLET TI-1301-6 (°C)",
    "TEMP OUTLET TI-1301-1 (°C)",
    "PH OUTLET AT-1103"
  ],

  "BLOWER MC-C-1302": [
    "LOAD MC-C-1302 (Amp)",                 // <-- DIPERBARUI
    "SUCTION HV-1302-1 (%)",
    "GUIDE VANE HV-1302-2 (%)",
    "POINTER 1302 (%)",                     // <-- DIPERBARUI
    "VENTING HCV-1304 (%)",
    "PT-1304 (%)"
  ],

  "BLOWER MC-C-1301": [
    "LOAD MC-C-1301 (Amp)",                 // <-- DIPERBARUI
    "SUCTION HV-1301-1 (%)",
    "GUIDE VANE HV-1301-2 (%)",
    "POINTER 1301 (%)",                     // <-- DIPERBARUI
    "VENTING HCV-1303 (%)",
    "DISCHARGE HV-1301 (%)",
    "PT-1301 (Kg/cm2)",
    "PT-1303 (Kg/cm2)"
  ],

  "LUBE OIL SYSTEM": [
    "PRESSURE PI-1331 (Kg/cm2)",
    "PRESSURE PI-1332 (Kg/cm2)",
    "PRESSURE PI-133-A (Kg/cm2)",
    "PRESSURE PI-133-B (Kg/cm2)",
    "PRESSURE PI-133-C (Kg/cm2)",
    "TEMP TI-1337 (°C)",
    "TEMP TI-1338 (°C)",
    "FLOW FI-1337 (m3/h)",
    "FLOW FI-1338 (m3/h)",
    "FLOW FI-1341 (m3/h)",
    "FLOW FI-1342 (m3/h)",
    "PRESSURE PIT-1340 (Kg/cm2)",
    "LEVEL TANK (%)"
  ]
};
// Data Parameter Area 1100 & 1200
const AREAS_1100 = {
  "MOLTEN SULPHUR SYSTEM": [
    "FLOW FI-1103 (T/h)",
    "TOTALIZER FQ-1103 (Ton)",
    "VALVE HCV-1101 (%)",
    "INLET PI-1001-5 (Kg/cm2)",
    "PUMP B-1102 A/B/C/D/E (%)",
    "LP STEAM JACKET TI-1001-16 (°C)"
  ],
  "FURNACE AIR SYSTEM": [
    "DRY AIR INLET PI-1007-2 (Kg/cm2)",
    "DAMPER G-2 (%)",
    "PRIMARY AIR PP-1008-4 (Kg/cm2)",
    "DAMPER G-3 (%)",
    "SECONDARY AIR PP-1008-3 (mmH2O)"
  ],
  "FURNACE GAS OUTLET": [
    "GAS OUTLET PI-1107-3 (mmH2O)"
  ],
  "BLOWER 30-C-1101": [
    "SUCTION PI-1006-15 (Kg/cm2)",
    "DISCHARGE PI-1006-13 (Kg/cm2)"
  ],
  "WASTE HEAT BOILER (WHB) 30-B-1104": [
    "HV-1111 (S-3) (%)",
    "JUG DAMPER HV-1110 (%)",
    "GAS INLET PI-1107-4 (mmH2O)",
    "GAS OUTLET PI-1007-4 (mmH2O)",
    "STEAM DRUM PI-1102-4 (Kg/cm2)",
    "SATURATED STEAM TI-1002-3 (°C)",
    "LEVEL GLASS LG-1103-1/2",
    "LCV-1102 (%)"
  ],
  "DRUM & VESSEL": [
    "30-D-1101 PRESSURE PI-1002-5 (Kg/cm2)",
    "30-D-1101 LEVEL LI-1110 (%)",
    "30-D-1102 TEMP TI-1003-6 (°C)"
  ],
  "HEAT EXCHANGER (PREHEATER)": [
    "30-E-1103 PI-1006-22 (Kg/cm2)",
    "30-E-1103 DP CW-1108 (Kg/cm2)"
  ],
  "PUMP 30-P-1103": [
    "DISCHARGE PI-1006-12 (Kg/cm2)"
  ],
  "MPS HEATER 30-E-1102": [
    "HCV-1102 (%)",
    "TCV-1103 (%)",
    "MPS OUTLET TI-1110 (°C)",
    "MPS OUTLET PI-1002 (Kg/cm2)",
    "PCV-1103 (%)",
    "GAS IN PI-1006-5 (mmH2O)",
    "GAS OUT PI-1007-5 (mmH2O)"
  ],
  "LP STEAM HEADER": [
    "PI-1002-3 (Kg/cm2)",
    "TI-1002-4 (°C)"
  ],
  "LPS 7 KG SYSTEM": [
    "PI-1107 (Kg/cm2)",
    "TI-1111 (°C)",
    "PI-1106 (Kg/cm2)",
    "TI-1112 (°C)"
  ],
  "CONVERTER INLET (30-R-1201)": [
    "DAMPER G-5 (%)",
    "GAS IN PP-1008-9 (mmH2O)"
  ],
  "BED I": [
    "GAS IN PI-1007-6B (mmHg)",
    "GAS OUT PI-1007-6A (mmHg)",
    "DELTA P (mmHg)"
  ],
  "BED II": [
    "GAS IN PI-1007-6D (mmHg)",
    "GAS OUT PI-1007-6C (mmHg)",
    "DELTA P (mmHg)"
  ],
  "BED III": [
    "GAS IN PI-1007-6F (mmHg)",
    "GAS OUT PI-1007-6E (mmHg)",
    "DELTA P (mmHg)"
  ],
  "BED IV": [
    "GAS IN PI-1007-6H (mmHg)",
    "GAS OUT PI-1007-6G (mmHg)",
    "DELTA P (mmHg)"
  ],
  "INTERPASS HEAT EXCHANGER": [
    "30-E-1202 IN TUBE PI-1008-14 (mmH2O)",
    "30-E-1202 OUT TUBE PI-1008-16 (mmH2O)",
    "30-E-1201 IN TUBE PI-1008-18 (mmH2O)",
    "30-E-1201 OUT TUBE PI-1008-21 (mmH2O)"
  ],
  "GAS COOLER & ECONOMIZER": [
    "30-E-1203 GAS OUT PI-1007-7 (mmH2O)",
    "DAMPER G-10 (%)",
    "30-E-1204 GAS IN PP-1008-26 (mmH2O)",
    "30-E-1204 GAS OUT PI-1007-11 (mmH2O)",
    "DAMPER G-11 (%)"
  ],
  "SHELL SIDE CONTROL": [
    "30-E-1201 IN SHELL PI-1008-22 (mmH2O)",
    "30-E-1201 OUT SHELL PP-1008-23 (mmH2O)",
    "HCV-1201 (%)",
    "30-E-1202 OUT SHELL PP-1007-9 (mmH2O)",
    "HCV-1202 (%)"
  ],
  "BFW SYSTEM": [
    "BFW IN 30-E-1204 TI-1114 (°C)",
    "BFW IN 30-E-1203 TI-1116 (°C)",
    "BFW OUT 30-E-1203 TI-1115 (°C)",
    "BFW OUT 30-E-1204 TI-1117 (°C)"
  ]
};
const INPUT_TYPES = {
    PUMP_STATUS: {
        patterns: ['(A/B)', '(ON/OFF)', '(On/Off)', '(Running/Stop)', '(Remote/Running/Stop)'],
        options: {
            '(A/B)': ['A', 'B'],
            '(ON/OFF)': ['ON', 'OFF'],
            '(On/Off)': ['On', 'Off'],
            '(Running/Stop)': ['Running', 'Stop'],
            '(Remote/Running/Stop)': ['Remote', 'Running', 'Stop']
        }
    }
};
