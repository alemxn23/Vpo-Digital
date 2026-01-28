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
}

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
        // Logic: Stop 24h before to prevent vasoplegia, UNLESS severe Heart Failure (HFrEF)
        if (patient.icc && patient.icc_nyha !== 'I') {
            // Complex case: HFrEF might need continuance to prevent afterload spike, 
            // BUT mainstream guideline is still STOP to prevent vasoplegia during induction.
            recommendation.action = 'stop';
            recommendation.daysPrior = 1;
            recommendation.instructions = "SUSPENDER 24h Antes. (Riesgo vasoplejía).";
            recommendation.rationale = "Evitar hipotensión refractaria intraoperatoria.";
        } else {
            recommendation.action = 'stop';
            recommendation.daysPrior = 1;
            recommendation.instructions = "SUSPENDER 24h Antes (Omitir dosis de la mañana).";
        }
    }

    // --- B: BLOOD / ANTICOAGULANTS ---
    if (med.isAnticoagulant) {
        // PAUSE Protocol Logic
        const bleedingRisk = getSurgicalBleedingRisk(patient);
        const crcl = patient.tfg || 90;

        if (med.anticoagType === 'DOAC') {
            // Basic PAUSE Logic
            let daysToStop = 1; // Low risk default (24h approx)

            if (bleedingRisk === 'high') {
                daysToStop = 2; // 48h
            }

            // Renal Adjustments
            if (med.id === 'dabi' && crcl < 50) {
                daysToStop += 2; // Dabigatran accumulates
            } else if (crcl < 30) {
                daysToStop += 1; // General safety for others
            }

            recommendation.daysPrior = daysToStop;
            recommendation.action = 'stop';
            recommendation.instructions = `SUSPENDER ${daysToStop} días antes (aprox ${daysToStop * 24}h).`;
            recommendation.rationale = `Riesgo Sangrado: ${bleedingRisk.toUpperCase()}. TFG: ${crcl.toFixed(0)}. Protocolo PAUSE.`;
        }

        if (med.anticoagType === 'AVK') { // Warfarin
            recommendation.daysPrior = 5;
            recommendation.action = 'stop';

            // Bridge Logic
            if (isHighThromboticRisk(patient)) {
                recommendation.bridgeRequired = true;
                recommendation.instructions = "Suspender 5 días antes. REQUIERE PUENTE con Heparina (Enoxaparina).";
                recommendation.rationale = "Alto Riesgo Trombótico (Válvula Mecánica/FA de alto riesgo).";
            } else {
                recommendation.instructions = "Suspender 5 días antes. NO requiere puente.";
                recommendation.rationale = "Bajo riesgo trombótico. Puenteo aumenta sangrado sin beneficio.";
            }
        }
    }

    if (med.category === 'Antiagregante') {
        // Stent Logic
        if (patient.cardiopatiaIsquemica && patient.cardio_stent) {
            const stentSafe = checkStentSafety(patient.stent_fecha_colocacion, patient.stent_tipo, patient.esUrgencia);

            if (!stentSafe.safe) {
                recommendation.alertLevel = 'red';
                recommendation.action = 'continue'; // Or POSTPONE
                recommendation.instructions = `¡ALERTA! ${stentSafe.message}. Si C.Electiva: POSPONER o Interconsulta Cardio. Si Urgencia: MANTENER DUAL (Riesgo sangrado alto aceptado).`;
            } else {
                // Safe to stop P2Y12?
                if (med.id === 'asa') {
                    recommendation.action = 'continue';
                    recommendation.instructions = "CONTINUAR AAS (Prevención Secundaria).";
                } else {
                    // P2Y12 (Clopidogrel etc)
                    recommendation.action = 'stop';
                    recommendation.daysPrior = med.daysPrior; // 5-7 days
                    recommendation.instructions = `Suspender ${med.daysPrior} días antes.`;
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
        recommendation.action = 'stop';
        if (med.glp1Frequency === 'weekly') {
            recommendation.daysPrior = 7;
            recommendation.instructions = "SUSPENDER 1 SEMANA ANTES.";
        } else {
            recommendation.daysPrior = 1;
            recommendation.instructions = "Suspender día de cirugía.";
        }
        recommendation.rationale = "Riesgo de aspiración por gastroparesia (Estómago lleno).";
    }

    return recommendation;
};

// --- HELPER FUNCTIONS ---

const getSurgicalBleedingRisk = (patient: VPOData): 'low' | 'high' => {
    // Simplified mapping based on Gupta site or procedure text
    // ideally this would be a more granular selector in the UI

    const highRiskSites = ['intracranial', 'spinal', 'cardiac', 'vascular', 'urologic', 'bariatric'];
    if (highRiskSites.includes(patient.gupta_surgical_site)) return 'high';

    return 'low'; // Default for most general
};

const isHighThromboticRisk = (patient: VPOData): boolean => {
    // CHADS > 4, Mechanical Valve, Recent VTE
    if (patient.valvulopatia && patient.valvula_patologia === 'estenosis' && patient.valvula_severidad === 'severa') return true;
    if (patient.icc) return true; // simplified proxy
    // Todo: Add explicit inputs for Mechanical Valve / VTE history
    return false;
};

const checkStentSafety = (dateStr: string, type: 'BMS' | 'DES', isUrgent: boolean): { safe: boolean, message: string } => {
    if (!dateStr) return { safe: true, message: "" };

    const stentDate = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - stentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = diffDays / 30;

    if (type === 'BMS' && diffDays < 30) {
        return { safe: false, message: "Stent Metálico < 30 días. Riesgo Trombosis Altísimo." };
    }
    if (type === 'DES' && diffMonths < 6) {
        return { safe: false, message: "Stent Farmacoactivo < 6 meses. Riesgo Trombosis Alto." };
    }

    return { safe: true, message: "Stent endotelizado (> tiempo seguridad)." };
};
