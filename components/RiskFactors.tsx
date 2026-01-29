import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData } from '../types';
import {
    AlertCircle, FileWarning, Cigarette, Heart, Activity, Brain, ShieldAlert,
    ChevronDown, ChevronUp, Wind, Droplets, FlaskConical, Stethoscope
} from 'lucide-react';

// --- ACCORDION CARD COMPONENT ---
interface RiskAccordionProps {
    label: string;
    name: keyof VPOData;
    icon?: React.ElementType;
    children?: React.ReactNode;
    warningIf?: boolean;
}

const RiskAccordion = ({
    label,
    name,
    icon: Icon,
    children,
    warningIf
}: RiskAccordionProps) => {
    const { register, watch } = useFormContext<VPOData>();
    const isOpen = watch(name) as boolean;

    return (
        <div className={`border rounded-xl transition-all duration-300 overflow-hidden ${isOpen ? 'border-clinical-navy bg-white shadow-md' : 'border-gray-200 bg-white'}`}>
            <label className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 ${isOpen ? 'bg-blue-50/50' : ''}`}>
                <div className="flex items-center gap-3">
                    <input type="checkbox" {...register(name)} className="w-5 h-5 rounded border-gray-300 text-clinical-navy focus:ring-clinical-navy" />
                    <div className="flex items-center gap-2">
                        {Icon && <Icon size={20} className={isOpen ? 'text-clinical-navy' : 'text-gray-400'} />}
                        <span className={`font-bold text-sm ${isOpen ? 'text-clinical-navy' : 'text-gray-600'}`}>{label}</span>
                    </div>
                    {/* Visual Warning Indicator on Header if Logic detected risk inside */}
                    {isOpen && warningIf && <AlertCircle size={16} className="text-red-500 animate-pulse" />}
                </div>
                {isOpen ? <ChevronUp size={18} className="text-clinical-navy" /> : <ChevronDown size={18} className="text-gray-400" />}
            </label>

            {/* EXPANDABLE CONTENT */}
            {isOpen && (
                <div className="p-4 border-t border-gray-100 bg-white animate-fadeIn space-y-3">
                    {children}
                </div>
            )}
        </div>
    );
};

const RiskFactors: React.FC = () => {
    const { register, watch, setValue } = useFormContext<VPOData>();

    // Logic dependencies for Smoking Index
    const cigarros = watch('cigarrosDia');
    const anios = watch('aniosFumando');
    const tabaquismo = watch('tabaquismo');

    // Smoking Index Calculation
    useEffect(() => {
        if (tabaquismo && cigarros > 0 && anios > 0) {
            const it = (cigarros * anios) / 20;
            setValue('indiceTabaquico', parseFloat(it.toFixed(1)));
            let riesgo = "Leve";
            if (it >= 10 && it < 20) riesgo = "Moderado";
            if (it >= 20) riesgo = "Intenso (Alto Riesgo EPOC)";
            setValue('riesgoEPOC', riesgo);
        } else {
            setValue('indiceTabaquico', 0);
            setValue('riesgoEPOC', "");
        }
    }, [tabaquismo, cigarros, anios, setValue]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
                <FileWarning className="text-clinical-navy" size={20} />
                <h2 className="text-lg font-bold text-slate-800">Factores de Riesgo (Interrogatorio)</h2>
            </div>

            <div className="grid grid-cols-1 gap-3">

                {/* 1. TABAQUISMO */}
                <RiskAccordion label="Tabaquismo" name="tabaquismo" icon={Cigarette} warningIf={(watch('indiceTabaquico') || 0) >= 20}>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Calculadora Índice Tabáquico</h4>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-[10px] text-gray-400">Cigarros/día</label>
                                <input type="number" {...register('cigarrosDia', { valueAsNumber: true })} className="w-full p-2 border rounded text-center font-bold" />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] text-gray-400">Años fumando</label>
                                <input type="number" {...register('aniosFumando', { valueAsNumber: true })} className="w-full p-2 border rounded text-center font-bold" />
                            </div>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-600">IT: {watch('indiceTabaquico')}</span>
                            <span className={`text-xs font-bold ${watch('indiceTabaquico') >= 20 ? 'text-red-600' : 'text-green-600'}`}>
                                {watch('riesgoEPOC')}
                            </span>
                        </div>
                    </div>
                </RiskAccordion>

                {/* 2. ALERGIAS */}
                <RiskAccordion label="Alergias" name="alergicos" icon={AlertCircle} warningIf={watch('alergicos')}>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Detalle de Alergias</label>
                        <textarea
                            {...register('alergicosDetalle')}
                            rows={2}
                            placeholder="Medicamentos, alimentos, látex..."
                            className="w-full mt-1 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-clinical-navy outline-none bg-gray-50"
                        />
                        {watch('alergicos') && !watch('alergicosDetalle') && (
                            <p className="text-[10px] text-amber-600 font-bold mt-1">⚠️ Especifique las alergias detectadas.</p>
                        )}
                    </div>
                </RiskAccordion>

                {/* 3. HIPERTENSIÓN (HTA) */}
                <RiskAccordion label="Hipertensión Arterial" name="hta" icon={Activity} warningIf={watch('hta_control') === 'descontrolada'}>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Estado Actual</label>
                            <select {...register('hta_control')} className="w-full mt-1 p-2 border rounded-lg text-sm bg-white">
                                <option value="controlada">Controlada</option>
                                <option value="descontrolada">Descontrolada {'>'} 140/90 (ASA III)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Tiempo Dx (Años)</label>
                            <input {...register('hta_tiempo')} className="w-full mt-1 p-2 border rounded-lg text-sm" placeholder="#" />
                        </div>
                    </div>
                </RiskAccordion>

                {/* 4. DIABETES */}
                <RiskAccordion label="Diabetes Mellitus" name="diabetes" icon={Droplets}>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Tipo</label>
                            <select {...register('diabetesTipo')} className="w-full mt-1 p-2 border rounded-lg text-sm bg-white">
                                <option value="2">Tipo 2</option>
                                <option value="1">Tipo 1</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Tiempo Dx (Años)</label>
                            <input {...register('diabetesTiempo')} className="w-full mt-1 p-2 border rounded-lg text-sm" placeholder="#" />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 mt-2 p-2 border rounded bg-orange-50 border-orange-100 cursor-pointer">
                        <input type="checkbox" {...register('usaInsulina')} className="w-4 h-4 text-orange-600 rounded" />
                        <span className="text-sm font-bold text-orange-800">¿Requiere Insulina?</span>
                    </label>
                </RiskAccordion>

                {/* 5. CARDIOPATÍA ISQUÉMICA */}
                <RiskAccordion
                    label="Cardiopatía Isquémica"
                    name="cardiopatiaIsquemica"
                    icon={Heart}
                    warningIf={watch('cardio_tipo_evento') === 'iam' || watch('cardio_tipo_evento') === 'angina_inestable'}
                >
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Evento más reciente</label>
                            <select {...register('cardio_tipo_evento')} className="w-full mt-1 p-2 border rounded-lg text-sm bg-white">
                                <option value="angina_estable">Angina Estable (CCS I-II)</option>
                                <option value="angina_inestable">Angina Inestable (CCS III-IV) [+10 Detsky]</option>
                                <option value="iam">Infarto Agudo de Miocardio (IAM)</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                Fecha del Último Evento <span className="text-red-500">*Crítico</span>
                            </label>
                            <input type="date" {...register('cardio_fecha_evento')} className="w-full mt-1 p-2 border rounded-lg text-sm" />
                            <p className="text-[10px] text-gray-400 mt-1">Si es IAM {'<'} 6 meses = Alto Riesgo (Goldman/Detsky)</p>
                        </div>

                        {/* STENT INPUTS */}
                        <label className="flex items-center gap-2 mt-2 p-2 border rounded bg-indigo-50 border-indigo-100 cursor-pointer">
                            <input type="checkbox" {...register('cardio_stent')} className="w-4 h-4 text-indigo-600 rounded" />
                            <span className="text-sm font-bold text-indigo-900">Portador de Stent Coronario</span>
                        </label>
                        {watch('cardio_stent') && (
                            <div className="pl-4 mt-2 grid grid-cols-2 gap-2 animate-fadeIn p-2 bg-indigo-50/50 rounded-lg">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Fecha Colocación</label>
                                    <input type="date" {...register('stent_fecha_colocacion')} className="w-full mt-1 p-2 border rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Tipo de Stent</label>
                                    <select {...register('stent_tipo')} className="w-full mt-1 p-2 border rounded-lg text-sm bg-white">
                                        <option value="DES">Farmacoactivo (DES)</option>
                                        <option value="BMS">Metálico (BMS)</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </RiskAccordion>

                {/* 6. INSUFICIENCIA CARDIACA */}
                <RiskAccordion label="Insuficiencia Cardiaca (ICC)" name="icc" icon={Heart}>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Clase (NYHA)</label>
                            <select {...register('icc_nyha')} className="w-full mt-1 p-2 border rounded-lg text-sm bg-white">
                                <option value="I">I (Sin disnea)</option>
                                <option value="II">II (Esfuerzos moderados)</option>
                                <option value="III">III (Esfuerzos leves)</option>
                                <option value="IV">IV (Reposo)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Evolución</label>
                            <select {...register('icc_evolucion')} className="w-full mt-1 p-2 border rounded-lg text-sm bg-white">
                                <option value="cronica_comp">Crónica Compensada</option>
                                <option value="cronica_descomp">Crónica Descompensada</option>
                                <option value="aguda">Aguda / Debut</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-2 border-t pt-2">
                        <label className="flex items-center gap-2 mb-2">
                            <input type="checkbox" {...register('icc_historia_eap')} className="w-4 h-4 text-clinical-navy rounded" />
                            <span className="text-xs font-bold text-slate-700">Antecedente Edema Agudo Pulmón (EAP)</span>
                        </label>
                        {watch('icc_historia_eap') && (
                            <div className="pl-6 animate-fadeIn">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Fecha Último EAP</label>
                                <input type="date" {...register('icc_fecha_eap')} className="w-full mt-1 p-2 border rounded-lg text-sm" />
                                <span className="text-[9px] text-red-500">Si es {'<'} 1 semana = +10 Pts Detsky</span>
                            </div>
                        )}
                    </div>
                </RiskAccordion>

                {/* 7. ARRITMIAS */}
                <RiskAccordion label="Arritmias" name="arritmias" icon={Activity}>
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Tipo</label>
                            <select {...register('arritmia_tipo')} className="w-full mt-1 p-2 border rounded-lg text-sm bg-white">
                                <option value="fa">Fibrilación Auricular (FA)</option>
                                <option value="flutter">Flutter Auricular</option>
                                <option value="bloqueo">Bloqueo AV (II/III)</option>
                                <option value="tsv">Taquicardia Supraventricular</option>
                                <option value="extrasistoles">Extrasístoles Ventriculares</option>
                                <option value="otra">Otra</option>
                            </select>
                        </div>
                        <label className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded">
                            <input type="checkbox" {...register('marcapasos')} className="w-4 h-4 text-clinical-navy rounded" />
                            <span className="text-xs font-bold text-slate-700">Portador de Marcapasos / DAI</span>
                        </label>
                    </div>
                </RiskAccordion>

                {/* 8. VALVULOPATÍAS */}
                <RiskAccordion
                    label="Valvulopatías"
                    name="valvulopatia"
                    icon={Heart}
                    warningIf={watch('valvula_afectada') === 'aortica' && watch('valvula_patologia') === 'estenosis' && watch('valvula_severidad') === 'severa'}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Válvula</label>
                            <select {...register('valvula_afectada')} className="w-full mt-1 p-2 border rounded-lg text-sm bg-white">
                                <option value="aortica">Aórtica</option>
                                <option value="mitral">Mitral</option>
                                <option value="tricuspide">Tricúspide</option>
                                <option value="pulmonar">Pulmonar</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Patología</label>
                            <select {...register('valvula_patologia')} className="w-full mt-1 p-2 border rounded-lg text-sm bg-white">
                                <option value="estenosis">Estenosis</option>
                                <option value="insuficiencia">Insuficiencia</option>
                                <option value="doble">Doble Lesión</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Severidad</label>
                            <select {...register('valvula_severidad')} className="w-full mt-1 p-2 border rounded-lg text-sm bg-white font-bold text-slate-700">
                                <option value="leve">Leve</option>
                                <option value="moderada">Moderada</option>
                                <option value="severa">Severa / Crítica</option>
                            </select>
                            {watch('valvula_severidad') === 'severa' && watch('valvula_afectada') === 'aortica' && (
                                <span className="text-[10px] text-red-600 block mt-1 font-bold">ALERTA: Estenosis Aórtica Severa = Alto Riesgo (Goldman/Detsky)</span>
                            )}
                        </div>
                        {/* PROSTHESIS CHECKBOX */}
                        <div className="col-span-2">
                            <label className="flex items-center gap-2 mt-2 p-2 bg-slate-50 border border-slate-200 rounded cursor-pointer">
                                <input type="checkbox" {...register('valvula_protesis')} className="w-4 h-4 text-clinical-navy rounded" />
                                <span className="text-xs font-bold text-slate-700">Portador de Prótesis Valvular</span>
                            </label>
                        </div>
                    </div>
                </RiskAccordion>

                {/* 9. NEUROLOGÍA (EVC) */}
                <RiskAccordion label="Enf. Vascular Cerebral (EVC)" name="evc" icon={Brain}>
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Fecha del Evento</label>
                            <input type="date" {...register('evc_fecha')} className="w-full mt-1 p-2 border rounded-lg text-sm" />
                            <p className="text-[10px] text-gray-400 mt-1">
                                Si {'<'} 3 meses = ASA IV (Diferir Electiva). Si {'<'} 1 mes = Caprini +5.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Tipo</label>
                                <select {...register('evc_tipo')} className="w-full mt-1 p-2 border rounded-lg text-sm bg-white">
                                    <option value="isquemico">Isquémico</option>
                                    <option value="hemorragico">Hemorrágico</option>
                                    <option value="ait">AIT (Transitorio)</option>
                                </select>
                            </div>
                        </div>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" {...register('evc_secuelas')} className="w-4 h-4 text-clinical-navy rounded" />
                            <span className="text-xs font-bold text-slate-700">Secuelas Neurológicas / Motoras</span>
                        </label>
                    </div>
                </RiskAccordion>

                {/* 10. NEUMOPATÍA */}
                <RiskAccordion label="Neumopatía (Pulmonar)" name="neumopatia" icon={Wind}>
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Patología</label>
                            <select {...register('neumo_tipo')} className="w-full mt-1 p-2 border rounded-lg text-sm bg-white">
                                <option value="epoc">EPOC (Enfisema/Bronquitis)</option>
                                <option value="asma">ASMA</option>
                                <option value="saohs">SAOHS (Apnea del Sueño)</option>
                                <option value="fibrosis">Fibrosis Pulmonar / Intersticial</option>
                                <option value="otra">Otra</option>
                            </select>
                            {watch('neumo_tipo') === 'saohs' && (
                                <div className="mt-1 p-2 bg-amber-50 text-amber-800 text-xs rounded border border-amber-200">
                                    ⚠️ Alerta: Riesgo Vía Aérea Difícil + Hipoxia post-extubación.
                                </div>
                            )}
                        </div>
                        <label className="flex items-center gap-2 p-2 border rounded">
                            <input type="checkbox" {...register('neumo_o2')} className="w-4 h-4 text-clinical-navy rounded" />
                            <span className="text-xs font-bold text-slate-700">Uso de Oxígeno Domiciliario</span>
                        </label>
                    </div>
                </RiskAccordion>

                {/* 11. RENAL (ERC) */}
                <RiskAccordion label="Enfermedad Renal (ERC)" name="enfRenalCronica" icon={FlaskConical}>
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Estadio (KDIGO)</label>
                            <select {...register('erc_estadio')} className="w-full mt-1 p-2 border rounded-lg text-sm bg-white">
                                <option value="G3a">G3a (TFG 45-59)</option>
                                <option value="G3b">G3b (TFG 30-44)</option>
                                <option value="G4">G4 (TFG 15-29)</option>
                                <option value="G5">G5 (TFG {'<'} 15)</option>
                            </select>
                        </div>
                        <label className="flex items-center gap-2 p-2 bg-red-50 border border-red-100 rounded">
                            <input type="checkbox" {...register('erc_dialisis')} className="w-4 h-4 text-red-600 rounded" />
                            <span className="text-xs font-bold text-red-800">En Terapia de Reemplazo (Diálisis/HD)</span>
                        </label>
                        {watch('erc_dialisis') && (
                            <p className="text-[10px] text-gray-500 ml-1">Nota: ASA III/IV Automático. Meta K {'<'} 5.0</p>
                        )}
                    </div>
                </RiskAccordion>

                {/* 12. HEPATOPATÍA */}
                <RiskAccordion label="Hepatopatía" name="hepatopatia" icon={Activity} warningIf={watch('hepato_child') === 'C'}>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Tipo</label>
                                <select {...register('hepato_tipo')} className="w-full mt-1 p-2 border rounded-lg text-sm bg-white">
                                    <option value="cirrosis">Cirrosis Hepática</option>
                                    <option value="hepatitis">Hepatitis Activa/Viral</option>
                                    <option value="higado_graso">Hígado Graso / NASH</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Child-Pugh</label>
                                <select {...register('hepato_child')} className="w-full mt-1 p-2 border rounded-lg text-sm bg-white">
                                    <option value="A">A (5-6 pts)</option>
                                    <option value="B">B (7-9 pts)</option>
                                    <option value="C">C (10-15 pts)</option>
                                </select>
                            </div>
                        </div>
                        {watch('hepato_child') === 'C' && (
                            <div className="p-2 bg-red-100 text-red-800 text-xs font-bold rounded text-center border border-red-200">
                                CONTRAINDICACIÓN RELATIVA: Mortalidad {'>'} 50%.
                            </div>
                        )}
                        <label className="flex items-center gap-2">
                            <input type="checkbox" {...register('hepato_coagulopatia')} className="w-4 h-4 text-clinical-navy rounded" />
                            <span className="text-xs font-bold text-slate-700">Coagulopatía (INR Prolongado)</span>
                        </label>
                    </div>
                </RiskAccordion>

                {/* 13. HEMATOLOGÍA */}
                <RiskAccordion label="Coagulopatía" name="coagulopatia" icon={Droplets}>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Tipo</label>
                        <input {...register('coag_tipo')} className="w-full mt-1 p-2 border rounded-lg text-sm" placeholder="Trombocitopenia, Hemofilia, V.Willebrand..." />
                    </div>
                </RiskAccordion>

                {/* ANTECEDENTES QX */}
                <div className="bg-white p-4 border border-gray-200 rounded-xl mt-4">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                        <Stethoscope size={16} /> Antecedentes Quirúrgicos
                    </label>
                    <textarea
                        {...register('cirugiasPrevias')}
                        rows={3}
                        className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-clinical-navy outline-none bg-gray-50"
                        placeholder="Cirugías previas, complicaciones anestésicas..."
                    />
                </div>

                {/* OTRAS ENFERMEDADES */}
                <div className="bg-white p-4 border border-gray-200 rounded-xl mt-4">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                        <AlertCircle size={16} /> Otras Enfermedades / Comorbilidades
                    </label>
                    <textarea
                        {...register('otrasEnfermedades')}
                        rows={2}
                        className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-clinical-navy outline-none bg-gray-50"
                        placeholder="Otras enfermedades no listadas arriba..."
                    />
                </div>

                {/* TRATAMIENTO ACTUAL */}
                <div className="bg-white p-4 border border-gray-200 rounded-xl">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                        <Stethoscope size={16} /> Tratamiento Actual (Crónico)
                    </label>
                    <textarea
                        {...register('tratamientoActual')}
                        rows={2}
                        className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-clinical-navy outline-none bg-gray-50"
                        placeholder="Fármacos crónicos, dosis, última toma..."
                    />
                </div>

                {/* FUNCTIONAL STATUS FOR GUPTA - Always visible */}
                <div className="bg-white p-4 border border-gray-200 rounded-xl">
                    <h3 className="text-xs font-bold text-clinical-navy uppercase mb-2 flex items-center gap-1">
                        <ShieldAlert size={12} /> Estado Funcional (Gupta)
                    </h3>
                    <select {...register('functional_status')} className="w-full mt-1 p-2 border rounded-lg text-sm bg-gray-50">
                        <option value="independent">Independiente (Sin ayuda)</option>
                        <option value="partial">Parcialmente Dependiente</option>
                        <option value="total">Totalmente Dependiente</option>
                    </select>

                    <div className="mt-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Sitio Quirúrgico (Gupta)</label>
                        <select {...register('gupta_surgical_site')} className="w-full mt-1 p-2 border rounded-lg text-xs bg-gray-50">
                            <option value="other">Otro / General</option>
                            <option value="amputation">Amputación</option>
                            <option value="anorectal">Anorrectal</option>
                            <option value="aortic">Aórtico</option>
                            <option value="bariatric">Bariátrico</option>
                            <option value="biliary">Biliar</option>
                            <option value="cardiac">Cardiaco</option>
                            <option value="ent">ORL / Tiroides</option>
                            <option value="intestinal">Intestinal</option>
                            <option value="intracranial">Intracraneal</option>
                            <option value="orthopedic">Ortopédico</option>
                            <option value="spinal">Columna</option>
                            <option value="thoracic">Torácico</option>
                            <option value="vascular">Vascular Periférico</option>
                            <option value="urologic">Urológico</option>
                            <option value="obstetric">Obstétrico</option>
                        </select>
                    </div>

                    {/* VRC SPECIFIC FACTORS (Visible for Vascular/Aortic/Amputation) */}
                    {(watch('gupta_surgical_site') === 'vascular' || watch('gupta_surgical_site') === 'aortic' || watch('gupta_surgical_site') === 'amputation') && (
                        <div className="mt-3 pt-3 border-t border-gray-200 animate-fadeIn bg-blue-50/50 p-2 rounded">
                            <label className="text-[10px] font-bold text-clinical-navy uppercase mb-1 block">
                                Criterios Específicos VRC (Vascular)
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" {...register('vrc_epoc')} className="w-4 h-4 text-clinical-navy rounded" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-700">EPOC (Diagnóstico Formal)</span>
                                        <span className="text-[9px] text-gray-500">Puntaje VRC independiente de Neumopatía</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" {...register('vrc_beta_blocker')} className="w-4 h-4 text-clinical-navy rounded" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-700">Uso de Beta-Bloqueador</span>
                                        <span className="text-[9px] text-gray-500">Tratamiento previo crónico</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* --- DATOS ECOCARDIOGRÁFICOS (CONDITIONAL) --- */}
            {(watch('icc') || watch('valvulopatia') || ['vascular', 'aortic', 'amputation', 'cardiac'].includes(watch('gupta_surgical_site'))) && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl mt-4 overflow-hidden animate-fadeIn shadow-sm">
                    <div className="bg-blue-100/50 p-4 border-b border-blue-200 flex items-center gap-2">
                        <Activity className="text-blue-700" size={20} />
                        <h3 className="text-base font-bold text-blue-900">Datos Ecocardiográficos</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        {/* FEVI */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">FEVI (%)</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    {...register('eco_fevi', { valueAsNumber: true })}
                                    className="w-24 p-2 border border-blue-200 rounded text-center font-bold text-blue-900 focus:ring-2 focus:ring-blue-400 outline-none"
                                    placeholder="60"
                                />
                                <span className="text-xs text-gray-500 font-medium">Fracción de Eyección del Ventrículo Izquierdo</span>
                            </div>
                            {(watch('eco_fevi') || 60) < 35 && (
                                <p className="text-[10px] text-red-600 font-bold mt-1 animate-pulse">
                                    ⚠️ FEVI MUY BAJA: Alto riesgo de choque cardiogénico.
                                </p>
                            )}
                        </div>

                        {/* CHECKBOXES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label className="flex items-center gap-2 p-3 bg-white border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors shadow-sm">
                                <input type="checkbox" {...register('eco_disfuncion_diastolica')} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                <span className="text-xs font-bold text-slate-700">Disfunción Diastólica Severa</span>
                            </label>
                            <label className="flex items-center gap-2 p-3 bg-white border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors shadow-sm">
                                <input type="checkbox" {...register('eco_psap_elevada')} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                <span className="text-xs font-bold text-slate-700">Hipertensión Pulmonar (PSAP {'>'} 45mmHg)</span>
                            </label>
                        </div>

                        {/* VALVULOPATIA */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Valvulopatía Significativa</label>
                            <select {...register('eco_valvulopatia')} className="w-full mt-1 p-2 border border-blue-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-400 outline-none">
                                <option value="ninguna">Ninguna / No Significativa</option>
                                <option value="estenosis_aortica_severa">Estenosis Aórtica Severa</option>
                                <option value="insuficiencia_mitral_severa">Insuficiencia Mitral Severa</option>
                            </select>
                            {watch('eco_valvulopatia') === 'estenosis_aortica_severa' && (
                                <p className="text-[10px] text-red-600 font-bold mt-1">
                                    ⚠️ ALERTA CRÍTICA: Mantener Precarga y RVS.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default RiskFactors;