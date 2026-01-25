import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData } from '../types';
import { Image, UploadCloud, HeartPulse, Activity, AlertTriangle, FileImage, Stethoscope, Bug, Microscope, Thermometer } from 'lucide-react';

const Gabinete: React.FC = () => {
    const { register, watch, setValue } = useFormContext<VPOData>();
    const [dragActive, setDragActive] = useState(false);

    // Watchers for Logic
    const data = watch();
    const ritmo = watch('ecg_ritmo_especifico');

    // --- ARISCAT CALCULATION LOGIC ---
    useEffect(() => {
        let points = 0;

        // 1. Age
        if (data.edad > 80) { points += 16; }
        else if (data.edad >= 51) { points += 3; }

        // 2. SpO2 Basal
        const spo2 = data.sato2 || 98; // Default to safe if not set, but practically handled
        if (spo2 <= 90) { points += 24; }
        else if (spo2 <= 95) { points += 8; }

        // 3. Infection
        if (data.ariscat_infeccion) { points += 17; }

        // 4. Anemia
        if ((data.hb || 12) < 10) { points += 11; }

        // 5. Incision
        if (data.ariscat_incision === 'abdominal_sup' || data.ariscat_incision === 'intratoracica') {
            points += 24;
        }

        // 6. Duration
        if (data.ariscat_duracion === 'mas_3') { points += 23; }
        else if (data.ariscat_duracion === '2_a_3') { points += 16; }

        setValue('ariscat_total', points);

        // Set Category and Text
        let category = "Bajo Riesgo";
        if (points >= 45) category = "ALTO RIESGO";
        else if (points >= 26) category = "Riesgo Moderado";
        setValue('ariscat_categoria', category);

    }, [data.edad, data.sato2, data.ariscat_infeccion, data.hb, data.ariscat_incision, data.ariscat_duracion, setValue]);


    // --- DUKE CRITERIA LOGIC (ENDOCARDITIS) ---

    // 1. AUTO-LINKAGE FROM PHYSICAL/LABS
    useEffect(() => {
        // FEVER: If temp >= 38.0, check minor criteria
        if ((data.temp || 0) >= 38.0) {
            setValue('duke_menor_fiebre', true);
        }

        // MURMUR: If new regurgitation found (Aortic Stenosis checked as proxy or generic Murmur), suggest major
        // Note: Aortic Stenosis is usually structural, but "Exploración Soplo" might be new.
        // We will allow manual override, but hint if murmur is present.
    }, [data.temp, setValue]);

    // 2. SCORE CALCULATION
    useEffect(() => {
        let majors = 0;
        if (data.duke_mayor_hemocultivo) majors++;
        if (data.duke_mayor_eco) majors++;
        if (data.duke_mayor_regurgitacion) majors++;

        let minors = 0;
        if (data.duke_menor_predisposicion) minors++;
        if (data.duke_menor_fiebre) minors++;
        if (data.duke_menor_vascular) minors++;
        if (data.duke_menor_inmuno) minors++;
        if (data.duke_menor_micro) minors++;

        let result: "Definitivo" | "Posible" | "Rechazado" = "Rechazado";

        // DEFINITIVO: 2 Mayores OR 1 Mayor + 3 Menores OR 5 Menores
        if (majors >= 2 || (majors >= 1 && minors >= 3) || minors >= 5) {
            result = "Definitivo";
        }
        // POSIBLE: 1 Mayor + 1 Menor OR 3 Menores
        else if ((majors >= 1 && minors >= 1) || minors >= 3) {
            result = "Posible";
        }

        setValue('duke_resultado', result);

    }, [
        data.duke_mayor_hemocultivo, data.duke_mayor_eco, data.duke_mayor_regurgitacion,
        data.duke_menor_predisposicion, data.duke_menor_fiebre, data.duke_menor_vascular,
        data.duke_menor_inmuno, data.duke_menor_micro, setValue
    ]);


    // --- IMAGE UPLOAD HANDLER ---
    const handleFile = (files: FileList | null, field: 'rx_imagen' | 'ekg_imagen') => {
        if (files && files[0]) {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setValue(field, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const DukeCheckbox = ({ name, label, autoNote }: { name: keyof VPOData, label: string, autoNote?: string }) => (
        <label className="flex items-start gap-2 p-2 rounded hover:bg-white/50 cursor-pointer border border-transparent hover:border-purple-200 transition-colors">
            <input type="checkbox" {...register(name)} className="mt-1 w-4 h-4 text-purple-700 rounded border-gray-300 focus:ring-purple-700" />
            <div className="flex flex-col">
                <span className="text-xs text-slate-700 leading-tight">{label}</span>
                {autoNote && <span className="text-[9px] text-purple-600 font-bold bg-purple-100 px-1 rounded w-fit mt-0.5">{autoNote}</span>}
            </div>
        </label>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2 px-1">
                <FileImage className="text-clinical-navy" size={20} />
                <h2 className="text-lg font-bold text-slate-800">Gabinete Médicos v2</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* --- MODULE 1: RADIOGRAFÍA & ARISCAT --- */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-4 text-clinical-navy border-b border-gray-100 pb-2">
                        <Image size={18} />
                        <h3 className="font-bold text-sm">Radiografía de Tórax</h3>
                    </div>

                    {/* Image Upload Area */}
                    <div
                        className={`border-2 border-dashed rounded-xl p-6 text-center mb-4 transition-colors ${dragActive ? 'border-clinical-navy bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
                        onDragEnter={() => setDragActive(true)}
                        onDragLeave={() => setDragActive(false)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragActive(false);
                            handleFile(e.dataTransfer.files, 'rx_imagen');
                        }}
                    >
                        <input
                            type="file"
                            id="rx-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFile(e.target.files, 'rx_imagen')}
                        />
                        {watch('rx_imagen') ? (
                            <div className="relative">
                                <img src={watch('rx_imagen')} alt="RX Preview" className="max-h-48 mx-auto rounded-lg shadow-sm" />
                                <button
                                    type="button"
                                    onClick={() => setValue('rx_imagen', '')}
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1 shadow-md hover:bg-red-600"
                                >
                                    <AlertTriangle size={12} />
                                </button>
                            </div>
                        ) : (
                            <label htmlFor="rx-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                <UploadCloud size={32} className="text-gray-400" />
                                <span className="text-sm font-bold text-clinical-navy">Subir / Arrastrar RX</span>
                                <span className="text-[10px] text-gray-400">JPG, PNG admitidos</span>
                            </label>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Fecha RX</label>
                            <input type="date" {...register('rx_fecha')} className="w-full mt-1 p-2 border rounded-lg text-sm" />
                        </div>
                        {/* SpO2 Reuse display */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">SpO2 Basal (Actual)</label>
                            <div className={`w-full mt-1 p-2 border rounded-lg text-sm font-bold text-center ${data.sato2 <= 90 ? 'bg-red-50 text-red-600' : 'bg-gray-50'}`}>
                                {data.sato2 || 0}%
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Descripción Radiológica</label>
                        <textarea
                            {...register('rx_descripcion')}
                            rows={3}
                            className="w-full mt-1 p-3 border rounded-lg text-sm focus:ring-2 focus:ring-clinical-navy outline-none"
                            placeholder="Infiltrados, cardiomegalia, derrame..."
                        />
                    </div>

                    {/* ARISCAT CALCULATOR INPUTS */}
                    <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100">
                        <h4 className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1">
                            <Activity size={12} /> Calculadora ARISCAT (Riesgo Pulmonar)
                        </h4>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded border border-blue-100">
                                <input type="checkbox" {...register('ariscat_infeccion')} className="w-4 h-4 text-clinical-navy rounded" />
                                <span className="text-xs font-semibold text-slate-700">Infección Respiratoria reciente (último mes)</span>
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Sitio Incisión</label>
                                    <select {...register('ariscat_incision')} className="w-full mt-1 p-2 border rounded text-xs bg-white">
                                        <option value="periferica">Periférica (Bajo)</option>
                                        <option value="abdominal_sup">Abdominal Sup.</option>
                                        <option value="intratoracica">Intratorácica</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Duración Cx</label>
                                    <select {...register('ariscat_duracion')} className="w-full mt-1 p-2 border rounded text-xs bg-white">
                                        <option value="menos_2">{'<'} 2 Horas</option>
                                        <option value="2_a_3">2 - 3 Horas</option>
                                        <option value="mas_3">{'>'} 3 Horas</option>
                                    </select>
                                </div>
                            </div>

                            {/* ARISCAT RESULT */}
                            <div className="flex items-center justify-between border-t border-blue-200 pt-2 mt-2">
                                <div>
                                    <span className="text-[10px] text-gray-500 block">Puntaje Total</span>
                                    <span className="text-lg font-bold text-slate-800">{watch('ariscat_total') || 0} pts</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-gray-500 block">Categoría</span>
                                    <span className={`text-sm font-bold uppercase ${(watch('ariscat_total') || 0) >= 45 ? 'text-red-600' :
                                        (watch('ariscat_total') || 0) >= 26 ? 'text-orange-500' : 'text-green-600'
                                        }`}>
                                        {watch('ariscat_categoria')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MODULE 2: ECG ESTRUCTURADO --- */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-4 text-clinical-navy border-b border-gray-100 pb-2">
                        <HeartPulse size={18} />
                        <h3 className="font-bold text-sm">Electrocardiograma</h3>
                    </div>

                    {/* Image Upload Area for EKG */}
                    <div
                        className={`border-2 border-dashed rounded-xl p-4 text-center mb-4 transition-colors ${dragActive ? 'border-clinical-navy bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
                        onDragEnter={() => setDragActive(true)}
                        onDragLeave={() => setDragActive(false)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragActive(false);
                            handleFile(e.dataTransfer.files, 'ekg_imagen');
                        }}
                    >
                        <input
                            type="file"
                            id="ekg-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFile(e.target.files, 'ekg_imagen')}
                        />
                        {watch('ekg_imagen') ? (
                            <div className="relative">
                                <img src={watch('ekg_imagen')} alt="EKG Preview" className="max-h-32 mx-auto rounded-lg shadow-sm" />
                                <button
                                    type="button"
                                    onClick={() => setValue('ekg_imagen', '')}
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1 shadow-md hover:bg-red-600"
                                >
                                    <AlertTriangle size={12} />
                                </button>
                            </div>
                        ) : (
                            <label htmlFor="ekg-upload" className="cursor-pointer flex flex-col items-center gap-1">
                                <UploadCloud size={24} className="text-gray-400" />
                                <span className="text-xs font-bold text-clinical-navy">Subir / Arrastrar EKG</span>
                                <span className="text-[9px] text-gray-400">Imagen del trazo</span>
                            </label>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Fecha ECG</label>
                            <input type="date" {...register('ecg_fecha')} className="w-full mt-1 p-2 border rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Frecuencia (lpm)</label>
                            <input type="number" {...register('ecg_frecuencia', { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded-lg text-sm font-bold text-center" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Ritmo</label>
                            <select {...register('ecg_ritmo_especifico')} className="w-full mt-1 p-2 border rounded-lg text-sm bg-gray-50 font-medium">
                                <option value="Sinusal">Sinusal</option>
                                <option value="FA">Fibrilación Auricular</option>
                                <option value="Flutter">Flutter Auricular</option>
                                <option value="Union">Ritmo de la Unión</option>
                                <option value="Marcapasos">Marcapasos</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Bloqueo AV</label>
                            <select {...register('ecg_bloqueo')} className="w-full mt-1 p-2 border rounded-lg text-sm bg-gray-50 font-medium">
                                <option value="Ninguno">Ninguno</option>
                                <option value="1er_Grado">1er Grado</option>
                                <option value="Mobitz_I">Mobitz I</option>
                                <option value="Mobitz_II">Mobitz II</option>
                                <option value="3er_Grado">3er Grado (Completo)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2 mb-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Alteraciones Específicas</label>
                        <div className="grid grid-cols-1 gap-2">
                            <label className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" {...register('ecg_hvi')} className="w-4 h-4 text-clinical-navy rounded" />
                                <span className="text-xs font-medium">HVI (Criterios Sokolow/Cornell)</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" {...register('ecg_brihh_incompleto')} className="w-4 h-4 text-clinical-navy rounded" />
                                <span className="text-xs font-medium">BRIHH Incompleto</span>
                            </label>
                            <label className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${watch('ecg_brihh_completo') ? 'bg-red-50 border-red-300' : 'hover:bg-gray-50'}`}>
                                <input type="checkbox" {...register('ecg_brihh_completo')} className="w-4 h-4 text-clinical-navy rounded" />
                                <span className={`text-xs font-bold ${watch('ecg_brihh_completo') ? 'text-red-700' : ''}`}>BRIHH Completo (Alerta Lee)</span>
                            </label>
                            <label className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${watch('ecg_isquemia') ? 'bg-red-50 border-red-300' : 'hover:bg-gray-50'}`}>
                                <input type="checkbox" {...register('ecg_isquemia')} className="w-4 h-4 text-clinical-navy rounded" />
                                <div className="flex flex-col">
                                    <span className={`text-xs font-bold ${watch('ecg_isquemia') ? 'text-red-700' : ''}`}>Isquemia / Necrosis</span>
                                    <span className="text-[9px] text-gray-500">Q patológica, ST elevado/deprimido, T invertida</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" {...register('ecg_extrasistoles')} className="w-4 h-4 text-clinical-navy rounded" />
                                <span className="text-xs font-medium">{'>'} 5 Extrasístoles Ventriculares/min</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Otras Alteraciones</label>
                        <input {...register('ecg_otras_alteraciones')} className="w-full mt-1 p-2 border rounded-lg text-sm" placeholder="Eje desviado, QT largo, etc." />
                    </div>

                    {/* Logic Alerts */}
                    {(ritmo === 'FA' || ritmo === 'Flutter') && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 animate-fadeIn">
                            <AlertTriangle className="text-amber-600 mt-0.5" size={16} />
                            <p className="text-xs text-amber-800">
                                <strong>Alerta Fibrilación/Flutter:</strong> Verifique sección de Anticoagulación en "Fármacos" y calcule riesgo trombótico.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODULE 3: ENDOCARDITIS (DUKE) --- */}
            <div className="bg-purple-50/50 p-4 rounded-xl shadow-sm border border-purple-100">
                <div className="flex items-center justify-between mb-4 border-b border-purple-200 pb-2">
                    <div className="flex items-center gap-2 text-purple-900">
                        <Bug size={18} />
                        <h3 className="font-bold text-sm">Endocarditis Infecciosa (Duke)</h3>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase
                  ${data.duke_resultado === 'Definitivo' ? 'bg-red-600 text-white animate-pulse' :
                            data.duke_resultado === 'Posible' ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'}`
                    }>
                        {data.duke_resultado || 'Rechazado'}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Criterios Mayores */}
                    <div>
                        <h4 className="text-[10px] font-bold text-purple-700 uppercase mb-2 flex items-center gap-1">
                            <Microscope size={12} /> Criterios Mayores
                        </h4>
                        <div className="space-y-1">
                            <DukeCheckbox name="duke_mayor_hemocultivo" label="Hemocultivos Positivos (Típicos)" />
                            <DukeCheckbox name="duke_mayor_eco" label="Evidencia Ecocardiográfica (Vegetación/Absceso)" />
                            <DukeCheckbox
                                name="duke_mayor_regurgitacion"
                                label="Nueva Regurgitación Valvular"
                                autoNote={data.exploracion_estenosis_aortica || data.exploracion_soplo_carotideo ? "Soplo detectado en física" : ""}
                            />
                        </div>
                    </div>

                    {/* Criterios Menores */}
                    <div>
                        <h4 className="text-[10px] font-bold text-purple-700 uppercase mb-2 flex items-center gap-1">
                            <Stethoscope size={12} /> Criterios Menores
                        </h4>
                        <div className="space-y-1">
                            <DukeCheckbox name="duke_menor_predisposicion" label="Predisposición (Cardiopatía o ADIV)" />
                            <DukeCheckbox
                                name="duke_menor_fiebre"
                                label="Fiebre ≥ 38.0°C"
                                autoNote={data.temp >= 38.0 ? `Detectado: ${data.temp}°C` : ""}
                            />
                            <DukeCheckbox name="duke_menor_vascular" label="Fenómenos Vasculares (Embolia, Infartos)" />
                            <DukeCheckbox name="duke_menor_inmuno" label="Fenómenos Inmunológicos (GMN, Osler, Roth)" />
                            <DukeCheckbox name="duke_menor_micro" label="Evidencia Microbiológica (No mayor)" />
                        </div>
                    </div>
                </div>

                {/* ALERTS */}
                {(data.duke_resultado === 'Definitivo' || data.duke_resultado === 'Posible') && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg flex items-start gap-2 animate-bounce-short">
                        <AlertTriangle className="text-red-600 mt-0.5 shrink-0" size={18} />
                        <div>
                            <h5 className="text-xs font-bold text-red-800 uppercase">ALERTA CRÍTICA: RIESGO ENDOCARDITIS</h5>
                            <p className="text-xs text-red-700 font-medium leading-tight mt-1">
                                Diferir cirugía electiva, iniciar protocolo de antibióticos y solicitar Ecocardiograma Transesofágico (ETE) urgente.
                            </p>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Gabinete;