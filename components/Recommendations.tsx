import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData } from '../types';
import { ClipboardList, CheckCircle2, AlertTriangle, ArrowRight, Syringe, HeartPulse, BedDouble, Stethoscope, Activity, Droplets } from 'lucide-react';

const Recommendations: React.FC = () => {
    const { register, watch, setValue } = useFormContext<VPOData>();

    const metasChecked = watch('metasTerapeuticas');
    const selectedMeds = watch('selectedMeds') || [];
    const capriniScore = watch('caprini') || 0;

    // Clinical Variables for Logic
    const data = watch();

    // Helper to prevent infinite loops
    const safeSet = (key: keyof VPOData, newVal: any) => {
        const current = (data as any)[key];
        if (typeof newVal === 'number' && typeof current === 'number' && isNaN(newVal) && isNaN(current)) return;
        if (current != newVal) {
            setValue(key, newVal as any);
        }
    };

    // --- BUSINESS RULES & LOGIC HELPERS ---

    const getInsulinSchema = () => {
        // Logic: Resistant Schema if Basal Insulin used OR BMI > 35
        const isResistant = data.usaInsulina || (data.imc && data.imc > 35);
        const title = isResistant ? "ESQUEMA INSULINA RÁPIDA (RESISTENTE)" : "ESQUEMA INSULINA RÁPIDA (SENSIBLE)";

        // Values: [Low, High] for each tier
        const tiers = isResistant ? [4, 6, 8, 10, 12, 15] : [2, 4, 6, 8, 10, 12];

        return `\n\n--- ${title} ---\n` +
            `• 140-180 mg/dL: ${tiers[0]} UI SC\n` +
            `• 181-220 mg/dL: ${tiers[1]} UI SC\n` +
            `• 221-260 mg/dL: ${tiers[2]} UI SC\n` +
            `• 261-300 mg/dL: ${tiers[3]} UI SC\n` +
            `• 301-350 mg/dL: ${tiers[4]} UI SC\n` +
            `• > 351 mg/dL:   ${tiers[5]} UI SC + Aviso`;
    };

    const getAntibioticRegimen = () => {
        const site = data.gupta_surgical_site || 'other';
        const isAllergic = data.alergicos;
        const allergyDetail = (data.alergicosDetalle || '').toLowerCase();
        const weight = data.peso || 70;
        const imc = data.imc || 25;

        // Check for Penicillin/Beta-lactam allergy
        const hasBetaLactamAllergy = isAllergic && (
            allergyDetail.includes('penicilina') ||
            allergyDetail.includes('betalactam') ||
            allergyDetail.includes('cefalosporina') ||
            allergyDetail.includes('penicilin')
        );

        // Cefazolin Dosing Logic (ASHP 2024)
        const cefazolinDose = (weight >= 120 || imc >= 35) ? '3g' : '2g';
        const standardInduction = `Cefazolina ${cefazolinDose} IV (Inducción 60 min previos).`;
        const vancomycinRegimen = "Vancomicina 15mg/kg (Máx 2g) IV (Inducción 120 min previos).";
        const clindaRegimen = "Clindamicina 900mg IV (Inducción 60 min previos).";

        if (hasBetaLactamAllergy) {
            return `${vancomycinRegimen} o ${clindaRegimen} (Alergia a Beta-lactámicos).`;
        }

        // Regimens by surgical site (ASHP/IDSA/SIS/SHEA 2024)
        switch (site) {
            case 'cardiac':
            case 'aortic':
            case 'vascular':
                return `${standardInduction} Redosificar cada 4h (2h si CEC).`;
            case 'intestinal':
            case 'biliary':
            case 'anorectal':
                return `Cefazolina ${cefazolinDose} IV + Metronidazol 500mg IV. Alt: Ertapenem 1g IV.`;
            case 'bariatric':
                return `Cefazolina 3g IV (Ajuste por IMC/Peso).`;
            case 'urologic':
                return `Ciprofloxacino 400mg IV o Cefazolina ${cefazolinDose} IV.`;
            case 'thoracic':
            case 'orthopedic':
            case 'spinal':
            case 'intracranial':
                return standardInduction;
            case 'neck':
            case 'ent':
                // Note: ASHP recommends no prophylaxis for clean ENT without implants
                const dx = (data.diagnosticoQuirurgico || '').toLowerCase();
                const isContaminated = dx.includes('cancer') || dx.includes('neoplasia') || dx.includes('reconstruccion') || dx.includes('colgajo');
                if (isContaminated) {
                    return `Cefazolina ${cefazolinDose} IV + Metronidazol 500mg IV.`;
                }
                return "NO SE REQUIERE PROFILAXIS (Cirugía Limpia de Cabeza y Cuello sin prótesis).";
            default:
                return `${standardInduction} (Protocolo Estándar).`;
        }
    };

    const getFluidRecommendation = () => {
        const site = data.gupta_surgical_site || 'other';
        const isNeuro = site === 'intracranial' || site === 'spinal';
        const isThoracic = site === 'thoracic';
        const isAbdMajor = ['intestinal', 'bariatric', 'biliary', 'urologic', 'anorectal', 'obstetric', 'gyneco'].includes(site) || data.capB_cxMayor || data.capB_laparoscopia;

        const isChfOrRenal = data.icc || data.enfRenalCronica || (data.lee && (data.lee === 'III' || data.lee === 'IV'));
        const isCirrhosis = data.hepatopatia;
        const isAmbulatory = data.capA_cxMenor;

        // 1. SAFETY RULE: NO SYNTHETIC COLLOIDS
        const safetyWarning = "⚠️ KDIGO 2024: Uso de Coloides Sintéticos (HES/Voluven) CONTRAINDICADO (Riesgo AKI/Mortalidad).";

        let strategy = "";

        // 2. COMORBIDITY OVERRIDES
        if (isChfOrRenal) {
            strategy = "• ESTRATEGIA: Restrictiva guiada por metas (GDFT).\n• Recomendación: Tolerancia a fluidos disminuida. No suspender diuréticos si hay congestión. Balance neutro/negativo.";
        } else if (isCirrhosis) {
            strategy = "• FLUIDO: Cristaloides Balanceados o Albúmina.\n• Regla: Si paracentesis >5L -> Reponer 8g Albúmina por litro extraído. Evitar Salina 0.9%.";
        } else if (isNeuro) {
            // 3. SURGERY SPECIFIC
            strategy = "• FLUIDO: Solución Salina 0.9% (ÚNICA opción permitida).\n• ALERTA: Prohibido el uso de soluciones hipotónicas o Ringer Lactato en grandes volúmenes (Riesgo de Edema Cerebral).";
        } else if (isThoracic) {
            strategy = "• ESTRATEGIA: Estrictamente Restrictiva (< 2 ml/kg/h).\n• Meta: Balance acumulado < 1.5L en 24h. Pulmón sensible. Manejar hipotensión con vasopresores.";
        } else if (isAbdMajor) {
            strategy = "• ESTRATEGIA: Moderadamente Liberal (Estudio RELIEF).\n• Fluido: Cristaloides Balanceados (Hartmann/Plasma-Lyte). Evitar Salina 0.9% (Acidosis hiperclorémica).\n• Meta: 10-12 ml/kg/h intraop. Balance positivo final 1-2L.";
        } else if (isAmbulatory) {
            strategy = "• ESTRATEGIA: Liberal Moderada (1-2L Cristaloides Balanceados) para reducir NVPO y mareo.";
        } else {
            // Default Standard
            strategy = "• Recomendación: Solución Hartmann/Balanceada 1000 cc para 8 horas (Mantenimiento Estándar).";
        }

        return `${strategy}\n• ${safetyWarning}\n(Ref: ASA 2023, SAMBA 2024, KDIGO 2024)`;
    };

    const getThromboprophylaxisRec = () => {
        const caprini = data.caprini || 0;
        const tfg = data.tfg || 90;
        const imc = data.imc || 25;
        const weight = data.peso || 70;

        // 1. Risk Stratification
        if (caprini <= 1) return "Riesgo Muy Bajo: Deambulación temprana y frecuente.";

        let drug = "Enoxaparina";
        let dose = "40mg SC cada 24h";
        let mechanical = "Medias de Compresión Graduada (TEDs)";

        // 2. Renal Adjustment (TFG < 30 or Stage 4/5 CKD)
        if (tfg < 30 || data.erc_estadio === 'G4' || data.erc_estadio === 'G5') {
            drug = "Heparina No Fraccionada (HNF) o Enoxaparina Ajustada";
            dose = "HNF 5000 UI SC cada 12h (Preferido) o Enoxaparina 30mg SC cada 24h";
        } else {
            // 3. BMI Adjustment (Obesity)
            if (imc >= 40) {
                if (caprini >= 5) {
                    dose = "40mg SC cada 12h o 60mg SC cada 24h (Rango Obesidad Mórbida)";
                } else {
                    dose = "40mg SC cada 24h";
                }
            } else if (weight > 100) {
                dose = "40mg SC cada 12h o 60mg SC cada 24h";
            }
        }

        // 4. Component Synthesis
        if (caprini >= 5) {
            return `Riesgo ALTO (Caprini ${caprini}): ${drug} ${dose} + ${mechanical} + CPI (Compresión Neumática Intermitente).`;
        } else if (caprini >= 3) {
            return `Riesgo MODERADO (Caprini ${caprini}): ${drug} ${dose} + ${mechanical}.`;
        } else {
            return `Riesgo BAJO (Caprini ${caprini}): ${mechanical} y Deambulación temprana.`;
        }
    };

    const generatePrePlan = () => {
        const medsPlan = selectedMeds.length > 0
            ? "\n\n--- CONCILIACIÓN DE FÁRMACOS ---\n" + selectedMeds.map(m => `• ${m.name}: ${m.action === 'stop' ? 'SUSPENDER' : m.action === 'adjust' ? 'AJUSTAR' : 'CONTINUAR'} (${m.instructions})`).join('\n')
            : "";

        // DUKE ALERT IN PLAN
        const dukeAlert = (data.duke_resultado === 'Definitivo' || data.duke_resultado === 'Posible')
            ? "\n\n⚠️ ALERTA INFECTOLOGÍA: Riesgo de Endocarditis (Duke +). Se sugiere diferir procedimiento electivo, hemocultivos y ETE."
            : "";

        // NSAID BLOCKER LOGIC (TFG < 30)
        const tfgVal = data.tfg || 90;
        const aineInstruction = tfgVal < 30
            ? "⛔ CONTRAINDICADOS AINEs (TFG < 30). Uso estricto de analgésicos no nefrotóxicos (Paracetamol/Opioides)."
            : "Suspender AAS/AINEs 7 días antes (Riesgo Hemorrágico).";

        const antibioticRegimen = getAntibioticRegimen();
        const fluidRec = getFluidRecommendation();
        const tromboRec = getThromboprophylaxisRec();

        // Frailty Alert
        const frailtyScore = data.fragilidad_score || 1;
        const frailtyRec = frailtyScore >= 5
            ? "\n\n⚠️ FRAGILIDAD (CFS >= 5): Protocolo de prevención de Delirio y manejo geriátrico temprano sugerido."
            : "";

        // STOP-BANG Alert (High Risk)
        const stopBangRec = (data.stopbang_risk === 'Alto' || data.stopbang_risk === 'Alto (Dx Previo)')
            ? "\n\n⚠️ VÍA AÉREA (STOP-BANG ALTO): Se sugiere extubación despierto y monitoreo de oximetría continua postoperatoria por alta probabilidad de SAOS."
            : "";

        // Fasting & CHO Logic (SAMBA 2024)
        const isDiabetic = data.diabetes;
        const fastingRule = isDiabetic
            ? "• Ayuno: Sólidos 6h. Líquidos claros (AGUA) hasta 2h previas.\n• ⚠️ DIABETES: EVITAR cargas de Carbohidratos/Maltodextrina (SAMBA 2024: Riesgo de Hiperglucemia/Variabilidad)."
            : "• Ayuno: Sólidos 6h. Líquidos claros hasta 2h previas.\n• Carga CHO: Maltodextrina recomendada 2h antes (Reduce resistencia a insulina).";

        return `${fastingRule}
• ${aineInstruction}
• Profilaxis antibiótica: ${antibioticRegimen} (Ref: ASHP Guidelines / Sanford 2024)
• Tromboprofilaxis: ${capriniScore >= 5 ? 'Iniciar 12h previas según esquema (Ver Post)' : 'Deambulación temprana / Medias TEDs'}. (Ref: ACCP / PAUSE)
• Soluciones: \n${fluidRec}${medsPlan}${dukeAlert}${frailtyRec}${stopBangRec}`;
    };

    const getEcoRecommendations = () => {
        const parts = [];
        // A. FEVI Low
        if ((data.eco_fevi || 60) < 35) {
            parts.push("RESERVA CARDIACA DISMINUIDA (<35%). Alto riesgo de hipotensión a la inducción. Se sugiere evitar inotrópicos negativos y manejar líquidos con extrema precaución.");
        }
        // B. Estenosis Aortica (From Eco or Antecedents)
        if (data.eco_valvulopatia === 'estenosis_aortica_severa' || data.flag_estenosis_aortica_severa) {
            parts.push("ESTENOSIS AÓRTICA SEVERA: ALERTA CRÍTICA. Mantener precarga y RVS. Evitar hipotensión y taquicardia. Anestesia neuroaxial puede precipitar colapso.");
        }
        // C. Hipertension Pulmonar
        if (data.eco_psap_elevada) {
            parts.push("HIPERTENSIÓN PULMONAR: Riesgo de falla ventricular derecha. Evitar hipoxia, hipercapnia y acidosis intraoperatoria.");
        } // D. Disfuncion Diastolica
        if (data.eco_disfuncion_diastolica) {
            parts.push("DISFUNCIÓN DIASTÓLICA SEVERA: La taquicardia y la fibrilación auricular son mal toleradas. Mantener ritmo sinusal.");
        }

        if (parts.length === 0) return "";
        return "\n\n⚠️ SUGERENCIAS ECOCARDIOGRÁFICAS:\n• " + parts.join("\n• ");
    };

    const generateTransPlan = () => {
        // Hemodynamic & Fluid Logic (Mirrored from Engine)
        const fluidRec = getFluidRecommendation(); // Use the engine output

        const isHighCVRisk = data.icc || data.cardiopatiaIsquemica || data.edad > 75 || data.enfRenalCronica;
        const hbTarget = isHighCVRisk ? "10.0 g/dL" : "8.0 g/dL";
        // Extract just the strategy line if needed, or append to liquids
        // For Trans plan, we want specific hemodynamic goals too.

        const hemodynamics = "• METAS HEMODINÁMICAS: TA < 140/90 mmHg. Evitar hipotensión. Evitar sobrecarga hídrica.";

        // Antibiotic Redosing logic based on site
        const site = data.gupta_surgical_site || 'other';
        const redoseInterval = site === 'cardiac' ? '2-4h' : '4h';
        const antibioticInstructions = getAntibioticRegimen().includes('NO SE REQUIERE')
            ? ""
            : `\n• ANTIBIÓTICO: Redosificar cada ${redoseInterval} si duración > 4h o sangrado > 1.5L.`;

        // Insulin Logic
        const insulinInstruction = data.diabetes
            ? `\n• Mantener Glucemia 140-180 mg/dL.${getInsulinSchema()}`
            : "";

        // Steroid Stress Dose Logic (If any med has stress dose instruction)
        const steroidMeds = selectedMeds.filter(m => m.isSteroid && m.action === 'adjust');
        const steroidInstruction = steroidMeds.length > 0
            ? `\n• DOSIS ESTRÉS ESTEROIDEO: ${steroidMeds[0].instructions}` // Take the first one found
            : "";

        // Eco Logic
        const ecoRecs = getEcoRecommendations();

        return `• A cargo de Anestesiología.
• Monitoreo cardiaco y pulsioximetría continuos.
• METAS: Hb > ${hbTarget}. Uresis ≥ 0.5ml/kg/h.
• METAS HEMODINÁMICAS: TA < 140/90 mmHg. Evitar hipotensión.
• LÍQUIDOS: \n${fluidRec}${antibioticInstructions}${insulinInstruction}${steroidInstruction}${ecoRecs}`;
    };

    const generatePostPlan = () => {
        const trombo = getThromboprophylaxisRec();
        const site = data.gupta_surgical_site || 'other';
        const antibioticDuration = (site === 'cardiac' || site === 'aortic') ? '48h' : '24h';

        return `• Al tolerar la VO reiniciar tratamiento habitual.
• METAS: Glucosa ${data.diabetes ? '140-180' : '70-140'} mg/dL. TA < 140/90 mmHg.
• TROMBOPROFILAXIS: ${trombo}
• ANTIBIÓTICO: Suspender en <${antibioticDuration} postoperatorias si no hay evidencia de infección.
• Vigilar datos de sangrado e infección en sitio quirúrgico.
• Deambulación temprana.
• Analgesia multimodal ahorradora de opioides.
• Seguimiento por UMF/HGZ al alta.`;
    };

    // --- EFFECT: APPLY STANDARD GOALS ---
    useEffect(() => {
        if (metasChecked) {
            const pre = generatePrePlan();
            const trans = generateTransPlan();
            const post = generatePostPlan();

            if (data.plan_pre !== pre) setValue('plan_pre', pre);
            if (data.plan_trans !== trans) setValue('plan_trans', trans);
            if (data.plan_post !== post) setValue('plan_post', post);
        }
    }, [metasChecked, setValue, data.diabetes, data.icc, data.cardiopatiaIsquemica, capriniScore, data.duke_resultado, selectedMeds, data.tfg, data.eco_fevi, data.eco_valvulopatia, data.eco_psap_elevada, data.eco_disfuncion_diastolica, data.flag_estenosis_aortica_severa, data.stopbang_risk, data.fragilidad_score]);

    // Determine Meta Labels based on risk
    const isNephroCardio = data.enfRenalCronica || data.icc || data.cardiopatiaIsquemica;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

            {/* HEADER BAR */}
            <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ClipboardList className="text-clinical-navy" size={24} />
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Plan de Manejo Integral</h2>
                        <p className="text-xs text-slate-500">Pre, Trans y Post-Quirúrgico</p>
                    </div>
                </div>

                {/* MASTER TOGGLE */}
                <label className={`flex items-center gap-3 px-4 py-2 rounded-lg border cursor-pointer transition-all
            ${metasChecked
                        ? 'bg-green-50 border-green-200 text-green-800 shadow-sm'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${metasChecked ? 'bg-green-600 border-green-600' : 'bg-white border-gray-400'}`}>
                        {metasChecked && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <input type="checkbox" {...register('metasTerapeuticas')} className="sr-only" />
                    <span className="font-bold text-sm">Aplicar Metas Institucionales</span>
                </label>
            </div>

            {/* 3-COLUMN LAYOUT */}
            <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* COL 1: PRE-QX */}
                <div className="flex flex-col h-full bg-blue-50/30 rounded-xl border border-blue-100 overflow-hidden">
                    <div className="bg-blue-100/50 p-3 border-b border-blue-200 flex items-center gap-2">
                        <div className="bg-blue-600 text-white p-1 rounded"><Stethoscope size={14} /></div>
                        <h3 className="font-bold text-sm text-blue-900">PRE-QUIRÚRGICO</h3>
                    </div>
                    <div className="p-2 flex-1">
                        <textarea
                            {...register('plan_pre')}
                            className="w-full h-full min-h-[250px] bg-transparent border-none resize-none text-xs leading-relaxed focus:ring-0 p-2 text-slate-700 font-medium"
                            placeholder="Ayuno, Soluciones, Antibióticos..."
                        />
                    </div>
                </div>

                {/* COL 2: TRANS-QX */}
                <div className="flex flex-col h-full bg-amber-50/30 rounded-xl border border-amber-100 overflow-hidden">
                    <div className="bg-amber-100/50 p-3 border-b border-amber-200 flex items-center gap-2">
                        <div className="bg-amber-600 text-white p-1 rounded"><HeartPulse size={14} /></div>
                        <h3 className="font-bold text-sm text-amber-900">TRANS-QUIRÚRGICO</h3>
                    </div>
                    <div className="p-2 flex-1">
                        <textarea
                            {...register('plan_trans')}
                            className="w-full h-full min-h-[250px] bg-transparent border-none resize-none text-xs leading-relaxed focus:ring-0 p-2 text-slate-700 font-medium"
                            placeholder="Metas hemodinámicas, Esquema Insulina..."
                        />
                    </div>
                </div>

                {/* COL 3: POST-QX */}
                <div className="flex flex-col h-full bg-green-50/30 rounded-xl border border-green-100 overflow-hidden">
                    <div className="bg-green-100/50 p-3 border-b border-green-200 flex items-center gap-2">
                        <div className="bg-green-600 text-white p-1 rounded"><BedDouble size={14} /></div>
                        <h3 className="font-bold text-sm text-green-900">POST-QUIRÚRGICO</h3>
                    </div>
                    <div className="p-2 flex-1">
                        <textarea
                            {...register('plan_post')}
                            className="w-full h-full min-h-[250px] bg-transparent border-none resize-none text-xs leading-relaxed focus:ring-0 p-2 text-slate-700 font-medium"
                            placeholder="Reinicio V.O., Tromboprofilaxis, Alta..."
                        />
                    </div>
                </div>

            </div>

            {/* FOOTER METAS */}
            <div className="bg-gray-800 text-white p-3 flex justify-between items-center text-[10px] md:text-xs px-6">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <span className="font-bold text-gray-400 uppercase tracking-wider">Metas Globales:</span>

                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-green-400" />
                        <span className="font-medium text-gray-200">TA:</span>
                        <span className="font-bold">
                            {data.cardiopatiaIsquemica || data.icc || (data.lee && (data.lee === 'III' || data.lee === 'IV')) || data.edad > 75
                                ? '< 140/90 mmHg'
                                : '< 140/90 mmHg'}
                        </span>
                        {/* Note: Standard medical target is 140/90, 180/110 is cancelation limit. User might prefer 140/90 as 'meta' */}
                    </div>

                    <div className="flex items-center gap-2">
                        <Syringe size={14} className="text-blue-400" />
                        <span className="font-medium text-gray-200">Glucosa:</span>
                        <span className="font-bold">
                            {data.diabetes ? '140-180 mg/dL' : '70-140 mg/dL'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 border-l border-gray-600 pl-6 ml-2">
                        <HeartPulse size={14} className="text-red-400" />
                        <span className="font-medium text-gray-200">Meta Hb:</span>
                        <span className="font-bold">
                            {isNephroCardio || data.edad > 75 ? '> 10.0 g/dL' : '> 8.0 g/dL'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Droplets size={14} className="text-cyan-400" />
                        <span className="font-medium text-gray-200">Uresis:</span>
                        <span className="font-bold">≥ 0.5 ml/kg/h</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border-t border-gray-200">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Médico Adscrito (Elaboró)</label>
                    <input {...register('elaboro')} className="w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2 border" placeholder="Dr..." />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Matrícula (Adscrito)</label>
                    <input {...register('matricula')} className="w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2 border" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Médico Residente</label>
                    <input {...register('residente')} className="w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2 border" placeholder="Dr..." />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Matrícula (Residente)</label>
                    <input {...register('residente_matricula')} className="w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2 border" />
                </div>
            </div>
        </div>
    );
};

export default Recommendations;