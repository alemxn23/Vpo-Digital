import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData } from '../types';
import { ClipboardList, CheckCircle2, AlertTriangle, ArrowRight, Syringe, HeartPulse, BedDouble, Stethoscope, Activity, Droplets, Info, Check, X, Lock } from 'lucide-react';
import { generateRecommendations } from '../utils/RecommendationEngine';

interface RecommendationsProps {
    isUnlocked?: boolean;
    onRequestUnlock?: () => void;
}

const Recommendations: React.FC<RecommendationsProps> = ({ isUnlocked = false, onRequestUnlock }) => {
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

    // --- EFFECT: APPLY STANDARD GOALS ---
    // Build a stable key from ONLY the clinical inputs (NOT plan_pre/trans/post)
    // This prevents the infinite loop where writing the plan re-triggers this effect.
    const clinicalKey = JSON.stringify({
        metasChecked,
        diabetes: data.diabetes, icc: data.icc, icc_evolucion: data.icc_evolucion,
        cardiopatiaIsquemica: data.cardiopatiaIsquemica, enfRenalCronica: data.enfRenalCronica,
        hepatopatia: data.hepatopatia, hta_control: data.hta_control,
        caprini: capriniScore, gupta: data.gupta, gupta_surgical_site: data.gupta_surgical_site,
        cardio_stent: data.cardio_stent, stent_tipo: data.stent_tipo, stent_fecha_colocacion: data.stent_fecha_colocacion,
        lee: data.lee, tfg: data.tfg, creatinina: data.creatinina,
        peso: data.peso, imc: data.imc, usaInsulina: data.usaInsulina,
        alergicos: data.alergicos, alergicosDetalle: data.alergicosDetalle,
        esUrgencia: data.esUrgencia,
        meds: (data.selectedMeds || []).map(m => m.name + m.action).join(','),
    });

    useEffect(() => {
        if (!metasChecked) return;

        const { plan_pre, plan_trans, plan_post } = generateRecommendations(data);

        // Only call setValue if the value actually changed to avoid triggering re-renders
        if (data.plan_pre !== plan_pre) setValue('plan_pre', plan_pre, { shouldDirty: false });
        if (data.plan_trans !== plan_trans) setValue('plan_trans', plan_trans, { shouldDirty: false });
        if (data.plan_post !== plan_post) setValue('plan_post', plan_post, { shouldDirty: false });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clinicalKey]);

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
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-tight">Médico que realizó</label>
                    <input {...register('elaboro')} className="w-full bg-white border-gray-200 rounded-lg shadow-sm text-xs p-2 border focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Nombre completo..." />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-tight">Matrícula / Cédula</label>
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
                        {!isUnlocked && <Lock size={14} className="text-amber-500" />}
                        {isUnlocked && <ArrowRight size={14} className="text-blue-300 group-hover:translate-x-1 transition-transform" />}
                    </div>
                    <div className="p-3 flex flex-col relative">
                        {!isUnlocked && (
                            <div
                                onClick={onRequestUnlock}
                                className="absolute inset-0 z-10 bg-amber-50/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 cursor-pointer rounded-b-2xl"
                            >
                                <Lock size={22} className="text-amber-500" />
                                <span className="text-xs font-bold text-amber-700">Desbloquear VPO para editar</span>
                            </div>
                        )}
                        <textarea
                            {...register('plan_pre')}
                            readOnly={!isUnlocked}
                            className={`w-full min-h-[160px] bg-transparent border-none resize-none text-[13px] leading-relaxed focus:ring-0 p-2 text-slate-700 font-medium placeholder:text-slate-400 placeholder:italic ${!isUnlocked ? 'cursor-not-allowed select-none' : ''
                                }`}
                            placeholder="Ayuno, Soluciones, Antibóticos..."
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
                        {!isUnlocked && <Lock size={14} className="text-amber-500" />}
                        {isUnlocked && <ArrowRight size={14} className="text-amber-300 group-hover:translate-x-1 transition-transform" />}
                    </div>
                    <div className="p-3 flex flex-col relative">
                        {!isUnlocked && (
                            <div
                                onClick={onRequestUnlock}
                                className="absolute inset-0 z-10 bg-amber-50/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 cursor-pointer rounded-b-2xl"
                            >
                                <Lock size={22} className="text-amber-500" />
                                <span className="text-xs font-bold text-amber-700">Desbloquear VPO para editar</span>
                            </div>
                        )}
                        <textarea
                            {...register('plan_trans')}
                            readOnly={!isUnlocked}
                            className={`w-full min-h-[160px] bg-transparent border-none resize-none text-[13px] leading-relaxed focus:ring-0 p-2 text-slate-700 font-medium placeholder:text-slate-400 placeholder:italic ${!isUnlocked ? 'cursor-not-allowed select-none' : ''
                                }`}
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
                        {!isUnlocked && <Lock size={14} className="text-amber-500" />}
                        {isUnlocked && <ArrowRight size={14} className="text-green-300 group-hover:translate-x-1 transition-transform" />}
                    </div>
                    <div className="p-3 flex flex-col relative">
                        {!isUnlocked && (
                            <div
                                onClick={onRequestUnlock}
                                className="absolute inset-0 z-10 bg-amber-50/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 cursor-pointer rounded-b-2xl"
                            >
                                <Lock size={22} className="text-amber-500" />
                                <span className="text-xs font-bold text-amber-700">Desbloquear VPO para editar</span>
                            </div>
                        )}
                        <textarea
                            {...register('plan_post')}
                            readOnly={!isUnlocked}
                            className={`w-full min-h-[160px] bg-transparent border-none resize-none text-[13px] leading-relaxed focus:ring-0 p-2 text-slate-700 font-medium placeholder:text-slate-400 placeholder:italic ${!isUnlocked ? 'cursor-not-allowed select-none' : ''
                                }`}
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