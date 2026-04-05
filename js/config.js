/* ============================================
   TURBINE LOGSHEET PRO - CONFIGURATION
   ============================================ */

// ============================================
// 1. APP CONFIGURATION
// ============================================
const APP_VERSION = '2.6.2';
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
const GAS_URL = "https://script.google.com/macros/s/AKfycbxIFfq1AxlHHejtXiAPF09nIv-jp0JQD0WS89ffC4mn_uQO0_9efqOwNFphAKJXtouL/exec";

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
        "D-6511 LEVEL BASIN (Meter)",
        "D-6511 BLOWDOWN (%)",
        "D-6511 PH BASIN", 
        "D-6511 TRASSAR (A/M)", 
        "TK-6511 LEVEL ACID (%)", 
        "FIL-6511 (A/B)", 
        "30-P-6511 A PRESS (kg/cm2)", 
        "30-P-6511 B PRESS (kg/cm2)", 
        "30-P-6511 C PRESS (kg/cm2)", 
        "MT-6511 A (RUN/STOP)", 
        "MT-6511 B (RUN/STOP)", 
        "MT-6511 C (RUN/STOP)", 
        "MT-6511 D (RUN/STOP)"
    ], 
    "BASIN SU": [
        "D-6521 LEVEL BASIN (Meter)",
        "D-6521 BLOWDOWN (%)",
        "D-6521 PH BASIN", 
        "D-6521 TRASSAR (A/M)", 
        "TK-6521 LEVEL ACID (%)", 
        "FIL-6521 (A/B)", 
        "30-P-6521 A PRESS (kg/cm2)", 
        "30-P-6521 B PRESS (kg/cm2)", 
        "30-P-6521 C PRESS (kg/cm2)", 
        "MT-6521 A (RUN/STOP)", 
        "MT-6521 B (RUN/STOP)", 
        "MT-6521 C (RUN/STOP)", 
        "MT-6521 D (RUN/STOP)"
    ],
   "COMPRESSOR": [
                  "C-6701 A (RUN/STOP)",
                  "C-6701 A PRESSURE (kg/cm2)",
                  "C-6701 A TEMP (°C)",
                  "C-6701 A FLOW (m3/h)",
                  "C-6701 B (RUN/STOP)",
                  "C-6701 B PRESSURE (kg/cm2)",
                  "C-6701 B TEMP (°C)",
                  "C-6701 B FLOW (m3/h)",
                  "C-6702 A (RUN/STOP)",
                  "C-6702 A PRESSURE (kg/cm2)",
                  "C-6702 A TEMP(°C)",
                  "C-6702 A FLOW (m3/h)",
                  "C-6702 B (RUN/STOP)", 
                  "C-6702 B PRESSURE (kg/cm2)",
                  "C-6702 B TEMP (°C)",
                  "C-6702 B FLOW (m3/h)"
      ],
   "OLI GEARBOX SA": ["MT-6511 A (Cm)",
                      "MT-6511 B (Cm)", 
                      "MT-6511 C (Cm)", 
                      "MT-6511 D (Cm)"],
   "OLI GEARBOX SU": ["MT-6521 A (Cm)",
                      "MT-6521 B (Cm)",
                      "MT-6521 C (Cm)",
                      "MT-6521 D (Cm)"]
};
// Data Area 1300
const AREAS_1300 = {
  "DRYING AIR": [
    "30-T-1301 AIR INLET PI-1007-1 (mmAq)",
    "30-T-1301 AIR INLET FILTER PP-1008-1 (mmAq)",
    "30-T-1301 AIR OUT FILTER PP-1008-2 (mmAq)",
    "30-T-1301 CIRC PUMP LOAD (Ampere)",
    "30-T-1301 PUMP DISCHARGE PI-1004-1 (Kg/cm2)",
    "30-T-1301 PUMP DISCHARGE TI-1302-1 (°C)",
    "30-T-1301 ACID OUT PI-1004-9 (Kg/cm2)",
    "30-T-1301 CW INLET PI-1005-2 (Kg/cm2)",
    "30-T-1301 CW OUTLET PI-1008-7 (Kg/cm2)",
    "30-T-1301 CW OUTLET TI-1301-2 (°C)"
  ],

  "1st SO3 ABSORBER": [
    "30-T-1302 GAS IN FILTER PP-1008-19 (mmAq)",
    "30-T-1302 GAS OUT FILTER PP-1008-20 (mmAq)",
    "30-T-1302 CIRC PUMP LOAD (Ampere)",             
    "30-T-1302 DISCHARGE ACID PI-1004-2 (Kg/cm2)",
    "30-T-1302 DISCHARGE ACID TI-1302-2 (°C)",
    "30-T-1302 ACID OUT PI-1004-4 (Kg/cm2)",
    "30-T-1302 CW INLET PP-1008-11 (Kg/cm2)",
    "30-T-1302 CW OUTLET PI-1006-8 (Kg/cm2)",
    "30-T-1302 CW OUTLET TI-1301-3 (°C)"
  ],

  "2nd SO3 ABSORBER": [
    "30-T-1303 GAS IN FILTER PP-1008-27 (mmAq)",
    "30-T-1303 GAS OUT FILTER PP-1008-28 (mmAq)",
    "30-T-1303 CIRC PUMP LOAD (Ampere)",           
    "30-T-1303 DISCHARGE PI-1004-5 (Kg/cm2)",
    "30-T-1303 DISCHARGE TI-1302-3 (°C)",
    "30-T-1303 ACID OUT PI-1006-5 (Kg/cm2)",
    "30-T-1303 CW INLET PI-1006-9 (Kg/cm2)",
    "30-T-1303 CW OUTLET PI-1006-4 (Kg/cm2)",
    "30-T-1303 CW OUTLET TI-1304-4 (°C)"
  ],

  "PRODUCT COOLER": [
    "30-E-1304 ACID OUT PI-1004-7 (Kg/cm2)",
    "30-E-1304 ACID OUTLET TI-1001-9 (°C)",
    "30-E-1304 CW INLET PI-1006-10 (Kg/cm2)",
    "30-E-1304 CW OUTLET PI-1006-11 (Kg/cm2)",
    "30-E-1304 CW OUTLET TI-1301-5 (°C)"
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
    "MC-C-1302 LOAD (Ampere)",                 // <-- DIPERBARUI
    "30-C-1302 SUCTION HV-1302-1 (%)",
    "30-C-1302 GUIDE VANE HV-1302-2 (%)",
    "30-C-1302 POINTER 1302 (%)",                     // <-- DIPERBARUI
    "30-C-1302 VENTING HCV-1304 (%)",
    "30-C-1302 PT-1304 (%)"
  ],

  "BLOWER MC-C-1301": [
    "MC-C-1301 LOAD (Ampere)",                 // <-- DIPERBARUI
    "30-C-1301 SUCTION HV-1301-1 (%)",
    "30-C-1301 GUIDE VANE HV-1301-2 (%)",
    "30-C-1301 POINTER 1301 (%)",                     // <-- DIPERBARUI
    "30-C-1301 VENTING HCV-1303 (%)",
    "30-C-1301 DISCHARGE HV-1301 (%)",
    "30-C-1301 PT-1301 (Kg/cm2)",
    "30-C-1301 PT-1303 (Kg/cm2)"
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
    "30-C-1101 SUCTION PI-1006-15 (Kg/cm2)",
    "30-C-1101 DISCHARGE PI-1006-13 (Kg/cm2)"
  ],
  "WASTE HEAT BOILER (WHB)": [
    "30-B-1104 HV-1111 S-3 (%)",
    "30-B-1104 JUG DAMPER HV-1110 (%)",
    "30-B-1104 GAS INLET PI-1107-4 (mmH2O)",
    "30-B-1104 GAS OUTLET PI-1007-4 (mmH2O)",
    "30-B-1104 STEAM DRUM PI-1102-4 (Kg/cm2)",
    "30-B-1104 SATURATED STEAM TI-1002-3 (°C)",
    "30-B-1104 LEVEL GLASS LG-1103-1/2 (%)",
    "30-B-1104 LCV-1102 (%)"
  ],
  "DRUM & VESSEL": [
    "30-D-1101 PRESSURE PI-1002-5 (Kg/cm2)",
    "30-D-1101 LEVEL LI-1110 (%)",
    "30-D-1102 TEMP TI-1003-6 (°C)"
  ],
  "HEAT EXCHANGER (PREHEATER)": [
    "30-E-1103 PI-1006-22 (Kg/cm2)",
    "30-E-1103 DP CW-1108 (Kg/cm2)",
    "30-P-1103 DISCHARGE PI-1006-12 (Kg/cm2)"
  ],
    "MPS HEATER 30-E-1102": [
    "30-E-1102 HCV-1102 (%)",
    "30-E-1102 TCV-1103 (%)",
    "30-E-1102 MPS OUTLET TI-1110 (°C)",
    "30-E-1102 MPS OUTLET PI-1002 (Kg/cm2)",
    "30-E-1102 PCV-1103 (%)",
    "30-E-1102 GAS IN PI-1006-5 (mmH2O)",
    "30-E-1102 GAS OUT PI-1007-5 (mmH2O)"
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
    "30-R-1201 DAMPER G-5 (%)",
    "30-R-1201 GAS IN PP-1008-9 (mmH2O)"
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

const AREAS_1000 = {

  "AGITATOR (M-1001 / M-1002 / M-1005 / M-1004)": [
    "30-M-1001 A/C (RUN/STOP)",
    "30-M-1001 B/D (RUN/STOP)",
    "30-M-1002 A/C (RUN/STOP)",
    "30-M-1002 B/D (RUN/STOP)",
    "30-M-1005 A/C (RUN/STOP)",
    "30-M-1005 B/D (RUN/STOP)",
    "30-M-1004 A/B (RUN/STOP)"
  ],

  "TANK & VESSEL TEMPERATURE": [
    "30-D-1002 A/C TI-1003-1 (°C)",
    "30-D-1002 B/D TI-1003-2 (°C)",
    "30-D-1005 A/C TI-1003-3 (°C)",
    "30-D-1005 B/D TI-1003-4 (°C)",
    "30-D-1006 A/B TI-1003-7 (°C)",
    "30-D-1004 A/B TI-1003-5 (°C)",
    "30-D-1007 TI-1003-8 (°C)"
  ],

  "TANK & VESSEL LEVEL": [
    "30-D-1003 A/C LI-1005-1 (cm)",
    "30-D-1003 B/D LI-1005-2 (cm)",
    "30-D-1005 A/C LI-1005-4 (cm)",
    "30-D-1005 B/D LI-1005-5 (cm)",
    "30-D-1006 A/B LI-1005-6 (cm)",
    "30-D-1004 A/B LI-1005-3 (cm)"
  ],

  "PUMP 30-P-1002": [
    "30-P-1002 A/C (RUN/STOP)",
    "30-P-1002 A/C PI-1001-7 (Kg/cm2)",
    "30-P-1002 B/D (RUN/STOP)",
    "30-P-1002 B/D PI-1001-8 (Kg/cm2)"
  ],

  "FILTER 30-FIL-1001": [
    "30-FIL-1001 A STATUS (FILTRASI/STANDBY)",
    "30-FIL-1001 A INLET PI-1001-A (Kg/cm2)",
    "30-FIL-1001 A OUTLET PI-1002-A (Kg/cm2)",
    "30-FIL-1001 B STATUS (FILTRASI/STANDBY)",
    "30-FIL-1001 B INLET PI-1001-B (Kg/cm2)",
    "30-FIL-1001 B OUTLET PI-1002-B (Kg/cm2)"
  ],

  "STORAGE TANK 30-TK-1001": [
    "30-TK-1001 TI-1001-1 (°C)",
    "30-TK-1001 TI-1001-2 (°C)",
    "30-TK-1001 LI-1004 (mm)"
  ],

  "CONTROL VALVE SYSTEM": [
    "30-D-1006 A/B LCV-1003 (%)"
  ],

  "PUMP 30-P-1004": [
    "30-P-1004 A/C (Ampere)",
    "30-P-1004 A/C PI-1001-1 (Kg/cm2)",
    "30-P-1004 B/D (Ampere)",
    "30-P-1004 B/D PI-1001-2 (Kg/cm2)"
  ],

  "PUMP 30-P-1001": [
    "30-P-1001 A/B PI-1001-6 (Kg/cm2)",
    "30-P-1001 A/B (Ampere)"
  ],

  "PUMP 30-P-1005": [
    "30-P-1005 A/B (RUN/STOP)",
    "30-P-1005 A PI-1003-6 (Kg/cm2)",
    "30-P-1005 B PI-1003-67 (Kg/cm2)"
  ]

};
// ============================================
// MASTER CONFIGURATION UNTUK DYNAMIC TEMPLATE
// ============================================
const LOGSHEET_CONFIG = {
    'TURBINE': {
        title: 'Logsheet Turbin',
        subtitle: 'Input data operasional turbine',
        areas: AREAS, // Mengambil dari variabel AREAS yang sudah ada
        draftKey: DRAFT_KEYS.LOGSHEET,
        offlineKey: DRAFT_KEYS.LOGSHEET_OFFLINE,
        photoKey: PHOTO_DRAFT_KEYS.TURBINE,
        submitType: 'LOGSHEET',
        themeColor: '#3b82f6' // Warna biru
    },
    'CT': {
        title: 'Logsheet Cooling Tower',
        subtitle: 'Input data operasional basin & pompa',
        areas: AREAS_CT,
        draftKey: DRAFT_KEYS_CT.LOGSHEET,
        offlineKey: DRAFT_KEYS_CT.OFFLINE,
        photoKey: PHOTO_DRAFT_KEYS.CT,
        submitType: 'LOGSHEET_CT',
        themeColor: '#06b6d4' // Warna cyan
    },
    '1300': {
        title: 'Logsheet Area 1300',
        subtitle: 'Drying Air, Absorber & Lube Oil',
        areas: AREAS_1300,
        draftKey: DRAFT_KEYS_1300.LOGSHEET,
        offlineKey: DRAFT_KEYS_1300.OFFLINE,
        photoKey: PHOTO_DRAFT_KEYS.AREA1300,
        submitType: 'LOGSHEET_1300',
        themeColor: '#8b5cf6' // Warna ungu
    },
    '1100': {
        title: 'Logsheet Area 1100/1200',
        subtitle: 'Sulphur, Furnace, WHB',
        areas: AREAS_1100,
        draftKey: DRAFT_KEYS_1100.LOGSHEET,
        offlineKey: DRAFT_KEYS_1100.OFFLINE,
        photoKey: PHOTO_DRAFT_KEYS.AREA1100,
        submitType: 'LOGSHEET_1100',
        themeColor: '#eab308' // Warna kuning
    },
    '1000': {
        title: 'Logsheet Area 1000',
        subtitle: 'Pencairan Belerang & Filtrasi',
        areas: AREAS_1000,
        draftKey: 'draft_1000',
        offlineKey: 'offline_1000',
        photoKey: 'draft_1000_photos',
        submitType: 'LOGSHEET_1000', // Pastikan membuat sheet LOGSHEET_1000 di Google Sheets
        themeColor: '#ef4444' // Warna merah api
    }
};
const INPUT_TYPES = {
    PUMP_STATUS: {
        patterns: [
            '(A/B)', '(ON/OFF)', '(On/Off)', '(Running/Stop)', '(Remote/Running/Stop)', 
            '(A/M)', 'STATUS', 'RUN/STANDBY', 'RUN/STOP', 'FILTRASI/STANDBY'
        ],
        options: {
            '(A/B)': ['A', 'B'],
            '(ON/OFF)': ['ON', 'OFF'],
            '(On/Off)': ['On', 'Off'],
            '(Running/Stop)': ['Running', 'Stop'],
            '(Remote/Running/Stop)': ['Remote', 'Running', 'Stop'],
            '(A/M)': ['Auto', 'Manual'],
            'STATUS': ['Running', 'Stop', 'Standby'],
            'RUN/STANDBY': ['RUN', 'STANDBY'],
            'RUN/STOP': ['RUN', 'STOP'],
            'FILTRASI/STANDBY': ['FILTRASI', 'STANDBY']
        }
    }
};
