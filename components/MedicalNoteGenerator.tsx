
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData, Gender } from '../types';
import { Clipboard, Check, Copy, FileText, User, Activity, Pill, ShieldCheck, Lock } from 'lucide-react';

interface MedicalNoteGeneratorProps {
    isUnlocked?: boolean;
    onRequestUnlock?: () => void;
}

const MedicalNoteGenerator: React.FC<MedicalNoteGeneratorProps> = ({ isUnlocked = false, onRequestUnlock }) => {
    const { watch } = useFormContext<VPOData>();
    const data = watch();
    const [copiedSection, setCopiedSection] = useState<string | null>(null);

    const handleCopy = (text: string, sectionId: string) => {
        if (!isUnlocked) {
            onRequestUnlock?.();
            return;
        }
        navigator.clipboard.writeText(text);
        setCopiedSection(sectionId);
        setTimeout(() => setCopiedSection(null), 2000);
    };

    const generateSubjective = () => {
        const risks = [];
        if (data.tabaquismo) risks.push(`Tabaquismo (IT: ${data.indiceTabaquico || '-'})`);
        if (data.hta) risks.push("Hipertensión Arterial");
        if (data.diabetes) risks.push(`Diabetes Mellitus Tipo 2 (${data.diabetesTipo}${data.usaInsulina ? ', en tratamiento con Insulina' : ''})`);
        if (data.icc) risks.push("Insuficiencia Cardíaca");
        if (data.enfRenalCronica) risks.push(`Enfermedad Renal Crónica (TFG: ${data.tfg || '-'} ml/min)`);
        if (data.neumopatia && data.neumo_tipo?.toLowerCase().includes('epoc')) risks.push("EPOC");
        if (data.cardiopatiaIsquemica) {
            const stentInfo = data.cardio_stent ? ` (Post-Stent ${data.stent_tipo || ''} ${data.stent_fecha_colocacion || ''})` : '';
            risks.push(`Cardiopatía Isquémica${stentInfo}`);
        }

        return `SUBJETIVO / ANTECEDENTES:\nPaciente ${data.genero === Gender.MALE ? 'masculino' : 'femenino'} de ${data.edad} años programado para ${data.cirugiaProgramada || 'procedimiento quirúrgico'} (${data.tipoCirugia}).\nFactores de Riesgo: ${risks.length > 0 ? risks.join(', ') : 'Negados'}.\nAntecedentes Quirúrgicos: ${data.cirugiasPrevias || 'Negados'}.`.trim();
    };

    const generateObjective = () => {
        const vitals = `Signos Vitales: TA ${data.taSistolica || '-'}/${data.taDiastolica || '-'} mmHg, FC ${data.fc || '-'} lpm, FR ${data.fr || '-'} rpm, Temp ${data.temp || '-'}°C, SpO2 ${data.sato2 || '-'}%.`;
        const labs = `Hb: ${data.hb || '-'} g/dL, Hto: ${data.ht || '-'}%, Plaq: ${data.plaquetas || '-'} k/uL, Glu: ${data.glucosaCentral || '-'} mg/dL, Cr: ${data.creatinina || '-'} mg/dL, TFG: ${data.tfg || '-'} ml/min, K+: ${data.k || '-'} mEq/L, Na+: ${data.na || '-'} mEq/L.`;

        // ECG section with all findings
        const ecgRitmo = data.ecg_ritmo_especifico || data.ritmo || 'No reportado';
        const ecgFindings: string[] = [];
        if (data.ecg_hvi) ecgFindings.push('HVI');
        if (data.ecg_brihh_incompleto) ecgFindings.push('BRIHH Incompleto');
        if (data.ecg_brihh_completo) ecgFindings.push('BRIHH Completo');
        if (data.ecg_isquemia) ecgFindings.push('Isquemia/Necrosis');
        if (data.ecg_extrasistoles) ecgFindings.push('>5 EV/min');
        if (data.ecg_otras_alteraciones) ecgFindings.push(data.ecg_otras_alteraciones);
        const ecgBloqueo = (data.ecg_bloqueo && data.ecg_bloqueo !== 'Ninguno') ? `, Bloqueo: ${data.ecg_bloqueo}` : '';
        const ecg = `ECG: Ritmo ${ecgRitmo}, FC ${data.ecg_frecuencia || data.frecuenciaEcg || '-'} lpm${ecgBloqueo}. ${ecgFindings.length > 0 ? `Hallazgos: ${ecgFindings.join(', ')}.` : 'Sin alteraciones reportadas.'}`;

        // Physical findings
        const physFindings: string[] = [];
        if (data.exploracion_s3) physFindings.push('S3');
        if (data.exploracion_ingurgitacion) physFindings.push('Ingurgitación yugular');
        if (data.exploracion_estertores) physFindings.push('Estertores crepitantes');
        if (data.exploracion_edema) physFindings.push('Edema MI');
        if (data.exploracion_estenosis_aortica) physFindings.push('Soplo aórtico (EA)');
        if (data.exploracion_soplo_carotideo) physFindings.push('Soplo carotídeo/déficit focal');
        const physExam = physFindings.length > 0 ? `Exploración Física: ${physFindings.join(', ')}.` : '';

        return `OBJETIVO:\n${vitals}\nLaboratorios: ${labs}\n${ecg}${physExam ? `\n${physExam}` : ''}`.trim();
    };

    const generateAssessment = () => {
        const auth = data.authorized_report_scales || {};
        const goldmanMap: Record<string, string> = { "I": "0.2%", "II": "1%", "III": "7%", "IV": "22%" };
        const goldmanRisk = goldmanMap[data.goldman || "I"];

        const lines = ["ANÁLISIS Y VALORACIÓN (RIESGOS):"];
        let count = 1;

        if (auth.asa !== false) lines.push(`${count++}. ASA: Clase ${data.asa || '-'}.`);
        if (auth.goldman !== false) lines.push(`${count++}. Riesgo Cardiaco (Goldman): Clase ${data.goldman || '-'} (MACE estimado: ${goldmanRisk}).`);
        if (auth.lee !== false) lines.push(`${count++}. Riesgo Cardiaco (Lee/RCRI): Clase ${data.lee || '-'}.`);
        if (auth.caprini !== false) lines.push(`${count++}. Riesgo Tromboembólico (Caprini): ${data.caprini || '-'} puntos.`);

        // ARISCAT is currently not in authorized list, let's assume it's always on or add it to list
        // For now, I'll keep it as is, or add it to the list if I want consistency.
        lines.push(`${count++}. Riesgo Pulmonar (ARISCAT): ${data.ariscat_total || '-'} puntos (${data.ariscat_categoria || '-'}).`);

        if (auth.gupta !== false) lines.push(`${count++}. Riesgo MACE (Gupta): ${data.gupta || 0}%.`);
        if (auth.nsqip !== false && data.nsqip_total) lines.push(`${count++}. Riesgo Complicación Mayor (NSQIP): ${data.nsqip_total}% — ${data.nsqip_riesgo || 'Bajo'}.`);
        if (auth.duke !== false) lines.push(`${count++}. Capacidad Funcional / Duke: ${data.duke_resultado || '-'}.`);

        if (auth.cha2ds2vasc !== false && (data.arritmia_tipo === 'fa' || data.valvula_protesis)) {
            lines.push(`${count++}. Riesgo Embólico (CHA₂DS₂-VASc): ${data.cha2ds2vasc || 0} pts.`);
        }
        if (auth.hasbled !== false && (data.arritmia_tipo === 'fa' || data.valvula_protesis)) {
            lines.push(`${count++}. Riesgo Sangrado (HAS-BLED): ${data.hasbled || 0} pts.`);
        }

        if (auth.stopBang !== false) {
            const sb = data.stopbang_total || 0;
            const saosRisk = sb >= 5 ? 'Alto' : sb >= 3 ? 'Intermedio' : 'Bajo';
            lines.push(`${count++}. Riesgo SAOS (STOP-BANG): ${sb} pts (${saosRisk}).`);
        }

        if (auth.fragilidad !== false) {
            lines.push(`${count++}. Escala de Fragilidad (CFS): ${data.fragilidad_score || 1}.`);
        }

        if (auth.khorana !== false && data.cancer_activo) {
            lines.push(`${count++}. Escala de Khorana: ${data.khorana_total || 0} pts (${data.khorana_riesgo || 'Bajo'}).`);
        }

        return lines.join('\n').trim();
    };

    const generatePlan = () => {
        const medInstructions = data.selectedMeds?.map(med => {
            const status = med.action === 'stop' ? `SUSPENDER ${med.daysPrior} días antes` : med.action === 'adjust' ? 'AJUSTAR DOSIS' : 'CONTINUAR';
            return `• ${med.name} (${med.dose}mg, ${med.route}): ${status}. Indicación: ${med.instructions}`;
        }).join('\n') || 'Sin fármacos registrados.';

        const stressDose = data.selectedMeds?.find(m => m.stressDoseRecommendation)?.stressDoseRecommendation;

        // STOP-BANG Recommendation
        const saosRec = (data.stopbang_total || 0) >= 5
            ? "\n- ALTO RIESGO SAOS: Se sugiere extubación despierto y monitoreo de oximetría continua postoperatoria."
            : "";

        // ECG Critical Alerts for Plan
        const ecgPlanAlerts: string[] = [];
        if (data.ecg_ritmo_especifico === 'Marcapasos') ecgPlanAlerts.push('Marcapasos activo: Usar bisturí bipolar. Evitar electrocauterio monopolar. Tener imán disponible.');
        if (data.ecg_bloqueo === '3er_Grado') ecgPlanAlerts.push('BLOQUEO COMPLETO: Valorar marcapasos temporal antes de CX.');
        if (data.ecg_bloqueo === 'Mobitz_II') ecgPlanAlerts.push('Bloqueo Mobitz II: Riesgo de progresión a BAV completo. Marcapasos de precaución.');
        if (data.ecg_isquemia) ecgPlanAlerts.push('Isquemia ECG: Optimizar antiisquémicos. Valorar diferir CX electiva.');
        if (data.ecg_brihh_completo) ecgPlanAlerts.push('BRIHH Completo: Evitar catéter Swan-Ganz sin marcapasos disponible.');
        if (data.exploracion_estenosis_aortica || data.flag_estenosis_aortica_severa) ecgPlanAlerts.push('ESTENOSIS AÓRTICA SEVERA: Mantener precarga y RVS. Evitar hipotensión.');
        if (data.exploracion_soplo_carotideo) ecgPlanAlerts.push('Soplo carotídeo: Mantener PAM estable. Evitar hipotensión brusca.');
        const ecgPlanSection = ecgPlanAlerts.length > 0 ? `\n\nALERTAS INTRAOPERATORIAS:\n${ecgPlanAlerts.map(a => `- ${a}`).join('\n')}` : '';

        return `PLAN OPERATORIO (NOM-004):\nCIRUGÍA: ${data.cirugiaProgramada || 'Programada'}\n\nRECOMENDACIONES FARMACOLÓGICAS:\n${medInstructions}\n${stressDose ? `\nPAUTA DE ESTRÉS: ${stressDose}\n` : ''}\nRECOMENDACIONES GENERALES:\n- ${data.ayuno || 'Ayuno estándar'}\n- ${data.recomendacionesGenerales || 'Seguir protocolo institucional'}\n- Metas Transoperatorias: TA < 180/110 mmHg, Glu 70-180 mg/dL.${saosRec}${ecgPlanSection}`.trim();
    };

    const fullNote = `VALORACIÓN MÉDICA PREOPERATORIA (NOM-004-SSA3-2012)\nFecha: ${data.fecha} | Hora: ${data.hora}\nUnidad: ${data.unidadMedica}\n\n${generateSubjective()}\n\n${generateObjective()}\n\n${generateAssessment()}\n\n${generatePlan()}\n\nNota generada por VPO Digital v2.2 ECO-MOD.`.trim();

    const sections = [
        { id: 'subj', title: 'Subjetivo', content: generateSubjective(), icon: User },
        { id: 'obj', title: 'Objetivo', content: generateObjective(), icon: Activity },
        { id: 'ass', title: 'Riesgos/Análisis', content: generateAssessment(), icon: ShieldCheck },
        { id: 'plan', title: 'Plan (NOM-004)', content: generatePlan(), icon: Pill }
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full animate-fadeIn">
            <div className="bg-clinical-navy p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FileText size={20} />
                    <h2 className="font-bold text-lg">Generador de Nota Médica</h2>
                </div>
                <button
                    onClick={() => handleCopy(fullNote, 'full')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${isUnlocked
                            ? 'bg-white/20 hover:bg-white/30'
                            : 'bg-amber-500/80 hover:bg-amber-400/80'
                        }`}
                    title={isUnlocked ? 'Copiar nota completa' : 'Desbloquear VPO para copiar'}
                >
                    {isUnlocked
                        ? (copiedSection === 'full' ? <Check size={14} /> : <Copy size={14} />)
                        : <Lock size={14} />
                    }
                    {isUnlocked ? 'COPIAR NOTA COMPLETA' : 'DESBLOQUEAR PARA COPIAR'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
                {/* Lock banner when VPO not unlocked */}
                {!isUnlocked && (
                    <div className="p-3 bg-amber-100 border border-amber-300 rounded-lg text-[11px] text-amber-900 flex items-start gap-2 shadow-sm">
                        <Lock size={14} className="shrink-0 mt-0.5 text-amber-600" />
                        <span><b>VPO bloqueado.</b> Puedes consultar la nota, pero la copia está restringida. Desbloquea el VPO para habilitar la función de copiado.</span>
                    </div>
                )}
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-[10px] text-amber-800 flex items-start gap-2">
                    <Clipboard size={14} className="shrink-0 mt-0.5" />
                    <span>Esta nota está estructurada bajo la norma <b>NOM-004-SSA3-2012</b>. Puede copiar secciones individuales o la nota completa para integrarla a su expediente electrónico.</span>
                </div>

                {sections.map(section => (
                    <div key={section.id} className="group relative">
                        <div className="flex items-center gap-2 mb-2">
                            <section.icon size={16} className="text-clinical-navy" />
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{section.title}</h3>
                        </div>
                        <div className="relative bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:border-clinical-navy transition-colors">
                            <pre className="text-xs text-slate-700 font-sans whitespace-pre-wrap leading-relaxed">
                                {section.content}
                            </pre>
                            <button
                                onClick={() => handleCopy(section.content, section.id)}
                                className={`absolute top-2 right-2 p-2 transition-colors opacity-0 group-hover:opacity-100 ${isUnlocked
                                        ? 'text-slate-300 hover:text-clinical-navy'
                                        : 'text-amber-400 hover:text-amber-600'
                                    }`}
                                title={isUnlocked ? 'Copiar sección' : 'Desbloquear VPO para copiar'}
                            >
                                {isUnlocked
                                    ? (copiedSection === section.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />)
                                    : <Lock size={16} />
                                }
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-gray-50 border-t text-[10px] text-center text-gray-400 italic font-medium">
                VPO Digital • Centro Médico Nacional Siglo XXI
            </div>
        </div>
    );
};

export default MedicalNoteGenerator;
