import { VPOData, SelectedMed } from '../types';
import { getMedicationRecommendation, getSurgicalBleedingRisk } from '../custom_services/PharmacologyEngine';

class RulesEngine {
    pre: string[] = [];
    trans: string[] = [];
    post: string[] = [];

    addPre(rule: string) {
        if (!this.pre.includes(rule)) this.pre.push(rule);
    }
    addTrans(rule: string) {
        if (!this.trans.includes(rule)) this.trans.push(rule);
    }
    addPost(rule: string) {
        if (!this.post.includes(rule)) this.post.push(rule);
    }
}

export const generateRecommendations = (data: VPOData): {
    plan_pre: string;
    plan_trans: string;
    plan_post: string;
} => {
    const rules = new RulesEngine();

    // ============================================================================
    // 1. AYUNO Y VIA AEREA
    // ============================================================================
    if (data.esUrgencia) {
        rules.addPre("Cirugía de urgencia: ayuno no garantizado. Informar al equipo anestésico el riesgo de estómago lleno.");
    } else {
        rules.addPre("Ayuno estándar: líquidos claros hasta 2 horas antes; sólidos 6 a 8 horas antes (según protocolo del servicio de anestesiología).");
    }

    if (data.diabetes) {
        rules.addPre("Paciente diabético: Restringir carga preoperatoria de carbohidratos. Programar cirugía a primera hora del día de ser posible.");
    }

    // ============================================================================
    // 2. RIESGO NEFROLOGICO Y FLUIDOS
    // ============================================================================
    if (data.tfg && data.tfg < 60) {
        const severity = data.tfg < 30 ? "severo" : "moderado";
        rules.addPre(`Ajustar dosis de fármacos de excreción renal por TFG calculada de ${data.tfg.toFixed(1)} ml/min (deterioro ${severity}). Evitar uso de medios de contraste iodados y AINEs.`);
        rules.addTrans(`Paciente con TFG de ${data.tfg.toFixed(1)} ml/min (${severity}): se sugiere evitar hipotensión sostenida (PAM > 65 mmHg), nefrotóxicos y medio de contraste; vigilancia estricta de diuresis.`);
        rules.addPost("Monitorear creatinina sérica y volumen urinario postoperatorio.");
    }

    // ============================================================================
    // 3. RIESGO CARDIOVASCULAR
    // ============================================================================
    if (data.icc || data.cardiopatiaIsquemica || data.cardio_stent) {
        rules.addTrans("Riesgo cardiovascular aumentado: se sugiere evitar hipotensión sostenida (descenso de PAM > 20% de la basal) y taquicardia; monitorización electrocardiográfica con análisis del segmento ST.");

    }

    if (data.hta_control === 'descontrolada' || (data.taSistolica && data.taSistolica > 160)) {
        rules.addPre("Hipertensión descontrolada: Optimizar control de tensión arterial previo al evento. Meta tensional < 140/90 mmHg.");
    }

    if (data.arritmias) {
        rules.addPre("Arritmia basal: Evaluar necesidad de corrección hidroelectrolítica preoperatoria (K+, Mg2+).");
        rules.addTrans("Arritmia basal: se sugiere monitorización continua del ritmo durante el procedimiento y en recuperación.");
    }

    // ============================================================================
    // 4. MANEJO FARMACOLOGICO (Vía PharmacologyEngine)
    // ============================================================================
    if (data.selectedMeds && data.selectedMeds.length > 0) {
        data.selectedMeds.forEach((med: SelectedMed) => {
            const medRec = getMedicationRecommendation(med, data);
            
            // Translate the action and instructions to formal medical tone
            let text = "";
            let actionText = "";

            if (medRec.action === 'stop') {
                const hours = typeof medRec.hoursPrior === 'number' ? medRec.hoursPrior : medRec.daysPrior * 24;
                actionText = hours <= 0
                    ? 'Omitir la dosis el día del procedimiento'
                    : `Suspender fármaco ${hours} horas previas al procedimiento`;
            } else if (medRec.action === 'continue') {
                actionText = `Mantener tratamiento ininterrumpido`;
            } else {
                actionText = `Ajustar dosificación`;
            }

            // Extract numeric values from generic instructions like "SUSPENDER 72h Antes" if present, but use the structured data better
            // Translate old alert strings to formal medical tone
            let formalizedRationale = medRec.rationale
                .replace(/Ojo con/i, 'Vigilar')
                .replace(/Riesgo/i, 'Riesgo');

            let formalizedInstruction = medRec.instructions
                .replace(/DÍAS/i, 'días')
                .replace(/DÍA/i, 'día')
                .replace(/HORAS/i, 'horas')
                .replace(/SUSPENDER/ig, 'Suspender')
                .replace(/MANTENER/ig, 'Mantener')
                .replace(/CONTINUAR/ig, 'Continuar')
                .replace(/ALERTA/ig, 'Precaución clínica')
                .replace(/NO REQUIERE PUENTE/ig, 'No requiere terapia puente')
                .replace(/REQUIERE PUENTE/ig, 'Requiere terapia puente');

            const instr = formalizedInstruction.trim().replace(/\.+$/, '');
            const isDefaultRationale = /^Protocolo estándar\.?$/i.test(formalizedRationale.trim());
            const rationale = formalizedRationale.trim().replace(/\.+$/, '');
            text = `[${med.name.toUpperCase()}] ${actionText}. Indicación específica: ${instr}.${isDefaultRationale ? '' : ` Justificación: ${rationale}.`}`;
            
            rules.addPre(text);

            if (med.isSteroid && med.isChronic) {
                rules.addTrans(`[${med.name.toUpperCase()}] Uso crónico de corticoide: administrar dosis de estrés con hidrocortisona intravenosa según la pauta indicada en el plan preoperatorio.`);
            }
        });
    }

    if (data.diabetes && data.usaInsulina) {
        rules.addPre("Uso de Insulina: Ajustar dosis basal a administrar la noche previa (75-80% de dosis habitual). Suspender bolos preprandiales matutinos el día de la cirugía.");
        rules.addTrans("Paciente insulinodependiente: meta glucémica perioperatoria de 140-180 mg/dL; se sugiere glucemia capilar cada 1-2 horas durante el procedimiento.");
    }

    if (data.alergicos && data.alergicosDetalle) {
        rules.addPre(`Alerta por Alergia conocida: ${data.alergicosDetalle}. Evitar administración absoluta e indicar en expediente clínico.`);
    }

    // ============================================================================
    // 4b. PLAN DE REINICIO POSOPERATORIO (a cargo de medicina interna)
    // ============================================================================
    if (data.selectedMeds && data.selectedMeds.length > 0) {
        const bleedingRisk = getSurgicalBleedingRisk(data);
        const highBleed = bleedingRisk === 'high';
        const stentRecent = !!data.cardio_stent;

        data.selectedMeds.forEach((med: SelectedMed) => {
            const rec = getMedicationRecommendation(med, data);
            const name = med.name.toUpperCase();

            if (med.isAnticoagulant && med.anticoagType === 'DOAC') {
                rules.addPost(`[${name}] Reiniciar ${highBleed ? '48-72 horas' : '24 horas'} después de la cirugía una vez asegurada la hemostasia, a la dosis habitual sin carga. Mientras tanto, tromboprofilaxis con HBPM a dosis profiláctica si el riesgo tromboembólico lo justifica.`);
            } else if (med.isAnticoagulant && med.anticoagType === 'AVK') {
                rules.addPost(`[${name}] Reiniciar la noche de la cirugía o a las 24 horas a la dosis habitual (sin carga).${rec.bridgeRequired ? ' Continuar puente con HBPM terapéutica desde 48-72 horas (según hemostasia) hasta INR en rango.' : ''}`);
            } else if (med.isAnticoagulant && med.anticoagType === 'HBPM') {
                rules.addPost(`[${name}] Reiniciar dosis terapéutica a las ${highBleed ? '48-72' : '24'} horas con hemostasia asegurada; dosis profiláctica puede reanudarse a las 12-24 horas.`);
            } else if (med.category === 'Antiagregante' && rec.action === 'stop') {
                rules.addPost(`[${name}] Reiniciar 24-72 horas después según hemostasia${stentRecent ? ', con dosis de carga por portador de stent' : ''}.`);
            } else if (med.category === 'Antiagregante' && med.id === 'asa') {
                rules.addPost(`[${name}] Continuar sin interrupción; si se omitió alguna dosis, reanudar en cuanto exista hemostasia (< 24 horas).`);
            } else if (med.category === 'iSGLT2') {
                rules.addPost(`[${name}] Reiniciar al reanudar la dieta oral normal y descartar cetoacidosis (típicamente 24-48 horas después).`);
            } else if (med.id === 'metf') {
                rules.addPost(`[${name}] Reiniciar con dieta oral y función renal estable (creatinina de control); posponer si hubo contraste o hipoperfusión.`);
            } else if (med.atcCode?.startsWith('C09') && rec.action === 'stop') {
                rules.addPost(`[${name}] Reiniciar en cuanto haya estabilidad hemodinámica y tolerancia a la vía oral, idealmente antes de 48 horas.`);
            }
        });
    }

    // ============================================================================
    // 4c. VIGILANCIA DE LESIÓN MIOCÁRDICA POSOPERATORIA (MINS) — ACC/AHA 2024 / ESC 2022
    // ============================================================================
    const highRiskSurgery = data.capB_cxMayor || ['aortic', 'vascular', 'thoracic', 'intracranial', 'cardiac', 'amputation'].includes(data.gupta_surgical_site);
    const rcriElevated = data.lee === 'II' || data.lee === 'III' || data.lee === 'IV';
    const cardiacRisk = data.cardiopatiaIsquemica || data.icc || data.cardio_stent || rcriElevated || (data.edad >= 65 && highRiskSurgery);
    if (cardiacRisk) {
        rules.addPost("Vigilancia de lesión miocárdica posoperatoria (MINS): troponina de alta sensibilidad basal y a las 24 y 48 horas aunque el paciente esté asintomático; ECG de 12 derivaciones ante elevación o síntomas. Valoración por medicina interna/cardiología si hay elevación.");
    }

    // ============================================================================
    // 5. TROMBOPROFILAXIS (Caprini)
    // ============================================================================
    const caprini = data.caprini || 0;
    
    // Renal adjustment for thromboprophylaxis
    const isRenalFailure = data.tfg && data.tfg < 30;
    const heparinaRenalStr = isRenalFailure ? "Heparina No Fraccionada 5000 UI SC c/12h (por falla renal)" : "Enoxaparina 40 mg SC c/24h";

    if (caprini >= 5) {
        rules.addPost(`Iniciar profilaxis antitrombótica dual (Mecánica + Farmacológica): Compresión Neumática Intermitente y ${heparinaRenalStr} por riesgo tromboembólico alto (Escala Caprini >= 5).`);
    } else if (caprini >= 3) {
        rules.addPost(`Iniciar profilaxis antitrombótica: ${heparinaRenalStr} por riesgo tromboembólico moderado (Escala Caprini 3-4).`);
    } else if (caprini === 2) {
        rules.addPost(`Profilaxis antitrombótica mecánica: Utilizar Medias de Compresión Graduada o Compresión Neumática Intermitente (Escala Caprini 2). No requiere heparina.`);
    } else {
        rules.addPost("Estimular deambulación temprana en el postoperatorio (Riesgo tromboembólico bajo, Escala Caprini 0-1).");
    }

    // ============================================================================
    // 6. PROFILAXIS ANTIMICROBIANA Y OTROS POST
    // ============================================================================
    const penicillinAllergy = data.alergicos && (data.alergicosDetalle || '').toLowerCase().includes('penicilina');
    if (penicillinAllergy) {
        rules.addTrans("Alergia a penicilina: evitar betalactámicos en la profilaxis antimicrobiana (alternativas habituales: clindamicina ± gentamicina, o vancomicina según protocolo).");
    } else {
        rules.addTrans("Profilaxis antimicrobiana y su re-dosificación conforme al protocolo del servicio quirúrgico.");
    }

    rules.addPost("Analgesia multimodal ahorradora de opioides según protocolo del servicio, con evaluación por escala visual análoga (EVA).");

    // FORMATTING RESULTS
    const formatBulletPoints = (items: string[]) => {
        return items.length > 0 ? items.map(t => `- ${t}`).join('\n') : '- Sin recomendaciones específicas para esta fase basándose en los datos actuales.';
    };

    return {
        plan_pre: formatBulletPoints(rules.pre),
        plan_trans: formatBulletPoints(rules.trans),
        plan_post: formatBulletPoints(rules.post),
    };
};
