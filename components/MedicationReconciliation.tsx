import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData, SelectedMed } from '../types';
import { Pill, Search, X, AlertTriangle, CalendarClock, CheckCircle, Ban, AlertCircle, Siren, Syringe, Tablets, RefreshCcw, Activity, ArrowRightLeft, Info, ChevronRight, Calculator } from 'lucide-react';

import { MEDICATIONS_DB } from '../data/medications';

const MedicationReconciliation: React.FC = () => {
    const { setValue, watch } = useFormContext<VPOData>();
    const selectedMeds = watch('selectedMeds') || [];
    const isUrgencia = watch('esUrgencia');

    const [searchTerm, setSearchTerm] = useState('');

    // Modals State
    const [showSteroidModal, setShowSteroidModal] = useState<SelectedMed | null>(null);
    const [showJustificationModal, setShowJustificationModal] = useState<SelectedMed | null>(null);
    const [showAnticoagModal, setShowAnticoagModal] = useState<SelectedMed | null>(null);
    const [showGLP1Modal, setShowGLP1Modal] = useState<SelectedMed | null>(null);

    // Logic hooks
    const [steroidDose, setSteroidDose] = useState(0);
    const [surgeryRisk, setSurgeryRisk] = useState<'minor' | 'moderate' | 'major'>('moderate');

    // Anticoagulant Logic State
    const [thromboticRisk, setThromboticRisk] = useState<'high' | 'low'>('low');
    const [bleedingRisk, setBleedingRisk] = useState<'high' | 'low'>('low');
    const [renalFunction, setRenalFunction] = useState<'normal' | 'low'>('normal'); // For DOACs

    // Normalize text for search (remove accents)
    const normalizeText = (text: string) => {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const filteredMeds = searchTerm.length > 1
        ? MEDICATIONS_DB.filter(m => {
            const searchNormalized = normalizeText(searchTerm);
            const nameNormalized = normalizeText(m.name);
            const categoryNormalized = normalizeText(m.category);

            const nameMatch = nameNormalized.includes(searchNormalized);
            const categoryMatch = categoryNormalized.includes(searchNormalized);

            // Check keywords if they exist
            const keywordMatch = (m as any).keywords
                ? (m as any).keywords.some((k: string) => normalizeText(k).includes(searchNormalized))
                : false;

            return (nameMatch || categoryMatch || keywordMatch) && !selectedMeds.some(s => s.id === m.id);
        })
        : [];

    // DEBUG: Verify DB Load
    console.log(`Medication DB Loaded: ${MEDICATIONS_DB.length} items. Search: "${searchTerm}" -> Results: ${filteredMeds.length}`);

    const handleAddMed = (med: any) => {
        console.log("Adding Med:", med); // DEBUG
        setSearchTerm('');

        let defaultRoute = 'VO';
        let defaultAlert = med.alertLevel;
        let defaultAction = med.action;
        let defaultInstructions = med.instructions;

        // Route Logic
        if (med.category === 'Antibiótico' || med.name.includes('Cefalo')) {
            defaultRoute = 'IV';
            defaultAction = 'continue';
        }
        // FORCE IV FOR SPECIFIC STEROIDS
        if (med.id === 'metil' || med.id === 'hidro') {
            defaultRoute = 'IV';
        }

        // Prepare Object
        const newMed: SelectedMed = {
            id: med.id,
            name: med.name,
            category: med.category,
            action: defaultAction as any,
            daysPrior: med.daysPrior || 0,
            instructions: defaultInstructions,
            alertLevel: defaultAlert as any,
            route: defaultRoute as any,
            dose: 0,
            isSteroid: med.isSteroid,
            isAnticoagulant: med.isAnticoagulant,
            anticoagType: med.anticoagType,
            isGLP1: med.isGLP1
        };

        // TRIGGER MODALS (PRIORITY)
        if (med.isSteroid) {
            console.log("Triggering Steroid Modal");
            setShowSteroidModal(newMed);
        } else if (med.isGLP1) {
            console.log("Triggering GLP1 Modal");
            setShowGLP1Modal(newMed);
        } else if (med.isAnticoagulant) {
            console.log("Triggering Anticoag Modal", newMed);
            setShowAnticoagModal(newMed);
        } else {
            setValue('selectedMeds', [...selectedMeds, newMed]);
        }
    };

    // --- MOTOR DE CONVERSIÓN VO -> IV (BIOEQUIVALENCIA) ---
    const handleRouteConversion = (med: SelectedMed, newRoute: string): SelectedMed => {
        let updatedMed = { ...med, route: newRoute as any, conversionMessage: '' };
        const currentDose = med.dose || 0;

        // A. PREDNISONA SPECIFIC (1:4 RATIO TO HYDRO)
        if (med.id === 'pred' && newRoute === 'IV') {
            const hydroDose = currentDose * 4;
            updatedMed.name = "Prednisona (Sustitución IV)";
            updatedMed.conversionMessage = `Bioequivalencia (1:4): ${currentDose}mg Prednisona ≈ ${hydroDose}mg Hidrocortisona.`;
            updatedMed.instructions = `Administrar Hidrocortisona ${hydroDose}mg IV cada 24h (dosis equivalente base) o seguir esquema de estrés.`;
            updatedMed.alertLevel = 'yellow';
            updatedMed.action = 'adjust';
        }
        // Revert Prednisona to VO
        else if (med.id === 'pred' && newRoute === 'VO') {
            updatedMed.name = 'Prednisona';
            updatedMed.conversionMessage = '';
            updatedMed.instructions = 'Continuar dosis habitual VO matutina.';
        }

        // B. GENERIC STEROIDS
        else if (med.isSteroid && med.id !== 'pred') {
            if (newRoute === 'IV') {
                if (med.id === 'metil' || med.id === 'hidro') {
                    updatedMed.instructions = "Uso IV Intrahospitalario.";
                } else {
                    // Fallback for others
                    const hydroEquiv = Math.round((currentDose / 5) * 20); // Rough estimate based on Pred
                    updatedMed.conversionMessage = `Equivalente aproximado a ${hydroEquiv}mg Hidrocortisona.`;
                }
            }
        }

        // C. ANTICOAGULANTES (AVK)
        else if (med.isAnticoagulant && med.anticoagType === 'AVK') {
            if (newRoute === 'IV') {
                updatedMed.route = 'SC';
                updatedMed.name = "Enoxaparina (Puente)";
                updatedMed.alertLevel = 'red';
                updatedMed.conversionMessage = "ERROR: AVK no tiene IV. Se cambió a HBPM SC (Puente).";
                updatedMed.instructions = "SUSPENDER Warfarina/Aceno. Iniciar Puente con Enoxaparina SC 1mg/kg c/12h (o según riesgo).";
                updatedMed.action = 'adjust';
            }
        }

        // D. METOPROLOL
        else if (med.id === 'meto' && newRoute === 'IV') {
            const ivDose = currentDose > 0 ? (currentDose / 2.5).toFixed(1) : '?';
            updatedMed.conversionMessage = "Relación 2.5:1 (VO:IV). Vigilar hipotensión/bradicardia.";
            updatedMed.instructions = `Dosis IV reducida (~${ivDose}mg). Administrar en bolo lento > 2 min bajo monitoreo.`;
            updatedMed.alertLevel = 'yellow';
        }

        return updatedMed as SelectedMed;
    };

    // --- STEROID MODAL SAVE ---
    const handleSaveSteroidConfig = () => {
        if (!showSteroidModal) return;

        let instructions = "";
        if (surgeryRisk === 'minor') {
            instructions = `Riesgo Qx Menor: Continuar dosis habitual (${steroidDose}mg) VO matutino. Si ayuno, Hidrocortisona equiv. dosis única.`;
        } else if (surgeryRisk === 'moderate') {
            instructions = `Riesgo Qx Moderado: Hidrocortisona 50mg IV en inducción, luego 25mg IV c/8h por 24h.`;
        } else if (surgeryRisk === 'major') {
            instructions = `Riesgo Qx Mayor: Hidrocortisona 100mg IV en inducción, luego 50mg IV c/8h por 48-72h.`;
        }

        const medToAdd = {
            ...showSteroidModal,
            dose: steroidDose,
            instructions: instructions,
            action: 'adjust' as const,
            alertLevel: 'yellow' as const
        };

        setValue('selectedMeds', [...selectedMeds, medToAdd]);
        setShowSteroidModal(null);
    };

    const handleSaveAnticoagConfig = () => {
        if (!showAnticoagModal) return;

        const med = showAnticoagModal;
        let instructions = "";
        let action: 'stop' | 'continue' | 'adjust' = 'stop';
        let daysPrior = 0;
        let alertLevel: 'green' | 'yellow' | 'red' = 'red';
        let bridgeNeeded = false;

        // AVK (Warfarina / Aceno)
        if (med.anticoagType === 'AVK') {
            daysPrior = 5;
            if (thromboticRisk === 'high') {
                instructions = "ALTO RIESGO TROMBÓTICO: Suspender 5 días antes. INICIAR PUENTEO con Enoxaparina dosis terapéutica.";
                bridgeNeeded = true;
            } else {
                instructions = "Bajo Riesgo Trombótico: Suspender 5 días antes. NO requiere puenteo (solo profilaxis postop).";
            }
        }
        // DOACs (Rivaroxaban, Apixaban, Dabigatran)
        else if (med.anticoagType === 'DOAC') {
            if (bleedingRisk === 'high') {
                daysPrior = 3; // 48-72h generally
                instructions = "ALTO RIESGO SANGRADO QX: Suspender ≥ 48-72h antes (sin puenteo).";
            } else {
                daysPrior = 1; // 24h
                instructions = "Bajo Riesgo Sangrado Qx: Suspender 24h antes.";
            }
            if (renalFunction === 'low') {
                instructions += " (OJO: Ajustar suspensión si TFG < 30).";
                daysPrior += 1; // Add safety margin
            }
        }

        const medToAdd = {
            ...med,
            daysPrior,
            action,
            instructions,
            alertLevel
        };

        const newMeds = [...selectedMeds, medToAdd];

        // Add Bridge Med Automatically if needed
        if (bridgeNeeded) {
            const bridgeMed: SelectedMed = {
                id: 'enoxa_bridge_' + Date.now(),
                name: 'Enoxaparina (Puente)',
                category: 'Anticoagulante',
                action: 'adjust', // Active intervention
                daysPrior: 4, // Starts when AVK stops
                instructions: 'PUENTEO: Enoxaparina 1mg/kg SC c/12h. Suspender última dosis 24h antes de cx.',
                alertLevel: 'red', // High alert
                route: 'SC',
                dose: 60, // Default dummy, user adjusts
                isAnticoagulant: true,
                anticoagType: 'DOAC' // Loose typing
            };
            newMeds.push(bridgeMed);
        }

        setValue('selectedMeds', newMeds);
        setShowAnticoagModal(null);
    };


    const removeMed = (id: string) => setValue('selectedMeds', selectedMeds.filter(m => m.id !== id));

    const changeRoute = (id: string, newRoute: string) => {
        const medIndex = selectedMeds.findIndex(m => m.id === id);
        if (medIndex === -1) return;
        const medToUpdate = selectedMeds[medIndex];

        // Perform Conversion Check Logic
        const convertedMed = handleRouteConversion(medToUpdate, newRoute);

        const updatedList = [...selectedMeds];
        updatedList[medIndex] = convertedMed;
        setValue('selectedMeds', updatedList);
    };

    const updateDose = (id: string, newDoseStr: string) => {
        const newDose = parseFloat(newDoseStr);
        const updated = selectedMeds.map(m => m.id === id ? { ...m, dose: isNaN(newDose) ? 0 : newDose } : m);
        setValue('selectedMeds', updated);

        // Trigger conversion check if IV is selected to update bioequivalence text live
        const med = updated.find(m => m.id === id);
        if (med && med.route === 'IV') changeRoute(id, 'IV');
    };

    return (
        <>

            {/* --- MODALS (Moved to Top) --- */}
            {/* DEBUG BANNER - TEMPORARY */}
            <div className="bg-red-600 text-white text-xs font-bold p-2 text-center animate-pulse">
                DEBUG MODE: Cargados {MEDICATIONS_DB.length} medicamentos.
                (Si ves &lt; 100, intenta recargar la página)
            </div>

            {/* 1. STEROID CONFIG MODAL */}
            {/* 1. STEROID CONFIG MODAL */}
            {showSteroidModal && (
                <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="bg-clinical-navy p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2"><Syringe size={18} /> Dosis de Estrés: {showSteroidModal.name}</h3>
                            <button onClick={() => setShowSteroidModal(null)}><X size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="bg-blue-50 p-3 rounded text-xs text-blue-900 border border-blue-100">
                                <Info size={14} className="inline mr-1 mb-0.5" />
                                Paciente con uso crónico de esteroides ({'>'}5mg Prednisona/día por {'>'}3 semanas) requiere cobertura para evitar insuficiencia suprarrenal aguda.
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Dosis Habitual (mg/día)</label>
                                <input
                                    type="number"
                                    autoFocus
                                    value={steroidDose || ''}
                                    onChange={(e) => setSteroidDose(parseFloat(e.target.value))}
                                    className="w-full mt-1 p-3 border rounded-lg text-lg font-bold text-center"
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Estrés Quirúrgico Estimado</label>
                                <div className="grid grid-cols-1 gap-2">
                                    <label className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 transition-all ${surgeryRisk === 'minor' ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'hover:bg-gray-50'}`}>
                                        <input type="radio" name="risk" checked={surgeryRisk === 'minor'} onChange={() => setSurgeryRisk('minor')} className="text-green-600" />
                                        <div>
                                            <span className="font-bold text-sm block">Menor / Local</span>
                                            <span className="text-[10px] text-gray-500">Hernia inguinal, colonoscopía</span>
                                        </div>
                                    </label>
                                    <label className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 transition-all ${surgeryRisk === 'moderate' ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500' : 'hover:bg-gray-50'}`}>
                                        <input type="radio" name="risk" checked={surgeryRisk === 'moderate'} onChange={() => setSurgeryRisk('moderate')} className="text-amber-600" />
                                        <div>
                                            <span className="font-bold text-sm block">Moderado</span>
                                            <span className="text-[10px] text-gray-500">Colecistectomía, Artroplastía, Histerectomía</span>
                                        </div>
                                    </label>
                                    <label className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 transition-all ${surgeryRisk === 'major' ? 'bg-red-50 border-red-500 ring-1 ring-red-500' : 'hover:bg-gray-50'}`}>
                                        <input type="radio" name="risk" checked={surgeryRisk === 'major'} onChange={() => setSurgeryRisk('major')} className="text-red-600" />
                                        <div>
                                            <span className="font-bold text-sm block">Mayor / Severo</span>
                                            <span className="text-[10px] text-gray-500">Cardiaca, Whipple, Esofagectomía</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t flex justify-end">
                            <button
                                onClick={handleSaveSteroidConfig}
                                disabled={!steroidDose}
                                className="bg-clinical-navy text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Calcular y Agregar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. ANTICOAGULANT CONFIG MODAL */}
            {showAnticoagModal && (
                <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="bg-red-600 p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2"><Activity size={18} /> Anticoagulación: {showAnticoagModal.name}</h3>
                            <button onClick={() => setShowAnticoagModal(null)}><X size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="bg-red-50 p-3 rounded text-xs text-red-900 border border-red-100">
                                <AlertTriangle size={14} className="inline mr-1 mb-0.5" />
                                Requiere estratificación de riesgo para decidir suspensión y necesidad de terapia puente.
                            </div>

                            {/* AVK Type Logic */}
                            {showAnticoagModal.anticoagType === 'AVK' && (
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Riesgo Trombótico del Paciente</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        <label className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 transition-all ${thromboticRisk === 'high' ? 'bg-red-50 border-red-500 ring-1 ring-red-500' : 'hover:bg-gray-50'}`}>
                                            <input type="radio" checked={thromboticRisk === 'high'} onChange={() => setThromboticRisk('high')} className="text-red-600" />
                                            <div>
                                                <span className="font-bold text-sm block flex items-center gap-1">Alto Riesgo <Activity size={12} /></span>
                                                <span className="text-[10px] text-gray-500">Válvula mecánica, FA CHADS{'>'}4, EVC reciente, TVP reciente.</span>
                                            </div>
                                        </label>
                                        <label className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 transition-all ${thromboticRisk === 'low' ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'hover:bg-gray-50'}`}>
                                            <input type="radio" checked={thromboticRisk === 'low'} onChange={() => setThromboticRisk('low')} className="text-green-600" />
                                            <div>
                                                <span className="font-bold text-sm block">Bajo / Moderado Riesgo</span>
                                                <span className="text-[10px] text-gray-500">FA CHADS 0-4 sin EVC previo, TVP remoto ({'>'}3m).</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* DOAC Logic */}
                            {showAnticoagModal.anticoagType === 'DOAC' && (
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Riesgo Sangrado de Cirugía</label>
                                    <div className="grid grid-cols-1 gap-2 mb-3">
                                        <label className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 transition-all ${bleedingRisk === 'high' ? 'bg-red-50 border-red-500 ring-1 ring-red-500' : 'hover:bg-gray-50'}`}>
                                            <input type="radio" checked={bleedingRisk === 'high'} onChange={() => setBleedingRisk('high')} className="text-red-600" />
                                            <div>
                                                <span className="font-bold text-sm block">Alto Riesgo Sangrado (o Neuroaxial)</span>
                                                <span className="text-[10px] text-gray-500">Neurocirugía, Raquia/Peri, Cx Mayor Oncológica.</span>
                                            </div>
                                        </label>
                                        <label className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 transition-all ${bleedingRisk === 'low' ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'hover:bg-gray-50'}`}>
                                            <input type="radio" checked={bleedingRisk === 'low'} onChange={() => setBleedingRisk('low')} className="text-green-600" />
                                            <div>
                                                <span className="font-bold text-sm block">Bajo Riesgo Sangrado</span>
                                                <span className="text-[10px] text-gray-500">Cx General Laparoscópica estándar, Hernias, Oftalmo.</span>
                                            </div>
                                        </label>
                                    </div>

                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Función Renal</label>
                                    <select
                                        value={renalFunction}
                                        onChange={(e) => setRenalFunction(e.target.value as any)}
                                        className="w-full p-2 border rounded bg-white text-sm"
                                    >
                                        <option value="normal">Normal (TFG {'>'} 30)</option>
                                        <option value="low">Comprometida (TFG {'<'} 30)</option>
                                    </select>
                                </div>
                            )}

                        </div>
                        <div className="p-4 bg-gray-50 border-t flex justify-end">
                            <button
                                onClick={handleSaveAnticoagConfig}
                                className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-red-700"
                            >
                                Confirmar Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {/* 3. JUSTIFICATION MODAL */}
            {showJustificationModal && (
                <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
                        <div className="bg-amber-500 p-4 text-white flex justify-between items-center rounded-t-xl">
                            <h3 className="font-bold flex items-center gap-2"><Siren size={20} /> Guía Clínica: {showJustificationModal.name}</h3>
                            <button onClick={() => setShowJustificationModal(null)}><X size={20} /></button>
                        </div>
                        <div className="p-6">
                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg mb-4">
                                <h4 className="font-bold text-amber-900 text-sm uppercase mb-2">Recomendación Basada en Evidencia</h4>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                    {showJustificationModal.instructions}
                                </p>
                            </div>

                            {showJustificationModal.conversionMessage && (
                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-4">
                                    <h4 className="font-bold text-blue-900 text-sm uppercase mb-2">Conversión / Bioequivalencia</h4>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {showJustificationModal.conversionMessage}
                                    </p>
                                </div>
                            )}

                            <div className="text-xs text-gray-400 mt-4 border-t pt-2">
                                Fuente: Guías ACC/AHA Perioperatorias 2014, Guías ESC 2022.
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50 border-t text-right rounded-b-xl">
                            <button onClick={() => setShowJustificationModal(null)} className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded hover:bg-gray-300">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2 px-1">
                    <Pill className="text-clinical-navy" size={20} />
                    <h2 className="text-lg font-bold text-slate-800">Conciliación de Fármacos</h2>
                </div>

                <div className="relative">
                    <div className="flex items-center bg-white border border-gray-300 rounded-lg p-3 shadow-sm focus-within:ring-2 focus-within:ring-clinical-navy">
                        <Search className="text-gray-400 mr-2" size={20} />
                        <input
                            type="text"
                            className="w-full outline-none text-sm"
                            placeholder={`Buscar entre ${MEDICATIONS_DB.length} fármacos...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {filteredMeds.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto animate-fadeIn">
                            {filteredMeds.map(med => (
                                <li key={med.id} onClick={() => handleAddMed(med)} className="p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer flex justify-between items-center group">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-700 group-hover:text-clinical-navy transition-colors">{med.name}</span>
                                        {searchTerm.length > 2 && med.category.toLowerCase().includes(searchTerm.toLowerCase()) && (
                                            <span className="text-[10px] text-blue-500 font-medium">Coincidencia en categoría</span>
                                        )}
                                    </div>
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase font-bold">{med.category}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {searchTerm.length > 1 && filteredMeds.length === 0 && (
                        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 p-4 text-center text-gray-400 text-sm animate-fadeIn">
                            <Activity className="mx-auto mb-2 opacity-20" size={24} />
                            No se encontraron fármacos con "{searchTerm}".
                        </div>
                    )}
                </div>

                <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                    {selectedMeds.length === 0 && <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm">No hay fármacos agregados.</div>}

                    {selectedMeds.map(med => (
                        <div key={med.id} className={`p-3 rounded-lg border-l-4 shadow-sm text-sm bg-white transition-all ${med.alertLevel === 'red' ? 'border-l-red-500' : med.alertLevel === 'yellow' ? 'border-l-amber-500' : 'border-l-green-500'} ${isUrgencia && med.daysPrior > 0 ? 'opacity-75' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-800 text-base">{med.name}</span>
                                        <button onClick={() => removeMed(med.id)} className="text-gray-300 hover:text-red-500"><X size={16} /></button>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex items-center gap-1 bg-gray-50 border rounded px-1">
                                            <input type="number" placeholder="Dosis" value={med.dose || ''} onChange={(e) => updateDose(med.id, e.target.value)} className="w-12 bg-transparent text-xs p-1 outline-none text-right font-bold" />
                                            <span className="text-[10px] text-gray-500 mr-1">mg</span>
                                        </div>
                                        <div className="flex items-center bg-gray-100 rounded px-2 py-0.5">
                                            {med.route === 'IV' || med.route === 'SC' ? <Syringe size={12} className="mr-1 text-slate-500" /> : <Tablets size={12} className="mr-1 text-slate-500" />}
                                            <select
                                                value={med.route}
                                                onChange={(e) => changeRoute(med.id, e.target.value)}
                                                className="bg-transparent text-[10px] font-bold text-slate-600 outline-none uppercase cursor-pointer"
                                                disabled={med.id === 'metil' || med.id === 'hidro'} // FORCE IV logic
                                            >
                                                <option value="VO">VO</option><option value="IV">IV</option><option value="SC">SC</option><option value="Inhalada">Inhal</option><option value="Topica">Top</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 mt-2 border-t pt-2 border-dashed border-gray-100">
                                {med.action === 'stop' && <Ban className="text-red-500 mt-0.5 shrink-0" size={14} />}
                                {med.action === 'adjust' && <RefreshCcw className="text-amber-500 mt-0.5 shrink-0" size={14} />}
                                {med.action === 'continue' && <CheckCircle className="text-green-500 mt-0.5 shrink-0" size={14} />}

                                <div className="w-full">
                                    {/* INTERACTIVE ACTION BADGE */}
                                    <div
                                        onClick={() => setShowJustificationModal(med)}
                                        className="flex justify-between items-center cursor-pointer group hover:bg-gray-50 p-1 rounded -ml-1"
                                    >
                                        <p className="font-bold text-xs uppercase mb-0.5 flex items-center gap-2" style={{ color: med.alertLevel === 'red' ? '#dc2626' : med.alertLevel === 'yellow' ? '#d97706' : '#16a34a' }}>
                                            {med.action === 'stop' ? `Suspender ${med.daysPrior > 0 ? `${med.daysPrior} días antes` : 'hoy'}` : med.action === 'adjust' ? 'Ajustar / Puente' : 'Continuar'}
                                            <span className="text-[9px] text-gray-400 bg-white border px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                                Ver Guía <ChevronRight size={10} />
                                            </span>
                                        </p>
                                        {med.conversionMessage && <span className="text-[9px] bg-blue-100 text-blue-800 px-1 rounded flex items-center gap-1"><ArrowRightLeft size={8} /> Bioeq.</span>}
                                    </div>

                                    <p className="text-xs text-slate-600 font-medium leading-tight">{med.instructions}</p>

                                    {/* EMPHASIZED CONVERSION MESSAGE */}
                                    {med.conversionMessage && (
                                        <div className="mt-2 p-2 bg-blue-50 text-xs text-blue-900 rounded border border-blue-200 font-bold flex items-center gap-2 animate-pulse-slow">
                                            <ArrowRightLeft size={16} />
                                            {med.conversionMessage}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default MedicationReconciliation;