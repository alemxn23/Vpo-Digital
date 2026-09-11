import { SelectedMed, VPOData } from '../types';

/**
 * PHARMACOLOGY ENGINE
 * Central logic for per-medication recommendations based on patient factors.
 */

export interface MedicationRecommendation {
    medId: string;
    action: 'stop' | 'continue' | 'adjust';
    daysPrior: number;
    hoursPrior?: number; // More precise
    alertLevel: 'green' | 'yellow' | 'red';
    instructions: string;
    rationale: string;
    bridgeRequired?: boolean;
    stressDoseRecommendation?: string;
}

/**
 * Texto uniforme para la ventana de suspensión. Evita etiquetas como "1.5 días" cuando
 * la recomendación se expresó en horas, y "0 días" cuando se trata de omitir la dosis matutina.
 */
export const formatStopWindow = (rec: { action: string; daysPrior?: number; hoursPrior?: number }): string => {
    if (rec.action === 'continue') return 'Continuar';
    if (rec.action === 'adjust') return 'Modificar dosis';
    const hours = typeof rec.hoursPrior === 'number' ? rec.hoursPrior : (rec.daysPrior ?? 0) * 24;
    if (hours <= 0) return 'Omitir dosis el día de la cirugía';
    if (hours < 48 || hours % 24 !== 0) return `Suspender ${hours}h antes`;
    return `Suspender ${hours / 24} días antes`;
};

export const getMedicationRecommendation = (med: SelectedMed, patient: VPOData): MedicationRecommendation => {
    // 1. DEFAULT VALUES (From DB)
    let recommendation: MedicationRecommendation = {
        medId: med.id,
        action: med.action,
        daysPrior: med.daysPrior,
        alertLevel: med.alertLevel,
        instructions: med.instructions,
        rationale: "Protocolo estándar.",
        bridgeRequired: false
    };

    // 2. LOGIC BY ATC GROUP

    // --- C: CARDIOVASCULAR ---
    if (med.atcCode?.startsWith('C07')) { // Beta-blockers
        // Logic: Continue if chronic, Stop if naive (but we assume chronic in med rec list usually)
        // If HR < 50 or SBP < 100 check is done at administration time (Instruction level)
        recommendation.action = 'continue';
        recommendation.alertLevel = 'green';
        recommendation.instructions = "CONTINUAR. Incluir dosis la mañana de la cirugía con sorbo de agua.";
        recommendation.rationale = "Prevención de isquemia de rebote. Suspender solo si Hipotensión/Bradicardia severa.";
    }

    if (med.atcCode?.startsWith('C09')) { // ACE inhibitors / ARBs
        // ACC/AHA 2024: en HTA controlada es razonable omitir la dosis 24 h antes para limitar la
        // hipotensión a la inducción; en insuficiencia cardiaca con FE reducida es razonable
        // CONTINUARLOS (el riesgo de descompensación supera al de vasoplejía). ESC 2022 coincide:
        // omitir el día de la cirugía sólo en pacientes sin IC.
        const feviConocida = typeof patient.eco_fevi === 'number' && patient.eco_fevi > 0;
        const hfref = !!patient.icc && (!feviConocida || patient.eco_fevi <= 40);

        if (hfref) {
            recommendation.action = 'continue';
            recommendation.alertLevel = 'yellow';
            recommendation.daysPrior = 0;
            recommendation.hoursPrior = 0;
            recommendation.instructions = feviConocida
                ? `CONTINUAR (IC con FEVI ${patient.eco_fevi}%). Vigilar hipotensión a la inducción; reiniciar dosis plena al recuperar estabilidad hemodinámica.`
                : "CONTINUAR (insuficiencia cardiaca; FEVI no registrada, se asume FE reducida). Vigilar hipotensión a la inducción.";
            recommendation.rationale = "ACC/AHA 2024: en HFrEF es razonable continuar IECA/ARA-II perioperatoriamente.";
        } else {
            recommendation.action = 'stop';
            recommendation.daysPrior = 1;
            recommendation.hoursPrior = 24;
            recommendation.instructions = "SUSPENDER 24h antes (omitir la dosis de la mañana). Reiniciar en cuanto haya estabilidad hemodinámica y vía oral (idealmente < 48 h).";
            recommendation.rationale = "Limitar hipotensión refractaria a la inducción (vasoplejía). ACC/AHA 2024.";
        }
    }

    // --- B: BLOOD / ANTICOAGULANTS ---
    if (med.isAnticoagulant) {
        // PAUSE Protocol Logic
        const bleedingRisk = getSurgicalBleedingRisk(patient);
        const crcl = patient.tfg || 90;

        if (med.anticoagType === 'DOAC') {
            // Protocolo PAUSE (Douketis, JAMA Intern Med 2019), endosado por ACC/AHA 2024:
            //   Apixabán / rivaroxabán / edoxabán: bajo riesgo 1 día, alto riesgo 2 días. SIN ajuste por TFG.
            //   Dabigatrán TFG >= 50: 1 / 2 días.  TFG 30-49: 2 / 4 días.  TFG < 30: contraindicado.
            // Reinicio: 1 día tras bajo riesgo, 2-3 días tras alto riesgo. Nunca puente.
            const isDabi = med.id === 'dabi';
            const high = bleedingRisk === 'high';
            let daysToStop: number;
            let renalNote = '';

            if (!isDabi) {
                daysToStop = high ? 2 : 1;
                if (crcl < 30) {
                    recommendation.alertLevel = 'red';
                    renalNote = ' TFG < 30: fuera del rango validado por PAUSE (los ensayos excluyeron TFG < 25-30); considerar prolongar la suspensión y valorar con hematología.';
                }
            } else {
                if (crcl >= 50) daysToStop = high ? 2 : 1;
                else if (crcl >= 30) daysToStop = high ? 4 : 2;
                else {
                    daysToStop = high ? 4 : 2;
                    recommendation.alertLevel = 'red';
                    renalNote = ' TFG < 30: dabigatrán CONTRAINDICADO; acumulación impredecible. Interconsulta a hematología, considerar TTPa/tiempo de trombina diluido antes de la cirugía.';
                }
            }

            const restart = high ? '48-72 h' : '24 h';
            recommendation.daysPrior = daysToStop;
            recommendation.hoursPrior = daysToStop * 24;
            recommendation.action = 'stop';
            recommendation.instructions = `SUSPENDER ${daysToStop} ${daysToStop === 1 ? 'día' : 'días'} antes (${daysToStop * 24}h). Reiniciar ${restart} después de la cirugía una vez asegurada la hemostasia, sin dosis de carga. NO requiere puente.${renalNote}`;
            recommendation.rationale = `Protocolo PAUSE. Riesgo de sangrado quirúrgico: ${bleedingRisk.toUpperCase()}. TFG: ${crcl.toFixed(0)} ml/min.`;
        }

        if (med.anticoagType === 'AVK') { // Warfarin
            recommendation.daysPrior = 5;
            recommendation.action = 'stop';

            // Bridge Logic
            if (isHighThromboticRisk(patient)) {
                recommendation.bridgeRequired = true;
                recommendation.instructions = "Suspender 5 días antes. REQUIERE PUENTE con Heparina (Enoxaparina).";
                recommendation.rationale = "Alto Riesgo Trombótico (Válvula Mecánica, FA CHA₂DS₂-VASc ≥ 6, o EVC reciente).";
            } else {
                recommendation.instructions = "Suspender 5 días antes. NO requiere puente.";
                recommendation.rationale = "Bajo riesgo trombótico. Puenteo aumenta sangrado sin beneficio.";
            }
        }

        if (med.anticoagType === 'HBPM') { // Enoxaparina y otras heparinas de bajo peso molecular
            // Consenso SEC/SEDAR 2025 y ACCP: dosis terapéutica → última dosis 24 h antes A LA MITAD de la
            // dosis diaria (si es BID, omitir la dosis vespertina del día previo). Dosis profiláctica → 12 h.
            // Sin campo que distinga la intención de dosis, el motor asume terapéutica (conservador).
            // TFG < 30: el problema es la ACUMULACIÓN → ajustar dosis (1 mg/kg c/24 h) o cambiar a HNF,
            // no simplemente alargar el intervalo.
            const renalImpaired = crcl < 30;

            recommendation.action = 'stop';
            recommendation.daysPrior = 1;
            recommendation.hoursPrior = 24;
            recommendation.alertLevel = renalImpaired ? 'red' : 'yellow';
            recommendation.instructions = `Dosis terapéutica: última dosis 24h antes, a la MITAD de la dosis habitual (si BID, omitir la dosis vespertina del día previo). Dosis profiláctica: última dosis 12h antes.${renalImpaired ? ` TFG ${crcl.toFixed(0)} ml/min: ajustar a 1 mg/kg c/24h o cambiar a heparina no fraccionada por riesgo de acumulación; considerar anti-Xa si disponible.` : ''}`;
            recommendation.rationale = `Riesgo de sangrado quirúrgico: ${bleedingRisk.toUpperCase()}. TFG: ${crcl.toFixed(0)} ml/min.`;
        }
    }

    if (med.category === 'Antiagregante') {
        // Stent Logic
        if (patient.cardiopatiaIsquemica && patient.cardio_stent) {
            const stentSafe = checkStentSafety(patient.stent_fecha_colocacion, patient.stent_tipo, patient.stent_indicacion, patient.esUrgencia);

            if (!stentSafe.safe) {
                recommendation.alertLevel = 'red';
                recommendation.action = 'continue';
                recommendation.daysPrior = 0;
                recommendation.hoursPrior = 0;
                recommendation.instructions = patient.esUrgencia
                    ? `¡ALERTA! ${stentSafe.message} Cirugía urgente: MANTENER terapia antiagregante dual (riesgo de sangrado aceptado); si es imprescindible suspender el P2Y12, mantener AAS y reiniciar en < 24-48h.`
                    : `¡ALERTA! ${stentSafe.message} Cirugía electiva: POSPONER${stentSafe.timeSensitiveOk ? ' (si es tiempo-sensible, puede considerarse con decisión compartida cardiología-cirugía, manteniendo AAS)' : ''} e interconsulta a cardiología.`;
                recommendation.rationale = "ACC/AHA 2024: riesgo de trombosis del stent.";
            } else {
                // Safe to stop P2Y12?
                if (med.id === 'asa') {
                    recommendation.action = 'continue';
                    recommendation.daysPrior = 0;
                    recommendation.hoursPrior = 0;
                    recommendation.instructions = "CONTINUAR AAS (prevención secundaria). Suspender sólo en neurocirugía / cirugía de canal medular.";
                } else {
                    // P2Y12 (Clopidogrel etc)
                    recommendation.action = 'stop';
                    recommendation.daysPrior = med.daysPrior;
                    recommendation.hoursPrior = (med.daysPrior ?? 0) * 24;
                    recommendation.instructions = `Suspender ${med.daysPrior} días antes. Mantener AAS. Reiniciar 24-72h después según hemostasia (con dosis de carga si persiste indicación de DAPT).`;
                }
            }
        }
    }

    // --- A: ALIMENTARY / METABOLISM ---
    if (med.category === 'iSGLT2') {
        recommendation.action = 'stop';
        recommendation.daysPrior = 3; // FDA update 2024
        if (med.id === 'ertu') recommendation.daysPrior = 4;
        recommendation.instructions = `SUSPENDER ${recommendation.daysPrior} DÍAS ANTES.`;
        recommendation.rationale = "Prevención cetoacidosis euglucémica perioperatoria.";
    }

    if (med.isGLP1) {
        // Guía multisociedad ASA/AGA/ASMBS/SAGES/ISPCOP (oct 2024): la MAYORÍA continúa el GLP-1.
        // Sólo con factores de riesgo de retraso en vaciamiento gástrico (fase de escalada de dosis,
        // síntomas GI activos, comorbilidad que retrasa el vaciamiento) se indica dieta líquida clara
        // 24 h previas y se avisa a anestesiología (estómago lleno / ultrasonido gástrico es decisión suya).
        // Reemplaza la guía ASA de junio 2023 (suspender 1 semana / el día de la cirugía).
        const riskFactors: string[] = [];
        if (med.glp1EscalationPhase) riskFactors.push('inicio o aumento de dosis en las últimas 4-8 semanas');
        if (med.glp1GiSymptoms) riskFactors.push('síntomas gastrointestinales activos');
        if (patient.diabetes && patient.diabetesTiempo && Number(patient.diabetesTiempo) >= 10) riskFactors.push('diabetes de larga evolución (posible gastroparesia)');

        recommendation.action = 'continue';
        recommendation.daysPrior = 0;
        recommendation.hoursPrior = 0;

        if (riskFactors.length === 0) {
            recommendation.alertLevel = 'green';
            recommendation.instructions = "CONTINUAR. Sin factores de riesgo de retraso en vaciamiento gástrico: ayuno estándar.";
            recommendation.rationale = "Guía multisociedad 2024 (ASA/AGA/ASMBS/SAGES): la mayoría de los pacientes continúa el agonista GLP-1.";
        } else {
            recommendation.alertLevel = 'yellow';
            recommendation.instructions = `CONTINUAR, pero indicar DIETA LÍQUIDA CLARA las 24h previas y notificar a anestesiología riesgo de estómago lleno (${riskFactors.join('; ')}).${!patient.esUrgencia && (med.glp1EscalationPhase || med.glp1GiSymptoms) ? ' Cirugía electiva: valorar diferir hasta completar la escalada de dosis y resolver síntomas.' : ''}`;
            recommendation.rationale = "Riesgo de retraso en vaciamiento gástrico. Guía multisociedad 2024.";
        }
    }

    // --- H: CORTICOSTEROIDES & HORMONAS ---
    if (med.isSteroid) {
        if (med.isChronic) {
            recommendation.alertLevel = 'yellow';
            recommendation.action = 'adjust';
            const stressDose = calculateStressDose(patient, med);
            recommendation.instructions = stressDose;
            recommendation.stressDoseRecommendation = stressDose;
            recommendation.rationale = "Uso crónico (>3 sem/dosis altas). Riesgo insuficiencia adrenal aguda.";
        } else {
            recommendation.alertLevel = 'green';
            recommendation.action = 'continue'; // Or adjust? Usually continue basal or just stop if short course.
            recommendation.instructions = "No requiere dosis de estrés si uso < 3 semanas.";
            recommendation.rationale = "Eje HHA íntegro probable.";
        }
    }

    // --- N: NEUROLOGY / PSYCHIATRY ---
    if (med.category === 'Antiepiléptico') {
        recommendation.alertLevel = 'green';
        recommendation.action = 'continue';
        recommendation.instructions = "CONTINUAR ESTRICTAMENTE. Si ayuno prolongado, rotar a IV.";
        recommendation.rationale = "Riesgo alto de crisis convulsivas por deprivación.";
    }

    if (med.category === 'Antiparkinsoniano') {
        recommendation.alertLevel = 'green';
        recommendation.action = 'continue';
        recommendation.instructions = "CONTINUAR hasta momento de cirugía. Reiniciar en cuanto tolere vía oral.";
        recommendation.rationale = "Riesgo de rigidez/Síndrome Neuroléptico Maligno si suspensión abrupta.";
    }

    if (med.category === 'Antipsicótico') {
        if (med.id === 'cloza') { // Clozapine
            recommendation.alertLevel = 'yellow';
            recommendation.action = 'continue';
            recommendation.instructions = "CONTINUAR. Vigilar ileo postoperatorio (riesgo aumentado).";
            recommendation.rationale = "Riesgo agranulocitosis (no suspender monitorización) y rebote psicótico.";
        } else {
            recommendation.action = 'continue';
            recommendation.instructions = "CONTINUAR. Precaución QT prolongado con anestésicos.";
        }
    }

    if (med.category === 'Litio') {
        recommendation.alertLevel = 'red';
        recommendation.action = 'stop';
        recommendation.daysPrior = 1; // 24-72h depending on renal. 1 day safe default.
        recommendation.instructions = "SUSPENDER 24-72h antes (Según función renal). Niveles < 1.0 mEq/L.";
        recommendation.rationale = "Potencia relajantes musculares. Riesgo toxicidad renal/deshidratación.";
    }

    // --- J: ANTIINFECCIOSOS (High Risk) ---
    if (med.category === 'Antirretroviral') {
        recommendation.alertLevel = 'green';
        recommendation.action = 'continue';
        recommendation.instructions = "CONTINUAR. Riesgo de rebote viral y resistencia si se suspende.";
        recommendation.rationale = "Vida media crítica. Mantener horario estricto.";
    }

    // --- L: IMMUNOSUPPRESSANTS / ANTINEOPLASTIC ---
    if (med.category === 'Inmunosupresor') {
        recommendation.alertLevel = 'green';
        recommendation.action = 'continue';
        recommendation.instructions = "CONTINUAR ESTRICTAMENTE. Dosis matutina con poco agua.";
        recommendation.rationale = "Alto riesgo de rechazo de injerto (Trasplante) o brote (Autoinmune).";
    }

    return recommendation;
};

export const calculateStressDose = (patient: VPOData, med: SelectedMed): string => {
    const site = patient.gupta_surgical_site || 'minor';
    let risk = 'minor';

    // Risk Categorization
    const modRisk = ['abdominal', 'orthopedic', 'spine', 'head-neck', 'urologic', 'gynecologic'];
    const highRisk = ['cardiac', 'aortic', 'transplant', 'esopha', 'pneumonectomy'];

    if (modRisk.some(r => site.includes(r))) risk = 'moderate';
    if (highRisk.some(r => site.includes(r))) risk = 'severe';
    if (patient.capB_cxMayor) risk = 'moderate'; // Default major

    const weight = patient.peso || 70;

    // 1. Calculate Patient's Current Home Dose Equivalent
    const homeEquiv = calculateHydrocortisoneEquivalent(med);
    let equivMsg = "";
    if (homeEquiv > 0) {
        equivMsg = ` (Tu dosis actual equivale a aprox. ${homeEquiv.toFixed(0)}mg de Hidrocortisona/día).`;
    }

    // 2. Define Target Stress Requirement (Total Daily Hydrocortisone)
    let targetDailyHydro = 25; // Minor
    if (risk === 'moderate') targetDailyHydro = 75; // 50 ind + 25 maintenance (approx)
    if (risk === 'severe') targetDailyHydro = 150; // 100 ind + 50 maintenance (approx)

    // 3. Compare and Recommend
    // If home dose is significantly higher than stress dose, we might need to match it to prevent insufficiency relative to their baseline.
    // "Sick Day" / Stress rules: If already on high dose, maintain usually sufficient, but if super high stress, adding basal + stress might be needed.
    // Current consensus: If on supraphysiologic dose > stress dose, just CONTINUE current dose (convert to IV) + consider small boost if unstable.

    let recommendation = "";

    if (homeEquiv > targetDailyHydro) {
        // Patient takes MORE than the stress dose normally.
        // Recommendation: Maintain equivalent dose IV.
        // Example: Patient takes 200mg Hydro equiv. Stress dose is 100mg. 
        // We should NOT reduce them to 100mg.
        const ivDose = Math.ceil(homeEquiv / 3); // Split q8h
        recommendation = `Dosis basal ALTA${equivMsg}. NO REDUCIR DOSIS. Administrar equiv. a Hidrocortisona ${ivDose}mg IV c/8h.`;
    } else {
        // Standard Stress Dose Logic override
        let hydroDose = '25mg';
        let maintainDose = 'Dosis usual';

        if (risk === 'severe') { // Major Surgery
            hydroDose = '100mg';
            maintainDose = '50mg IV c/8h'; // Total ~250mg 1st 24h
        } else if (risk === 'moderate') { // Moderate Surgery
            hydroDose = '50mg';
            maintainDose = '25mg IV c/8h'; // Total ~125mg 1st 24h
        } else {
            // Minor Surgery
            // Sick day rule: double dose?
            // Or standard 25mg induction.
            if (homeEquiv > 0) {
                recommendation = `Riesgo Menor${equivMsg}. Opción 1: Duplicar dosis habitual VO por 24h. Opción 2: Hidrocortisona 25mg IV inducción + Dosis habitual.`;
                return recommendation;
            }
            hydroDose = '25mg';
        }

        recommendation = `Inducción: Hidrocortisona ${hydroDose} IV. Mantenimiento: ${maintainDose} por 24h, luego reducir.`;
        if (homeEquiv > 0) recommendation += equivMsg;
    }

    return recommendation;
};

const calculateHydrocortisoneEquivalent = (med: SelectedMed): number => {
    // Potency relative to Hydrocortisone (1)
    // Prednisone: 4
    // Prednisolone: 4
    // Methylprednisolone: 5
    // Dexamethasone: 25
    // Deflazacort: ~3 (6mg Def = 5mg Pred = 20mg Hydro) -> 20/6 = 3.33
    // Betamethasone: 25

    // Hydrocortisone: 1

    const dose = med.dose || med.steroidDose || 0;
    if (!dose) return 0;

    const name = med.name.toLowerCase();

    if (name.includes('prednisona') || name.includes('prednisolone')) return dose * 4;
    if (name.includes('metilprednisolona') || name.includes('methylprednisolone')) return dose * 5;
    if (name.includes('dexametasona') || name.includes('dexamethasone')) return dose * 25;
    if (name.includes('betametasona')) return dose * 25;
    if (name.includes('deflazacort')) return dose * 3.33;
    if (name.includes('hidrocortisona') || name.includes('hydrocortisone')) return dose * 1;

    return 0;
};

const getSurgicalBleedingRisk = (patient: VPOData): 'low' | 'high' => {
    // PAUSE / EHA Mapping
    const highRiskSites = [
        'intracranial', 'spinal', 'cardiac', 'vascular', 'aortic',
        'thoracic', 'abdominal', 'orthopedic', 'urologic', 'bariatric', 'reconstructive'];

    // Check Gupta Site or Ariscat Incision (Proxy for cavity surgery)
    if (highRiskSites.includes(patient.gupta_surgical_site)) return 'high';
    if (patient.capB_cxMayor) return 'high'; // Major surgery generic flag

    return 'low'; // Default for peripheral/minor/ophthalmic
};

const isHighThromboticRisk = (patient: VPOData): boolean => {
    // 1. Mechanical Valve (Mitral/Aortic check needs strict valve type, assuming 'valvula_protesis' implies checks)
    if (patient.valvula_protesis) return true; // Simplified: Any prosthesis is high risk for now (or at least needs bridge eval)

    // 2. Atrial Fibrillation High Risk
    if ((patient.arritmias && patient.arritmia_tipo === 'fa') || patient.ecg_ritmo_especifico === 'FA') {
        if (patient.cha2ds2vasc >= 6) return true;
        if (patient.evc && getMonthsDiff(patient.evc_fecha) < 3) return true; // Recent stroke
    }

    // 3. Recent VTE (< 3 months) - check Caprini history or new field
    // (patient.capD_evc || patient.capC_historiaTVP) && recent... (Not easily available dates for VTE, defaulting safe)

    return false;
};

// Helper for date diff inside this scope
const getMonthsDiff = (dateString: string) => {
    if (!dateString) return 999;
    const now = new Date();
    const event = new Date(dateString);
    let months = (now.getFullYear() - event.getFullYear()) * 12;
    months -= event.getMonth();
    months += now.getMonth();
    return months <= 0 ? 0 : months;
};

const checkStentSafety = (
    dateStr: string,
    type: 'BMS' | 'DES',
    indication: 'sca' | 'cronica' | '' | undefined,
    _isUrgent: boolean // el mensaje urgente/electivo se arma en el llamador
): { safe: boolean, message: string, timeSensitiveOk: boolean } => {
    if (!dateStr) return { safe: true, message: "", timeSensitiveOk: true };

    const stentDate = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil(Math.abs(today.getTime() - stentDate.getTime()) / (1000 * 60 * 60 * 24));
    const diffMonths = diffDays / 30.44;

    // ACC/AHA 2024: BMS ≥ 30 días; DES por SCA ≥ 12 meses; DES por enfermedad coronaria crónica ≥ 6 meses;
    // cirugía tiempo-sensible tras DES puede considerarse ≥ 3 meses. Sin indicación registrada se asume SCA
    // (el escenario más conservador).
    if (type === 'BMS') {
        if (diffDays < 30) return { safe: false, message: "Stent metálico < 30 días. Riesgo de trombosis muy alto.", timeSensitiveOk: false };
        return { safe: true, message: "Stent metálico endotelizado (> 30 días).", timeSensitiveOk: true };
    }

    const isChronic = indication === 'cronica';
    const requiredMonths = isChronic ? 6 : 12;
    const label = isChronic ? 'enfermedad coronaria crónica' : (indication === 'sca' ? 'síndrome coronario agudo' : 'indicación no registrada, se asume SCA');

    if (diffMonths < requiredMonths) {
        return {
            safe: false,
            message: `Stent farmacoactivo de ${Math.floor(diffMonths)} meses por ${label}: la cirugía electiva debe diferirse ≥ ${requiredMonths} meses.`,
            timeSensitiveOk: diffMonths >= 3
        };
    }
    return { safe: true, message: `Stent farmacoactivo > ${requiredMonths} meses (${label}).`, timeSensitiveOk: true };
};
