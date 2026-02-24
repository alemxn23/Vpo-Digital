import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData } from '../types';
import { ClipboardList, CheckCircle2, AlertTriangle, ArrowRight, Syringe, HeartPulse, BedDouble, Stethoscope, Activity, Droplets, Info, Check, X } from 'lucide-react';

const Recommendations: React.FC = () => {
    const { register, watch, setValue } = useFormContext<VPOData>();
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

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

    // --- GLOBAL GOALS & TARGETS ---
    const getGlobalTargets = () => {
        const isHighCV = data.icc || data.cardiopatiaIsquemica || (data.edad || 0) > 75 || data.enfRenalCronica;
        const isStrictBP = (data.diabetes && (data.enfRenalCronica || (data.tfg || 0) < 60)) || data.hta_control === 'descontrolada';

        // Targets
        const hbTarget = isHighCV ? 10.0 : 8.0;
        const bpTarget = isStrictBP ? { sys: 130, dia: 80 } : { sys: 140, dia: 90 };
        const gluTarget = data.diabetes ? { min: 140, max: 180 } : { min: 70, max: 140 };

        // Real Values Check (Validation)
        const currentHb = data.hb || 0;
        const currentSys = data.taSistolica || 0;
        const currentDia = data.taDiastolica || 0;
        const currentGlu = data.glucosaCentral || data.glucosaCapilar || 0;

        return {
            hb: {
                target: hbTarget,
                current: currentHb,
                isOk: currentHb >= hbTarget || currentHb === 0,
                label: `> ${hbTarget.toFixed(1)}`
            },
            bp: {
                target: bpTarget,
                current: { sys: currentSys, dia: currentDia },
                isOk: (currentSys > 0 ? (currentSys < bpTarget.sys && currentDia < bpTarget.dia) : true),
                label: `< ${bpTarget.sys}/${bpTarget.dia}`
            },
            glu: {
                target: gluTarget,
                current: currentGlu,
                isOk: (currentGlu > 0 ? (currentGlu >= gluTarget.min && currentGlu <= gluTarget.max) : true),
                label: `${gluTarget.min}-${gluTarget.max}`
            }
        };
    };

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
            strategy = "• ESTRATEGIA: Estrictamente Restrictiva (< 2 ml/kg/h).\n• Meta: Balance acumulado < 1.5L in 24h. Pulmón sensible. Manejar hipotensión con vasopresores.";
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
        const medsPlan = ""; // Removed redundant text summary to avoid duplication in report

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
• Soluciones: \n${fluidRec}${dukeAlert}${frailtyRec}${stopBangRec}`;
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
        const targets = getGlobalTargets();
        const fluidRec = getFluidRecommendation();

        const hemodynamics = `• METAS HEMODINÁMICAS: TA ${targets.bp.label} mmHg. Evitar hipotensión. Evitar sobrecarga hídrica.`;

        // Antibiotic Redosing logic based on site
        const site = data.gupta_surgical_site || 'other';
        const redoseInterval = site === 'cardiac' ? '2-4h' : '4h';
        const antibioticInstructions = getAntibioticRegimen().includes('NO SE REQUIERE')
            ? ""
            : `\n• ANTIBIÓTICO: Redosificar cada ${redoseInterval} si duración > 4h o sangrado > 1.5L.`;

        // Insulin Logic
        const insulinInstruction = data.diabetes
            ? `\n• Mantener Glucemia ${targets.glu.label} mg/dL.${getInsulinSchema()}`
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
• METAS: Hb ${targets.hb.label} g/dL. Uresis ≥ 0.5ml/kg/h.
• METAS HEMODINÁMICAS: TA ${targets.bp.label} mmHg. Evitar hipotensión.
• LÍQUIDOS: \n${fluidRec}${antibioticInstructions}${insulinInstruction}${steroidInstruction}${ecoRecs}`;
    };

    const generatePostPlan = () => {
        const targets = getGlobalTargets();
        const trombo = getThromboprophylaxisRec();
        const site = data.gupta_surgical_site || 'other';
        const antibioticDuration = (site === 'cardiac' || site === 'aortic') ? '48h' : '24h';

        return `• Al tolerar la VO reiniciar tratamiento habitual.
• METAS: Glucosa ${targets.glu.label} mg/dL. TA ${targets.bp.label} mmHg.
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
    }, [metasChecked, setValue, data.diabetes, data.icc, data.cardiopatiaIsquemica, capriniScore, data.duke_resultado, selectedMeds, data.tfg, data.eco_fevi, data.eco_valvulopatia, data.eco_psap_elevada, data.eco_disfuncion_diastolica, data.flag_estenosis_aortica_severa, data.stopbang_risk, data.fragilidad_score, data.edad, data.enfRenalCronica, data.hta_control]);

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

            {/* PHYSICIAN SECTION - Moved to top */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 p-5 border-b border-gray-200 bg-slate-50/30">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-tight">Médico Adscrito</label>
                    <input {...register('elaboro')} className="w-full bg-white border-gray-200 rounded-lg shadow-sm text-xs p-2 border focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Nombre completo..." />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-tight">Matrícula (Adscrito)</label>
                    <input {...register('matricula')} className="w-full bg-white border-gray-200 rounded-lg shadow-sm text-xs p-2 border focus:ring-blue-500 focus:border-blue-500 transition-all" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-tight">Médico Residente</label>
                    <input {...register('residente')} className="w-full bg-white border-gray-200 rounded-lg shadow-sm text-xs p-2 border focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Nombre completo..." />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-tight">Matrícula (Residente)</label>
                    <input {...register('residente_matricula')} className="w-full bg-white border-gray-200 rounded-lg shadow-sm text-xs p-2 border focus:ring-blue-500 focus:border-blue-500 transition-all" />
                </div>
            </div>

            {/* INDICATORS / METAS GLOBALES - Moved to top */}
            <div className="bg-clinical-navy text-white p-4 flex flex-col lg:flex-row justify-between items-center gap-4 px-8 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] relative">

                {/* EXPLANATION OVERLAY / POPOVER */}
                {selectedGoal && (
                    <div className="absolute inset-0 bg-clinical-navy/95 backdrop-blur-md z-50 flex items-center justify-between px-8 animate-clinical-enter">
                        <div className="flex items-center gap-6 max-w-4xl">
                            <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                                {selectedGoal === 'bp' && <Activity className="text-green-400" size={24} />}
                                {selectedGoal === 'glu' && <Syringe className="text-blue-400" size={24} />}
                                {selectedGoal === 'hb' && <HeartPulse className="text-red-400" size={24} />}
                                {selectedGoal === 'uresis' && <Droplets className="text-cyan-400" size={24} />}
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                                    Justificación Clínica: {selectedGoal === 'bp' ? 'Tensión Arterial' : selectedGoal === 'glu' ? 'Glucosa' : selectedGoal === 'hb' ? 'Hemoglobina' : 'Gasto Urinario'}
                                </h4>
                                <p className="text-xs text-blue-100/80 leading-relaxed max-w-2xl italic">
                                    {selectedGoal === 'hb' && "Mantener Hb > 8.0 g/dL en pacientes sanos y > 10.0 g/dL en pacientes con reserva cardiovascular limitada (ICC, Isquemia, Edad > 75) para asegurar el aporte de oxígeno tisular (DO2) y evitar isquemia perioperatoria. (Guía ESAIC/ASA)"}
                                    {selectedGoal === 'bp' && "Mantener la PAM dentro del 20% de la basal. Objetivos más estrictos (<130/80) en pacientes con ERC o DM descontrolada para protección de órgano blanco y reducción de riesgo de evento cerebral. (Guía ACC/AHA)"}
                                    {selectedGoal === 'glu' && "En pacientes con diabetes, el rango 140-180 mg/dL equilibra la prevención de hipoglucemia con la reducción del riesgo de infección de sitio quirúrgico. En no diabéticos, mantener < 140 mg/dL. (Guía ADA/NICE)"}
                                    {selectedGoal === 'uresis' && "El gasto urinario ≥ 0.5 ml/kg/h es un indicador fundamental de la perfusión renal y estado de volumen. La oliguria persistente sugiere hipovolemia o daño renal agudo incipiente. (Guía KDIGO)"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedGoal(null)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                {(() => {
                    const targets = getGlobalTargets();
                    return (
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-blue-200 uppercase tracking-[0.2em] mb-1">Indicadores</span>
                                <h4 className="text-xs font-black text-white">METAS GLOBALES</h4>
                            </div>

                            <div className="h-8 w-px bg-white/10 hidden lg:block" />

                            {/* BP Indicator */}
                            <div
                                onClick={() => setSelectedGoal('bp')}
                                className="flex items-center gap-3 group transition-all hover:scale-105 cursor-help"
                            >
                                <div className={`p-1.5 rounded-lg border transition-colors ${targets.bp.isOk ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-red-500/20 border-red-500/30 text-red-400'}`}>
                                    <Activity size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">Tensión Arterial</span>
                                        <Info size={8} className="text-white/20 group-hover:text-white/50 transition-colors" />
                                    </div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-sm font-black text-white leading-none">{targets.bp.label}</span>
                                        {targets.bp.current.sys > 0 && (
                                            <span className={`text-[10px] font-bold ${targets.bp.isOk ? 'text-green-400' : 'text-red-400'}`}>
                                                (Real: {targets.bp.current.sys}/{targets.bp.current.dia})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Glucose Indicator */}
                            <div
                                onClick={() => setSelectedGoal('glu')}
                                className="flex items-center gap-3 group transition-all hover:scale-105 cursor-help"
                            >
                                <div className={`p-1.5 rounded-lg border transition-colors ${targets.glu.isOk ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-red-500/20 border-red-500/30 text-red-400'}`}>
                                    <Syringe size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">Glucosa Central</span>
                                        <Info size={8} className="text-white/20 group-hover:text-white/50 transition-colors" />
                                    </div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-sm font-black text-white leading-none">{targets.glu.label}</span>
                                        {targets.glu.current > 0 && (
                                            <span className={`text-[10px] font-bold ${targets.glu.isOk ? 'text-blue-400' : 'text-red-400'}`}>
                                                (Real: {targets.glu.current})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Hemoglobin Indicator */}
                            <div
                                onClick={() => setSelectedGoal('hb')}
                                className="flex items-center gap-3 group transition-all hover:scale-105 cursor-help"
                            >
                                <div className={`p-1.5 rounded-lg border transition-colors ${targets.hb.isOk ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-orange-500/20 border-orange-500/30 text-orange-400'}`}>
                                    <HeartPulse size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">Hemoglobina (Target)</span>
                                        <Info size={8} className="text-white/20 group-hover:text-white/50 transition-colors" />
                                    </div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-sm font-black text-white leading-none">{targets.hb.label}</span>
                                        {targets.hb.current > 0 && (
                                            <span className={`text-[10px] font-bold ${targets.hb.isOk ? 'text-white' : 'text-red-400 animate-pulse'}`}>
                                                (Real: {targets.hb.current})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Uresis Indicator */}
                            <div
                                onClick={() => setSelectedGoal('uresis')}
                                className="flex items-center gap-3 group transition-all hover:scale-105 cursor-help"
                            >
                                <div className="bg-cyan-500/20 p-1.5 rounded-lg border border-cyan-500/30 text-cyan-400">
                                    <Droplets size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">Uresis (Gasto)</span>
                                        <Info size={8} className="text-white/20 group-hover:text-white/50 transition-colors" />
                                    </div>
                                    <span className="text-sm font-black text-white leading-none">≥ 0.5 <span className="text-[10px] text-gray-400 font-medium ml-1">ml/kg/h</span></span>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* VERTICAL STACKED LAYOUT */}
            <div className="p-4 flex flex-col gap-4">

                {/* SECTION 1: PRE-QX */}
                <div className="flex flex-col bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-blue-200 group">
                    <div className="bg-blue-600/10 p-3 border-b border-blue-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm"><Stethoscope size={16} /></div>
                            <h3 className="font-black text-xs text-blue-900 uppercase tracking-wider">Pre-Quirúrgico</h3>
                        </div>
                        <ArrowRight size={14} className="text-blue-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="p-3 flex flex-col">
                        <textarea
                            {...register('plan_pre')}
                            className="w-full min-h-[160px] bg-transparent border-none resize-none text-[13px] leading-relaxed focus:ring-0 p-2 text-slate-700 font-medium placeholder:text-slate-400 placeholder:italic"
                            placeholder="Ayuno, Soluciones, Antibióticos..."
                        />
                        <div className="mt-2 p-2 bg-blue-50/50 rounded-lg border border-blue-100/50">
                            <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1"><Info size={12} /> Sugerencia: ASHP/IDSA 2024</p>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: TRANS-QX */}
                <div className="flex flex-col bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-amber-200 group">
                    <div className="bg-amber-600/10 p-3 border-b border-amber-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-amber-600 text-white p-1.5 rounded-lg shadow-sm"><HeartPulse size={16} /></div>
                            <h3 className="font-black text-xs text-amber-900 uppercase tracking-wider">Trans-Quirúrgico</h3>
                        </div>
                        <ArrowRight size={14} className="text-amber-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="p-3 flex flex-col">
                        <textarea
                            {...register('plan_trans')}
                            className="w-full min-h-[160px] bg-transparent border-none resize-none text-[13px] leading-relaxed focus:ring-0 p-2 text-slate-700 font-medium placeholder:text-slate-400 placeholder:italic"
                            placeholder="Metas hemodinámicas, Esquema Insulina..."
                        />
                        <div className="mt-2 p-2 bg-amber-50/50 rounded-lg border border-amber-100/50">
                            <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1"><Activity size={12} /> Meta: GDFT (Goal Directed)</p>
                        </div>
                    </div>
                </div>

                {/* SECTION 3: POST-QX */}
                <div className="flex flex-col bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-green-200 group">
                    <div className="bg-green-600/10 p-3 border-b border-green-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-green-600 text-white p-1.5 rounded-lg shadow-sm"><BedDouble size={16} /></div>
                            <h3 className="font-black text-xs text-green-900 uppercase tracking-wider">Post-Quirúrgico</h3>
                        </div>
                        <ArrowRight size={14} className="text-green-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="p-3 flex flex-col">
                        <textarea
                            {...register('plan_post')}
                            className="w-full min-h-[160px] bg-transparent border-none resize-none text-[13px] leading-relaxed focus:ring-0 p-2 text-slate-700 font-medium placeholder:text-slate-400 placeholder:italic"
                            placeholder="Reinicio V.O., Tromboprofilaxis, Alta..."
                        />
                        <div className="mt-2 p-2 bg-green-50/50 rounded-lg border border-green-100/50">
                            <p className="text-[10px] text-green-600 font-bold flex items-center gap-1"><Check size={12} /> Alta sugerida: Protocolo ERAS</p>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Recommendations;