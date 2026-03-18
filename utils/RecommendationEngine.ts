import { VPOData, SelectedMed } from '../types';
import { getMedicationRecommendation } from '../custom_services/PharmacologyEngine';

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
        rules.addPre("Vigilar ayuno: No garantizado por tratarse de intervención de urgencia. Anticipar inducción de secuencia rápida (estómago lleno).");
    } else {
        rules.addPre("Ayuno estándar: Permitir ingesta de líquidos claros hasta 2 horas previas a la inducción. Sólidos 6 a 8 horas previas.");
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
        rules.addTrans(`Vigilar balance hídrico estricto por TFG de ${data.tfg.toFixed(1)} ml/min. Utilizar cristaloides balanceados y mantener PAM > 65 mmHg para perfusión renal.`);
        rules.addPost("Monitorear creatinina sérica y volumen urinario postoperatorio.");
    } else {
        rules.addTrans("Terapia hídrica guiada por metas: Utilizar cristaloides balanceados a requerimiento basal y pérdidas estimadas.");
    }

    // ============================================================================
    // 3. RIESGO CARDIOVASCULAR
    // ============================================================================
    if (data.icc || data.cardiopatiaIsquemica || data.cardio_stent) {
        rules.addTrans("Riesgo cardiovascular aumentado: Mantener normotensión estricta perioperatoria (evitar descenso de PAM > 20% de la basal) y control de frecuencia cardíaca.");
        if (data.cardiopatiaIsquemica) {
            rules.addPost("Vigilar aparición de isquemia miocárdica; solicitar ECG de 12 derivaciones y marcadores cardíacos en sala de recuperación en caso de inestabilidad hemodinámica.");
        }
    }

    if (data.hta_control === 'descontrolada' || (data.taSistolica && data.taSistolica > 160)) {
        rules.addPre("Hipertensión descontrolada: Optimizar control de tensión arterial previo al evento. Meta tensional < 140/90 mmHg.");
    }

    if (data.arritmias) {
        rules.addPre("Arritmia basal: Evaluar necesidad de corrección hidroelectrolítica preoperatoria (K+, Mg2+).");
        rules.addTrans("Monitoreo continuo de ritmo cardíaco para detección oportuna de eventos arrítmicos durante transoperatorio.");
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
                actionText = `Suspender fármaco ${medRec.daysPrior * 24} horas previas al procedimiento`;
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

            text = `[${med.name.toUpperCase()}] ${actionText}. Indicación específica: ${formalizedInstruction}. Justificación: ${formalizedRationale}`;
            
            rules.addPre(text);

            if (med.isSteroid && med.isChronic) {
                rules.addTrans(`[${med.name.toUpperCase()}] Administrar dosis de estrés intraoperatoria con hidrocortisona intravenosa según grado de severidad quirúrgica.`);
            }
        });
    }

    if (data.diabetes && data.usaInsulina) {
        rules.addPre("Uso de Insulina: Ajustar dosis basal a administrar la noche previa (75-80% de dosis habitual). Suspender bolos preprandiales matutinos el día de la cirugía.");
        rules.addTrans("Monitoreo glucémico capilar cada 2 horas intraoperatoriamente. Meta glucémica de 140 - 180 mg/dL.");
    }

    if (data.alergicos && data.alergicosDetalle) {
        rules.addPre(`Alerta por Alergia conocida: ${data.alergicosDetalle}. Evitar administración absoluta e indicar en expediente clínico.`);
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
    const antibiotic = (data.alergicos && (data.alergicosDetalle || '').toLowerCase().includes('penicilina')) 
        ? "Clindamicina 900 mg IV más Gentamicina 5 mg/kg IV" 
        : "Cefazolina 2g IV (o 3g si >120 kg)";

    rules.addPre(`Administrar profilaxis antimicrobiana con ${antibiotic} dentro de los 60 minutos previos a la incisión quirúrgica.`);
    
    // Check if redose is possibly needed (trans)
    rules.addTrans(`Considerar re-dosificación de profilaxis antimicrobiana intraoperatoria si la duración excede las 4 horas o ante pérdida hemática mayor a 1,500 ml.`);

    rules.addPost("Establecer plan de analgesia multimodal de acuerdo a escala visual análoga (EVA), minimizando el uso de opioides de ser posible.");

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
