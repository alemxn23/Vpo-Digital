
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData, Gender } from '../types';
import { Clipboard, Check, Copy, FileText, User, Activity, Pill, ShieldCheck } from 'lucide-react';

const MedicalNoteGenerator: React.FC = () => {
    const { watch } = useFormContext<VPOData>();
    const data = watch();
    const [copiedSection, setCopiedSection] = useState<string | null>(null);

    const handleCopy = (text: string, sectionId: string) => {
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
        const labs = `Hb: ${data.hb || '-'} g/dL, Hto: ${data.ht || '-'}%, Plaq: ${data.plaquetas || '-'} k/uL, Glu: ${data.glucosaCentral || '-'} mg/dL, Cr: ${data.creatinina || '-'} mg/dL, TFG: ${data.tfg || '-'} ml/min.`;
        const ecg = `ECG: Ritmo ${data.ritmo || '-'}, Frecuencia ${data.frecuenciaEcg || '-'} lpm. ${data.ecg_otras_alteraciones ? `Hallazgos: ${data.ecg_otras_alteraciones}` : ''}`;

        return `OBJETIVO:\n${vitals}\nLaboratorios: ${labs}\n${ecg}`.trim();
    };

    const generateAssessment = () => {
        const goldmanMap: Record<string, string> = { "I": "0.2%", "II": "1%", "III": "7%", "IV": "22%" };
        const goldmanRisk = goldmanMap[data.goldman || "I"];

        let extraScales = `\n6. Riesgo MACE (Gupta): ${data.gupta || 0}%.\n7. Capacidad Funcional (Duke): ${data.duke_resultado || '-'}.`;

        if (data.arritmia_tipo === 'fa' || data.valvula_protesis) {
            extraScales += `\n8. Riesgo Embólico (CHA₂DS₂-VASc): ${data.cha2ds2vasc || 0} pts.\n9. Riesgo Sangrado (HAS-BLED): ${data.hasbled || 0} pts.`;
        }

        const sb = data.stopbang_total || 0;
        const saosRisk = sb >= 5 ? 'Alto' : sb >= 3 ? 'Intermedio' : 'Bajo';
        extraScales += `\n10. Riesgo SAOS (STOP-BANG): ${sb} pts (${saosRisk}).`;

        return `ANÁLISIS Y VALORACIÓN (RIESGOS):\n1. ASA: Clase ${data.asa || '-'}.\n2. Riesgo Cardiaco (Goldman): Clase ${data.goldman || '-'} (MACE estimado: ${goldmanRisk}).\n3. Riesgo Cardiaco (Lee/RCRI): Clase ${data.lee || '-'}.\n4. Riesgo Tromboembólico (Caprini): ${data.caprini || '-'} puntos.\n5. Riesgo Pulmonar (ARISCAT): ${data.ariscat_total || '-'} puntos (${data.ariscat_categoria || '-'}).${extraScales}`.trim();
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

        return `PLAN OPERATORIO (NOM-004):\nCIRUGÍA: ${data.cirugiaProgramada || 'Programada'}\n\nRECOMENDACIONES FARMACOLÓGICAS:\n${medInstructions}\n${stressDose ? `\nPAUTA DE ESTRÉS: ${stressDose}\n` : ''}\nRECOMENDACIONES GENERALES:\n- ${data.ayuno || 'Ayuno estándar'}\n- ${data.recomendacionesGenerales || 'Seguir protocolo institucional'}\n- Metas Transoperatorias: TA < 180/110 mmHg, Glu 70-180 mg/dL.${saosRec}`.trim();
    };

    const fullNote = `VALORACIÓN MÉDICA PREOPERATORIA (NOM-004-SSA3-2012)\nFecha: ${data.fecha} | Hora: ${data.hora}\nUnidad: ${data.unidadMedica}\n\n${generateSubjective()}\n\n${generateObjective()}\n\n${generateAssessment()}\n\n${generatePlan()}\n\nNota generada por VPO Digital v2.1.`.trim();

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
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                >
                    {copiedSection === 'full' ? <Check size={14} /> : <Copy size={14} />}
                    COPIAR NOTA COMPLETA
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
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
                                className="absolute top-2 right-2 p-2 text-slate-300 hover:text-clinical-navy transition-colors opacity-0 group-hover:opacity-100"
                                title="Copiar sección"
                            >
                                {copiedSection === section.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
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
