
import { SelectedMed } from '../types';

export const MEDICATIONS_DB: SelectedMed[] = [
    // =========================================================================
    //  1. SISTEMA CARDIOVASCULAR (ATC C)
    // =========================================================================

    // --- C07. BETA-BLOQUEADORES ---
    {
        id: 'meto',
        name: 'Metoprolol',
        category: 'B-Bloq',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Si VO no posible, considerar IV.',
        atcCode: 'C07AB02'
    },
    {
        id: 'biso',
        name: 'Bisoprolol',
        category: 'B-Bloq',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C07AB07'
    },
    {
        id: 'ateno',
        name: 'Atenolol',
        category: 'B-Bloq',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. No suspender abruptamente.',
        atcCode: 'C07AB03'
    },
    {
        id: 'carve',
        name: 'Carvedilol',
        category: 'B-Bloq',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C07AG02'
    },
    {
        id: 'nebi',
        name: 'Nebivolol',
        category: 'B-Bloq',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C07AB12'
    },
    {
        id: 'proprano',
        name: 'Propranolol',
        category: 'B-Bloq',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C07AA05'
    },
    {
        id: 'labetalo',
        name: 'Labetalol',
        category: 'B-Bloq',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C07AG01'
    },

    // --- C09. IECA / ARA-II ---
    {
        id: 'losa',
        name: 'Losartán',
        category: 'ARA-II',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes (Riesgo hipotensión refractaria).',
        atcCode: 'C09CA01'
    },
    {
        id: 'telmi',
        name: 'Telmisartán',
        category: 'ARA-II',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09CA07'
    },
    {
        id: 'valsa',
        name: 'Valsartán',
        category: 'ARA-II',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09CA03'
    },
    {
        id: 'cande',
        name: 'Candesartán',
        category: 'ARA-II',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09CA06'
    },
    {
        id: 'irbe',
        name: 'Irbesartán',
        category: 'ARA-II',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09CA04'
    },
    {
        id: 'olme',
        name: 'Olmesartán',
        category: 'ARA-II',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09CA08'
    },
    {
        id: 'ena',
        name: 'Enalapril',
        category: 'IECA',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09AA02'
    },
    {
        id: 'capto',
        name: 'Captopril',
        category: 'IECA',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09AA01'
    },
    {
        id: 'lisino',
        name: 'Lisinopril',
        category: 'IECA',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09AA03'
    },
    {
        id: 'rami',
        name: 'Ramipril',
        category: 'IECA',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09AA05'
    },
    {
        id: 'perindo',
        name: 'Perindopril',
        category: 'IECA',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09AA04'
    },

    // --- C08. CALCIOANTAGONISTAS ---
    {
        id: 'amlo',
        name: 'Amlodipino',
        category: 'Ca-Ant',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C08CA01'
    },
    {
        id: 'nife',
        name: 'Nifedipino',
        category: 'Ca-Ant',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Riesgo taquicardia refleja mínimos en liberación prolongada.',
        atcCode: 'C08CA05'
    },
    {
        id: 'felodipino',
        name: 'Felodipino',
        category: 'Ca-Ant',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C08CA02'
    },
    {
        id: 'vera',
        name: 'Verapamilo',
        category: 'Ca-Ant',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Alerta Anestesia: Potencia depresores miocárdicos.',
        atcCode: 'C08DA01'
    },
    {
        id: 'diltia',
        name: 'Diltiazem',
        category: 'Ca-Ant',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C08DB01'
    },

    // --- C03. DIURÉTICOS ---
    {
        id: 'hctz',
        name: 'Hidroclorotiazida',
        category: 'Diurético',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER día de cirugía (Riesgo hipovolemia/diskaliemia).',
        atcCode: 'C03AA03'
    },
    {
        id: 'clortal',
        name: 'Clortalidona',
        category: 'Diurético',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER día de cirugía.',
        atcCode: 'C03BA04'
    },
    {
        id: 'furo',
        name: 'Furosemida',
        category: 'Diurético',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER día de cirugía (salvo ICC descompensada).',
        atcCode: 'C03CA01'
    },
    {
        id: 'bumeta',
        name: 'Bumetanida',
        category: 'Diurético',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER día de cirugía.',
        atcCode: 'C03CA02'
    },
    {
        id: 'espiro',
        name: 'Espironolactona',
        category: 'Diurético',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER día de cirugía.',
        atcCode: 'C03DA01'
    },
    {
        id: 'eplerenona',
        name: 'Eplerenona',
        category: 'Diurético',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER día de cirugía.',
        atcCode: 'C03DA04'
    },

    // =========================================================================
    //  2. HEMOSTASIA Y TROMBOSIS (ATC B)
    // =========================================================================

    // --- B01AC. ANTIAGREGANTES ---
    {
        id: 'asa',
        name: 'Aspirina (AAS)',
        category: 'Antiagregante',
        action: 'adjust',
        daysPrior: 7, // Default if not sec prev
        alertLevel: 'yellow',
        instructions: 'Prevención 2ria: CONTINUAR. Suspender 7 días SOLO si Neuro/Oftalmo/Raquia.',
        atcCode: 'B01AC06'
    },
    {
        id: 'clopi',
        name: 'Clopidogrel',
        category: 'Antiagregante',
        action: 'stop',
        daysPrior: 5,
        alertLevel: 'red',
        instructions: 'SUSPENDER 5 días antes.',
        atcCode: 'B01AC04'
    },
    {
        id: 'tica',
        name: 'Ticagrelor',
        category: 'Antiagregante',
        action: 'stop',
        daysPrior: 5, // 3-5 days
        alertLevel: 'red',
        instructions: 'SUSPENDER 5 días antes (Vida media más corta, pero estándar seguro).',
        atcCode: 'B01AC24'
    },
    {
        id: 'prasu',
        name: 'Prasugrel',
        category: 'Antiagregante',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'red',
        instructions: 'SUSPENDER 7 días antes (Irreversible, más potente).',
        atcCode: 'B01AC22'
    },
    {
        id: 'cangrelor',
        name: 'Cangrelor',
        category: 'Antiagregante',
        action: 'stop',
        daysPrior: 0,
        alertLevel: 'red',
        instructions: 'SUSPENDER 1-6 HORAS antes (IV Ultrarápido).',
        atcCode: 'B01AC25'
    },
    {
        id: 'cilostazol',
        name: 'Cilostazol',
        category: 'Antiagregante',
        action: 'stop',
        daysPrior: 2,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER 48h antes (Reversible).',
        atcCode: 'B01AC23'
    },
    {
        id: 'dipiri',
        name: 'Dipiridamol',
        category: 'Antiagregante',
        action: 'stop',
        daysPrior: 2,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER 48h antes.',
        atcCode: 'B01AC07'
    },

    // --- ANTICOAGULANTES ORALES (DOACs / AVK) ---
    {
        id: 'warfa',
        name: 'Warfarina',
        category: 'Anticoagulante',
        anticoagType: 'AVK',
        isAnticoagulant: true,
        action: 'stop',
        daysPrior: 5,
        alertLevel: 'red',
        instructions: 'SUSPENDER 5 días antes. INR < 1.5. Evaluar Puenteo.',
        atcCode: 'B01AA03'
    },
    {
        id: 'aceno',
        name: 'Acenocumarol',
        category: 'Anticoagulante',
        anticoagType: 'AVK',
        isAnticoagulant: true,
        action: 'stop',
        daysPrior: 3,
        alertLevel: 'red',
        instructions: 'SUSPENDER 3 días antes. Evaluar Puenteo.',
        atcCode: 'B01AA07'
    },
    {
        id: 'riva',
        name: 'Rivaroxaban',
        category: 'Anticoagulante',
        anticoagType: 'DOAC',
        isAnticoagulant: true,
        action: 'stop',
        daysPrior: 2,
        alertLevel: 'red',
        instructions: 'SUSPENDER 48-72h antes (Según Riesgo Sangrado/Renal).',
        atcCode: 'B01AF01'
    },
    {
        id: 'api',
        name: 'Apixaban',
        category: 'Anticoagulante',
        anticoagType: 'DOAC',
        isAnticoagulant: true,
        action: 'stop',
        daysPrior: 2,
        alertLevel: 'red',
        instructions: 'SUSPENDER 48-72h antes (Según Riesgo Sangrado/Renal).',
        atcCode: 'B01AF02'
    },
    {
        id: 'dabi',
        name: 'Dabigatran',
        category: 'Anticoagulante',
        anticoagType: 'DOAC',
        isAnticoagulant: true,
        action: 'stop',
        daysPrior: 2,
        alertLevel: 'red',
        instructions: 'SUSPENDER 2-4 días antes (Dep. Renal estricta).',
        atcCode: 'B01AE07'
    },
    {
        id: 'edoxa',
        name: 'Edoxaban',
        category: 'Anticoagulante',
        anticoagType: 'DOAC',
        isAnticoagulant: true,
        action: 'stop',
        daysPrior: 2,
        alertLevel: 'red',
        instructions: 'SUSPENDER 48h antes.',
        atcCode: 'B01AF03'
    },

    // =========================================================================
    //  3. ENDOCRINOLOGÍA (ATC A / H)
    // =========================================================================

    // --- A10BK. iSGLT2 (Glifozinas) ---
    {
        id: 'dapa',
        name: 'Dapagliflozina',
        category: 'iSGLT2',
        action: 'stop',
        daysPrior: 3,
        alertLevel: 'red',
        instructions: 'SUSPENDER 3-4 DÍAS ANTES (Riesgo Cetoacidosis Euglucémica).',
        atcCode: 'A10BK01'
    },
    {
        id: 'empa',
        name: 'Empagliflozina',
        category: 'iSGLT2',
        action: 'stop',
        daysPrior: 3,
        alertLevel: 'red',
        instructions: 'SUSPENDER 3-4 DÍAS ANTES.',
        atcCode: 'A10BK03'
    },
    {
        id: 'cana',
        name: 'Canagliflozina',
        category: 'iSGLT2',
        action: 'stop',
        daysPrior: 3,
        alertLevel: 'red',
        instructions: 'SUSPENDER 3-4 DÍAS ANTES.',
        atcCode: 'A10BK02'
    },
    {
        id: 'ertu',
        name: 'Ertugliflozina',
        category: 'iSGLT2',
        action: 'stop',
        daysPrior: 4,
        alertLevel: 'red',
        instructions: 'SUSPENDER 4 DÍAS ANTES.',
        atcCode: 'A10BK04'
    },

    // --- GLP-1 AGONISTAS ---
    {
        id: 'sema',
        name: 'Semaglutida (Ozempic/Wegovy)',
        category: 'GLP-1',
        isGLP1: true,
        glp1Frequency: 'weekly',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'red',
        instructions: 'SUSPENDER 1 SEMANA ANTES (Riesgo Broncoaspiración).',
        atcCode: 'A10BJ06'
    },
    {
        id: 'rybelsus',
        name: 'Semaglutida Oral (Rybelsus)',
        category: 'GLP-1',
        isGLP1: true,
        glp1Frequency: 'daily',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER EL DÍA DE LA CIRUGÍA.',
        atcCode: 'A10BJ06'
    },
    {
        id: 'lira',
        name: 'Liraglutida',
        category: 'GLP-1',
        isGLP1: true,
        glp1Frequency: 'daily',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER EL DÍA DE LA CIRUGÍA o 24h antes.',
        atcCode: 'A10BJ02'
    },
    {
        id: 'dula',
        name: 'Dulaglutida',
        category: 'GLP-1',
        isGLP1: true,
        glp1Frequency: 'weekly',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'red',
        instructions: 'SUSPENDER 1 SEMANA ANTES.',
        atcCode: 'A10BJ05'
    },
    {
        id: 'tirze',
        name: 'Tirzepatida (Mounjaro)',
        category: 'GLP-1', // Dual GIP/GLP-1
        isGLP1: true,
        glp1Frequency: 'weekly',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'red',
        instructions: 'SUSPENDER 1 SEMANA ANTES.',
        atcCode: 'A10BX16'
    },

    // --- INSULINAS ---
    {
        id: 'ins_glar',
        name: 'Insulina Glargina',
        category: 'Insulina',
        action: 'adjust',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'Reducir 20% dosis noche previa.',
        atcCode: 'A10AE04'
    },
    {
        id: 'ins_det',
        name: 'Insulina Detemir',
        category: 'Insulina',
        action: 'adjust',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'Reducir 20% dosis noche previa.',
        atcCode: 'A10AE05'
    },
    {
        id: 'ins_deg',
        name: 'Insulina Degludec',
        category: 'Insulina',
        action: 'adjust',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'Reducir 20% dosis. Vida media larga.',
        atcCode: 'A10AE06'
    },
    {
        id: 'ins_nph',
        name: 'Insulina NPH',
        category: 'Insulina',
        action: 'adjust',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'Noche: -20%. Mañana: -50%.',
        atcCode: 'A10AC01'
    },
    {
        id: 'ins_rap',
        name: 'Insulina Rápida/Lispro/Aspart',
        category: 'Insulina',
        action: 'stop',
        daysPrior: 0,
        alertLevel: 'red',
        instructions: 'NO ADMINISTRAR en ayuno. Solo esquema corrección.',
        atcCode: 'A10AB01'
    },
    {
        id: 'ins_mix',
        name: 'Insulinas Premezcladas',
        category: 'Insulina',
        action: 'stop',
        daysPrior: 0,
        alertLevel: 'red',
        instructions: 'OMITIR mañana de cirugía.',
        atcCode: 'A10AD01'
    },

    // --- ADOs TRADICIONALES ---
    {
        id: 'metf',
        name: 'Metformina',
        category: 'Antidiabético',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes (Riesgo Acidosis Láctica).',
        atcCode: 'A10BA02'
    },
    {
        id: 'glib',
        name: 'Glibenclamida',
        category: 'Sulfonilurea',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'A10BB01'
    },
    {
        id: 'glim',
        name: 'Glimepirida',
        category: 'Sulfonilurea',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'A10BB12'
    },
    {
        id: 'pio',
        name: 'Pioglitazona',
        category: 'Tiazolidinediona',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER día de cirugía.',
        atcCode: 'A10BG03'
    },
    {
        id: 'dpp4',
        name: 'Inhibidores DPP-4 (Sitagliptina/Vilda)',
        category: 'DPP-4',
        action: 'stop',
        daysPrior: 0,
        alertLevel: 'yellow',
        instructions: 'Omitir dosis de la mañana.',
        atcCode: 'A10BH01'
    },

    // --- CORTICOSTEROIDES ---
    {
        id: 'pred',
        name: 'Prednisona',
        category: 'Corticoides',
        isSteroid: true,
        action: 'adjust', // Engine will check chronic use
        daysPrior: 0,
        alertLevel: 'yellow',
        instructions: 'Valorar dosis estrés si uso crónico.',
        atcCode: 'H02AB07'
    },
    {
        id: 'hidro',
        name: 'Hidrocortisona',
        category: 'Corticoides',
        isSteroid: true,
        action: 'adjust',
        daysPrior: 0,
        alertLevel: 'yellow',
        instructions: 'Valorar dosis estrés.',
        atcCode: 'H02AB09'
    },
    {
        id: 'dexa',
        name: 'Dexametasona',
        category: 'Corticoides',
        isSteroid: true,
        action: 'adjust',
        daysPrior: 0,
        alertLevel: 'yellow',
        instructions: 'Valorar dosis estrés.',
        atcCode: 'H02AB02'
    },
    {
        id: 'metil',
        name: 'Metilprednisolona',
        category: 'Corticoides',
        isSteroid: true,
        action: 'adjust',
        daysPrior: 0,
        alertLevel: 'yellow',
        instructions: 'Valorar dosis estrés.',
        atcCode: 'H02AB04'
    },

    // =========================================================================
    //  4. SISTEMA NERVIOSO (ATC N)
    // =========================================================================

    // --- ANTIDEPRESIVOS ---
    {
        id: 'sertra',
        name: 'Sertralina',
        category: 'ISRS',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR (Evitar síndrome discontinuación).',
        atcCode: 'N06AB06'
    },
    {
        id: 'fluox',
        name: 'Fluoxetina',
        category: 'ISRS',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N06AB03'
    },
    {
        id: 'esci',
        name: 'Escitalopram',
        category: 'ISRS',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N06AB10'
    },
    {
        id: 'paro',
        name: 'Paroxetina',
        category: 'ISRS',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Vida media corta, síndrome de retirada severo.',
        atcCode: 'N06AB05'
    },
    {
        id: 'venla',
        name: 'Venlafaxina',
        category: 'IRSN',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N06AX16'
    },
    {
        id: 'dulox',
        name: 'Duloxetina',
        category: 'IRSN',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N06AX21'
    },
    {
        id: 'ami',
        name: 'Amitriptilina',
        category: 'Tricíclico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'yellow',
        instructions: 'CONTINUAR. Interacción: Cuidado con adrenalina/vasopresores.',
        atcCode: 'N06AA09'
    },
    {
        id: 'imi',
        name: 'Imipramina',
        category: 'Tricíclico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'yellow',
        instructions: 'CONTINUAR.',
        atcCode: 'N06AA02'
    },

    // --- IMAO (Peligro) ---
    {
        id: 'fenel',
        name: 'Fenelzina (IMAO)',
        category: 'IMAO',
        action: 'stop',
        daysPrior: 14,
        alertLevel: 'red',
        instructions: 'SUSPENDER 2 SEMANAS antes. Interacción letal con Petidina/Efedrina.',
        atcCode: 'N06AF03'
    },
    {
        id: 'tranil',
        name: 'Tranilcipromina (IMAO)',
        category: 'IMAO',
        action: 'stop',
        daysPrior: 14,
        alertLevel: 'red',
        instructions: 'SUSPENDER 2 SEMANAS antes.',
        atcCode: 'N06AF04'
    },
    {
        id: 'moclo',
        name: 'Moclobemida',
        category: 'IMAO-A',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'Suspender 24h antes (Reversible).',
        atcCode: 'N06AG02'
    },

    // --- LITIO ---
    {
        id: 'litio',
        name: 'Carbonato de Litio',
        category: 'Antimaníaco',
        action: 'stop',
        daysPrior: 2, // 24-72h
        alertLevel: 'red',
        instructions: 'SUSPENDER 24-72h antes (Según función renal). Riesgo toxicidad/interacción BNM.',
        atcCode: 'N05AN01'
    },

    // --- ANTIEPILÉPTICOS ---
    {
        id: 'valpro',
        name: 'Valproato de Magnesio/Sódico',
        category: 'Antiepiléptico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Riesgo leve sangrado, pero convulsión intraop es peor.',
        atcCode: 'N03AG01'
    },
    {
        id: 'carba',
        name: 'Carbamazepina',
        category: 'Antiepiléptico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N03AF01'
    },
    {
        id: 'leve',
        name: 'Levetiracetam',
        category: 'Antiepiléptico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N03AX14'
    },
    {
        id: 'fenito',
        name: 'Fenitoína',
        category: 'Antiepiléptico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N03AB02'
    },
    {
        id: 'lamo',
        name: 'Lamotrigina',
        category: 'Antiepiléptico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N03AX09'
    },
    {
        id: 'gaba',
        name: 'Gabapentina',
        category: 'Antiepiléptico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. No suspender abruptamente.',
        atcCode: 'N03AX12'
    },
    {
        id: 'prega',
        name: 'Pregabalina',
        category: 'Antiepiléptico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N03AX16'
    },

    // --- ANTIPARKINSONIANOS ---
    {
        id: 'levo_carbi',
        name: 'Levodopa / Carbidopa',
        category: 'Antiparkinson',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR ESTRICTAMENTE. Riesgo rigidez severa.',
        atcCode: 'N04BA02'
    },

    // =========================================================================
    //  5. REUMATOLOGÍA Y BIOLÓGICOS (ATC L)
    // =========================================================================

    // --- FAMEs SINTÉTICOS ---
    {
        id: 'mtx',
        name: 'Metotrexato',
        category: 'FAME',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. No aumenta riesgo ISO.',
        atcCode: 'L01BA01'
    },
    {
        id: 'leflu',
        name: 'Leflunomida',
        category: 'FAME',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'L04AA13'
    },
    {
        id: 'sulfa',
        name: 'Sulfasalazina',
        category: 'FAME',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A07EC01'
    },
    {
        id: 'hidrox',
        name: 'Hidroxicloroquina',
        category: 'FAME',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'P01BA02'
    },
    {
        id: 'aza',
        name: 'Azatioprina',
        category: 'Inmunosupresor',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR (Excepto trasplante renal activo riesgo alto).',
        atcCode: 'L04AX01'
    },
    {
        id: 'mico',
        name: 'Micofenolato Mofetilo',
        category: 'Inmunosupresor',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR (En LES severo).',
        atcCode: 'L04AA06'
    },

    // --- BIOLÓGICOS (ANTI-TNF, ETC) ---
    // Regla: 1 ciclo de dosis
    {
        id: 'ada',
        name: 'Adalimumab',
        category: 'Biológico',
        action: 'stop',
        daysPrior: 14, // Aprox
        alertLevel: 'red',
        instructions: 'Programar cirugía al final del ciclo (Semana 3). Suspender.',
        atcCode: 'L04AB04'
    },
    {
        id: 'etaner',
        name: 'Etanercept',
        category: 'Biológico',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'red',
        instructions: 'Suspender 1 semana antes (Vida media más corta).',
        atcCode: 'L04AB01'
    },
    {
        id: 'infli',
        name: 'Infliximab',
        category: 'Biológico',
        action: 'stop',
        daysPrior: 28, // Mensual/Bimensual
        alertLevel: 'red',
        instructions: 'Operar al final del intervalo de dosis.',
        atcCode: 'L04AB02'
    },
    {
        id: 'toci',
        name: 'Tocilizumab',
        category: 'Biológico',
        action: 'stop',
        daysPrior: 14,
        alertLevel: 'red',
        instructions: 'Suspender 1 ciclo.',
        atcCode: 'L04AC07'
    },

    // --- JAK INHIBITORS ---
    {
        id: 'tofa',
        name: 'Tofacitinib',
        category: 'JAK-i',
        action: 'stop',
        daysPrior: 3,
        alertLevel: 'red',
        instructions: 'SUSPENDER 3 días antes.',
        atcCode: 'L04AA29'
    },
    {
        id: 'bari',
        name: 'Baricitinib',
        category: 'JAK-i',
        action: 'stop',
        daysPrior: 3,
        alertLevel: 'red',
        instructions: 'SUSPENDER 3 días antes.',
        atcCode: 'L04AA37'
    },

    // =========================================================================
    //  6. FITOTERAPIA Y SUPLEMENTOS
    // =========================================================================
    {
        id: 'ajo',
        name: 'Ajo (Suplemento)',
        category: 'Herbal',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'red',
        instructions: 'SUSPENDER 7 días antes. Riesgo sangrado (Inhibición plaquetaria).',
        keywords: ['garlic']
    },
    {
        id: 'ginkgo',
        name: 'Ginkgo Biloba',
        category: 'Herbal',
        action: 'stop',
        daysPrior: 2, // 36h
        alertLevel: 'red',
        instructions: 'SUSPENDER 36h-7 días antes. Riesgo sangrado.',
    },
    {
        id: 'ginseng',
        name: 'Ginseng',
        category: 'Herbal',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'red',
        instructions: 'SUSPENDER 7 días antes. Hipoglucemia/Sangrado.',
    },
    {
        id: 'sanjuan',
        name: 'Hierba de San Juan',
        category: 'Herbal',
        action: 'stop',
        daysPrior: 14,
        alertLevel: 'red',
        instructions: 'SUSPENDER 2 SEMANAS antes. Inductor CYP450 potente, riesgo colapso CV.',
    },
    {
        id: 'valeriana',
        name: 'Valeriana',
        category: 'Herbal',
        action: 'stop',
        daysPrior: 7, // Taper
        alertLevel: 'yellow',
        instructions: 'Reducir gradualmente. No suspender abruptamente día previo (Abstinencia GABA).',
    },
    {
        id: 'vite',
        name: 'Vitamina E (Dosis altas)',
        category: 'Suplemento',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'yellow',
        instructions: 'Suspender 7-14 días antes. Efecto antiplaquetario.',
    },

    // =========================================================================
    //  7. OTROS (Antibióticos, Analgésicos básicos)
    // =========================================================================
    {
        id: 'parac',
        name: 'Paracetamol',
        category: 'Analgésico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N02BE01'
    },
    {
        id: 'ketor',
        name: 'Ketorolaco',
        category: 'AINE',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'M01AB15'
    },
    {
        id: 'amoxi',
        name: 'Amoxicilina',
        category: 'Antibiótico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR tratamiento.',
        atcCode: 'J01CA04'
    }
];
