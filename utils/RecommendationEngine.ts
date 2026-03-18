import { VPOData, SelectedMed } from '../types';

// =============================================================================
// MOTOR DE RECOMENDACIONES PERIOPERATORIAS v3.0
// Arquitectura: 5 Secciones Clínicas con Correlación Cruzada
// Guías: ASA 2023 | SAMBA 2024 | KDIGO | ASHP/IDSA | ACCP | ACC/AHA | PAUSE
// =============================================================================

class SectionBuilder {
    private items = new Map<string, string>();

    add(id: string, text: string): void {
        if (!this.items.has(id)) {
            this.items.set(id, text);
        }
    }

    compile(): string {
        return Array.from(this.items.values()).map(t => `- ${t}`).join('\n');
    }

    isEmpty(): boolean {
        return this.items.size === 0;
    }
}

// =============================================================================
// FUNCIÓN PRINCIPAL
// =============================================================================

export const generateRecommendations = (data: VPOData): {
    plan_pre: string;
    plan_trans: string;
    plan_post: string;
} => {
    const tfg = data.tfg || 90;
    const peso = data.peso || 70;
    const edad = data.edad || 40;
    const imc = data.imc || 24;
    const caprini = data.caprini || 0;
    const meds = data.selectedMeds || [];
    const site = data.gupta_surgical_site || 'other';
    const isDiabetic = data.diabetes;
    const isUrgent = data.esUrgencia;
    const isPenicillinAllergic = data.alergicos && (data.alergicosDetalle || '').toLowerCase().includes('penicilina');
    const isNeuro = ['intracranial', 'spinal'].includes(site);
    const isThoracic = site === 'thoracic';
    const isCardiac = site === 'cardiac';
    const isAbdominalMajor = ['intestinal', 'biliary', 'bariatric', 'abdominal'].includes(site) || data.capB_cxMayor;
    const isColorectal = ['intestinal', 'anorectal'].includes(site);
    const hasICC = data.icc;
    const hasLowEF = hasICC && data.icc_evolucion !== 'cronica_comp';
    const isHighBleeding = ['intracranial', 'spinal', 'cardiac', 'aortic', 'thoracic', 'vascular', 'urologic'].includes(site);
    const cardioRiskHigh = (data.lee && (data.lee === 'III' || data.lee === 'IV')) || (data.gupta && data.gupta >= 1);
    const metsLow = (data.mets_estimated || 4) < 4;
    const stopBangHigh = (data.stopbang_total || 0) >= 5;

    // Output builders
    const preSections: string[] = [];
    const transSections: string[] = [];
    const postSections: string[] = [];

    // =========================================================================
    // SECCION 1: AYUNO Y FLUIDOTERAPIA
    // Guías: ASA 2023 / SAMBA 2024 / KDIGO / ERAS
    // =========================================================================
    const ayuno = new SectionBuilder();
    const fluidos = new SectionBuilder();

    // --- Ayuno ---
    if (isDiabetic) {
        ayuno.add('AYUNO_DM',
            'Ayuno a solidos 6 horas previas. Permitir liquidos claros (agua) hasta 2 horas previas a la induccion. Prohibida la carga de carbohidratos preoperatoria por riesgo de variabilidad glucemica (Consenso SAMBA 2024).');
    } else {
        ayuno.add('AYUNO_STD',
            'Ayuno a solidos 6 horas. Liquidos claros permitidos hasta 2 horas previas a la induccion.');
        ayuno.add('CARB_LOAD',
            'Administrar bebida rica en carbohidratos (maltodextrina) 2 horas previas a cirugia para disminuir resistencia a la insulina perioperatoria (Protocolo ERAS).');
    }

    if (isUrgent) {
        ayuno.add('AYUNO_URG',
            'CIRUGIA DE URGENCIA: Ayuno no garantizado. Valorar induccion de secuencia rapida (IRS). Considerar estomago lleno.');
    }

    // --- Fluidoterapia ---
    if (isNeuro) {
        fluidos.add('FLUIDOS_NEURO',
            'Uso exclusivo de Solucion Salina 0.9% para mantenimiento de osmolaridad. Contraindicadas soluciones hipotonicas y Ringer Lactato en grandes volumenes para prevenir edema cerebral.');
    } else if (isThoracic || isCardiac || hasLowEF) {
        fluidos.add('FLUIDOS_RESTRICTIVOS',
            'Terapia restrictiva de fluidos (< 2 ml/kg/h). Evitar sobrecarga hidrica. Manejar hipotension con vasopresor temprano. Balance acumulado objetivo < 1.5L en 24h.');
    } else if (isAbdominalMajor) {
        fluidos.add('FLUIDOS_ERAS',
            'Terapia moderadamente liberal. Utilizar cristaloides balanceados (Ringer Lactato o PlasmaLyte). Evitar Solucion Salina 0.9% en grandes volumenes por riesgo de acidosis hipercloremica y lesion renal aguda (KDIGO).');
    } else {
        fluidos.add('FLUIDOS_STD',
            'Manejo de liquidos de mantenimiento con cristaloides balanceados (Hartmann/PlasmaLyte) para evitar acidosis hipercloremica por Solucion Salina 0.9% (Estudio RELIEF).');
    }

    if (hasICC && !isThoracic && !isCardiac) {
        fluidos.add('FLUIDOS_ICC',
            'Antecedente de insuficiencia cardiaca: restringir aporte hidrico. Evaluar tolerancia a volumen limitada. Preferir vasopresor temprano sobre carga de volumen.');
    }

    if (tfg < 60 && !isNeuro) {
        fluidos.add('FLUIDOS_RENAL',
            `Funcion renal comprometida (TFG ${tfg} ml/min). Vigilar balance hidrico estricto. Evitar nefrotoxicos (coloides sinteticos, AINES, contraste iodado).`);
    }

    if (edad > 75) {
        fluidos.add('FLUIDOS_GERIATRICO',
            'Evitar sobrecarga hidrica por riesgo de edema agudo pulmonar asociado a disfuncion diastolica por envejecimiento.');
    }

    fluidos.add('FLUIDOS_HES',
        'Coloides sinteticos (HES/Voluven) CONTRAINDICADOS: riesgo de falla renal aguda y coagulopatia (KDIGO 2024).');

    if (!ayuno.isEmpty() || !fluidos.isEmpty()) {
        const s1: string[] = ['1. AYUNO Y FLUIDOTERAPIA'];
        if (!ayuno.isEmpty()) s1.push(ayuno.compile());
        if (!fluidos.isEmpty()) s1.push(fluidos.compile());
        preSections.push(s1.join('\n'));
        transSections.push(`1. FLUIDOTERAPIA INTRAOPERATORIA\n${fluidos.compile()}`);
    }

    // =========================================================================
    // SECCION 2: PROFILAXIS ANTIMICROBIANA
    // Guías: ASHP/IDSA 2024
    // =========================================================================
    const atb = new SectionBuilder();

    // Selección de antibiótico
    let antibioticBase = `Cefazolina ${peso > 120 ? '3g' : '2g'} IV dosis unica`;
    if (isPenicillinAllergic) {
        antibioticBase = 'Clindamicina 900mg IV + Gentamicina 5mg/kg IV (alternativa: Vancomicina 15mg/kg IV), dada alergia a penicilinas documentada';
    }

    if (isColorectal) {
        if (isPenicillinAllergic) {
            atb.add('ATB_BASE', `Administrar ${antibioticBase}. Adicionar Metronidazol 500mg IV para cobertura anaerobia (Guia ASHP/IDSA).`);
        } else {
            atb.add('ATB_BASE', `Administrar Cefazolina ${peso > 120 ? '3g' : '2g'} IV + Metronidazol 500mg IV (30-60 minutos previos a la incision). (Guia ASHP/IDSA).`);
        }
    } else {
        atb.add('ATB_BASE', `Administrar ${antibioticBase} (30-60 minutos previos a la incision). (Guia ASHP/IDSA).`);
    }

    // Re-dosificación
    atb.add('ATB_REDOSE',
        'Redosificar antibiotico intraoperatorio si la duracion del evento quirurgico supera 4 horas o el sangrado es > 1500 ml (Cefazolina cada 4 horas).');

    // Ajuste renal
    if (tfg < 50) {
        atb.add('ATB_RENAL',
            `Ajustar dosis de mantenimiento de antimicrobianos postoperatorios segun tasa de filtrado glomerular de ${tfg} ml/min.`);
    }

    // Suspensión postoperatoria
    atb.add('ATB_SUSPEND',
        'Suspender esquema antibiotico profilactico antes de las 24 horas del postoperatorio si no se demuestra infeccion de sitio quirurgico.');

    preSections.push(`2. PROFILAXIS ANTIMICROBIANA\n${atb.compile()}`);

    // =========================================================================
    // SECCION 3: TROMBOPROFILAXIS
    // Guías: ACCP / Escala Caprini
    // =========================================================================
    const trombo = new SectionBuilder();

    if (caprini >= 5) {
        if (tfg < 30) {
            trombo.add('TROMBO_ALTO_RENAL',
                `Riesgo Alto (Caprini ${caprini}) con falla renal (TFG ${tfg} ml/min): Doble profilaxis con Compresion Neumatica Intermitente + Heparina No Fraccionada 5000 UI SC cada 12h (o Enoxaparina 20 mg SC cada 24h ajustada). Extender profilaxis por 7-10 dias.`);
        } else {
            trombo.add('TROMBO_ALTO',
                `Riesgo Alto (Caprini ${caprini}): Doble profilaxis con Compresion Neumatica Intermitente + Enoxaparina 40 mg SC cada 24h (iniciar 12h postoperatorio). Extender profilaxis por 7-10 dias.`);
        }
    } else if (caprini >= 3) {
        if (tfg < 30) {
            trombo.add('TROMBO_MOD_RENAL',
                `Riesgo Moderado (Caprini ${caprini}) con falla renal (TFG ${tfg} ml/min): Enoxaparina 20 mg SC cada 24h O Heparina No Fraccionada 5000 UI SC cada 12h.`);
        } else {
            trombo.add('TROMBO_MOD',
                `Riesgo Moderado (Caprini ${caprini}): Enoxaparina 40 mg SC cada 24h (iniciar 12h postoperatorio) O Heparina No Fraccionada 5000 UI SC cada 12h.`);
        }
    } else if (caprini === 2) {
        trombo.add('TROMBO_BAJO',
            `Riesgo Bajo (Caprini ${caprini}): Medios fisicos (Compresion Neumatica Intermitente). No requiere profilaxis farmacologica.`);
    } else {
        trombo.add('TROMBO_MINIMO',
            `Riesgo Muy Bajo (Caprini ${caprini}): Deambulacion temprana. No requiere profilaxis farmacologica.`);
    }

    postSections.push(`3. TROMBOPROFILAXIS\n${trombo.compile()}`);

    // =========================================================================
    // SECCION 4: MANEJO FARMACOLOGICO ESPECIFICO
    // Guías: ACC/AHA / Protocolo PAUSE / SAMBA 2024
    // =========================================================================
    const farma = new SectionBuilder();

    // --- Beta-bloqueadores ---
    const betablockers = meds.filter(m =>
        ['metoprolol', 'bisoprolol', 'carvedilol', 'propranolol', 'atenolol', 'nebivolol']
            .some(bb => m.name.toLowerCase().includes(bb))
    );
    if (betablockers.length > 0) {
        const bbNames = betablockers.map(m => m.name).join('/');
        farma.add('BB',
            `${bbNames}: MANTENER dosis matutina con sorbo de agua. Riesgo de isquemia miocardica o taquicardia de rebote si se suspende (ACC/AHA).`);
        if (cardioRiskHigh) {
            farma.add('BB_MACE',
                'Riesgo cardiovascular elevado. Vigilar hipotension y bradicardia perioperatoria. Solicitar troponinas de alta sensibilidad a las 12, 24 y 48 horas postoperatorias.');
        }
    }

    // --- IECA / ARA II ---
    const aceArbs = meds.filter(m =>
        ['enalapril', 'lisinopril', 'ramipril', 'captopril', 'losartan', 'valsartan', 'telmisartan', 'irbesartan', 'candesartan', 'olmesartan']
            .some(a => m.name.toLowerCase().includes(a))
    );
    if (aceArbs.length > 0) {
        const aceNames = aceArbs.map(m => m.name).join('/');
        if (hasLowEF) {
            farma.add('IECA_ICC',
                `${aceNames}: VALORAR CONTINUACION en contexto de insuficiencia cardiaca descompensada. Si estabilidad hemodinamica lo permite, suspender 24 horas previas. Decisión individualizada con Cardiologia.`);
        } else {
            farma.add('IECA',
                `${aceNames}: SUSPENDER 24 horas previas al procedimiento para evitar hipotension refractaria a efedrina durante la induccion anestesica (ACC/AHA).`);
        }
    }

    // --- iSGLT2 ---
    const sglt2 = meds.filter(m =>
        ['dapagliflozina', 'empagliflozina', 'canagliflozina', 'ertugliflozina']
            .some(s => m.name.toLowerCase().includes(s))
    );
    if (sglt2.length > 0) {
        const sglt2Names = sglt2.map(m => m.name).join('/');
        const days = meds.some(m => m.name.toLowerCase().includes('ertugliflozina')) ? '4' : '3 a 4';
        farma.add('SGLT2',
            `ALERTA - ${sglt2Names}: SUSPENDER ${days} dias previos al procedimiento. Riesgo severo de cetoacidosis euglucemica perioperatoria (FDA/SAMBA 2024).`);
    }

    // --- DOACs (Protocolo PAUSE) ---
    const doacs = meds.filter(m =>
        ['apixaban', 'apixaban', 'rivaroxaban', 'rivaroxaban', 'dabigatran', 'dabigatran', 'edoxaban',
         'apixabán', 'rivaroxabán', 'dabigatrán', 'edoxabán']
            .some(d => m.name.toLowerCase().includes(d))
    );
    doacs.forEach(doac => {
        const isDabi = doac.name.toLowerCase().includes('dabigat');
        let hours = 24;

        if (isHighBleeding) {
            hours = tfg < 30 ? 72 : 48;
            if (isDabi && tfg < 50) hours = Math.max(hours, 96);
        } else {
            hours = tfg < 30 ? 48 : 24;
            if (isDabi && tfg < 50) hours = Math.max(hours, 72);
        }

        const riskLabel = isHighBleeding ? 'Alto' : 'Bajo';
        farma.add(`DOAC_${doac.name}`,
            `${doac.name}: SUSPENDER ${hours} horas previas por TFG de ${tfg} ml/min y Riesgo de Sangrado ${riskLabel}. No requiere terapia puente (Protocolo PAUSE). Reiniciar 48 horas postoperatorio si hemostasia es adecuada.`);
    });

    // --- Warfarina ---
    const warfarin = meds.filter(m =>
        ['warfarina', 'acenocumarol'].some(w => m.name.toLowerCase().includes(w))
    );
    warfarin.forEach(warf => {
        if (data.valvula_protesis || (data.arritmia_tipo === 'fa' && (data.cha2ds2vasc || 0) >= 6)) {
            farma.add(`AVK_${warf.name}`,
                `${warf.name}: SUSPENDER 5 dias antes. REQUIERE PUENTE con Heparina (Enoxaparina a dosis terapeutica o HNF IV). Riesgo trombotico alto (Valvula mecanica o CHA2DS2-VASc >= 6).`);
        } else {
            farma.add(`AVK_${warf.name}`,
                `${warf.name}: SUSPENDER 5 dias antes. NO requiere terapia puente. Verificar INR < 1.5 la manana del procedimiento.`);
        }
    });

    // --- Antiagregantes / Stent ---
    if (data.cardio_stent && data.stent_tipo === 'DES') {
        const stentDate = new Date(data.stent_fecha_colocacion || '2000-01-01');
        const diffMonths = (Date.now() - stentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

        if (diffMonths < 6) {
            farma.add('STENT_CRITICO',
                'ALERTA CRITICA: Portador de stent farmacoactivo reciente (< 6 meses). NO suspender doble antiagregacion plaquetaria (Aspirina + Clopidogrel). Riesgo altisimo de trombosis de stent intraoperatoria. Proceder solo si el beneficio quirurgico supera el riesgo vital cardiaco (ACC/AHA).');
        } else {
            farma.add('STENT_CHRONIC',
                'Portador de stent farmacoactivo (> 6 meses). Suspender inhibidor P2Y12 (Clopidogrel) 5 dias previos si el riesgo hemorragico lo amerita. Mantener Aspirina de forma ininterrumpida (ACC/AHA).');
        }
    }

    // --- GLP-1 ---
    const glp1 = meds.filter(m => m.isGLP1 ||
        ['semaglutida', 'liraglutida', 'dulaglutida', 'exenatida', 'tirzepatida']
            .some(g => m.name.toLowerCase().includes(g))
    );
    glp1.forEach(med => {
        const isWeekly = med.glp1Frequency === 'weekly' ||
            ['semaglutida', 'dulaglutida', 'tirzepatida'].some(g => med.name.toLowerCase().includes(g));
        if (isWeekly) {
            farma.add(`GLP1_${med.name}`,
                `${med.name}: SUSPENDER 1 semana antes del procedimiento. Riesgo de aspiracion por gastroparesia y estomago lleno (ASA 2023).`);
        } else {
            farma.add(`GLP1_DAILY_${med.name}`,
                `${med.name}: SUSPENDER el dia de la cirugia. Riesgo de aspiracion por retraso del vaciamiento gastrico.`);
        }
    });

    // --- Esteroides crónicos ---
    const steroids = meds.filter(m => m.isSteroid && m.isChronic);
    steroids.forEach(med => {
        farma.add(`STEROID_${med.name}`,
            `${med.name} (uso cronico): NO SUSPENDER. Administrar dosis de estres con Hidrocortisona IV segun riesgo quirurgico. ${med.stressDoseRecommendation || 'Valorar con Endocrinologia.'}`);
    });

    // --- Insulina ---
    if (isDiabetic && data.usaInsulina) {
        farma.add('INSULINA',
            'Insulina basal (Glargina/Detemir/Degludec): Administrar 80% de la dosis habitual la noche previa. Suspender insulina de accion rapida la manana de la cirugia. Monitorizar glucemia capilar cada 2 horas. Meta: 140-180 mg/dL.');
    } else if (isDiabetic) {
        farma.add('HGO',
            'Hipoglucemiantes orales: Suspender Metformina el dia de la cirugia. Suspender Sulfonilureas 24-48 horas previas. Monitorizar glucemia capilar cada 2 horas. Meta: 140-180 mg/dL.');
    }

    // --- AINES y Analgesia ---
    if (tfg < 30) {
        farma.add('AINE_RENAL',
            `AINEs CONTRAINDICADOS (TFG ${tfg} ml/min). Analgesia estrictamente con farmacos no nefrotoxicos: Paracetamol, Pregabalina/Gabapentina, Opioides a dosis ajustada.`);
    }

    // --- Litio ---
    const litio = meds.filter(m => m.name.toLowerCase().includes('litio') || m.category === 'Litio');
    litio.forEach(med => {
        farma.add('LITIO',
            `${med.name}: SUSPENDER 24-72 horas previas segun funcion renal. Verificar niveles sericos < 1.0 mEq/L. Potencia relajantes musculares. Riesgo de toxicidad por deshidratacion perioperatoria.`);
    });

    // --- Antiepilépticos ---
    const aep = meds.filter(m => m.category === 'Antiepiléptico');
    aep.forEach(med => {
        farma.add(`AEP_${med.name}`,
            `${med.name}: MANTENER estrictamente. Si ayuno prolongado, solicitar formulacion IV. Riesgo alto de crisis convulsivas por deprivacion.`);
    });

    // --- Antiparkinsonianos ---
    const apk = meds.filter(m => m.category === 'Antiparkinsoniano');
    apk.forEach(med => {
        farma.add(`APK_${med.name}`,
            `${med.name}: MANTENER hasta el momento de la cirugia. Reiniciar en cuanto tolere via oral. Riesgo de rigidez y Sindrome Neuroleptico Maligno si suspension abrupta.`);
    });

    // --- Inmunosupresores ---
    const immuno = meds.filter(m => m.category === 'Inmunosupresor');
    immuno.forEach(med => {
        farma.add(`IMMUNO_${med.name}`,
            `${med.name}: MANTENER estrictamente. Dosis matutina con sorbo de agua. Alto riesgo de rechazo de injerto o brote de enfermedad autoinmune si se suspende.`);
    });

    // --- Antirretrovirales ---
    const arv = meds.filter(m => m.category === 'Antirretroviral');
    arv.forEach(med => {
        farma.add(`ARV_${med.name}`,
            `${med.name}: MANTENER. Riesgo de rebote viral y resistencia si se suspende. Vida media critica, mantener horario estricto.`);
    });

    if (!farma.isEmpty()) {
        preSections.push(`4. MANEJO FARMACOLOGICO\n${farma.compile()}`);
    }

    // =========================================================================
    // SECCION 5: VIA AEREA Y ESTRATIFICACION CARDIOPULMONAR
    // Guías: ASA / ACC/AHA / STOP-BANG
    // =========================================================================
    const via = new SectionBuilder();

    if (stopBangHigh || imc > 35) {
        via.add('SAOS',
            `Riesgo elevado de SAOS${stopBangHigh ? ` (STOP-BANG ${data.stopbang_total} pts)` : ''} y via aerea dificil${imc > 35 ? ` (IMC ${imc})` : ''}. Prever uso de CPAP postoperatorio y evitar uso excesivo de opioides. Preferir analgesia multimodal (Paracetamol + Ketorolaco + Bloqueo Regional). Extubacion con paciente despierto.`);
    }

    if (cardioRiskHigh || metsLow) {
        const guptaStr = data.gupta ? `${data.gupta}%` : '';
        const metsStr = data.mets_estimated ? `${data.mets_estimated} METs` : '< 4 METs';
        via.add('MACE',
            `Riesgo cardiovascular perioperatorio incrementado${guptaStr ? ` (MACE Gupta: ${guptaStr})` : ''}${metsLow ? ` (Capacidad funcional: ${metsStr})` : ''}. Mantener normotension estricta y evitar taquicardia (FC < 80 lpm). Evitar anemia (mantener Hb segun meta). Monitoreo invasivo a consideracion de anestesiologia. Solicitar ECG y troponinas de alta sensibilidad en sala de recuperacion y a las 24 horas.`);
    }

    // Diabetes transoperatorio
    if (isDiabetic) {
        if (data.usaInsulina || imc > 35) {
            via.add('INSULINA_TRANS',
                'Mantener glucemia 140-180 mg/dL. Esquema de Insulina Rapida intraoperatorio (Perfil Resistente por IMC/Uso previo). Monitorizacion glucemica capilar cada 2 horas.');
        } else {
            via.add('INSULINA_TRANS_STD',
                'Mantener glucemia 140-180 mg/dL. Esquema de Insulina Rapida intraoperatorio (Perfil Sensible). Monitorizacion glucemica capilar cada 2 horas.');
        }
    }

    // Consideraciones hemodinámicas por beta-bloqueador
    if (betablockers.length > 0) {
        via.add('BB_TRANS',
            'Vigilar efectos bradicardizantes de beta-bloqueador en uso cronico. Mantener frecuencia cardiaca < 80 lpm. Evitar taquicardia e hipotension.');
    }

    // Stent transoperatorio
    if (data.cardio_stent && data.stent_tipo === 'DES') {
        const stentDate = new Date(data.stent_fecha_colocacion || '2000-01-01');
        const diffMonths = (Date.now() - stentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        if (diffMonths < 6) {
            via.add('STENT_TRANS',
                'Alto riesgo de trombosis intra-stent. Mantener normotension estricta. Evitar hipotension, taquicardia y anemia.');
        }
    }

    if (!via.isEmpty()) {
        transSections.push(`5. CONSIDERACIONES ANESTESICAS Y CARDIOPULMONARES\n${via.compile()}`);
    }

    // =========================================================================
    // SECCION POST: Analgesia y Reinicio
    // =========================================================================
    const postExtra = new SectionBuilder();

    // Glucemia postoperatoria
    if (isDiabetic) {
        postExtra.add('GLU_POST',
            'Mantener glucemia 140-180 mg/dL. Evitar hipoglucemia. Reiniciar dieta segun tolerancia y ajustar hipoglucemiantes orales o esquema subcutaneo basal/bolos.');
    } else {
        postExtra.add('GLU_POST_STD',
            'Meta de glucemia: 70-140 mg/dL.');
    }

    // Analgesia
    if (tfg < 30) {
        postExtra.add('ANALG_RENAL',
            `Analgesia condicionada a proteccion renal (TFG ${tfg} ml/min). Restringir AINEs. Privilegiar analgesia multimodal ahorradora de opioides: Paracetamol 1g IV cada 6-8h + Pregabalina/Gabapentina + Bloqueo regional si disponible.`);
    } else {
        postExtra.add('ANALG_STD',
            'Analgesia multimodal ahorradora de opioides guiada por Escala Visual Analoga (EVA). Paracetamol 1g IV cada 6-8h + AINE (si no contraindicado) + Bloqueo regional si disponible.');
    }

    // Reinicio de fármacos
    if (aceArbs.length > 0) {
        postExtra.add('REINICIO_IECA',
            `Reiniciar ${aceArbs.map(m => m.name).join('/')} a las 24-48 horas postoperatorias si tension arterial y funcion renal estables.`);
    }

    if (doacs.length > 0) {
        postExtra.add('REINICIO_DOAC',
            `Reiniciar ${doacs.map(m => m.name).join('/')} a las 48-72 horas postoperatorias si hemostasia adecuada y sin sangrado activo.`);
    }

    if (sglt2.length > 0) {
        postExtra.add('REINICIO_SGLT2',
            `Reiniciar ${sglt2.map(m => m.name).join('/')} unicamente cuando el paciente tolere via oral completa y se descarte cetoacidosis. Minimo 48 horas postoperatorias.`);
    }

    if (!postExtra.isEmpty()) {
        postSections.push(`6. ANALGESIA Y REINICIO FARMACOLOGICO\n${postExtra.compile()}`);
    }

    // =========================================================================
    // COMPILACIÓN FINAL
    // =========================================================================

    return {
        plan_pre: preSections.join('\n\n'),
        plan_trans: transSections.join('\n\n'),
        plan_post: postSections.join('\n\n'),
    };
};
