
export const MEDICATIONS_DB = [
    // --- 1. CARDIOVASCULAR (ANTIHIPERTENSIVOS & OTHERS) ---

    // A. ARA-II (Antagonistas de los Receptores de Angiotensina II)
    {
        id: 'losa',
        name: 'Losartán',
        category: 'ARA-II',
        keywords: ['ara2', 'antihipertensivo', 'presion', 'cozaar'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 24h antes (Riesgo hipotensión refractaria).'
    },
    {
        id: 'telmi',
        name: 'Telmisartán',
        category: 'ARA-II',
        keywords: ['ara2', 'antihipertensivo', 'micardis'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 24h antes.'
    },
    {
        id: 'valsa',
        name: 'Valsartán',
        category: 'ARA-II',
        keywords: ['ara2', 'antihipertensivo', 'diovan'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 24h antes.'
    },
    {
        id: 'cande',
        name: 'Candesartán',
        category: 'ARA-II',
        keywords: ['ara2', 'antihipertensivo', 'atacand'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 24h antes.'
    },
    {
        id: 'irbe',
        name: 'Irbesartán',
        category: 'ARA-II',
        keywords: ['ara2', 'antihipertensivo', 'aprovel'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 24h antes.'
    },
    {
        id: 'olme',
        name: 'Olmesartán',
        category: 'ARA-II',
        keywords: ['ara2', 'antihipertensivo', 'benicar'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 24h antes.'
    },

    // B. IECA (Inhibidores de la Enzima Convertidora de Angiotensina)
    {
        id: 'ena',
        name: 'Enalapril',
        category: 'IECA',
        keywords: ['ieca', 'antihipertensivo', 'presion', 'renitec'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 24h antes.'
    },
    {
        id: 'capto',
        name: 'Captopril',
        category: 'IECA',
        keywords: ['ieca', 'antihipertensivo', 'capoten'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 24h antes.'
    },
    {
        id: 'lisino',
        name: 'Lisinopril',
        category: 'IECA',
        keywords: ['ieca', 'antihipertensivo', 'prinivil'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 24h antes.'
    },
    {
        id: 'rami',
        name: 'Ramipril',
        category: 'IECA',
        keywords: ['ieca', 'antihipertensivo', 'tritace'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 24h antes.'
    },

    // C. BETA-BLOQUEADORES
    {
        id: 'meto',
        name: 'Metoprolol',
        category: 'B-Bloq',
        keywords: ['beta', 'betabloqueador', 'antihipertensivo', 'lopresor', 'seloken'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR. Si VO no posible, considerar IV para control FC.'
    },
    {
        id: 'biso',
        name: 'Bisoprolol',
        category: 'B-Bloq',
        keywords: ['beta', 'betabloqueador', 'concor'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'ateno',
        name: 'Atenolol',
        category: 'B-Bloq',
        keywords: ['beta', 'betabloqueador'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR. No suspender abruptamente.'
    },
    {
        id: 'carve',
        name: 'Carvedilol',
        category: 'B-Bloq',
        keywords: ['beta', 'betabloqueador', 'dilatrend'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'nebi',
        name: 'Nebivolol',
        category: 'B-Bloq',
        keywords: ['beta', 'betabloqueador', 'nebilet'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },

    // D. CALCIOANTAGONISTAS
    {
        id: 'amlo',
        name: 'Amlodipino',
        category: 'Ca-Ant',
        keywords: ['calcio', 'antagonista', 'norvasc', 'antihipertensivo'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'nife',
        name: 'Nifedipino',
        category: 'Ca-Ant',
        keywords: ['calcio', 'adalat', 'antihipertensivo'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR. Riesgo taquicardia refleja.'
    },
    {
        id: 'vera',
        name: 'Verapamilo',
        category: 'Ca-Ant',
        keywords: ['calcio', 'antiarritmico'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'diltia',
        name: 'Diltiazem',
        category: 'Ca-Ant',
        keywords: ['calcio', 'antiarritmico'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },

    // E. DIURÉTICOS
    {
        id: 'hctz',
        name: 'Hidroclorotiazida',
        category: 'Diurético',
        keywords: ['tiazida', 'diuretico', 'antihipertensivo'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender día de cirugía (Riesgo hipovolemia/diskaliemia).'
    },
    {
        id: 'clortal',
        name: 'Clortalidona',
        category: 'Diurético',
        keywords: ['tiazida', 'diuretico', 'higroton'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender día de cirugía.'
    },
    {
        id: 'furo',
        name: 'Furosemida',
        category: 'Diurético',
        keywords: ['lasix', 'diuretico', 'asa'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender día de cirugía salvo indicación ICC severa/balance positivo.'
    },
    {
        id: 'espiro',
        name: 'Espironolactona',
        category: 'Diurético',
        keywords: ['ahorrador', 'diuretico', 'aldactone'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'yellow',
        instructions: 'Suspender día de cirugía.'
    },

    // --- 2. ANTICOAGULANTES & ANTITROMBÓTICOS ---

    // A. AVK (Antagonistas de Vitamina K)
    {
        id: 'warfa',
        name: 'Warfarina',
        category: 'Anticoagulante',
        keywords: ['avk', 'sangre', 'coumadin'],
        isAnticoagulant: true,
        anticoagType: 'AVK',
        daysPrior: 5,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 5 días antes. Requiere INR previo. Evaluar puenteo.'
    },
    {
        id: 'aceno',
        name: 'Acenocumarol',
        category: 'Anticoagulante',
        keywords: ['avk', 'sintrom'],
        isAnticoagulant: true,
        anticoagType: 'AVK',
        daysPrior: 3,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 3 días antes. Requiere INR previo.'
    },

    // B. DOACs (Anticoagulantes Orales Directos)
    {
        id: 'riva',
        name: 'Rivaroxaban',
        category: 'Anticoagulante',
        keywords: ['doac', 'xarelto', 'factor', 'xa'],
        isAnticoagulant: true,
        anticoagType: 'DOAC',
        daysPrior: 2,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 48h antes (Bajo riesgo sangrado) a 72h (Alto riesgo/Falla renal).'
    },
    {
        id: 'api',
        name: 'Apixaban',
        category: 'Anticoagulante',
        keywords: ['doac', 'eliquis'],
        isAnticoagulant: true,
        anticoagType: 'DOAC',
        daysPrior: 2,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 48h antes (Bajo riesgo) a 72h+ (Alto riesgo).'
    },
    {
        id: 'dabi',
        name: 'Dabigatran',
        category: 'Anticoagulante',
        keywords: ['doac', 'pradaxa', 'trombina'],
        isAnticoagulant: true,
        anticoagType: 'DOAC',
        daysPrior: 2,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender según TFG. >80ml/min: 24-48h. <50ml/min: 3-5 días.'
    },
    {
        id: 'edoxa',
        name: 'Edoxaban',
        category: 'Anticoagulante',
        keywords: ['doac', 'lixiana'],
        isAnticoagulant: true,
        anticoagType: 'DOAC',
        daysPrior: 2,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 48h antes (mínimo).'
    },

    // C. ANTIAGREGANTES
    {
        id: 'asa',
        name: 'Aspirina (AAS)',
        category: 'Antiagregante',
        keywords: ['plaquetas', 'antiplaquetario', 'aspirina', 'protect'],
        daysPrior: 7,
        action: 'adjust',
        alertLevel: 'yellow',
        instructions: 'Prevención 2ria: MANTENER. Suspender 7 días SOLO si Neurocirugía/Oftalmo/Raquia.'
    },
    {
        id: 'clopi',
        name: 'Clopidogrel',
        category: 'Antiagregante',
        keywords: ['plaquetas', 'plavix', 'iscover'],
        daysPrior: 5,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 5-7 días antes.'
    },
    {
        id: 'tica',
        name: 'Ticagrelor',
        category: 'Antiagregante',
        keywords: ['plaquetas', 'brilinta'],
        daysPrior: 5,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 5 días antes.'
    },
    {
        id: 'prasu',
        name: 'Prasugrel',
        category: 'Antiagregante',
        keywords: ['plaquetas', 'effient'],
        daysPrior: 7,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 7 días antes.'
    },

    // --- 3. ENDOCRINOLOGÍA (DIABETES) ---

    // A. iSGLT2 (Glifozinas) - CRÍTICO
    {
        id: 'dapa',
        name: 'Dapagliflozina',
        category: 'iSGLT2',
        keywords: ['diabetes', 'forxiga', 'orina'],
        daysPrior: 3,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'SUSPENDER 3-4 DÍAS ANTES. Riesgo Cetoacidosis Euglucémica Letal.'
    },
    {
        id: 'empa',
        name: 'Empagliflozina',
        category: 'iSGLT2',
        keywords: ['diabetes', 'jardiance'],
        daysPrior: 3,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'SUSPENDER 3-4 DÍAS ANTES. Riesgo Cetoacidosis.'
    },
    {
        id: 'cana',
        name: 'Canagliflozina',
        category: 'iSGLT2',
        keywords: ['diabetes', 'invokana'],
        daysPrior: 3,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'SUSPENDER 3-4 DÍAS ANTES.'
    },

    // B. GLP-1 (Agonistas)
    {
        id: 'sema',
        name: 'Semaglutida',
        category: 'GLP-1',
        keywords: ['ozempic', 'rybelsus', 'wegovy', 'peso'],
        isGLP1: true
    },
    {
        id: 'lira',
        name: 'Liraglutida',
        category: 'GLP-1',
        keywords: ['victoza', 'saxenda'],
        isGLP1: true
    },
    {
        id: 'dula',
        name: 'Dulaglutida',
        category: 'GLP-1',
        keywords: ['trulicity'],
        isGLP1: true
    },

    // C. INSULINAS
    {
        id: 'ins_glar',
        name: 'Insulina Glargina',
        category: 'Insulina',
        keywords: ['lantus', 'toujeo', 'basal'],
        daysPrior: 1,
        action: 'adjust',
        alertLevel: 'yellow',
        instructions: 'Reducir dosis 20% noche previa. Dosis completa si basal pura y < riesgo hipoglucemia.'
    },
    {
        id: 'ins_det',
        name: 'Insulina Detemir',
        category: 'Insulina',
        keywords: ['levemir', 'basal'],
        daysPrior: 1,
        action: 'adjust',
        alertLevel: 'yellow',
        instructions: 'Reducir dosis 20% noche previa.'
    },
    {
        id: 'ins_deg',
        name: 'Insulina Degludec',
        category: 'Insulina',
        keywords: ['tresiba', 'basal'],
        daysPrior: 1,
        action: 'adjust',
        alertLevel: 'yellow',
        instructions: 'Reducir 20% dosis previa. Vida media muy larga.'
    },
    {
        id: 'ins_nph',
        name: 'Insulina NPH',
        category: 'Insulina',
        keywords: ['intermedia', 'humulin', 'n'],
        daysPrior: 1,
        action: 'adjust',
        alertLevel: 'yellow',
        instructions: 'Noche previa: Reducir 20%. Mañana cx: Reducir 50%.'
    },
    {
        id: 'ins_rap',
        name: 'Insulina Rápida/Lispro/Aspart',
        category: 'Insulina',
        keywords: ['humalog', 'novorapid', 'regular', 'rapida'],
        daysPrior: 0,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'NO ADMINISTRAR en ayuno. Usar solo esquema de corrección (Sliding Scale).'
    },
    {
        id: 'ins_mix',
        name: 'Insulinas Premezcladas',
        category: 'Insulina',
        keywords: ['mix', '70/30', 'humalog mix'],
        daysPrior: 0,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'OMITIR mañana de cirugía. Riesgo alto de hipoglucemia.'
    },

    // D. ADOs (Orales tradicionales)
    {
        id: 'metf',
        name: 'Metformina',
        category: 'Antidiabético',
        keywords: ['biguanida', 'glucophage'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 24h antes (Riesgo Acidosis Láctica). Reiniciar con función renal normal.'
    },
    {
        id: 'glib',
        name: 'Glibenclamida',
        category: 'Sulfonilurea',
        keywords: ['euglucon', 'secretagogo'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes (Alto riesgo hipoglucemia extendida).'
    },
    {
        id: 'glim',
        name: 'Glimepirida',
        category: 'Sulfonilurea',
        keywords: ['amaryl'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.'
    },
    {
        id: 'pio',
        name: 'Pioglitazona',
        category: 'Tiazolidinediona',
        keywords: ['actos'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'yellow',
        instructions: 'Suspender. Riesgo retención hídrica.'
    },
    {
        id: 'dpp4',
        name: 'Inhibidores DPP-4 (Sitagliptina/Vilda)',
        category: 'DPP-4',
        keywords: ['januvia', 'galvus', 'trajenta'],
        daysPrior: 0,
        action: 'stop',
        alertLevel: 'yellow',
        instructions: 'Omitir dosis de la mañana de cirugía.'
    },

    // --- 4. ANALGESIA & AINEs ---

    {
        id: 'parac',
        name: 'Paracetamol',
        category: 'Analgésico',
        keywords: ['tylenol', 'acetaminofen', 'tempra'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR. Disponible IV si no hay VO.'
    },
    {
        id: 'ketor',
        name: 'Ketorolaco',
        category: 'AINE',
        keywords: ['dolac', 'supradol', 'analgesico'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 24h antes. Alto riesgo sangrado y renal.'
    },
    {
        id: 'diclo',
        name: 'Diclofenaco',
        category: 'AINE',
        keywords: ['voltaren', 'analgesico'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 24h antes.'
    },
    {
        id: 'ibu',
        name: 'Ibuprofeno',
        category: 'AINE',
        keywords: ['advil', 'motrin'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 24h antes.'
    },
    {
        id: 'napro',
        name: 'Naproxeno',
        category: 'AINE',
        keywords: ['flanax'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Suspender 24-48h antes.'
    },
    {
        id: 'cele',
        name: 'Celecoxib',
        category: 'AINE (COX-2)',
        keywords: ['celebrex'],
        daysPrior: 2,
        action: 'stop',
        alertLevel: 'yellow',
        instructions: 'Suspender 2-3 días antes. Menor riesgo sangrado que AINEs no selectivos.'
    },
    {
        id: 'etori',
        name: 'Etoricoxib',
        category: 'AINE (COX-2)',
        keywords: ['arcoxia'],
        daysPrior: 2,
        action: 'stop',
        alertLevel: 'yellow',
        instructions: 'Suspender 2-3 días antes.'
    },

    // Opioides
    {
        id: 'trama',
        name: 'Tramadol',
        category: 'Opioide',
        keywords: ['tradol', 'dolor'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR. Precaución náusea.'
    },
    {
        id: 'tapa',
        name: 'Tapentadol',
        category: 'Opioide',
        keywords: ['palexia'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'bupre',
        name: 'Buprenorfina (Parche)',
        category: 'Opioide',
        keywords: ['parche', 'transtec'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'MANTENER PARCHE. Proteger en quirófano.'
    },
    {
        id: 'fenta',
        name: 'Fentanilo (Parche)',
        category: 'Opioide',
        keywords: ['durogesic', 'parche'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'MANTENER PARCHE. Ojo: Hipotermia intraoperatoria/calor externo afecta absorción.'
    },

    // --- 5. INFECTOLOGÍA ---

    {
        id: 'amoxi',
        name: 'Amoxicilina / Clav',
        category: 'Antibiótico',
        keywords: ['augmentin', 'clamoxin', 'penicilina'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR si curso activo.'
    },
    {
        id: 'ceftri',
        name: 'Ceftriaxona',
        category: 'Antibiótico',
        keywords: ['rocephin', 'cefalosporina'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'cipro',
        name: 'Ciprofloxacino',
        category: 'Antibiótico',
        keywords: ['quinolona'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'levo_abx',
        name: 'Levofloxacino',
        category: 'Antibiótico',
        keywords: ['elequine', 'quinolona'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'clinda',
        name: 'Clindamicina',
        category: 'Antibiótico',
        keywords: ['dalacin'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR. Profilaxis alt. en alérgicos peps.'
    },
    {
        id: 'metro',
        name: 'Metronidazol',
        category: 'Antibiótico',
        keywords: ['flagyl'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'biktarvy',
        name: 'Biktarvy (TARAA)',
        category: 'Antirretroviral',
        keywords: ['vih', 'sida', 'arv'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CRÍTICO: NO SUSPENDER. Tomar con sorbo agua.'
    },
    {
        id: 'fluco',
        name: 'Fluconazol',
        category: 'Antifúngico',
        keywords: ['diflucan', 'hongo'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },

    // --- 6. CORTICOIDES (Esteroides) ---
    {
        id: 'pred',
        name: 'Prednisona',
        category: 'Corticoides',
        keywords: ['corticoide', 'esteroide', 'meticorten'],
        isSteroid: true,
        daysPrior: 0,
        action: 'adjust',
        alertLevel: 'yellow',
        instructions: 'Valorar dosis estrés.'
    },
    {
        id: 'dexa',
        name: 'Dexametasona',
        category: 'Corticoides',
        keywords: ['corticoide', 'esteroide', 'alin'],
        isSteroid: true,
        daysPrior: 0,
        action: 'adjust',
        alertLevel: 'yellow',
        instructions: 'Valorar dosis estrés.'
    },
    {
        id: 'hidro',
        name: 'Hidrocortisona',
        category: 'Corticoides',
        keywords: ['corticoide', 'esteroide', 'flebo', 'solucortef'],
        isSteroid: true,
        daysPrior: 0,
        action: 'adjust',
        alertLevel: 'yellow',
        instructions: 'Valorar dosis estrés.'
    },
    {
        id: 'metil',
        name: 'Metilprednisolona',
        category: 'Corticoides',
        keywords: ['corticoide', 'esteroide', 'solumedrol'],
        isSteroid: true,
        daysPrior: 0,
        action: 'adjust',
        alertLevel: 'yellow',
        instructions: 'Valorar dosis estrés.'
    },

    // --- 7. NEUROLOGÍA / PSIQUIATRÍA (EXPANDIDO) ---
    {
        id: 'sertra',
        name: 'Sertralina',
        category: 'ISRS',
        keywords: ['antidepresivo', 'altruline'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'NO SUSPENDER.'
    },
    {
        id: 'esci',
        name: 'Escitalopram',
        category: 'ISRS',
        keywords: ['antidepresivo', 'lexapro'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'NO SUSPENDER.'
    },
    {
        id: 'fluox',
        name: 'Fluoxetina',
        category: 'ISRS',
        keywords: ['antidepresivo', 'prozac'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'NO SUSPENDER.'
    },
    {
        id: 'alpra',
        name: 'Alprazolam',
        category: 'Benzodiacepina',
        keywords: ['ansiolitico', 'tafil', 'benzo'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'NO SUSPENDER. Evita abstinencia.'
    },
    {
        id: 'clona',
        name: 'Clonazepam',
        category: 'Benzodiacepina',
        keywords: ['ansiolitico', 'rivotril', 'benzo'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'NO SUSPENDER.'
    },
    {
        id: 'diaze',
        name: 'Diazepam',
        category: 'Benzodiacepina',
        keywords: ['valium', 'benzo'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'NO SUSPENDER.'
    },
    {
        id: 'leve',
        name: 'Levetiracetam',
        category: 'Antiepiléptico',
        keywords: ['keppra', 'convulsion'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CRÍTICO: NO SUSPENDER. Pasar a IV 1:1.'
    },
    {
        id: 'valpro',
        name: 'Valproato (Magnesio/Sodio)',
        category: 'Antiepiléptico',
        keywords: ['depakene', 'epival'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'NO SUSPENDER. Riesgo sangrado leve.'
    },
    {
        id: 'levodopa',
        name: 'Levodopa/Carbidopa',
        category: 'Antiparkinsoniano',
        keywords: ['parkinson', 'sinemet'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'NO SUSPENDER. Riesgo Síndrome Neuroléptico Maligno.'
    },
    {
        id: 'quetia',
        name: 'Quetiapina',
        category: 'Antipsicótico',
        keywords: ['seroquel'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR. Riesgo QTc largo.'
    },
    // Nuevos Neuro/Psiqu
    {
        id: 'olanza',
        name: 'Olanzapina',
        category: 'Antipsicótico',
        keywords: ['zyprexa'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR. Vigilar sedación.'
    },
    {
        id: 'risperi',
        name: 'Risperidona',
        category: 'Antipsicótico',
        keywords: ['risperdal'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'venla',
        name: 'Venlafaxina',
        category: 'IRSN',
        keywords: ['effexor'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'NO SUSPENDER. Riesgo rebote hipertensión.'
    },
    {
        id: 'litio',
        name: 'Carbonato de Litio',
        category: 'Estabilizador',
        keywords: ['litio', 'bipolar'],
        daysPrior: 1,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'SUSPENDER 72h antes (Riesgo toxicidad renal/interacción RM).'
    },

    // --- 8. OFTALMOLOGÍA (Grupo 16) ---
    {
        id: 'timo_oft',
        name: 'Timolol Oftálmico',
        category: 'Oftalmológico',
        keywords: ['glaucoma', 'gotas'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'yellow',
        instructions: 'CONTINUAR. Alerta: Absorción sistémica puede causar bradicardia/broncospasmo.'
    },
    {
        id: 'latano',
        name: 'Latanoprost',
        category: 'Oftalmológico',
        keywords: ['glaucoma', 'xalatan'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'brimoni',
        name: 'Brimonidina',
        category: 'Oftalmológico',
        keywords: ['glaucoma', 'alphagan'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'dorzola',
        name: 'Dorzolamida',
        category: 'Oftalmológico',
        keywords: ['glaucoma', 'trusopt'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },

    // --- 9. UROLOGÍA / NEFROLOGÍA (Grupo 12) ---
    {
        id: 'tamsu',
        name: 'Tamsulosina',
        category: 'Alfa-Bloq',
        keywords: ['secotex', 'prostata'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR. Riesgo Síndrome Iris Flácido (Oftalmo) e hipotensión.'
    },
    {
        id: 'finas',
        name: 'Finasterida',
        category: '5-Alfa Reductasa',
        keywords: ['proscar', 'prostata'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'dutaste',
        name: 'Dutasterida',
        category: '5-Alfa Reductasa',
        keywords: ['avodart'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'toltero',
        name: 'Tolterodina',
        category: 'Antimuscarínico',
        keywords: ['detrusitol', 'vejiga'],
        daysPrior: 0,
        action: 'stop',
        alertLevel: 'yellow',
        instructions: 'Considerar SUSPENDER día previo (Riesgo retención urinaria postop/delirium).'
    },
    {
        id: 'solife',
        name: 'Solifenacina',
        category: 'Antimuscarínico',
        keywords: ['vesicare'],
        daysPrior: 0,
        action: 'stop',
        alertLevel: 'yellow',
        instructions: 'Considerar SUSPENDER día previo (Riesgo retención urinaria).'
    },

    // --- 10. GASTROENTEROLOGÍA (Grupo 8) ---
    {
        id: 'ome',
        name: 'Omeprazol',
        category: 'IBP',
        keywords: ['estomago', 'antiacido'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR. Ayuda pH gástrico.'
    },
    {
        id: 'panto',
        name: 'Pantoprazol',
        category: 'IBP',
        keywords: ['pantozol'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'eso',
        name: 'Esomeprazol',
        category: 'IBP',
        keywords: ['nexium'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'metroclo',
        name: 'Metoclopramida',
        category: 'Procinético',
        keywords: ['plasil', 'vomito'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'ondan',
        name: 'Ondansetrón',
        category: 'Antiemético',
        keywords: ['zofran'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR. Útil profilaxis NVPO.'
    },

    // --- 11. NEUMOLOGÍA (Grupo 13) ---
    {
        id: 'salbu',
        name: 'Salbutamol (Inhalador)',
        category: 'Broncodilatador',
        keywords: ['ventolin', 'asma'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR hasta inducción. CRÍTICO para prevenir broncospasmo.'
    },
    {
        id: 'ipratropio',
        name: 'Bromuro de Ipratropio',
        category: 'Broncodilatador',
        keywords: ['atrovent', 'epoc'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'tiotro',
        name: 'Tiotropio',
        category: 'Broncodilatador',
        keywords: ['spiriva', 'epoc'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'flutica',
        name: 'Fluticasona (Inhal)',
        category: 'Esteroide Inhalado',
        keywords: ['flixotide', 'asma'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'monte',
        name: 'Montelukast',
        category: 'Antileucotrieno',
        keywords: ['singulair', 'asma'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'teofi',
        name: 'Teofilina',
        category: 'Xantina',
        keywords: ['elixifilin'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'yellow',
        instructions: 'CONTINUAR. Rango terapéutico estrecho. Vigilar arritmias.'
    },

    // --- 12. REUMATOLOGÍA (Grupo 21) ---
    {
        id: 'mtx',
        name: 'Metotrexato',
        category: 'DMARD',
        keywords: ['ledertrexate', 'reuma'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'yellow',
        instructions: 'Generalmente CONTINUAR. Suspender 1 semana solo si alto riesgo infeccioso/renal.'
    },
    {
        id: 'hidroxi',
        name: 'Hidroxicloroquina',
        category: 'DMARD',
        keywords: ['plaquenil', 'lupus'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'adali',
        name: 'Adalimumab',
        category: 'Biológico',
        keywords: ['humira', 'tnf'],
        daysPrior: 14,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'SUSPENDER. Programar cx al final del intervalo de dosis (día 14+). Reiniciar tras cicatrización.'
    },
    {
        id: 'etane',
        name: 'Etanercept',
        category: 'Biológico',
        keywords: ['enbrel'],
        daysPrior: 7,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'SUSPENDER. Programar cx 1 semana tras dosis.'
    },
    {
        id: 'inflix',
        name: 'Infliximab',
        category: 'Biológico',
        keywords: ['remicade'],
        daysPrior: 28,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Cx 4-8 semanas tras última dosis.'
    },
    {
        id: 'ritux',
        name: 'Rituximab',
        category: 'Biológico',
        keywords: ['mabthera'],
        daysPrior: 0,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Consultar Reuma. Generalmente cx 4-6 meses tras dosis.'
    },
    {
        id: 'colchi',
        name: 'Colchicina',
        category: 'Antigotoso',
        keywords: ['colchiquim', 'gota'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR (precaución dosis renal).'
    },
    {
        id: 'alop',
        name: 'Alopurinol',
        category: 'Antigotoso',
        keywords: ['zyloprim', 'gota'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR. No iniciar agudamente.'
    },

    // --- 13. ONCOLOGÍA (Grupo 17) ---
    {
        id: 'tamox',
        name: 'Tamoxifeno',
        category: 'Hormonal Oncológico',
        keywords: ['nolvadex', 'cancer mama'],
        daysPrior: 14,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'SUSPENDER 2-4 semanas antes si cx riesgo trombótico alto/inmovilización.'
    },
    {
        id: 'anastro',
        name: 'Anastrozol',
        category: 'Inhibidor Aromatasa',
        keywords: ['arimidex'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'Generalmente CONTINUAR.'
    },
    {
        id: 'bicalu',
        name: 'Bicalutamida',
        category: 'Antiandrógeno',
        keywords: ['casodex'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    {
        id: 'chemo_oral',
        name: 'Quimioterapia Oral (General)',
        category: 'Quimioterapia',
        keywords: ['capecitabina', 'imatinib'],
        daysPrior: 0,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'CONSULTAR ONCÓLOGO. Generalmente suspender días perioperatorios.'
    },

    // --- 14. PLANIFICACIÓN FAMILIAR (Grupo 19) ---
    {
        id: 'aco',
        name: 'Anticonceptivos Orales (Combinados)',
        category: 'Hormonal',
        keywords: ['yasmine', 'diane', 'anticonceptivo'],
        daysPrior: 28,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'SUSPENDER 4 semanas antes si Cx Mayor/Alto Riesgo Trombótico. Puente con barrera.'
    },
    {
        id: 'levo_eme',
        name: 'Levonorgestrel (Emergencia)',
        category: 'Hormonal',
        keywords: ['postday'],
        daysPrior: 0,
        action: 'stop',
        alertLevel: 'yellow',
        instructions: 'Avisar anestesiólogo (riesgo TVP leve).'
    },

    // --- 15. OTORRINOLARINGOLOGÍA (Grupo 18) ---
    {
        id: 'dife',
        name: 'Difenidol',
        category: 'Antiemético/Vértigo',
        keywords: ['vertigo', 'vontrol'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR si vértigo activo. Ojo: efecto anticolinérgico.'
    },
    {
        id: 'cinna',
        name: 'Cinarizina',
        category: 'Antihistamínico',
        keywords: ['stugeron', 'vertigo'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR. Potencia sedación.'
    },
    {
        id: 'momet',
        name: 'Mometasona (Nasal)',
        category: 'Esteroide Nasal',
        keywords: ['rinitis'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },

    // --- 16. SOLUCIONES Y ELECTROLITOS (Grupo 22) ---
    {
        id: 'kcl_oral',
        name: 'Cloruro de Potasio (Oral)',
        category: 'Electrolito',
        keywords: ['kcl', 'koramen', 'potasio'],
        daysPrior: 0,
        action: 'stop',
        alertLevel: 'yellow',
        instructions: 'SUSPENDER día de cx. Manejo IV según niveles séricos.'
    },
    {
        id: 'mg_oral',
        name: 'Magnesio (Oral)',
        category: 'Electrolito',
        keywords: ['magnesio', 'magne b6'],
        daysPrior: 0,
        action: 'stop',
        alertLevel: 'yellow',
        instructions: 'SUSPENDER día de cx. Cuidado con bloqueo neuromuscular.'
    },

    // --- 17. VACUNAS (Grupo 23) ---
    {
        id: 'vac_live',
        name: 'Vacuna Virus Vivos (SRP, Varicela, Polio Oral)',
        category: 'Vacuna',
        keywords: ['srp', 'sabin'],
        daysPrior: 14,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'Electiva: Posponer cx 2-3 semanas tras vacuna. O vacunar 3-4 sem post-cx.'
    },
    {
        id: 'vac_inact',
        name: 'Vacuna Inactivada (Influenza, Tétanos)',
        category: 'Vacuna',
        keywords: ['flu', 'td', 'tetanos'],
        daysPrior: 2,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'Espera 48h para cx electiva (evitar fiebre confusional).'
    },
    {
        id: 'fabo',
        name: 'Faboterápico (Antialacrán/Arácnido)',
        category: 'Antídoto',
        keywords: ['alacramyn'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'Uso agudo en urgencia. No contraindica anestesia si estabilizado.'
    },

    // --- EXTRA GROUPS (Hematology, Gyn, Derma, Tox) ---
    {
        id: 'hierro',
        name: 'Sulfato Ferroso',
        category: 'Hematológico',
        keywords: ['anemia', 'hierro'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR. Heces oscuras.'
    },
    {
        id: 'epo',
        name: 'Eritropoyetina',
        category: 'Hematológico',
        keywords: ['epo', 'anemia', 'renal'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR. Riesgo trombótico leve (vigilar).'
    },
    {
        id: 'thz',
        name: 'Terapia Reemplazo Hormonal (Estrógenos)',
        category: 'Hormonal',
        keywords: ['climaterio', 'menopausia'],
        daysPrior: 28,
        action: 'stop',
        alertLevel: 'red',
        instructions: 'SUSPENDER 4 semanas antes si cirugía de alto riesgo trombótico.'
    },
    {
        id: 'iso',
        name: 'Isotretinoína',
        category: 'Dermatológico',
        keywords: ['acne', 'roacutan', 'trevissage'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'yellow',
        instructions: 'CONTINUAR. Monitorizar función hepática y lípidos. Mucosas secas (Ojo seco).'
    },
    {
        id: 'lora',
        name: 'Loratadina',
        category: 'Antihistamínico',
        keywords: ['alergia', 'clarityne'],
        daysPrior: 0,
        action: 'continue',
        alertLevel: 'green',
        instructions: 'CONTINUAR.'
    },
    // --- 18. ADICIONALES Y REFUERZOS (MASSIVE EXPANSION) ---
    // A. CARDIOLOGÍA REFUERZO
    { id: 'nitrog', name: 'Nitroglicerina (Parche/Sublingual)', category: 'Nitrato', keywords: ['isorbide', 'isordil', 'corazon', 'angina'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR. Suspender parches previo a electrocauterio si están en zona de arco.' },
    { id: 'isosor', name: 'Isosorbide Dinitrato/5-Mono', category: 'Nitrato', keywords: ['angina', 'isordil'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'hydra', name: 'Hidralazina', category: 'Vasodilatador', keywords: ['apresolina', 'presion'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'cloni', name: 'Clonidina', category: 'Alfa-2 Agonista', keywords: ['catapres', 'presion'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CRÍTICO: NO SUSPENDER. Riesgo de hipertensión de rebote severa.' },
    { id: 'amio', name: 'Amiodarona', category: 'Antiarritmico', keywords: ['ritmo', 'cordarone'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR. Vida media muy larga. Monitorizar QT.' },
    { id: 'digox', name: 'Digoxina', category: 'Inotropico', keywords: ['lanoxin', 'corazon'], daysPrior: 1, action: 'stop', alertLevel: 'yellow', instructions: 'SUSPENDER día de cirugía (salvo FA con respuesta ventricular rápida difícil control).' },
    { id: 'espirono_cardio', name: 'Eplerenona', category: 'Diurético', keywords: ['inspra', 'aldosterona'], daysPrior: 1, action: 'stop', alertLevel: 'yellow', instructions: 'Suspender día de cirugía.' },

    // B. ANTIBIÓTICOS REFUERZO
    { id: 'piper_tazo', name: 'Piperacilina / Tazobactam', category: 'Antibiótico', keywords: ['tazocin', 'iv'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR IV.' },
    { id: 'mero', name: 'Meropenem', category: 'Antibiótico', keywords: ['carbapenem', 'iv'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR IV.' },
    { id: 'ertap', name: 'Ertapenem', category: 'Antibiótico', keywords: ['invanz'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'vanco', name: 'Vancomicina', category: 'Antibiótico', keywords: ['iv', 'mrsa'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR. Infusión lenta (evitar Hombre Rojo).' },
    { id: 'line', name: 'Linezolid', category: 'Antibiótico', keywords: ['zyvox'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR. Ojo: Riesgo Serotoninérgico con ISRS.' },
    { id: 'genta', name: 'Gentamicina', category: 'Antibiótico', keywords: ['aminoglucosido'], daysPrior: 0, action: 'continue', alertLevel: 'yellow', instructions: 'CONTINUAR. Monitorizar función renal postop.' },
    { id: 'amik', name: 'Amikacina', category: 'Antibiótico', keywords: ['aminoglucosido'], daysPrior: 0, action: 'continue', alertLevel: 'yellow', instructions: 'CONTINUAR.' },
    { id: 'cefalex', name: 'Cefalexina', category: 'Antibiótico', keywords: ['keflex', 'cefalosporina'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'cefaclor', name: 'Cefaclor', category: 'Antibiótico', keywords: ['ceclor'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'cefuro', name: 'Cefuroxima', category: 'Antibiótico', keywords: ['zinacef'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'cefix', name: 'Cefixima', category: 'Antibiótico', keywords: ['denvar'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'moxi', name: 'Moxifloxacino', category: 'Antibiótico', keywords: ['avelin', 'quinolona'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'nitrof', name: 'Nitrofurantoína', category: 'Antibiótico', keywords: ['macrodantina'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'fofom', name: 'Fosfomicina', category: 'Antibiótico', keywords: ['monurol'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },

    // C. DIABETES REFUERZO
    { id: 'vilda', name: 'Vildagliptina', category: 'DPP-4', keywords: ['galvus'], daysPrior: 0, action: 'stop', alertLevel: 'yellow', instructions: 'Omitir dosis mañana de cx.' },
    { id: 'lina', name: 'Linagliptina', category: 'DPP-4', keywords: ['trajenta'], daysPrior: 0, action: 'stop', alertLevel: 'yellow', instructions: 'Omitir dosis mañana de cx.' },
    { id: 'alo', name: 'Alogliptina', category: 'DPP-4', keywords: ['nesina'], daysPrior: 0, action: 'stop', alertLevel: 'yellow', instructions: 'Omitir dosis mañana de cx.' },
    { id: 'saxa', name: 'Saxagliptina', category: 'DPP-4', keywords: ['onglyza'], daysPrior: 0, action: 'stop', alertLevel: 'yellow', instructions: 'Omitir dosis mañana de cx.' },
    { id: 'repa', name: 'Repaglinida', category: 'Glinida', keywords: ['prandin'], daysPrior: 0, action: 'stop', alertLevel: 'red', instructions: 'OMITIR dosis en ayuno. Riesgo hipoglucemia.' },
    { id: 'acar', name: 'Acarbosa', category: 'Inhibidor Glucosidasa', keywords: ['precose'], daysPrior: 0, action: 'stop', alertLevel: 'green', instructions: 'OMITIR en ayuno.' },

    // D. PSIQUIATRÍA REFUERZO
    { id: 'queti', name: 'Quetiapina', category: 'Antipsicótico', keywords: ['seroquel', 'sueño'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'olanz', name: 'Olanzapina', category: 'Antipsicótico', keywords: ['zyprexa'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'risp', name: 'Risperidona', category: 'Antipsicótico', keywords: ['risperdal'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'clozap', name: 'Clozapina', category: 'Antipsicótico', keywords: ['clozaril'], daysPrior: 0, action: 'continue', alertLevel: 'yellow', instructions: 'CONTINUAR. Riesgo de íleo paralítico postop.' },
    { id: 'halo', name: 'Haloperidol', category: 'Antipsicótico', keywords: ['haldol'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'lith', name: 'Litio', category: 'Estabilizador', keywords: ['carbolit'], daysPrior: 1, action: 'stop', alertLevel: 'red', instructions: 'SUSPENDER 24h antes. Riesgo toxicidad renal y prolongación bloqueo neuromuscular.' },
    { id: 'valp', name: 'Valproato de Magnesio/Sodio', category: 'Antiepiléptico', keywords: ['epival', 'valproico'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'carbama', name: 'Carbamazepina', category: 'Antiepiléptico', keywords: ['tegretol'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'pheny', name: 'Fenitoína', category: 'Antiepiléptico', keywords: ['epamin'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'leveti', name: 'Levetiracetam', category: 'Antiepiléptico', keywords: ['keppra'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR. Cambiar a IV si ayuno prolongado.' },
    { id: 'gaba', name: 'Gabapentina', category: 'Neuromodulador', keywords: ['neurontin', 'dolor'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'prega', name: 'Pregabalina', category: 'Neuromodulador', keywords: ['lyrica', 'dolor'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'venla', name: 'Venlafaxina', category: 'IRSN', keywords: ['effexor'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'dulox', name: 'Duloxetina', category: 'IRSN', keywords: ['cymbalta'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'mirtaz', name: 'Mirtazapina', category: 'Antidepresivo', keywords: ['remeron'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'fluox', name: 'Fluoxetina', category: 'ISRS', keywords: ['prozac'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'parox', name: 'Paroxetina', category: 'ISRS', keywords: ['paxil'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },

    // E. GASTRO REFUERZO
    { id: 'omep', name: 'Omeprazol', category: 'IBP', keywords: ['estomago', 'gastritis', 'losev'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR. Profilaxis aspiración.' },
    { id: 'panto', name: 'Pantoprazol', category: 'IBP', keywords: ['tecta'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'esomep', name: 'Esomeprazol', category: 'IBP', keywords: ['nexium'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'ranit', name: 'Ranitidina', category: 'H2-Bloq', keywords: ['antiacido'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'metoclop', name: 'Metoclopramida', category: 'Procinético', keywords: ['carnotprim', 'nausea'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'ondans', name: 'Ondansetrón', category: 'Antiemético', keywords: ['zofran', 'nausea'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'loper', name: 'Loperamida', category: 'Antidiarreico', keywords: ['imodium'], daysPrior: 0, action: 'stop', alertLevel: 'yellow', instructions: 'OMITIR día de cirugía. Riesgo de íleo.' },

    // F. UROLOGÍA/NEFROLOGÍA REFUERZO
    { id: 'alfu', name: 'Alfuzosina', category: 'Alfa-Bloq', keywords: ['prostata', 'xatral'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'finas', name: 'Finasterida', category: '5-Alfa-Red', keywords: ['proscar', 'prostata'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'dutast', name: 'Dutasterida', category: '5-Alfa-Red', keywords: ['avodart'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'silde', name: 'Sildenafil', category: 'PDE-5', keywords: ['viagra'], daysPrior: 1, action: 'stop', alertLevel: 'red', instructions: 'SUSPENDER 24h antes. Riesgo hipotensión severa si se usan nitratos/hipovolemia.' },
    { id: 'tada', name: 'Tadalafil', category: 'PDE-5', keywords: ['cialis'], daysPrior: 2, action: 'stop', alertLevel: 'red', instructions: 'SUSPENDER 48h antes (vida media larga).' },
    { id: 'oxybu', name: 'Oxibutinina', category: 'Antimuscarínico', keywords: ['vejiga'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },

    // G. REUMATOLOGÍA REFUERZO
    { id: 'metho', name: 'Metotrexato', category: 'DMARD', keywords: ['artritis', 'reuma'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR si dosis estable y función renal preservada.' },
    { id: 'leflu', name: 'Leflunomida', category: 'DMARD', keywords: ['arava'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'hidroxi', name: 'Hidroxicloroquina', category: 'DMARD', keywords: ['plaquenil', 'lupus'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'sulfasal', name: 'Sulfasalazina', category: 'DMARD', keywords: ['azulfidina'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'azatio', name: 'Azatioprina', category: 'Inmunosupresor', keywords: ['imuran'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'etane', name: 'Etanercept', category: 'Biológico', keywords: ['enbrel'], daysPrior: 7, action: 'stop', alertLevel: 'yellow', instructions: 'SUSPENDER 1 semana antes (o saltar dosis si es semanal).' },
    { id: 'inflix', name: 'Infliximab', category: 'Biológico', keywords: ['remicade'], daysPrior: 14, action: 'stop', alertLevel: 'yellow', instructions: 'Idealmente programar cirugía 2 semanas después de última dosis.' },

    // H. DERMATOLOGÍA REFUERZO
    { id: 'acitr', name: 'Acitretina', category: 'Retinoide', keywords: ['psoriasis'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'ciclo_derma', name: 'Ciclosporina', category: 'Inmunosupresor', keywords: ['sandimmun'], daysPrior: 0, action: 'continue', alertLevel: 'yellow', instructions: 'CONTINUAR. Monitorizar función renal y niveles si posible.' },

    // I. ANESTESIA (PARA USO HOSPITALARIO/INTRAOP)
    { id: 'prop', name: 'Propofol', category: 'Hipnótico', keywords: ['leche', 'induccion'], daysPrior: 0, action: 'adjust', alertLevel: 'yellow', instructions: 'Uso exclusivo anestesiología. Depresión respiratoria.' },
    { id: 'etor', name: 'Etomidato', category: 'Hipnótico', keywords: ['induccion', 'cardioestable'], daysPrior: 0, action: 'adjust', alertLevel: 'yellow', instructions: 'Uso exclusivo anestesiología. Supresión suprarrenal transitoria.' },
    { id: 'roc', name: 'Rocuronio', category: 'Relajante Muscular', keywords: ['esmeron', 'relajante'], daysPrior: 0, action: 'adjust', alertLevel: 'red', instructions: 'Uso exclusivo anestesiología. Bloqueo neuromuscular.' },
    { id: 'cisat', name: 'Cisatracurio', category: 'Relajante Muscular', keywords: ['nimbex'], daysPrior: 0, action: 'adjust', alertLevel: 'red', instructions: 'Uso exclusivo anestesiología.' },
    { id: 'suxi', name: 'Succinilcolina', category: 'Relajante Muscular', keywords: ['despolarizante'], daysPrior: 0, action: 'adjust', alertLevel: 'red', instructions: 'Uso exclusivo anestesiología. Gatillo de Hipertermia Maligna.' },
    { id: 'suga', name: 'Sugammadex', category: 'Reversor Relajante', keywords: ['bridion'], daysPrior: 0, action: 'adjust', alertLevel: 'green', instructions: 'Uso exclusivo anestesiología. Revierte rocuronio/vecuronio.' },
    // J. OBSTETRICIA / GINECOLOGÍA REFUERZO
    { id: 'oxy', name: 'Oxitocina', category: 'Hormonal', keywords: ['parto', 'induccion'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'Manejo hospitalario. Suspender si se requiere manejo agudo de atonía con otros agentes.' },
    { id: 'dino', name: 'Dinoprostona', category: 'Hormonal', keywords: ['prostaglandina'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'Manejo hospitalario.' },
    { id: 'ortho', name: 'Etinilestradiol / Levonorgestrel', category: 'Anticonceptivo', keywords: ['pastilla', 'planificacion'], daysPrior: 0, action: 'continue', alertLevel: 'yellow', instructions: 'CONTINUAR. Valorar profilaxis antitrombótica si cirugía mayor por riesgo de TVP.' },

    // K. PSIQUIATRÍA / NEURO ADICIONAL
    { id: 'miph', name: 'Metilfenidato', category: 'Estimulante', keywords: ['ritalin', 'tdah', 'concerta'], daysPrior: 0, action: 'stop', alertLevel: 'yellow', instructions: 'OMITIR día de cirugía. Riesgo de inestabilidad hemodinámica y arritmias.' },
    { id: 'atom', name: 'Atomoxetina', category: 'Estimulante', keywords: ['strattera'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'modaf', name: 'Modafinilo', category: 'Estimulante', keywords: ['provigil', 'sueño'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'meman', name: 'Memantina', category: 'Antidemencia', keywords: ['alzheimer', 'akatinol'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'donep', name: 'Donepezilo', category: 'Antidemencia', keywords: ['aricept'], daysPrior: 0, action: 'continue', alertLevel: 'yellow', instructions: 'CONTINUAR. Riesgo de bradicardia y prolongación de efecto de succinilcolina.' },

    // L. INFECTOLOGÍA FINAL
    { id: 'acicl', name: 'Aciclovir', category: 'Antiviral', keywords: ['zovirax', 'herpes'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'valaci', name: 'Valaciclovir', category: 'Antiviral', keywords: ['valtrex'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'ostelt', name: 'Oseltamivir', category: 'Antiviral', keywords: ['tamiflu', 'influenza'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },
    { id: 'terbi', name: 'Terbinafina', category: 'Antifúngico', keywords: ['lamisil'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.' },

    // M. DOLOR / CUIDADOS PALIATIVOS
    { id: 'methad', name: 'Metadona', category: 'Opioide', keywords: ['paliativo', 'adiccion'], daysPrior: 0, action: 'continue', alertLevel: 'red', instructions: 'MANTENER DOSIS. NO SUSPENDER. Riesgo de síndrome de abstinencia y dolor incontrolable. Monitorizar QT.' },
    { id: 'morph', name: 'Morfina (Liberación Prolongada)', category: 'Opioide', keywords: ['mst', 'graten', 'dolor'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'MANTENER DOSIS BASAL. Usar rescates IV intraop.' },
    { id: 'oxyco', name: 'Oxicodona', category: 'Opioide', keywords: ['oxycontin', 'percocet'], daysPrior: 0, action: 'continue', alertLevel: 'green', instructions: 'MANTENER DOSIS.' }
];
